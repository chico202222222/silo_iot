import { API_BASE_URL, DISPOSITIVO_ID } from "./config";

export class ErroApi extends Error {
    status: number;

    constructor(mensagem: string, status: number) {
        super(mensagem);
        // super chama o construtor da classe pai (que é error)
        // p depois definir a propriedade status
        this.status = status;
    }
}

// esses dois garantem que nunca vai aparecer NaN ou undefined na tela
// se o valor nao for do tipo certo vira null
// isso eh um erro bem comum do typescript, 
// ele nao garante que o tipo do json da api bate com o tipo que a gente quer
function numeroOuNulo(valor: unknown) {
    if (typeof valor === "number") {
        return valor;
    }
    return null;
}

function textoOuNulo(valor: unknown) {
    if (typeof valor === "string" && valor !== "") {
        return valor;
    }
    return null;
}

// classe que representa uma leitura do esp32, o construtor pega o json da api
// e ja arruma cada campo, o ventilador vira null quando nao vem
export class Leitura {
    id: number;
    dispositivo_id: number;
    distancia_metros: number | null;
    nivel_percentual: number | null;
    temperatura_c: number | null;
    umidade_percentual: number | null;
    ventilador_ligado: boolean | null;
    data_hora: string | null;

    constructor(dados: Record<string, unknown>) {
        this.id = Number(dados.id);
        this.dispositivo_id = Number(dados.dispositivo_id);
        this.distancia_metros = numeroOuNulo(dados.distancia_metros);
        this.nivel_percentual = numeroOuNulo(dados.nivel_percentual);
        this.temperatura_c = numeroOuNulo(dados.temperatura_c);
        this.umidade_percentual = numeroOuNulo(dados.umidade_percentual);
        this.data_hora = textoOuNulo(dados.data_hora);

        if (typeof dados.ventilador_ligado === "boolean") {
            this.ventilador_ligado = dados.ventilador_ligado;
        } else {
            this.ventilador_ligado = null;
        }
    }
}

// mesma ideia da leitura, mas pros alertas que o backend gera
export class Evento {
    id: number;
    silo_id: number;
    tipo: string;
    descricao: string;
    data_hora: string | null;

    constructor(dados: Record<string, unknown>) {
        this.id = Number(dados.id);
        this.silo_id = Number(dados.silo_id);
        this.tipo = textoOuNulo(dados.tipo) ?? "—";
        this.descricao = textoOuNulo(dados.descricao) ?? "—";
        this.data_hora = textoOuNulo(dados.data_hora);
    }
}

// todo fetch passa por aqui, o credentials include manda o cookie da sessao
// status 0 = nao deu nem pra conectar no servidor
async function requisicao(caminho: string, metodo = "GET", corpo: object | null = null, csrf = "") {
    const cabecalhos: Record<string, string> = {};
    // cabeçalho ta usando Record<string, string> 
    // que representa que os 2 cabeçalos tem q ser string
    // em typescript sem isso ele vai brecar, nao tem jeito
    if (corpo !== null) {
        cabecalhos["Content-Type"] = "application/json";
    }

    if (csrf !== "") {
        cabecalhos["X-CSRF-Token"] = csrf;
    }

    let resposta: Response;

    try {
        resposta = await fetch(API_BASE_URL + caminho, {
            method: metodo,
            headers: cabecalhos,
            body: corpo !== null ? JSON.stringify(corpo) : undefined,
            credentials: "include",
            cache: "no-store",
        });
    } catch {
        throw new ErroApi("Não foi possível conectar ao servidor.", 0);
    }

    let dados = null;

    try {
        dados = await resposta.json();
    } catch {
        dados = null;
    }

    if (!resposta.ok) {
        if (resposta.status >= 500 && dados === null) {
            throw new ErroApi("Não foi possível conectar ao servidor.", 0);
        }

        let mensagem = "Erro " + resposta.status + " ao falar com o servidor.";

        if (dados !== null && typeof dados.erro === "string") {
            mensagem = dados.erro;
        }

        throw new ErroApi(mensagem, resposta.status);
    }

    return dados;
}

// as paginas do painel chamam isso quando a busca da erro
// se a sessao acabou (401) manda pro login, senao devolve o texto pra mostrar na tela
// o window.location.href recarrega a pagina inteira, entao nao sobra dado velho na tela
// fonte: https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
export function tratarErro(erro: unknown) {
    if (erro instanceof ErroApi && erro.status === 401) {
        window.location.href = "/?motivo=sessao";
        return "";
    }

    if (erro instanceof ErroApi) {
        return erro.message;
    }

    return "Erro inesperado ao carregar os dados.";
}

// o filter deixa passar so os itens com indice menor que 50
// se a api nao mandar uma lista devolve vazio
function primeiros50(dados: unknown) {
    if (!Array.isArray(dados)) {
        return [];
    }

    return dados.filter((_item, indice) => indice < 50);
}

// o backend so aceita post com o token csrf no cabecalho
// entao antes do login e do logout a gente pede ele
async function pegarCsrf() {
    const dados = await requisicao("/api/auth/csrf");
    return dados.csrf_token as string;
}

export async function login(email: string, senha: string) {
    const csrf = await pegarCsrf();
    return requisicao("/api/auth/login", "POST", { email: email, senha: senha }, csrf);
}

export async function logout() {
    const csrf = await pegarCsrf();
    return requisicao("/api/auth/logout", "POST", null, csrf);
}

export async function verificarSessao() {
    return requisicao("/api/auth/sessao");
}

// 404 aqui quer dizer que ainda nao tem leitura nenhuma
// ai devolve null em vez de dar erro
export async function buscarLeituraAtual() {
    try {
        const dados = await requisicao("/api/leituras/atual?dispositivo_id=" + DISPOSITIVO_ID);
        return new Leitura(dados);
    } catch (erro) {
        if (erro instanceof ErroApi && erro.status === 404) {
            return null;
        }
        throw erro;
    }
}

export async function buscarHistorico() {
    const dados = await requisicao("/api/leituras/historico?dispositivo_id=" + DISPOSITIVO_ID);
    const leituras: Leitura[] = [];

    for (const item of primeiros50(dados)) {
        leituras.push(new Leitura(item));
    }

    return leituras;
}

export async function buscarEventos() {
    const dados = await requisicao("/api/eventos");
    const eventos: Evento[] = [];
    // evento[] cria uma nova array vazia p mapear os eventos.

    for (const item of primeiros50(dados)) {
        eventos.push(new Evento(item));
    }

    return eventos;
}
