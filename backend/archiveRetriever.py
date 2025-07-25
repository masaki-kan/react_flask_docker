import mysql.connector
from datetime import datetime

class ArchiveRetriever:
    def __init__(self, db_connection):
        self.db = db_connection
        self.cursor = db_connection.cursor(dictionary=True)
    
    def get_user_trade_history(self, user_id, limit=50, offset=0):
        """ユーザーの取引履歴を取得"""
        query = '''
            SELECT 
                at.*,
                ai.title as item_title,
                ai.description as item_description,
                ai.type as item_type,
                ai.brand as item_brand,
                -- 交換商品の情報
                sai.title as seller_exchange_title,
                bai.title as buyer_exchange_title
            FROM archived_trades at
            JOIN archived_items ai ON at.item_archive_id = ai.archive_id
            LEFT JOIN archived_items sai ON at.seller_exchange_item_archive_id = sai.archive_id
            LEFT JOIN archived_items bai ON at.buyer_exchange_item_archive_id = bai.archive_id
            WHERE at.seller_id = %s OR at.buyer_id = %s
            ORDER BY at.trade_completed_at DESC
            LIMIT %s OFFSET %s
        '''
        
        self.cursor.execute(query, (user_id, user_id, limit, offset))
        trades = self.cursor.fetchall()
        
        # 各取引の画像を取得
        for trade in trades:
            trade['item_images'] = self._get_archived_item_images(trade['item_archive_id'])
            if trade['seller_exchange_item_archive_id']:
                trade['seller_exchange_images'] = self._get_archived_item_images(
                    trade['seller_exchange_item_archive_id']
                )
            if trade['buyer_exchange_item_archive_id']:
                trade['buyer_exchange_images'] = self._get_archived_item_images(
                    trade['buyer_exchange_item_archive_id']
                )
        
        return trades
    
    def get_trade_detail(self, archive_trade_id):
        """特定の取引の詳細情報を取得"""
        # 取引基本情報
        self.cursor.execute('''
            SELECT * FROM archived_trades WHERE archive_trade_id = %s
        ''', (archive_trade_id,))
        trade = self.cursor.fetchone()
        
        if not trade:
            return None
        
        # 商品情報
        trade['main_item'] = self._get_archived_item(trade['item_archive_id'])
        
        if trade['seller_exchange_item_archive_id']:
            trade['seller_exchange_item'] = self._get_archived_item(
                trade['seller_exchange_item_archive_id']
            )
        
        if trade['buyer_exchange_item_archive_id']:
            trade['buyer_exchange_item'] = self._get_archived_item(
                trade['buyer_exchange_item_archive_id']
            )
        
        # メッセージ履歴
        trade['messages'] = self._get_archived_messages(archive_trade_id)
        
        # 配送情報
        trade['shipping_info'] = self._get_archived_shipping_info(archive_trade_id)
        
        # レビュー
        trade['reviews'] = self._get_archived_reviews(archive_trade_id)
        
        return trade
    
    def _get_archived_item(self, archive_id):
        """アーカイブされた商品情報を取得"""
        self.cursor.execute('''
            SELECT * FROM archived_items WHERE archive_id = %s
        ''', (archive_id,))
        item = self.cursor.fetchone()
        
        if item:
            item['images'] = self._get_archived_item_images(archive_id)
        
        return item
    
    def _get_archived_item_images(self, archive_id):
        """アーカイブされた商品画像を取得"""
        self.cursor.execute('''
            SELECT image_url FROM archived_item_images 
            WHERE archive_id = %s
            ORDER BY archive_image_id
        ''', (archive_id,))
        return [img['image_url'] for img in self.cursor.fetchall()]
    
    def _get_archived_messages(self, archive_trade_id):
        """アーカイブされたメッセージを取得"""
        self.cursor.execute('''
            SELECT * FROM archived_trade_messages
            WHERE archive_trade_id = %s
            ORDER BY sent_at
        ''', (archive_trade_id,))
        return self.cursor.fetchall()
    
    def _get_archived_shipping_info(self, archive_trade_id):
        """アーカイブされた配送情報を取得"""
        self.cursor.execute('''
            SELECT * FROM archived_shipping_info
            WHERE archive_trade_id = %s
        ''', (archive_trade_id,))
        return self.cursor.fetchall()
    
    def _get_archived_reviews(self, archive_trade_id):
        """アーカイブされたレビューを取得"""
        self.cursor.execute('''
            SELECT * FROM archived_trade_reviews
            WHERE archive_trade_id = %s
        ''', (archive_trade_id,))
        return self.cursor.fetchall()
    
    def search_archived_items(self, user_id=None, keyword=None, 
                            start_date=None, end_date=None,
                            limit=50, offset=0):
        """アーカイブされた商品を検索"""
        conditions = []
        params = []
        
        query = '''
            SELECT DISTINCT
                ai.*,
                at.trade_completed_at,
                at.seller_name,
                at.buyer_name
            FROM archived_items ai
            JOIN archived_trades at ON (
                ai.archive_id = at.item_archive_id OR
                ai.archive_id = at.seller_exchange_item_archive_id OR
                ai.archive_id = at.buyer_exchange_item_archive_id
            )
            WHERE 1=1
        '''
        
        if user_id:
            conditions.append('(ai.user_id = %s OR at.seller_id = %s OR at.buyer_id = %s)')
            params.extend([user_id, user_id, user_id])
        
        if keyword:
            conditions.append('(ai.title LIKE %s OR ai.description LIKE %s)')
            keyword_param = f'%{keyword}%'
            params.extend([keyword_param, keyword_param])
        
        if start_date:
            conditions.append('at.trade_completed_at >= %s')
            params.append(start_date)
        
        if end_date:
            conditions.append('at.trade_completed_at <= %s')
            params.append(end_date)
        
        if conditions:
            query += ' AND ' + ' AND '.join(conditions)
        
        query += ' ORDER BY at.trade_completed_at DESC LIMIT %s OFFSET %s'
        params.extend([limit, offset])
        
        self.cursor.execute(query, params)
        items = self.cursor.fetchall()
        
        # 各商品の画像を取得
        for item in items:
            item['images'] = self._get_archived_item_images(item['archive_id'])
        
        return items
    
    def get_user_statistics(self, user_id):
        """ユーザーの取引統計を取得"""
        stats = {}
        
        # 総取引数
        self.cursor.execute('''
            SELECT COUNT(*) as total_trades
            FROM archived_trades
            WHERE seller_id = %s OR buyer_id = %s
        ''', (user_id, user_id))
        stats['total_trades'] = self.cursor.fetchone()['total_trades']
        
        # 売却数と購入数
        self.cursor.execute('''
            SELECT 
                SUM(CASE WHEN seller_id = %s THEN 1 ELSE 0 END) as sold_count,
                SUM(CASE WHEN buyer_id = %s THEN 1 ELSE 0 END) as bought_count
            FROM archived_trades
        ''', (user_id, user_id))
        result = self.cursor.fetchone()
        stats['sold_count'] = result['sold_count'] or 0
        stats['bought_count'] = result['bought_count'] or 0
        
        # 平均評価
        self.cursor.execute('''
            SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
            FROM archived_trade_reviews
            WHERE reviewee_id = %s
        ''', (user_id,))
        result = self.cursor.fetchone()
        stats['avg_rating'] = result['avg_rating'] or 0
        stats['review_count'] = result['review_count'] or 0
        
        return stats