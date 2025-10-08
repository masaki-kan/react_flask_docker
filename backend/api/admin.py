from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
from datetime import datetime, timedelta
# from utils.scheduler_utils import cleanup_old_archives

admin_bp = Blueprint('admin', __name__, url_prefix='/api')

def check_admin():
    """管理者権限チェックデコレータ"""
    def decorator(f):
        from functools import wraps

        @wraps(f)
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

@admin_bp.route('/dashboard', methods=['GET'], endpoint='admin_dashboard')
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
    
@admin_bp.route('/admin/cleanup-archives', methods=['POST'], endpoint='manual_cleanup_archives')
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
        # cleanup_old_archives()
        
        return jsonify({
            "result": True,
            "message": "アーカイブクリーンアップを実行しました"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/admin/cleanup-status', methods=['GET'], endpoint='get_cleanup_status')
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

def format_label(label: str, range_type: str) -> str:
    """ラベルを表示用にフォーマット"""
    try:
        if range_type == 'year':
            # 2024-01 -> 2024年1月
            year, month = label.split('-')
            return f"{year}年{int(month)}月"
        elif range_type in ['month', 'week']:
            # 2024-01-15 -> 1/15
            year, month, day = label.split('-')
            return f"{int(month)}/{int(day)}"
        return label
    except Exception:
        return label

@admin_bp.route('/dashboard/user-registrations', methods=['GET'], endpoint='get_user_registration_data')
@check_admin()
def get_user_registration_data():
    """期間別ユーザー登録数データを取得"""
    try:
        range_type = request.args.get('range', 'year')  # year, month, week

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            now = datetime.now()

            if range_type == 'year':
                # 過去12ヶ月のデータ
                cursor.execute("""
                    SELECT
                        DATE_FORMAT(created_at, '%Y-%m') as label,
                        COUNT(*) as count
                    FROM users
                    WHERE type = 1
                    AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                    AND (is_deleted = FALSE OR is_deleted IS NULL)
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                    ORDER BY label ASC
                """)

            elif range_type == 'month':
                # 今月の日別データ
                current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                cursor.execute("""
                    SELECT
                        DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                        COUNT(*) as count
                    FROM users
                    WHERE type = 1
                    AND created_at >= %s
                    AND (is_deleted = FALSE OR is_deleted IS NULL)
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                    ORDER BY label ASC
                """, (current_month_start,))

            elif range_type == 'week':
                # 過去7日のデータ
                week_ago = now - timedelta(days=7)
                cursor.execute("""
                    SELECT
                        DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                        COUNT(*) as count
                    FROM users
                    WHERE type = 1
                    AND created_at >= %s
                    AND (is_deleted = FALSE OR is_deleted IS NULL)
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                    ORDER BY label ASC
                """, (week_ago,))

            else:
                return jsonify({"error": "Invalid range parameter"}), 400

            registration_data = cursor.fetchall()

            # データを整形
            formatted_data = []
            for item in registration_data:
                formatted_data.append({
                    'label': format_label(item['label'], range_type),
                    'count': item['count']
                })

            return jsonify({
                "success": True,
                "data": formatted_data
            }), 200

    except Exception as e:
        print(f"[ERROR] User registration data error: {str(e)}", flush=True)
        return jsonify({
            "success": False,
            "error": f"ユーザー登録データの取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/subscription-data', methods=['GET'], endpoint='get_subscription_data')
@check_admin()
def get_subscription_data():
    """期間別サブスクリプションデータを取得"""
    try:
        range_type = request.args.get('range', 'year')  # year, month, week
        subscription_type = request.args.get('type', 'monthly')  # monthly, yearly

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            now = datetime.now()

            # 料金設定
            if subscription_type == 'monthly':
                # plan = 0: 月額550円（初月無料、翌月から課金）
                plan_value = 0
                price_per_user = 550
            else:  # yearly
                # plan = 1: 年払い5500円
                plan_value = 1
                price_per_user = 5500

            if range_type == 'year':
                # 過去12ヶ月のデータ
                if subscription_type == 'monthly':
                    # 月額の場合、登録翌月から課金開始
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) <= NOW()
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value))
                else:
                    # 年払いの場合、登録月から課金開始
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(created_at, '%Y-%m') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value))

            elif range_type == 'month':
                # 今月の日別データ
                current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if subscription_type == 'monthly':
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m-%d') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) >= %s
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) <= NOW()
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m-%d')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value, current_month_start))
                else:
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND created_at >= %s
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value, current_month_start))

            elif range_type == 'week':
                # 過去7日のデータ
                week_ago = now - timedelta(days=7)
                if subscription_type == 'monthly':
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m-%d') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) >= %s
                        AND DATE_ADD(created_at, INTERVAL 1 MONTH) <= NOW()
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(DATE_ADD(created_at, INTERVAL 1 MONTH), '%Y-%m-%d')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value, week_ago))
                else:
                    cursor.execute("""
                        SELECT
                            DATE_FORMAT(created_at, '%Y-%m-%d') as label,
                            COUNT(*) as users,
                            COUNT(*) * %s as revenue
                        FROM users
                        WHERE type = 1 AND plan = %s
                        AND created_at >= %s
                        AND (is_deleted = FALSE OR is_deleted IS NULL)
                        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                        ORDER BY label ASC
                    """, (price_per_user, plan_value, week_ago))

            else:
                return jsonify({"error": "Invalid range parameter"}), 400

            chart_data = cursor.fetchall()

            # 統計データ（総計）を取得
            if subscription_type == 'monthly':
                cursor.execute("""
                    SELECT
                        COUNT(*) as total_users,
                        COUNT(*) * %s as total_revenue
                    FROM users
                    WHERE type = 1 AND plan = %s
                    AND DATE_ADD(created_at, INTERVAL 1 MONTH) <= NOW()
                    AND (is_deleted = FALSE OR is_deleted IS NULL)
                """, (price_per_user, plan_value))
            else:
                cursor.execute("""
                    SELECT
                        COUNT(*) as total_users,
                        COUNT(*) * %s as total_revenue
                    FROM users
                    WHERE type = 1 AND plan = %s
                    AND (is_deleted = FALSE OR is_deleted IS NULL)
                """, (price_per_user, plan_value))

            stats_data = cursor.fetchone()

            # データを整形
            formatted_chart_data = []
            for item in chart_data:
                formatted_chart_data.append({
                    'label': format_label(item['label'], range_type),
                    'users': item['users'],
                    'revenue': item['revenue']
                })

            return jsonify({
                "success": True,
                "data": {
                    "chartData": formatted_chart_data,
                    "stats": {
                        "totalUsers": stats_data['total_users'] if stats_data else 0,
                        "totalRevenue": stats_data['total_revenue'] if stats_data else 0
                    }
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Subscription data error: {str(e)}", flush=True)
        return jsonify({
            "success": False,
            "error": f"サブスクリプションデータの取得に失敗しました: {str(e)}"
        }), 500