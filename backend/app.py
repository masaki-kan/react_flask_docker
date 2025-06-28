import os
os.environ["EVENTLET_NO_GREENDNS"] = "yes"

import eventlet
eventlet.monkey_patch()

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

import mysql.connector
import stripe
import json
import threading
import schedule
import time
from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

import base64
from email.message import EmailMessage

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

from database import create_table


# === Flask App Init ===
app = Flask(__name__)
env = os.getenv("FLASK_ENV", "development")

print( env , flush=True )
    
if env == "production":
    origins = ["https://35.78.248.43"]
else:
    origins = ["https://localhost"]

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": origins}, r"/socket.io/*": {"origins": origins}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# === Config ===
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')  # シークレットキーを設定
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
jwt = JWTManager(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # 絶対パスで指定　アップロードディレクトリの絶対パスを設定
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

# === Scheduler ===
def cleanup_old_unpaid_intents():
    # 1週間前のUnixタイムスタンプを取得
    one_week_ago = int((datetime.datetime.utcnow() - datetime.timedelta(days=7)).timestamp())

    # 作成が1週間より前で、最大100件のIntentを取得
    intents = stripe.PaymentIntent.list(
        created={"lt": one_week_ago},
        limit=100,
    )

    # 1件ずつループ処理
    for intent in intents.auto_paging_iter():
        # 状態が requires_payment_method のもの（支払い未確定）を対象に削除
        if intent.status == "requires_payment_method":
            try:
                print(f"Deleting intent: {intent.id}, created: {intent.created}")
                stripe.PaymentIntent.cancel(intent.id)
            except stripe.error.StripeError as e:
                print(f"Error cancelling intent {intent.id}: {str(e)}")

    return "クリーンアップ完了"

# === 毎日2:00に実行 ===
def schedule_job():
    schedule.every().day.at("02:00").do(cleanup_old_unpaid_intents)
    while True:
        schedule.run_pending()
        time.sleep(60)

@app.before_first_request
def activate_scheduler():
    thread = threading.Thread(target=schedule_job)
    thread.daemon = True
    thread.start()

# === DB Connection ===
def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),  
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
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

@app.route('/loginCheck', methods=['POST'])
def loginCheck():
    email = request.json.get('email', None)

    # データベース接続とユーザー確認をここで実施
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id, name, password , email FROM users WHERE email = %s", (email,))
    user_data = cursor.fetchone()

    if user_data:
        return jsonify({'result': True}), 200
    else:
        return jsonify({'result': False}), 200

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    print( 'email > ',email , flush=True )
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
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    plan = data['plan']
    stripe_customer_id = data['stripeCustomerId']
    
    print(username, email, password, stripe_customer_id , flush=True  )

    if not all([username, email, password, stripe_customer_id]):
        return jsonify({"error": "登録に失敗しました。"}), 400

    hashed_password = generate_password_hash(password)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO users (name, email, password , plan , stripe_customer_id ) VALUES (%s, %s, %s, %s, %s)", (username, email, hashed_password ,plan ,stripe_customer_id))
        conn.commit()
        send_welcome_email(username,plan,email)
        return jsonify({"message": "登録しました。ログイン画面に移ります",
                        "result" : True}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()

#認証
def get_credentials():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # 認証フローを生成
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', 
                SCOPES,
                redirect_uri='http://localhost:8080/')

            # 認証URLを取得
            auth_url, _ = flow.authorization_url(prompt='consent')
            print("\n🌐 以下のURLをブラウザで開いて、Googleログイン・許可を行ってください：")
            print(auth_url)
            code = input("認証コードを入力: ")
            flow.fetch_token(code=code)
            # localhost:8080 で待機し、トークン取得（自動で code を取りに行く）
            # creds = flow.run_local_server(port=8080, open_browser=False)
            creds = flow.credentials
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return creds

#メール用
def send_welcome_email(user_name ,plan_type ,to_email):
    
    print("user_name, plan_type, to_email :",user_name, plan_type, to_email , flush=True )
    if not all([user_name, plan_type, to_email]):
        return jsonify({"error": "Missing fields"}), 400
    
    plan = ""
    if plan_type == 1:
        plan = "月額プラン ¥550/月"
    else :
        plan = "年額プラン ¥5500/年"
        
    body = f"""{user_name} 様

    現在のご契約プラン：{plan}

    ご登録ありがとうございます。
    引き続きご利用ください。
    """
    try:
        creds = get_credentials()
        print("🔥 エラー発生　creds:", creds, flush=True)
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = os.getenv("GMAIL_FROM")
        message['Subject'] = 'ようこそ！僕らのヴィンテージへ！会員登録完了のお知らせ'

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(userId="me", body={
            'raw': encoded_message
        }).execute()

        print(f"✅ メール送信成功: {send_message['id']}")
        return True  # 成功時
    except Exception as e:
        print("🔥 エラー発生　Exception:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"message": "User registered successfully",
                        "result" : True}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()

@app.route('/getProfile' , methods=['GET'])
def getMyProfile():
    user_id = request.args.get('id')# ログイン中のユーザーID
    my_user_id = request.args.get('my_id')  

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict型で結果を取得するため

    try:
        # ユーザー情報
        cursor.execute('''
            SELECT user_id, name, location, old, age, shop_name, shop_url, reasen ,plan
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
            SELECT item_id, title, description, type, brand,uploaded_at
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

            # ✅ トレードステータスを確認（completed最優先）
            cursor.execute('''
                SELECT status 
                FROM trades
                WHERE item_id = %s AND seller_id = %s
                ORDER BY FIELD(status, 'completed', 'pending', 'purchased', 'shipped') DESC
                LIMIT 1
            ''', (item['item_id'], user_id))
            trade_status_row = cursor.fetchone()
            
            print('trades',trade_status_row ,flush=True )

            if trade_status_row:
                status = trade_status_row['status']
                if status == 'completed':
                    item['trade_status_flag'] = 2
                elif status in ('pending', 'purchased', 'shipped'):
                    item['trade_status_flag'] = 1
                else:
                    item['trade_status_flag'] = 0
            else:
                item['trade_status_flag'] = 0

            items.append(item)
        
        cursor.execute('''
        SELECT item_id
        FROM likes
        WHERE user_id = %s
        ''', (user_id,))
        liked_items = cursor.fetchall()
        
        # item_id のみ抽出
        user_data['likes'] = [like['item_id'] for like in liked_items]
            
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
    image_urls = item_data.get("images", [])  # list型を想定
    mode = request.json.get('dateUpChange')

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True, dictionary=True)

    try:
        if mode == "update":
            # すでに登録されている item_id を検索
            cursor.execute('''
                SELECT item_id FROM items WHERE user_id = %s AND item_id = %s ''', (user_id,item_id))
            existing = cursor.fetchone()
            
            cursor.execute('''
                UPDATE users
                SET uploaded_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            ''', (user_id,))

            # 挿入された item_id を取得（AUTO_INCREMENT の値）
            if existing:
                item_id = existing.get('item_id')
                cursor.execute('''
                    UPDATE items 
                    SET title = %s, description = %s, type = %s, brand = %s , uploaded_at = CURRENT_TIMESTAMP
                    WHERE item_id = %s
                ''', (title, description, type_json, brand_json, item_id))

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
                INSERT INTO items (user_id, title, description, type, brand)
                VALUES (%s, %s, %s, %s, %s)
            ''', (user_id, title, description, type_json, brand_json))
            
            # item_items テーブルに挿入
            item_id = cursor.lastrowid
            for url in image_urls:
                cursor.execute('''
                    INSERT INTO item_images (item_id, user_id, image_url)
                    VALUES (%s, %s, %s)
                ''', (item_id, user_id, url))
                
        conn.commit()
        return jsonify({"message": "登録成功",
                        "result" : True}), 200

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
                u.uploaded_at,
                IFNULL(p.image_url, '') AS image_url,
                IFNULL(i.created_at, '') AS created_at,
                IFNULL(ic.item_count, 0) AS item_count,
                tg.tag,
                CASE WHEN f1.follower_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_following,
                CASE WHEN f2.followed_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_followed
            FROM users u
            LEFT JOIN profile_images p ON u.user_id = p.user_id
            LEFT JOIN tags tg ON u.user_id = tg.user_id
            LEFT JOIN (
                SELECT *
                FROM (
                    SELECT *,
                        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY uploaded_at DESC) AS rn
                    FROM items
                ) ranked_items
                WHERE rn = 1
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
                
            created = user.get("created_at")
            uploaded = user.get("uploaded_at")
            print("created:", created, flush=True)
            print("uploaded:", uploaded, flush=True)
                
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
            action = "フォロー解除しました。"
        else:
            # フォローしていない場合 → 新たにフォロー（INSERT）
            cursor.execute('''
                INSERT INTO follows (follower_id, followed_id)
                VALUES (%s, %s)
            ''', (my_user_id, follow_user_id))
            action = "フォローしました。"

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
                items.item_id,
                items.user_id,
                items.title,
                items.description,
                items.type,
                items.brand,
                items.uploaded_at
            FROM items
            LEFT JOIN trades ON items.item_id = trades.item_id
            WHERE user_id != %s
            # AND trades.item_id IS NULL
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
            
            # ✅ トレードステータスを確認（completed最優先）
            cursor.execute('''
                SELECT status 
                FROM trades
                WHERE item_id = %s AND (seller_id = %s OR buyer_id = %s)
                ORDER BY FIELD(status, 'completed', 'pending', 'purchased', 'shipped') DESC
                LIMIT 1
            ''', (item['item_id'],user_id,user_id))
            trade_status_row = cursor.fetchone()
            
            if trade_status_row:
                status = trade_status_row['status']
                if status == 'completed':
                    item['trade_status_flag'] = 2
                elif status in ('pending', 'purchased', 'shipped'):
                    item['trade_status_flag'] = 1
                else:
                    item['trade_status_flag'] = 0
            else:
                item['trade_status_flag'] = 0
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
        
@app.route('/itemLike' ,methods=['POST'])
def itemLike():
    item_id = request.json.get('item_id',None )
    my_user_id = request.json.get('my_user_id',None )
    
    if not item_id or not my_user_id:
        return jsonify({"result": False, "error": "Missing item_id or my_user_id"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    try:
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
        return jsonify({"error": str(err)}), 500

    finally:
        conn.close()
        
@app.route('/trade' ,methods=['POST'])
def trade():
    data = request.json
    item_id = data.get('item_id')
    buyer_id = data.get('buyer_id')
    seller_id = data.get('seller_id')
    
    # print(item_id,buyer_id, seller_id , flush=True)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    try:
        # 既存の取引チェック（重複防止）
        cursor.execute('''
            SELECT trade_id FROM trades
            WHERE item_id = %s AND buyer_id = %s AND seller_id = %s
        ''', (item_id, buyer_id ,seller_id))
        existing_trade = cursor.fetchone()

        if existing_trade:
            return jsonify({"result": False, "message": "すでに取引が存在します。"}), 400
        
        # trades テーブルへ挿入
        cursor.execute('''
            INSERT INTO trades (item_id, buyer_id,seller_id)
            VALUES (%s, %s, %s)
        ''', (item_id, buyer_id,seller_id))
        trade_id = cursor.lastrowid
        # cursor.execute('''
        #     INSERT INTO trade_messages (trade_id, sender_id, message)
        #     VALUES (%s, %s, %s)
        # ''', (trade_id, buyer_id, "よろしくお願いします。"))
        
        conn.commit()

        return jsonify({
            "result": True,
            "message": "取引が開始されました。",
            "trade_id": trade_id
        }), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        conn.close()     
        
@app.route('/getSavedList', methods=['POST'])
def get_active_trades():
    user_id = request.json.get('user_id')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute('''
            SELECT 
                trades.trade_id,
                trades.created_at AS trade_created_at,
                trades.status,
                items.item_id,
                items.user_id AS seller_id,
                trades.buyer_id,
                items.title,
                items.description,
                item_img.image_url,
                users.name AS user_name,
                users.user_id AS user_id,
                profile_img.image_url AS user_image_url,
                tm.last_message_time 
            FROM trades
            JOIN items ON trades.item_id = items.item_id
            JOIN users ON items.user_id = users.user_id
            LEFT JOIN (
                SELECT ii.item_id, ii.image_url
                FROM item_images ii
                WHERE ii.item_image_id = (
                    SELECT MIN(ii2.item_image_id)
                    FROM item_images ii2
                    WHERE ii2.item_id = ii.item_id
                )
            ) AS item_img ON item_img.item_id = items.item_id
            LEFT JOIN (
                SELECT pi1.user_id, pi1.image_url
                FROM profile_images pi1
                JOIN (
                    SELECT user_id, MAX(uploaded_at) AS max_uploaded
                    FROM profile_images
                    GROUP BY user_id
                ) pi2 ON pi1.user_id = pi2.user_id AND pi1.uploaded_at = pi2.max_uploaded
            ) AS profile_img ON profile_img.user_id = users.user_id
            LEFT JOIN (
                SELECT trade_id, MAX(created_at) AS last_message_time
                FROM trade_messages
                GROUP BY trade_id
            ) AS tm ON tm.trade_id = trades.trade_id
            WHERE 
                (trades.buyer_id = %s OR items.user_id = %s)
                AND trades.status NOT IN ('cancelled')
            ORDER BY trades.created_at DESC
        ''', (user_id, user_id))

        active_trades = cursor.fetchall()
        
        return jsonify({"trades": active_trades, "result": True}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        conn.close()
        
@app.route('/getChatItemDetail' ,methods=['POST'])
def get_chat_item_detail():
    item_id = request.json.get('item_id')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 商品の基本情報 + 出品者情報
        cursor.execute('''
            SELECT 
                trades.trade_id,
                trades.status,
                items.item_id,
                items.title,
                items.description,
                items.type,
                items.brand,
                items.uploaded_at,
                users.user_id,
                users.name AS seller_name
            FROM trades
            JOIN items ON items.item_id = trades.item_id
            JOIN users ON users.user_id = items.user_id
            WHERE trades.trade_id = %s
        ''', (item_id,))
        item_data = cursor.fetchone()

        if not item_data:
            return jsonify({"error": "Item not found"}), 404

        # 商品の画像をすべて取得
        cursor.execute('''
            SELECT image_url
            FROM item_images
            WHERE item_id = %s
            ORDER BY uploaded_at ASC
        ''', (item_data["item_id"],))
        item_images = cursor.fetchall()
        item_data["images"] = [img['image_url'] for img in item_images]

        # 出品者の最新プロフィール画像（あれば）
        cursor.execute('''
            SELECT image_url
            FROM profile_images
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            LIMIT 1
        ''', (item_data["user_id"],))
        profile_image = cursor.fetchone()
        item_data["profile_image"] = profile_image['image_url'] if profile_image else ""

        # brand/type を JSON に変換（必要なら）
        import json
        for key in ["brand", "type"]:
            try:
                item_data[key] = json.loads(item_data[key]) if item_data[key] else []
            except:
                item_data[key] = []

        return jsonify({"item": item_data, "result": True}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        conn.close()
        
@app.route('/upload_image', methods=['POST'])
def upload_image():
    image = request.files['image']

    if not image or image.filename == "":
        return jsonify({"error": "No image provided"}), 400

    filename = secure_filename(image.filename)
    save_dir = 'uploads'  # 例：Flaskプロジェクト直下の uploads ディレクトリ
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, filename)

    image.save(save_path)

    image_url = f"https://35.78.248.43/uploads/{filename}"

    return jsonify({'image_url': image_url}), 200

@app.route('/get_trade_messages', methods=['GET'])
def get_trade_messages():
    trade_id = request.args.get('trade_id')
    if not trade_id:
        return jsonify({'error': 'trade_id is required'}), 400

    try:
        conn = get_db_connection()
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
        return jsonify({'error': str(err)}), 500
    finally:
        conn.close()
        
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/trade_status_change' , methods=['POST'])
def trage_status_change():
    trade_id = request.json.get('trade_id')
    trade_status = request.json.get('status')
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        
        # 2. "cancelled" の場合、関連メッセージを削除
        if trade_status == "cancelled":
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
        return jsonify({"error": str(err)}), 500
    finally:
        conn.close()

# Chat server 
# クライアントが接続
@socketio.on('connect')
def handle_connect():
    print('クライアントがWebSocketで接続しました', request.sid ,flush=True)

# クライアントが部屋に参加
@socketio.on('join')
def handle_join(data):
    room = data['room']
    join_room(room)
    print(f'Client joined room: {room}', flush=True)

# メッセージ受信時の処理
@socketio.on('send_message')
def handle_send_message(data):
    room = data['room']
    message = data['message']
    trade_id = data['trade_id']
    sender_id = data['sender_id']
    # print(f' room: {room}', f' message: {message}', flush=True)
    # DBに保存
    try:
        conn = get_db_connection()
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

        emit('receive_message', {'message': message , 'sender_id' :sender_id,'sender_image_url': image_url}, to=room)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        conn.close()

# 切断
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

# stripe intent作成
@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    data = request.get_json()
    amount = data.get("amount")
    plan_status = data.get("status")
    
    try:
        # Stripe Customer を作成
        customer = stripe.Customer.create()
        # 初月無料にする場合（plan_status == 1）は amount を 0 にする
        payment_amount = 0 if plan_status == 1 else amount
        intent = stripe.PaymentIntent.create(
            customer=customer.id,
            amount=payment_amount,
            currency='jpy',
            automatic_payment_methods={'enabled': True},
            payment_method_options={
            "card": {
                "setup_future_usage": "off_session",
            }}
        )
        return jsonify({
            'intentId' :intent.id,
            'clientSecret': intent.client_secret,
            'stripeCustomerId': customer.id  # ← フロント・DBに保存する用
        }) 
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# 退会処理
@app.route('/cancellationProcess' ,methods=['POST'])
def cancellationProcess():
    data = request.get_json()
    user_id = data.get('userID')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
            # ユーザー情報
        cursor.execute("SELECT stripe_customer_id FROM users WHERE user_id = %s", (user_id,))
        
        result = cursor.fetchone()
        print( 'result _ stripe_customer_id :' , result,  flush=True)
        if result:
            stripe_customer_id = result.get('stripe_customer_id')
            if stripe_customer_id:
                stripe.Customer.delete(stripe_customer_id)
                
        # 子テーブルから先に削除（ON DELETE CASCADEが効かない場合の対処）
        cursor.execute('DELETE FROM trade_reviews WHERE reviewer_id = %s OR reviewee_id = %s', (user_id, user_id))
        cursor.execute('DELETE FROM trade_messages WHERE sender_id = %s', (user_id,))
        cursor.execute('DELETE FROM trades WHERE seller_id = %s OR buyer_id = %s', (user_id, user_id))
        cursor.execute('DELETE FROM item_images WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM items WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM likes WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM plans WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM tags WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM profile_images WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM follows WHERE follower_id = %s OR followed_id = %s', (user_id, user_id))

        # 最後にusersを削除
        cursor.execute('DELETE FROM users WHERE user_id = %s', (user_id,))

        conn.commit()
        return jsonify({'message': '退会処理が完了しました。ご利用ありがとうございました。'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        conn.close()
    
if __name__ == "__main__":
    socketio.run(
    app,
    host="0.0.0.0",
    port=5001,
    debug=True,
    use_reloader=False
)