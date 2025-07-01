FROM python:3.8-slim-buster

WORKDIR /app

# ビルド引数（development or production）
ARG MODE=production
ENV FLASK_ENV=$MODE

# .envファイルを動的に切り替え（.env.development or .env.production）
COPY .env.${MODE} .env

# ① 依存ファイルだけコピー
COPY requirements.txt ./

# ② 先に依存インストール（キャッシュ効く）
RUN pip install --no-cache-dir -r requirements.txt

# ③ アプリ本体を最後にコピー
COPY . .

EXPOSE 5001

CMD ["python", "app.py"]