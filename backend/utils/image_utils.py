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

def delete_image_from_s3(image_url):
    """S3から画像を削除"""
    try:
        if not image_url or not s3_client:
            return False

        # URLからS3キーを抽出
        # 例: https://bucket.s3.region.amazonaws.com/items/uuid.jpg → items/uuid.jpg
        if '.amazonaws.com/' in image_url:
            s3_key = image_url.split('.amazonaws.com/')[-1]
        else:
            # 直接キーが渡された場合
            s3_key = image_url

        # S3から削除
        s3_client.delete_object(
            Bucket=os.getenv('S3_BUCKET_NAME'),
            Key=s3_key
        )

        return True

    except Exception as e:
        print(f"❌ S3 delete error: {e}")
        return False

def delete_multiple_images_from_s3(image_urls):
    """複数の画像をS3から一括削除"""
    try:
        if not image_urls or not s3_client:
            return False

        # URLからS3キーのリストを作成
        delete_objects = []
        for url in image_urls:
            if url and '.amazonaws.com/' in url:
                s3_key = url.split('.amazonaws.com/')[-1]
                delete_objects.append({'Key': s3_key})

        if not delete_objects:
            return False

        # 一括削除（最大1000個まで）
        response = s3_client.delete_objects(
            Bucket=os.getenv('S3_BUCKET_NAME'),
            Delete={
                'Objects': delete_objects,
                'Quiet': False
            }
        )

        # エラーがあった場合はログ出力
        if response.get('Errors'):
            for error in response['Errors']:
                print(f"❌ Delete error: {error}")

        return True

    except Exception as e:
        print(f"❌ S3 bulk delete error: {e}")
        return False