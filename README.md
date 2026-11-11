# Monitor Silo IoT

o projeto serve para monitoramento de um silo, com o uso de ESP32. o ESP32 lê a temperatura, a umidade e a distância até o grão, manda pra uma API em Flask, e um painel em Next.js (TypeScript + React + Next Router) mostra tudo na tela.

## Como funciona

- **ESP32** (`firmware/esp32`): lê o BME280 (temperatura e umidade) e o sensor ultrassônico (distância), calcula o nível do silo e liga/desliga o ventilador. Liga com 30 °C e desliga com 27 °C. A cada 5 segundos manda os dados pra API.
- **Backend** (`backend`): API em Flask com MySQL. Salva as leituras e gera alertas quando a temperatura passa de 30 °C, a umidade passa de 70% ou o nível fica abaixo de 20%. Tem login com sessão.
- **Frontend** (`app` e `components`): painel em Next.js com login, cards com as leituras atuais, nível do silo, histórico e alertas. Atualiza sozinho a cada 5 segundos.

## O que precisa ter instalado

- Python 3
- Node.js
- MySQL 8

## Como rodar

### Arquivo .env

Crie o arquivo `backend/.env` assim (troque os valores, isso eh um exemplo..):

```
SECRET_KEY=uma_chave_qualquer_grande_ou_gerada_aleatoriamente
DB_USER=silo_app
DB_PASSWORD=sua_senha
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=silo_iot
ESP32_API_KEY=a_mesma_chave_que_ta_no_esp32
```

### Banco de dados

O `rodar_aplicacao.sh` já cria o banco (de teste ne), o usuário do `.env`, as tabelas, o silo 1, o dispositivo 1 e um usuário de teste. Rode da pasta raiz do projeto:

```bash
bash rodar_aplicacao.sh
```

ele pede a senha do `sudo` p ligar o MySQL

### Backend (porta 5001)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # no fish: source .venv/bin/activate.fish
pip install -r requirements.txt
python app.py
```

pra ver se subiu: http://localhost:5001/api/health (rota teste)

### Frontend (porta 3000)

em outro terminal, na root do projeto:

```bash
npm install
npm run dev
```

abre http://localhost:3000 e entra com:
(credenciais do db)

se quiser criar outro usuário:

```bash
cd backend
python scripts/criar_usuario.py
```

### ESP32

Coloque os arquivos de `firmware/esp32` no ESP32 (eu usei MicroPython) e crie um `config_esp32.py` com o endereço da API e a chave:

```python
API_URL = "http://ip:5001/api/leituras"
API_KEY = "a_mesma_chave_do_ESP32_API_KEY"
```

O ESP32 manda as leituras com `dispositivo_id = 1`, que o script do banco já cria.

## Testes

```bash
cd backend
source .venv/bin/activate
pytest
```

## Rotas da API

| método | rota | o que faz?|
|---|---|---|
| POST | `/api/leituras` | ESP32 manda uma leitura (precisa da chave configurada) |
| GET | `/api/leituras/atual` | última leitura |
| GET | `/api/leituras/historico` | histórico de leituras |
| GET | `/api/eventos` | alertas gerados |
| POST | `/api/auth/login` | login |
| POST | `/api/auth/logout` | logout |
| GET | `/api/auth/sessao` | vê se tá logado |
| GET | `/api/health` | vê se a API tá no ar (health)|
| GET | `/api/teste-banco` | vê se a API conecta no banco direitinha |

### CONSIDERAÇÕES

O projeto foi feito por Francisco Medeiros (front), Mateus de Brito Gomes (back e documentação), Thiago Oliveira Fernandes (back, firmware) e Júlio Cesar Stein (back, firmware e documentação). Quem escreveu o documento fui eu, Francisco, com ajuda da documentação do Thiago

**DECLARAMOS QUE NÃO TEM USO DE I.A. GENERATIVA NESSE PROJETO.**
**os arquivos gerados automaticamente pelo Next podem parecer isso mas sao gerados assim q vc usa a CLI pra gerar**