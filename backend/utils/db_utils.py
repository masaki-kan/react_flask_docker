import os
from mysql.connector import pooling
from contextlib import contextmanager

db_pool = None

def init_db_pool():
    """アプリケーション起動時に接続プールを初期化"""
    global db_pool
    try:
        db_pool = pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=10,  # 同時接続数
            pool_reset_session=True,
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            autocommit=False,
            connection_timeout=30,
            buffered=True
        )
    except Exception as e:
        print(f"❌ Failed to initialize database pool: {e}")
        raise

@contextmanager
def get_db_connection():
    """接続プールから接続を取得し、自動的に返却する"""
    conn = None
    try:
        conn = db_pool.get_connection()
        yield conn
    except Exception as e:
        if conn and conn.is_connected():
            conn.rollback()
        raise e
    finally:
        if conn and conn.is_connected():
            conn.close()  # プールに返却

def get_db_connection_legacy():
    """レガシーコード用の接続取得関数"""
    try:
        return db_pool.get_connection()
    except Exception as e:
        print("❌ DB connection failed:", e, flush=True)
        raise