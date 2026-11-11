import bcrypt
import hmac

from flask import Blueprint, request, jsonify, session
from extensions import db
from models.usuario import Usuario
import secrets


auth_bp = Blueprint("auth", __name__)
@auth_bp.before_request
def validar_csrf():

    if request.method != "POST":
        return

    token_esperado = session.get("csrf_token")
    token_recebido = request.headers.get("X-CSRF-Token", "")

    if (
        not isinstance(token_esperado, str)
        or not isinstance(token_recebido , str)
        or not hmac.compare_digest(token_esperado, token_recebido)
    ):
        return jsonify({
            "erro":"Token CSRF invalido."
        }), 403


@auth_bp.route("/api/auth/login", methods = ["POST"])
def login():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({
            "erro":"Envie um json valido."
        }),400

    email = dados.get("email")
    senha = dados.get("senha")

    if not isinstance(email, str) or not isinstance(senha,str):
        return jsonify({
            "erro": "Email e senha sao obrigatorios."
        }),400

    email = email.strip().lower()

    if not email or not senha:
        return jsonify({
            "erro": "e-mail e senhao sao obrigatorios"
        }),400

    if len(senha.encode("utf-8"))> 72:
        return jsonify({
            "erro": "Credenciais invalidas"
        }), 401

    usuario = Usuario.query.filter_by(email=email).first()

    if usuario is None or not bcrypt.checkpw(
        senha.encode("utf-8"),
        usuario.senha_hash.encode("utf-8")
    ):
        return jsonify({
            "erro":"credencias invalidas"
        }),401

    token_csrf = session.get("csrf_token")

    session.clear()

    session["usuario_id"]=usuario.id
    session["csrf_token"]=token_csrf
    return jsonify({
        "mensagem": "login realizdo com sucesso.",
        "usuario":{
            "id": usuario.id,
            "nome":usuario.nome
        }
    }),200


@auth_bp.route("/api/auth/logout", methods = ["POST"])
def logout():

    session.clear()

    return jsonify({
        "mensagem":"Logout realizado com sucesso"
    }), 200

@auth_bp.route("/api/auth/sessao", methods = ["GET"])
def verificar_sessao():

    usuario_id = session.get("usuario_id")

    if not usuario_id:
        return jsonify({
            "autenticado": False
        }), 401

    usuario = db.session.get(Usuario, usuario_id)

    if usuario is None:
        session.clear()
        return jsonify({
            "autenticado": False
        }), 401

    return jsonify({
        "autenticado": True,
        "usuario": {
            "id": usuario.id,
            "nome":usuario.nome,
            "email":usuario.email
        }
    }),200

@auth_bp.route("/api/auth/csrf", methods =["GET"])
def obter_csrf():

    if "csrf_token" not in session:
        session["csrf_token"]= secrets.token_urlsafe(32)

    return jsonify({
        "csrf_token": session["csrf_token"]
    }), 200