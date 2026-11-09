import Link from "next/link";
import { Card, PageHead } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrdersTable } from "@/components/admin/orders";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const { sb } = await requireAdmin();
  let query = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && ORDER_STATUS_LABEL[status]) query = query.eq("status", status);
  if (q) {
    const n = Number(q.replace(/\D/g, ""));
    query = n ? query.eq("number", n) : query.ilike("customer->>name", `%${q.replace(/[%_,()]/g, "")}%`);
  }
  const { data } = await query;
  return (
    <>
      <PageHead title="Pedidos" />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <Link href="/admin/pedidos" className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${!status ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200"}`}>Todos</Link>
        {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
          <Link key={k} href={`/admin/pedidos?status=${k}`} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${status === k ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200"}`}>{v}</Link>
        ))}
      </div>
      <form className="mb-4">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Buscar por nº do pedido ou nome do cliente" className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </form>
      <Card><OrdersTable orders={(data as Order[]) ?? []} /></Card>
    </>
  );
}
