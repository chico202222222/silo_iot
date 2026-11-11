"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CardInfo from "@/components/CardInfo";
import TabelaHistorico from "@/components/TabelaHistorico";
import { buscarHistorico, tratarErro } from "@/lib/api";
import type { Leitura } from "@/lib/api";
import { INTERVALO_ATUALIZACAO } from "@/lib/config";
import { formatarNumero } from "@/lib/formatar";

// media de uma lista de numeros, os null (sensor sem valor) saem antes com o filter
// fonte do filter: https://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
// fonte do reduce: https://stackoverflow.com/questions/10359907/how-to-compute-the-sum-and-average-of-elements-in-an-array
function media(valores: (number | null)[]) {
    const numeros = valores.filter((valor) => valor !== null);

    if (numeros.length === 0) {
        return null;
    }

    const soma = numeros.reduce((total, valor) => total + valor, 0);
    return soma / numeros.length;
}

// pagina com as ultimas 50 leituras do esp32 (o backend so manda 50)
export default function Historico() {
    const [leituras, setLeituras] = useState<Leitura[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // mesma ideia do painel: busca agora e depois a cada 5s
    // fonte: https://stackoverflow.com/questions/53090432/react-hooks-right-way-to-clear-timeouts-and-intervals
    useEffect(() => {
        async function carregar() {
            try {
                setLeituras(await buscarHistorico());
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
                    <h1 className="text-2xl font-bold tracking-tight">Histórico de leituras</h1>
                    <p className="text-sm text-gray-500 mt-1">Últimas 50 leituras do sensor</p>
                </div>

                {erro && <p className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">{erro}</p>}
                {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

                {/* o map pega so um campo de cada leitura pra mandar pra media */}
                {leituras.length > 0 && (
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <CardInfo titulo="Temperatura média" valor={formatarNumero(media(leituras.map((l) => l.temperatura_c)), 1)} unidade="°C" />
                        <CardInfo titulo="Umidade média" valor={formatarNumero(media(leituras.map((l) => l.umidade_percentual)), 1)} unidade="%" />
                        <CardInfo titulo="Nível médio" valor={formatarNumero(media(leituras.map((l) => l.nivel_percentual)), 1)} unidade="%" />
                    </section>
                )}

                {!carregando && <TabelaHistorico leituras={leituras} />}
            </div>
        </div>
    );
}
