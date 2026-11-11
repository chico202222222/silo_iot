from services.controle_ventilacao import controlar_ventilador


def test_ligar_ventilador():
    assert controlar_ventilador(32, False) is True


def test_desligar_ventilador():
    assert controlar_ventilador(25, True) is False


def test_manter_ligado():
    assert controlar_ventilador(28, True) is True


def test_manter_desligado():
    assert controlar_ventilador(28, False) is False