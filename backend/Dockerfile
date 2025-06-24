FROM python:3.8-slim-buster

WORKDIR /app

# ① 依存ファイルだけコピー
COPY requirements.txt ./

# ② 先に依存インストール（キャッシュ効く）
RUN pip install --no-cache-dir -r requirements.txt

# ③ アプリ本体を最後にコピー
COPY . .

EXPOSE 5001
ENV FLASK_ENV=development

CMD ["python", "app.py"]