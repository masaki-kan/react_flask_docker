from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db_utils import get_db_connection
from utils.email_utils import send_welcome_email
import mysql.connector
from datetime import datetime, timedelta

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

# 管理者ログイン
@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, password, email, type
                FROM users 
                WHERE email = %s AND type = 0
            """, (email,))
            admin_data = cursor.fetchone()
            
            # 管理者が存在しない場合
            if not admin_data:
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200

            # パスワードの確認
            if not check_password_hash(admin_data[2], password):
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200
       
            # 管理者用トークン生成
            access_token = create_access_token(identity=email)
            response = jsonify({
                'login': True,
                "access_token": access_token,
                "user_id": admin_data[0],
                "username": admin_data[1],
                "email": admin_data[3],
                "type": "admin"
            })
            response.set_cookie('access_token', access_token, httponly=True, secure=True)

            return response, 200

    except mysql.connector.Error as err:
        return jsonify({
            "error": "管理者ログイン中にエラーが発生しました",
            "result": False
        }), 500

# ユーザーログイン
@auth_bp.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, password, email, type
                FROM users 
                WHERE email = %s AND type = 1
            """, (email,))
            user_data = cursor.fetchone()
            
             # ユーザーが存在しない場合
            if not user_data:
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200

            # 退会済みユーザーのチェック
            # if user_data[5]:  # is_deleted が True の場合
            #     return jsonify({
            #         'login': False,
            #         'error': 'このアカウントは退会済みです。新しいアカウントを作成してください。',
            #         'is_deleted': True
            #     }), 200

            # パスワードの確認
            if not check_password_hash(user_data[2], password):
                return jsonify({
                    'login': False,
                    'error': 'メールアドレスまたはパスワードが正しくありません'
                }), 200
       
            # ここでemailをトークンに埋め込む
            access_token = create_access_token(identity=email)
            response = jsonify({
                'login': True,
                "access_token": access_token,
                "user_id": user_data[0],
                "username": user_data[1],
                "email": user_data[3],
                "type": "user"  # 一般ユーザーのみログイン可能
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
    is_early_bird = data.get('isEarlyBird', False)
    trial_end_date = data.get('trialEndDate', None)

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

            # 先着無料トライアルの場合、枠を再確認（同時登録対策）
            if is_early_bird:
                cursor.execute("""
                    SELECT setting_value FROM app_settings
                    WHERE setting_key = 'early_bird_limit'
                    FOR UPDATE
                """)
                limit_row = cursor.fetchone()
                early_bird_limit = int(limit_row[0]) if limit_row else 100

                cursor.execute("""
                    SELECT setting_value FROM app_settings
                    WHERE setting_key = 'early_bird_enabled'
                """)
                enabled_row = cursor.fetchone()
                early_bird_enabled = enabled_row[0] == 'true' if enabled_row else False

                cursor.execute("""
                    SELECT COUNT(*) FROM users
                    WHERE is_early_bird = TRUE AND (is_deleted = FALSE OR is_deleted IS NULL)
                """)
                current_count = cursor.fetchone()[0]

                if not early_bird_enabled or current_count >= early_bird_limit:
                    return jsonify({
                        "error": "先着無料トライアル枠が埋まりました。通常プランでの登録をお願いします。",
                        "result": False
                    }), 409

            cursor.execute(
                """INSERT INTO users (name, email, password, plan, stripe_customer_id, is_early_bird, trial_end_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (username, email, hashed_password, plan, stripe_customer_id, is_early_bird, trial_end_date)
            )

            send_welcome_email(username, plan, email)

            conn.commit()

            return jsonify({
                "message": "登録しました。ログイン画面に移ります",
                "result": True
            }), 201

    except mysql.connector.Error as err:
        return jsonify({
            "error": "アカウント登録中にエラーが発生しました",
            "result": False
        }), 500

# トークンリフレッシュ
@auth_bp.route('/auth/refresh', methods=['POST'])
@jwt_required()  # ← ここでトークンをデコード
def refresh_token():
    """
    ユーザートークンをリフレッシュする
    """
    try:
        # get_jwt_identity()はトークンのpayload.subを取得
        current_user_email = get_jwt_identity()
        current_claims = get_jwt()
        
        # データベースからユーザー情報を再取得して有効性を確認
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, email, type, is_deleted
                FROM users 
                WHERE email = %s
            """, (current_user_email,))
            user_data = cursor.fetchone()
            
            # ユーザーが存在しない、または退会済みの場合
            if not user_data or user_data[4]:
                return jsonify({
                    'success': False,
                    'message': 'ユーザーが無効です'
                }), 401
            
            # 新しいアクセストークンを生成
            new_access_token = create_access_token(
                identity=current_user_email,
                additional_claims={
                    'user_id': user_data[0],
                    'user_type': user_data[3],
                    'refresh_time': datetime.utcnow().isoformat()
                }
            )
            
            return jsonify({
                'success': True,
                'data': {
                    'token': new_access_token,
                    'user_id': user_data[0],
                    'username': user_data[1],
                    'email': user_data[2],
                    'type': 'admin' if user_data[3] == 0 else 'user'  # INT型を文字列に変換
                }
            }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'トークンリフレッシュに失敗しました'
        }), 500

# 管理者トークンリフレッシュ
@auth_bp.route('/admin/auth/refresh', methods=['POST'])
@jwt_required()
def refresh_admin_token():
    """
    管理者トークンをリフレッシュする
    """
    try:
        current_user_email = get_jwt_identity()
        current_claims = get_jwt()
        
        # データベースから管理者情報を再取得して有効性を確認
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, email, type, is_deleted
                FROM users 
                WHERE email = %s AND type = 0
            """, (current_user_email,))
            admin_data = cursor.fetchone()
            
            # 管理者が存在しない、退会済み、または管理者権限がない場合
            if not admin_data or admin_data[4] or admin_data[3] != 0:
                return jsonify({
                    'success': False,
                    'message': '管理者権限が無効です'
                }), 401
            
            # 新しい管理者アクセストークンを生成
            new_access_token = create_access_token(
                identity=current_user_email,
                additional_claims={
                    'user_id': admin_data[0],
                    'user_type': 'admin',
                    'refresh_time': datetime.utcnow().isoformat()
                }
            )
            
            return jsonify({
                'success': True,
                'data': {
                    'token': new_access_token,
                    'user_id': admin_data[0],
                    'username': admin_data[1],
                    'email': admin_data[2],
                    'type': 'admin' if admin_data[3] == 0 else 'user'  # INT型を文字列に変換
                }
            }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': '管理者トークンリフレッシュに失敗しました'
        }), 500

# トークン検証エンドポイント
@auth_bp.route('/auth/verify', methods=['POST'])
@jwt_required()
def verify_token():
    """
    トークンの有効性を検証する
    """
    try:
        current_user_email = get_jwt_identity()
        current_claims = get_jwt()
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, name, email, type, is_deleted
                FROM users 
                WHERE email = %s
            """, (current_user_email,))
            user_data = cursor.fetchone()
            
            if not user_data or user_data[4]:
                return jsonify({
                    'valid': False,
                    'message': 'ユーザーが無効です'
                }), 401
            
            return jsonify({
                'valid': True,
                'user': {
                    'user_id': user_data[0],
                    'username': user_data[1],
                    'email': user_data[2],
                    'type': user_data[3]
                }
            }), 200
            
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': 'トークン検証に失敗しました'
        }), 401
