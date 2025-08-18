from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db_utils import get_db_connection
from utils.email_utils import send_welcome_email
import mysql.connector

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

# ログインチェック
@auth_bp.route('/loginCheck', methods=['POST'])
def login_check():
    email = request.json.get('email', None)
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id 
                FROM users 
                WHERE email = %s 
                AND (is_deleted = FALSE OR is_deleted IS NULL)
            """, (email,))
            user_data = cursor.fetchone()

            if user_data:
                return jsonify({'result': True}), 200
            else:
                return jsonify({'result': False}), 200
    except mysql.connector.Error as err:
        return jsonify({
            "error": "申請の作成中にエラーが発生しました",
            "result": False
        }), 500

# ログイン
@auth_bp.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, password, email, type, is_deleted, deleted_at
                FROM users 
                WHERE email = %s
            """, (email,))
            user_data = cursor.fetchone()
            
             # ユーザーが存在しない場合
            if not user_data:
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200

            # 退会済みユーザーのチェック
            if user_data[5]:  # is_deleted が True の場合
                return jsonify({
                    'login': False,
                    'error': 'このアカウントは退会済みです。新しいアカウントを作成してください。',
                    'is_deleted': True
                }), 200

            # パスワードの確認
            if not check_password_hash(user_data[2], password):
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200
       
            access_token = create_access_token(identity=email)
            response = jsonify({
                'login': True,
                "access_token": access_token,
                "user_id": user_data[0],
                "username": user_data[1],
                "email": user_data[3],
                "type": user_data[4]  # 管理者判定用
            })
            response.set_cookie('access_token', access_token, httponly=True, secure=True)

            return response, 200

        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "ログイン中にエラーが発生しました",
            "result": False
        }), 500

# アカウント登録
@auth_bp.route('/singUp', methods=['POST'])
def sign_up():
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
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT email, is_deleted 
                FROM users 
                WHERE email = %s
            """, (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                if existing_user[1]:  # 退会済みユーザーの場合
                    return jsonify({
                        "error": "このメールアドレスは退会済みアカウントで使用されています。別のメールアドレスをご利用ください。",
                        "result": False
                    }), 400
                else:  # アクティブなユーザーの場合
                    return jsonify({
                        "error": "このメールアドレスは既に登録されています。",
                        "result": False
                    }), 400
                    
            cursor.execute(
                "INSERT INTO users (name, email, password, plan, stripe_customer_id) VALUES (%s, %s, %s, %s, %s)", 
                (username, email, hashed_password, plan, stripe_customer_id)
            )
            conn.commit()
            
            send_welcome_email(username, plan, email)
            
            return jsonify({
                "message": "登録しました。ログイン画面に移ります",
                "result": True
            }), 201
            
    except mysql.connector.Error as err:
        return jsonify({
            "error": "アカウント登録中にエラーが発生しました",
            "result": False
        }), 500