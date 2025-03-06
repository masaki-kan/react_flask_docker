from flask import Flask
import os
from flask_cors import CORS 
# from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# SQLite データベースファイルのパスを設定
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'data', 'app.db')
# db = SQLAlchemy(app)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!!'

if __name__ == "__main__":
    app.run(debug=True)
    # db.create_all() 