def controlar_ventilador(temperatura, ligado):
    
    if temperatura >= 30:
        return True

    
    if temperatura <= 27:
        return False

    
    return ligado