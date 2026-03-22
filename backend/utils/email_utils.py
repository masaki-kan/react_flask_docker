import os
import base64
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from datetime import datetime

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
    if not all([user_name, plan_type is not None, to_email]):
        return False
    
    plan = ""
    if plan_type == "0":
        plan = "月額プラン ¥990/月"
    elif plan_type == "1":
        plan = "年額プラン ¥9,900/年"
    else:
        plan = "未設定"
        
    # 現在の日時を取得
    current_date = datetime.now().strftime("%Y年%m月%d日")

    body = f"""{user_name} 様

        この度は「僕らのヴィンテージ」にご登録いただき、誠にありがとうございます。

        お客様のアカウント登録が正常に完了いたしましたことをお知らせいたします。
        これより、当サービスの全ての機能をご利用いただけます。

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ ご登録情報
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        登録日：{current_date}
        お名前：{user_name} 様
        メールアドレス：{to_email}
        ご契約プラン：{plan}

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ 今後のご利用について
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        1. マイページへのログイン
        以下のURLよりログインいただけます。
        https://bokura-vintage.com/login

        2. 古着の登録
        お手持ちの古着を簡単に登録し、交換をお楽しみください。

        3. マッチング機能
        お好みの古着を見つけて、新しい出会いをお楽しみください。

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ ご利用にあたってのお願い
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        ・商品の状態は正確にご記載ください
        ・発送は迅速に行っていただきますようお願いいたします
        ・お互いに気持ちの良い取引を心がけましょう
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        これからも「僕らのヴィンテージ」をどうぞよろしくお願いいたします。
        素敵な古着との出会いがありますように。

        僕らのヴィンテージ 運営チーム

        ※このメールは送信専用アドレスから配信されております。
        　ご返信いただいてもお答えできませんのでご了承ください。

        ──────────────────────────────────────
        僕らのヴィンテージ - ヴィンテージをもっと楽しく、もっと自由に
        https://bokura-vintage.com
        ──────────────────────────────────────"""
    
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = os.getenv("GMAIL_FROM")
        message['Subject'] = 'ようこそ！僕らのヴィンテージへ！会員登録完了のお知らせ'
        
         # HTMLバージョンも追加（オプション）
        html_body = f"""
        <html>
            <body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; line-height: 1.8; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #e68019; font-size: 24px; margin: 0;">僕らのヴィンテージ</h1>
                        <p style="color: #A18249; font-size: 14px; margin: 5px 0;">ヴィンテージをもっと楽しく、もっと自由に</p>
                    </div>
                    
                    <div style="background: #fdfcf8; border: 2px solid #E9DFCE; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                        <p style="margin: 0 0 20px 0;"><strong>{user_name} 様</strong></p>
                        
                        <p style="margin: 0 0 20px 0;">
                            この度は「僕らのヴィンテージ」にご登録いただき、<br>
                            誠にありがとうございます。
                        </p>
                        
                        <p style="margin: 0 0 20px 0;">
                            お客様のアカウント登録が正常に完了いたしましたことを<br>
                            お知らせいたします。
                        </p>
                        
                        <div style="background: white; border: 1px solid #E9DFCE; border-radius: 5px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #e68019; font-size: 16px; margin: 0 0 15px 0;">ご登録情報</h3>
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="padding: 5px 0; color: #A18249;">登録日：</td>
                                    <td style="padding: 5px 0;">{current_date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #A18249;">お名前：</td>
                                    <td style="padding: 5px 0;">{user_name} 様</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #A18249;">ご契約プラン：</td>
                                    <td style="padding: 5px 0;"><strong>{plan}</strong></td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://bokurano-vintage.com" style="display: inline-block; background: #e68019; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">マイページへログイン</a>
                        </div>
                    </div>
                    
                    <div style="font-size: 12px; color: #888; text-align: center;">
                        <p>© 2025 僕らのヴィンテージ</p>
                    </div>
                </div>
            </body>
        </html>
        """

        message.add_alternative(html_body, subtype='html')
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(userId="me", body={
            'raw': encoded_message
        }).execute()
        return True  # 成功時
    except Exception as e:
        print(f"メール送信エラー: {e}")
        return False
    
    
def reactivation_send_welcome_email(user_name, plan_type, to_email):
    """ウェルカムメールを送信"""
    if not all([user_name, plan_type, to_email]):
        return False

    plan = ""
    if plan_type == "0":
        plan = "月額プラン ¥990/月"
    elif plan_type == "1":
        plan = "年額プラン ¥9,900/年"
        
    # 現在の日時を取得
    current_date = datetime.now().strftime("%Y年%m月%d日")

    body = f"""{user_name} 様

        おかえりなさい！

        「僕らのヴィンテージ」へのお戻りを心より歓迎いたします。
        アカウントの再開手続きが正常に完了いたしましたことをお知らせいたします。

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ ご登録情報
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        登録日：{current_date}
        お名前：{user_name} 様
        メールアドレス：{to_email}
        ご契約プラン：{plan}

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ 今後のご利用について
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        1. マイページへのログイン
        以下のURLよりログインいただけます。
        https://bokura-vintage.com/login

        2. 古着の登録
        お手持ちの古着を簡単に登録し、交換をお楽しみください。

        3. マッチング機能
        お好みの古着を見つけて、新しい出会いをお楽しみください。

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ■ ご利用にあたってのお願い
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        ・商品の状態は正確にご記載ください
        ・発送は迅速に行っていただきますようお願いいたします
        ・お互いに気持ちの良い取引を心がけましょう
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        これからも「僕らのヴィンテージ」をどうぞよろしくお願いいたします。
        素敵な古着との出会いがありますように。

        僕らのヴィンテージ 運営チーム

        ※このメールは送信専用アドレスから配信されております。
        　ご返信いただいてもお答えできませんのでご了承ください。

        ──────────────────────────────────────
        僕らのヴィンテージ - ヴィンテージをもっと楽しく、もっと自由に
        https://bokura-vintage.com
        ──────────────────────────────────────"""
    
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = os.getenv("GMAIL_FROM")
        message['Subject'] = 'おかえりなさい！アカウント再開完了のお知らせ【僕らのヴィンテージ】'
        
         # HTMLバージョンも追加（オプション）
        html_body = f"""
        <html>
            <body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; line-height: 1.8; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                     <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #e68019; font-size: 28px; margin: 0;">おかえりなさい！</h1>
                        <p style="color: #A18249; font-size: 16px; margin: 10px 0;">僕らのヴィンテージへのお戻りを歓迎します</p>
                    </div>
                    
                    <div style="background: #fdfcf8; border: 2px solid #E9DFCE; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                        <p style="margin: 0 0 20px 0;"><strong>{user_name} 様</strong></p>
                        
                        <p style="margin: 0 0 20px 0;">
                            「僕らのヴィンテージ」へお戻りいただき、<br>
                            誠にありがとうございます。
                        </p>
                        
                        <div style="background: white; border: 1px solid #E9DFCE; border-radius: 5px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #e68019; font-size: 16px; margin: 0 0 15px 0;">📋 再開後のご登録情報</h3>
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #A18249;">再開日：</td>
                                    <td style="padding: 8px 0;">{current_date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #A18249;">ご契約プラン：</td>
                                    <td style="padding: 8px 0;"><strong style="color: #e68019;">{plan}</strong></td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://bokurano-vintage.com" style="display: inline-block; background: #e68019; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold;">マイページへログイン</a>
                        </div>
                    </div>
                    
                    <div style="font-size: 12px; color: #888; text-align: center;">
                        <p>© 2025 僕らのヴィンテージ</p>
                    </div>
                </div>
            </body>
        </html>
        """

        message.add_alternative(html_body, subtype='html')
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(userId="me", body={
            'raw': encoded_message
        }).execute()
        return True  # 成功時
    except Exception as e:
        print(f"メール送信エラー: {e}")
        return False
    
    
def send_withdrawal_email(user_name, to_email):
    """退会完了メールを送信"""
    if not all([user_name, to_email]):
        return False
        
    current_date = datetime.now().strftime("%Y年%m月%d日")

    body = f"""{user_name} 様

この度は「僕らのヴィンテージ」をご利用いただき、
誠にありがとうございました。

退会手続きが完了いたしましたことをお知らせいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 退会完了のお知らせ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

退会日：{current_date}
お名前：{user_name} 様

・有料プランは即座にキャンセルされました
・今後の課金は発生いたしません
・アカウント情報は30日間保持されます

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 今後について
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

もしまた「僕らのヴィンテージ」をご利用になりたい場合は、
30日以内であれば、同じメールアドレスでログインし、
アカウントを再開することができます。

30日を過ぎますと、アカウント情報は完全に削除されます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

これまでのご利用、心より感謝申し上げます。

またお会いできる日を楽しみにしております。

僕らのヴィンテージ 運営チーム

──────────────────────────────────────
僕らのヴィンテージ - ヴィンテージをもっと楽しく、もっと自由に
https://bokurano-vintage.com
──────────────────────────────────────"""
    
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = os.getenv("GMAIL_FROM")
        message['Subject'] = '退会完了のお知らせ【僕らのヴィンテージ】'
        
        # HTMLバージョン
        html_body = f"""
        <html>
            <body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; line-height: 1.8; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #A18249; font-size: 24px; margin: 0;">退会完了のお知らせ</h1>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;">僕らのヴィンテージ</p>
                    </div>
                    
                    <div style="background: #fdfcf8; border: 2px solid #E9DFCE; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                        <p style="margin: 0 0 20px 0;"><strong>{user_name} 様</strong></p>
                        
                        <p style="margin: 0 0 20px 0;">
                            この度は「僕らのヴィンテージ」をご利用いただき、<br>
                            誠にありがとうございました。
                        </p>
                        
                        <div style="background: white; border: 1px solid #E9DFCE; border-radius: 5px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #A18249; font-size: 16px; margin: 0 0 15px 0;">退会完了情報</h3>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
                                <li style="padding: 5px 0;">✓ 退会日：{current_date}</li>
                                <li style="padding: 5px 0;">✓ 課金は即座に停止されました</li>
                            </ul>
                        </div>

                        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #0369a1; font-weight: bold;">💡 アカウントの再開について</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                                同じメールアドレスでログインすることで<br>
                                アカウントを再開できます。
                            </p>
                        </div>
                        
                        <p style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
                            これまでのご利用、ありがとうございました。<br>
                            またお会いできる日を楽しみにしております。
                        </p>
                    </div>
                    
                    <div style="font-size: 12px; color: #888; text-align: center;">
                        <p>© 2025 僕らのヴィンテージ</p>
                    </div>
                </div>
            </body>
        </html>
        """

        message.add_alternative(html_body, subtype='html')
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(userId="me", body={
            'raw': encoded_message
        }).execute()
        return True
    except Exception as e:
        print(f"メール送信エラー: {e}")
        return False