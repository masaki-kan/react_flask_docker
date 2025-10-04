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

            # 現在の日付
            now = datetime.now()
            current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            previous_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

            # 統計データ取得
            # 総ユーザー数（利用者のみ）
            cursor.execute('SELECT COUNT(*) as count FROM users WHERE type = 1')
            total_users = cursor.fetchone()['count']

            # 前月のユーザー数
            cursor.execute('SELECT COUNT(*) as count FROM users WHERE type = 1 AND created_at < %s', (current_month_start,))
            previous_month_users = cursor.fetchone()['count']

            # 総アイテム数
            cursor.execute('SELECT COUNT(*) as count FROM items')
            total_items = cursor.fetchone()['count']

            # 前月のアイテム数
            cursor.execute('SELECT COUNT(*) as count FROM items WHERE uploaded_at < %s', (current_month_start,))
            previous_month_items = cursor.fetchone()['count']

            # 進行中の取引数（tradesテーブルの全件数）
            cursor.execute("SELECT COUNT(*) as count FROM trades")
            active_trades = cursor.fetchone()['count']

            # 前月の進行中取引数
            cursor.execute("SELECT COUNT(*) as count FROM trades WHERE created_at < %s", (current_month_start,))
            previous_month_active_trades = cursor.fetchone()['count']

            # 完了した取引数（archived_tradesテーブルの件数）
            cursor.execute("SELECT COUNT(*) as count FROM archived_trades")
            completed_trades = cursor.fetchone()['count']

            # 前月の完了取引数
            cursor.execute("SELECT COUNT(*) as count FROM archived_trades WHERE archived_at < %s", (current_month_start,))
            previous_month_completed_trades = cursor.fetchone()['count']

            # 今月の新規データを計算
            current_month_users = total_users - previous_month_users
            current_month_items = total_items - previous_month_items
            current_month_active_trades = active_trades - previous_month_active_trades
            current_month_completed_trades = completed_trades - previous_month_completed_trades

            # 月間成長率を計算（前月がゼロの場合は100%とする）
            monthly_growth = (current_month_users / previous_month_users * 100) if previous_month_users > 0 else (100 if current_month_users > 0 else 0)
            monthly_items_growth = (current_month_items / previous_month_items * 100) if previous_month_items > 0 else (100 if current_month_items > 0 else 0)
            monthly_active_trades_growth = (current_month_active_trades / previous_month_active_trades * 100) if previous_month_active_trades > 0 else (100 if current_month_active_trades > 0 else 0)
            monthly_completed_trades_growth = (current_month_completed_trades / previous_month_completed_trades * 100) if previous_month_completed_trades > 0 else (100 if current_month_completed_trades > 0 else 0)

            # ユーザーデータ　商品数、ユーザー一覧
            cursor.execute("""
                SELECT
                    u.user_id,
                    u.name,
                    u.email,
                    u.created_at,
                    u.updated_at,
                    u.is_deleted,
                    u.plan,
                    COALESCE(item_counts.item_count, 0) as item_count
                FROM users u
                LEFT JOIN (
                    SELECT
                        user_id,
                        COUNT(*) as item_count
                    FROM items
                    GROUP BY user_id
                ) item_counts ON u.user_id = item_counts.user_id
                WHERE u.type = 1
                ORDER BY u.created_at DESC
            """)
            users = cursor.fetchall()

            # チャートデータ: 月別ユーザー登録数（過去12ヶ月）
            cursor.execute("""
                SELECT
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM users
                WHERE type = 1
                AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC
            """)
            user_registrations = cursor.fetchall()

            # チャートデータ: カテゴリ別アイテム数
            cursor.execute("""
                SELECT
                    JSON_UNQUOTE(JSON_EXTRACT(type, '$[0].name')) as category,
                    COUNT(*) as count
                FROM items
                WHERE JSON_VALID(type) = 1
                AND JSON_LENGTH(type) > 0
                GROUP BY JSON_UNQUOTE(JSON_EXTRACT(type, '$[0].name'))
                HAVING category IS NOT NULL
                ORDER BY count DESC
                LIMIT 10
            """)
            item_categories_data = cursor.fetchall()
            item_categories = {item['category']: item['count'] for item in item_categories_data if item['category']}

            return jsonify({
                "result": True,
                "success": True,
                "data": {
                    "stats": {
                        "totalItems": total_items,
                        "totalUsers": total_users,
                        "activeTrades": active_trades,
                        "completedTrades": completed_trades,
                        "monthlyGrowth": round(monthly_growth, 2),
                        "monthlyItems": round(monthly_items_growth, 2),
                        "monthlyActiveTrades": round(monthly_active_trades_growth, 2),
                        "monthlyCompletedTrades": round(monthly_completed_trades_growth, 2),
                        "users": users
                    },
                    "charts": {
                        "userRegistrations": user_registrations,
                        "tradeVolume": [],  # 必要に応じて後で実装
                        "itemCategories": item_categories
                    }
                }
            })

    except Exception as e:
        print(f"[ERROR] Admin dashboard error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "result": False,
            "error": f"ダッシュボードデータの取得に失敗しました: {str(e)}"
        }), 500
    
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
    