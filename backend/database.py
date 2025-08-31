# ユーザーテーブル
def create_users_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            old INT DEFAULT 0,
            age INT DEFAULT 1,
            shop_name VARCHAR(255),
            shop_url VARCHAR(255),
            reasen TEXT,
            stripe_customer_id VARCHAR(255),
            plan VARCHAR(1) DEFAULT '1',
            status INT DEFAULT 1, -- 必要ないカラムあとで削除
            type INT DEFAULT 1, -- 0 : 管理者, 1 : 利用者
            is_deleted BOOLEAN DEFAULT FALSE COMMENT '論理削除フラグ',
            deleted_at TIMESTAMP NULL COMMENT '削除日時',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_users_active (is_deleted, email),
            INDEX idx_users_deleted_at (deleted_at),
            INDEX idx_email (email),
            INDEX idx_stripe_customer (stripe_customer_id)
        );
    ''')
    
    

# ユーザーフォローテーブル
def create_follows_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS follows (
            follow_id INT AUTO_INCREMENT PRIMARY KEY,
            follower_id INT NOT NULL,  -- フォローする側（自分）
            followed_id INT NOT NULL,  -- フォローされる側（相手）
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (followed_id) REFERENCES users(user_id) ON DELETE CASCADE,
            UNIQUE (follower_id, followed_id)  -- 重複フォローを防止
        );
    ''')

# プロフィール画像テーブル
def create_profile_images_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profile_images (
            profile_image_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            image_url LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            INDEX idx_user_uploaded (user_id, uploaded_at DESC)
        );
    ''')

# プロフィール　タグテーブル
def create_tags_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            tag_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            tag JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    ''')
    
# 商品テーブル
def create_items_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255),
            description TEXT,
            type JSON,
            brand JSON,
            status ENUM('available', 'trading', 'exchanged', 'deleted') DEFAULT 'available',
            original_owner_id INT DEFAULT NULL,
            exchanged_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (original_owner_id) REFERENCES users(user_id),
            -- 既存のインデックス
            INDEX idx_status (status),
            INDEX idx_user_status (user_id, status),
            INDEX idx_uploaded_at (uploaded_at DESC),
            INDEX idx_user_uploaded (user_id, uploaded_at DESC),
            FULLTEXT INDEX idx_fulltext (title, description)
        );
    ''')

# 商品イメージテーブル
def create_item_images_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS item_images (
            item_image_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT,
            user_id INT,
            image_url LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(item_id),
            INDEX idx_item_uploaded (item_id, uploaded_at ASC)
        );
    ''')

# 商品お気に入りテーブル
def create_likes_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            like_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            item_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
            UNIQUE (user_id, item_id),
            INDEX idx_user (user_id)
        );
    ''')

# 取引テーブル（seller_exchange_item_id、buyer_exchange_item_id を含む）
def create_trades_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            trade_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            seller_id INT NOT NULL,
            buyer_id INT NOT NULL,
            seller_exchange_item_id INT DEFAULT NULL,
            buyer_exchange_item_id INT DEFAULT NULL,
            # 🔥 オプション変更: 'approved'を追加する場合はコメントアウトを解除
            # status ENUM('pending', 'approved', 'purchased','shipped','completed','cancelled') DEFAULT 'pending',
            status ENUM('pending', 'purchased','shipped','completed','cancelled') DEFAULT 'pending',
            is_buyer_confirmed BOOLEAN DEFAULT FALSE,
            is_seller_confirmed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
            FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (seller_exchange_item_id) REFERENCES items(item_id),
            FOREIGN KEY (buyer_exchange_item_id) REFERENCES items(item_id),
            UNIQUE (item_id, buyer_id),
            # 🔥 追加: パフォーマンス向上のためのインデックス
            INDEX idx_trade_status (trade_id, status),
            INDEX idx_exchange_items (seller_exchange_item_id, buyer_exchange_item_id)
        );
    ''')

# チャットテーブル
def create_trade_messages_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_messages (
            message_id INT AUTO_INCREMENT PRIMARY KEY,
            trade_id INT NOT NULL,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
    ''')

# 発送情報テーブル
def create_shipping_info_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shipping_info (
            shipping_id INT AUTO_INCREMENT PRIMARY KEY,
            trade_id INT NOT NULL,
            sender_user_id INT NOT NULL,
            tracking_number VARCHAR(255),
            shipping_company VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
            FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            UNIQUE (trade_id, sender_user_id) -- 同じ取引で同じユーザーが2回送信できない
        );
    ''')

# 商品受け取り確認テーブル
def create_trade_confirmations_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_confirmations (
            confirmation_id INT AUTO_INCREMENT PRIMARY KEY,
            trade_id INT NOT NULL,
            user_id INT NOT NULL,  -- 確認したユーザー
            confirmation_type ENUM('item_received') NOT NULL,  -- 自分が相手の商品を受け取った
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            UNIQUE (trade_id, user_id)  -- 同じ取引で同じユーザーは1回のみ確認
        );
    ''')

# 交換履歴テーブル
def create_trade_exchanges_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_exchanges (
            exchange_id INT AUTO_INCREMENT PRIMARY KEY,
            trade_id INT NOT NULL,
            offered_item_id INT NOT NULL,  -- 提供した商品
            received_item_id INT NOT NULL,  -- 受け取った商品
            user_id INT NOT NULL,           -- このレコードの所有者
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
            FOREIGN KEY (offered_item_id) REFERENCES items(item_id),
            FOREIGN KEY (received_item_id) REFERENCES items(item_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE KEY unique_exchange (trade_id, user_id)
        );
    ''')
    

# アーカイブ用テーブル定義

# アーカイブ商品テーブル（商品の完全なスナップショット）
def create_archived_items_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS archived_items (
            archive_id INT AUTO_INCREMENT PRIMARY KEY,
            original_item_id INT NOT NULL,  -- 元の商品ID（参照用）
            user_id INT NOT NULL,
            title VARCHAR(255),
            description TEXT,
            type JSON,
            brand JSON,
            status VARCHAR(50),  -- 取引完了時のステータス
            original_owner_id INT,
            exchanged_at TIMESTAMP,
            item_created_at TIMESTAMP,  -- 元の商品作成日時
            item_uploaded_at TIMESTAMP,  -- 元の商品アップロード日時
            owner_name_at_archive VARCHAR(100) COMMENT '商品所有者名（アーカイブ時点）',
            archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- アーカイブ作成日時
            
            -- 削除されたユーザーでも履歴は残る
            INDEX idx_user_id (user_id),
            INDEX idx_original_item_id (original_item_id),
            INDEX idx_archived_at (archived_at DESC)
        );
    ''')

    
# アーカイブ商品画像テーブル
def create_archived_item_images_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS archived_item_images (
            archive_image_id INT AUTO_INCREMENT PRIMARY KEY,
            archive_id INT NOT NULL,  -- archived_itemsのarchive_idを参照
            original_item_image_id INT,
            image_url LONGTEXT,
            image_order INT DEFAULT 0 COMMENT '画像の表示順序',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (archive_id) REFERENCES archived_items(archive_id) ON DELETE CASCADE,
            INDEX idx_archive_order (archive_id, image_order)
        );
    ''')

# アーカイブ取引テーブル（取引の完全な記録）
def create_archived_trades_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS archived_trades (
            archive_trade_id INT AUTO_INCREMENT PRIMARY KEY,
            original_trade_id INT NOT NULL,  -- 元の取引ID
            item_archive_id INT NOT NULL,  -- archived_itemsのarchive_id
            seller_id INT NOT NULL,
            buyer_id INT NOT NULL,
            seller_exchange_item_archive_id INT,  -- 交換商品のアーカイブID
            buyer_exchange_item_archive_id INT,  -- 交換商品のアーカイブID
            final_status VARCHAR(50),  -- 完了時のステータス
            trade_created_at TIMESTAMP,  -- 元の取引作成日時
            trade_completed_at TIMESTAMP,  -- 取引完了日時
            
            -- ユーザー情報のスナップショット（削除されても保持）
            seller_name VARCHAR(255),
            seller_email VARCHAR(255),
            buyer_name VARCHAR(255),
            buyer_email VARCHAR(255),
            seller_location VARCHAR(100) COMMENT '売り手の地域（アーカイブ時点）',
            buyer_location VARCHAR(100) COMMENT '買い手の地域（アーカイブ時点）',
            seller_profile_image_at_archive LONGTEXT COMMENT '売り手のプロフィール画像（アーカイブ時点）',
            buyer_profile_image_at_archive LONGTEXT COMMENT '買い手のプロフィール画像（アーカイブ時点）',
            
            archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (item_archive_id) REFERENCES archived_items(archive_id),
            FOREIGN KEY (seller_exchange_item_archive_id) REFERENCES archived_items(archive_id),
            FOREIGN KEY (buyer_exchange_item_archive_id) REFERENCES archived_items(archive_id),
            INDEX idx_seller_id (seller_id),
            INDEX idx_buyer_id (buyer_id),
            INDEX idx_original_trade_id (original_trade_id),
            INDEX idx_completed_at (trade_completed_at DESC),
            INDEX idx_archived_at_cleanup (archived_at)
        );
    ''')

# スレッドメッセージテーブル
def create_thread_messages_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS thread_messages (
            thread_message_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_created_at (created_at DESC),
            INDEX idx_user_id (user_id)
        );
    ''')
    
def create_cleanup_logs_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cleanup_logs (
            log_id INT AUTO_INCREMENT PRIMARY KEY,
            cleanup_type VARCHAR(50),
            deleted_count INT DEFAULT 0,
            cleanup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cleanup_date (cleanup_date DESC)
        );
    ''')

# 退会ログテーブルを作成する関数
def create_withdrawal_logs_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS withdrawal_logs (
            log_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            stripe_customer_id VARCHAR(255),
            withdrawal_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at DESC)
        );
    ''')
    
    
# アーカイブテーブル作成関数
def create_archive_tables(cursor):
    create_archived_items_table(cursor)
    create_archived_item_images_table(cursor)
    create_archived_trades_table(cursor)

def create_table(cursor):
    create_users_table(cursor)
    create_follows_table(cursor)
    create_profile_images_table(cursor)
    create_tags_table(cursor)
    create_items_table(cursor)
    create_item_images_table(cursor)
    create_likes_table(cursor)
    create_trades_table(cursor)
    create_trade_messages_table(cursor)
    create_shipping_info_table(cursor) 
    create_trade_confirmations_table(cursor)
    create_trade_exchanges_table(cursor)
    create_archive_tables(cursor)
    create_thread_messages_table(cursor)
    create_cleanup_logs_table(cursor) 
    create_withdrawal_logs_table(cursor)