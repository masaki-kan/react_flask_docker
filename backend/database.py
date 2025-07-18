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
            token VARCHAR(255),
            shop_name VARCHAR(255),
            shop_url VARCHAR(255),
            reasen TEXT,
            stripe_customer_id VARCHAR(255) NOT NULL,
            plan  VARCHAR(1) DEFAULT '1',
            type INT DEFAULT 1, -- 0 : 管理者, 1 : 利用者
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
            FOREIGN KEY (user_id) REFERENCES users(user_id)
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
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
            FOREIGN KEY (item_id) REFERENCES items(item_id)
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
            UNIQUE (user_id, item_id)
        );
    ''')

# 取引テーブル
def create_trades_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            trade_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            seller_id INT NOT NULL,
            buyer_id INT NOT NULL,
            status ENUM('pending', 'purchased','shipped','completed','cancelled') DEFAULT 'pending',
            is_buyer_confirmed BOOLEAN DEFAULT FALSE,
            is_seller_confirmed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
            FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
            UNIQUE (item_id, buyer_id)
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

# 取引評価テーブル
def create_trade_reviews_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trade_reviews (
            review_id INT AUTO_INCREMENT PRIMARY KEY,
            trade_id INT NOT NULL,
            reviewer_id INT NOT NULL,
            reviewee_id INT NOT NULL,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(trade_id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
    ''')

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
    create_trade_reviews_table(cursor)
    create_shipping_info_table(cursor) 
    create_trade_confirmations_table(cursor)  