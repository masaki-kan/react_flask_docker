from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from utils.db_utils import get_db_connection
from utils.image_utils import upload_image_to_s3
import json
import mysql.connector
import stripe

payment_bp = Blueprint('payment', __name__, url_prefix='/api')

# stripe intent作成
@payment_bp.route('/create-payment-intent', methods=['POST'])
def create_payment():
    data = request.get_json()
    amount = data.get("amount")
    plan_status = data.get("status")
    
    try:
        # Stripe Customer を作成
        customer = stripe.Customer.create()
        # 初月無料にする場合（plan_status == 1）は amount を 0 にする
        payment_amount = 0 if plan_status == 1 else amount
        intent = stripe.PaymentIntent.create(
            customer=customer.id,
            amount=payment_amount,
            currency='jpy',
            automatic_payment_methods={'enabled': True},
            payment_method_options={
            "card": {
                "setup_future_usage": "off_session",
            }}
        )
        return jsonify({
            'intentId' :intent.id,
            'clientSecret': intent.client_secret,
            'stripeCustomerId': customer.id  # ← フロント・DBに保存する用
        }) 
    except Exception as e:
        return jsonify({
            "error": "クレジット外部データと通信中にエラーが発生しました",
            "result": False
        }), 500
    