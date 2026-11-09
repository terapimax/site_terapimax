import Link from "next/link";
import { Card, PageHead } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { OrdersTable } from "@/components/admin/orders";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";

export default async function Dashboard() {
  const { sb } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: recent }, { data: month }, { count: products }] = await Promise.all([
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    sb.from("orders").select("status,total_cents").gte("created_at", since),
    sb.from("products").select("id", { count: "exact", head: true }).eq("active", true),
  ]);
  const paidStatuses = ["paid", "preparing", "shipped", "delivered"];
  const paid = (month ?? []).filter((o) => paidStatuses.includes(o.status));
  const toShip = (month ?? []).filter((o) => o.status === "paid" || o.status === "preparing").length;
  const stats = [
    { label: "Vendas (30 dias)", value: money(paid.reduce((n, o) => n + o.total_cents, 0)) },
    { label: "Pedidos pagos (30 dias)", value: String(paid.length) },
    { label: "Para enviar", value: String(toShip) },
    { label: "Produtos ativos", value: String(products ?? 0) },
  ];
  return (
    <>
      <PageHead title="Painel" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-semibold md:text-2xl">{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-brand-700">Ver todos</Link>
        </div>
        <OrdersTable orders={(recent as Order[]) ?? []} />
      </Card>
    </>
  );
}
