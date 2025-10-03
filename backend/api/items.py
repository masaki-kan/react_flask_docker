from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from utils.db_utils import get_db_connection
from utils.image_utils import upload_image_to_s3, delete_multiple_images_from_s3
import json
import mysql.connector
import os

items_bp = Blueprint('items', __name__, url_prefix='/api')

# 自分以外の商品一覧取得
@items_bp.route('/getUserItems' ,methods=['POST'])
def getUserItems():
    user_id = request.json.get('user_id',None )

    # 自分以外の商品情報を取得
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
            cursor.execute('''
                SELECT 
                    items.item_id,
                    items.user_id,
                    items.title,
                    items.description,
                    items.type,
                    items.brand,
                    items.uploaded_at,
                    items.status,
                    users.name AS seller_name
                FROM items
                LEFT JOIN users ON items.user_id = users.user_id
                WHERE items.user_id != %s
                AND users.type = 1  
                ORDER BY items.uploaded_at ASC
            ''', (user_id,))


            item_rows = cursor.fetchall()
            items = []
            brand_set = {}  # key を重複排除の基準にする

            for item in item_rows:
                # ブランド（JSON → リスト）
                try:
                    brands = json.loads(item['brand']) if item['brand'] else []
                    if isinstance(brands, dict):  # 単一のブランドオブジェクト
                        brands = [brands]
                    elif not isinstance(brands, list):
                        brands = []
                except Exception:
                    brands = []

                item['brand'] = brands

                for brand in brands:
                    if isinstance(brand, dict):
                        key = str(brand.get('key'))
                        name = brand.get('name')
                        if key and name and key not in brand_set:
                            brand_set[key] = name

                # 画像取得（全件）
                cursor.execute('''
                    SELECT image_url 
                    FROM item_images 
                    WHERE item_id = %s
                    ORDER BY uploaded_at ASC
                ''', (item['item_id'],))

                images = cursor.fetchall()
                item['images'] = [img['image_url'] for img in images]
                try:
                    item['type'] = json.loads(item['type']) if item['type'] else []
                except Exception:
                    item['type'] = []

                # プロフィール画像取得
                cursor.execute('''
                    SELECT image_url 
                    FROM profile_images 
                    WHERE user_id = %s
                    ORDER BY uploaded_at DESC
                    LIMIT 1
                ''', (item['user_id'],))
                profile_img = cursor.fetchone()
                item['profile_image'] = profile_img['image_url'] if profile_img else ""
                
                status = item['status']
                if status == 'exchanged':
                    item['trade_status_flag'] = 2
                elif status == 'trading':
                    item['trade_status_flag'] = 1
                elif status == 'available':
                    item['trade_status_flag'] = 0

                items.append(item)

            brand_list = [{'key': k, 'name': v} for k, v in brand_set.items()]

            return jsonify({
                "items": items,
                "brands": brand_list,
                "result": True
            }), 200

    except mysql.connector.Error as err:
        return jsonify({
            "error": "商品データ取得中にエラーが発生しました",
            "result": False
        }), 500
        
# 商品削除
@items_bp.route('/deleteUserItem', methods=['POST'])
def deleteUserItem():
    item_id = request.json.get('item_id', None)
    my_user_id = request.json.get('my_user_id', None)
        
    if not item_id or not my_user_id:
        return jsonify({"error": "item_id と my_user_id は必須です"}), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 1. まず、削除しようとしているアイテムが本当にそのユーザーのものか確認、画像URLも取得
            cursor.execute('''
                SELECT user_id, images FROM items
                WHERE item_id = %s
            ''', (item_id,))
            item_data = cursor.fetchone()
            
            if not item_data:
                return jsonify({"error": "指定されたアイテムが見つかりません"}), 404

            if int(item_data['user_id']) != int(my_user_id):
                return jsonify({"error": "他のユーザーのアイテムは削除できません"}), 403

            # 削除対象の画像URLを準備
            image_urls = []
            if item_data['images']:
                try:
                    images_data = json.loads(item_data['images'])
                    if isinstance(images_data, list):
                        image_urls = images_data
                except (json.JSONDecodeError, TypeError):
                    # 旧形式または不正なデータの場合は空リストとして処理
                    pass
            
            # 2. アクティブな取引（pending, purchased, shipped）があるか確認
            cursor.execute('''
                SELECT trade_id, status FROM trades 
                WHERE (item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s)
                AND status IN ('pending', 'purchased', 'shipped')
            ''', (item_id, item_id, item_id))
            active_trades = cursor.fetchall()
            
            if active_trades:
                return jsonify({
                    "error": "このアイテムには進行中の取引があるため削除できません", 
                    "active_trades": active_trades
                }), 400
            
            # 3. 関連する全ての取引IDを取得
            cursor.execute('''
                SELECT DISTINCT trade_id FROM trades 
                WHERE item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s
            ''', (item_id, item_id, item_id))
            related_trades = cursor.fetchall()
            trade_ids = [t['trade_id'] for t in related_trades]
            
            # 4. 関連データの削除（順序重要：外部キー制約を考慮）
            deleted_counts = {}
            
            if trade_ids:
                # trade_exchanges の削除（先に削除が必要）
                cursor.execute('''
                    DELETE FROM trade_exchanges 
                    WHERE offered_item_id = %s OR received_item_id = %s
                ''', (item_id, item_id))
                deleted_counts['trade_exchanges'] = cursor.rowcount
                
                # trade_messages の削除
                placeholders = ','.join(['%s'] * len(trade_ids))
                cursor.execute(f'''
                    DELETE FROM trade_messages 
                    WHERE trade_id IN ({placeholders})
                ''', trade_ids)
                deleted_counts['trade_messages'] = cursor.rowcount
                
                # trade_confirmations の削除
                cursor.execute(f'''
                    DELETE FROM trade_confirmations 
                    WHERE trade_id IN ({placeholders})
                ''', trade_ids)
                deleted_counts['trade_confirmations'] = cursor.rowcount
                
                # shipping_info の削除
                cursor.execute(f'''
                    DELETE FROM shipping_info 
                    WHERE trade_id IN ({placeholders})
                ''', trade_ids)
                deleted_counts['shipping_info'] = cursor.rowcount
                
                # trades の削除
                cursor.execute('''
                    DELETE FROM trades 
                    WHERE item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s
                ''', (item_id, item_id, item_id))
                deleted_counts['trades'] = cursor.rowcount
            
            # likes の削除
            cursor.execute('''
                DELETE FROM likes 
                WHERE item_id = %s
            ''', (item_id,))
            deleted_counts['likes'] = cursor.rowcount
            
            # item_images の削除
            cursor.execute('''
                DELETE FROM item_images 
                WHERE item_id = %s
            ''', (item_id,))
            deleted_counts['item_images'] = cursor.rowcount
            
            # 最後に items 本体を削除
            cursor.execute('''
                DELETE FROM items 
                WHERE item_id = %s
            ''', (item_id,))
            deleted_counts['items'] = cursor.rowcount
            
            conn.commit()

            # データベース削除が成功した後に画像ファイルを削除
            if image_urls:
                try:
                    if os.getenv('STORAGE_TYPE') == 's3':
                        # S3から画像削除
                        delete_multiple_images_from_s3(image_urls)
                        print(f"✅ S3から{len(image_urls)}個の画像を削除しました")
                    else:
                        # ローカルファイルシステムから画像削除
                        for url in image_urls:
                            if url.startswith('/uploads/'):
                                file_path = os.path.join(os.getcwd(), url.lstrip('/'))
                                if os.path.exists(file_path):
                                    os.remove(file_path)
                                    print(f"✅ ローカルファイルを削除: {file_path}")
                except Exception as e:
                    # 画像削除のエラーはログに記録するが、処理は継続
                    print(f"⚠️ 画像削除エラー: {e}")

            return jsonify({
                "result": True,
                "message": "アイテムと関連データを削除しました",
                "item_id": item_id,
                "deleted_counts": deleted_counts,
                "deleted_images": len(image_urls) if image_urls else 0
            }), 200
        
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
        return jsonify({
            "error": f"商品データ削除中にエラーが発生しました: {str(err)}",
            "result": False
        }), 500
    except Exception as e:
        print(f"General Error: {e}")
        return jsonify({
            "error": f"予期しないエラーが発生しました: {str(e)}",
            "result": False
        }), 500

# 商品お気に入り
@items_bp.route('/itemLike' ,methods=['POST'])
def itemLike():
    item_id = request.json.get('item_id',None )
    my_user_id = request.json.get('my_user_id',None )
    
    if not item_id or not my_user_id:
        return jsonify({"result": False, "error": "Missing item_id or my_user_id"}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            # 既に「いいね」されているか確認
            cursor.execute('''
                SELECT * FROM likes
                WHERE user_id = %s AND item_id = %s
            ''', (my_user_id, item_id))
            like = cursor.fetchone()
            
            if like:
                # 「いいね」を外す
                cursor.execute('''
                    DELETE FROM likes
                    WHERE user_id = %s AND item_id = %s
                ''', (my_user_id, item_id))
                
                conn.commit()
                
                return jsonify({"result": True, "liked": False , "message" : "お気に入り解除しました。"}), 200
            else:
                # 「いいね」を追加
                cursor.execute('''
                    INSERT INTO likes (user_id, item_id)
                    VALUES (%s, %s)
                ''', (my_user_id, item_id))
                
                conn.commit()
 
                return jsonify({"result": True, "liked": True, "message" : "お気に入り保存しました。"}), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "商品へのいいね中にエラーが発生しました",
            "result": False
        }), 500
