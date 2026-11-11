import "./globals.css";
import type { Metadata } from "next";
import PageRoot from "../components/PageRoot";

// nome que aparece na aba do navegador
// o icone da aba vem do app/icon.png (o next pega sozinho)
export const metadata: Metadata = {
    title: "Monitor Silo IoT",
};

// sem metadata o next pega o title do app/page.tsx, mas ai nao aparece o favicon



export default PageRoot;
