import Link from "next/link";
import { Card, PageHead, Saved } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Post } from "@/lib/types";

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("posts").select("slug,title,published,published_at").order("published_at", { ascending: false });
  const posts = (data as Post[]) ?? [];
  return (
    <>
      <PageHead title="Blog" action={{ href: "/admin/blog/novo", label: "+ Novo post" }} />
      <Saved show={ok === "1"} />
      <Card className="p-0 md:p-0">
        <ul className="divide-y">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/admin/blog/${p.slug}`} className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-gray-50">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-muted">{p.published ? new Date(p.published_at).toLocaleDateString("pt-BR") : "Rascunho"}</span>
              </Link>
            </li>
          ))}
          {posts.length === 0 && <li className="p-6 text-center text-sm text-muted">Nenhum post ainda. Crie o primeiro!</li>}
        </ul>
      </Card>
    </>
  );
}
