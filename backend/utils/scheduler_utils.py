import stripe
import schedule
import time
import threading
from datetime import datetime, timedelta
from utils.db_utils import get_db_connection

def cleanup_old_unpaid_intents():
    """1週間前の未払いStripe Intentをクリーンアップ"""
    # 1週間前のUnixタイムスタンプを取得
    one_week_ago = int((datetime.utcnow() - timedelta(days=7)).timestamp())

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
                stripe.PaymentIntent.cancel(intent.id)
            except stripe.error.StripeError as e:
                print(f"Error cancelling intent {intent.id}: {str(e)}")

    return "クリーンアップ完了"

def cleanup_old_archives():
    """1年以上経過したアーカイブデータを削除"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # 1年前の日付を計算
            one_year_ago = datetime.now() - timedelta(days=365)
            
            # 削除対象の archive_trade_id を取得
            cursor.execute('''
                SELECT archive_trade_id 
                FROM archived_trades 
                WHERE archived_at < %s
                LIMIT 100
            ''', (one_year_ago,))
            
            old_archives = cursor.fetchall()
            deleted_count = 0
            
            for archive in old_archives:
                archive_trade_id = archive[0]
                
                try:
                    # カスケード削除により関連データも自動削除される
                    cursor.execute('''
                        DELETE FROM archived_trades 
                        WHERE archive_trade_id = %s
                    ''', (archive_trade_id,))
                    
                    # archived_items も削除（関連画像も自動削除）
                    cursor.execute('''
                        DELETE ai FROM archived_items ai
                        WHERE ai.archive_id IN (
                            SELECT item_archive_id FROM archived_trades WHERE archive_trade_id = %s
                            UNION
                            SELECT seller_exchange_item_archive_id FROM archived_trades WHERE archive_trade_id = %s
                            UNION
                            SELECT buyer_exchange_item_archive_id FROM archived_trades WHERE archive_trade_id = %s
                        )
                    ''', (archive_trade_id, archive_trade_id, archive_trade_id))
                    
                    deleted_count += 1
                    
                except Exception as e:
                    print(f"Error deleting archive {archive_trade_id}: {e}")
                    continue
            
            conn.commit()
            # ログテーブルに記録（オプション）
            cursor.execute('''
                INSERT INTO cleanup_logs (cleanup_type, deleted_count, cleanup_date)
                VALUES ('archive_cleanup', %s, NOW())
            ''', (deleted_count,))
            conn.commit()
            
    except Exception as e:
        print(f"❌ Archive cleanup failed: {e}")

def schedule_job():
    """定期実行ジョブをスケジュール"""
    schedule.every().day.at("02:00").do(cleanup_old_unpaid_intents)
    schedule.every().day.at("02:00").do(cleanup_old_archives)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def start_scheduler():
    """スケジューラーを別スレッドで起動"""
    thread = threading.Thread(target=schedule_job)
    thread.daemon = True
    thread.start()

def notify_before_archive_deletion():
    """削除予定のアーカイブをユーザーに通知（削除30日前）"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 335日（1年-30日）経過したアーカイブを取得
            notification_date = datetime.now() - timedelta(days=335)
            deletion_date = datetime.now() - timedelta(days=365)
            
            cursor.execute('''
                SELECT DISTINCT 
                    at.seller_id,
                    at.buyer_id,
                    at.seller_email,
                    at.buyer_email,
                    COUNT(*) as archive_count
                FROM archived_trades at
                WHERE at.archived_at > %s 
                AND at.archived_at <= %s
                GROUP BY at.seller_id, at.buyer_id
            ''', (deletion_date, notification_date))
            
            notifications = cursor.fetchall()
            
            for notification in notifications:
                # メール送信処理
                # send_archive_deletion_notice(notification)
                pass
                
    except Exception as e:
        print(f"Notification error: {e}")