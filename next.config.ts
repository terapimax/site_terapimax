import type { NextConfig } from "next";

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co");

const nextConfig: NextConfig = {
  images: {
    // Só para testes locais com Supabase em http://127.0.0.1.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
    remotePatterns: [
      { protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https", hostname: supabaseUrl.hostname },
      { protocol: "https", hostname: "terapimax.com.br" },
    ],
  },
  // Endereços antigos do WordPress que mudaram de nome (mantém o Google e links salvos funcionando).
  async redirects() {
    const map: Record<string, string> = {
      "/finalizar-compra": "/checkout",
      "/minha-conta": "/rastreio",
      "/rastreie-seu-pedido": "/rastreio",
      "/rastreamento": "/rastreio",
      "/pagina-perguntas-frequentes-faq": "/perguntas-frequentes",
      "/pagina-politicas-de-troca-e-devolucao": "/trocas-e-devolucoes",
      "/politicas-de-frete": "/politica-de-frete",
      "/atendimento": "/contato",
      "/central-de-ajuda": "/perguntas-frequentes",
      "/mais-vendidos": "/loja?colecao=mais-vendidos",
      "/categoria/mais-vendidos": "/loja?colecao=mais-vendidos",
      "/categoria/novidades": "/loja?colecao=novidades",
      "/categorias": "/loja",
      "/colecoes": "/loja",
      "/inicio": "/",
      "/pagina-inicial": "/",
    };
    return Object.entries(map).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
