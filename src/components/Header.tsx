"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "./cart";
import { IconBag, IconClose, IconMenu, IconSearch, IconTruck } from "./icons";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/loja?colecao=mais-vendidos", label: "Mais vendidos" },
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/contato", label: "Contato" },
];

function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/loja?q=${encodeURIComponent(q.trim())}` : "/loja");
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder="Pesquisar produtos"
        aria-label="Pesquisar produtos"
        className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-4 pr-11 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:text-brand-600">
        <IconSearch />
      </button>
    </form>
  );
}

export default function Header({ categories, topbar }: { categories: Category[]; topbar: string }) {
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const pathname = usePathname();
  const { count, subtotal, ready } = useCart();

  useEffect(() => {
    setOpen(false);
    setDeptOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {topbar && (
        <div className="bg-brand-500 px-4 py-2 text-center text-xs font-medium tracking-wide text-white">{topbar}</div>
      )}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:py-4">
        <button className="-ml-1 rounded-lg p-1.5 md:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <IconMenu />
        </button>
        <Link href="/" className="mx-auto shrink-0 md:mx-0" aria-label="Terapimax, página inicial">
          <Image src="/logo-horizontal.png" alt="Terapimax" width={486} height={108} priority className="h-9 w-auto md:h-11" />
        </Link>
        <SearchBox className="hidden flex-1 md:block" />
        <Link href="/rastreio" className="hidden items-center gap-2 text-sm lg:flex">
          <IconTruck className="h-7 w-7 text-ink" />
          <span className="leading-tight">
            <span className="block text-xs font-semibold">Onde está meu pedido?</span>
            <span className="text-brand-600">Rastrear pedido</span>
          </span>
        </Link>
        <Link href="/carrinho" className="relative flex items-center gap-2 rounded-lg p-1.5" aria-label={`Carrinho, ${count} itens`}>
          <span className="relative">
            <IconBag />
            {ready && count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </span>
          <span className="hidden text-sm font-semibold md:inline">{money(ready ? subtotal : 0)}</span>
        </Link>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Navegação desktop */}
      <nav className="hidden border-t border-gray-100 md:block" aria-label="Principal">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4">
          <div className="relative">
            <button
              onClick={() => setDeptOpen((v) => !v)}
              aria-expanded={deptOpen}
              className="flex items-center gap-2 bg-brand-600 px-5 py-3 text-sm font-semibold uppercase text-white"
            >
              <IconMenu className="h-5 w-5" /> Departamentos
            </button>
            {deptOpen && (
              <ul className="absolute left-0 top-full z-50 grid w-[520px] grid-cols-2 gap-x-4 rounded-b-xl bg-white p-4 shadow-xl">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/categoria/${c.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`py-3 text-sm font-semibold uppercase ${pathname === n.href ? "text-brand-600" : "text-ink hover:text-brand-600"}`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-1 bg-gradient-to-r from-yellow-300 via-pink-500 via-50% to-green-400" />

      {/* Menu mobile */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-1">
                <IconClose />
              </button>
            </div>
            <ul className="border-b py-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block px-4 py-3 font-medium">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/rastreio" className="block px-4 py-3 font-medium">
                  Rastrear pedido
                </Link>
              </li>
            </ul>
            <p className="px-4 pt-4 text-xs font-semibold uppercase text-muted">Departamentos</p>
            <ul className="py-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categoria/${c.slug}`} className="block px-4 py-2.5 text-sm">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
