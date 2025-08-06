
from flask import Blueprint, jsonify ,request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector

users_bp = Blueprint('users', __name__, url_prefix='/api')

# ユーザー一覧取得
@users_bp.route('/getUsers' ,methods=['POST'] )
def getUsers():
    user_id = request.json.get('user_id',None )
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
            # 自分以外のユーザーとそのアイテムを取得（itemが新しい順）
            cursor.execute('''
                SELECT 
                    u.user_id,
                    u.name,
                    u.location,
                    u.age,
                    u.shop_name, 
                    u.shop_url,
                    u.uploaded_at,
                    IFNULL(p.image_url, '') AS image_url,
                    IFNULL(i.created_at, '') AS created_at,
                    IFNULL(ic.item_count, 0) AS item_count,
                    tg.tag,
                    CASE WHEN f1.follower_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_following,
                    CASE WHEN f2.followed_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_followed
                FROM users u
                LEFT JOIN profile_images p ON u.user_id = p.user_id
                LEFT JOIN tags tg ON u.user_id = tg.user_id
                LEFT JOIN (
                    SELECT *
                    FROM (
                        SELECT *,
                            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY uploaded_at DESC) AS rn
                        FROM items
                    ) ranked_items
                    WHERE rn = 1
                ) i ON u.user_id = i.user_id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) AS item_count
                    FROM items
                    GROUP BY user_id
                ) ic ON u.user_id = ic.user_id
                LEFT JOIN follows f1 ON f1.follower_id = %s AND f1.followed_id = u.user_id
                LEFT JOIN follows f2 ON f2.follower_id = u.user_id AND f2.followed_id = %s
                WHERE u.user_id != %s
                AND u.type = 1 
                ORDER BY i.uploaded_at DESC
            ''', (user_id, user_id, user_id))  #
            users = cursor.fetchall()
            
            for user in users:
                try:
                    user["tags"] = json.loads(user["tag"]) if user.get("tag") else []
                    #不要
                    user.pop('tag')
                except Exception:
                    user["tags"] = []
                    #不要
                    user.pop('tag')
                    
            cursor.execute('''
                SELECT tag FROM tags
                WHERE user_id != %s
            ''', (user_id,))
            tag_rows = cursor.fetchall()
            
            unique_tags = {}
            for row in tag_rows:
                tag_list = json.loads(row['tag'])
                for tag in tag_list:
                    key = tag.get('key')
                    name = tag.get('name')
                    if key not in unique_tags:
                        unique_tags[key] = name

            # 辞書 → list に変換
            tags = [{'key': k, 'name': v} for k, v in unique_tags.items()]

            return jsonify({"users": users, "tags" :tags ,"result": True}), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "ユーザー取得中にエラーが発生しました",
            "result": False
        }), 500

# ユーザー　フォロー　フィロー解除
@users_bp.route('/userFollow' ,methods=['POST'])
def userFollow():
    follow_user_id = request.json.get('follew_user_id',None )
    my_user_id = request.json.get('my_user_id',None )
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
            # すでにフォローしているかチェック
            cursor.execute('''
                SELECT 1 FROM follows
                WHERE follower_id = %s AND followed_id = %s
            ''', (my_user_id, follow_user_id))
            already_following = cursor.fetchone()

            if already_following:
                # 既にフォローしている場合 → フォロー解除（DELETE）
                cursor.execute('''
                    DELETE FROM follows
                    WHERE follower_id = %s AND followed_id = %s
                ''', (my_user_id, follow_user_id))
                action = "フォロー解除しました。"
            else:
                # フォローしていない場合 → 新たにフォロー（INSERT）
                cursor.execute('''
                    INSERT INTO follows (follower_id, followed_id)
                    VALUES (%s, %s)
                ''', (my_user_id, follow_user_id))
                action = "フォローしました。"

            conn.commit()

            return jsonify({"result": True, "action": action}), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "申請中にエラーが発生しました",
            "result": False
        }), 500

    user_id = request.json.get('item_id',None )
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # dict形式で取得できるようにする
    
    # 洗濯した商品からユーザーデータを取得
    try:
        cursor.execute('''
            SELECT 
                items.item_id,
                items.title,
                items.description,
                item.type,
                item.brand,
                users.name,
                users.user_id
            FROM items
            WHERE items.item_id != %s
            LEFT JOIN users ON items.user_id = users.user_id
            ORDER BY users.uploaded_at ASC
        ''', (user_id,))
        
        user_row = cursor.fetchall()

        return jsonify({
            "users": user_row,
            "result": True
        }), 200

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({
            "error": "ユーザーデータ取得中にエラーが発生しました",
            "result": False
        }), 500

    finally:
        conn.close()
        cursor.close()
