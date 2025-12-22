"""
Stripe Connect API
販売者のConnected Account作成とオンボーディング管理
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.db_utils import get_db_connection
import stripe
import os
import mysql.connector

stripe_connect_bp = Blueprint('stripe_connect', __name__, url_prefix='/api')

# 環境変数からStripeキーを取得
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_MODE = os.environ.get('STRIPE_MODE', 'test')  # 'test' or 'live' (デフォルト: test)
PLATFORM_URL = os.environ.get('PLATFORM_URL', 'http://localhost:5173')

stripe.api_key = STRIPE_SECRET_KEY

# 起動時にモードを確認
print(f"[STRIPE_CONNECT] Mode: {STRIPE_MODE}", flush=True)
print(f"[STRIPE_CONNECT] Platform URL: {PLATFORM_URL}", flush=True)


@stripe_connect_bp.route('/create_connect_account', methods=['POST'])
@jwt_required()
def create_connect_account():
    """
    販売者のConnected Accountを作成してオンボーディングURLを返す

    本番環境の場合のみ、実際のConnected Accountを作成
    開発環境の場合は、ダミーアカウントIDを返す
    """
    try:
        user_email = get_jwt_identity()
        data = request.json
        user_id = data.get('user_id')

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # ユーザー情報を取得（カラムが存在しない場合のエラーハンドリング）
            try:
                cursor.execute("""
                    SELECT user_id, email, name, stripe_account_id,
                           stripe_onboarding_completed
                    FROM users
                    WHERE user_id = %s AND email = %s
                """, (user_id, user_email))
                user = cursor.fetchone()
            except mysql.connector.Error as db_error:
                # カラムが存在しない場合
                if "Unknown column" in str(db_error):
                    print(f"[ERROR] stripe_account_id column not found. Please run migration: 008_add_stripe_connect_columns.sql", flush=True)
                    return jsonify({
                        'success': False,
                        'message': 'データベースマイグレーションが必要です。管理者に連絡してください。'
                    }), 500
                raise

            if not user:
                return jsonify({
                    'success': False,
                    'message': 'ユーザーが見つかりません'
                }), 404

            # 本番環境の場合のみStripe Connectを使用
            if STRIPE_MODE == 'live':
                # 既存のアカウントがあるか確認
                if user['stripe_account_id']:
                    account_id = user['stripe_account_id']

                    # アカウントの状態を確認
                    account = stripe.Account.retrieve(account_id)

                    # オンボーディングが完了していない場合は再度URLを生成
                    if not account.details_submitted:
                        account_link = stripe.AccountLink.create(
                            account=account_id,
                            refresh_url=f'{PLATFORM_URL}/profile?stripe_refresh=true',
                            return_url=f'{PLATFORM_URL}/profile?stripe_onboarding=success',
                            type='account_onboarding',
                        )

                        return jsonify({
                            'success': True,
                            'data': {
                                'account_id': account_id,
                                'onboarding_url': account_link.url,
                                'is_existing': True
                            }
                        })
                    else:
                        return jsonify({
                            'success': True,
                            'message': 'すでにオンボーディングが完了しています',
                            'data': {
                                'account_id': account_id,
                                'onboarding_completed': True
                            }
                        })

                # 新規Accountを作成
                account = stripe.Account.create(
                    type='express',  # Express Account
                    country='JP',    # 日本
                    email=user['email'],
                    capabilities={
                        'card_payments': {'requested': True},
                        'transfers': {'requested': True},
                    },
                    business_type='individual',  # 個人事業主
                    metadata={
                        'user_id': str(user_id),
                        'platform': 'vintage_marketplace',
                        'environment': STRIPE_MODE
                    }
                )
                account_id = account.id

                # DBに保存
                cursor.execute("""
                    UPDATE users
                    SET stripe_account_id = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """, (account_id, user_id))
                conn.commit()

                # AccountLinkを生成（オンボーディング用URL）
                account_link = stripe.AccountLink.create(
                    account=account_id,
                    refresh_url=f'{PLATFORM_URL}/profile?stripe_refresh=true',
                    return_url=f'{PLATFORM_URL}/profile?stripe_onboarding=success',
                    type='account_onboarding',
                )

                return jsonify({
                    'success': True,
                    'data': {
                        'account_id': account_id,
                        'onboarding_url': account_link.url,
                        'is_existing': False
                    }
                })

            else:
                # テスト環境: ダミーアカウントIDを作成
                print(f"[STRIPE_CONNECT] Creating dummy account for user {user_id} in test mode", flush=True)

                # すでにダミーIDがある場合はそれを使用
                if user['stripe_account_id'] and user['stripe_account_id'].startswith('acct_dev_'):
                    dummy_account_id = user['stripe_account_id']
                    print(f"[STRIPE_CONNECT] Using existing dummy account: {dummy_account_id}", flush=True)
                else:
                    import random
                    dummy_account_id = f"acct_dev_{user_id}_{random.randint(1000, 9999)}"
                    print(f"[STRIPE_CONNECT] Creating new dummy account: {dummy_account_id}", flush=True)

                    # DBに保存
                    cursor.execute("""
                        UPDATE users
                        SET stripe_account_id = %s,
                            stripe_onboarding_completed = TRUE,
                            stripe_charges_enabled = TRUE,
                            stripe_payouts_enabled = TRUE,
                            stripe_details_submitted = TRUE,
                            updated_at = NOW()
                        WHERE user_id = %s
                    """, (dummy_account_id, user_id))
                    conn.commit()
                    print(f"[STRIPE_CONNECT] Dummy account saved to database", flush=True)

                return jsonify({
                    'success': True,
                    'message': 'テスト環境: 販売者登録が完了しました',
                    'data': {
                        'account_id': dummy_account_id,
                        'onboarding_completed': True,
                        'is_test_mode': True
                    }
                })

    except stripe.error.StripeError as e:
        print(f"[ERROR] Stripe Connect error: {str(e)}", flush=True)
        return jsonify({
            'success': False,
            'message': f'Stripe Connect エラー: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[ERROR] Create connect account error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@stripe_connect_bp.route('/check_stripe_account_status', methods=['POST'])
@jwt_required()
def check_stripe_account_status():
    """
    Stripeアカウントの状態を確認して DBを更新

    本番環境: Stripe APIから実際の状態を取得
    開発環境: すでに完了済みとして扱う
    """
    try:
        user_email = get_jwt_identity()
        data = request.json
        user_id = data.get('user_id')

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # ユーザー情報を取得（カラムが存在しない場合のエラーハンドリング）
            try:
                cursor.execute("""
                    SELECT stripe_account_id, stripe_onboarding_completed
                    FROM users
                    WHERE user_id = %s AND email = %s
                """, (user_id, user_email))
                user = cursor.fetchone()
            except mysql.connector.Error as db_error:
                # カラムが存在しない場合
                if "Unknown column" in str(db_error):
                    print(f"[WARNING] stripe_account_id column not found. Please run migration.", flush=True)
                    return jsonify({
                        'success': False,
                        'message': 'データベースマイグレーションが必要です。管理者に連絡してください。'
                    }), 500
                raise

            if not user or not user['stripe_account_id']:
                return jsonify({
                    'success': False,
                    'message': 'Stripe account not found'
                }), 404

            account_id = user['stripe_account_id']

            # 本番環境の場合のみStripe APIを呼び出す
            if STRIPE_MODE == 'live' and not account_id.startswith('acct_dev_'):
                # Stripeからアカウント情報を取得
                account = stripe.Account.retrieve(account_id)

                # ステータスを確認
                charges_enabled = account.charges_enabled
                payouts_enabled = account.payouts_enabled
                details_submitted = account.details_submitted

                # DBを更新
                cursor.execute("""
                    UPDATE users
                    SET stripe_onboarding_completed = %s,
                        stripe_charges_enabled = %s,
                        stripe_payouts_enabled = %s,
                        stripe_details_submitted = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """, (details_submitted, charges_enabled, payouts_enabled,
                      details_submitted, user_id))
                conn.commit()

                return jsonify({
                    'success': True,
                    'data': {
                        'account_id': account_id,
                        'charges_enabled': charges_enabled,
                        'payouts_enabled': payouts_enabled,
                        'details_submitted': details_submitted,
                        'onboarding_completed': details_submitted
                    }
                })
            else:
                # 開発環境: すでに完了済み
                return jsonify({
                    'success': True,
                    'data': {
                        'account_id': account_id,
                        'charges_enabled': True,
                        'payouts_enabled': True,
                        'details_submitted': True,
                        'onboarding_completed': True,
                        'is_test_mode': True
                    }
                })

    except stripe.error.StripeError as e:
        print(f"[ERROR] Stripe account status check error: {str(e)}", flush=True)
        return jsonify({
            'success': False,
            'message': f'Stripe エラー: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[ERROR] Check account status error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500


@stripe_connect_bp.route('/get_stripe_dashboard_link', methods=['POST'])
@jwt_required()
def get_stripe_dashboard_link():
    """
    販売者がStripeダッシュボードにアクセスするためのリンクを生成

    本番環境のみ有効
    """
    try:
        user_email = get_jwt_identity()
        data = request.json
        user_id = data.get('user_id')

        if STRIPE_MODE != 'live':
            return jsonify({
                'success': False,
                'message': '開発環境ではダッシュボードリンクは利用できません'
            }), 400

        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute("""
                SELECT stripe_account_id
                FROM users
                WHERE user_id = %s AND email = %s
            """, (user_id, user_email))
            user = cursor.fetchone()

            if not user or not user['stripe_account_id']:
                return jsonify({
                    'success': False,
                    'message': 'Stripe account not found'
                }), 404

            # Login Linkを生成
            login_link = stripe.Account.create_login_link(
                user['stripe_account_id']
            )

            return jsonify({
                'success': True,
                'data': {
                    'dashboard_url': login_link.url
                }
            })

    except stripe.error.StripeError as e:
        print(f"[ERROR] Stripe dashboard link error: {str(e)}", flush=True)
        return jsonify({
            'success': False,
            'message': f'Stripe エラー: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[ERROR] Get dashboard link error: {str(e)}", flush=True)
        return jsonify({
            'success': False,
            'message': f'エラーが発生しました: {str(e)}'
        }), 500
