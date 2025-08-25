from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
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
    
     # 文字列の場合は整数に変換
    try:
        plan_status = int(plan_status) if plan_status is not None else None
    except (ValueError, TypeError):
        return jsonify({
            "error": "無効なプランステータスです",
            "result": False
        }), 400
    
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
def cancel_subscription():
    """サブスクリプションキャンセルエンドポイント"""
    data = request.get_json()
    user_id = data.get("user_id")
    
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
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        
    return jsonify({
            "error": "サブスクリプションのキャンセル中にエラーが発生しました",
            "has_subscription": False,
            "status": "error"
        }), 500

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


def handle_payment_succeedeßd(invoice):
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


@payment_bp.route('/subscription-info', methods=['POST'])
def get_subscription_info():
    """ユーザーのサブスクリプション情報を取得"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        
        # print(f"[DEBUG] Received user_id: {user_id}", flush=True)
        
        # user_idの検証
        if not user_id:
            return jsonify({
                "error": "ユーザーIDが指定されていません",
                "has_subscription": False,
                "status": "error"
            }), 400
        
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # print("[DEBUG] DB connection successful", flush=True)
            
            cursor.execute("""
                SELECT stripe_customer_id, plan, status
                FROM users 
                WHERE user_id = %s
            """, (user_id,))
            
            user = cursor.fetchone()
            
            # print(f"[DEBUG] User data: {user}", flush=True)
            
            if not user:
                return jsonify({
                    "error": "ユーザーが見つかりません",
                    "has_subscription": False,
                    "status": "no_user"
                }), 404
            
            if not user.get('stripe_customer_id'):
                # print("[DEBUG] No stripe_customer_id found", flush=True)
                return jsonify({
                    "has_subscription": False,
                    "status": "no_subscription"
                })
            
            # print(f"[DEBUG] Fetching Stripe subscriptions for customer: {user['stripe_customer_id']}", flush=True)
            
            # Stripeから最新の情報を取得
            subscriptions = stripe.Subscription.list(
                customer=user['stripe_customer_id'],
                status='all',
                limit=1
            )
            
            # print(f"[DEBUG] Found {len(subscriptions.data)} subscriptions", flush=True)
            
            if not subscriptions.data:
                return jsonify({
                    "has_subscription": False,
                    "status": "no_subscription"
                })
            
            subscription = subscriptions.data[0]
            
            # プランタイプを判定
            plan_type = 'unknown'
            if 'items' in subscription and subscription['items'].get('data'):
                items_data = subscription['items']['data']
                if items_data and len(items_data) > 0:
                    price = items_data[0].get('price', {})
                    if price.get('recurring'):
                        interval = price['recurring'].get('interval')
                        if interval == 'month':
                            plan_type = 'monthly'
                        elif interval == 'year':
                            plan_type = 'yearly'
            
            if plan_type == 'unknown' and subscription.get('metadata'):
                plan_type = subscription['metadata'].get('plan_type', 'unknown')
            
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
            
            # print(f"[DEBUG] Returning response: {response_data}", flush=True)
            
            return jsonify(response_data)
            
    except Exception as e:
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": "サブスクリプション情報の取得に失敗しました",
            "has_subscription": False,
            "status": "error"
        }), 500

# 決済情報取得
@payment_bp.route('/payment-methods', methods=['POST'])
def get_payment_methods():
    """ユーザーの支払い方法一覧を取得"""
    user_id = request.json.get('user_id', None)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # ユーザーのStripe Customer IDを取得
            cursor.execute("""
                SELECT stripe_customer_id, email
                FROM users 
                WHERE user_id = %s
            """, (user_id,))

            user = cursor.fetchone()

            if not user or not user['stripe_customer_id']:
                return jsonify({
                    "payment_methods": [],
                    "default_payment_method": None
                })

            # Stripeから支払い方法を取得
            payment_methods = stripe.PaymentMethod.list(
                customer=user['stripe_customer_id'],
                type='card'
            )

            # デフォルトの支払い方法を取得
            customer = stripe.Customer.retrieve(user['stripe_customer_id'])
            default_payment_method_id = customer.invoice_settings.default_payment_method

            # 支払い方法の情報を整形
            methods = []
            for pm in payment_methods.data:
                method_data = {
                    "id": pm.id,
                    "brand": pm.card.brand,
                    "last4": pm.card.last4,
                    "exp_month": pm.card.exp_month,
                    "exp_year": pm.card.exp_year,
                    "is_default": pm.id == default_payment_method_id,
                    "created": pm.created
                }
                methods.append(method_data)

            # 作成日時で降順ソート（新しいものが上）
            methods.sort(key=lambda x: x['created'], reverse=True)

            return jsonify({
                "payment_methods": methods,
                "default_payment_method": default_payment_method_id
            })

    except Exception as e:
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()

        return jsonify({
            "error": "決済情報取得に失敗しました。",
            "has_subscription": False,
            "status": "error"
        }), 500

@payment_bp.route('/create-setup-intent', methods=['POST'])
def create_setup_intent():
    """新しい支払い方法を追加するためのSetupIntentを作成"""
    user_id = request.json.get('user_id', None)
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
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
            
            # SetupIntentを作成
            setup_intent = stripe.SetupIntent.create(
                customer=user['stripe_customer_id'],
                payment_method_types=['card'],
                usage='off_session',  # 将来の決済で使用
                metadata={
                    'user_id': str(user_id),
                    'action': 'add_payment_method'
                }
            )
            
            return jsonify({
                'clientSecret': setup_intent.client_secret,
                'setupIntentId': setup_intent.id
            })
            
    except Exception as e:
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        
    return jsonify({
            "error": "決済情報取得に失敗しました。",
            "has_subscription": False,
            "status": "error"
        }), 500

#　選択したクレジットカードの削除
@payment_bp.route('/delete-payment-method', methods=['POST'])
def delete_payment_method():
    """支払い方法を削除"""
    data = request.get_json()
    user_id = data.get('user_id')
    payment_method_id = data.get('payment_method_id')
    
    if not payment_method_id:
        return jsonify({
            "error": "支払い方法IDが指定されていません",
            "result": False
        }), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
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
            
            # 支払い方法を取得して、削除可能か確認
            payment_methods = stripe.PaymentMethod.list(
                customer=user['stripe_customer_id'],
                type='card'
            )
            
            if len(payment_methods.data) <= 1:
                return jsonify({
                    "error": "最後の支払い方法は削除できません",
                    "result": False
                }), 400
            
            # 支払い方法をデタッチ（削除）
            stripe.PaymentMethod.detach(payment_method_id)
            
            return jsonify({
                "result": True,
                "message": "支払い方法を削除しました"
            })
            
    except Exception as e:
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        
    return jsonify({
            "error": "支払い方法削除に失敗しました。",
            "has_subscription": False,
            "status": "error"
        }), 500

# 再登録時のチェック関数
@payment_bp.route('/check-reactivation-status', methods=['POST'])
def check_and_reactivate_customer():
    """退会済みユーザーの再アクティベーション状態をチェック"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        
        # ユーザー情報取得
        cursor.execute("""
            SELECT stripe_customer_id, is_deleted
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        
        if user and user.get('stripe_customer_id'):
            try:
                # Stripeで顧客情報を確認
                customer = stripe.Customer.retrieve(user['stripe_customer_id'])
                
                # 支払い方法の確認
                payment_methods = stripe.PaymentMethod.list(
                    customer=user['stripe_customer_id'],
                    type='card'
                )
                
                return {
                    "customer_exists": True,
                    "customer_id": user['stripe_customer_id'],
                    "has_payment_methods": len(payment_methods.data) > 0,
                    "payment_methods": payment_methods.data
                }
            except:
                pass
        
        return {
            "customer_exists": False,
            "customer_id": None,
            "has_payment_methods": False
        }
        
# クレジットカードの支払いカードのデフォルト設定
@payment_bp.route('/set-default-payment-method', methods=['POST'])
def set_default_payment_method():
    """デフォルトの支払い方法を設定"""
    data = request.get_json()
    user_id = data.get('user_id')
    payment_method_id = data.get('payment_method_id')
    
    if not payment_method_id:
        return jsonify({
            "error": "支払い方法IDが指定されていません",
            "result": False
        }), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT stripe_customer_id
                FROM users 
                WHERE user_id = %s AND is_deleted = FALSE
            """, (user_id,))
            
            user = cursor.fetchone()
            
            if not user or not user['stripe_customer_id']:
                return jsonify({
                    "error": "顧客情報が見つかりません",
                    "result": False
                }), 404
            
            # Stripeのデフォルト支払い方法を更新
            stripe.Customer.modify(
                user['stripe_customer_id'],
                invoice_settings={
                    'default_payment_method': payment_method_id
                }
            )
            
            # アクティブなサブスクリプションのデフォルト支払い方法も更新
            subscriptions = stripe.Subscription.list(
                customer=user['stripe_customer_id'],
                status='all',
                limit=10
            )
            
            for subscription in subscriptions.data:
                if subscription['status'] in ['active', 'trialing']:
                    stripe.Subscription.modify(
                        subscription['id'],
                        default_payment_method=payment_method_id
                    )
            
            return jsonify({
                "result": True,
                "message": "デフォルトの支払い方法を更新しました"
            })
            
    except Exception as e:
        logger.error(f"Default payment method update error: {str(e)}")
        return jsonify({
            "error": "デフォルト支払い方法の更新に失敗しました",
            "result": False
        }), 500

# マイページからクレジット登録
@payment_bp.route('/pymage-create-payment-intent', methods=['POST'])
def pymage_create_payment_intent():
    user_id = request.json.get('user_id', None)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT plan
                FROM users 
                WHERE user_id = 
            """, (user_id,))

            plan_status = cursor.fetchone()

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

    except Exception as e:
        print(f"[ERROR] Exception occurred: {type(e).__name__}: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()

    return jsonify({
            "error": "支払い方法削除に失敗しました。",
            "has_subscription": False,
            "status": "error"
        }), 500

#退会済みユーザーの再アクティベーション用の支払いインテント作成
@payment_bp.route('/reactivation-payment-intent', methods=['POST'])
def create_reactivation_payment_intent():
    """退会済みユーザーの再アクティベーション用の支払いインテント作成"""
    data = request.get_json()
    user_id = data.get("user_id")
    plan_type = data.get("plan_type", 0)  # 0: 月額, 1: 年額
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # ユーザー情報とstripe_customer_idを取得
            cursor.execute("""
                SELECT user_id, stripe_customer_id, email, name, is_deleted
                FROM users 
                WHERE user_id = %s
            """, (user_id,))
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({
                    "error": "ユーザーが見つかりません",
                    "result": False
                }), 404
            
            if not user.get('is_deleted'):
                return jsonify({
                    "error": "このユーザーは退会していません",
                    "result": False
                }), 400
            
            # Stripe Customerの確認・作成
            if user.get('stripe_customer_id'):
                try:
                    customer = stripe.Customer.retrieve(user['stripe_customer_id'])
                    if customer.get('deleted'):
                        # 削除済みの場合は新規作成
                        raise stripe.error.InvalidRequestError("Customer deleted")
                except:
                    # 新規Customer作成
                    customer = stripe.Customer.create(
                        email=user['email'],
                        metadata={
                            "user_id": str(user_id),
                            "reactivated": "true"
                        }
                    )
                    # DBを更新
                    cursor.execute("""
                        UPDATE users 
                        SET stripe_customer_id = %s
                        WHERE user_id = %s
                    """, (customer.id, user_id))
                    conn.commit()
            else:
                # 新規Customer作成
                customer = stripe.Customer.create(
                    email=user['email'],
                    metadata={
                        "user_id": str(user_id),
                        "reactivated": "true"
                    }
                )
                cursor.execute("""
                    UPDATE users 
                    SET stripe_customer_id = %s
                    WHERE user_id = %s
                """, (customer.id, user_id))
                conn.commit()
            
            # SetupIntentを作成（支払い方法の登録のみ）
            setup_intent = stripe.SetupIntent.create(
                customer=customer.id,
                payment_method_types=['card'],
                usage='off_session',
                metadata={
                    'user_id': str(user_id),
                    'action': 'reactivation',
                    'plan_type': 'monthly' if plan_type == 0 else 'yearly'
                }
            )
            
            return jsonify({
                'type': 'setup',
                'clientSecret': setup_intent.client_secret,
                'stripeCustomerId': customer.id,
                'setupIntentId': setup_intent.id,
                'plan': 'monthly' if plan_type == 0 else 'yearly'
            })
            
    except Exception as e:
        logger.error(f"Reactivation payment intent error: {str(e)}")
        return jsonify({
            "error": "支払い設定の作成に失敗しました",
            "result": False
        }), 500

#退会済みユーザーのアカウント再開処理
@payment_bp.route('/reactivate-account', methods=['POST'])
def reactivate_account():
    """退会済みユーザーのアカウント再開処理"""
    data = request.get_json()
    user_id = data.get("user_id")
    payment_method_id = data.get("payment_method_id")
    plan_type = data.get("plan_type", 0)  # 0: 月額, 1: 年額
    
    # バリデーション
    if not user_id or not payment_method_id:
        return jsonify({
            "error": "必要なパラメータが不足しています",
            "result": False
        }), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # ユーザー情報を取得
            cursor.execute("""
                SELECT user_id, stripe_customer_id, email, name, is_deleted, status
                FROM users 
                WHERE user_id = %s
            """, (user_id,))
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({
                    "error": "ユーザーが見つかりません",
                    "result": False
                }), 404
            
            if not user.get('is_deleted'):
                return jsonify({
                    "error": "このユーザーは退会していません",
                    "result": False
                }), 400
            
            if not user.get('stripe_customer_id'):
                return jsonify({
                    "error": "Stripe顧客IDが見つかりません",
                    "result": False
                }), 400
            
            try:
                # 支払い方法をCustomerに紐付け
                stripe.PaymentMethod.attach(
                    payment_method_id,
                    customer=user['stripe_customer_id']
                )
                
                # デフォルトの支払い方法として設定
                stripe.Customer.modify(
                    user['stripe_customer_id'],
                    invoice_settings={
                        'default_payment_method': payment_method_id
                    }
                )
                
                # 価格オブジェクトを取得
                if plan_type == 0:  # 月額プラン（即時課金）
                    price = get_or_create_price('monthly')
                    
                    # サブスクリプションを作成（即時課金）
                    subscription = stripe.Subscription.create(
                        customer=user['stripe_customer_id'],
                        items=[{"price": price.id}],
                        default_payment_method=payment_method_id,
                        metadata={
                            "plan_type": "monthly",
                            "reactivated": "true",
                            "user_id": str(user_id)
                        }
                    )
                    
                    subscription_id = subscription.id
                    
                    # 最初のインボイスを確認
                    if subscription.latest_invoice:
                        invoice = stripe.Invoice.retrieve(subscription.latest_invoice)
                        if invoice.status != 'paid':
                            # 支払いを実行
                            stripe.Invoice.pay(invoice.id)
                    
                    next_billing_date = datetime.fromtimestamp(
                        subscription.current_period_end
                    ).isoformat()
                    
                else:  # 年額プラン（即時課金）
                    price = get_or_create_price('yearly')
                    
                    # サブスクリプションを作成（即時課金）
                    subscription = stripe.Subscription.create(
                        customer=user['stripe_customer_id'],
                        items=[{"price": price.id}],
                        default_payment_method=payment_method_id,
                        metadata={
                            "plan_type": "yearly",
                            "reactivated": "true",
                            "user_id": str(user_id)
                        }
                    )
                    
                    subscription_id = subscription.id
                    
                    # 最初のインボイスを確認
                    if subscription.latest_invoice:
                        invoice = stripe.Invoice.retrieve(subscription.latest_invoice)
                        if invoice.status != 'paid':
                            # 支払いを実行
                            stripe.Invoice.pay(invoice.id)
                    
                    next_billing_date = datetime.fromtimestamp(
                        subscription.current_period_end
                    ).isoformat()
                
                # データベースを更新
                cursor.execute("""
                    UPDATE users 
                    SET is_deleted = FALSE,
                        deleted_at = NULL,
                        status = 1,
                        plan = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """, (plan_type, user_id))
                
                # アカウント再開ログを記録（オプション）
                try:
                    cursor.execute("""
                        INSERT INTO account_reactivation_logs (
                            user_id,
                            plan_type,
                            subscription_id,
                            payment_method_id,
                            created_at
                        ) VALUES (%s, %s, %s, %s, NOW())
                    """, (user_id, plan_type, subscription_id, payment_method_id))
                except:
                    # ログテーブルがない場合でも処理は続行
                    pass
                
                conn.commit()
                
                logger.info(f"Account reactivated successfully for user {user_id}")
                
                return jsonify({
                    "result": True,
                    "message": "アカウントを再開しました",
                    "subscription_id": subscription_id,
                    "plan_type": "monthly" if plan_type == 0 else "yearly",
                    "next_billing_date": next_billing_date,
                    "amount": 500 if plan_type == 0 else 5500
                })
                
            except stripe.error.CardError as e:
                logger.error(f"Card error during reactivation: {str(e)}")
                return jsonify({
                    "error": "カードの承認に失敗しました。別のカードをお試しください。",
                    "result": False
                }), 400
                
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error during reactivation: {str(e)}")
                return jsonify({
                    "error": "決済処理中にエラーが発生しました",
                    "result": False
                }), 500
                
    except Exception as e:
        logger.error(f"Reactivation error for user {user_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": "アカウント再開中にエラーが発生しました",
            "result": False
        }), 500

# 退会処理
@payment_bp.route('/withdraw', methods=['POST'])
def withdraw_user():

    """ユーザー退会処理エンドポイント
    
    論理削除とサブスクリプションキャンセルを同時に実行
    """
    data = request.get_json()
    user_id = data.get("user_id")
    
    # user_idの検証
    if not user_id:
        return jsonify({
            "error": "ユーザーIDが指定されていません",
            "result": False
        }), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # トランザクション開始
            conn.start_transaction()

            try:
                # ユーザー情報を取得
                cursor.execute("""
                    SELECT user_id, stripe_customer_id, email, name, is_deleted
                    FROM users 
                    WHERE user_id = %s
                    FOR UPDATE
                """, (user_id,))

                user = cursor.fetchone()

                if not user:
                    conn.rollback()
                    return jsonify({
                        "error": "ユーザーが見つかりません",
                        "result": False
                    }), 404

                if user.get('is_deleted'):
                    conn.rollback()
                    return jsonify({
                        "error": "既に退会済みのユーザーです",
                        "result": False
                    }), 400

                # 取引中のアイテムがあるかチェック
                cursor.execute("""
                    SELECT i.item_id, i.title, t.status as trade_status
                    FROM items i
                    LEFT JOIN trades t ON i.item_id = t.item_id
                    WHERE i.user_id = %s 
                    AND i.status = 'trading'
                    LIMIT 5
                """, (user_id,))

                trading_items = cursor.fetchall()
                if trading_items:
                    conn.rollback()
                    item_titles = [item['title'][:20] + '...' if len(item['title']) > 20 else item['title'] 
                                  for item in trading_items[:3]]
                    return jsonify({
                        "error": "取引中のアイテムがあります。すべての取引を完了してから退会してください。",
                        "result": False,
                        "trading_items_count": len(trading_items),
                        "trading_items_sample": item_titles,
                        "message": "取引完了後に再度退会手続きを行ってください。"
                    }), 400

                # 進行中の取引があるかチェック（自分が売り手または買い手）
                cursor.execute("""
                    SELECT t.trade_id, t.status, i.title,
                           CASE 
                               WHEN t.seller_id = %s THEN 'seller'
                               ELSE 'buyer'
                           END as user_role
                    FROM trades t
                    JOIN items i ON t.item_id = i.item_id
                    WHERE (t.seller_id = %s OR t.buyer_id = %s)
                    AND t.status IN ('pending', 'purchased', 'shipped')
                    LIMIT 5
                """, (user_id, user_id, user_id))

                active_trades = cursor.fetchall()
                if active_trades:
                    conn.rollback()
                    trade_info = []
                    for trade in active_trades[:3]:
                        status_ja = {
                            'pending': '申請中',
                            'purchased': '決済済み',
                            'shipped': '発送済み'
                        }.get(trade['status'], trade['status'])
                        trade_info.append({
                            'title': trade['title'][:20] + '...' if len(trade['title']) > 20 else trade['title'],
                            'status': status_ja,
                            'role': '出品者' if trade['user_role'] == 'seller' else '購入者'
                        })

                    return jsonify({
                        "error": "進行中の取引があります。すべての取引を完了またはキャンセルしてから退会してください。",
                        "result": False,
                        "active_trades_count": len(active_trades),
                        "active_trades_sample": trade_info,
                        "message": "取引を完了させるか、取引相手と相談の上キャンセルしてから退会手続きを行ってください。"
                    }), 400

                # Stripeサブスクリプションのキャンセル処理
                cancelled_subscriptions = []
                stripe_errors = []

                if user.get('stripe_customer_id'):
                    try:
                        # アクティブなサブスクリプションを取得
                        subscriptions = stripe.Subscription.list(
                            customer=user['stripe_customer_id'],
                            status='all',
                            limit=100
                        )

                        # すべてのアクティブなサブスクリプションを即座にキャンセル
                        for subscription in subscriptions.data:
                            if subscription['status'] in ['active', 'trialing', 'past_due']:
                                try:
                                    stripe.Subscription.delete(subscription['id'])
                                    cancelled_subscriptions.append(subscription['id'])
                                    logger.info(f"Subscription {subscription['id']} cancelled for user {user_id}")
                                except stripe.error.StripeError as e:
                                    stripe_errors.append({
                                        "subscription_id": subscription['id'],
                                        "error": str(e)
                                    })
                                    logger.error(f"Failed to cancel subscription {subscription['id']}: {str(e)}")

                    except stripe.error.StripeError as e:
                        logger.error(f"Stripe cancellation error for user {user_id}: {str(e)}")
                        stripe_errors.append({
                            "error": f"サブスクリプション一覧取得エラー: {str(e)}"
                        })

                # 現在の日時を取得
                current_time = datetime.now()

                # 1. ユーザーを論理削除
                cursor.execute("""
                    UPDATE users 
                    SET is_deleted = TRUE,
                        deleted_at = %s,
                        updated_at = %s,
                        status = 0,
                        token = NULL
                    WHERE user_id = %s
                """, (current_time, current_time, user_id))

                # 2. 出品中・削除済み・交換済みのアイテムを物理削除
                # （取引中のアイテムは事前チェックで除外済み）
                cursor.execute("""
                    DELETE FROM items 
                    WHERE user_id = %s 
                    AND status IN ('available', 'deleted', 'exchanged')
                """, (user_id,))

                deleted_items = cursor.rowcount

                # 3. アイテム画像を物理削除（アーカイブ済みの画像は保存されている）
                cursor.execute("""
                    DELETE ii FROM item_images ii
                    INNER JOIN items i ON ii.item_id = i.item_id
                    WHERE i.user_id = %s
                """, (user_id,))

                # 4. プロフィール画像を物理削除
                cursor.execute("""
                    DELETE FROM profile_images 
                    WHERE user_id = %s
                """, (user_id,))

                # 5. タグを物理削除
                cursor.execute("""
                    DELETE FROM tags 
                    WHERE user_id = %s
                """, (user_id,))

                # 6. フォロー関係を物理削除
                cursor.execute("""
                    DELETE FROM follows 
                    WHERE follower_id = %s OR followed_id = %s
                """, (user_id, user_id))

                # 7. いいねを物理削除
                cursor.execute("""
                    DELETE FROM likes 
                    WHERE user_id = %s
                """, (user_id,))

                # 10. 退会ログを記録
                try:
                    import json
                    cursor.execute("""
                        INSERT INTO withdrawal_logs (
                            user_id, 
                            email, 
                            name, 
                            stripe_customer_id,
                            withdrawal_reason,
                            created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        user_id, 
                        user['email'], 
                        user['name'], 
                        user.get('stripe_customer_id'),
                        data.get('reason', 'ユーザーによる退会'),
                        current_time
                    ))
                except Exception as log_error:
                    # ログテーブルがない場合でも退会処理は続行
                    logger.warning(f"Failed to insert withdrawal log: {str(log_error)}")
                
                # トランザクションをコミット
                conn.commit()
                
                logger.info(f"User {user_id} successfully withdrawn. Deleted items: {deleted_items}")
                
                response_data = {
                    "result": True,
                    "message": "退会処理が完了しました",
                    "details": {
                        "deleted_items": deleted_items,
                        "cancelled_subscriptions": len(cancelled_subscriptions)
                    }
                }
                
                # Stripeエラーがあった場合は警告を含める
                if stripe_errors:
                    response_data["warnings"] = "一部のサブスクリプションキャンセルに失敗しましたが、退会処理は完了しました"
                    logger.warning(f"Stripe errors during withdrawal: {stripe_errors}")
                
                return jsonify(response_data)
                
            except Exception as e:
                # エラーが発生した場合はロールバック
                conn.rollback()
                raise
        
    except mysql.connector.Error as e:
        logger.error(f"Database error during withdrawal for user {user_id}: {str(e)}")
        return jsonify({
            "error": "データベースエラーが発生しました",
            "result": False
        }), 500
        
    except Exception as e:
        logger.error(f"Withdrawal error for user {user_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": "退会処理中にエラーが発生しました",
            "result": False
        }), 500