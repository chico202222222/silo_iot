import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

// no modo dev o next 16 bloqueia o js da pagina quando ela e aberta por outro
// endereco que nao seja localhost (ex: http://192.168.x.x:3000 no celular).
// sem o js o botao de login vira um submit normal de html e so recarrega a pagina.
// aqui libera os ips da propria maquina, pega na hora que sobe pra nao quebrar se o ip mudar
// fonte: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
// fonte do networkInterfaces: https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
const ips = ["127.0.0.1"];

for (const lista of Object.values(networkInterfaces())) {
  for (const rede of lista ?? []) {
    if (rede.family === "IPv4" && !rede.internal) {
      ips.push(rede.address);
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ips,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // o next repassa o /api pro flask, assim o navegador acha que é o mesmo site
  // e o cookie da sessao funciona sem precisar de cors no backend
  // fonte: https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: BACKEND_URL + "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
