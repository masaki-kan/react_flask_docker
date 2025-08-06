import os
import uuid
import io
import boto3
from PIL import Image, ImageOps

s3_client = None

def init_s3_client():
    """S3クライアントを初期化"""
    global s3_client
    if os.getenv('STORAGE_TYPE') == 's3':
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'ap-northeast-1')
            )
            print("✅ S3 client initialized successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize S3 client: {e}")
            return False
    return False

def upload_image_to_s3(file, folder='items'):
    """S3に画像をアップロード"""
    try:
        # 画像を開いて最適化
        img = Image.open(file)
        
        # EXIF情報を考慮した回転
        try:
            img = ImageOps.exif_transpose(img)
        except:
            pass
        
        # リサイズ（最大幅1200px）
        if img.width > 1200:
            ratio = 1200 / img.width
            new_height = int(img.height * ratio)
            img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
        
        # JPEG形式で保存（WebPはブラウザ互換性のため避ける）
        output = io.BytesIO()
        if img.mode == 'RGBA':
            # 透過画像は白背景に変換
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        # ファイル名生成
        filename = f"{folder}/{uuid.uuid4()}.jpg"
        
        # S3にアップロード
        s3_client.upload_fileobj(
            output,
            os.getenv('S3_BUCKET_NAME'),
            filename,
            ExtraArgs={
                'ContentType': 'image/jpeg',
                'CacheControl': 'public, max-age=31536000'
            }
        )
        
        # URLを返す
        return f"https://{os.getenv('S3_BUCKET_NAME')}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{filename}"
        
    except Exception as e:
        print(f"S3 upload error: {e}")
        raise