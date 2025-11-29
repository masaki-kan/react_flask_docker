
from tradeArchiver import TradeArchiver
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from utils.db_utils import get_db_connection
from utils.image_utils import upload_image_to_s3
import json
import mysql.connector
from flask_socketio import emit, join_room
from utils.db_utils import get_db_connection, get_db_connection_legacy

trades_bp = Blueprint('trades', __name__, url_prefix='/api')

# チャットメッセージ　取得
@trades_bp.route('/get_trade_messages', methods=['GET'])
def get_trade_messages():
    trade_id = request.args.get('trade_id')
    if not trade_id:
        return jsonify({'error': 'trade_id is required'}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT 
                    tm.sender_id, 
                    tm.message, 
                    tm.sent_at,
                    pi.image_url AS sender_image_url
                FROM trade_messages tm
                LEFT JOIN (
                    SELECT user_id, image_url
                    FROM (
                        SELECT 
                            user_id,
                            image_url,
                            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY uploaded_at DESC) AS rn
                        FROM profile_images
                    ) ranked
                    WHERE rn = 1
                ) pi ON tm.sender_id = pi.user_id
                WHERE tm.trade_id = %s
                ORDER BY tm.sent_at ASC
            ''', (trade_id,))
            
            messages = cursor.fetchall()

            return jsonify({'messages': messages}), 200
    except mysql.connector.Error as err:
        return jsonify({
            "error": "チャットデータ取得中にエラーが発生しました",
            "result": False
        }), 500

@trades_bp.route('/trade', methods=['POST'])
def create_trade():
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        buyer_id = data.get('buyer_id')
        seller_id = data.get('seller_id')
        
        # 必須パラメータのチェック
        if not all([item_id, buyer_id, seller_id]):
            return jsonify({
                'result': False,
                'message': '必須パラメータが不足しています',
                'error': '必須パラメータが不足しています'
            }), 400
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                # アイテムの存在確認
                cursor.execute("""
                    SELECT item_id, user_id 
                    FROM items 
                    WHERE item_id = %s
                """, (item_id,))
                item = cursor.fetchone()
                
                if not item:
                    return jsonify({
                        'result': False,
                        'message': '指定されたアイテムが存在しません',
                        'error': '指定されたアイテムが存在しません'
                    }), 404
                
                # 売り手の確認（アイテムの所有者と一致するか）
                if int(item['user_id']) != int(seller_id):
                    return jsonify({
                        'result': False,
                        'message': '売り手がアイテムの所有者ではありません',
                        'error': '売り手がアイテムの所有者ではありません'
                    }), 400
                
                # 買い手と売り手が同じでないか確認
                if int(buyer_id) == int(seller_id):
                    return jsonify({
                        'result': False,
                        'message': '自分のアイテムは購入できません',
                        'error': '自分のアイテムは購入できません'
                    }), 400
                
                # 既存の取引があるか確認
                cursor.execute("""
                    SELECT trade_id, status 
                    FROM trades 
                    WHERE item_id = %s AND buyer_id = %s
                """, (item_id, buyer_id))
                existing_trade = cursor.fetchone()
                
                if existing_trade:
                    # キャンセルされた取引以外は重複エラー
                    if existing_trade['status'] != 'cancelled':
                        return jsonify({
                            'result': False,
                            'message': 'すでに取引が存在します',
                            'error': 'すでに取引が存在します'
                        }), 400
                
                # アイテムが他の進行中の取引に含まれていないか確認
                cursor.execute("""
                    SELECT trade_id 
                    FROM trades 
                    WHERE item_id = %s 
                    AND status IN ('pending', 'purchased', 'shipped')
                """, (item_id,))
                active_trade = cursor.fetchone()
                
                if active_trade:
                    return jsonify({
                        'result': False,
                        'message': 'このアイテムは既に取引中です',
                        'error': 'このアイテムは既に取引中です'
                    }), 400
                
                # 新規取引を作成
                cursor.execute("""
                    INSERT INTO trades (item_id, seller_id, buyer_id, status ,buyer_exchange_item_id )
                    VALUES (%s, %s, %s, 'pending', %s)
                """, (item_id, seller_id, buyer_id ,item_id))
                
                trade_id = cursor.lastrowid
                
                # 初期メッセージを作成（オプション）
                cursor.execute("""
                    INSERT INTO trade_messages (trade_id, sender_id, message)
                    VALUES (%s, %s, %s)
                """, (trade_id, buyer_id, 'こんにちは、このアイテムを交換希望です。'))
                
                # 対象の商品をフラグを変更する
                cursor.execute('''
                    UPDATE items 
                    SET status = 'trading'  
                    WHERE item_id = %s AND user_id = %s
                ''', (item_id,seller_id))
                
                # コミット
                conn.commit()

                return jsonify({
                    'result': True,
                    'message': '取引を開始しました',
                    'trade_id': trade_id
                }), 201
            
        except Exception as e:
            return jsonify({
                'result': False,
                'message': '取引の作成に失敗しました',
                'error': str(e)
            }), 500
            
    except Exception as e:
        return jsonify({
            'result': False,
            'message': '予期しないエラーが発生しました',
            'error': str(e)
        }), 500

# 取引ステータスの変更
@trades_bp.route('/trade_status_change' , methods=['POST'])
def trage_status_change():
    trade_id = request.json.get('trade_id')
    trade_status = request.json.get('status')
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 取引情報を取得（商品IDも含めて）
            cursor.execute('''
                SELECT item_id, seller_exchange_item_id, buyer_exchange_item_id 
                FROM trades 
                WHERE trade_id = %s
            ''', (trade_id,))
            trade = cursor.fetchone()
            
            # 2. "cancelled" の場合、関連メッセージを削除し、商品ステータスを戻す
            if trade_status == "cancelled":
                # 関連する商品のステータスを利用可能に戻す
                if trade:
                    # メインの商品
                    cursor.execute('''
                        UPDATE items SET status = 'available' 
                        WHERE item_id = %s AND status = 'trading'
                    ''', (trade['item_id'],))
                    
                    # sellerの交換商品
                    if trade['seller_exchange_item_id']:
                        cursor.execute('''
                            UPDATE items SET status = 'available' 
                            WHERE item_id = %s AND status = 'trading'
                        ''', (trade['seller_exchange_item_id'],))
                    
                    # buyerの交換商品
                    if trade['buyer_exchange_item_id']:
                        cursor.execute('''
                            UPDATE items SET status = 'available' 
                            WHERE item_id = %s AND status = 'trading'
                        ''', (trade['buyer_exchange_item_id'],))
                
                cursor.execute('''
                    DELETE FROM trade_messages WHERE trade_id = %s
                ''', (trade_id,))
                cursor.execute('''
                    DELETE FROM trades WHERE trade_id = %s
                ''', (trade_id,))
            else : 
                cursor.execute('''
                    UPDATE trades SET 
                        status = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE trade_id = %s
                ''', (trade_status, trade_id))

            conn.commit() 

            return jsonify({"result": True}), 200
    except mysql.connector.Error as err:
        return jsonify({
            "error": "進行中にエラーが発生しました",
            "result": False
        }), 500

# 発送情報を保存
@trades_bp.route('/save_shipping_info', methods=['POST'])
def save_shipping_info():
    data = request.json
    trade_id = data.get('trade_id')
    sender_user_id = data.get('sender_user_id')
    tracking_number = data.get('tracking_number')
    shipping_company = data.get('shipping_company')

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute('''
                SELECT * FROM trades WHERE trade_id = %s
            ''', (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({"error": "取引が見つかりません"}), 404

            # 既存の発送情報があるかチェック
            cursor.execute('''
                SELECT shipping_id FROM shipping_info
                WHERE trade_id = %s AND sender_user_id = %s
            ''', (trade_id, sender_user_id))

            existing = cursor.fetchone()

            if existing:
                # 更新
                cursor.execute('''
                    UPDATE shipping_info
                    SET tracking_number = %s, shipping_company = %s
                    WHERE trade_id = %s AND sender_user_id = %s
                ''', (tracking_number, shipping_company, trade_id, sender_user_id))
            else:
                # 新規作成
                cursor.execute('''
                    INSERT INTO shipping_info (trade_id, sender_user_id, tracking_number, shipping_company)
                    VALUES (%s, %s, %s, %s)
                ''', (trade_id, sender_user_id, tracking_number, shipping_company))

                # チャットに発送メッセージを自動送信
                cursor.execute('''
                    INSERT INTO trade_messages (trade_id, sender_id, message)
                    VALUES (%s, %s, %s)
                ''', (trade_id, sender_user_id, f"商品を発送しました。\n配送会社: {shipping_company}\n追跡番号: {tracking_number}"))

            # 取引タイプに応じて発送完了判定を変える
            if trade.get('trade_type') == 'purchase':
                # 購入フローの場合: Seller(seller_id)が発送したら即座にshippedステータスへ
                if int(sender_user_id) == int(trade['seller_id']):
                    cursor.execute('''
                        UPDATE trades
                        SET status = 'shipped'
                        WHERE trade_id = %s
                    ''', (trade_id,))
                    print(f"✅ 購入フロー: Sellerが発送完了 → status='shipped'")
            else:
                # 交換フローの場合: 両者が発送情報を入力したかチェック
                cursor.execute('''
                    SELECT COUNT(DISTINCT sender_user_id) as count
                    FROM shipping_info
                    WHERE trade_id = %s
                ''', (trade_id,))

                count_result = cursor.fetchone()

                # 両者が発送したらステータスを更新
                if count_result['count'] == 2:
                    cursor.execute('''
                        UPDATE trades
                        SET status = 'shipped'
                        WHERE trade_id = %s
                    ''', (trade_id,))
                    print(f"✅ 交換フロー: 両者が発送完了 → status='shipped'")

            conn.commit()

            return jsonify({'result': True, 'message': '発送情報を保存しました'})
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 発送情報を取得
@trades_bp.route('/get_shipping_info', methods=['GET'])
def get_shipping_info():
    trade_id = request.args.get('trade_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 両者の発送情報を取得
            cursor.execute('''
                SELECT si.*, u.name as sender_name, u.user_id
                FROM shipping_info si
                JOIN users u ON si.sender_user_id = u.user_id
                WHERE si.trade_id = %s
            ''', (trade_id,))
            
            shipping_info = cursor.fetchall()
            
            # 取引情報を取得して seller_id と buyer_id を特定
            cursor.execute('''
                SELECT seller_id, buyer_id
                FROM trades
                WHERE trade_id = %s
            ''', (trade_id,))
            
            trade = cursor.fetchone()

            # seller と buyer を判別して返す
            result = {
                'seller_shipping': None,
                'buyer_shipping': None
            }
            
            for info in shipping_info:
                if info['user_id'] == trade['seller_id']:
                    result['seller_shipping'] = info
                elif info['user_id'] == trade['buyer_id']:
                    result['buyer_shipping'] = info

            return jsonify({'result': True, 'shipping_info': shipping_info, **result})
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 商品受取確認
@trades_bp.route('/confirm_item_received', methods=['POST'])
def confirm_item_received():
    data = request.json
    trade_id = data.get('trade_id')
    user_id = data.get('user_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 既存の確認があるかチェック
            cursor.execute('''
                SELECT confirmation_id FROM trade_confirmations 
                WHERE trade_id = %s AND user_id = %s
            ''', (trade_id, user_id))
            
            existing = cursor.fetchone()
            
            if not existing:
                # 新規作成
                cursor.execute('''
                    INSERT INTO trade_confirmations (trade_id, user_id, confirmation_type)
                    VALUES (%s, %s, 'item_received')
                ''', (trade_id, user_id))
            
            # 両者が受取確認したかチェック
            cursor.execute('''
                SELECT COUNT(DISTINCT user_id) as count 
                FROM trade_confirmations 
                WHERE trade_id = %s
            ''', (trade_id,))
            
            count_result = cursor.fetchone()
            
            conn.commit() 
            
            return jsonify({
                'result': True, 
                'message': '受取確認を記録しました',
                'both_confirmed': count_result['count'] == 2
            })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 確認状況を取得
@trades_bp.route('/get_confirmations', methods=['GET'])
def get_confirmations():
    trade_id = request.args.get('trade_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 取引情報を取得
            cursor.execute('''
                SELECT seller_id, buyer_id
                FROM trades
                WHERE trade_id = %s
            ''', (trade_id,))
            
            trade = cursor.fetchone()
            
            # 取引が存在しない場合は、デフォルト値を返す
            if not trade:
                return jsonify({
                    'result': True,
                    'seller_confirmed': False,
                    'buyer_confirmed': False,
                    'both_confirmed': False,
                    'trade_exists': False  # 取引が存在しないことを示すフラグ
                })
            
            # 確認情報を取得
            cursor.execute('''
                SELECT user_id
                FROM trade_confirmations
                WHERE trade_id = %s
            ''', (trade_id,))
            
            confirmations = cursor.fetchall()
            confirmed_users = [c['user_id'] for c in confirmations]

            return jsonify({
                'result': True,
                'seller_confirmed': trade['seller_id'] in confirmed_users,
                'buyer_confirmed': trade['buyer_id'] in confirmed_users,
                'both_confirmed': len(confirmed_users) == 2,
                'trade_exists': True
            })
            
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 交換申請を受けた人が相手の商品一覧を取得
@trades_bp.route('/get_partner_items', methods=['POST'])
def get_partner_items():
    data = request.get_json()
    trade_id = data.get('trade_id')
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
        
            # まず取引情報を取得して、相手のuser_idを特定
            cursor.execute('''
                SELECT seller_id, buyer_id, status
                FROM trades 
                WHERE trade_id = %s
            ''', (trade_id,))
            trade_info = cursor.fetchone()
            
            if not trade_info:
                return jsonify({"error": "取引が見つかりません"}), 404
            
            partner_id = trade_info['seller_id']
            buyer_id = trade_info['buyer_id']
            
            # 相手のユーザー情報を取得
            cursor.execute('''
                SELECT 
                    users.user_id,
                    users.name,
                    users.location,
                    users.old,
                    users.age,
                    users.shop_name,
                    users.shop_url,
                    users.reasen,
                    tags.tag
                FROM users
                LEFT JOIN tags ON tags.user_id = users.user_id
                WHERE users.user_id = %s
            ''', (partner_id,))
            partner_user_info = cursor.fetchone()

            # 相手のプロフィール画像を取得
            cursor.execute('''
                SELECT image_url
                FROM profile_images
                WHERE user_id = %s
                ORDER BY uploaded_at DESC
                LIMIT 1
            ''', (partner_id,))
            partner_profile_image = cursor.fetchone()

            # 相手のユーザー情報を構築
            partner_user = {
                "user_id": partner_user_info["user_id"] if partner_user_info else None,
                "name": partner_user_info["name"] if partner_user_info else "",
                "location": partner_user_info["location"] if partner_user_info else "",
                "old": partner_user_info["old"] if partner_user_info else 0,
                "age": partner_user_info["age"] if partner_user_info else 0,
                "shop_name": partner_user_info["shop_name"] if partner_user_info else "",
                "shop_url": partner_user_info["shop_url"] if partner_user_info else "",
                "reasen": partner_user_info["reasen"] if partner_user_info else "",
                "profile_image": partner_profile_image['image_url'] if partner_profile_image else "",
                "tags": []
            }

            # タグの処理
            partner_user['tags'] = json.loads(partner_user_info['tag']) if partner_user_info and partner_user_info['tag'] else []
            
            # 相手の商品一覧を取得
            cursor.execute('''
                SELECT 
                    items.item_id,
                    items.title,
                    items.description,
                    items.type,
                    items.brand,
                    items.uploaded_at,
                    items.user_id,
                    items.status
                FROM items
                WHERE items.user_id = %s
                ORDER BY items.uploaded_at DESC
            ''', (buyer_id,))
            
            partner_items = cursor.fetchall()
            
            # 各商品の画像を取得
            for item in partner_items:
                cursor.execute('''
                    SELECT image_url 
                    FROM item_images 
                    WHERE item_id = %s
                    ORDER BY uploaded_at ASC
                ''', (item['item_id'],))
                
                images = cursor.fetchall()
                item['images'] = [img['image_url'] for img in images]
                    
                status = item['status']
                if status == 'exchanged':
                    item['trade_status_flag'] = 2
                elif status == 'trading':
                    item['trade_status_flag'] = 1
                elif status == 'available':
                    item['trade_status_flag'] = 0
                
                # JSON型フィールドをパース
                try:
                    item['type'] = json.loads(item['type']) if item['type'] else []
                    item['brand'] = json.loads(item['brand']) if item['brand'] else []
                except:
                    item['type'] = []
                    item['brand'] = []
                    
            return jsonify({
                "partner_items": partner_items, 
                "partner_user": partner_user,
                "result": True
            }), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "相手商品取得中にエラーが発生しました",
            "result": False
        }), 500

# 交換商品選択エンドポイント
@trades_bp.route('/select_exchange_item', methods=['POST'])
def select_exchange_item():
    data = request.json
    trade_id = data.get('trade_id')
    selected_item_id = data.get('selected_item_id')
    user_id = data.get('user_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 取引情報を取得
            cursor.execute('''
                SELECT * FROM trades WHERE trade_id = %s
            ''', (trade_id,))
            trade = cursor.fetchone()
            
            if not trade:
                return jsonify({"error": "取引が見つかりません"}), 404
            
            # 選択した商品の所有者確認
            cursor.execute('''
                SELECT user_id, status FROM items WHERE item_id = %s
            ''', (selected_item_id,))
            item_owner = cursor.fetchone()
            
            if not item_owner:
                return jsonify({"error": "商品が見つかりません"}), 404
                
            # 自分自身の商品を選ぼうとしたら拒否する（相手の商品を選ばせたいので）
            if item_owner['user_id'] == int(user_id):
                return jsonify({"error": "自分の商品は選択できません"}), 403
                
            # 既に取引中でないか確認
            if item_owner['status'] == 'trading':
                return jsonify({"error": "この商品は既に取引中です"}), 400
            
            # 交換商品として記録
            cursor.execute('''
                UPDATE trades 
                SET seller_exchange_item_id = %s , status = "purchased"
                WHERE trade_id = %s
            ''', (selected_item_id, trade_id))
            
            # 選択した商品のステータスを更新
            cursor.execute('''
                UPDATE items 
                SET status = 'trading' 
                WHERE item_id = %s
            ''', (selected_item_id,))
            
            # チャットに自動メッセージ
            cursor.execute('''
                INSERT INTO trade_messages (trade_id, sender_id, message)
                VALUES (%s, %s, %s)
            ''', (trade_id, user_id, f"交換商品を選択しました"))
            
            conn.commit()

            return jsonify({"result": True, "message": "交換商品を選択しました"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 発送情報保存（シンプル版）
@trades_bp.route('/save_shipping_info_with_item', methods=['POST'])
def save_shipping_info_with_item():
    data = request.json
    trade_id = data.get('trade_id')
    sender_user_id = data.get('sender_user_id')
    tracking_number = data.get('tracking_number')
    shipping_company = data.get('shipping_company')

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引情報を取得
            cursor.execute('''
                SELECT * FROM trades WHERE trade_id = %s
            ''', (trade_id,))
            trade = cursor.fetchone()

            if not trade:
                return jsonify({"error": "取引が見つかりません"}), 404

            # 既存の発送情報があるかチェック
            cursor.execute('''
                SELECT shipping_id FROM shipping_info
                WHERE trade_id = %s AND sender_user_id = %s
            ''', (trade_id, sender_user_id))

            existing = cursor.fetchone()

            if existing:
                # 更新
                cursor.execute('''
                    UPDATE shipping_info
                    SET tracking_number = %s, shipping_company = %s
                    WHERE trade_id = %s AND sender_user_id = %s
                ''', (tracking_number, shipping_company, trade_id, sender_user_id))
            else:
                # 新規作成
                cursor.execute('''
                    INSERT INTO shipping_info (trade_id, sender_user_id, tracking_number, shipping_company)
                    VALUES (%s, %s, %s, %s)
                ''', (trade_id, sender_user_id, tracking_number, shipping_company))

                # チャットに発送メッセージを自動送信
                cursor.execute('''
                    INSERT INTO trade_messages (trade_id, sender_id, message)
                    VALUES (%s, %s, %s)
                ''', (trade_id, sender_user_id, f"商品を発送しました。\n配送会社: {shipping_company}\n追跡番号: {tracking_number}"))

            # 取引タイプに応じて発送完了判定を変える
            if trade.get('trade_type') == 'purchase':
                # 購入フローの場合: Seller(seller_id)が発送したら即座にshippedステータスへ
                if int(sender_user_id) == int(trade['seller_id']):
                    cursor.execute('''
                        UPDATE trades
                        SET status = 'shipped'
                        WHERE trade_id = %s
                    ''', (trade_id,))
                    print(f"✅ 購入フロー: Sellerが発送完了 → status='shipped'")
            else:
                # 交換フローの場合: 両者が発送情報を入力したかチェック
                cursor.execute('''
                    SELECT COUNT(DISTINCT sender_user_id) as count
                    FROM shipping_info
                    WHERE trade_id = %s
                ''', (trade_id,))

                count_result = cursor.fetchone()

                # 両者が発送したらステータスを更新
                if count_result['count'] == 2:
                    cursor.execute('''
                        UPDATE trades
                        SET status = 'shipped'
                        WHERE trade_id = %s
                    ''', (trade_id,))
                    print(f"✅ 交換フロー: 両者が発送完了 → status='shipped'")

            conn.commit()
   
            # 交換商品情報を含めて返す
            cursor.execute('''
                SELECT seller_exchange_item_id, buyer_exchange_item_id
                FROM trades
                WHERE trade_id = %s
            ''', (trade_id,))
            exchange_info = cursor.fetchone()

            return jsonify({
                'result': True, 
                'message': '発送情報を保存しました',
                'exchange_info': exchange_info
            })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 取引完了時の処理（削除＋アーカイブ方式）
@trades_bp.route('/complete_exchange', methods=['POST'])
def complete_exchange():
    
    """両者が商品を受け取り、交換を完了"""
    data = request.json
    trade_id = data.get('trade_id')
    user_id = data.get('user_id')  # 実行者のuser_id
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 取引情報を取得
            cursor.execute('''
                SELECT * FROM trades WHERE trade_id = %s
            ''', (trade_id,))
            trade = cursor.fetchone()
            
            if not trade:
                return jsonify({"error": "取引が見つかりません"}), 404
            
            # 実行者が交換受理者（seller）であることを確認
            if int(user_id) != trade['seller_id']:
                return jsonify({"error": "取引を完了できるのは交換受理者のみです"}), 403
            
            # 両者が商品を選択しているか確認
            if not trade.get('seller_exchange_item_id') or not trade.get('buyer_exchange_item_id'):
                return jsonify({"error": "両者が交換商品を選択していません"}), 400
            
            # 両者が受取確認済みか確認
            cursor.execute('''
                SELECT COUNT(DISTINCT user_id) as count 
                FROM trade_confirmations 
                WHERE trade_id = %s
            ''', (trade_id,))
            
            count_result = cursor.fetchone()
            if count_result['count'] < 2:
                return jsonify({"error": "両者の受取確認が必要です"}), 400
            
            # ステータスを完了に更新（アーカイブ処理のため）
            cursor.execute('''
                UPDATE trades 
                SET status = 'completed' 
                WHERE trade_id = %s
            ''', (trade_id,))
            
            # アーカイブ処理の呼び出し
            archiver = TradeArchiver(conn)
            archive_trade_id = archiver.archive_trade(trade_id)

            # ===== ここから削除処理 =====
            
            # 1. 関連する全データの削除（順序重要：外部キー制約を考慮）
            
            # trade_exchanges の削除を追加（商品削除前に必須）
            cursor.execute('''
                DELETE FROM trade_exchanges WHERE trade_id = %s
            ''', (trade_id,))
            
            # trade_messages の削除
            cursor.execute('''
                DELETE FROM trade_messages WHERE trade_id = %s
            ''', (trade_id,))
            
            # trade_confirmations の削除
            cursor.execute('''
                DELETE FROM trade_confirmations WHERE trade_id = %s
            ''', (trade_id,))
            
            # shipping_info の削除
            cursor.execute('''
                DELETE FROM shipping_info WHERE trade_id = %s
            ''', (trade_id,))
            
            cursor.execute('''
                DELETE FROM trades WHERE trade_id = %s
            ''', (trade_id,))

            # 2. 交換に使用された商品の削除
            items_to_delete = [trade['item_id']]
            if trade['seller_exchange_item_id']:
                items_to_delete.append(trade['seller_exchange_item_id'])
            if trade['buyer_exchange_item_id']:
                items_to_delete.append(trade['buyer_exchange_item_id'])
            
            # 重複を排除
            items_to_delete = list(set(items_to_delete))
            
            for item_id in items_to_delete:
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
            
            # 完了メッセージ（削除前にアーカイブに保存済み）
            conn.commit()

            return jsonify({
                "result": True, 
                "message": "交換が完了しました。取引データはアーカイブに保存されました。", 
                "archive_trade_id": archive_trade_id
            })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 選択された交換商品の情報を取得
@trades_bp.route('/get_exchange_items', methods=['GET'])
def get_exchange_items():
    trade_id = request.args.get('trade_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 取引情報と交換商品情報を取得
            cursor.execute('''
                SELECT 
                    t.*,
                    si1.title as seller_item_title,
                    si1.brand as seller_item_brand,
                    bi1.title as buyer_item_title,
                    bi1.brand as buyer_item_brand
                FROM trades t
                LEFT JOIN items si1 ON t.seller_exchange_item_id = si1.item_id
                LEFT JOIN items bi1 ON t.buyer_exchange_item_id = bi1.item_id
                WHERE t.trade_id = %s
            ''', (trade_id,))
            
            trade_info = cursor.fetchone()
            
            if not trade_info:
                return jsonify({"error": "取引が見つかりません"}), 404
            
            # 交換商品の画像も取得
            result = {
                'seller_exchange_item': None,
                'buyer_exchange_item': None
            }
            
            if trade_info['seller_exchange_item_id'] is not None:
                cursor.execute('''
                    SELECT image_url FROM item_images 
                    WHERE item_id = %s 
                    ORDER BY uploaded_at ASC LIMIT 1
                ''', (trade_info['seller_exchange_item_id'],))
                seller_img = cursor.fetchone()
                
                result['seller_exchange_item'] = {
                    'item_id': trade_info['seller_exchange_item_id'],
                    'title': trade_info['seller_item_title'],
                    'brand': json.loads(trade_info['seller_item_brand']) if trade_info['seller_item_brand'] else [],
                    'image': seller_img['image_url'] if seller_img else None
                }

            if trade_info['buyer_exchange_item_id'] is not None:
                cursor.execute('''
                    SELECT image_url FROM item_images 
                    WHERE item_id = %s 
                    ORDER BY uploaded_at ASC LIMIT 1
                ''', (trade_info['buyer_exchange_item_id'],))
                buyer_img = cursor.fetchone()

                result['buyer_exchange_item'] = {
                    'item_id': trade_info['buyer_exchange_item_id'],
                    'title': trade_info['buyer_item_title'],
                    'brand': json.loads(trade_info['buyer_item_brand']) if trade_info['buyer_item_brand'] else [],
                    'image': buyer_img['image_url'] if buyer_img else None
                }

            return jsonify({
                'result': True,
                'exchange_items': result
            })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 交換申請した人の商品情報
@trades_bp.route('/getChatItemDetail', methods=['POST'])
def get_chat_item_detail():
    trade_id = request.json.get('trade_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            # 取引情報と商品の基本情報を取得
            cursor.execute('''
                SELECT
                    trades.trade_id,
                    trades.status,
                    trades.buyer_id,
                    trades.seller_id,
                    trades.trade_type,
                    trades.purchase_price,
                    trades.is_price_agreed_seller,
                    trades.is_price_agreed_buyer,
                    trades.is_buyer_confirmed,
                    items.item_id,
                    items.title,
                    items.description,
                    items.type,
                    items.brand,
                    items.uploaded_at,
                    items.user_id
                FROM trades
                JOIN items ON items.item_id = trades.item_id
                WHERE trades.trade_id = %s
            ''', (trade_id,))
            trade_data = cursor.fetchone()

            if not trade_data:
                return jsonify({"error": "データがありません。"}), 404

            # 商品情報の構築
            item_data = {
                "trade_id": trade_data["trade_id"],
                "status": trade_data["status"],
                "buyer_id": trade_data["buyer_id"],
                "seller_id": trade_data["seller_id"],
                "item_id": trade_data["item_id"],
                "title": trade_data["title"],
                "description": trade_data["description"],
                "type": trade_data["type"],
                "brand": trade_data["brand"],
                "uploaded_at": trade_data["uploaded_at"],
                "user_id": trade_data["user_id"],
                # 購入フロー用のフィールド
                "trade_type": trade_data["trade_type"],
                "purchase_price": float(trade_data["purchase_price"]) if trade_data["purchase_price"] else None,
                "is_price_agreed_seller": trade_data["is_price_agreed_seller"],
                "is_price_agreed_buyer": trade_data["is_price_agreed_buyer"],
                "is_buyer_confirmed": trade_data["is_buyer_confirmed"],
            }

            print(f"📦 getChatItemDetail: trade_id={trade_id}, trade_type={item_data['trade_type']}, status={item_data['status']}, price={item_data['purchase_price']}")

            # 商品の画像をすべて取得
            cursor.execute('''
                SELECT image_url
                FROM item_images
                WHERE item_id = %s
                ORDER BY uploaded_at ASC
            ''', (item_data["item_id"],))
            item_images = cursor.fetchall()

            item_data["images"] = [img['image_url'] for img in item_images]

            # 商品投稿者（申請者）のユーザー情報を取得
            cursor.execute('''
                SELECT 
                    users.user_id,
                    users.name,
                    users.location,
                    users.old,
                    users.age,
                    users.shop_name,
                    users.shop_url,
                    users.reasen,
                    tags.tag
                FROM users
                LEFT JOIN tags ON tags.user_id = users.user_id
                WHERE users.user_id = %s
            ''', (item_data["buyer_id"],))
            user_info = cursor.fetchone()
            
            if not user_info:
                return jsonify({"error": "ユーザー情報が見つかりません", "buyer_id": item_data["buyer_id"]}), 404
            
            # ユーザーのプロフィール画像を取得
            cursor.execute('''
                SELECT image_url
                FROM profile_images
                WHERE user_id = %s
                ORDER BY uploaded_at DESC
                LIMIT 1
            ''', (item_data["buyer_id"],))
            profile_image = cursor.fetchone()
            
            # ユーザー情報の構築
            user_data = {
                "user_id": user_info["user_id"] if user_info else None,
                "name": user_info["name"] if user_info else "",
                "location": user_info["location"] if user_info else "",
                "old": user_info["old"] if user_info else 0,
                "age": user_info["age"] if user_info else 0,
                "shop_name": user_info["shop_name"] if user_info else "",
                "shop_url": user_info["shop_url"] if user_info else "",
                "reasen": user_info["reasen"] if user_info else "",
                "profile_image": profile_image['image_url'] if profile_image else "",
                "tags": json.loads(user_info['tag']) if user_info and user_info['tag'] else [],
            }
            
            # brand/type を JSON に変換
            for key in ["brand", "type"]:
                try:
                    item_data[key] = json.loads(item_data[key]) if item_data[key] else []
                except:
                    item_data[key] = []

            return jsonify({
                "item": item_data, 
                "user": user_data,
                "result": True
            }), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "商品データ取得中にエラーが発生しました",
            "result": False
        }), 500

# WebSocketハンドラーを登録する関数
def register_socketio_handlers(socketio):
    """WebSocketハンドラーを登録"""
    
    @socketio.on('connect')
    def handle_connect():
        print('クライアントがWebSocketで接続しました', request.sid, flush=True)

    @socketio.on('join')
    def handle_join(data):
        room = data['room']
        join_room(room)
        print(f'Client joined room: {room}', flush=True)

    @socketio.on('send_message')
    def handle_send_message(data):
        room = data['room']
        message = data['message']
        trade_id = data['trade_id']
        sender_id = data['sender_id']
        
        # DBに保存
        conn = None
        cursor = None
        try:
            conn = get_db_connection_legacy()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                INSERT INTO trade_messages (trade_id, sender_id, message)
                VALUES (%s, %s, %s)
            ''', (trade_id, sender_id, message))
            conn.commit()
            
            # 最新のプロフィール画像を取得
            cursor.execute('''
                SELECT image_url 
                FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC 
                LIMIT 1
            ''', (sender_id,))
            image_row = cursor.fetchone()
            image_url = image_row['image_url'] if image_row else ""

            emit('receive_message', {
                'message': message,
                'sender_id': sender_id,
                'sender_image_url': image_url
            }, to=room)
        except mysql.connector.Error as err:
            print(f"WebSocket error: {err}", flush=True)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected:', request.sid)

    @socketio.on('join_thread')
    def handle_join_thread():
        join_room('thread_room')