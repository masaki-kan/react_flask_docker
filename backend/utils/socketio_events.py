from flask import request
from flask_socketio import emit, join_room
from utils.db_utils import get_db_connection_legacy
import mysql.connector

# グローバル変数
_socketio = None

def init_socketio(socketio):
    """SocketIOインスタンスを初期化"""
    global _socketio
    _socketio = socketio

def emit_thread_message(thread_message_id, user_id):
    """新しいスレッドメッセージを通知"""
    if _socketio:
        _socketio.emit('new_thread_message', {
            'thread_message_id': thread_message_id,
            'user_id': user_id
        }, to='thread_room')

def emit_thread_message_deleted(thread_message_id, user_id):
    """スレッドメッセージの削除を通知"""
    if _socketio:
        _socketio.emit('thread_message_deleted', {
            'thread_message_id': thread_message_id,
            'user_id': user_id
        }, to='thread_room')

def register_socketio_handlers(socketio):
    """WebSocketハンドラーを登録"""
    init_socketio(socketio)
    
    @socketio.on('connect')
    def handle_connect():
        print('クライアントがWebSocketで接続しました', request.sid, flush=True)

    @socketio.on('join')
    def handle_join(data):
        room = data['room']
        join_room(room)
        print(f'Client joined room: {room}', flush=True)

    @socketio.on('send_message')
    def handle_send_message(data):
        room = data['room']
        message = data['message']
        trade_id = data['trade_id']
        sender_id = data['sender_id']
        
        # DBに保存
        conn = None
        cursor = None
        try:
            conn = get_db_connection_legacy()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                INSERT INTO trade_messages (trade_id, sender_id, message)
                VALUES (%s, %s, %s)
            ''', (trade_id, sender_id, message))
            conn.commit()
            
            # 最新のプロフィール画像を取得
            cursor.execute('''
                SELECT image_url 
                FROM profile_images 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC 
                LIMIT 1
            ''', (sender_id,))
            image_row = cursor.fetchone()
            image_url = image_row['image_url'] if image_row else ""

            emit('receive_message', {
                'message': message,
                'sender_id': sender_id,
                'sender_image_url': image_url
            }, to=room)
        except mysql.connector.Error as err:
            print(f"WebSocket error: {err}", flush=True)
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected:', request.sid)

    @socketio.on('join_thread')
    def handle_join_thread():
        join_room('thread_room')