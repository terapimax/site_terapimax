import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/types";
import { IconInstagram, IconWhatsApp } from "./icons";

const INSTITUCIONAL = [
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
  { href: "/perguntas-frequentes", label: "Perguntas frequentes" },
  { href: "/blog", label: "Blog" },
  { href: "/rastreio", label: "Rastrear pedido" },
];
const POLITICAS = [
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
  { href: "/politica-de-reembolso", label: "Política de reembolso" },
  { href: "/politica-de-frete", label: "Política de frete" },
  { href: "/termos-de-servico", label: "Termos de serviço" },
  { href: "/politica-de-cookies", label: "Política de cookies" },
];

export default function Footer({ settings, base = "" }: { settings: Settings; base?: string }) {
  const phone = settings.whatsapp.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  return (
    <footer className="mt-16 bg-brand-900 text-white/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/logo-dark-bg.png" alt="Terapimax" width={2928} height={755} className="h-11 w-auto" />
          <p className="mt-4 text-sm">{settings.tagline}</p>
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white">
            <IconInstagram /> @terapimax_
          </a>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Institucional</h2>
          <ul className="space-y-2 text-sm">
            {INSTITUCIONAL.map((l) => (
              <li key={l.href}><Link href={base ? `${base}${l.href}` : l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Políticas</h2>
          <ul className="space-y-2 text-sm">
            {POLITICAS.map((l) => (
              <li key={l.href}><Link href={base ? `${base}${l.href}` : l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-white">Atendimento</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <IconWhatsApp className="h-4 w-4" /> {phone}
              </a>
            </li>
            <li><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>
            <li>{settings.hours}</li>
          </ul>
          <p className="mt-5 text-xs text-white/60">Pagamento seguro com Pix e cartão via Mercado Pago.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
