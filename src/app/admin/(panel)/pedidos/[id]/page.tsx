import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Field, inputCls, Saved, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { money, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order } from "@/lib/types";
import { updateOrder } from "../../../actions";
import { StatusBadge } from "@/components/admin/orders";

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { id } = await params;
  const { ok } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const a = o.address;
  const phone = o.customer.phone.replace(/\D/g, "");
  return (
    <>
      <Link href="/admin/pedidos" className="text-sm text-brand-700">← Pedidos</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Pedido #{o.number}</h1>
        <StatusBadge status={o.status} />
        <span className="text-sm text-muted">{new Date(o.created_at).toLocaleString("pt-BR")}</span>
      </div>
      <Saved show={ok === "1"} />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">Itens</h2>
            <ul className="divide-y text-sm">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3 py-2">
                  <span>
                    {i.quantity}× <Link className="underline" href={`/produto/${i.slug}`} target="_blank">{i.name}</Link>
                    {Object.entries(i.options).map(([k, v]) => <span key={k} className="block text-xs text-muted">{k}: {v}</span>)}
                  </span>
                  <span>{money(i.price_cents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal_cents)}</dd></div>
              <div className="flex justify-between"><dt>Frete</dt><dd>{money(o.shipping_cents)}</dd></div>
              <div className="flex justify-between"><dt>Desconto</dt><dd>−{money(o.discount_cents)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{money(o.total_cents)}</dd></div>
              <div className="flex justify-between text-muted"><dt>Pagamento</dt><dd>{o.payment_method === "pix" ? "Pix" : "Cartão"} {o.payment_id && `· ${o.payment_id}`}</dd></div>
            </dl>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="mb-2 font-semibold">Cliente</h2>
              <p className="text-sm">{o.customer.name}</p>
              <p className="text-sm">CPF {o.customer.cpf}</p>
              <p className="text-sm"><a className="text-brand-700 underline" href={`mailto:${o.customer.email}`}>{o.customer.email}</a></p>
              <p className="text-sm"><a className="text-brand-700 underline" href={`https://wa.me/55${phone}`} target="_blank" rel="noopener noreferrer">{o.customer.phone} (WhatsApp)</a></p>
            </Card>
            <Card>
              <h2 className="mb-2 font-semibold">Entrega</h2>
              <p className="select-all text-sm leading-relaxed">
                {a.street}, {a.number}{a.complement && ` – ${a.complement}`}<br />
                {a.district} – {a.city}/{a.state}<br />
                CEP {a.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
              </p>
            </Card>
          </div>
        </div>
        <Card className="h-fit">
          <form action={updateOrder} className="space-y-4">
            <input type="hidden" name="id" value={o.id} />
            <Field label="Status">
              <select name="status" defaultValue={o.status} className={inputCls}>
                {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Código de rastreio" hint="O cliente vê em “Rastrear pedido”.">
              <input name="tracking_code" defaultValue={o.tracking_code ?? ""} className={inputCls} />
            </Field>
            <Field label="Observações internas">
              <textarea name="notes" rows={3} defaultValue={o.notes ?? ""} className={inputCls} />
            </Field>
            <SubmitButton>Atualizar pedido</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
