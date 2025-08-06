from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
import stripe

# 拡張機能の初期化
cors = CORS()
jwt = JWTManager()
socketio = SocketIO()

def init_extensions(app):
    cors.init_app(app, supports_credentials=True, 
                  resources={r"/api/*": {"origins": app.config['ORIGINS']}, 
                           r"/socket.io/*": {"origins": app.config['ORIGINS']}})
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*", async_mode="eventlet")
    stripe.api_key = app.config['STRIPE_SECRET_KEY']
    
    return socketio