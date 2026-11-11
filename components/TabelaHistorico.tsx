import type { Leitura } from "@/lib/api";
import { formatarData, formatarNumero } from "@/lib/formatar";

type Props = {
    leituras: Leitura[];
};

function textoVentilador(leitura: Leitura) {
    if (leitura.ventilador_ligado === true) return "Ligado";
    if (leitura.ventilador_ligado === false) return "Desligado";
    return "Indisponível";
}

export default function TabelaHistorico({ leituras }: Props) {
    if (leituras.length === 0) {
        return <p className="text-sm text-gray-500">Nenhuma leitura registrada.</p>;
    }

    const linhas = [];

    // numeros alinhados a direita pra ficar mais facil de comparar coluna
    for (const leitura of leituras) {
        linhas.push(
            <tr key={leitura.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">{formatarData(leitura.data_hora)}</td>
                <td className="px-3 py-2 text-right">{formatarNumero(leitura.temperatura_c, 1)}</td>
                <td className="px-3 py-2 text-right">{formatarNumero(leitura.umidade_percentual, 1)}</td>
                <td className="px-3 py-2 text-right">{formatarNumero(leitura.distancia_metros, 3)}</td>
                <td className="px-3 py-2 text-right">{formatarNumero(leitura.nivel_percentual, 1)}</td>
                <td className="px-3 py-2">{textoVentilador(leitura)}</td>
            </tr>
        );
    }

    return (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left tabular-nums">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-3 py-2.5 font-medium">Data/Hora</th>
                        <th className="px-3 py-2.5 font-medium text-right">Temp. (°C)</th>
                        <th className="px-3 py-2.5 font-medium text-right">Umidade (%)</th>
                        <th className="px-3 py-2.5 font-medium text-right">Distância (m)</th>
                        <th className="px-3 py-2.5 font-medium text-right">Nível (%)</th>
                        <th className="px-3 py-2.5 font-medium">Ventilador</th>
                    </tr>
                </thead>
                <tbody>{linhas}</tbody>
            </table>
        </div>
    );
}
