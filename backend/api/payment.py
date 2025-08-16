from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import stripe
import os
from datetime import datetime, timedelta
import logging

payment_bp = Blueprint('payment', __name__, url_prefix='/api')

# ログ設定
logger = logging.getLogger(__name__)

# Stripe APIキーの設定（環境変数から取得）
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# 本番環境チェック
IS_PRODUCTION = os.getenv('ENVIRONMENT', 'development') == 'production'

# 価格IDの設定（本番環境では固定IDを使用）
MONTHLY_PRICE_ID = os.getenv('STRIPE_MONTHLY_PRICE_ID')  # 本番では固定
YEARLY_PRICE_ID = os.getenv('STRIPE_YEARLY_PRICE_ID')    # 本番では固定

def get_or_create_price(plan_type='monthly'):
    """価格オブジェクトを取得または作成"""
    try:
        # 本番環境では事前作成された価格IDを使用
        if IS_PRODUCTION:
            if plan_type == 'monthly' and MONTHLY_PRICE_ID:
                return stripe.Price.retrieve(MONTHLY_PRICE_ID)
            elif plan_type == 'yearly' and YEARLY_PRICE_ID:
                return stripe.Price.retrieve(YEARLY_PRICE_ID)
        
        # 開発環境または価格IDが設定されていない場合は動的作成
        if plan_type == 'monthly':
            price = stripe.Price.create(
                unit_amount=500,
                currency='jpy',
                recurring={"interval": "month"},
                product_data={"name": "僕らのヴィンテージ 月額プラン"}
            )
        else:
            price = stripe.Price.create(
                unit_amount=5500,
                currency='jpy',
                recurring={"interval": "year"},
                product_data={"name": "僕らのヴィンテージ 年額プラン"}
            )
        return price
        
    except Exception as e:
        logger.error(f"Price creation/retrieval error: {str(e)}")
        raise

@payment_bp.route('/create-payment-intent', methods=['POST'])
def create_payment():
    """支払いインテント作成エンドポイント"""
    data = request.get_json()
    amount = data.get("amount")
    plan_status = data.get("status")  # 0: 月額プラン, 1: 年額プラン
    
    # バリデーション
    if plan_status not in [0, 1]:
        return jsonify({
            "error": "無効なプランステータスです",
            "result": False
        }), 400
    
    try:
        # Stripe Customer を作成
        customer = stripe.Customer.create(
            metadata={
                "plan_type": "monthly" if plan_status == 0 else "yearly",
                "created_at": datetime.now().isoformat()
            }
        )
        
        if plan_status == 0:  # 月額プラン（500円、初月無料）
            price = get_or_create_price('monthly')
            
            # サブスクリプションを作成（30日間の無料トライアル付き）
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": price.id}],
                trial_period_days=30,  # 30日間の無料トライアル
                payment_behavior="default_incomplete",
                payment_settings={
                    "save_default_payment_method": "on_subscription"
                },
                expand=["latest_invoice.payment_intent", "pending_setup_intent"],
                metadata={
                    "plan_type": "monthly"
                }
            )
            
            # SetupIntentを取得
            setup_intent = subscription.pending_setup_intent
            
            if not setup_intent:
                raise Exception("SetupIntentの作成に失敗しました")
            
            return jsonify({
                'type': 'setup',
                'clientSecret': setup_intent.client_secret,
                'stripeCustomerId': customer.id,
                'subscriptionId': subscription.id,
                'plan': 'monthly',
                'trialEnd': (datetime.now() + timedelta(days=30)).isoformat(),
                'nextBillingDate': (datetime.now() + timedelta(days=30)).isoformat(),
                'nextBillingAmount': 500
            })
            
        else:  # 年額プラン（5500円、即時決済）
            price = get_or_create_price('yearly')
            
            # サブスクリプションを作成（即時課金）
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": price.id}],
                payment_behavior="default_incomplete",
                payment_settings={
                    "save_default_payment_method": "on_subscription"
                },
                expand=["latest_invoice.payment_intent"],
                metadata={
                    "plan_type": "yearly"
                }
            )
            
            # Payment Intentを取得
            if not subscription.latest_invoice or not subscription.latest_invoice.payment_intent:
                raise Exception("PaymentIntentの作成に失敗しました")
                
            payment_intent = subscription.latest_invoice.payment_intent
            
            return jsonify({
                'type': 'payment',
                'clientSecret': payment_intent.client_secret,
                'intentId': payment_intent.id,
                'stripeCustomerId': customer.id,
                'subscriptionId': subscription.id,
                'plan': 'yearly',
                'nextBillingDate': (datetime.now() + timedelta(days=365)).isoformat(),
                'amount': 5500
            })
            
    except stripe.error.CardError as e:
        logger.error(f"Card error: {str(e)}")
        return jsonify({
            "error": "カードエラーが発生しました。別のカードをお試しください。",
            "result": False
        }), 400
        
    except stripe.error.RateLimitError as e:
        logger.error(f"Rate limit error: {str(e)}")
        return jsonify({
            "error": "一時的にサービスが混雑しています。しばらくしてからお試しください。",
            "result": False
        }), 429
        
    except stripe.error.InvalidRequestError as e:
        logger.error(f"Invalid request error: {str(e)}")
        return jsonify({
            "error": "リクエストに問題があります。",
            "result": False
        }), 400
        
    except stripe.error.AuthenticationError as e:
        logger.error(f"Authentication error: {str(e)}")
        return jsonify({
            "error": "認証エラーが発生しました。",
            "result": False
        }), 401
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return jsonify({
            "error": "決済処理中にエラーが発生しました。",
            "result": False
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            "error": "予期しないエラーが発生しました。",
            "result": False
        }), 500


@payment_bp.route('/cancel-subscription', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """サブスクリプションキャンセルエンドポイント"""
    user_id = get_jwt_identity()
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # ユーザーのStripe Customer IDを取得
        cursor.execute("""
            SELECT stripe_customer_id 
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user or not user['stripe_customer_id']:
            return jsonify({
                "error": "顧客情報が見つかりません",
                "result": False
            }), 404
        
        # アクティブなサブスクリプションを取得
        subscriptions = stripe.Subscription.list(
            customer=user['stripe_customer_id'],
            status='active',
            limit=1
        )
        
        if not subscriptions.data:
            # トライアル中のサブスクリプションも確認
            subscriptions = stripe.Subscription.list(
                customer=user['stripe_customer_id'],
                status='trialing',
                limit=1
            )
            
        if not subscriptions.data:
            return jsonify({
                "error": "アクティブなサブスクリプションが見つかりません",
                "result": False
            }), 404
        
        # サブスクリプションを期間終了時にキャンセル
        subscription = subscriptions.data[0]
        updated_subscription = stripe.Subscription.modify(
            subscription.id,
            cancel_at_period_end=True
        )
        
        # DBのステータスを更新
        cursor.execute("""
            UPDATE users 
            SET updated_at = NOW()
            WHERE user_id = %s
        """, (user_id,))
        connection.commit()
        
        return jsonify({
            "result": True,
            "message": "サブスクリプションは期間終了時にキャンセルされます",
            "cancel_at": updated_subscription.current_period_end
        })
        
    except Exception as e:
        logger.error(f"Subscription cancellation error: {str(e)}")
        return jsonify({
            "error": "サブスクリプションのキャンセル中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


@payment_bp.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """Stripeからのwebhookを処理"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    if not endpoint_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET not configured")
        return jsonify({"status": "webhook secret not configured"}), 200
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        return jsonify({"error": "Invalid signature"}), 400
    
    # イベントタイプに応じて処理
    event_handlers = {
        'customer.subscription.created': handle_subscription_created,
        'customer.subscription.updated': handle_subscription_updated,
        'customer.subscription.deleted': handle_subscription_deleted,
        'invoice.payment_succeeded': handle_payment_succeeded,
        'invoice.payment_failed': handle_payment_failed,
        'customer.subscription.trial_will_end': handle_trial_ending
    }
    
    handler = event_handlers.get(event['type'])
    if handler:
        try:
            handler(event['data']['object'])
        except Exception as e:
            logger.error(f"Webhook handler error for {event['type']}: {str(e)}")
    
    return jsonify({"status": "success"}), 200


def handle_subscription_created(subscription):
    """サブスクリプション作成時の処理"""
    logger.info(f"Subscription created: {subscription['id']} for customer: {subscription['customer']}")


def handle_subscription_updated(subscription):
    """サブスクリプション更新時の処理"""
    logger.info(f"Subscription updated: {subscription['id']}")
    
    # キャンセル予定の場合の処理
    if subscription.get('cancel_at_period_end'):
        logger.info(f"Subscription {subscription['id']} scheduled for cancellation")


def handle_subscription_deleted(subscription):
    """サブスクリプション削除時の処理"""
    logger.info(f"Subscription deleted: {subscription['id']}")
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # ユーザーのステータスを更新
        cursor.execute("""
            UPDATE users 
            SET status = 0, updated_at = NOW()
            WHERE stripe_customer_id = %s
        """, (subscription['customer'],))
        
        connection.commit()
    except Exception as e:
        logger.error(f"Failed to update user status: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


def handle_payment_succeeded(invoice):
    """支払い成功時の処理"""
    logger.info(f"Payment succeeded for invoice: {invoice['id']}")
    
    # 支払い履歴をログに記録（必要に応じてDBに保存）
    logger.info(f"Payment of {invoice['amount_paid']} JPY succeeded for customer {invoice['customer']}")


def handle_payment_failed(invoice):
    """支払い失敗時の処理"""
    logger.error(f"Payment failed for invoice: {invoice['id']}")
    
    # 必要に応じてユーザーに通知
    # ここでメール通知などを実装


def handle_trial_ending(subscription):
    """トライアル終了前の処理（3日前に通知）"""
    logger.info(f"Trial ending soon for subscription: {subscription['id']}")
    
    # ユーザーにトライアル終了の通知を送信
    # ここでメール通知などを実装


@payment_bp.route('/subscription-info', methods=['GET'])
@jwt_required()
def get_subscription_info():
    """ユーザーのサブスクリプション情報を取得"""
    user_id = get_jwt_identity()
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT stripe_customer_id, plan, status
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if not user or not user['stripe_customer_id']:
            return jsonify({
                "has_subscription": False,
                "status": "no_subscription"
            })
        
        # Stripeから最新の情報を取得
        subscriptions = stripe.Subscription.list(
            customer=user['stripe_customer_id'],
            status='all',
            limit=1
        )
        
        if not subscriptions.data:
            return jsonify({
                "has_subscription": False,
                "status": "no_subscription"
            })
        
        subscription = subscriptions.data[0]
        
        # プランタイプを判定
        plan_type = 'unknown'
        if subscription.items and subscription.items.data:
            price = subscription.items.data[0].price
            if price.recurring:
                if price.recurring.interval == 'month':
                    plan_type = 'monthly'
                elif price.recurring.interval == 'year':
                    plan_type = 'yearly'
        
        response_data = {
            "has_subscription": True,
            "status": subscription['status'],
            "plan_type": plan_type,
            "current_period_end": subscription['current_period_end'],
            "cancel_at_period_end": subscription['cancel_at_period_end']
        }
        
        # トライアル情報を追加
        if subscription['status'] == 'trialing' and subscription.get('trial_end'):
            response_data['trial_end'] = subscription['trial_end']
            response_data['days_until_trial_end'] = max(0, (subscription['trial_end'] - datetime.now().timestamp()) // 86400)
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error getting subscription info: {str(e)}")
        return jsonify({
            "error": "サブスクリプション情報の取得に失敗しました",
            "result": False
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()