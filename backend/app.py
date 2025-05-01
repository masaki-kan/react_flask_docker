from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector # type: ignore
from datetime import timedelta
from database import create_table
import json

app = Flask(__name__)
# appを定義した後にCORSを設定
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) # 特定のオリジンだけを許可する場合

app.config['JWT_SECRET_KEY'] = 'c5d5fd2e2543b248957a148ae9a572466bb2bbd4c628da19be37c07cf6094ac49c97607425d5d1ceac6d914e5399ca7fcd34cbf2995654c962b7233c42f8ebc14aa9025d0d335c3fb95c541a69b3e8b5d4ffb2fc86b5b15a276b6b90d06a94915c60392ebb950d962f6be6f5a3392bea80b460736082166b7cd9a72a2b7e8a29'  # シークレットキーを設定
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# MySQL接続設定
app.config['MYSQL_HOST'] = 'mysql_db'
app.config['MYSQL_USER'] = 'admin'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_DB'] = 'react_flask_app'

# db 接続
def get_db_connection():
    conn = mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )
    return conn

    
@app.before_first_request
def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        create_table(cursor)
        conn.commit()
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    # データベース接続とユーザー確認をここで実施
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT user_id, name, password , email FROM users WHERE email = %s", (email,))
    user_data = cursor.fetchone()
    
    if user_data and check_password_hash(user_data[2], password):
        access_token = create_access_token(identity=email)
        response = jsonify({
            'login' : True,
            "access_token": access_token,
            "user_id" : user_data[0],
            "username": user_data[1],
            "email" :  user_data[3],

        })
        response.set_cookie('access_token', access_token, httponly=True, secure=True)
        return response, 200
    else:
        return jsonify({'login': False}), 401


@app.route('/singUp', methods=['POST']) 
def singUp():
    username = request.json.get('username', None)
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    print(request.json ,  flush=True)
        
    if not all([username, email, password]):
        return jsonify({"error": "Missing data"}), 400
    
    
    hashed_password = generate_password_hash(password)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
        conn.commit()
        return jsonify({"message": "User registered successfully",
                        "result" : True}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
    

@app.route('/postStoreProfile' , methods=['POST'])
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
    
    print("受け取った値:", {
    'user_id' :user_id,

}, flush=True)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
       # users テーブルを更新（INSERT or UPDATE）
        cursor.execute('''
            UPDATE users SET 
                name = %s,
                location = %s,
                old = %s,
                age = %s,
                shop_name = %s,
                shop_url = %s,
                reasen = %s
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
        return jsonify({"message": "User registered successfully",
                        "result" : True}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()

@app.route('/getProfile' , methods=['GET'])
def getMyProfile():
    user_id = request.args.get('id')
    my_user_id = request.args.get('my_id')  # ログイン中のユーザーID
    
    print( my_user_id , flush=True )

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict型で結果を取得するため

    try:
        # ユーザー情報
        cursor.execute('''
            SELECT user_id, name, location, old, age, shop_name, shop_url, reasen 
            FROM users 
            WHERE user_id = %s
        ''', (user_id,))
        user_data = cursor.fetchone()

     # is_following の取得（my_user_id が存在する場合のみ）
        if my_user_id:
            cursor.execute('''
                SELECT 1 FROM follows 
                WHERE follower_id = %s AND followed_id = %s
            ''', (my_user_id, user_id))
            user_data['is_following'] = cursor.fetchone() is not None
        else:
            user_data['is_following'] = False
        
        # プロフィール画像
        cursor.execute('''
            SELECT image_url 
            FROM profile_images 
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            LIMIT 1
        ''', (user_id,))
        profile_image = cursor.fetchone()
        user_data = user_data or {}
        user_data['image'] = profile_image['image_url'] if profile_image else ""

        # タグ
        cursor.execute('''
            SELECT tag 
            FROM tags 
            WHERE user_id = %s
        ''', (user_id,))
        tags = cursor.fetchone()
        
        try:
            user_data['tags'] = json.loads(tags['tag'])
        except Exception:
            user_data['tags'] = []

        # プラン
        cursor.execute('''
            SELECT type, created_at 
            FROM plans 
            WHERE user_id = %s
        ''', (user_id,))
        plans = cursor.fetchall()
        user_data['plans'] = plans

        # アイテム
        cursor.execute('''
            SELECT item_id, title, description, type, brand, curr, price ,uploaded_at
            FROM items 
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
        ''', (user_id,))

        item_rows = cursor.fetchall()
        items = []

        for item in item_rows:
            
            # type
            try:
                item['type'] = json.loads(item['type']) if item['type'] else []
            except:
                item['type'] = []

            # brand
            try:
                item['brand'] = json.loads(item['brand']) if item['brand'] else []
            except:
                item['brand'] = []

            # 画像取得（昇順）
            cursor.execute('''
                SELECT image_url 
                FROM item_images 
                WHERE item_id = %s
                ORDER BY uploaded_at ASC
            ''', (item['item_id'],))
            item_images = cursor.fetchall()
            item['images'] = [r['image_url'] for r in item_images]

            items.append(item)

            
        # 全体をまとめて返す
        response = {
            "profile": user_data,
            "items": items
        }
        return jsonify(response), 201
    
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()

@app.route('/postStoreProfileItem' ,methods=['POST'] )
def postStoreProfileItem():
    item_data = request.json.get('itemData', {})
    item_id = item_data.get('itemId')
    user_id = item_data.get('userId')
    title = item_data.get('title')
    description = item_data.get('description')
    type = item_data.get('type',[])
    type_json = json.dumps(type, ensure_ascii=False)
    brand = item_data.get('brand',[])
    brand_json = json.dumps(brand, ensure_ascii=False)
    curr = item_data.get('curr')
    price = item_data.get('price')
    image_urls = item_data.get("images", [])  # list型を想定
    mode = request.json.get('dateUpChange')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if mode == "update":
            # すでに登録されている item_id を検索
            cursor.execute('''
                SELECT item_id FROM items WHERE user_id = %s ''', (user_id,))
            existing = cursor.fetchone()
            # 挿入された item_id を取得（AUTO_INCREMENT の値）

            if existing:
                item_id = existing[0]
                cursor.execute('''
                    UPDATE items 
                    SET title = %s, description = %s, type = %s, brand = %s, curr = %s, price = %s, uploaded_at = CURRENT_TIMESTAMP
                    WHERE item_id = %s
                ''', (title, description, type_json, brand_json, curr, price, item_id))
            else:
                return jsonify({"error": "更新対象が見つかりません"}), 404
                
            # 古い画像を削除
            cursor.execute("DELETE FROM item_images WHERE item_id = %s", (item_id,))
            # 新しい画像を追加
            for url in image_urls:
                cursor.execute('''
                    INSERT INTO item_images (item_id, user_id, image_url)
                    VALUES (%s, %s, %s)
                ''', (item_id, user_id, url))
                
                
        else:
             # 新規作成
            cursor.execute('''
                INSERT INTO items (user_id, title, description, type, brand, curr, price)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (user_id, title, description, type_json, brand_json, curr, price))
            
            # item_items テーブルに挿入
            item_id = cursor.lastrowid
            for url in image_urls:
                cursor.execute('''
                    INSERT INTO item_images (item_id, user_id, image_url)
                    VALUES (%s, %s, %s)
                ''', (item_id, user_id, url))

        conn.commit()
        return jsonify({"message": "登録成功",
                        "result" : True}), 201

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
        
@app.route('/getUsers' ,methods=['POST'] )
def getUsers():
    user_id = request.json.get('user_id',None )
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    
    try:
        # 自分以外のユーザーとそのアイテムを取得（itemが新しい順）
        cursor.execute('''
            SELECT 
                u.user_id,
                u.name,
                u.location,
                u.age,
                u.shop_name, 
                u.shop_url,
                IFNULL(p.image_url, '') AS image_url,
                IFNULL(i.uploaded_at, '') AS uploaded_at,
                IFNULL(ic.item_count, 0) AS item_count,
                tg.tag,
                CASE WHEN f1.follower_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_following,
                CASE WHEN f2.followed_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_followed
            FROM users u
            LEFT JOIN profile_images p ON u.user_id = p.user_id
            LEFT JOIN tags tg ON u.user_id = tg.user_id
            LEFT JOIN (
                SELECT i1.*
                FROM items i1
                INNER JOIN (
                    SELECT user_id, MAX(uploaded_at) AS latest_upload
                    FROM items
                    GROUP BY user_id
                ) i2 ON i1.user_id = i2.user_id AND i1.uploaded_at = i2.latest_upload
            ) i ON u.user_id = i.user_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS item_count
                FROM items
                GROUP BY user_id
            ) ic ON u.user_id = ic.user_id
            LEFT JOIN follows f1 ON f1.follower_id = %s AND f1.followed_id = u.user_id
            LEFT JOIN follows f2 ON f2.follower_id = u.user_id AND f2.followed_id = %s
            WHERE u.user_id != %s
            ORDER BY i.uploaded_at DESC
        ''', (user_id, user_id, user_id))  #
        users = cursor.fetchall()
        
        for user in users:
            try:
                user["tags"] = json.loads(user["tag"]) if user.get("tag") else []
                #不要
                user.pop('tag')
            except Exception:
                user["tags"] = []
                #不要
                user.pop('tag')

        cursor.execute('''
            SELECT tag FROM tags
            WHERE user_id != %s
        ''', (user_id,))
        tag_rows = cursor.fetchall()
        
        unique_tags = {}
        for row in tag_rows:
            tag_list = json.loads(row['tag'])
            for tag in tag_list:
                key = tag.get('key')
                name = tag.get('name')
                if key not in unique_tags:
                    unique_tags[key] = name

        # 辞書 → list に変換
        tags = [{'key': k, 'name': v} for k, v in unique_tags.items()]

        return jsonify({"users": users, "tags" :tags ,"result": True}), 200
    
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
    
@app.route('/userFollow' ,methods=['POST'])
def userFollow():
    follow_user_id = request.json.get('follew_user_id',None )
    my_user_id = request.json.get('my_user_id',None )
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    
    try:
     # すでにフォローしているかチェック
        cursor.execute('''
            SELECT 1 FROM follows
            WHERE follower_id = %s AND followed_id = %s
        ''', (my_user_id, follow_user_id))
        already_following = cursor.fetchone()

        if already_following:
            # 既にフォローしている場合 → フォロー解除（DELETE）
            cursor.execute('''
                DELETE FROM follows
                WHERE follower_id = %s AND followed_id = %s
            ''', (my_user_id, follow_user_id))
            action = "unfollowed"
        else:
            # フォローしていない場合 → 新たにフォロー（INSERT）
            cursor.execute('''
                INSERT INTO follows (follower_id, followed_id)
                VALUES (%s, %s)
            ''', (my_user_id, follow_user_id))
            action = "followed"

        conn.commit()
        return jsonify({"result": True, "action": action}), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
    
    
@app.route('/getUserItems' ,methods=['POST'])
def getUserItems():
    user_id = request.json.get('user_id',None )
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    
    try:
        cursor.execute('''
            SELECT 
                item_id,
                user_id,
                title,
                description,
                type,
                brand,
                curr,
                price,
                uploaded_at
            FROM items
            WHERE user_id != %s
            ORDER BY uploaded_at ASC
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
            items.append(item)
        
        
        brand_list = [{'key': k, 'name': v} for k, v in brand_set.items()]
        
        return jsonify({
            "items": items,
            "brands": brand_list,
            "result": True
        }), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
    
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)