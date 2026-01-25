"""
購入フロー用のAPI
"""

from flask import Blueprint, jsonify, request
from utils.db_utils import get_db_connection
import mysql.connector
from datetime import datetime
from tradeArchiver import TradeArchiver
import stripe
import os

purchase_bp = Blueprint('purchase', __name__, url_prefix='/api')

# Stripe設定
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_MODE = os.environ.get('STRIPE_MODE', 'live')  # 'test' or 'live' (デフォルト: test)
stripe.api_key = STRIPE_SECRET_KEY


# ================================================================================
# 1. 金額提案API
# ================================================================================

@purchase_bp.route('/propose_purchase_price', methods=['POST'])
def propose_purchase_price():
    """
    購入金額を提案（Sellerが提案）

    Parameters:
        trade_id: 取引ID
        price: 提案金額（円）
        message: メッセージ（任意）
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')
        price = data.get('price')
        message = data.get('message', '')

        if not trade_id or not price:
            return jsonify({
                'success': False,
                'message': '取引IDと金額は必須です'
            }), 400

        # 金額のバリデーション
        try:
            price = float(price)
            if price <= 0:
                return jsonify({
                    'success': False,
                    'message': '金額は0より大きい値を入力してください'
                }), 400
        except ValueError:
            return jsonify({
                'success': False,
                'message': '無効な金額です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, seller_id, buyer_id, status
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            # pending または price_proposed の時のみ金額提案可能
            if trade['status'] not in ['pending', 'price_proposed']:
                return jsonify({
                    'success': False,
                    'message': 'この取引は金額提案できません（既に合意済みか取引が進行中です）'
                }), 400

            # 取引を購入モードに更新（Sellerが提案）
            # 金額を修正する場合は合意状態をリセット
            cursor.execute("""
                UPDATE trades
                SET trade_type = 'purchase',
                    purchase_price = %s,
                    price_proposed_by = %s,
                    status = 'price_proposed',
                    is_price_agreed_seller = FALSE,
                    is_price_agreed_buyer = FALSE,
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (price, trade['seller_id'], trade_id))

            # メッセージを保存（任意）
            if message:
                cursor.execute("""
                    INSERT INTO trade_messages (trade_id, sender_id, message)
                    VALUES (%s, %s, %s)
                """, (trade_id, trade['seller_id'], f"購入希望: ¥{int(price):,} - {message}"))

            conn.commit()
            cursor.close()

        print(f"✅ 購入金額提案完了: trade_id={trade_id}, price={price}, status=price_proposed")

        return jsonify({
            'success': True,
            'message': '金額を提案しました',
            'data': {
                'trade_id': trade_id,
                'purchase_price': price,
                'status': 'price_proposed'
            }
        })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 2. 金額合意API
# ================================================================================

@purchase_bp.route('/agree_purchase_price', methods=['POST'])
def agree_purchase_price():
    """
    金額に合意

    Parameters:
        trade_id: 取引ID
        user_type: 'seller' or 'buyer'
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')
        user_type = data.get('user_type')  # 'seller' or 'buyer'

        if not trade_id or not user_type:
            return jsonify({
                'success': False,
                'message': '取引IDとユーザータイプは必須です'
            }), 400

        if user_type not in ['seller', 'buyer']:
            return jsonify({
                'success': False,
                'message': 'ユーザータイプは seller または buyer である必要があります'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, seller_id, buyer_id, purchase_price, status,
                       is_price_agreed_seller, is_price_agreed_buyer
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['status'] not in ['price_proposed', 'price_agreed']:
                return jsonify({
                    'success': False,
                    'message': 'この取引は金額合意できません'
                }), 400

            # 合意フラグを更新
            if user_type == 'seller':
                cursor.execute("""
                    UPDATE trades
                    SET is_price_agreed_seller = TRUE,
                        updated_at = NOW()
                    WHERE trade_id = %s
                """, (trade_id,))
            else:  # buyer
                cursor.execute("""
                    UPDATE trades
                    SET is_price_agreed_buyer = TRUE,
                        updated_at = NOW()
                    WHERE trade_id = %s
                """, (trade_id,))

            # 再度取得して両者が合意したかチェック
            cursor.execute("""
                SELECT is_price_agreed_seller, is_price_agreed_buyer
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            updated_trade = cursor.fetchone()

            # 両者が合意した場合、ステータスを更新
            if updated_trade['is_price_agreed_seller'] and updated_trade['is_price_agreed_buyer']:
                cursor.execute("""
                    UPDATE trades
                    SET status = 'price_agreed',
                        updated_at = NOW()
                    WHERE trade_id = %s
                """, (trade_id,))
                new_status = 'price_agreed'
            else:
                new_status = 'price_proposed'

            conn.commit()
            cursor.close()

        return jsonify({
            'success': True,
            'message': '金額に合意しました' if new_status == 'price_agreed' else '合意を記録しました',
            'data': {
                'trade_id': trade_id,
                'status': new_status,
                'both_agreed': new_status == 'price_agreed'
            }
        })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 3. カード決済API（Stripe Elements用）
# ================================================================================

@purchase_bp.route('/create_card_payment_intent', methods=['POST'])
def create_card_payment_intent():
    """
    カード決済用のPaymentIntentを作成（Stripe Elements用）
    client_secretを返し、フロントエンドでカード情報を入力して決済を確定する

    Parameters:
        trade_id: 取引ID

    Returns:
        client_secret: Stripe Elements用のシークレット
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得（販売者のStripe情報も取得）
            cursor.execute("""
                SELECT t.trade_id, t.purchase_price, t.status, t.buyer_id,
                       i.user_id as seller_id,
                       u.stripe_account_id, u.stripe_charges_enabled
                FROM trades t
                JOIN items i ON t.item_id = i.item_id
                JOIN users u ON i.user_id = u.user_id
                WHERE t.trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['status'] != 'price_agreed':
                return jsonify({
                    'success': False,
                    'message': 'この取引は決済できません（金額が合意されていません）'
                }), 400

            purchase_price = float(trade['purchase_price'])
            buyer_payment_amount = int(purchase_price)
            stripe_fee = int(purchase_price * 0.036)

            # 本番環境の場合: Stripe Connectを使用
            if STRIPE_MODE == 'live':
                if not trade['stripe_account_id']:
                    return jsonify({
                        'success': False,
                        'message': '販売者がStripe連携を完了していません'
                    }), 400

                if not trade['stripe_charges_enabled']:
                    return jsonify({
                        'success': False,
                        'message': '販売者のStripeアカウントが決済を受け付けられる状態ではありません'
                    }), 400

                try:
                    # PaymentIntentを作成（確定はフロントエンドで行う）
                    payment_intent = stripe.PaymentIntent.create(
                        amount=buyer_payment_amount,
                        currency='jpy',
                        payment_method_types=['card'],
                        # エスクロー設定
                        on_behalf_of=trade['stripe_account_id'],
                        transfer_data={
                            'destination': trade['stripe_account_id'],
                        },
                        metadata={
                            'trade_id': str(trade_id),
                            'seller_id': str(trade['seller_id']),
                            'buyer_id': str(trade['buyer_id']),
                            'product_price': str(purchase_price),
                            'stripe_fee': str(stripe_fee),
                            'seller_receives': str(int(purchase_price - stripe_fee)),
                            'payment_method': 'card',
                        }
                    )

                    # 取引テーブルを更新（PaymentIntent ID保存）
                    cursor.execute("""
                        UPDATE trades
                        SET payment_intent_id = %s,
                            payment_method = 'card',
                            updated_at = NOW()
                        WHERE trade_id = %s
                    """, (payment_intent.id, trade_id))
                    conn.commit()

                    print(f"[INFO] Card PaymentIntent created: {payment_intent.id}", flush=True)

                    return jsonify({
                        'success': True,
                        'message': 'PaymentIntentを作成しました',
                        'data': {
                            'client_secret': payment_intent.client_secret,
                            'payment_intent_id': payment_intent.id,
                            'amount': buyer_payment_amount,
                            'is_test_mode': False
                        }
                    })

                except stripe.error.StripeError as e:
                    print(f"[ERROR] Stripe PaymentIntent creation failed: {str(e)}", flush=True)
                    return jsonify({
                        'success': False,
                        'message': f'決済準備エラー: {str(e)}'
                    }), 500

            else:
                # 開発環境: テストモード
                # テスト環境でもStripe APIを使用（テストキーで）
                try:
                    payment_intent = stripe.PaymentIntent.create(
                        amount=buyer_payment_amount,
                        currency='jpy',
                        payment_method_types=['card'],
                        metadata={
                            'trade_id': str(trade_id),
                            'seller_id': str(trade['seller_id']),
                            'buyer_id': str(trade['buyer_id']),
                            'payment_method': 'card',
                        }
                    )

                    cursor.execute("""
                        UPDATE trades
                        SET payment_intent_id = %s,
                            payment_method = 'card',
                            updated_at = NOW()
                        WHERE trade_id = %s
                    """, (payment_intent.id, trade_id))
                    conn.commit()

                    return jsonify({
                        'success': True,
                        'message': '【テスト】PaymentIntentを作成しました',
                        'data': {
                            'client_secret': payment_intent.client_secret,
                            'payment_intent_id': payment_intent.id,
                            'amount': buyer_payment_amount,
                            'is_test_mode': True
                        }
                    })

                except stripe.error.StripeError as e:
                    print(f"[ERROR] Test Stripe PaymentIntent creation failed: {str(e)}", flush=True)
                    return jsonify({
                        'success': False,
                        'message': f'決済準備エラー: {str(e)}'
                    }), 500

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[ERROR] create_card_payment_intent error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/confirm_card_payment', methods=['POST'])
def confirm_card_payment():
    """
    カード決済の完了を確認してDBを更新

    Parameters:
        trade_id: 取引ID
        payment_intent_id: PaymentIntent ID
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')
        payment_intent_id = data.get('payment_intent_id')

        if not trade_id or not payment_intent_id:
            return jsonify({
                'success': False,
                'message': '取引IDとPaymentIntent IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, payment_intent_id, status, purchase_price
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['payment_intent_id'] != payment_intent_id:
                return jsonify({
                    'success': False,
                    'message': 'PaymentIntent IDが一致しません'
                }), 400

            # Stripeで決済状況を確認
            try:
                payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

                if payment_intent.status == 'succeeded':
                    # 決済成功 → DBを更新
                    cursor.execute("""
                        UPDATE trades
                        SET paid_at = NOW(),
                            status = 'paid',
                            updated_at = NOW()
                        WHERE trade_id = %s
                    """, (trade_id,))
                    conn.commit()

                    purchase_price = float(trade['purchase_price'])
                    stripe_fee = int(purchase_price * 0.036)

                    print(f"[INFO] Card payment confirmed: trade_id={trade_id}", flush=True)

                    return jsonify({
                        'success': True,
                        'message': '決済が完了しました',
                        'data': {
                            'trade_id': trade_id,
                            'status': 'paid',
                            'purchase_price': int(purchase_price),
                            'stripe_fee': stripe_fee,
                            'seller_receives': int(purchase_price - stripe_fee)
                        }
                    })
                else:
                    return jsonify({
                        'success': False,
                        'message': f'決済が完了していません（状態: {payment_intent.status}）'
                    }), 400

            except stripe.error.StripeError as e:
                return jsonify({
                    'success': False,
                    'message': f'決済確認エラー: {str(e)}'
                }), 500

    except Exception as e:
        print(f"[ERROR] confirm_card_payment error: {str(e)}", flush=True)
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 3-2. 決済API（レガシー - 後方互換性のため残す）
# ================================================================================

@purchase_bp.route('/pay_for_purchase', methods=['POST'])
def pay_for_purchase():
    """
    購入代金を決済

    Parameters:
        trade_id: 取引ID
        payment_method_id: Stripeの決済方法ID（将来実装）
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')
        payment_method_id = data.get('payment_method_id', 'pm_test_success')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得（販売者のStripe情報も取得）
            cursor.execute("""
                SELECT t.trade_id, t.purchase_price, t.status, t.buyer_id,
                       i.user_id as seller_id,
                       u.stripe_account_id, u.stripe_charges_enabled
                FROM trades t
                JOIN items i ON t.item_id = i.item_id
                JOIN users u ON i.user_id = u.user_id
                WHERE t.trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['status'] != 'price_agreed':
                return jsonify({
                    'success': False,
                    'message': 'この取引は決済できません（金額が合意されていません）'
                }), 400

            # 購入金額（販売者負担の場合、購入者は商品代金のみ支払う）
            purchase_price = float(trade['purchase_price'])
            stripe_fee = int(purchase_price * 0.036)  # 販売者が負担する手数料
            buyer_payment_amount = int(purchase_price)  # 購入者が支払う金額（商品代金のみ）

            # 本番環境の場合: Stripe Connectを使用
            if STRIPE_MODE == 'live':
                # 販売者のStripe Connected Accountを確認
                if not trade['stripe_account_id']:
                    return jsonify({
                        'success': False,
                        'message': '販売者がStripe連携を完了していません'
                    }), 400

                if not trade['stripe_charges_enabled']:
                    return jsonify({
                        'success': False,
                        'message': '販売者のStripeアカウントが決済を受け付けられる状態ではありません'
                    }), 400

                try:
                    # PaymentIntentを作成（エスクロー設定）
                    # 購入者は商品代金のみ支払い、販売者がStripe手数料を負担
                    payment_intent = stripe.PaymentIntent.create(
                        amount=buyer_payment_amount,  # 購入者が支払う金額（商品代金のみ）
                        currency='jpy',
                        payment_method=payment_method_id,
                        payment_method_types=['card'],
                        confirm=True,  # 即座に決済確定
                        automatic_payment_methods={'enabled': False},

                        # エスクロー設定: 販売者のConnected Accountを指定
                        on_behalf_of=trade['stripe_account_id'],

                        # 送金予約（後でTransferで実行）
                        transfer_data={
                            'destination': trade['stripe_account_id'],
                        },

                        metadata={
                            'trade_id': str(trade_id),
                            'seller_id': str(trade['seller_id']),
                            'buyer_id': str(trade['buyer_id']),
                            'product_price': str(purchase_price),
                            'stripe_fee': str(stripe_fee),
                            'seller_receives': str(int(purchase_price - stripe_fee)),
                        }
                    )

                    payment_intent_id = payment_intent.id

                    print(f"[INFO] PaymentIntent created: {payment_intent_id}", flush=True)

                except stripe.error.StripeError as e:
                    print(f"[ERROR] Stripe payment failed: {str(e)}", flush=True)
                    return jsonify({
                        'success': False,
                        'message': f'決済エラー: {str(e)}'
                    }), 500

            else:
                # 開発環境: テストモード（ダミーのPaymentIntent ID）
                payment_intent_id = f"pi_test_{trade_id}_{int(datetime.now().timestamp())}"
                print(f"[INFO] Test mode: PaymentIntent ID = {payment_intent_id}", flush=True)

            # 決済完了を記録
            cursor.execute("""
                UPDATE trades
                SET payment_intent_id = %s,
                    paid_at = NOW(),
                    status = 'paid',
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (payment_intent_id, trade_id))

            conn.commit()
            cursor.close()

        return jsonify({
            'success': True,
            'message': '決済が完了しました',
            'data': {
                'trade_id': trade_id,
                'payment_intent_id': payment_intent_id,
                'status': 'paid',
                'buyer_paid': buyer_payment_amount,  # 購入者が支払った金額
                'purchase_price': int(purchase_price),
                'stripe_fee': stripe_fee,
                'seller_receives': int(purchase_price - stripe_fee),  # 販売者が受け取る金額
                'is_test_mode': STRIPE_MODE != 'live'
            }
        })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 4. 受け取り確認API（Buyer用）
# ================================================================================

@purchase_bp.route('/confirm_buyer_received', methods=['POST'])
def confirm_buyer_received():
    """
    購入者が商品受け取りを確認

    Parameters:
        trade_id: 取引ID
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, status, trade_type
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['trade_type'] != 'purchase':
                return jsonify({
                    'success': False,
                    'message': 'この取引は購入取引ではありません'
                }), 400

            if trade['status'] != 'shipped':
                return jsonify({
                    'success': False,
                    'message': 'この取引は受け取り確認できません（発送済みステータスではありません）'
                }), 400

            # 受け取り確認を記録
            cursor.execute("""
                UPDATE trades
                SET is_buyer_confirmed = TRUE,
                    buyer_received_at = NOW(),
                    status = 'buyer_received',
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (trade_id,))

            conn.commit()
            cursor.close()

        return jsonify({
            'success': True,
            'message': '受け取りを確認しました',
            'data': {
                'trade_id': trade_id,
                'status': 'buyer_received'
            }
        })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 5. 取引完了API（Seller用）
# ================================================================================

@purchase_bp.route('/complete_purchase_trade', methods=['POST'])
def complete_purchase_trade():
    """
    発送者（Seller）が取引を完了

    Parameters:
        trade_id: 取引ID
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得（販売者のStripe情報も取得）
            cursor.execute("""
                SELECT t.trade_id, t.status, t.trade_type, t.is_buyer_confirmed,
                       t.item_id, t.purchase_price, t.payment_intent_id,
                       i.user_id as seller_id,
                       u.stripe_account_id, u.stripe_payouts_enabled
                FROM trades t
                JOIN items i ON t.item_id = i.item_id
                JOIN users u ON i.user_id = u.user_id
                WHERE t.trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['trade_type'] != 'purchase':
                return jsonify({
                    'success': False,
                    'message': 'この取引は購入取引ではありません'
                }), 400

            if trade['status'] != 'buyer_received':
                return jsonify({
                    'success': False,
                    'message': 'この取引は完了できません（購入者の受け取り確認が必要です）'
                }), 400

            if not trade['is_buyer_confirmed']:
                return jsonify({
                    'success': False,
                    'message': '購入者の受け取り確認が完了していません'
                }), 400

            # 本番環境の場合: Stripe Transferを実行（販売者への送金）
            stripe_transfer_id = None
            if STRIPE_MODE == 'live':
                try:
                    # 販売者のStripe Accountを確認
                    if not trade['stripe_account_id']:
                        print(f"[WARNING] Seller has no Stripe account. Skipping transfer.", flush=True)
                    elif not trade['stripe_payouts_enabled']:
                        print(f"[WARNING] Seller's Stripe payouts not enabled. Skipping transfer.", flush=True)
                    else:
                        # PaymentIntentからChargeを取得
                        payment_intent = stripe.PaymentIntent.retrieve(trade['payment_intent_id'])

                        if not payment_intent.charges or not payment_intent.charges.data:
                            raise Exception("PaymentIntentにChargeが見つかりません")

                        charge_id = payment_intent.charges.data[0].id

                        # 販売者への送金額（商品代金 - Stripe手数料3.6%）
                        purchase_price = float(trade['purchase_price'])
                        stripe_fee = int(purchase_price * 0.036)
                        transfer_amount = int(purchase_price - stripe_fee)

                        # Transferを実行
                        transfer = stripe.Transfer.create(
                            amount=transfer_amount,
                            currency='jpy',
                            destination=trade['stripe_account_id'],
                            source_transaction=charge_id,
                            metadata={
                                'trade_id': str(trade_id),
                                'seller_id': str(trade['seller_id']),
                                'purchase_price': str(int(purchase_price)),
                                'stripe_fee': str(stripe_fee),
                                'transfer_amount': str(transfer_amount),
                            }
                        )

                        stripe_transfer_id = transfer.id
                        print(f"[INFO] Transfer created: {stripe_transfer_id} (amount: ¥{transfer_amount})", flush=True)

                except stripe.error.StripeError as e:
                    # Transfer失敗時もログに記録して続行
                    # （トランザクション全体を失敗させないため）
                    print(f"[ERROR] Stripe Transfer failed: {str(e)}", flush=True)
                    # 管理者に通知するなどの処理を追加する場合はここに
                except Exception as e:
                    print(f"[ERROR] Transfer process failed: {str(e)}", flush=True)
            else:
                # 開発環境: ダミーのTransfer ID
                stripe_transfer_id = f"tr_test_{trade_id}_{int(datetime.now().timestamp())}"
                print(f"[INFO] Test mode: Transfer ID = {stripe_transfer_id}", flush=True)

            # 取引を完了
            cursor.execute("""
                UPDATE trades
                SET is_seller_confirmed = TRUE,
                    status = 'completed',
                    stripe_transfer_id = %s,
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (stripe_transfer_id, trade_id,))

            # アーカイブ処理
            try:
                archiver = TradeArchiver(conn)
                archive_trade_id = archiver.archive_trade(trade_id)
                print(f"✅ 購入取引をアーカイブしました: archive_trade_id={archive_trade_id}")
            except Exception as archive_error:
                print(f"⚠️ アーカイブ処理でエラーが発生しましたが、取引は完了しました: {archive_error}")
                # アーカイブに失敗しても取引完了は継続

            # ===== ここから削除処理 =====
            # 取引関連データの削除（アーカイブ後に実行）

            # 1. trade_messages の削除
            cursor.execute('''
                DELETE FROM trade_messages WHERE trade_id = %s
            ''', (trade_id,))

            # 2. shipping_info の削除
            cursor.execute('''
                DELETE FROM shipping_info WHERE trade_id = %s
            ''', (trade_id,))

            # 3. trades の削除
            cursor.execute('''
                DELETE FROM trades WHERE trade_id = %s
            ''', (trade_id,))

            # 4. 購入された商品の削除
            # 購入フローではメイン商品(item_id)のみ削除
            item_id = trade['item_id']

            # likes の削除
            cursor.execute('''
                DELETE FROM likes WHERE item_id = %s
            ''', (item_id,))

            # item_images の削除
            cursor.execute('''
                DELETE FROM item_images WHERE item_id = %s
            ''', (item_id,))

            # items の削除
            cursor.execute('''
                DELETE FROM items WHERE item_id = %s
            ''', (item_id,))

            print(f"✅ 購入取引完了: 商品(item_id={item_id})を削除しました")

            conn.commit()
            cursor.close()

        return jsonify({
            'success': True,
            'message': '取引が完了しました',
            'data': {
                'trade_id': trade_id,
                'status': 'completed'
            }
        })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


# ================================================================================
# 6. 銀行振込決済API
# ================================================================================

@purchase_bp.route('/create_bank_transfer_payment', methods=['POST'])
def create_bank_transfer_payment():
    """
    銀行振込用のPaymentIntentを作成

    Parameters:
        trade_id: 取引ID

    Returns:
        - 仮想口座情報（振込先）
        - 振込期限
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得（購入者と販売者のStripe情報も取得）
            cursor.execute("""
                SELECT t.trade_id, t.purchase_price, t.status, t.buyer_id,
                       i.user_id as seller_id,
                       seller.stripe_account_id, seller.stripe_charges_enabled,
                       buyer.stripe_customer_id as buyer_stripe_customer_id,
                       buyer.email as buyer_email, buyer.name as buyer_name
                FROM trades t
                JOIN items i ON t.item_id = i.item_id
                JOIN users seller ON i.user_id = seller.user_id
                JOIN users buyer ON t.buyer_id = buyer.user_id
                WHERE t.trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['status'] != 'price_agreed':
                return jsonify({
                    'success': False,
                    'message': 'この取引は決済できません（金額が合意されていません）'
                }), 400

            purchase_price = int(float(trade['purchase_price']))

            # 本番環境の場合: Stripe Bank Transferを使用
            if STRIPE_MODE == 'live':
                # 販売者のStripe Connected Accountを確認
                if not trade['stripe_account_id']:
                    return jsonify({
                        'success': False,
                        'message': '販売者がStripe連携を完了していません'
                    }), 400

                if not trade['stripe_charges_enabled']:
                    return jsonify({
                        'success': False,
                        'message': '販売者のStripeアカウントが決済を受け付けられる状態ではありません'
                    }), 400

                try:
                    # 購入者のStripe Customerを取得または作成
                    if trade['buyer_stripe_customer_id']:
                        customer_id = trade['buyer_stripe_customer_id']
                    else:
                        # 新規Customer作成
                        customer = stripe.Customer.create(
                            email=trade['buyer_email'],
                            name=trade['buyer_name'],
                            metadata={
                                'user_id': str(trade['buyer_id']),
                                'platform': 'vintage_marketplace'
                            }
                        )
                        customer_id = customer.id

                        # DBに保存
                        cursor.execute("""
                            UPDATE users
                            SET stripe_customer_id = %s,
                                updated_at = NOW()
                            WHERE user_id = %s
                        """, (customer_id, trade['buyer_id']))

                    # 銀行振込用PaymentIntentを作成
                    payment_intent = stripe.PaymentIntent.create(
                        amount=purchase_price,
                        currency='jpy',
                        customer=customer_id,
                        payment_method_types=['customer_balance'],
                        payment_method_data={
                            'type': 'customer_balance',
                        },
                        payment_method_options={
                            'customer_balance': {
                                'funding_type': 'bank_transfer',
                                'bank_transfer': {
                                    'type': 'jp_bank_transfer',
                                },
                            },
                        },
                        # エスクロー設定
                        on_behalf_of=trade['stripe_account_id'],
                        transfer_data={
                            'destination': trade['stripe_account_id'],
                        },
                        metadata={
                            'trade_id': str(trade_id),
                            'seller_id': str(trade['seller_id']),
                            'buyer_id': str(trade['buyer_id']),
                            'payment_method': 'bank_transfer',
                        }
                    )

                    # 取引テーブルを更新
                    cursor.execute("""
                        UPDATE trades
                        SET payment_intent_id = %s,
                            payment_method = 'bank_transfer',
                            status = 'awaiting_payment',
                            updated_at = NOW()
                        WHERE trade_id = %s
                    """, (payment_intent.id, trade_id))

                    conn.commit()

                    # 振込先口座情報を取得
                    bank_transfer_info = None
                    if payment_intent.next_action and payment_intent.next_action.type == 'display_bank_transfer_instructions':
                        bank_transfer_info = payment_intent.next_action.display_bank_transfer_instructions

                    print(f"[INFO] Bank transfer PaymentIntent created: {payment_intent.id}", flush=True)

                    return jsonify({
                        'success': True,
                        'message': '銀行振込情報を作成しました',
                        'data': {
                            'trade_id': trade_id,
                            'payment_intent_id': payment_intent.id,
                            'status': 'awaiting_payment',
                            'amount': purchase_price,
                            'bank_transfer_info': {
                                'type': 'jp_bank_transfer',
                                'financial_addresses': bank_transfer_info.financial_addresses if bank_transfer_info else None,
                                'amount_remaining': bank_transfer_info.amount_remaining if bank_transfer_info else purchase_price,
                                'reference': bank_transfer_info.reference if bank_transfer_info else None,
                            } if bank_transfer_info else None,
                            'is_test_mode': False
                        }
                    })

                except stripe.error.StripeError as e:
                    print(f"[ERROR] Stripe bank transfer error: {str(e)}", flush=True)
                    return jsonify({
                        'success': False,
                        'message': f'銀行振込設定エラー: {str(e)}'
                    }), 500

            else:
                # 開発環境: テストモード
                payment_intent_id = f"pi_bank_test_{trade_id}_{int(datetime.now().timestamp())}"

                # 取引テーブルを更新
                cursor.execute("""
                    UPDATE trades
                    SET payment_intent_id = %s,
                        payment_method = 'bank_transfer',
                        status = 'awaiting_payment',
                        updated_at = NOW()
                    WHERE trade_id = %s
                """, (payment_intent_id, trade_id))

                conn.commit()

                print(f"[INFO] Test mode: Bank transfer PaymentIntent ID = {payment_intent_id}", flush=True)

                return jsonify({
                    'success': True,
                    'message': '【テスト】銀行振込情報を作成しました',
                    'data': {
                        'trade_id': trade_id,
                        'payment_intent_id': payment_intent_id,
                        'status': 'awaiting_payment',
                        'amount': purchase_price,
                        'bank_transfer_info': {
                            'type': 'jp_bank_transfer',
                            'financial_addresses': [{
                                'type': 'zengin',
                                'zengin': {
                                    'bank_name': 'テスト銀行',
                                    'bank_code': '0001',
                                    'branch_name': 'テスト支店',
                                    'branch_code': '001',
                                    'account_type': 'futsu',
                                    'account_number': '1234567',
                                    'account_holder_name': 'ストライプ（カ'
                                }
                            }],
                            'amount_remaining': purchase_price,
                            'reference': f'TEST-{trade_id}',
                        },
                        'is_test_mode': True
                    }
                })

    except mysql.connector.Error as e:
        return jsonify({
            'success': False,
            'message': f'データベースエラー: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[ERROR] Bank transfer error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/check_bank_transfer_status', methods=['POST'])
def check_bank_transfer_status():
    """
    銀行振込の入金状況を確認

    Parameters:
        trade_id: 取引ID
    """
    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, payment_intent_id, payment_method, status, purchase_price
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['payment_method'] != 'bank_transfer':
                return jsonify({
                    'success': False,
                    'message': 'この取引は銀行振込決済ではありません'
                }), 400

            # 本番環境の場合: Stripe APIで確認
            if STRIPE_MODE == 'live' and trade['payment_intent_id'] and not trade['payment_intent_id'].startswith('pi_bank_test_'):
                try:
                    payment_intent = stripe.PaymentIntent.retrieve(trade['payment_intent_id'])

                    payment_status = payment_intent.status
                    amount_received = payment_intent.amount_received if hasattr(payment_intent, 'amount_received') else 0

                    # 入金完了の場合、ステータスを更新
                    if payment_status == 'succeeded' and trade['status'] == 'awaiting_payment':
                        cursor.execute("""
                            UPDATE trades
                            SET paid_at = NOW(),
                                status = 'paid',
                                updated_at = NOW()
                            WHERE trade_id = %s
                        """, (trade_id,))
                        conn.commit()

                        return jsonify({
                            'success': True,
                            'data': {
                                'trade_id': trade_id,
                                'payment_status': 'succeeded',
                                'trade_status': 'paid',
                                'amount_received': amount_received,
                                'is_payment_complete': True
                            }
                        })

                    return jsonify({
                        'success': True,
                        'data': {
                            'trade_id': trade_id,
                            'payment_status': payment_status,
                            'trade_status': trade['status'],
                            'amount_received': amount_received,
                            'amount_remaining': int(trade['purchase_price']) - amount_received,
                            'is_payment_complete': False
                        }
                    })

                except stripe.error.StripeError as e:
                    return jsonify({
                        'success': False,
                        'message': f'Stripe確認エラー: {str(e)}'
                    }), 500
            else:
                # 開発環境: テストモード
                return jsonify({
                    'success': True,
                    'data': {
                        'trade_id': trade_id,
                        'payment_status': 'requires_action',
                        'trade_status': trade['status'],
                        'amount_received': 0,
                        'amount_remaining': int(trade['purchase_price']),
                        'is_payment_complete': False,
                        'is_test_mode': True
                    }
                })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@purchase_bp.route('/simulate_bank_transfer_received', methods=['POST'])
def simulate_bank_transfer_received():
    """
    【テスト用】銀行振込の入金をシミュレート

    Parameters:
        trade_id: 取引ID
    """
    if STRIPE_MODE == 'live':
        return jsonify({
            'success': False,
            'message': '本番環境ではこのエンドポイントは使用できません'
        }), 400

    try:
        data = request.json
        trade_id = data.get('trade_id')

        if not trade_id:
            return jsonify({
                'success': False,
                'message': '取引IDは必須です'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, payment_method, status
                FROM trades
                WHERE trade_id = %s
            """, (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({
                    'success': False,
                    'message': '取引が見つかりません'
                }), 404

            if trade['status'] != 'awaiting_payment':
                return jsonify({
                    'success': False,
                    'message': 'この取引は入金待ち状態ではありません'
                }), 400

            # ステータスを「決済完了」に更新
            cursor.execute("""
                UPDATE trades
                SET paid_at = NOW(),
                    status = 'paid',
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (trade_id,))
            conn.commit()

            print(f"[INFO] Test mode: Bank transfer simulated for trade_id={trade_id}", flush=True)

            return jsonify({
                'success': True,
                'message': '【テスト】銀行振込の入金をシミュレートしました',
                'data': {
                    'trade_id': trade_id,
                    'status': 'paid'
                }
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500
