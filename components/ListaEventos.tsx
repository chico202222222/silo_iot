import type { Evento } from "@/lib/api";
import { formatarData } from "@/lib/formatar";
import { nomeTipoEvento } from "@/lib/eventos";

type Props = {
    eventos: Evento[];
};
// pagina de eventos, mostra a lista de alertas que o backend gerou
export default function ListaEventos({ eventos }: Props) {
    if (eventos.length === 0) {
        return <p className="text-sm text-gray-500">Nenhum alerta registrado.</p>;
    }

    const itens = [];

    for (const evento of eventos) {
        itens.push(
            <li key={evento.id} className="bg-white border border-gray-200 border-l-4 border-l-pucpr px-4 py-3 rounded-md">
                <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="text-sm font-semibold text-pucpr">{nomeTipoEvento(evento.tipo)}</span>
                    <span className="text-xs text-gray-500 tabular-nums">{formatarData(evento.data_hora)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{evento.descricao}</p>
            </li>
        );
    }

    return <ul className="flex flex-col gap-2">{itens}</ul>;
}
