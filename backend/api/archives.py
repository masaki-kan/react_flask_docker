from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import mysql.connector
import json

archives_bp = Blueprint('archives', __name__, url_prefix='/api')

# 交換履歴を取得
@archives_bp.route('/getexchangeArchive', methods=['POST'])
def get_exchange_archive():
    data = request.get_json()
    user_id = data.get('user_id')
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # アーカイブテーブルから取得
            cursor.execute('''
                SELECT 
                    at.archive_trade_id,
                    at.original_trade_id,
                    at.seller_id,
                    at.buyer_id,
                    at.trade_created_at as trade_date,
                    at.trade_completed_at as completed_date,
                    at.seller_name,
                    at.buyer_name,
                    -- メイン商品
                    main_item.title as main_item_title,
                    main_item.description as main_item_description,
                    main_item.type as main_item_type,
                    main_item.brand as main_item_brand,
                    -- seller交換商品
                    CASE 
                        WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                        THEN seller_item.title 
                        ELSE NULL 
                    END as seller_item_title,
                    CASE 
                        WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                        THEN seller_item.description 
                        ELSE NULL 
                    END as seller_item_description,
                    CASE 
                        WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                        THEN seller_item.type 
                        ELSE NULL 
                    END as seller_item_type,
                    CASE 
                        WHEN at.seller_exchange_item_archive_id IS NOT NULL 
                        THEN seller_item.brand 
                        ELSE NULL 
                    END as seller_item_brand,
                    -- buyer交換商品  
                    CASE 
                        WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                        THEN buyer_item.title 
                        ELSE NULL 
                    END as buyer_item_title,
                    CASE 
                        WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                        THEN buyer_item.description 
                        ELSE NULL 
                    END as buyer_item_description,
                    CASE 
                        WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                        THEN buyer_item.type 
                        ELSE NULL 
                    END as buyer_item_type,
                    CASE 
                        WHEN at.buyer_exchange_item_archive_id IS NOT NULL 
                        THEN buyer_item.brand 
                        ELSE NULL 
                    END as buyer_item_brand
                FROM archived_trades at
                JOIN archived_items main_item ON at.item_archive_id = main_item.archive_id
                LEFT JOIN archived_items seller_item ON at.seller_exchange_item_archive_id = seller_item.archive_id
                LEFT JOIN archived_items buyer_item ON at.buyer_exchange_item_archive_id = buyer_item.archive_id
                WHERE at.seller_id = %s OR at.buyer_id = %s
                ORDER BY at.trade_completed_at DESC
            ''', (user_id, user_id))

            trades = cursor.fetchall()
            
            # 各取引の詳細情報を構築
            for trade in trades:
                # プロフィール画像を取得（現在のユーザーテーブルから）
                # Seller画像
                cursor.execute('''
                    SELECT image_url FROM profile_images 
                    WHERE user_id = %s 
                    ORDER BY uploaded_at DESC
                    LIMIT 1
                ''', (trade['seller_id'],))
                seller_img = cursor.fetchone()
                trade['seller_image'] = seller_img['image_url'] if seller_img else ""
                
                # Buyer画像
                cursor.execute('''
                    SELECT image_url FROM profile_images 
                    WHERE user_id = %s 
                    ORDER BY uploaded_at DESC
                    LIMIT 1
                ''', (trade['buyer_id'],))
                buyer_img = cursor.fetchone()
                trade['buyer_image'] = buyer_img['image_url'] if buyer_img else ""
                
                # メイン商品の画像（アーカイブから）
                cursor.execute('''
                    SELECT ai.archive_id
                    FROM archived_trades at
                    JOIN archived_items ai ON at.item_archive_id = ai.archive_id
                    WHERE at.archive_trade_id = %s
                ''', (trade['archive_trade_id'],))
                main_archive = cursor.fetchone()
                
                if main_archive:
                    cursor.execute('''
                        SELECT image_url FROM archived_item_images 
                        WHERE archive_id = %s 
                        ORDER BY archive_image_id ASC
                    ''', (main_archive['archive_id'],))
                    main_images = cursor.fetchall()
                    trade['main_item_images'] = [img['image_url'] for img in main_images]
                else:
                    trade['main_item_images'] = []
                
                # seller交換商品の画像（アーカイブから）
                if trade['seller_item_title']:
                    cursor.execute('''
                        SELECT ai.archive_id
                        FROM archived_trades at
                        JOIN archived_items ai ON at.seller_exchange_item_archive_id = ai.archive_id
                        WHERE at.archive_trade_id = %s
                    ''', (trade['archive_trade_id'],))
                    seller_archive = cursor.fetchone()
                    
                    if seller_archive:
                        cursor.execute('''
                            SELECT image_url FROM archived_item_images 
                            WHERE archive_id = %s 
                            ORDER BY archive_image_id ASC
                        ''', (seller_archive['archive_id'],))
                        seller_images = cursor.fetchall()
                        trade['seller_item_images'] = [img['image_url'] for img in seller_images]
                    else:
                        trade['seller_item_images'] = []
                else:
                    trade['seller_item_images'] = []
                
                # buyer交換商品の画像（アーカイブから）
                if trade['buyer_item_title']:
                    cursor.execute('''
                        SELECT ai.archive_id
                        FROM archived_trades at
                        JOIN archived_items ai ON at.buyer_exchange_item_archive_id = ai.archive_id
                        WHERE at.archive_trade_id = %s
                    ''', (trade['archive_trade_id'],))
                    buyer_archive = cursor.fetchone()
                    
                    if buyer_archive:
                        cursor.execute('''
                            SELECT image_url FROM archived_item_images 
                            WHERE archive_id = %s 
                            ORDER BY archive_image_id ASC
                        ''', (buyer_archive['archive_id'],))
                        buyer_images = cursor.fetchall()
                        trade['buyer_item_images'] = [img['image_url'] for img in buyer_images]
                    else:
                        trade['buyer_item_images'] = []
                else:
                    trade['buyer_item_images'] = []
                
                # 現在のユーザーの立場を判定
                trade['user_role'] = 'seller' if trade['seller_id'] == user_id else 'buyer'
                
                # JSONフィールドをパース
                for field in ['main_item_type', 'main_item_brand', 'seller_item_type', 'seller_item_brand', 'buyer_item_type', 'buyer_item_brand']:
                    if trade.get(field):
                        try:
                            trade[field] = json.loads(trade[field])
                        except:
                            trade[field] = []
                
                # 日付をISO形式に変換
                if trade.get('trade_date'):
                    trade['trade_date'] = trade['trade_date'].isoformat()
                if trade.get('completed_date'):
                    trade['completed_date'] = trade['completed_date'].isoformat()
                    
            return jsonify({
                "archives": trades,
                "total": len(trades),
                "result": True
            }), 200
        
    except mysql.connector.Error as err:
        return jsonify({
            "error": "交換履歴取得中にエラーが発生しました",
            "result": False
        }), 500
        
        
        
# アーカイブ取引詳細を取得
@archives_bp.route('/getArchiveDetail', methods=['GET'])
def get_archive_detail():
    archive_trade_id = request.args.get('archive_trade_id')
    
    if not archive_trade_id:
        return jsonify({"error": "archive_trade_id is required"}), 400
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            # 1. アーカイブ取引情報を取得
            cursor.execute('''
                SELECT 
                    at.*,
                    seller_item.title as seller_exchange_title,
                    seller_item.description as seller_exchange_description,
                    seller_item.type as seller_exchange_type,
                    seller_item.brand as seller_exchange_brand,
                    buyer_item.title as buyer_exchange_title,
                    buyer_item.description as buyer_exchange_description,
                    buyer_item.type as buyer_exchange_type,
                    buyer_item.brand as buyer_exchange_brand
                FROM archived_trades at
                LEFT JOIN archived_items seller_item ON at.seller_exchange_item_archive_id = seller_item.archive_id
                LEFT JOIN archived_items buyer_item ON at.buyer_exchange_item_archive_id = buyer_item.archive_id
                WHERE at.archive_trade_id = %s
            ''', (archive_trade_id,))
            
            trade_data = cursor.fetchone()
            
            if not trade_data:
                return jsonify({"error": "Archive not found"}), 404
            
            # 3. 交換商品の画像を取得（seller）
            if trade_data['seller_exchange_item_archive_id']:
                cursor.execute('''
                    SELECT image_url FROM archived_item_images
                    WHERE archive_id = %s
                    ORDER BY image_order ASC
                ''', (trade_data['seller_exchange_item_archive_id'],))
                seller_images = cursor.fetchall()
                trade_data['seller_exchange_images'] = [img['image_url'] for img in seller_images]
            else:
                trade_data['seller_exchange_images'] = []
                
            # 4. 交換商品の画像を取得（buyer）
            if trade_data['buyer_exchange_item_archive_id']:
                cursor.execute('''
                    SELECT image_url FROM archived_item_images
                    WHERE archive_id = %s
                    ORDER BY image_order ASC
                ''', (trade_data['buyer_exchange_item_archive_id'],))
                buyer_images = cursor.fetchall()
                trade_data['buyer_exchange_images'] = [img['image_url'] for img in buyer_images]
            else:
                trade_data['buyer_exchange_images'] = []
            
            # 5. メッセージを取得
            cursor.execute('''
                SELECT * FROM archived_trade_messages
                WHERE archive_trade_id = %s
                ORDER BY sent_at ASC
            ''', (archive_trade_id,))
            messages = cursor.fetchall()
            
            # 6. 配送情報を取得
            cursor.execute('''
                SELECT * FROM archived_shipping_info
                WHERE archive_trade_id = %s
            ''', (archive_trade_id,))
            shipping_info = cursor.fetchall()
            
            # 7. 確認情報を取得
            cursor.execute('''
                SELECT * FROM archived_trade_confirmations
                WHERE archive_trade_id = %s
            ''', (archive_trade_id,))
            confirmations = cursor.fetchall()
            
            # 8. レビュー情報を取得
            cursor.execute('''
                SELECT * FROM archived_trade_reviews
                WHERE archive_trade_id = %s
            ''', (archive_trade_id,))
            reviews = cursor.fetchall()
            
            # JSONフィールドをパース
            for field in [ 'seller_exchange_type', 
                        'seller_exchange_brand', 'buyer_exchange_type', 'buyer_exchange_brand']:
                if trade_data.get(field):
                    try:
                        trade_data[field] = json.loads(trade_data[field])
                    except:
                        trade_data[field] = []
            
            # 日付をISO形式に変換
            date_fields = ['trade_created_at', 'trade_completed_at', 'archived_at']
            for field in date_fields:
                if trade_data.get(field):
                    trade_data[field] = trade_data[field].isoformat()
                    
            # メッセージの日付変換
            for msg in messages:
                if msg.get('sent_at'):
                    msg['sent_at'] = msg['sent_at'].isoformat()
                if msg.get('archived_at'):
                    msg['archived_at'] = msg['archived_at'].isoformat()

            return jsonify({
                'result': True,
                'trade': trade_data,
                'messages': messages,
                'shipping_info': shipping_info,
                'confirmations': confirmations,
                'reviews': reviews
            })
        
    except Exception as e:
        return jsonify({'result': False, 'error': str(e)}), 500
