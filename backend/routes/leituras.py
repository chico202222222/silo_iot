import os
import hmac

from flask import Blueprint, request, jsonify,session
from extensions import db
from models.leitura import Leitura
from models.dispositivo import Dispositivo
from services.alertas import verificar_alertas
from models.evento import Evento
from services.autenticacao import obter_usuario_logado
import math


leituras_bp = Blueprint("leituras", __name__)


@leituras_bp.route("/api/leituras", methods=["POST"])
def cadastrar_leitura():

    chave_esperada = os.getenv("ESP32_API_KEY")
    chave_recebida = request.headers.get("X-API-KEY", "")

    if not chave_esperada:
        return jsonify({
            "erro": "Chave de API não configurada no servidor."
        }), 500

    if not hmac.compare_digest(chave_esperada, chave_recebida):
        return jsonify({
            "erro": "Chave de API inválida."
        }), 401


    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "enviar um JSON válido."
        }), 400

    # campos que precisam vir na leitura
    campos_obrigatorios = [
        "dispositivo_id",
        "distancia_metros",
        "nivel_percentual"
    ]

    for campo in campos_obrigatorios:
        if campo not in dados or dados[campo] is None:
            return jsonify({
                "erro": f"Campo '{campo}' é obrigatório."
            }), 400

    # verifica o id do dispositivo
    if type(dados["dispositivo_id"]) is not int:
        return jsonify({
            "erro": "dispositivo_id deve ser um numero inteiro."
        }), 400

    if dados["dispositivo_id"] <= 0:
        return jsonify({
            "erro": "dispositivo_id deve ser um inteiro positivo."
        }), 400

    # verifica se os valores recebidos são números
    campos_numericos = [
        "distancia_metros",
        "nivel_percentual",
        "temperatura_c",
        "umidade_percentual"
    ]

    for campo in campos_numericos:
        valor = dados.get(campo)

        if valor is not None:
            if type(valor) not in (int, float):
                return jsonify({
                    "erro": f"Campo '{campo}' deve ser um número."
                }), 400

            # evita valores como NaN e infinito
            if not math.isfinite(valor):
                return jsonify({
                    "erro": f"Campo '{campo}' deve ser um número finito."
                }), 400

    # distância não pode ser negativa
    if dados["distancia_metros"] < 0:
        return jsonify({
            "erro": "distancia_metros não pode ser negativo."
        }), 400

    # nível precisa ficar entre 0 e 100
    if not 0 <= dados["nivel_percentual"] <= 100:
        return jsonify({
            "erro": "nivel_percentual deve estar entre 0 e 100%."
        }), 400

    umidade = dados.get("umidade_percentual")

    if umidade is not None:
        if not 0 <= umidade <= 100:
            return jsonify({
                "erro": "umidade_percentual deve estar entre 0 e 100%."
            }), 400

    #validar ventilador
    ventilador_ligado = dados.get("ventilador_ligado")

    if ventilador_ligado is not None:
        if type(ventilador_ligado) is not bool:
            return jsonify({
                "erro":"ventilador ligado deve ser true ou false"
            }),400    

    # confere se o dispositivo está cadastrado
    dispositivo = db.session.get(Dispositivo, dados["dispositivo_id"])

    if dispositivo is None:
        return jsonify({
            "erro": "dispositivo_id não encontrado."
        }), 404

    # monta a nova leitura
    nova_leitura = Leitura(
        dispositivo_id=dados["dispositivo_id"],
        distancia_metros=dados["distancia_metros"],
        nivel_percentual=dados["nivel_percentual"],
        temperatura_c=dados.get("temperatura_c"),
        umidade_percentual=dados.get("umidade_percentual"),
        ventilador_ligado=dados.get("ventilador_ligado")
    )

    # verifica os alertas da leitura
    eventos = verificar_alertas(nova_leitura, dispositivo.silo_id)

    # tenta salvar no banco
    try:
        db.session.add(nova_leitura)

        for evento in eventos:
            db.session.add(evento)

        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "erro": "Nao foi possivel salvar a leitura."
        }), 500

    return jsonify({
        "mensagem": "Leitura cadastrada com sucesso",
        "id": nova_leitura.id
    }), 201


@leituras_bp.route("/api/leituras/atual", methods=["GET"])
def leitura_atual():

    if obter_usuario_logado() is None:
        return jsonify({"erro":"Login necessario."}),401


    dispositivo_param = request.args.get("dispositivo_id")

    dispositivo_id = None

    if dispositivo_param is not None:
        if not dispositivo_param.isdigit() or int(dispositivo_param) == 0:
            return jsonify({
                "erro": "dispositivo_id deve ser um inteiro positivo"
            }), 400

        dispositivo_id = int(dispositivo_param)

    consulta = Leitura.query

    # filtra se tiver um dispositivo informado
    if dispositivo_id is not None:
        consulta = consulta.filter_by(dispositivo_id=dispositivo_id)

    # busca a leitura mais recente
    ultima_leitura = consulta.order_by(
        Leitura.data_hora.desc(),
        Leitura.id.desc()
    ).first()

    if ultima_leitura is None:
        return jsonify({
            "erro": "Nenhuma leitura encontrada."
        }), 404

    return jsonify({
        "id": ultima_leitura.id,
        "dispositivo_id": ultima_leitura.dispositivo_id,
        "distancia_metros": ultima_leitura.distancia_metros,
        "nivel_percentual": ultima_leitura.nivel_percentual,
        "temperatura_c": ultima_leitura.temperatura_c,
        "umidade_percentual": ultima_leitura.umidade_percentual,
        "ventilador_ligado": ultima_leitura.ventilador_ligado,
        "data_hora": ultima_leitura.data_hora.isoformat()
    }), 200


@leituras_bp.route("/api/leituras/historico", methods=["GET"])
def historico_leituras():
    # verifica se o usuario esta logado
    if obter_usuario_logado() is None:
        return jsonify({"erro":"Login necessario."}),401

    dispositivo_param = request.args.get("dispositivo_id")

    dispositivo_id = None

    if dispositivo_param is not None:
        if not dispositivo_param.isdigit() or int(dispositivo_param) == 0:
            return jsonify({
                "erro": "dispositivo_id deve ser um inteiro positivo"
            }), 400

        dispositivo_id = int(dispositivo_param)

    consulta = Leitura.query

    # aplica o filtro do dispositivo
    if dispositivo_id is not None:
        consulta = consulta.filter_by(dispositivo_id=dispositivo_id)

    # busca as últimas 50 leituras
    leituras = consulta.order_by(
        Leitura.data_hora.desc(),
        Leitura.id.desc()
    ).limit(50).all()

    resultado = []

    # coloca as leituras numa lista para retornar em JSON
    for leitura in leituras:
        resultado.append({
            "id": leitura.id,
            "dispositivo_id": leitura.dispositivo_id,
            "distancia_metros": leitura.distancia_metros,
            "nivel_percentual": leitura.nivel_percentual,
            "temperatura_c": leitura.temperatura_c,
            "umidade_percentual": leitura.umidade_percentual,
            "ventilador_ligado": leitura.ventilador_ligado,
            "data_hora": leitura.data_hora.isoformat()
        })

    return jsonify(resultado), 200


@leituras_bp.route("/api/eventos", methods=["GET"])
def listar_eventos():
    # verifica se o usuario esta logado
    if obter_usuario_logado() is None:
        return jsonify({"erro": "Login necessario"}), 401




    eventos = Evento.query.order_by(
        Evento.data_hora.desc(),
        Evento.id.desc()
    ).limit(50).all()


    resultado = []

    for evento in eventos:
        resultado.append({
            "id": evento.id,
            "silo_id": evento.silo_id,
            "tipo": evento.tipo,
            "descricao": evento.descricao,
            "data_hora": evento.data_hora.isoformat()
        })

    return jsonify(resultado), 200
