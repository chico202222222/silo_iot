def controlar_ventilador(temperatura,ligado):
    #definir pra ligar quando atingir 30 graus
    if temperatura >= 30:
        return True

    #desliga quando cair pra temperatura limite inferior
    if temperatura <= 27:
        return False

    #regiao de operacao mantem esttado anterior

    return ligado
    
    