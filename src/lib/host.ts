export const MAIN_SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.terapimax.com.br";

/** Links relativos do conteúdo viram links para a loja principal (necessário no subdomínio do blog). */
export function absolutizeLinks(html: string) {
  return html.replace(/href="\/(?!\/)/g, `href="${MAIN_SITE}/`);
}
