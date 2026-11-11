
from machine import Pin, I2C, time_pulse_us
from bme280_sensor import BME280
from config_esp32 import API_URL, API_KEY
from time import sleep, sleep_us
import urequests

#constantes
ALTURA_SILO_METROS = 1.0

TEMPERATURA_MAXIMA = 30.0
TEMPERATURA_MINIMA = 27.0

INTERVALO_LEITURA_SEGUNDOS = 5

PINO_VENTILADOR = 4 #D04 NA PLACA

#controle do ventilador
def controlar_ventildor(temperatura, ligado):

    if temperatura >= TEMPERATURA_MAXIMA:
        return True

    if temperatura <= TEMPERATURA_MINIMA:
        return False

    return ligado

#controle BME280

#inicia a placa
i2c = I2C(0, scl=Pin(18), sda=Pin(19), freq=100000)
sensor = BME280(i2c=i2c)

#inicia medidor de distancia

trig = Pin(23, Pin.OUT)
echo = Pin(22, Pin.IN)

#simulando ventilador com led
ventilador = Pin(PINO_VENTILADOR, Pin.OUT)

#estado inicial
ventilador_ligado = False
ventilador.value(0)

def executar_leitura():
    global ventilador_ligado

    #bme captaando medidas
    temperatura, pressao, umidade = sensor.values

    temp = float(temperatura.replace("C", ""))
    umid = float(umidade.replace("%", ""))

    ventilador_ligado = controlar_ventildor(
        temp,
        ventilador_ligado
    )

    ventilador.value(1 if ventilador_ligado else 0)

    print("Ventilador:", "LIGADO" if ventilador_ligado else "DESLIGADO")

    #MEDIR DISTANCIA

    trig.value(0)
    sleep(1)

    trig.value(1)
    sleep_us(10)
    trig.value(0)

    try:
        duracao = time_pulse_us(echo, 1, 30000)

    except OSError as erro:
        print("Erro no HC-SR04:", erro)
        duracao = -1

    if duracao < 0:
        print("Erro: HC-SR04 nao recebeu sinal")
        print("Leitura nao enviada ao MySQL")

    else:
        # Calcula a distancia em metros
        distancia_m = (duracao * 0.000343) / 2

        # Calcula o nivel do silo virtual
        nivel_percentual = (
            (ALTURA_SILO_METROS - distancia_m)
            / ALTURA_SILO_METROS
        ) * 100

        nivel_percentual = max(0, min(100, nivel_percentual))

        # Dados enviados ao Flask
        dados = {
            "dispositivo_id": 1,
            "distancia_metros": round(distancia_m, 3),
            "nivel_percentual": round(nivel_percentual, 2),
            "temperatura_c": temp,
            "umidade_percentual": umid,
            "ventilador_ligado": ventilador_ligado
        }

        resposta = None

        try:
            resposta = urequests.post(
                API_URL,
                json=dados,
                headers={
                    "Content-Type": "application/json",
                    "X-API-KEY": API_KEY
                }
            )

            print("HTTP:", resposta.status_code)
            print("Resposta:", resposta.text)

        except Exception as erro:
            print("Erro no envio:", erro)

        finally:
            if resposta is not None:
                resposta.close()

        print("Temperatura:", temp, "C")
        print("Umidade:", umid, "%")
        print("Distancia:", round(distancia_m, 3), "metros")
        print("Nivel:", round(nivel_percentual, 2), "%")


while True:
    try:
        executar_leitura()
    except Exception as erro:
        print("Erro na leitura:", erro)

    sleep(INTERVALO_LEITURA_SEGUNDOS)
