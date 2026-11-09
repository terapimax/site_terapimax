"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { IconCard, IconPix } from "@/components/icons";
import { money } from "@/lib/format";
import { computeTotals } from "@/lib/totals";
import type { Settings } from "@/lib/types";

const input =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function maskCpf(v: string) {
  return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
}
function maskCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export default function CheckoutForm({ settings }: { settings: Settings }) {
  const { lines, subtotal, ready, clear } = useCart();
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [f, setF] = useState({
    name: "", email: "", phone: "", cpf: "",
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
  });
  const [cepStatus, setCepStatus] = useState<"" | "loading" | "error">("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function lookupCep(raw: string) {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepStatus("loading");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) throw new Error();
      setF((s) => ({ ...s, street: d.logradouro || s.street, district: d.bairro || s.district, city: d.localidade, state: d.uf }));
      setCepStatus("");
    } catch {
      setCepStatus("error");
    }
  }

  if (!ready) return <div className="min-h-[50vh]" />;
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Seu carrinho está vazio</h1>
        <Link href="/loja" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">Ver produtos</Link>
      </div>
    );
  }

  const t = computeTotals(settings, subtotal, method);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          customer: { name: f.name, email: f.email, phone: f.phone, cpf: f.cpf },
          address: { cep: f.cep, street: f.street, number: f.number, complement: f.complement, district: f.district, city: f.city, state: f.state },
          items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity, options: l.options })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao finalizar.");
      clear();
      window.location.href = data.redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_360px] md:py-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Finalizar compra</h1>

        <fieldset className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-100">
          <legend className="mb-2 font-semibold">1. Seus dados</legend>
          <input className={input} required placeholder="Nome completo" autoComplete="name" value={f.name} onChange={set("name")} />
          <input className={input} required type="email" placeholder="E-mail" autoComplete="email" value={f.email} onChange={set("email")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={input} required inputMode="tel" placeholder="Celular (WhatsApp)" autoComplete="tel" value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: maskPhone(e.target.value) }))} />
            <input className={input} required inputMode="numeric" placeholder="CPF" value={f.cpf} onChange={(e) => setF((s) => ({ ...s, cpf: maskCpf(e.target.value) }))} />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-100">
          <legend className="mb-2 font-semibold">2. Entrega</legend>
          <div className="flex items-center gap-3">
            <input
              className={`${input} max-w-[180px]`}
              required
              inputMode="numeric"
              placeholder="CEP"
              autoComplete="postal-code"
              value={f.cep}
              onChange={(e) => {
                const v = maskCep(e.target.value);
                setF((s) => ({ ...s, cep: v }));
                lookupCep(v);
              }}
            />
            {cepStatus === "loading" && <span className="text-sm text-muted">Buscando endereço…</span>}
            {cepStatus === "error" && <span className="text-sm text-rose-600">CEP não encontrado, preencha abaixo.</span>}
          </div>
          <input className={input} required placeholder="Rua / Avenida" autoComplete="address-line1" value={f.street} onChange={set("street")} />
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <input className={input} required placeholder="Número" value={f.number} onChange={set("number")} />
            <input className={input} placeholder="Complemento" autoComplete="address-line2" value={f.complement} onChange={set("complement")} />
          </div>
          <input className={input} required placeholder="Bairro" value={f.district} onChange={set("district")} />
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <input className={input} required placeholder="Cidade" autoComplete="address-level2" value={f.city} onChange={set("city")} />
            <input className={input} required maxLength={2} placeholder="UF" autoComplete="address-level1" value={f.state} onChange={(e) => setF((s) => ({ ...s, state: e.target.value.toUpperCase() }))} />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-gray-100">
          <legend className="mb-3 font-semibold">3. Pagamento</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { id: "pix", icon: IconPix, title: "Pix", text: [settings.pix_discount_percent > 0 && `${settings.pix_discount_percent}% de desconto`, settings.pix_free_shipping && "frete grátis", "aprovação na hora"].filter(Boolean).join(", ") },
              { id: "card", icon: IconCard, title: "Cartão de crédito", text: "em até 12x pelo Mercado Pago" },
            ] as const).map(({ id, icon: Icon, title, text }) => (
              <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${method === id ? "border-brand-600 bg-brand-50" : "border-gray-200"}`}>
                <input type="radio" name="method" className="sr-only" checked={method === id} onChange={() => setMethod(id)} />
                <Icon className="h-7 w-7 text-brand-700" />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-xs text-muted">{text}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Você será levado ao ambiente seguro do Mercado Pago para concluir o pagamento.</p>
        </fieldset>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 ring-1 ring-gray-100 md:sticky md:top-40">
        <h2 className="font-semibold">Resumo do pedido</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 text-sm">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                {l.image && <Image src={l.image} alt="" fill sizes="48px" className="object-contain" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2">{l.quantity}× {l.name}</span>
                {Object.values(l.options).length > 0 && <span className="text-xs text-muted">{Object.values(l.options).join(" / ")}</span>}
              </span>
              <span className="font-medium">{money(l.price_cents * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(t.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Frete</dt><dd>{t.shipping === 0 ? <span className="font-medium text-emerald-700">Grátis</span> : money(t.shipping)}</dd></div>
          {t.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Desconto Pix</dt><dd>−{money(t.discount)}</dd></div>}
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(t.total)}</dd></div>
        </dl>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
        <button disabled={sending} className="w-full rounded-xl bg-brand-600 py-4 text-lg font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {sending ? "Processando…" : method === "pix" ? "Pagar com Pix" : "Pagar com cartão"}
        </button>
      </aside>
    </form>
  );
}
