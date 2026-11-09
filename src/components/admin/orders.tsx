import Link from "next/link";
import { money, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  const color: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    preparing: "bg-sky-100 text-sky-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-gray-200 text-gray-800",
    cancelled: "bg-rose-100 text-rose-800",
    refunded: "bg-rose-100 text-rose-800",
  };
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${color[status] ?? ""}`}>{ORDER_STATUS_LABEL[status] ?? status}</span>;
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return <p className="py-6 text-center text-sm text-muted">Nenhum pedido ainda.</p>;
  return (
    <ul className="divide-y">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/admin/pedidos/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:bg-gray-50">
            <span className="w-16 font-semibold">#{o.number}</span>
            <span className="min-w-0 flex-1 truncate">{o.customer.name}</span>
            <StatusBadge status={o.status} />
            <span className="w-24 text-right font-medium">{money(o.total_cents)}</span>
            <span className="w-full text-xs text-muted sm:w-28 sm:text-right">{new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
