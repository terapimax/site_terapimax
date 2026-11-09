import { money, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order } from "@/lib/types";

const STEPS = ["pending", "paid", "preparing", "shipped", "delivered"];

export default function OrderSummary({ order }: { order: Order }) {
  const step = STEPS.indexOf(order.status);
  return (
    <div className="space-y-5">
      {step >= 0 && (
        <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
          {STEPS.map((s, i) => (
            <li key={s}>
              <span className={`mx-auto mb-1 block h-2 rounded-full ${i <= step ? "bg-brand-500" : "bg-gray-200"}`} />
              <span className={i <= step ? "font-semibold" : "text-muted"}>{ORDER_STATUS_LABEL[s]}</span>
            </li>
          ))}
        </ol>
      )}
      {order.tracking_code && (
        <p className="rounded-xl bg-brand-50 p-4 text-sm">
          Código de rastreio: <strong className="select-all">{order.tracking_code}</strong>{" "}
          <a className="text-brand-700 underline" href={`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(order.tracking_code)}`} target="_blank" rel="noopener noreferrer">
            Rastrear nos Correios
          </a>
        </p>
      )}
      <ul className="divide-y rounded-2xl bg-white ring-1 ring-gray-100">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3 p-3 text-sm">
            <span>
              {i.quantity}× {i.name}
              {Object.values(i.options).length > 0 && <span className="block text-xs text-muted">{Object.values(i.options).join(" / ")}</span>}
            </span>
            <span className="font-medium">{money(i.price_cents * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal_cents)}</dd></div>
        <div className="flex justify-between"><dt>Frete</dt><dd>{order.shipping_cents ? money(order.shipping_cents) : "Grátis"}</dd></div>
        {order.discount_cents > 0 && <div className="flex justify-between"><dt>Desconto</dt><dd>−{money(order.discount_cents)}</dd></div>}
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{money(order.total_cents)}</dd></div>
      </dl>
      <p className="text-sm text-muted">
        Entrega em: {order.address.street}, {order.address.number}
        {order.address.complement && ` – ${order.address.complement}`}, {order.address.district}, {order.address.city}/{order.address.state}
      </p>
    </div>
  );
}
