# react_flask_docker

#コンテナをビルド
$ docker-compose up -d --build

#ビルド
$ docker-compose build
$ docker-compose up --build

# コンテナ停止時に、名前付きボリュームをすべて削除

docker-compose down -v

# 再度 Build を実行

docker-compose build

#flask コンテナの Bash シェルに接続 flask デバッグ用
$ docker exec -it flask_app /bin/bash
終了 exit

python app.py
終了　 control + c

python
終了　 control + d

#コンテナのログ flask_app

$ docker logs -f flask_app

#reaxt_app コンテ内　インストール
$docker exec -it react_app /bin/sh

docker compose build --no-cache

#node_modules,package-lock.json 削除
rm -rf node_modules package-lock.json
npm install
