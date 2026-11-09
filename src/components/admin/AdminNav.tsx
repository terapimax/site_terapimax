"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconClose, IconMenu } from "../icons";

const LINKS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminNav({ email, signOut }: { email: string; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  const list = (
    <ul className="space-y-1">
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            onClick={() => setOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${active(l.href) ? "bg-brand-600 text-white" : "text-white/80 hover:bg-white/10"}`}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
  const footer = (
    <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
      <p className="truncate">{email}</p>
      <div className="mt-2 flex gap-3">
        <Link href="/" target="_blank" className="hover:text-white">Ver loja ↗</Link>
        <form action={signOut}><button className="hover:text-white">Sair</button></form>
      </div>
    </div>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-900 px-4 py-3 text-white lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark-bg.png" alt="Terapimax admin" className="h-7 w-auto" />
        <button onClick={() => setOpen(true)} aria-label="Abrir menu"><IconMenu /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-brand-900 p-4">
            <button onClick={() => setOpen(false)} aria-label="Fechar" className="mb-4 text-white"><IconClose /></button>
            {list}
            {footer}
          </nav>
        </div>
      )}
      <nav className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto bg-brand-900 p-4 lg:block">
        <div className="mb-6 px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark-bg.png" alt="Terapimax" className="h-9 w-auto" />
          <span className="text-xs text-white/50">Painel administrativo</span>
        </div>
        {list}
        {footer}
      </nav>
    </>
  );
}
