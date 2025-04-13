

def create_users_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            old INT,
            age INT,
            token VARCHAR(255),
            shop_name VARCHAR(255),
            shop_url VARCHAR(255),
            reasen TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
def create_profile_images_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profile_images (
            profile_image_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    ''')
    
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
    
def create_plans_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plans (
            plan_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            type VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    ''')  
    
def create_items_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            title VARCHAR(255),
            description TEXT,
            type JSON,
            brand JSON,
            curr VARCHAR(10),
            price INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    ''')
    
def create_item_images_table(cursor):
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS item_images (
            item_image_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT,
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(item_id)
        );
    ''')
    

def create_table(cursor):
    create_users_table(cursor)
    create_profile_images_table(cursor)
    create_tags_table(cursor)
    create_plans_table(cursor)
    create_items_table(cursor)
    create_item_images_table(cursor)