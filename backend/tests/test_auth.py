from app import app


def test_logout_remove_sessao():

    cliente = app.test_client()

    token = pegar_token_csrf(cliente)

    # simula um usuario logado
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.post(
        "/api/auth/logout",
        headers={"X-CSRF-Token": token}
    )

    assert resposta.status_code == 200

    # confere se o usuario saiu da sessao
    with cliente.session_transaction() as sessao:
        assert "usuario_id" not in sessao

def test_sessao_sem_login():

    cliente = app.test_client()

    resposta = cliente.get("/api/auth/sessao")

    assert resposta.status_code == 401
    assert resposta.get_json()["autenticado"] is False


def test_sessao_com_login():

    cliente = app.test_client()

    # simula uma sessao do usuario cadastrado
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.get("/api/auth/sessao")

    assert resposta.status_code == 200
    assert resposta.get_json()["autenticado"] is True
    assert resposta.get_json()["usuario"]["id"] == 1

def test_sessao_usuario_inexistente():

    cliente = app.test_client()

    # simula uma sessao com usuario que nao existe
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 999999999

    resposta = cliente.get("/api/leituras/atual")

    assert resposta.status_code == 401

def test_login_senha_incorreta():

    cliente = app.test_client()

    token = pegar_token_csrf(cliente)

    resposta = cliente.post(
        "/api/auth/login",
        json={
            "email": "usuario.inexistente@exemplo.com",
            "senha": "SenhaIncorreta123!"
        },
        headers={"X-CSRF-Token": token}
    )

    assert resposta.status_code == 401

    with cliente.session_transaction() as sessao:
        assert "usuario_id" not in sessao

from models.usuario import Usuario



def test_login_usuario_existente_senha_errada():

    cliente = app.test_client()

    token = pegar_token_csrf(cliente)

    with app.app_context():
        usuario = Usuario.query.first()
        assert usuario is not None

        email = usuario.email

    resposta = cliente.post(
        "/api/auth/login",
        json={
            "email": email,
            "senha": "SenhaErradaTeste987!"
        },
        headers={"X-CSRF-Token": token}
    )

    assert resposta.status_code == 401

    with cliente.session_transaction() as sessao:
        assert "usuario_id" not in sessao


import uuid
import bcrypt

from extensions import db


def test_login_valido():

    email = f"teste_{uuid.uuid4().hex}@exemplo.com"
    senha = "SenhaTeste123!"

    with app.app_context():
        usuario = Usuario(
            nome="Usuario Teste",
            email=email,
            senha_hash=bcrypt.hashpw(
                senha.encode("utf-8"),
                bcrypt.gensalt(rounds=12)
            ).decode("utf-8")
        )

        db.session.add(usuario)
        db.session.commit()
        usuario_id = usuario.id

    try:
        cliente = app.test_client()

        token = pegar_token_csrf(cliente)

        resposta = cliente.post(
            "/api/auth/login",
            json={"email": email, "senha": senha},
            headers={"X-CSRF-Token":token}
        )

        assert resposta.status_code == 200

        with cliente.session_transaction() as sessao:
            assert sessao.get("usuario_id") == usuario_id

    finally:
        # apaga o usuario usado no teste
        with app.app_context():
            usuario = db.session.get(Usuario, usuario_id)

            if usuario is not None:
                db.session.delete(usuario)
                db.session.commit()

def test_csrf_gerado():

    cliente = app.test_client()

    resposta = cliente.get("/api/auth/csrf")

    assert resposta.status_code == 200

    token = resposta.get_json()["csrf_token"]
    assert isinstance(token, str)
    assert len(token) > 20

    with cliente.session_transaction() as sessao:
        assert sessao["csrf_token"] == token


def test_login_sem_csrf():

    cliente = app.test_client()

    resposta = cliente.post(
        "/api/auth/login",
        json={
            "email": "teste@exemplo.com",
            "senha": "SenhaTeste123!"
        }
    )

    assert resposta.status_code == 403

def pegar_token_csrf(cliente):

    resposta = cliente.get("/api/auth/csrf")

    assert resposta.status_code == 200

    return resposta.get_json()["csrf_token"]

def test_login_csrf_invalido():

    cliente = app.test_client()

    # gera um token valido para a sessao
    pegar_token_csrf(cliente)

    resposta = cliente.post(
        "/api/auth/login",
        json={
            "email": "teste@exemplo.com",
            "senha": "SenhaTeste123!"
        },
        headers={"X-CSRF-Token": "token-errado"}
    )

    assert resposta.status_code == 403

    with cliente.session_transaction() as sessao:
        assert "usuario_id" not in sessao

def test_logout_sem_csrf():

    cliente = app.test_client()

    # cria uma sessao de teste
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.post("/api/auth/logout")

    assert resposta.status_code == 403

    # verifica se a sessao continua ativa
    with cliente.session_transaction() as sessao:
        assert sessao.get("usuario_id") == 1        