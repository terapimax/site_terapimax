import Link from "next/link";
import { Suspense } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductGrid } from "./ProductCard";
import SortSelect from "./SortSelect";

export default function Listing({
  title,
  description,
  products,
  categories,
  active,
}: {
  title: string;
  description?: string;
  products: Product[];
  categories: Category[];
  active?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <nav className="mb-3 text-xs text-muted" aria-label="Trilha">
        <Link href="/" className="hover:underline">Início</Link> / <span>{title}</span>
      </nav>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <p className="mt-1 text-sm text-muted">{products.length} produto(s)</p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        <aside className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mb-0 lg:block lg:space-y-1 lg:px-0">
          <p className="hidden pb-2 text-sm font-semibold lg:block">Departamentos</p>
          <Link
            href="/loja"
            className={`shrink-0 rounded-full px-4 py-2 text-sm lg:block lg:rounded-lg lg:px-3 ${!active ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200 lg:ring-0 hover:bg-brand-50"}`}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm lg:block lg:rounded-lg lg:px-3 ${active === c.slug ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200 lg:ring-0 hover:bg-brand-50"}`}
            >
              {c.name}
            </Link>
          ))}
        </aside>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
