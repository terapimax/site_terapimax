"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal, setQuantity, remove, ready } = useCart();
  if (!ready) return <div className="min-h-[50vh]" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted">Que tal dar uma olhada nos nossos produtos?</p>
        <Link href="/loja" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <h1 className="mb-5 text-2xl font-semibold">Carrinho</h1>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100">
              <Link href={`/produto/${l.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                {l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-contain" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/produto/${l.slug}`} className="line-clamp-2 text-sm font-medium">{l.name}</Link>
                {Object.entries(l.options).map(([k, v]) => (
                  <span key={k} className="text-xs text-muted">{k}: {v}</span>
                ))}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button aria-label="Diminuir" className="px-3 py-1" onClick={() => setQuantity(l.key, l.quantity - 1)}>−</button>
                    <span className="w-6 text-center text-sm">{l.quantity}</span>
                    <button aria-label="Aumentar" className="px-3 py-1" onClick={() => setQuantity(l.key, l.quantity + 1)}>+</button>
                  </div>
                  <span className="font-semibold">{money(l.price_cents * l.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(l.key)} className="self-start text-xs text-muted hover:text-rose-600" aria-label={`Remover ${l.name}`}>
                Remover
              </button>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-gray-100 md:sticky md:top-40">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <p className="mt-1 text-xs text-muted">Frete e descontos calculados na próxima etapa.</p>
          <Link href="/checkout" className="mt-4 block rounded-xl bg-brand-600 py-3 text-center font-semibold text-white hover:bg-brand-700">
            Finalizar compra
          </Link>
          <Link href="/loja" className="mt-3 block text-center text-sm text-brand-700 hover:underline">Continuar comprando</Link>
        </aside>
      </div>
    </div>
  );
}
