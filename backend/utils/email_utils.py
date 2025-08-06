import os
import base64
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_credentials():
    """Gmail認証情報を取得"""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # 認証フローを生成
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', 
                SCOPES,
                redirect_uri='http://localhost:8080/')

            # 認証URLを取得
            auth_url, _ = flow.authorization_url(prompt='consent')
            print("\n🌐 以下のURLをブラウザで開いて、Googleログイン・許可を行ってください：")
            print(auth_url)
            code = input("認証コードを入力: ")
            flow.fetch_token(code=code)
            creds = flow.credentials
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return creds

def send_welcome_email(user_name, plan_type, to_email):
    """ウェルカムメールを送信"""
    if not all([user_name, plan_type, to_email]):
        return False

    plan = ""
    if plan_type == 1:
        plan = "月額プラン ¥550/月"
    else:
        plan = "年額プラン ¥5500/年"

    body = f"""{user_name} 様

    現在のご契約プラン：{plan}

    ご登録ありがとうございます。
    引き続きご利用ください。
    """
    
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = os.getenv("GMAIL_FROM")
        message['Subject'] = 'ようこそ！僕らのヴィンテージへ！会員登録完了のお知らせ'

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(userId="me", body={
            'raw': encoded_message
        }).execute()
        return True  # 成功時
    except Exception as e:
        print(f"メール送信エラー: {e}")
        return False