from flask import Blueprint, jsonify ,request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
import json
from utils.image_utils import s3_client ,upload_image_to_s3
import uuid


saves_bp = Blueprint('saves', __name__, url_prefix='/api')

@saves_bp.route('/getSavedList', methods=['POST'])
def get_active_trades():
    user_id = request.json.get('user_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT 
                    trades.trade_id,
                    trades.created_at AS trade_created_at,
                    trades.status,
                    items.item_id,
                    items.user_id AS seller_id,
                    trades.buyer_id,
                    items.title,
                    items.description,
                    items.type,
                    items.brand,
                    item_img.image_url,
                    users.name AS user_name,
                    users.user_id AS user_id,
                    profile_img.image_url AS user_image_url,
                    tm.last_message_time 
                FROM trades
                JOIN items ON trades.item_id = items.item_id
                JOIN users ON items.user_id = users.user_id
                LEFT JOIN (
                    SELECT ii.item_id, ii.image_url
                    FROM item_images ii
                    WHERE ii.item_image_id = (
                        SELECT MIN(ii2.item_image_id)
                        FROM item_images ii2
                        WHERE ii2.item_id = ii.item_id
                    )
                ) AS item_img ON item_img.item_id = items.item_id
                LEFT JOIN (
                    SELECT pi1.user_id, pi1.image_url
                    FROM profile_images pi1
                    JOIN (
                        SELECT user_id, MAX(uploaded_at) AS max_uploaded
                        FROM profile_images
                        GROUP BY user_id
                    ) pi2 ON pi1.user_id = pi2.user_id AND pi1.uploaded_at = pi2.max_uploaded
                ) AS profile_img ON profile_img.user_id = users.user_id
                LEFT JOIN (
                    SELECT trade_id, MAX(created_at) AS last_message_time
                    FROM trade_messages
                    GROUP BY trade_id
                ) AS tm ON tm.trade_id = trades.trade_id
                WHERE 
                    (trades.buyer_id = %s OR items.user_id = %s)
                    AND trades.status NOT IN ('cancelled')
                    AND users.type = 1 
                ORDER BY trades.created_at DESC
            ''', (user_id, user_id))

            active_trades = cursor.fetchall()
            
            # データの後処理
            for trade in active_trades:
                # 日付をISO形式に変換
                if trade.get('trade_created_at'):
                    trade['trade_created_at'] = trade['trade_created_at'].isoformat()
                if trade.get('last_message_time'):
                    trade['last_message_time'] = trade['last_message_time'].isoformat()
                
                # JSON型フィールドをパース
                if trade.get('type') and isinstance(trade['type'], str):
                    try:
                        trade['type'] = json.loads(trade['type'])
                    except json.JSONDecodeError:
                        trade['type'] = None
                        
                if trade.get('brand') and isinstance(trade['brand'], str):
                    try:
                        trade['brand'] = json.loads(trade['brand'])
                    except json.JSONDecodeError:
                        trade['brand'] = None

            return jsonify({"trades": active_trades, "result": True}), 200
    except mysql.connector.Error as err:
        return jsonify({
            "error": "取引中リストの取得中にエラーが発生しました",
            "result": False
        }), 500
