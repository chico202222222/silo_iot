
import pytest
from app import app


@pytest.fixture
def cliente():
    app.config["TESTING"] = True
    return app.test_client()


def test_health(cliente):
    resposta = cliente.get("/api/health")
    assert resposta.status_code == 200


def test_banco(cliente):
    resposta = cliente.get("/api/teste-banco")
    assert resposta.status_code == 200


def test_leitura_atual(cliente):

    # simula um usuario logado
    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.get("/api/leituras/atual")

    assert resposta.status_code == 200


def test_leitura_atual_sem_login(cliente):

    resposta = cliente.get("/api/leituras/atual")

    assert resposta.status_code == 401

def test_historico(cliente):

    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.get("/api/leituras/historico")

    assert resposta.status_code == 200


def test_historico_sem_login(cliente):

    resposta = cliente.get("/api/leituras/historico")

    assert resposta.status_code == 401


def test_eventos(cliente):

    with cliente.session_transaction() as sessao:
        sessao["usuario_id"] = 1

    resposta = cliente.get("/api/eventos")

    assert resposta.status_code == 200


def test_eventos_sem_login(cliente):

    resposta = cliente.get("/api/eventos")

    assert resposta.status_code == 401


def test_post_sem_chave(cliente):
    resposta = cliente.post(
        "/api/leituras",
        json={
            "dispositivo_id": 1,
            "distancia_metros": 1.5,
            "nivel_percentual": 50
        }
    )
    assert resposta.status_code == 401


def test_ventilador_valor_invalido(cliente, monkeypatch):
    # Configura uma chave de teste
    monkeypatch.setenv("ESP32_API_KEY", "chave_teste")

    resposta = cliente.post(
        "/api/leituras",
        headers={"X-API-KEY": "chave_teste"},
        json={
            "dispositivo_id": 1,
            "distancia_metros": 0.3,
            "nivel_percentual": 70,
            "ventilador_ligado": "ligado"
        }
    )

    assert resposta.status_code == 400
    assert resposta.get_json()["erro"] == (
        "ventilador ligado deve ser true ou false"
    )

def test_ventilador_ligado(cliente, monkeypatch):
    monkeypatch.setenv("ESP32_API_KEY", "chave_teste")

    resposta = cliente.post(
        "/api/leituras",
        headers={"X-API-KEY": "chave_teste"},
        json={
            "dispositivo_id": 1,
            "distancia_metros": 0.3,
            "nivel_percentual": 70,
            "temperatura_c": 32,
            "umidade_percentual": 70,
            "ventilador_ligado": True
        }
    )

    assert resposta.status_code == 201


def test_ventilador_ligado(cliente, monkeypatch):
    monkeypatch.setenv("ESP32_API_KEY", "chave_teste")

    resposta = cliente.post(
        "/api/leituras",
        headers={"X-API-KEY": "chave_teste"},
        json={
            "dispositivo_id": 1,
            "distancia_metros": 0.3,
            "nivel_percentual": 70,
            "temperatura_c": 32,
            "umidade_percentual": 70,
            "ventilador_ligado": True
        }
    )

    assert resposta.status_code == 201

def test_ventilador_desligado(cliente, monkeypatch):
    monkeypatch.setenv("ESP32_API_KEY", "chave_teste")

    resposta = cliente.post(
        "/api/leituras",
        headers={"X-API-KEY": "chave_teste"},
        json={
            "dispositivo_id": 1,
            "distancia_metros": 0.3,
            "nivel_percentual": 70,
            "temperatura_c": 25,
            "umidade_percentual": 70,
            "ventilador_ligado": False
        }
    )

    assert resposta.status_code == 201    