from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
from datetime import datetime, timedelta

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

@admin_bp.route('/dashboard/user-detail', methods=['GET'], endpoint='get_user_detail')
@check_admin()
def get_user_detail():
    """特定ユーザーの詳細情報を取得"""
    user_id = int(request.args.get('user_id', ""))
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # ユーザープロフィール情報
            cursor.execute("""
                SELECT
                    user_id,
                    name,
                    email,
                    plan,
                    created_at,
                    updated_at,
                    is_deleted,
                    type
                FROM users
                WHERE user_id = %s AND type = 1
            """, (user_id,))
            user_profile = cursor.fetchone()

            if not user_profile:
                return jsonify({
                    "success": False,
                    "error": "ユーザーが見つかりません"
                }), 404

            # ユーザーの商品データ
            cursor.execute("""
                SELECT
                    item_id,
                    title,
                    status,
                    uploaded_at
                FROM items
                WHERE user_id = %s
                ORDER BY uploaded_at DESC
            """, (user_id,))
            user_items = cursor.fetchall()

            # 現在取引中のデータ
            cursor.execute("""
                SELECT
                    t.trade_id,
                    t.item_id,
                    t.created_at,
                    t.status,
                    i.title,
                    seller.name as seller_name,
                    buyer.name as buyer_name
                FROM trades t
                INNER JOIN items i ON t.item_id = i.item_id
                INNER JOIN users seller ON i.user_id = seller.user_id
                INNER JOIN users buyer ON t.buyer_id = buyer.user_id
                WHERE i.user_id = %s OR t.buyer_id = %s
                ORDER BY t.created_at DESC
            """, (user_id, user_id))
            active_trades = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "profile": user_profile,
                    "items": user_items,
                    "trades": active_trades
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] User detail error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"ユーザー詳細データの取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/users-data', methods=['GET'], endpoint='get_users_data')
@check_admin()
def get_users_data():
    try:
        # クエリパラメータを取得
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        name_filter = request.args.get('name', '')
        email_filter = request.args.get('email', '')
        plan_filter = request.args.get('plan', '')
        item_count_filter = request.args.get('item_count', '')
        deleted_filter = request.args.get('deleted', '')

        # オフセット計算
        offset = (page - 1) * limit

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # WHERE句の条件を構築
            conditions = ["u.type = 1"]
            params = []

            if name_filter:
                conditions.append("u.name LIKE %s")
                params.append(f"%{name_filter}%")

            if email_filter:
                conditions.append("u.email LIKE %s")
                params.append(f"%{email_filter}%")

            if plan_filter:
                conditions.append("u.plan = %s")
                params.append(plan_filter)
                
            if deleted_filter:
                conditions.append("u.is_deleted = %s")
                params.append(deleted_filter)

            where_clause = " AND ".join(conditions)

            # 総件数を取得
            count_query = f"""
                SELECT COUNT(*) as total
                FROM users u
                WHERE {where_clause}
            """
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()['total']

            # ユーザーデータを取得（ページネーション適用）
            user_query = f"""
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
                WHERE {where_clause}
            """

            # item_count でフィルタリング（HAVING句を使用）
            if item_count_filter:
                user_query += f" HAVING item_count >= %s"
                params.append(int(item_count_filter))

            user_query += " ORDER BY u.created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])

            cursor.execute(user_query, params)
            users = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "users": users,
                    "total": total_count,
                    "page": page,
                    "limit": limit
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Users data error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"ユーザーデータ取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/items-data', methods=['GET'], endpoint='get_items_data')
@check_admin()
def get_items_data():
    """商品一覧データを取得（検索・ページネーション対応）"""
    try:
        # クエリパラメータを取得
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        user_name_filter = request.args.get('user_name', '')
        item_id_filter = request.args.get('item_id', '')
        title_filter = request.args.get('title', '')
        type_filter = request.args.get('type', '')
        brand_filter = request.args.get('brand', '')

        # オフセット計算
        offset = (page - 1) * limit

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # WHERE句の条件を構築
            conditions = []
            params = []

            if user_name_filter:
                conditions.append("u.name LIKE %s")
                params.append(f"%{user_name_filter}%")

            if item_id_filter:
                conditions.append("i.item_id = %s")
                params.append(item_id_filter)

            if title_filter:
                conditions.append("i.title LIKE %s")
                params.append(f"%{title_filter}%")

            if type_filter:
                conditions.append("i.type LIKE %s")
                params.append(f"%{type_filter}%")

            if brand_filter:
                conditions.append("i.brand LIKE %s")
                params.append(f"%{brand_filter}%")

            where_clause = " AND ".join(conditions) if conditions else "1=1"

            # 総件数を取得
            count_query = f"""
                SELECT COUNT(*) as total
                FROM items i
                INNER JOIN users u ON i.user_id = u.user_id
                WHERE {where_clause}
            """
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()['total']

            # 商品データを取得（ページネーション適用）
            items_query = f"""
                SELECT
                    i.item_id,
                    i.user_id,
                    u.name as user_name,
                    i.title,
                    i.type,
                    i.brand,
                    i.uploaded_at,
                    i.status
                FROM items i
                INNER JOIN users u ON i.user_id = u.user_id
                WHERE {where_clause}
                ORDER BY i.uploaded_at DESC
                LIMIT %s OFFSET %s
            """
            params.extend([limit, offset])

            cursor.execute(items_query, params)
            items = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "items": items,
                    "total": total_count,
                    "page": page,
                    "limit": limit
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Items data error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"商品データ取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/item-detail', methods=['GET'], endpoint='get_item_detail')
@check_admin()
def get_item_detail():
    """商品詳細情報を取得"""
    item_id = int(request.args.get('item_id', ""))
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 商品情報を取得
            cursor.execute("""
                SELECT
                    i.item_id,
                    i.user_id,
                    i.title,
                    i.description,
                    i.type,
                    i.brand,
                    i.uploaded_at,
                    i.status,
                    u.name as user_name,
                    u.email as user_email
                FROM items i
                INNER JOIN users u ON i.user_id = u.user_id
                WHERE i.item_id = %s
            """, (item_id,))
            item_info = cursor.fetchone()

            if not item_info:
                return jsonify({
                    "success": False,
                    "error": "商品が見つかりません"
                }), 404

            # 商品画像を取得
            cursor.execute("""
                SELECT image_url
                FROM item_images
                WHERE item_id = %s
                ORDER BY uploaded_at ASC
            """, (item_id,))
            images = cursor.fetchall()
            item_info['images'] = [img['image_url'] for img in images]

            # いいねしているユーザー情報を取得
            cursor.execute("""
                SELECT
                    l.user_id,
                    u.name as user_name,
                    u.email as user_email,
                    l.created_at as liked_at
                FROM likes l
                INNER JOIN users u ON l.user_id = u.user_id
                WHERE l.item_id = %s
                ORDER BY l.created_at DESC
            """, (item_id,))
            liked_users = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "item": item_info,
                    "liked_users": liked_users,
                    "like_count": len(liked_users)
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Item detail error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"商品詳細データの取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/trades-data', methods=['GET'], endpoint='get_trades_data')
@check_admin()
def get_trades_data():
    """進行中の取引一覧データを取得（検索・ページネーション対応）"""
    try:
        # クエリパラメータを取得
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 100))
        buyer_name_filter = request.args.get('buyer_name', '')
        seller_name_filter = request.args.get('seller_name', '')
        item_title_filter = request.args.get('item_title', '')
        status_filter = request.args.get('status', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')

        # オフセット計算
        offset = (page - 1) * limit

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # WHERE句の条件を構築
            conditions = []
            params = []

            if buyer_name_filter:
                conditions.append("buyer.name LIKE %s")
                params.append(f"%{buyer_name_filter}%")

            if seller_name_filter:
                conditions.append("seller.name LIKE %s")
                params.append(f"%{seller_name_filter}%")

            if item_title_filter:
                conditions.append("i.title LIKE %s")
                params.append(f"%{item_title_filter}%")

            if status_filter:
                conditions.append("t.status = %s")
                params.append(status_filter)

            if start_date:
                conditions.append("DATE(t.created_at) >= %s")
                params.append(start_date)

            if end_date:
                conditions.append("DATE(t.created_at) <= %s")
                params.append(end_date)

            where_clause = " AND ".join(conditions) if conditions else "1=1"

            # 総件数を取得
            count_query = f"""
                SELECT COUNT(*) as total
                FROM trades t
                INNER JOIN items i ON t.item_id = i.item_id
                INNER JOIN users seller ON i.user_id = seller.user_id
                INNER JOIN users buyer ON t.buyer_id = buyer.user_id
                WHERE {where_clause}
            """
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()['total']

            # 取引データを取得（ページネーション適用）
            trades_query = f"""
                SELECT
                    t.trade_id,
                    t.item_id,
                    t.buyer_id,
                    t.created_at,
                    t.status,
                    i.title as item_title,
                    i.user_id as seller_id,
                    seller.name as seller_name,
                    buyer.name as buyer_name
                FROM trades t
                INNER JOIN items i ON t.item_id = i.item_id
                INNER JOIN users seller ON i.user_id = seller.user_id
                INNER JOIN users buyer ON t.buyer_id = buyer.user_id
                WHERE {where_clause}
                ORDER BY t.created_at DESC
                LIMIT %s OFFSET %s
            """
            params.extend([limit, offset])

            cursor.execute(trades_query, params)
            trades = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "trades": trades,
                    "total": total_count,
                    "page": page,
                    "limit": limit
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Trades data error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"取引データ取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/users-list', methods=['GET'], endpoint='get_users_list')
@check_admin()
def get_users_list():
    """ユーザー名リストを取得（フィルター用）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute("""
                SELECT DISTINCT user_id, name
                FROM users
                WHERE type = 1
                ORDER BY name ASC
            """)
            users = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "users": users
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Users list error: {str(e)}", flush=True)
        return jsonify({
            "success": False,
            "error": f"ユーザーリスト取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/trade-detail', methods=['GET'], endpoint='get_trade_detail')
@check_admin()
def get_trade_detail():
    """取引詳細情報を取得（商品情報、メッセージ、発送情報など）"""
    trade_id_str = request.args.get('trade_id')
    if not trade_id_str:
        return jsonify({
            "success": False,
            "error": "trade_idが指定されていません"
        }), 400

    try:
        trade_id = int(trade_id_str)
    except ValueError:
        return jsonify({
            "success": False,
            "error": "trade_idは数値である必要があります"
        }), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 取引基本情報を取得
            cursor.execute("""
                SELECT
                    t.trade_id,
                    t.item_id,
                    t.buyer_id,
                    t.seller_exchange_item_id,
                    t.buyer_exchange_item_id,
                    t.created_at,
                    t.status,
                    i.title as seller_item_title,
                    i.description as seller_item_description,
                    i.type as seller_item_type,
                    i.brand as seller_item_brand,
                    i.user_id as seller_id,
                    seller.name as seller_name,
                    seller.email as seller_email,
                    buyer.name as buyer_name,
                    buyer.email as buyer_email
                FROM trades t
                INNER JOIN items i ON t.item_id = i.item_id
                INNER JOIN users seller ON i.user_id = seller.user_id
                INNER JOIN users buyer ON t.buyer_id = buyer.user_id
                WHERE t.trade_id = %s
            """, (trade_id,))
            trade_info = cursor.fetchone()

            if not trade_info:
                return jsonify({
                    "success": False,
                    "error": "取引が見つかりません"
                }), 404

            # 売り手の商品画像を取得
            cursor.execute("""
                SELECT image_url
                FROM item_images
                WHERE item_id = %s
                ORDER BY uploaded_at ASC
            """, (trade_info['item_id'],))
            seller_images = cursor.fetchall()
            trade_info['seller_item_images'] = [img['image_url'] for img in seller_images]

            # 買い手が申請した商品情報を取得
            buyer_item_id = trade_info.get('buyer_exchange_item_id')
            if buyer_item_id:
                cursor.execute("""
                    SELECT
                        item_id,
                        title,
                        description,
                        type,
                        brand
                    FROM items
                    WHERE item_id = %s
                """, (buyer_item_id,))
                buyer_item = cursor.fetchone()

                if buyer_item:
                    # 買い手商品の画像を取得
                    cursor.execute("""
                        SELECT image_url
                        FROM item_images
                        WHERE item_id = %s
                        ORDER BY uploaded_at ASC
                    """, (buyer_item_id,))
                    buyer_images = cursor.fetchall()
                    buyer_item['images'] = [img['image_url'] for img in buyer_images]
                    trade_info['buyer_item'] = buyer_item
                else:
                    trade_info['buyer_item'] = None
            else:
                trade_info['buyer_item'] = None

            # 売り手が選択した交換商品情報を取得
            seller_exchange_item_id = trade_info.get('seller_exchange_item_id')
            if seller_exchange_item_id:
                cursor.execute("""
                    SELECT
                        item_id,
                        title,
                        description,
                        type,
                        brand
                    FROM items
                    WHERE item_id = %s
                """, (seller_exchange_item_id,))
                seller_exchange_item = cursor.fetchone()

                if seller_exchange_item:
                    # 売り手の交換商品の画像を取得
                    cursor.execute("""
                        SELECT image_url
                        FROM item_images
                        WHERE item_id = %s
                        ORDER BY uploaded_at ASC
                    """, (seller_exchange_item_id,))
                    seller_exchange_images = cursor.fetchall()
                    seller_exchange_item['images'] = [img['image_url'] for img in seller_exchange_images]
                    trade_info['seller_exchange_item'] = seller_exchange_item
                else:
                    trade_info['seller_exchange_item'] = None
            else:
                trade_info['seller_exchange_item'] = None

            # メッセージ履歴を取得
            cursor.execute("""
                SELECT
                    tm.message_id,
                    tm.sender_id,
                    tm.message,
                    tm.created_at,
                    u.name as sender_name
                FROM trade_messages tm
                INNER JOIN users u ON tm.sender_id = u.user_id
                WHERE tm.trade_id = %s
                ORDER BY tm.created_at ASC
            """, (trade_id,))
            messages = cursor.fetchall()

            # 発送情報を取得
            cursor.execute("""
                SELECT
                    shipping_id,
                    sender_user_id as sender_id,
                    tracking_number,
                    shipping_company,
                    created_at
                FROM shipping_info
                WHERE trade_id = %s
                ORDER BY created_at DESC
            """, (trade_id,))
            shipping_info = cursor.fetchall()

            return jsonify({
                "success": True,
                "data": {
                    "trade": trade_info,
                    "messages": messages,
                    "shipping_info": shipping_info
                }
            }), 200

    except Exception as e:
        print(f"[ERROR] Trade detail error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"取引詳細データの取得に失敗しました: {str(e)}"
        }), 500

@admin_bp.route('/dashboard/item-delete', methods=['DELETE'], endpoint='delete_item')
@check_admin()
def delete_item():
    """商品を削除"""
    try:
        item_id = request.args.get('item_id')

        if not item_id:
            return jsonify({
                "success": False,
                "error": "item_idが指定されていません"
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 商品が存在するか確認
            cursor.execute("""
                SELECT item_id, user_id FROM items
                WHERE item_id = %s
            """, (item_id,))
            item = cursor.fetchone()

            if not item:
                return jsonify({
                    "success": False,
                    "error": "商品が見つかりません"
                }), 404

            # アクティブな取引があるか確認
            cursor.execute("""
                SELECT trade_id, status FROM trades
                WHERE (item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s)
                AND status IN ('pending', 'purchased', 'shipped')
            """, (item_id, item_id, item_id))
            active_trades = cursor.fetchall()

            if active_trades:
                return jsonify({
                    "success": False,
                    "error": "進行中の取引があるため削除できません",
                    "active_trades": active_trades
                }), 400

            # 関連する全ての取引IDを取得
            cursor.execute("""
                SELECT DISTINCT trade_id FROM trades
                WHERE item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s
            """, (item_id, item_id, item_id))
            related_trades = cursor.fetchall()
            trade_ids = [t['trade_id'] for t in related_trades]

            # 関連データの削除
            if trade_ids:
                # trade_exchanges の削除
                cursor.execute("""
                    DELETE FROM trade_exchanges
                    WHERE offered_item_id = %s OR received_item_id = %s
                """, (item_id, item_id))

                # trade_messages の削除
                placeholders = ','.join(['%s'] * len(trade_ids))
                cursor.execute(f"""
                    DELETE FROM trade_messages
                    WHERE trade_id IN ({placeholders})
                """, trade_ids)

                # trade_confirmations の削除
                cursor.execute(f"""
                    DELETE FROM trade_confirmations
                    WHERE trade_id IN ({placeholders})
                """, trade_ids)

                # shipping_info の削除
                cursor.execute(f"""
                    DELETE FROM shipping_info
                    WHERE trade_id IN ({placeholders})
                """, trade_ids)

                # trades の削除
                cursor.execute("""
                    DELETE FROM trades
                    WHERE item_id = %s OR seller_exchange_item_id = %s OR buyer_exchange_item_id = %s
                """, (item_id, item_id, item_id))

            # likes の削除
            cursor.execute("""
                DELETE FROM likes
                WHERE item_id = %s
            """, (item_id,))

            # item_images の削除
            cursor.execute("""
                DELETE FROM item_images
                WHERE item_id = %s
            """, (item_id,))

            # items の削除
            cursor.execute("""
                DELETE FROM items
                WHERE item_id = %s
            """, (item_id,))

            conn.commit()

            return jsonify({
                "success": True,
                "message": "商品を削除しました",
                "item_id": item_id
            }), 200

    except Exception as e:
        print(f"[ERROR] Item delete error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"商品削除に失敗しました: {str(e)}"
        }), 500
