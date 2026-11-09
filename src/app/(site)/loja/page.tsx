import type { Metadata } from "next";
import Listing from "@/components/Listing";
import { getActiveCategories, getProducts } from "@/lib/store";

export const metadata: Metadata = { title: "Loja" };

type SP = Promise<{ q?: string; ordem?: string; colecao?: string }>;
const COLLECTIONS = {
  "mais-vendidos": { flag: "is_bestseller", title: "Mais vendidos" },
  novidades: { flag: "is_new", title: "Novidades" },
} as const;

export default async function Loja({ searchParams }: { searchParams: SP }) {
  const { q, ordem, colecao } = await searchParams;
  const coll = colecao ? COLLECTIONS[colecao as keyof typeof COLLECTIONS] : undefined;
  const [products, categories] = await Promise.all([
    getProducts({
      search: q,
      flag: coll?.flag,
      sort: ordem as "price_asc" | "price_desc" | "name" | undefined,
    }),
    getActiveCategories(),
  ]);
  const title = q ? `Resultados para “${q}”` : coll?.title ?? "Todos os produtos";
  return <Listing title={title} products={products} categories={categories} />;
}
