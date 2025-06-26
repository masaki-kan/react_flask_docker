# FROM node:20.12
# WORKDIR /app
# COPY app/package*.json ./
# RUN npm install
# COPY . ./
# EXPOSE 5173
# CMD [ "npm", "run", "dev" ]

FROM node:20.12-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係インストール
COPY app/package*.json ./
RUN npm install

# ソースコードをコピー
COPY app .

# 本番ビルド
RUN npm run build