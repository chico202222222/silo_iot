// transforma o numero em texto no jeito br (virgula no lugar do ponto)
// se vier null ou vazio mostra um tracinho
// fonte: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings
// fonte: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
export function formatarNumero(valor: number | null | undefined, casas: number) {
    if (valor === null || valor === undefined || isNaN(valor)) {
        return "-";
    }

    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    });
}

// o flask manda a data em utc mas sem o "z" no final
// a gente coloca o "z" pra converter certo pro horario daqui
// fonte: https://stackoverflow.com/questions/19654578/python-utc-datetime-objects-iso-format-doesnt-include-z-zulu-or-zero-offset
// fonte: https://stackoverflow.com/questions/2587345/why-does-date-parse-give-incorrect-results
export function formatarData(valor: string | null) {
    if (!valor) {
        return "-";
    }

    let texto = valor;

    const temFuso = texto.endsWith("Z") || texto.includes("+") || texto.lastIndexOf("-") > 10;

    if (!temFuso) {
        texto = texto + "Z";
    }

    const data = new Date(texto);

    if (isNaN(data.getTime())) {
        return "-";
    }

    return data.toLocaleString("pt-BR");
}
