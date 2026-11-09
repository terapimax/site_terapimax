import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderSummary from "@/components/OrderSummary";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import { getOrderById } from "@/lib/orders";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seu pedido", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, settings] = await Promise.all([getOrderById((await params).id), getSettings()]);
  if (!order) notFound();
  const pending = order.status === "pending";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-6 rounded-2xl bg-white p-6 text-center ring-1 ring-gray-100">
        <p className="text-sm text-muted">Pedido #{order.number}</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {pending ? "Recebemos seu pedido!" : `Status: ${ORDER_STATUS_LABEL[order.status]}`}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {pending
            ? "Assim que o Mercado Pago confirmar o pagamento, seu pedido entra em separação. Esta página atualiza ao recarregar."
            : `Enviamos as atualizações para ${order.customer.email}.`}
        </p>
      </div>
      <OrderSummary order={order} />
      <p className="mt-8 text-center text-sm">
        Dúvidas? <a className="text-brand-700 underline" href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Olá! Sobre o pedido #${order.number}`)}`}>Fale com a gente no WhatsApp</a>{" "}
        ou <Link href="/loja" className="text-brand-700 underline">continue comprando</Link>.
      </p>
    </div>
  );
}
