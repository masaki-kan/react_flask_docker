# ベースイメージ
FROM node:20.12-alpine

# モード（development or production）をビルド引数として受け取る
ARG MODE=development
ENV NODE_ENV=$MODE

# 作業ディレクトリ
WORKDIR /app

# .envファイル（例: .env.development or .env.production）を適切にコピー
COPY app/.env.${MODE} .env

# パッケージ定義だけ先にコピーしてキャッシュを効かせる
COPY app/package*.json ./

# 依存パッケージのインストール（devDependenciesも含める）
RUN npm install --include=dev

# アプリ全体をコピー
COPY app .

# ビルド or 開発サーバー起動（本番用ならビルド、開発用なら起動）
RUN if [ "$MODE" = "production" ]; then npm run build; fi

# デフォルトコマンド（ただしdocker-composeで上書きされることが前提）
CMD ["npm", "run", "dev"]