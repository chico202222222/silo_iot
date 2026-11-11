import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from sqlalchemy import text
from sqlalchemy.engine import URL
from extensions import db

from models.silo import Silo
from models.dispositivo import Dispositivo
from models.leitura import Leitura
from models.evento import Evento
from models.usuario import Usuario

from routes.leituras import leituras_bp
from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

if not app.config["SECRET_KEY"]:
    raise RuntimeError("SECRET_KEY  nao configurada.")

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

app.config["SQLALCHEMY_DATABASE_URI"] = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST","localhost"),
    port=int(os.getenv("DB_PORT", 3306)),
    database=os.getenv("DB_NAME"),

)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(leituras_bp)
app.register_blueprint(auth_bp)


@app.route('/api/health', methods=['GET'])
def verificar_api():
    return jsonify({
        "status":"ok",
        "mensagem":"Api do Silo Inteligente funcionando"
    }), 200


@app.route("/api/teste-banco", methods=["GET"])
def testar_banco():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({
            "status": "ok",
            "mensagem": "Conexão com o banco de dados bem-sucedida"
        }), 200
    except Exception :
        app.logger.exception("Erro ao conectar ao MYSQL")

        return jsonify({
            "status": "erro",
            "mensagem": "Falha na conexão com o banco de dados"
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)