
from models.evento import Evento


def verificar_alertas(leitura, silo_id):

    eventos = []

    # ver se temperatura passa do limite
    if leitura.temperatura_c is not None:
        if leitura.temperatura_c > 30:

            evento = Evento(
                silo_id=silo_id,
                tipo="TEMPERATURA_ALTA",
                descricao=f"Temperatura de {leitura.temperatura_c} °C excedeu o limite de 30°C."
            )

            eventos.append(evento)

    # verifica se o silo está com nível baixo
    if leitura.nivel_percentual < 20:

        evento = Evento(
            silo_id=silo_id,
            tipo="NIVEL_BAIXO",
            descricao=f"Nível do silo em {leitura.nivel_percentual}%, abaixo do limite de 20%."
        )

        eventos.append(evento)

    # verifica se a umidade do ar está alta
    if leitura.umidade_percentual is not None:
        if leitura.umidade_percentual > 70:

            evento = Evento(
                silo_id=silo_id,
                tipo="UMIDADE_ALTA",
                descricao=f"Umidade do ar em {leitura.umidade_percentual}%, acima do limite de 70%."
            )

            eventos.append(evento)    

    return eventos
