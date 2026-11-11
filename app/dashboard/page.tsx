"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import CardInfo from "@/components/CardInfo";
import BarraNivel from "@/components/BarraNivel";
import CardVentilador from "@/components/CardVentilador";
import TabelaHistorico from "@/components/TabelaHistorico";
import ListaEventos from "@/components/ListaEventos";
import { buscarEventos, buscarHistorico, buscarLeituraAtual, tratarErro } from "@/lib/api";
import type { Evento, Leitura } from "@/lib/api";
import { INTERVALO_ATUALIZACAO } from "@/lib/config";
import { formatarData, formatarNumero } from "@/lib/formatar";

export default function Dashboard() {
    const [atual, setAtual] = useState<Leitura | null>(null);
    const [historico, setHistorico] = useState<Leitura[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // busca tudo assim que abre e depois a cada 5s com o setInterval
    // o return com clearInterval para o timer quando sai da pagina
    // fonte: https://stackoverflow.com/questions/53090432/react-hooks-right-way-to-clear-timeouts-and-intervals
    useEffect(() => {
        async function carregar() {
            try {
                setAtual(await buscarLeituraAtual());
                setHistorico(await buscarHistorico());
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

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />

            <div className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col gap-8">
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Painel do Silo</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Última leitura: <span className="tabular-nums">{atual ? formatarData(atual.data_hora) : "—"}</span>
                    </p>
                </div>

                {erro && <p className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">{erro}</p>}
                {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

                {!carregando && atual === null && !erro && (
                    <p className="bg-white border border-gray-200 text-sm text-gray-600 px-4 py-3 rounded-md">Nenhuma leitura registrada.</p>
                )}

                {atual && (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <CardInfo titulo="Temperatura" valor={formatarNumero(atual.temperatura_c, 1)} unidade="°C" />
                        <CardInfo titulo="Umidade" valor={formatarNumero(atual.umidade_percentual, 1)} unidade="%" />
                        <CardInfo titulo="Distância" valor={formatarNumero(atual.distancia_metros, 3)} unidade="m" />
                        <CardVentilador ligado={atual.ventilador_ligado} />
                        <div className="sm:col-span-2 lg:col-span-4">
                            <BarraNivel nivel={atual.nivel_percentual} />
                        </div>
                    </section>
                )}

                {/* o painel so mostra os 5 primeiros, o resto fica nas paginas de historico e alertas */}
                <section>
                    <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-lg font-semibold">Últimas leituras</h2>
                        <Link href="/historico" className="text-sm font-medium text-pucpr hover:underline">Ver histórico completo →</Link>
                    </div>
                    {!carregando && <TabelaHistorico leituras={historico.slice(0, 5)} />}
                </section>

                <section>
                    <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-lg font-semibold">Últimos alertas</h2>
                        <Link href="/alertas" className="text-sm font-medium text-pucpr hover:underline">Ver todos os alertas →</Link>
                    </div>
                    {!carregando && <ListaEventos eventos={eventos.slice(0, 5)} />}
                </section>
            </div>
        </div>
    );
}
