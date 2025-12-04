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
STRIPE_MODE = os.environ.get('STRIPE_MODE', 'test')  # 'test' or 'live' (デフォルト: test)
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
# 3. 決済API（Stripe連携は後で実装）
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

            # Stripe手数料を計算（3.6%）
            purchase_price = float(trade['purchase_price'])
            stripe_fee = int(purchase_price * 0.036)
            total_amount = int(purchase_price + stripe_fee)

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
                    payment_intent = stripe.PaymentIntent.create(
                        amount=total_amount,  # Stripe手数料込み
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
                'amount': total_amount,
                'purchase_price': int(purchase_price),
                'stripe_fee': stripe_fee,
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

                        # 販売者への送金額（商品代金100%）
                        transfer_amount = int(float(trade['purchase_price']))

                        # Transferを実行
                        transfer = stripe.Transfer.create(
                            amount=transfer_amount,
                            currency='jpy',
                            destination=trade['stripe_account_id'],
                            source_transaction=charge_id,
                            metadata={
                                'trade_id': str(trade_id),
                                'seller_id': str(trade['seller_id']),
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
