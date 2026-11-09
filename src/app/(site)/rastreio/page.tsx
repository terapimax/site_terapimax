import type { Metadata } from "next";
import OrderSummary from "@/components/OrderSummary";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import { findOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rastrear pedido" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ pedido?: string; email?: string }> }) {
  const { pedido, email } = await searchParams;
  const searched = Boolean(pedido && email);
  const order = searched ? await findOrder(Number(String(pedido).replace(/\D/g, "")), String(email)) : null;
  const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-brand-500";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-semibold">Onde está meu pedido?</h1>
      <p className="mt-1 text-sm text-muted">Informe o número do pedido e o e-mail usado na compra.</p>
      <form className="mt-5 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
        <input name="pedido" required inputMode="numeric" placeholder="Nº do pedido" defaultValue={pedido} className={input} />
        <input name="email" required type="email" placeholder="E-mail" defaultValue={email} className={input} />
        <button className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">Buscar</button>
      </form>
      {searched && !order && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm">Não encontramos esse pedido. Confira o número e o e-mail.</p>}
      {order && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Pedido #{order.number}: {ORDER_STATUS_LABEL[order.status]}</h2>
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  );
}
