import type { ReactNode } from "react";

// aqui, children representa o conteúdo que será renderizado dentro do componente PageRoot. Ele é do tipo ReactNode, que é um tipo genérico que pode representar qualquer coisa que possa ser renderizada pelo React, 
// como elementos JSX, strings, números,
//  arrays e  etc

export default function PageRoot({ children }: { children?: ReactNode }) {
    return (
        // data-scroll-behavior avisa o next do scroll suave do globals.css,
        // assim ele desliga o suave so na hora de trocar de pagina
        <html lang="pt-BR" data-scroll-behavior="smooth">
            <body className="m-0 bg-gray-50 text-gray-900 font-sans antialiased">
                <main className="min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
