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
