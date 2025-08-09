import os
from datetime import timedelta
from dotenv import load_dotenv
from pathlib import Path

# 設定関連

class Config:
    def __init__(self):
        env = os.getenv("FLASK_ENV", "development")
        
        if env == "production":
            self.ORIGINS = ["https://bokurano-vintage.com"]
            load_dotenv(dotenv_path=Path(".env.production"))
        else:
            self.ORIGINS = ["http://localhost:5173"]
            load_dotenv(dotenv_path=Path(".env.development"))
        
        self.JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
        self.JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
        self.MAX_CONTENT_LENGTH = 20 * 1024 * 1024
        self.STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
        
        # Database config
        self.DB_CONFIG = {
            'host': os.getenv("DB_HOST"),
            'user': os.getenv("DB_USER"),
            'password': os.getenv("DB_PASSWORD"),
            'database': os.getenv("DB_NAME"),
        }
        
        # S3 config
        self.STORAGE_TYPE = os.getenv('STORAGE_TYPE')
        self.AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
        self.AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.AWS_REGION = os.getenv('AWS_REGION', 'ap-northeast-1')
        self.S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')