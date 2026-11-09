import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { installments, money } from "@/lib/format";
import { IconStar } from "./icons";

export function Stars({ rating, count }: { rating: number; count: number }) {
  if (!count) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-muted" aria-label={`Nota ${rating.toFixed(1)} de 5, ${count} avaliações`}>
      <span className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar key={i} className="h-3.5 w-3.5" filled={rating >= i - 0.25} />
        ))}
      </span>
      ({count})
    </span>
  );
}

export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const off = p.compare_at_cents ? Math.round((1 - p.price_cents / p.compare_at_cents) * 100) : 0;
  const inst = installments(p.price_cents);
  return (
    <Link
      href={`/produto/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-50">
        {p.images[0] && (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition group-hover:scale-105"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {off > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">-{off}%</span>}
          {p.is_new && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">Novo</span>}
        </div>
        {!p.in_stock && (
          <span className="absolute inset-x-0 bottom-0 bg-gray-800/80 py-1 text-center text-xs font-medium text-white">Esgotado</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-tight text-ink">{p.name}</h3>
        <Stars rating={p.rating} count={p.review_count} />
        <div className="mt-auto pt-1">
          {p.compare_at_cents && <span className="block text-xs text-muted line-through">{money(p.compare_at_cents)}</span>}
          <span className="text-lg font-bold text-ink">{money(p.price_cents)}</span>
          {inst.n > 1 && (
            <span className="block text-xs text-muted">
              ou {inst.n}x de {money(inst.value)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return <p className="py-16 text-center text-muted">Nenhum produto encontrado.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <ProductCard key={p.slug} p={p} priority={i < 4} />
      ))}
    </div>
  );
}
