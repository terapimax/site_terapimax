"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [opts, setOpts] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const missing = product.options.filter((o) => !opts[o.name]).map((o) => o.name);

  function addToCart() {
    if (missing.length) {
      setError(`Escolha: ${missing.join(", ")}`);
      return false;
    }
    setError("");
    add(
      { slug: product.slug, name: product.name, image: product.images[0] ?? null, price_cents: product.price_cents, options: opts },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    return true;
  }

  if (!product.in_stock) {
    return <p className="rounded-xl bg-gray-100 p-4 text-center font-medium text-muted">Produto esgotado no momento</p>;
  }

  return (
    <div className="space-y-4">
      {product.options.map((o) => (
        <fieldset key={o.name}>
          <legend className="mb-2 text-sm font-semibold">
            {o.name}: <span className="font-normal text-muted">{opts[o.name] ?? "selecione"}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={opts[o.name] === v}
                onClick={() => setOpts((s) => ({ ...s, [o.name]: v }))}
                className={`rounded-lg border px-4 py-2 text-sm ${opts[o.name] === v ? "border-brand-600 bg-brand-50 font-semibold text-brand-700" : "border-gray-200 bg-white hover:border-brand-500"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-gray-200 bg-white">
          <button type="button" aria-label="Diminuir" className="px-4 py-3 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Aumentar" className="px-4 py-3 text-lg" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="flex-1 rounded-xl border-2 border-brand-600 px-4 py-3 font-semibold text-brand-700 hover:bg-brand-50"
        >
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => addToCart() && router.push("/carrinho")}
        className="w-full rounded-xl bg-brand-600 px-4 py-4 text-lg font-semibold text-white shadow hover:bg-brand-700"
      >
        Comprar agora
      </button>
      {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
    </div>
  );
}
