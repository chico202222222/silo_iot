"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ErroApi, login, verificarSessao } from "@/lib/api";
import { esquemaLogin } from "@/lib/validacao";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [enviando, setEnviando] = useState(false);

    // se ja tiver logado vai direto pro painel
    // se nao, mostra o aviso de sessao expirada ou de logout
    useEffect(() => {
        const motivo = new URLSearchParams(window.location.search).get("motivo");
        // se ja tiver logado vai direto pro painel
        // o new URLSearchParams(window.location.search) pega o parametro 
        // motivo da url, que pode ser sessao ou logout
        // eu codei pro motivo ser "sessao" ou "logout", mas se o cara colocar
        //  outro valor na url, nao vai dar erro, so nao vai mostrar aviso
        verificarSessao()
            .then(() => router.replace("/dashboard"))
            .catch(() => {
                if (motivo === "sessao") {
                    setAviso("Sua sessão não existe ou expirou. Faça login novamente.");
                }
                if (motivo === "logout") {
                    setAviso("Você saiu do sistema.");
                }
            });
    }, [router]);

    async function entrar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("");
        setAviso("");

        // safeParse nao joga erro, so devolve success true ou false
        // se falhar pega a primeira mensagem e mostra na tela
        const resultado = esquemaLogin.safeParse({ email: email.trim(), senha: senha });

        if (!resultado.success) {
            setErro(resultado.error.issues[0].message);
            return;
        }

        setEnviando(true);

        try {
            await login(resultado.data.email, resultado.data.senha);
            setSenha("");
            router.replace("/dashboard");
        } catch (erroLogin) {
            if (erroLogin instanceof ErroApi && erroLogin.status === 401) {
                setErro("E-mail ou senha inválidos.");
            } else if (erroLogin instanceof ErroApi) {
                setErro(erroLogin.message);
            } else {
                setErro("Erro inesperado ao fazer login.");
            }
        }

        setEnviando(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <form onSubmit={entrar} className="w-full max-w-sm bg-white rounded-lg p-8 border-t-4 border-pucpr">
                <Image src="/logo-pucpr.png" alt="PUCPR" width={165} height={75} className="h-12 w-auto mb-6" priority />
                <h1 className="text-2xl font-bold tracking-tight text-black">Monitor Silo IoT</h1>
                <p className="text-sm text-gray-500 mt-1 mb-6">Entre para acessar o painel</p>

                {aviso && <p className="bg-gray-50 border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md mb-4">{aviso}</p>}
                {erro && <p className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md mb-4">{erro}</p>}

                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">E-mail</label>
                <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-pucpr focus:ring-2 focus:ring-pucpr/20"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="senha">Senha</label>
                <input
                    id="senha"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:border-pucpr focus:ring-2 focus:ring-pucpr/20"
                />

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-pucpr hover:bg-pucpr-escuro disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-md transition-colors"
                >
                    {enviando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}
