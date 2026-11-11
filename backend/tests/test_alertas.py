from types import SimpleNamespace
from services.alertas import verificar_alertas


def test_temperatura_alta():

    leitura = SimpleNamespace(
        temperatura_c=35,
        nivel_percentual=50,
        umidade_percentual=60
    )

    eventos = verificar_alertas(leitura, 1)

    assert len(eventos) == 1
    assert eventos[0].tipo == "TEMPERATURA_ALTA"

def test_nivel_baixo():

    leitura = SimpleNamespace(
        temperatura_c=25,
        nivel_percentual=15,
        umidade_percentual=60
    )

    eventos = verificar_alertas(leitura, 1)

    assert len(eventos) == 1
    assert eventos[0].tipo == "NIVEL_BAIXO"  


def test_umidade_alta():

    leitura = SimpleNamespace(
        temperatura_c=25,
        nivel_percentual=50,
        umidade_percentual=85
    )

    eventos = verificar_alertas(leitura, 1)

    assert len(eventos) == 1
    assert eventos[0].tipo == "UMIDADE_ALTA" 


def test_tres_alertas():

    leitura = SimpleNamespace(
        temperatura_c=35,
        nivel_percentual=15,
        umidade_percentual=85
    )

    eventos = verificar_alertas(leitura, 1)

    tipos = [evento.tipo for evento in eventos]

    assert len(eventos) == 3
    assert "TEMPERATURA_ALTA" in tipos
    assert "NIVEL_BAIXO" in tipos
    assert "UMIDADE_ALTA" in tipos         

