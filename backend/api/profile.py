from flask import Blueprint, jsonify ,request
import os
from utils.db_utils import get_db_connection
import mysql.connector
import json
from utils.image_utils import s3_client, upload_image_to_s3, delete_multiple_images_from_s3
from werkzeug.utils import secure_filename
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads') 

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

# JWT認証済みユーザープロフィール取得
@profile_bp.route('/user/profile', methods=['GET'])
@jwt_required()
def get_authenticated_user_profile():
    """
    JWT認証済みユーザーのプロフィール情報を取得
    """
    try:
        current_user_email = get_jwt_identity()
        
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT user_id, name, email, type, plan, location, age, old, shop_name, shop_url, reasen, created_at, is_deleted
                FROM users 
                WHERE email = %s
            """, (current_user_email,))
            user_data = cursor.fetchone()
            
            if not user_data or user_data['is_deleted']:
                return jsonify({
                    'success': False,
                    'message': 'ユーザーが見つかりません'
                }), 404
            
            # プロフィール画像を取得
            cursor.execute("""
                SELECT image_url 
                FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC 
                LIMIT 1
            """, (user_data['user_id'],))
            image_data = cursor.fetchone()
            
            # タグを取得
            cursor.execute("""
                SELECT tag 
                FROM tags 
                WHERE user_id = %s
            """, (user_data['user_id'],))
            tag_data = cursor.fetchone()
            
            # レスポンス用データ構築
            profile_data = {
                'user_id': user_data['user_id'],
                'name': user_data['name'],
                'email': user_data['email'],
                'type': 'admin' if user_data['type'] == 0 else 'user',  # INT型を文字列に変換
                'plan': user_data['plan'],
                'location': user_data['location'],
                'age': user_data['age'],
                'old': user_data['old'],
                'shop_name': user_data['shop_name'],
                'shop_url': user_data['shop_url'],
                'reasen': user_data['reasen'],
                'profile_image': image_data['image_url'] if image_data else None,
                'created_at': user_data['created_at'].isoformat() if user_data['created_at'] else None,
            }
            
            # タグの処理
            if tag_data and tag_data['tag']:
                try:
                    profile_data['tags'] = json.loads(tag_data['tag'])
                except:
                    profile_data['tags'] = []
            else:
                profile_data['tags'] = []
            
            return jsonify({
                'success': True,
                'profile': profile_data
            }), 200
            
    except mysql.connector.Error as err:
        return jsonify({
            'success': False,
            'message': 'データベースエラーが発生しました'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'プロフィール取得に失敗しました'
        }), 500

# JWT認証済み管理者プロフィール取得
@profile_bp.route('/admin/profile', methods=['GET'])
@jwt_required()
def get_authenticated_admin_profile():
    """
    JWT認証済み管理者のプロフィール情報を取得
    """
    try:
        current_user_email = get_jwt_identity()
        
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT user_id, name, email, type, plan, location, age, old, shop_name, shop_url, reasen, created_at, is_deleted
                FROM users 
                WHERE email = %s AND type = 0
            """, (current_user_email,))
            admin_data = cursor.fetchone()
            
            if not admin_data or admin_data['is_deleted'] or admin_data['type'] != 0:
                return jsonify({
                    'success': False,
                    'message': '管理者が見つかりません'
                }), 404
            
            # プロフィール画像を取得
            cursor.execute("""
                SELECT image_url 
                FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC 
                LIMIT 1
            """, (admin_data['user_id'],))
            image_data = cursor.fetchone()
            
            # レスポンス用データ構築
            profile_data = {
                'user_id': admin_data['user_id'],
                'name': admin_data['name'],
                'email': admin_data['email'],
                'type': 'admin' if admin_data['type'] == 0 else 'user',  # INT型を文字列に変換
                'plan': admin_data['plan'],
                'location': admin_data['location'],
                'age': admin_data['age'],
                'old': admin_data['old'],
                'shop_name': admin_data['shop_name'],
                'shop_url': admin_data['shop_url'],
                'reasen': admin_data['reasen'],
                'profile_image': image_data['image_url'] if image_data else None,
                'created_at': admin_data['created_at'].isoformat() if admin_data['created_at'] else None,
            }
            
            return jsonify({
                'success': True,
                'profile': profile_data
            }), 200
            
    except mysql.connector.Error as err:
        return jsonify({
            'success': False,
            'message': 'データベースエラーが発生しました'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': '管理者プロフィール取得に失敗しました'
        }), 500

# プロフィール取得
@profile_bp.route('/getProfile', methods=['GET'])
def getMyProfile():
    user_id = request.args.get('id')
    my_user_id = request.args.get('my_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 1. 基本的なユーザー情報を最初に返す
            cursor.execute('''
                SELECT 
                    u.user_id, u.name, u.location, u.old, u.age, u.email, 
                    u.shop_name, u.shop_url, u.reasen, u.plan, u.type,
                    u.is_deleted , u.deleted_at,
                    pi.image_url as image,
                    t.tag as tags
                FROM users u
                LEFT JOIN profile_images pi ON u.user_id = pi.user_id 
                    AND pi.uploaded_at = (
                        SELECT MAX(uploaded_at) 
                        FROM profile_images 
                        WHERE user_id = u.user_id
                    )
                LEFT JOIN tags t ON u.user_id = t.user_id
                WHERE u.user_id = %s
            ''', (user_id,))
            
            user_data = cursor.fetchone()
            
            if not user_data:
                return jsonify({"error": "ユーザーが存在しません"}), 404
                
            # タグの処理
            if user_data['tags']:
                try:
                    user_data['tags'] = json.loads(user_data['tags'])
                except:
                    user_data['tags'] = []
            else:
                user_data['tags'] = []
                
            # いいねを別クエリで取得
            cursor.execute('''
                SELECT item_id FROM likes WHERE user_id = %s
            ''', (user_id,))
            user_data['likes'] = [like['item_id'] for like in cursor.fetchall()]
            
            # フォロー状態を確認（my_user_idが存在する場合のみ）
            user_data['is_following'] = False
            user_data['is_followed'] = False
            
            if my_user_id and my_user_id != user_id:
                # 自分がこのユーザーをフォローしているか
                cursor.execute('''
                    SELECT 1 FROM follows 
                    WHERE follower_id = %s AND followed_id = %s
                    LIMIT 1
                ''', (my_user_id, user_id))
                user_data['is_following'] = cursor.fetchone() is not None
                
                # このユーザーが自分をフォローしているか
                cursor.execute('''
                    SELECT 1 FROM follows 
                    WHERE follower_id = %s AND followed_id = %s
                    LIMIT 1
                ''', (user_id, my_user_id))
                user_data['is_followed'] = cursor.fetchone() is not None
            
            # フォロー・フォロワー数も取得
            cursor.execute('''
                SELECT 
                    (SELECT COUNT(*) FROM follows WHERE follower_id = %s) as following_count,
                    (SELECT COUNT(*) FROM follows WHERE followed_id = %s) as followers_count
            ''', (user_id, user_id))
            follow_counts = cursor.fetchone()
            
            user_data['following_count'] = follow_counts['following_count']
            user_data['followers_count'] = follow_counts['followers_count']
            
            # user_idを文字列に変換（フロントエンドとの整合性）
            user_data['user_id'] = str(user_data['user_id'])
            
            # 基本情報だけ先に返す
            return jsonify({
                "profile": user_data,
                "items": []  # 商品は別APIで取得
            }), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": "エラーが発生しました"}), 500

#プロフィール　情報の更新
@profile_bp.route('/postStoreProfile' , methods=['POST'])
def postStoreProfile():
    user_data = request.json.get('userData', {})
    user_id = user_data.get('id')
    age = user_data.get('age')
    image_url = user_data.get('image')
    name = user_data.get('name')
    location = user_data.get('location')
    tags = user_data.get('tag',[])
    tag_json = json.dumps(tags, ensure_ascii=False)
    old = user_data.get('old')
    shop_name = user_data.get('favoriteShop', {}).get("name")
    shop_url = user_data.get('favoriteShop', {}).get("url")
    reasen = user_data.get("reasen")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
            # users テーブルを更新（INSERT or UPDATE）
            cursor.execute('''
                UPDATE users SET 
                    name = %s,
                    location = %s,
                    old = %s,
                    age = %s,
                    shop_name = %s,
                    shop_url = %s,
                    reasen = %s,
                    uploaded_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            ''', (name, location, old, age, shop_name, shop_url, reasen, user_id))
            
            # profile_images テーブルに挿入
            cursor.execute("SELECT profile_image_id FROM profile_images WHERE user_id = %s", (user_id,))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute('''
                    UPDATE profile_images 
                    SET image_url = %s, uploaded_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s
                ''', (image_url, user_id))
            else:
                cursor.execute('''
                    INSERT INTO profile_images (user_id, image_url) 
                    VALUES (%s, %s)
                ''', (user_id, image_url))
                    
            # タグ テーブルに挿入
            cursor.execute("SELECT tag_id FROM tags WHERE user_id = %s", (user_id,))
            tags_existing = cursor.fetchone()

            if tags_existing:
                cursor.execute('''
                    UPDATE tags SET tag = %s, uploaded_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s
                ''', (tag_json, user_id))
            else:
                cursor.execute('''
                    INSERT INTO tags (user_id, tag)
                    VALUES (%s, %s)
                ''', (user_id, tag_json))
                    
            conn.commit()
            return jsonify({"message": "プロフィール更新しました",
                            "result" : True}), 201
    except mysql.connector.Error as err:
        return jsonify({
            "error": "プロフィール更新中にエラーが発生しました",
            "result": False
        }), 500

# 商品取得用のエンドポイント
@profile_bp.route('/getProfileItems', methods=['GET'])
def getProfileItems():
    user_id = request.args.get('id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # バッチで商品と画像を取得
            cursor.execute('''
                SELECT item_id, title, description, type, brand,uploaded_at, status
                FROM items 
                WHERE user_id = %s
                ORDER BY uploaded_at DESC
            ''', (user_id,))
            
            items = cursor.fetchall()
        
            # データ処理
            for item in items:
                # 画像取得（昇順）
                cursor.execute('''
                    SELECT image_url 
                    FROM item_images 
                    WHERE item_id = %s
                    ORDER BY uploaded_at ASC
                ''', (item['item_id'],))
                item_images = cursor.fetchall()
                item['images'] = [r['image_url'] for r in item_images]
                    
                # JSON型の処理
                for field in ['type', 'brand']:
                    try:
                        item[field] = json.loads(item[field]) if item[field] else []
                    except:
                        item[field] = []
                        
                # ステータスフラグ
                status = item['status']
                if status == 'exchanged':
                    item['trade_status_flag'] = 2
                elif status == 'trading':
                    item['trade_status_flag'] = 1
                else:
                    item['trade_status_flag'] = 0
                    
            return jsonify({"items": items}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 商品情報　更新
@profile_bp.route('/postStoreProfileItem' ,methods=['POST'] )
def postStoreProfileItem():
    item_id = request.form.get("itemId")
    user_id = request.form.get("userId")
    title = request.form.get("title")
    description = request.form.get("description")
    type = json.loads(request.form.get("type", "[]"))
    brand = json.loads(request.form.get("brand", "[]"))
    mode = request.form.get("dateUpChange")

    type_json = json.dumps(type, ensure_ascii=False)
    brand_json = json.dumps(brand, ensure_ascii=False)

    # 画像ファイル取得（複数）
    image_files = request.files.getlist("images")
    # 既存の画像URL（編集時）
    existing_images = []
    for key in request.form:
        if key.startswith('existing_images['):
            existing_images.append(request.form[key])
        
    image_urls = []
        
    # 新しい画像の処理
    for file in image_files:
        if os.getenv('STORAGE_TYPE') == 's3' and s3_client:
            try:
                # S3にアップロード
                url = upload_image_to_s3(file, f'items/{user_id}')
                image_urls.append(url)
            except Exception as e:
                print(f"S3 upload error: {e}")
                # エラー時の処理
                return jsonify({"error": "画像アップロードに失敗しました"}), 500
        else:
            # ローカル保存（開発環境）
            filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
            filepath = os.path.join(UPLOAD_FOLDER, 'items', str(user_id), filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            file.save(filepath)
            image_urls.append(f"/uploads/items/{user_id}/{filename}")
    
    # 既存の画像URLを追加（編集時）
    image_urls.extend(existing_images)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
            if mode == "update":
                # 更新処理
                cursor.execute('''
                    UPDATE items 
                    SET title = %s, description = %s, type = %s, brand = %s, uploaded_at = CURRENT_TIMESTAMP
                    WHERE item_id = %s
                ''', (title, description, type_json, brand_json, item_id))
                
                # 画像を更新
                cursor.execute("DELETE FROM item_images WHERE item_id = %s", (item_id,))
                for url in image_urls:
                    cursor.execute('''
                        INSERT INTO item_images (item_id, user_id, image_url)
                        VALUES (%s, %s, %s)
                    ''', (item_id, user_id, url))
                    
            else:
                # 新規作成
                cursor.execute('''
                    INSERT INTO items (user_id, title, description, type, brand)
                    VALUES (%s, %s, %s, %s, %s)
                ''', (user_id, title, description, type_json, brand_json))
                
                item_id = cursor.lastrowid
                for url in image_urls:
                    cursor.execute('''
                        INSERT INTO item_images (item_id, user_id, image_url)
                        VALUES (%s, %s, %s)
                    ''', (item_id, user_id, url))
                    
            conn.commit()
            return jsonify({"message": "アイテム登録成功",
                            "result" : True}), 200

    except mysql.connector.Error as err:
        return jsonify({
            "error": "アイテム登録中にエラーが発生しました",
            "result": False
        }), 500

# 商品削除
@profile_bp.route('/api/deleteUserItem', methods=['POST'])
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
