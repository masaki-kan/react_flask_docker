from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
from datetime import datetime, timedelta
from utils.scheduler_utils import cleanup_old_archives

admin_bp = Blueprint('admin', __name__, url_prefix='/api')

def check_admin():
    """管理者権限チェックデコレータ"""
    def decorator(f):
        @jwt_required()
        def decorated_function(*args, **kwargs):
            user_email = get_jwt_identity()
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT type FROM users WHERE email = %s', (user_email,))
                user = cursor.fetchone()
                
                if not user or user[0] != 0:  # type = 0 が管理者
                    return jsonify({"error": "権限がありません"}), 403
                    
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@admin_bp.route('/dashboard', methods=['GET'])
@check_admin()
def admin_dashboard():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 統計データ取得
            # 総ユーザー数（利用者のみ）
            cursor.execute('SELECT COUNT(*) as count FROM users WHERE type = 1')
            total_users = cursor.fetchone()['count']
            
            # 他の統計データ...
            
            return jsonify({
                "stats": {
                    "totalUsers": total_users,
                    # 他の統計...
                },
                "charts": {
                    # チャートデータ...
                }
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/admin/cleanup-archives', methods=['POST'])
def manual_cleanup_archives():
    """管理者用：手動でアーカイブクリーンアップを実行"""
    try:
        # 管理者チェック（実装に応じて調整）
        user_email = get_jwt_identity()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT type FROM users WHERE email = %s
            ''', (user_email,))
            user = cursor.fetchone()
            
            if not user or user[0] != 0:  # type = 0 が管理者
                return jsonify({"error": "権限がありません"}), 403
        
        # クリーンアップ実行
        cleanup_old_archives()
        
        return jsonify({
            "result": True,
            "message": "アーカイブクリーンアップを実行しました"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/admin/cleanup-status', methods=['GET'])
def get_cleanup_status():
    """クリーンアップ実行履歴を取得"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 最近のクリーンアップ履歴
            cursor.execute('''
                SELECT * FROM cleanup_logs 
                WHERE cleanup_type = 'archive_cleanup'
                ORDER BY cleanup_date DESC 
                LIMIT 10
            ''')
            logs = cursor.fetchall()
            
            # 削除予定のアーカイブ数
            one_year_ago = datetime.now() - timedelta(days=365)
            cursor.execute('''
                SELECT COUNT(*) as count 
                FROM archived_trades 
                WHERE archived_at < %s
            ''', (one_year_ago,))
            pending = cursor.fetchone()
            
            # 日付をISO形式に変換
            for log in logs:
                if log.get('cleanup_date'):
                    log['cleanup_date'] = log['cleanup_date'].isoformat()
            
            return jsonify({
                "result": True,
                "cleanup_logs": logs,
                "pending_deletion": pending['count']
            }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    