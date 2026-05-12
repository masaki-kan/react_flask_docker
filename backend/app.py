import os
os.environ["EVENTLET_NO_GREENDNS"] = "yes"

import eventlet
eventlet.monkey_patch()

from dotenv import load_dotenv
from pathlib import Path

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from datetime import timedelta
import stripe
import logging

# ログ設定
logging.basicConfig(level=logging.DEBUG)

# 環境変数の読み込み
env = os.getenv("FLASK_ENV", "development")

if env == "production":
    load_dotenv(dotenv_path=Path(".env.production"))
else:
    load_dotenv(dotenv_path=Path(".env.development"))

# ユーティリティのインポート（エラーハンドリング付き）
try:
    from utils.db_utils import init_db_pool, get_db_connection
    from utils.image_utils import init_s3_client
    # from utils.scheduler_utils import start_scheduler
    from utils.socketio_events import init_socketio, register_socketio_handlers
except ImportError as e:
    logging.error(f"Import error for utilities: {e}")
    raise

# Blueprintのインポート（エラーハンドリング付き）
try:
    from api.auth import auth_bp
    from api.profile import profile_bp
    from api.users import users_bp
    from api.items import items_bp
    from api.trades import trades_bp
    from api.thread import thread_bp
    from api.archives import archives_bp
    from api.payment import payment_bp
    from api.saves import saves_bp
    from api.admin import admin_bp
    from api.purchase_flow import purchase_bp
    from api.stripe_connect import stripe_connect_bp
except ImportError as e:
    logging.error(f"Import error for blueprints: {e}")
    raise

# === Flask App Init ===
app = Flask(__name__)

# === CORS設定 ===
if env == "production":
    origins = [
        "https://bokurano-vintage.com",
        "https://www.bokurano-vintage.com"
    ]

else:
    origins = ["http://localhost:5173"]
    
CORS(app, supports_credentials=True, resources={
    r"/api/*": {"origins": origins}, 
    r"/socket.io/*": {"origins": origins}
})

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# === Config ===
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
jwt = JWTManager(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === Blueprintの登録 ===
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(users_bp)
app.register_blueprint(items_bp)
app.register_blueprint(trades_bp)
app.register_blueprint(thread_bp)
app.register_blueprint(archives_bp)
app.register_blueprint(saves_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(purchase_bp)
app.register_blueprint(stripe_connect_bp)

# === WebSocketハンドラーの登録 ===
register_socketio_handlers(socketio)

def initialize_database():
    """データベースのテーブルを初期化"""
    try:
        # database.pyが存在しない場合の仮実装
        from database import create_table
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            try:
                create_table(cursor)
                conn.commit()
            finally:
                cursor.close()
    except ImportError:
        logging.warning("database.py not found, skipping table creation")
    except Exception as e:
        logging.error(f"Database initialization error: {e}")

def initialize_app():
    """アプリケーション初期化"""
    import time
    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            # 接続プールの初期化（リトライ機能付き）
            init_db_pool()

            # S3クライアントの初期化
            init_s3_client()

            # SocketIOの初期化（スレッド通知用）
            init_socketio(socketio)

            # データベーステーブルの初期化
            initialize_database()

            # スケジューラーの起動
            # start_scheduler()

            return

        except Exception as e:
            retry_count += 1
            if "Can't connect to MySQL server" in str(e) and retry_count < max_retries:
                logging.warning(f"Database connection failed (attempt {retry_count}/{max_retries}). Retrying in 2 seconds...")
                time.sleep(2)
                continue
            else:
                logging.error(f"Initialization error: {e}")
                raise

# Flask 2.3以降の初期化方法
with app.app_context():
    initialize_app()

# === 静的ファイルのルート ===
@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# === アプリケーションの起動 ===
if __name__ == "__main__":
    try:
        socketio.run(
            app,
            host="0.0.0.0",
            port=5001,
            debug=True,
            use_reloader=False,
            log_output=True
        )
    except Exception as e:
        logging.error(f"Failed to start application: {e}")
        raise