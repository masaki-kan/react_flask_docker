from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector # type: ignore
from datetime import timedelta
from database import create_table

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
    
    # print(email ,password,  flush=True)
    
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
    


@app.route('/getMyProfile' , methods=['GET'])
def getMyProfile():
    user_id = request.args.get('id')

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

        # プロフィール画像
        cursor.execute('''
            SELECT image_url 
            FROM profile_images 
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
            LIMIT 1
        ''', (user_id,))
        profile_image = cursor.fetchone()
        user_data['image'] = profile_image['image_url'] if profile_image else ""

        # タグ
        cursor.execute('''
            SELECT tag 
            FROM tags 
            WHERE user_id = %s
        ''', (user_id,))
        tags = [row['tag'] for row in cursor.fetchall()]
        user_data['tags'] = tags

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
            SELECT item_id, title, description, type, brand, curr, price 
            FROM items 
            WHERE user_id = %s
            ORDER BY uploaded_at DESC
        ''', (user_id,))
        items = cursor.fetchall()

        # 各アイテムに画像をつける
        for item in items:
            cursor.execute('''
                SELECT image_url 
                FROM item_images 
                WHERE item_id = %s
            ''', (item['item_id'],))
            item_images = cursor.fetchall()
            item['images'] = [img['image_url'] for img in item_images]

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

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)