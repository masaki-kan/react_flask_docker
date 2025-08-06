
from datetime import datetime

class TradeArchiver:
    def __init__(self, db_connection):
        self.db = db_connection
        self.cursor = None
    
    def archive_trade(self, trade_id):
        """取引完了時に関連するすべてのデータをアーカイブ（スナップショット方式）"""
        try:
            # 新しいカーソルを作成
            self.cursor = self.db.cursor(dictionary=True)
            
            # 1. 取引情報を取得（全関連データ含む）
            trade = self._get_complete_trade_info(trade_id)
            if not trade:
                raise Exception(f"Trade {trade_id} not found")
            
            # 2. メイン商品をアーカイブ
            main_item_archive_id = self._archive_item_with_details(trade['item_id'])
            
            # 3. 交換商品をアーカイブ（存在する場合）
            seller_exchange_archive_id = None
            buyer_exchange_archive_id = None
            
            if trade['seller_exchange_item_id']:
                seller_exchange_archive_id = self._archive_item_with_details(
                    trade['seller_exchange_item_id']
                )
            
            if trade['buyer_exchange_item_id']:
                buyer_exchange_archive_id = self._archive_item_with_details(
                    trade['buyer_exchange_item_id']
                )
            
            # 4. 取引をアーカイブ（より詳細な情報を含む）
            archive_trade_id = self._archive_trade_with_metadata(
                trade, 
                main_item_archive_id,
                seller_exchange_archive_id,
                buyer_exchange_archive_id
            )
            
            # 5. メッセージをアーカイブ（プロフィール画像含む）
            self._archive_messages_with_profiles(trade_id, archive_trade_id)
            
            # 6. 配送情報をアーカイブ
            self._archive_shipping_info(trade_id, archive_trade_id)
            
            # 7. レビューをアーカイブ
            self._archive_reviews(trade_id, archive_trade_id)
            
            # 8. 取引確認情報をアーカイブ
            self._archive_confirmations(trade_id, archive_trade_id)
            
            # カーソルを閉じる
            if self.cursor:
                self.cursor.close()
            
            return archive_trade_id
            
        except Exception as e:
            if self.cursor:
                self.cursor.close()
            raise e
    
    def _get_complete_trade_info(self, trade_id):
        """取引情報と関連する全情報を取得"""
        query = '''
            SELECT 
                t.*,
                s.name as seller_name,
                s.email as seller_email,
                s.location as seller_location,
                b.name as buyer_name,
                b.email as buyer_email,
                b.location as buyer_location
            FROM trades t
            JOIN users s ON t.seller_id = s.user_id
            JOIN users b ON t.buyer_id = b.user_id
            WHERE t.trade_id = %s
        '''
        self.cursor.execute(query, (trade_id,))
        return self.cursor.fetchone()
    
    def _archive_item_with_details(self, item_id):
        """商品と関連情報を詳細にアーカイブ"""
        # 商品情報を取得
        self.cursor.execute('''
            SELECT i.*, u.name as owner_name
            FROM items i
            JOIN users u ON i.user_id = u.user_id
            WHERE i.item_id = %s
        ''', (item_id,))
        item = self.cursor.fetchone()
        
        if not item:
            return None
        
        # archived_itemsに挿入（拡張情報含む）
        self.cursor.execute('''
            INSERT INTO archived_items (
                original_item_id, user_id, title, description, 
                type, brand, status, original_owner_id,
                exchanged_at, item_created_at, item_uploaded_at,
                owner_name_at_archive
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        ''', (
            item['item_id'], item['user_id'], item['title'],
            item['description'], item['type'], item['brand'],
            item['status'], item['original_owner_id'],
            item['exchanged_at'], item['created_at'], item['uploaded_at'],
            item['owner_name']
        ))
        
        archive_id = self.cursor.lastrowid
        
        # 画像をアーカイブ
        self.cursor.execute('''
            SELECT * FROM item_images WHERE item_id = %s
            ORDER BY uploaded_at ASC
        ''', (item_id,))
        images = self.cursor.fetchall()
        
        for idx, image in enumerate(images):
            self.cursor.execute('''
                INSERT INTO archived_item_images (
                    archive_id, original_item_image_id, image_url, image_order
                ) VALUES (%s, %s, %s, %s)
            ''', (archive_id, image['item_image_id'], image['image_url'], idx))
        
        return archive_id
    
    def _archive_trade_with_metadata(self, trade, main_item_archive_id, 
                                   seller_exchange_archive_id, buyer_exchange_archive_id):
        """取引情報を詳細メタデータと共にアーカイブ"""
        # プロフィール画像を取得
        self.cursor.execute('''
            SELECT image_url FROM profile_images 
            WHERE user_id = %s 
            ORDER BY uploaded_at DESC LIMIT 1
        ''', (trade['seller_id'],))
        seller_profile = self.cursor.fetchone()
        seller_profile_image = seller_profile['image_url'] if seller_profile else None
        
        self.cursor.execute('''
            SELECT image_url FROM profile_images 
            WHERE user_id = %s 
            ORDER BY uploaded_at DESC LIMIT 1
        ''', (trade['buyer_id'],))
        buyer_profile = self.cursor.fetchone()
        buyer_profile_image = buyer_profile['image_url'] if buyer_profile else None
        
        self.cursor.execute('''
            INSERT INTO archived_trades (
                original_trade_id, item_archive_id, seller_id, buyer_id,
                seller_exchange_item_archive_id, buyer_exchange_item_archive_id,
                final_status, trade_created_at, trade_completed_at,
                seller_name, seller_email, buyer_name, buyer_email,
                seller_location, buyer_location,
                seller_profile_image_at_archive, buyer_profile_image_at_archive
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        ''', (
            trade['trade_id'], main_item_archive_id, trade['seller_id'],
            trade['buyer_id'], seller_exchange_archive_id,
            buyer_exchange_archive_id, trade['status'],
            trade['created_at'], datetime.now(),
            trade['seller_name'], trade['seller_email'],
            trade['buyer_name'], trade['buyer_email'],
            trade['seller_location'], trade['buyer_location'],
            seller_profile_image, buyer_profile_image
        ))
        
        return self.cursor.lastrowid
    
    def _archive_messages_with_profiles(self, trade_id, archive_trade_id):
        """メッセージをプロフィール画像と共にアーカイブ"""
        self.cursor.execute('''
            SELECT 
                m.*,
                u.name as sender_name,
                pi.image_url as sender_profile_image
            FROM trade_messages m
            JOIN users u ON m.sender_id = u.user_id
            LEFT JOIN (
                SELECT user_id, image_url
                FROM profile_images pi1
                WHERE uploaded_at = (
                    SELECT MAX(uploaded_at)
                    FROM profile_images pi2
                    WHERE pi2.user_id = pi1.user_id
                )
            ) pi ON m.sender_id = pi.user_id
            WHERE m.trade_id = %s
            ORDER BY m.sent_at ASC
        ''', (trade_id,))
        
        messages = self.cursor.fetchall()
        
        for msg in messages:
            self.cursor.execute('''
                INSERT INTO archived_trade_messages (
                    archive_trade_id, sender_id, sender_name, 
                    message, sent_at, sender_profile_image_at_archive
                ) VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                archive_trade_id, msg['sender_id'], msg['sender_name'],
                msg['message'], msg['sent_at'], msg['sender_profile_image']
            ))
    
    def _archive_confirmations(self, trade_id, archive_trade_id):
        """取引確認情報をアーカイブ"""
        self.cursor.execute('''
            SELECT 
                tc.*,
                u.name as user_name
            FROM trade_confirmations tc
            JOIN users u ON tc.user_id = u.user_id
            WHERE tc.trade_id = %s
        ''', (trade_id,))
        
        confirmations = self.cursor.fetchall()
        
        for conf in confirmations:
            self.cursor.execute('''
                INSERT INTO archived_trade_confirmations (
                    archive_trade_id, user_id, user_name,
                    confirmation_type, confirmed_at
                ) VALUES (%s, %s, %s, %s, %s)
            ''', (
                archive_trade_id, conf['user_id'], conf['user_name'],
                conf['confirmation_type'], conf['created_at']
            ))
    
    def _archive_shipping_info(self, trade_id, archive_trade_id):
        """配送情報をアーカイブ"""
        self.cursor.execute('''
            SELECT s.*, u.name as sender_name
            FROM shipping_info s
            JOIN users u ON s.sender_user_id = u.user_id
            WHERE s.trade_id = %s
        ''', (trade_id,))
        
        shipping_info = self.cursor.fetchall()
        
        for info in shipping_info:
            self.cursor.execute('''
                INSERT INTO archived_shipping_info (
                    archive_trade_id, sender_user_id, sender_name,
                    tracking_number, shipping_company, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                archive_trade_id, info['sender_user_id'], info['sender_name'],
                info['tracking_number'], info['shipping_company'], info['created_at']
            ))
    
    def _archive_reviews(self, trade_id, archive_trade_id):
        """取引完了時にレビュー枠を新規作成（1レコードに買い手・売り手両方のコメント欄）"""
        
        # 取引情報から売り手と買い手の情報を取得
        self.cursor.execute('''
            SELECT 
                t.seller_id, t.buyer_id,
                s.name as seller_name,
                b.name as buyer_name
            FROM trades t
            JOIN users s ON t.seller_id = s.user_id
            JOIN users b ON t.buyer_id = b.user_id
            WHERE t.trade_id = %s
        ''', (trade_id,))
        
        trade_info = self.cursor.fetchone()
        
        if trade_info:
            # 1つのレコードを作成（reviewer_idとreviewee_idは取引の主従関係に基づく）
            # ここでは買い手を reviewer、売り手を reviewee として設定
            self.cursor.execute('''
                INSERT INTO archived_trade_reviews (
                    archive_trade_id, 
                    reviewer_id, 
                    reviewer_name,
                    reviewee_id, 
                    reviewee_name, 
                    rating, 
                    reviewer_comment,    -- 買い手のコメント
                    reviewee_comment,    -- 売り手のコメント（返信）
                    reviewed_at
                ) VALUES (%s, %s, %s, %s, %s, NULL, NULL, NULL, NULL)
            ''', (
                archive_trade_id, 
                trade_info['buyer_id'], 
                trade_info['buyer_name'],
                trade_info['seller_id'], 
                trade_info['seller_name']
            ))