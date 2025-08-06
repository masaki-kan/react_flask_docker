
from flask import Blueprint, jsonify, request
# WebSocketで通知
from utils.socketio_events import emit_thread_message
from flask_jwt_extended import jwt_required
from flask_socketio import emit, join_room
from utils.db_utils import get_db_connection
import json
import mysql.connector

thread_bp = Blueprint('thread', __name__, url_prefix='/api')

# スレッドメッセージ一覧取得（フィルタリング付き）
@thread_bp.route('/thread/messages', methods=['GET'])
def get_thread_messages():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    filter_type = request.args.get('filter', 'all')
    
    # user_idを確実に整数に変換
    try:
        current_user_id = request.args.get('user_id')
        if current_user_id:
            current_user_id = int(current_user_id)
    except (ValueError, TypeError):
        current_user_id = None
    
    offset = (page - 1) * limit
    
    print(f"Debug - filter_type: {filter_type}, current_user_id: {current_user_id}, type: {type(current_user_id)}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # デバッグ: フォロー関係を確認
            if current_user_id and filter_type == 'following':
                cursor.execute('''
                    SELECT follower_id, followed_id 
                    FROM follows 
                    WHERE follower_id = %s
                ''', (current_user_id,))
                follow_relations = cursor.fetchall()
                print(f"Debug - Follow relations for user {current_user_id}: {follow_relations}")
            
            # メインクエリの構築
            if filter_type == 'following' and current_user_id:
                # フォロー中のユーザーのメッセージのみ
                query = '''
                    SELECT DISTINCT
                        tm.thread_message_id,
                        tm.user_id,
                        tm.message,
                        tm.created_at,
                        u.name as user_name,
                        u.location as user_location,
                        pi.image_url as user_image
                    FROM thread_messages tm
                    INNER JOIN users u ON tm.user_id = u.user_id
                    INNER JOIN follows f ON tm.user_id = f.followed_id
                    LEFT JOIN (
                        SELECT user_id, image_url
                        FROM profile_images pi1
                        WHERE uploaded_at = (
                            SELECT MAX(uploaded_at)
                            FROM profile_images pi2
                            WHERE pi2.user_id = pi1.user_id
                        )
                    ) pi ON u.user_id = pi.user_id
                    WHERE tm.is_deleted = FALSE
                    AND f.follower_id = %s
                    ORDER BY tm.created_at DESC
                    LIMIT %s OFFSET %s
                '''
                params = [current_user_id, limit, offset]
                
            elif filter_type == 'followers' and current_user_id:
                # フォロワーのメッセージのみ
                query = '''
                    SELECT DISTINCT
                        tm.thread_message_id,
                        tm.user_id,
                        tm.message,
                        tm.created_at,
                        u.name as user_name,
                        u.location as user_location,
                        pi.image_url as user_image
                    FROM thread_messages tm
                    INNER JOIN users u ON tm.user_id = u.user_id
                    INNER JOIN follows f ON tm.user_id = f.follower_id
                    LEFT JOIN (
                        SELECT user_id, image_url
                        FROM profile_images pi1
                        WHERE uploaded_at = (
                            SELECT MAX(uploaded_at)
                            FROM profile_images pi2
                            WHERE pi2.user_id = pi1.user_id
                        )
                    ) pi ON u.user_id = pi.user_id
                    WHERE tm.is_deleted = FALSE
                    AND f.followed_id = %s
                    ORDER BY tm.created_at DESC
                    LIMIT %s OFFSET %s
                '''
                params = [current_user_id, limit, offset]
                
            else:
                # すべてのメッセージ
                query = '''
                    SELECT 
                        tm.thread_message_id,
                        tm.user_id,
                        tm.message,
                        tm.created_at,
                        u.name as user_name,
                        u.location as user_location,
                        pi.image_url as user_image
                    FROM thread_messages tm
                    INNER JOIN users u ON tm.user_id = u.user_id
                    LEFT JOIN (
                        SELECT user_id, image_url
                        FROM profile_images pi1
                        WHERE uploaded_at = (
                            SELECT MAX(uploaded_at)
                            FROM profile_images pi2
                            WHERE pi2.user_id = pi1.user_id
                        )
                    ) pi ON u.user_id = pi.user_id
                    WHERE tm.is_deleted = FALSE
                    ORDER BY tm.created_at DESC
                    LIMIT %s OFFSET %s
                '''
                params = [limit, offset]
            
            # print(f"Debug - Query params: {params}")
            cursor.execute(query, params)
            messages = cursor.fetchall()
            
            # print(f"Debug - Messages count: {len(messages)}")
            
            # 総件数を取得
            if filter_type == 'following' and current_user_id:
                count_query = '''
                    SELECT COUNT(DISTINCT tm.thread_message_id) as total 
                    FROM thread_messages tm
                    INNER JOIN follows f ON tm.user_id = f.followed_id
                    WHERE tm.is_deleted = FALSE
                    AND f.follower_id = %s
                '''
                cursor.execute(count_query, [current_user_id])
            elif filter_type == 'followers' and current_user_id:
                count_query = '''
                    SELECT COUNT(DISTINCT tm.thread_message_id) as total 
                    FROM thread_messages tm
                    INNER JOIN follows f ON tm.user_id = f.follower_id
                    WHERE tm.is_deleted = FALSE
                    AND f.followed_id = %s
                '''
                cursor.execute(count_query, [current_user_id])
            else:
                count_query = '''
                    SELECT COUNT(*) as total 
                    FROM thread_messages tm
                    WHERE tm.is_deleted = FALSE
                '''
                cursor.execute(count_query)
                
            total = cursor.fetchone()['total']
            
            # 日付をISO形式に変換、user_idを文字列に変換
            for msg in messages:
                if msg.get('created_at'):
                    msg['created_at'] = msg['created_at'].isoformat()
                # user_idを文字列に統一（フロントエンド用）
                msg['user_id'] = str(msg['user_id'])
            
            # フォロー・フォロワーのカウントを取得
            follow_counts = {'following': 0, 'followers': 0}
            if current_user_id:
                # フォロー中のユーザーでメッセージを投稿した人数
                cursor.execute('''
                    SELECT COUNT(DISTINCT tm.user_id) as count
                    FROM thread_messages tm
                    INNER JOIN follows f ON tm.user_id = f.followed_id
                    WHERE f.follower_id = %s 
                    AND tm.is_deleted = FALSE
                ''', (current_user_id,))
                follow_counts['following'] = cursor.fetchone()['count']
                
                # フォロワーでメッセージを投稿した人数
                cursor.execute('''
                    SELECT COUNT(DISTINCT tm.user_id) as count
                    FROM thread_messages tm
                    INNER JOIN follows f ON tm.user_id = f.follower_id
                    WHERE f.followed_id = %s 
                    AND tm.is_deleted = FALSE
                ''', (current_user_id,))
                follow_counts['followers'] = cursor.fetchone()['count']

            return jsonify({
                "result": True,
                "messages": messages,
                "total": total,
                "page": page,
                "limit": limit,
                "has_more": offset + limit < total,
                "follow_counts": follow_counts
            }), 200
        
    except Exception as e:
        print(f"Error in get_thread_messages: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
# スレッドメッセージ投稿
@thread_bp.route('/thread/post', methods=['POST'])
def post_thread_message():
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')
    
    if not message or not message.strip():
        return jsonify({"error": "メッセージは必須です"}), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO thread_messages (user_id, message)
                VALUES (%s, %s)
            ''', (user_id, message))
            
            thread_message_id = cursor.lastrowid
            conn.commit()
            
  
            emit_thread_message(thread_message_id, user_id)

            return jsonify({
                "result": True,
                "message": "投稿しました",
                "thread_message_id": thread_message_id
            }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# スレッドメッセージ削除（論理削除）
@thread_bp.route('/thread/delete', methods=['POST'])
def delete_thread_message():
    data = request.get_json()
    thread_message_id = data.get('thread_message_id')
    user_id = data.get('user_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 所有者確認
            cursor.execute('''
                SELECT user_id FROM thread_messages 
                WHERE thread_message_id = %s AND is_deleted = FALSE
            ''', (thread_message_id,))
            
            message = cursor.fetchone()
            if not message:
                return jsonify({"error": "メッセージが見つかりません"}), 404
                
            if int(message['user_id']) != int(user_id):
                return jsonify({"error": "削除権限がありません"}), 403
            
            # 論理削除
            cursor.execute('''
                UPDATE thread_messages 
                SET is_deleted = TRUE 
                WHERE thread_message_id = %s
            ''', (thread_message_id,))
            
            conn.commit()
            
            # socketio.emit('thread_message_deleted', {
            #     'thread_message_id': thread_message_id,
            #     'user_id': user_id
            # }, to='thread_room')

            return jsonify({"result": True, "message": "削除しました"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# WebSocketハンドラーを登録する関数
def register_thread_socketio_handlers(socketio):
    """WebSocketハンドラーを登録"""
    
    # リアルタイム更新用WebSocket
    @socketio.on('join_thread')
    def handle_join_thread():
        join_room('thread_room')