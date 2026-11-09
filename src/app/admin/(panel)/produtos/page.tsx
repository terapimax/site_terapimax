import Link from "next/link";
import { Card, PageHead, Saved } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string }> }) {
  const { q, ok } = await searchParams;
  const { sb } = await requireAdmin();
  let query = sb.from("products").select("id,slug,name,price_cents,images,active,in_stock,stock").order("name");
  if (q) query = query.ilike("name", `%${q.replace(/[%_,()]/g, "")}%`);
  const { data } = await query;
  const list = (data as Product[]) ?? [];
  return (
    <>
      <PageHead title="Produtos" action={{ href: "/admin/produtos/novo", label: "+ Novo produto" }} />
      <Saved show={ok === "1"} />
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar produto" className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </form>
      <Card className="p-0 md:p-0">
        <ul className="divide-y">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0] ?? "/logo.png"} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-gray-50 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                  <span className="flex gap-2 text-xs text-muted">
                    {!p.active && <span className="text-rose-600">Oculto</span>}
                    {!p.in_stock && <span className="text-amber-700">Esgotado</span>}
                    {p.stock != null && <span>Estoque: {p.stock}</span>}
                  </span>
                </span>
                <span className="text-sm font-semibold">{money(p.price_cents)}</span>
              </Link>
            </li>
          ))}
          {list.length === 0 && <li className="p-6 text-center text-sm text-muted">Nenhum produto.</li>}
        </ul>
      </Card>
    </>
  );
}
