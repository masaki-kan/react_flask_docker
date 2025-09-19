#!/usr/bin/env python3
"""
トークンリフレッシュAPI テストスクリプト
"""
import requests
import json
from datetime import datetime

# テスト設定
BASE_URL = "http://localhost:5000/api"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123"

def test_login_and_refresh():
    """ログインとトークンリフレッシュのテスト"""
    
    print("=== トークンリフレッシュAPI テスト ===\n")
    
    # 1. ログインテスト
    print("1. ログインテスト")
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"ステータス: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            if login_result.get('login'):
                access_token = login_result.get('access_token')
                user_id = login_result.get('user_id')
                username = login_result.get('username')
                user_type = login_result.get('type')
                
                print(f"✅ ログイン成功")
                print(f"   ユーザー: {username} (ID: {user_id})")
                print(f"   タイプ: {user_type}")
                print(f"   トークン: {access_token[:50]}...")
                
                # 2. トークンリフレッシュテスト
                print("\n2. トークンリフレッシュテスト")
                test_token_refresh(access_token, user_type)
                
                # 3. トークン検証テスト
                print("\n3. トークン検証テスト")
                test_token_verify(access_token)
                
            else:
                print(f"❌ ログイン失敗: {login_result.get('error', '不明なエラー')}")
        else:
            print(f"❌ HTTPエラー: {login_response.status_code}")
            print(f"   レスポンス: {login_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ リクエストエラー: {e}")
        print("   サーバーが起動していることを確認してください")

def test_token_refresh(token, user_type):
    """トークンリフレッシュのテスト"""
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # ユーザートークンのリフレッシュ
    if user_type != 'admin':
        print("   📱 ユーザートークンリフレッシュ")
        try:
            refresh_response = requests.post(f"{BASE_URL}/auth/refresh", headers=headers)
            print(f"   ステータス: {refresh_response.status_code}")
            
            if refresh_response.status_code == 200:
                refresh_result = refresh_response.json()
                if refresh_result.get('success'):
                    new_token = refresh_result['data']['token']
                    print(f"   ✅ リフレッシュ成功")
                    print(f"   新しいトークン: {new_token[:50]}...")
                else:
                    print(f"   ❌ リフレッシュ失敗: {refresh_result.get('message')}")
            else:
                print(f"   ❌ HTTPエラー: {refresh_response.status_code}")
                print(f"   レスポンス: {refresh_response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ リクエストエラー: {e}")
    
    # 管理者トークンのリフレッシュ
    if user_type == 'admin':
        print("   👑 管理者トークンリフレッシュ")
        try:
            admin_refresh_response = requests.post(f"{BASE_URL}/admin/auth/refresh", headers=headers)
            print(f"   ステータス: {admin_refresh_response.status_code}")
            
            if admin_refresh_response.status_code == 200:
                admin_refresh_result = admin_refresh_response.json()
                if admin_refresh_result.get('success'):
                    new_admin_token = admin_refresh_result['data']['token']
                    print(f"   ✅ 管理者リフレッシュ成功")
                    print(f"   新しい管理者トークン: {new_admin_token[:50]}...")
                else:
                    print(f"   ❌ 管理者リフレッシュ失敗: {admin_refresh_result.get('message')}")
            else:
                print(f"   ❌ HTTPエラー: {admin_refresh_response.status_code}")
                print(f"   レスポンス: {admin_refresh_response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ リクエストエラー: {e}")

def test_token_verify(token):
    """トークン検証のテスト"""
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("   🔍 トークン検証")
    try:
        verify_response = requests.post(f"{BASE_URL}/auth/verify", headers=headers)
        print(f"   ステータス: {verify_response.status_code}")
        
        if verify_response.status_code == 200:
            verify_result = verify_response.json()
            if verify_result.get('valid'):
                user_info = verify_result['user']
                print(f"   ✅ トークン有効")
                print(f"   ユーザー情報: {user_info}")
            else:
                print(f"   ❌ トークン無効: {verify_result.get('message')}")
        else:
            print(f"   ❌ HTTPエラー: {verify_response.status_code}")
            print(f"   レスポンス: {verify_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ リクエストエラー: {e}")

def test_invalid_token():
    """無効なトークンでのテスト"""
    
    print("\n4. 無効なトークンテスト")
    
    invalid_token = "invalid.token.here"
    headers = {
        "Authorization": f"Bearer {invalid_token}",
        "Content-Type": "application/json"
    }
    
    try:
        refresh_response = requests.post(f"{BASE_URL}/auth/refresh", headers=headers)
        print(f"   ステータス: {refresh_response.status_code}")
        
        if refresh_response.status_code == 422 or refresh_response.status_code == 401:
            print("   ✅ 無効なトークンが正しく拒否されました")
        else:
            print(f"   ⚠️  予期しないレスポンス: {refresh_response.status_code}")
            print(f"   レスポンス: {refresh_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ リクエストエラー: {e}")

if __name__ == "__main__":
    print(f"テスト開始時刻: {datetime.now()}")
    print(f"テスト対象: {BASE_URL}")
    print(f"テストユーザー: {TEST_EMAIL}\n")
    
    test_login_and_refresh()
    test_invalid_token()
    
    print(f"\n=== テスト完了 ===")