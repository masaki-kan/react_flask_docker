# react_flask_docker

# コンテナをビルド

$ docker-compose up -d --build

# node_modules,package-lock.json 削除

rm -rf node_modules package-lock.json
npm install

# Docker イメージを再構築　（完全破棄）

docker compose down -v
docker volume prune -f

docker compose build --no-cache
docker compose up

# flask コンテナの Bash シェルに接続 flask デバッグ用

$ docker exec -it flask_app /bin/bash
終了 exit

# react_app コンテ内　インストール

$docker exec -it react_app /bin/sh

# flask_app コンテ内　インストール

$docker exec -it flask_app /bin/sh

ローカル環境（React 開発サーバー使用）
docker-compose up --build

本番環境（Nginx + RDS 接続 + React ビルド）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file ./backend/.env.production up --build -d
