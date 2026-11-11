// nomes bonitos pros tipos que o backend gera (backend/services/alertas.py)
// se aparecer um tipo novo que nao ta aqui, mostra o proprio codigo
export const TIPOS_EVENTO: Record<string, string> = {
    TEMPERATURA_ALTA: "Temperatura alta",
    UMIDADE_ALTA: "Umidade alta",
    NIVEL_BAIXO: "Nível baixo",
};
// aah e Record<string, string> eh um tipo do typescript que significa 
// "objeto com chaves string e valores string", ou seja, um dicionario de string pra string
export function nomeTipoEvento(tipo: string) {
    return TIPOS_EVENTO[tipo] ?? tipo;
}
