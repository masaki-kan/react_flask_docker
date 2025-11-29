"""
購入フロー用のAPI
"""

from flask import Blueprint, jsonify, request
from utils.db_utils import get_db_connection
import mysql.connector
from datetime import datetime
from tradeArchiver import TradeArchiver

purchase_bp = Blueprint('purchase', __name__, url_prefix='/api')


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

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, purchase_price, status
                FROM trades
                WHERE trade_id = %s
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

            # TODO: Stripe決済処理をここに実装
            # payment_intent = stripe.PaymentIntent.create(...)

            # 仮の決済完了処理（実際はStripeのレスポンスを使用）
            payment_intent_id = f"pi_test_{trade_id}_{int(datetime.now().timestamp())}"

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
                'status': 'paid'
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

            # 取引情報を取得
            cursor.execute("""
                SELECT trade_id, status, trade_type, is_buyer_confirmed, item_id
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

            # 取引を完了
            cursor.execute("""
                UPDATE trades
                SET is_seller_confirmed = TRUE,
                    status = 'completed',
                    updated_at = NOW()
                WHERE trade_id = %s
            """, (trade_id,))

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
