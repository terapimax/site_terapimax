import Link from "next/link";
import { Card, PageHead, Saved } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Page } from "@/lib/types";

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("pages").select("slug,title,published").order("title");
  return (
    <>
      <PageHead title="Páginas" action={{ href: "/admin/paginas/novo", label: "+ Nova página" }} />
      <Saved show={ok === "1"} />
      <Card className="p-0 md:p-0">
        <ul className="divide-y">
          {((data as Page[]) ?? []).map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/paginas/${p.slug}`} className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-gray-50">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-muted">/{p.slug} {!p.published && "· rascunho"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
