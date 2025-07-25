import os
os.environ["EVENTLET_NO_GREENDNS"] = "yes"

import eventlet
eventlet.monkey_patch()

from dotenv import load_dotenv
from pathlib import Path

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

from tradeArchiver import TradeArchiver
from archiveRetriever import ArchiveRetriever


# === Flask App Init ===
app = Flask(__name__)
env = os.getenv("FLASK_ENV", "development")
    
if env == "production":
    origins = ["https://35.78.248.43"]
    load_dotenv(dotenv_path=Path(".env.production"))
else:
    origins = ["http://localhost:5173"] # ローカル
    load_dotenv(dotenv_path=Path(".env.development"))

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
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
        )
        print("✅ DB connected", flush=True)
        return conn
    except Exception as e:
        print("❌ DB connection failed:", e, flush=True)
        raise

@app.before_first_request
def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        create_table(cursor)
        conn.commit()
    finally:
        conn.close()
        cursor.close()

@app.route('/api/loginCheck', methods=['POST'])
def loginCheck():
    email = request.json.get('email', None)
    # print( 'email' , email , flush=True )

    try:
        # データベース接続とユーザー確認をここで実施
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, name, password , email FROM users WHERE email = %s", (email,))
        user_data = cursor.fetchone()

        if user_data:
            return jsonify({'result': True}), 200
        else:
            return jsonify({'result': False}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
                "error": "申請の作成中にエラーが発生しました",
                "result": False
            }), 500

    finally:
        conn.close()
        cursor.close()

@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    try:
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
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
                "error": "ログイン中にエラーが発生しました",
                "result": False
            }), 500
    finally:
        conn.close()
        cursor.close()

@app.route('/api/singUp', methods=['POST'])
def singUp():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    plan = data['plan']
    stripe_customer_id = data['stripeCustomerId']

    if not all([username, email, password, stripe_customer_id]):
        return jsonify({"error": "登録に失敗しました。"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password , plan , stripe_customer_id ) VALUES (%s, %s, %s, %s, %s)", (username, email, hashed_password ,plan ,stripe_customer_id))
        conn.commit()
        cursor.close()
        send_welcome_email(username,plan,email)
        return jsonify({"message": "登録しました。ログイン画面に移ります",
                        "result" : True}), 201
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
                "error": "アカウント登録中にエラーが発生しました",
                "result": False
            }), 500

    finally:
        conn.close()
        cursor.close()

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
        return True  # 成功時
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/postStoreProfile' , methods=['POST'])
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
        conn = get_db_connection()
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
        conn.rollback()
        return jsonify({
            "error": "プロフィール更新中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()

@app.route('/api/getProfile' , methods=['GET'])
def getMyProfile():
    user_id = request.args.get('id')# ログイン中のユーザーID
    my_user_id = request.args.get('my_id')  

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
        # ユーザー情報
        cursor.execute('''
            SELECT user_id, name, location, old, age, shop_name, shop_url, reasen ,plan
            FROM users
            WHERE user_id = %s
        ''', (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({
                "error": "指定されたユーザーが存在しません",
                "result": False
            }), 404

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
        
        if tags and tags.get('tag'):
            try:
                user_data['tags'] = json.loads(tags['tag'])
            except Exception:
                user_data['tags'] = []
        else:
            user_data['tags'] = []

        # アイテム
        cursor.execute('''
            SELECT item_id, title, description, type, brand,uploaded_at, status
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

            status = item['status']
            if status == 'exchanged':
                item['trade_status_flag'] = 2
            elif status == 'trading':
                item['trade_status_flag'] = 1
            elif status == 'available':
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
            
        return jsonify({
            "profile": user_data,
            "items": items
        }), 200
    
    except mysql.connector.Error as err:
        return jsonify({
            "error": "プロフィール情報取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()

@app.route('/api/postStoreProfileItem' ,methods=['POST'] )
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
    image_urls = []
    
    for file in image_files:
        binary = file.read()
        base64_str = base64.b64encode(binary).decode("utf-8")
        mime = file.mimetype
        data_url = f"data:{mime};base64,{base64_str}"
        image_urls.append(data_url)

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
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
        return jsonify({"message": "アイテム登録成功",
                        "result" : True}), 200

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "アイテム登録中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
        
@app.route('/api/getUsers' ,methods=['POST'] )
def getUsers():
    user_id = request.json.get('user_id',None )
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
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
        conn.rollback()
        return jsonify({
            "error": "ユーザー取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
    
@app.route('/api/userFollow' ,methods=['POST'])
def userFollow():
    follow_user_id = request.json.get('follew_user_id',None )
    my_user_id = request.json.get('my_user_id',None )
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
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
        conn.rollback()
        return jsonify({
            "error": "申請中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()

    user_id = request.json.get('item_id',None )
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    
    # 洗濯した商品からユーザーデータを取得
    try:
        cursor.execute('''
            SELECT 
                items.item_id,
                items.title,
                items.description,
                item.type,
                item.brand,
                users.name,
                users.user_id
            FROM items
            WHERE items.item_id != %s
            LEFT JOIN users ON items.user_id = users.user_id
            ORDER BY users.uploaded_at ASC
        ''', (user_id,))
        
        user_row = cursor.fetchall()

        return jsonify({
            "users": user_row,
            "result": True
        }), 200

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "ユーザーデータ取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()

@app.route('/api/getUserItems' ,methods=['POST'])
def getUserItems():
    user_id = request.json.get('user_id',None )

    # 自分以外の商品情報を取得
    try:
        conn = get_db_connection()
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
        conn.rollback()
        return jsonify({
            "error": "商品データ取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()

# 商品削除
@app.route('/api/deleteUserItem', methods=['POST'])
def deleteUserItem():
    item_id = request.json.get('item_id',None )
    my_user_id = request.json.get('my_user_id',None )
        
    if not item_id or not my_user_id:
        return jsonify({"error": "item_id と my_user_id は必須です"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # 1. まず、削除しようとしているアイテムが本当にそのユーザーのものか確認
        cursor.execute('''
            SELECT user_id FROM items 
            WHERE item_id = %s
        ''', (item_id,))
        item_owner = cursor.fetchone()
        
        if not item_owner:
            return jsonify({"error": "指定されたアイテムが見つかりません"}), 404
            
        if item_owner['user_id'] != my_user_id:
            return jsonify({"error": "他のユーザーのアイテムは削除できません"}), 403
        
        # 2. アクティブな取引（pending, purchased, shipped）があるか確認
        cursor.execute('''
            SELECT trade_id ,status FROM trades 
            WHERE item_id = %s AND status IN ('pending', 'purchased', 'shipped')
        ''', (item_id,))
        active_trades = cursor.fetchall()
        
        if active_trades:
            return jsonify({
                "error": "このアイテムには進行中の取引があるため削除できません", 
                "active_trades": active_trades
            }), 400
            
        # 3. 関連データの削除（順序重要：外部キー制約を考慮）
        # trade_messages の削除（trades に依存）
        cursor.execute('''
            DELETE tm FROM trade_messages tm
            INNER JOIN trades t ON tm.trade_id = t.trade_id
            WHERE t.item_id = %s
        ''', (item_id,))
        
        # trade_confirmationsの削除
        cursor.execute('''
            DELETE FROM trade_confirmations 
            WHERE trade_id = %s
        ''', (active_trades["trade_id"],))
        
        # shipping_infoの削除
        cursor.execute('''
            DELETE FROM shipping_info 
            WHERE trade_id = %s
        ''', (active_trades["trade_id"],))
                
        # trades の削除
        cursor.execute('''
            DELETE FROM trades 
            WHERE item_id = %s
        ''', (item_id,))
        
        # likes の削除
        cursor.execute('''
            DELETE FROM likes 
            WHERE item_id = %s
        ''', (item_id,))
        
        # item_images の削除
        cursor.execute('''
            DELETE FROM item_images 
            WHERE item_id = %s
        ''', (item_id,))
        
        # 最後に items 本体を削除
        cursor.execute('''
            DELETE FROM items 
            WHERE item_id = %s
        ''', (item_id,))
        
        # 4. 削除した件数を記録（デバッグ用）
        affected_rows = {
            'items': cursor.rowcount,
            'total_deleted': cursor.rowcount
        }
        
        conn.commit()

        return jsonify({
            "result": True,
            "message": "アイテムと関連データを削除しました",
            "item_id": item_id,
            "affected_rows": affected_rows
        }), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "商品データ削除中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
        
@app.route('/api/itemLike' ,methods=['POST'])
def itemLike():
    item_id = request.json.get('item_id',None )
    my_user_id = request.json.get('my_user_id',None )
    
    if not item_id or not my_user_id:
        return jsonify({"result": False, "error": "Missing item_id or my_user_id"}), 400

    try:
        conn = get_db_connection()
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
        conn.rollback()
        return jsonify({
            "error": "商品へのいいね中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
        
    data = request.json
    item_id = data.get('item_id')
    buyer_id = data.get('buyer_id')
    seller_id = data.get('seller_id')
    
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
        
        conn.commit()

        return jsonify({
            "result": True,
            "message": "取引が開始されました。",
            "trade_id": trade_id
        }), 200
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": str(err)}), 500
    finally:
        conn.close()
        cursor.close()

@app.route('/api/getSavedList', methods=['POST'])
def get_active_trades():
    user_id = request.json.get('user_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
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
                items.type,
                items.brand,
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
        
       # データの後処理
        for trade in active_trades:
            # 日付をISO形式に変換
            if trade.get('trade_created_at'):
                trade['trade_created_at'] = trade['trade_created_at'].isoformat()
            if trade.get('last_message_time'):
                trade['last_message_time'] = trade['last_message_time'].isoformat()
            
            # JSON型フィールドをパース
            if trade.get('type') and isinstance(trade['type'], str):
                try:
                    trade['type'] = json.loads(trade['type'])
                except json.JSONDecodeError:
                    trade['type'] = None
                    
            if trade.get('brand') and isinstance(trade['brand'], str):
                try:
                    trade['brand'] = json.loads(trade['brand'])
                except json.JSONDecodeError:
                    trade['brand'] = None
            
        return jsonify({"trades": active_trades, "result": True}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "取引中リストの取得中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        conn.close()
        cursor.close()

# 交換申請した人の商品情報
@app.route('/api/getChatItemDetail' ,methods=['POST'])
def get_chat_item_detail():
    trade_id = request.json.get('trade_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # 取引情報と商品の基本情報を取得
        cursor.execute('''
            SELECT 
                trades.trade_id,
                trades.status,
                trades.buyer_id,
                trades.seller_id,
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
            "user_id": trade_data["user_id"]
        }

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
            "tags" : json.loads(user_info['tag']) if user_info and user_info['tag'] else [],
        }
        
        # brand/type を JSON に変換
        for key in ["brand", "type"]:
            try:
                item_data[key] = json.loads(item_data[key]) if item_data[key] else []
            except:
                item_data[key] = []
        

        # partner_profile_image['image_url'] if partner_profile_image else "",

        return jsonify({
            "item": item_data, 
            "user": user_data,
            "result": True
        }), 200
        
    except mysql.connector.Error as err:
        print( 'err ' , err , flush=True)
        conn.rollback()
        return jsonify({
            "error": "商品データ取得中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        conn.close()
        cursor.close()
        
@app.route('/api/upload_image', methods=['POST'])
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

# チャットメッセージ　取得
@app.route('/api/get_trade_messages', methods=['GET'])
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
        conn.rollback()
        return jsonify({
            "error": "チャットデータ取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
        
@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/trade', methods=['POST'])
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
            conn = get_db_connection()
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
            conn.rollback()
            return jsonify({
                'result': False,
                'message': '取引の作成に失敗しました',
                'error': str(e)
            }), 500
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'result': False,
            'message': '予期しないエラーが発生しました',
            'error': str(e)
        }), 500
        
@app.route('/api/trade_status_change' , methods=['POST'])
def trage_status_change():
    trade_id = request.json.get('trade_id')
    trade_status = request.json.get('status')
    try:
        conn = get_db_connection()
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
        conn.rollback()
        return jsonify({
            "error": "進行中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        conn.close()
        cursor.close()
        
# 発送情報を保存
@app.route('/api/save_shipping_info', methods=['POST'])
def save_shipping_info():
    data = request.json
    trade_id = data.get('trade_id')
    sender_user_id = data.get('sender_user_id')
    tracking_number = data.get('tracking_number')
    shipping_company = data.get('shipping_company')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
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
        
        # 両者が発送情報を入力したかチェック
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
        
        conn.commit()
        cursor.close()
        
        return jsonify({'result': True, 'message': '発送情報を保存しました'})
        
    except Exception as e:
        conn.rollback()
        return jsonify({'result': False, 'error': str(e)}), 500
    finally:
        conn.close()

# 発送情報を取得
@app.route('/api/get_shipping_info', methods=['GET'])
def get_shipping_info():
    trade_id = request.args.get('trade_id')
    
    try:
        conn = get_db_connection()
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
        cursor.close()
        return jsonify({'result': True, 'shipping_info': shipping_info, **result})
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500

# 商品受取確認
@app.route('/api/confirm_item_received', methods=['POST'])
def confirm_item_received():
    data = request.json
    trade_id = data.get('trade_id')
    user_id = data.get('user_id')
    
    try:
        conn = get_db_connection()
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
        cursor.close()
        
        return jsonify({
            'result': True, 
            'message': '受取確認を記録しました',
            'both_confirmed': count_result['count'] == 2
        })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500
    
# 確認状況を取得
@app.route('/api/get_confirmations', methods=['GET'])
def get_confirmations():
    trade_id = request.args.get('trade_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 取引情報を取得
        cursor.execute('''
            SELECT seller_id, buyer_id
            FROM trades
            WHERE trade_id = %s
        ''', (trade_id,))
        
        trade = cursor.fetchone()
        
        # 確認情報を取得
        cursor.execute('''
            SELECT user_id
            FROM trade_confirmations
            WHERE trade_id = %s
        ''', (trade_id,))
        
        confirmations = cursor.fetchall()
        confirmed_users = [c['user_id'] for c in confirmations]
        
        cursor.close()
        
        return jsonify({
            'result': True,
            'seller_confirmed': trade['seller_id'] in confirmed_users,
            'buyer_confirmed': trade['buyer_id'] in confirmed_users,
            'both_confirmed': len(confirmed_users) == 2
        })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500
    
# 交換申請を受けた人が相手の商品一覧を取得
@app.route('/api/get_partner_items', methods=['POST'])
def get_partner_items():
    data = request.get_json()
    trade_id = data.get('trade_id')
    try:
        conn = get_db_connection()
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
    finally:
        conn.close()
        cursor.close()

# 交換商品選択エンドポイント
@app.route('/api/select_exchange_item', methods=['POST'])
def select_exchange_item():
    data = request.json
    trade_id = data.get('trade_id')
    selected_item_id = data.get('selected_item_id')
    user_id = data.get('user_id')
    
    try:
        conn = get_db_connection()
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
            SET seller_exchange_item_id = %s 
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
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
        cursor.close()

# 発送情報保存（シンプル版）
@app.route('/api/save_shipping_info_with_item', methods=['POST'])
def save_shipping_info_with_item():
    data = request.json
    trade_id = data.get('trade_id')
    sender_user_id = data.get('sender_user_id')
    tracking_number = data.get('tracking_number')
    shipping_company = data.get('shipping_company')
    
    try:
        conn = get_db_connection()
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
        
        # 両者が発送情報を入力したかチェック
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
        conn.rollback()
        return jsonify({'result': False, 'error': str(e)}), 500
    finally:
        conn.close()
        cursor.close()

# 取引完了時の処理（削除＋アーカイブ方式）
# 取引完了時の処理（削除＋アーカイブ方式）
@app.route('/api/complete_exchange', methods=['POST'])
def complete_exchange():
    """両者が商品を受け取り、交換を完了"""
    data = request.json
    trade_id = data.get('trade_id')
    user_id = data.get('user_id')  # 実行者のuser_id
    
    try:
        conn = get_db_connection()
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
        
        # 交換履歴を記録（アーカイブ前に）
        # 売り手の記録
        cursor.execute('''
            INSERT INTO trade_exchanges (trade_id, offered_item_id, received_item_id, user_id)
            VALUES (%s, %s, %s, %s)
        ''', (trade_id, trade['seller_exchange_item_id'], trade['buyer_exchange_item_id'], trade['seller_id']))
        
        # 買り手の記録
        cursor.execute('''
            INSERT INTO trade_exchanges (trade_id, offered_item_id, received_item_id, user_id)
            VALUES (%s, %s, %s, %s)
        ''', (trade_id, trade['buyer_exchange_item_id'], trade['seller_exchange_item_id'], trade['buyer_id']))
        
        # ===== ここから削除処理 =====
        
        # 1. 関連する全データの削除（順序重要：外部キー制約を考慮）
        
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
        
        # 🔥 重要: trade_exchanges の削除を追加（商品削除前に必須）
        cursor.execute('''
            DELETE FROM trade_exchanges WHERE trade_id = %s
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
        
        # 3. trades の削除
        cursor.execute('''
            DELETE FROM trades WHERE trade_id = %s
        ''', (trade_id,))
        
        # 完了メッセージ（削除前にアーカイブに保存済み）
        conn.commit()
        
        return jsonify({
            "result": True, 
            "message": "交換が完了しました。取引データはアーカイブに保存されました。", 
            "archive_trade_id": archive_trade_id
        })
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
        cursor.close()
        
# 選択された交換商品の情報を取得
@app.route('/api/get_exchange_items', methods=['GET'])
def get_exchange_items():
    trade_id = request.args.get('trade_id')
    
    try:
        conn = get_db_connection()
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
    finally:
        conn.close()
        cursor.close()

# 交換履歴を取得
@app.route('/api/getExchangeArchive', methods=['POST'])
def get_exchange_archive():
    data = request.get_json()
    user_id = data.get('user_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # アーカイブテーブルから取得
        cursor.execute('''
            SELECT 
                at.archive_trade_id,
                at.original_trade_id,
                at.seller_id,
                at.buyer_id,
                at.trade_created_at as trade_date,
                at.trade_completed_at as completed_date,
                at.seller_name,
                at.buyer_name,
                -- メイン商品
                main_item.title as main_item_title,
                main_item.description as main_item_description,
                main_item.brand as main_item_brand,
                -- seller交換商品
                CASE 
                    WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                    THEN seller_item.title 
                    ELSE NULL 
                END as seller_item_title,
                CASE 
                    WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                    THEN seller_item.brand 
                    ELSE NULL 
                END as seller_item_brand,
                -- buyer交換商品  
                CASE 
                    WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                    THEN buyer_item.title 
                    ELSE NULL 
                END as buyer_item_title,
                CASE 
                    WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                    THEN buyer_item.brand 
                    ELSE NULL 
                END as buyer_item_brand
            FROM archived_trades at
            JOIN archived_items main_item ON at.item_archive_id = main_item.archive_id
            LEFT JOIN archived_items seller_item ON at.seller_exchange_item_archive_id = seller_item.archive_id
            LEFT JOIN archived_items buyer_item ON at.buyer_exchange_item_archive_id = buyer_item.archive_id
            WHERE at.seller_id = %s OR at.buyer_id = %s
            ORDER BY at.trade_completed_at DESC
        ''', (user_id, user_id))

        trades = cursor.fetchall()
        
        # 各取引の詳細情報を構築
        for trade in trades:
            # プロフィール画像を取得（現在のユーザーテーブルから）
            # Seller画像
            cursor.execute('''
                SELECT image_url FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC
                LIMIT 1
            ''', (trade['seller_id'],))
            seller_img = cursor.fetchone()
            trade['seller_image'] = seller_img['image_url'] if seller_img else ""
            
            # Buyer画像
            cursor.execute('''
                SELECT image_url FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC
                LIMIT 1
            ''', (trade['buyer_id'],))
            buyer_img = cursor.fetchone()
            trade['buyer_image'] = buyer_img['image_url'] if buyer_img else ""
            
            # メイン商品の画像（アーカイブから）
            cursor.execute('''
                SELECT ai.archive_id
                FROM archived_trades at
                JOIN archived_items ai ON at.item_archive_id = ai.archive_id
                WHERE at.archive_trade_id = %s
            ''', (trade['archive_trade_id'],))
            main_archive = cursor.fetchone()
            
            if main_archive:
                cursor.execute('''
                    SELECT image_url FROM archived_item_images 
                    WHERE archive_id = %s 
                    ORDER BY archive_image_id ASC
                ''', (main_archive['archive_id'],))
                main_images = cursor.fetchall()
                trade['main_item_images'] = [img['image_url'] for img in main_images]
            else:
                trade['main_item_images'] = []
            
            # seller交換商品の画像（アーカイブから）
            if trade['seller_item_title']:
                cursor.execute('''
                    SELECT ai.archive_id
                    FROM archived_trades at
                    JOIN archived_items ai ON at.seller_exchange_item_archive_id = ai.archive_id
                    WHERE at.archive_trade_id = %s
                ''', (trade['archive_trade_id'],))
                seller_archive = cursor.fetchone()
                
                if seller_archive:
                    cursor.execute('''
                        SELECT image_url FROM archived_item_images 
                        WHERE archive_id = %s 
                        ORDER BY archive_image_id ASC
                    ''', (seller_archive['archive_id'],))
                    seller_images = cursor.fetchall()
                    trade['seller_item_images'] = [img['image_url'] for img in seller_images]
                else:
                    trade['seller_item_images'] = []
            else:
                trade['seller_item_images'] = []
            
            # buyer交換商品の画像（アーカイブから）
            if trade['buyer_item_title']:
                cursor.execute('''
                    SELECT ai.archive_id
                    FROM archived_trades at
                    JOIN archived_items ai ON at.buyer_exchange_item_archive_id = ai.archive_id
                    WHERE at.archive_trade_id = %s
                ''', (trade['archive_trade_id'],))
                buyer_archive = cursor.fetchone()
                
                if buyer_archive:
                    cursor.execute('''
                        SELECT image_url FROM archived_item_images 
                        WHERE archive_id = %s 
                        ORDER BY archive_image_id ASC
                    ''', (buyer_archive['archive_id'],))
                    buyer_images = cursor.fetchall()
                    trade['buyer_item_images'] = [img['image_url'] for img in buyer_images]
                else:
                    trade['buyer_item_images'] = []
            else:
                trade['buyer_item_images'] = []
            
            # 現在のユーザーの立場を判定
            trade['user_role'] = 'seller' if trade['seller_id'] == user_id else 'buyer'
            
            # JSONフィールドをパース
            for field in ['main_item_brand', 'seller_item_brand', 'buyer_item_brand']:
                if trade.get(field):
                    try:
                        trade[field] = json.loads(trade[field])
                    except:
                        trade[field] = []
            
            # 日付をISO形式に変換
            if trade.get('trade_date'):
                trade['trade_date'] = trade['trade_date'].isoformat()
            if trade.get('completed_date'):
                trade['completed_date'] = trade['completed_date'].isoformat()
        
        return jsonify({
            "archives": trades,
            "total": len(trades),
            "result": True
        }), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "交換履歴取得中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        conn.close()
        cursor.close()
        
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
        conn.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        conn.close()
        cursor.close()

# 切断
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

# stripe intent作成
@app.route('/api/create-payment-intent', methods=['POST'])
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
        return jsonify({
            "error": "クレジット外部データと通信中にエラーが発生しました",
            "result": False
        }), 500
    
# 退会処理
@app.route('/api/cancellationProcess' ,methods=['POST'])
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
        cursor.execute('DELETE FROM tags WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM profile_images WHERE user_id = %s', (user_id,))
        cursor.execute('DELETE FROM follows WHERE follower_id = %s OR followed_id = %s', (user_id, user_id))

        # 最後にusersを削除
        cursor.execute('DELETE FROM users WHERE user_id = %s', (user_id,))

        conn.commit()
        return jsonify({'message': '退会処理が完了しました。ご利用ありがとうございました。'}), 200
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "退会処理中にエラーが発生しました",
            "result": False
        }), 500
    finally:
        conn.close()
        cursor.close()
    
if __name__ == "__main__":
    socketio.run(
    app,
    host="0.0.0.0",
    port=5001,
    debug=True,
    use_reloader=False
)