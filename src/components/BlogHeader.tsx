import Image from "next/image";
import Link from "next/link";
import { MAIN_SITE } from "@/lib/host";

/** Cabeçalho do subdomínio blog.terapimax.com.br: leva o leitor de volta para a loja. */
export default function BlogHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="Blog Terapimax">
          <Image src="/logo-horizontal.png" alt="Terapimax" width={486} height={108} priority className="h-9 w-auto md:h-11" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/" className="hidden text-ink hover:text-brand-600 sm:inline">Blog</Link>
          <a href={`${MAIN_SITE}/categoria/massageadores`} className="hidden text-ink hover:text-brand-600 sm:inline">Massageadores</a>
          <a href={`${MAIN_SITE}/categoria/suplementos`} className="hidden text-ink hover:text-brand-600 sm:inline">Suplementos</a>
          <a href={MAIN_SITE} className="rounded-full bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Ir para a loja</a>
        </nav>
      </div>
      <div className="h-1 bg-gradient-to-r from-yellow-300 via-pink-500 via-50% to-green-400" />
    </header>
  );
}
