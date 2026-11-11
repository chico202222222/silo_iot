"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ListaEventos from "@/components/ListaEventos";
import { buscarEventos, tratarErro } from "@/lib/api";
import type { Evento } from "@/lib/api";
import { INTERVALO_ATUALIZACAO } from "@/lib/config";
import { TIPOS_EVENTO } from "@/lib/eventos";

// pagina com os ultimos 50 alertas que o backend gerou (services/alertas.py)
export default function Alertas() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    // tipo escolhido nos botoes, "" = mostrar todos
    const [filtro, setFiltro] = useState("");

    // mesma ideia do painel: busca agora e depois a cada 5s
    // fonte: https://stackoverflow.com/questions/53090432/react-hooks-right-way-to-clear-timeouts-and-intervals
    useEffect(() => {
        async function carregar() {
            try {
                setEventos(await buscarEventos());
                setErro("");
            } catch (e) {
                setErro(tratarErro(e));
            }
            setCarregando(false);
        }

        carregar();
        const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO);
        return () => clearInterval(intervalo);
    }, []);

    // deixa so os eventos do tipo escolhido
    // fonte: https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes
    let filtrados = eventos;
    if (filtro !== "") {
        filtrados = eventos.filter((evento) => evento.tipo === filtro);
    }

    // botao escolhido fica com a cor da pucpr
    // fonte: https://stackoverflow.com/questions/30533171/conditionally-applying-class-attributes-in-react
    function classeBotao(tipo: string) {
        if (filtro === tipo) {
            return "px-3 py-1.5 rounded-full text-sm font-medium border bg-pucpr border-pucpr text-white";
        }
        return "px-3 py-1.5 rounded-full text-sm font-medium border bg-white border-gray-300 text-gray-700 hover:border-pucpr hover:text-pucpr";
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />

            <div className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col gap-8">
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Alertas e eventos</h1>
                    <p className="text-sm text-gray-500 mt-1">Últimos 50 alertas gerados pelas leituras do silo</p>
                </div>

                {erro && <p className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">{erro}</p>}
                {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

                {/* um botao pra cada tipo do TIPOS_EVENTO, o Object.keys da a lista dos nomes */}
                {/* fonte: https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays */}
                <div className="flex flex-wrap gap-2">
                    <button type="button" className={classeBotao("")} onClick={() => setFiltro("")}>Todos</button>
                    {Object.keys(TIPOS_EVENTO).map((tipo) => (
                        <button key={tipo} type="button" className={classeBotao(tipo)} onClick={() => setFiltro(tipo)}>
                            {TIPOS_EVENTO[tipo]}
                        </button>
                    ))}
                </div>

                {!carregando && <ListaEventos eventos={filtrados} />}
            </div>
        </div>
    );
}
