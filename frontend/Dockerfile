# FROM node:20.12
# WORKDIR /app
# COPY app/package*.json ./
# RUN npm install
# COPY . ./
# EXPOSE 5173
# CMD [ "npm", "run", "dev" ]

# Nodeの軽量イメージ
FROM node:20.12-alpine

# ビルド時引数（production or production）
ARG MODE
ENV NODE_ENV=$MODE

# 作業ディレクトリ
WORKDIR /app

# モードに応じた.envファイルをコピー
COPY app/.env.$MODE .env

# 依存関係をインストール
COPY app/package*.json ./
RUN npm install

# ソースコードをコピー
COPY app .

# 開発環境
RUN npm run build