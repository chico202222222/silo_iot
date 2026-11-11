"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/api";

// a sidebar ficou branca pq o nome agora e todo em preto (no fundo preto sumia)
export default function Sidebar() {
    // usePathname devolve a rota aberta (ex: "/alertas"), usado pra pintar o link da pagina atual
    // fonte: https://stackoverflow.com/questions/75584678/active-link-for-navigation-menu-in-next-js-13-next-navigation
    const rota = usePathname();

    // muda a classe do link dependendo se ele ta ativo ou nao
    // fonte: https://stackoverflow.com/questions/30533171/conditionally-applying-class-attributes-in-react
    function classeLink(href: string) {
        if (rota === href) {
            return "block px-3 py-2 rounded-md bg-pucpr/10 text-pucpr font-semibold";
        }
        return "block px-3 py-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100";
    }

    // mesmo se o logout der erro manda pro login
    // fonte: https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
    async function sair() {
        try {
            await logout();
        } catch {
        }
        window.location.href = "/?motivo=logout";
    }

    return (
        <aside className="w-full md:w-60 md:h-screen md:sticky md:top-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 border-t-4 border-t-pucpr p-4 md:p-5 flex flex-wrap md:flex-nowrap md:flex-col gap-4 md:gap-8 items-center md:items-stretch justify-between">
            <div className="flex md:flex-col items-center md:items-start gap-3">
                <Image src="/logo-pucpr.png" alt="PUCPR" width={165} height={75} className="h-9 md:h-11 w-auto" priority />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-black">Monitor Silo IoT</h2>
            </div>
            <ul className="flex md:flex-col gap-1 text-sm">
                <li><Link className={classeLink("/dashboard")} href="/dashboard">Painel</Link></li>
                <li><Link className={classeLink("/historico")} href="/historico">Histórico</Link></li>
                <li><Link className={classeLink("/alertas")} href="/alertas">Alertas</Link></li>
            </ul>
            <button
                onClick={sair}
                className="md:mt-auto border border-gray-300 hover:border-pucpr hover:text-pucpr text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Sair
            </button>
        </aside>
    );
}
