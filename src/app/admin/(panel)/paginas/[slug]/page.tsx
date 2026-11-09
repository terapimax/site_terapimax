import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import RichEditor from "@/components/admin/RichEditor";
import { Card, Check, Field, inputCls, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Page } from "@/lib/types";
import { deletePage, savePage } from "../../../actions";

export default async function PageEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb } = await requireAdmin();
  const isNew = slug === "novo";
  const { data } = isNew ? { data: { slug: "", title: "", content: "", published: true } } : await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const p = data as Page;
  return (
    <>
      <Link href="/admin/paginas" className="text-sm text-brand-700">← Páginas</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isNew ? "Nova página" : p.title}</h1>
        {!isNew && <ConfirmDelete action={deletePage} fields={{ slug: p.slug }} />}
      </div>
      <form action={savePage}>
        <Card className="space-y-4">
          {!isNew && <input type="hidden" name="original_slug" value={p.slug} />}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Título"><input name="title" required defaultValue={p.title} className={inputCls} /></Field>
            <Field label="Endereço" hint="A página fica em terapimax.com.br/endereço"><input name="slug" defaultValue={p.slug} className={inputCls} /></Field>
          </div>
          <RichEditor name="content" defaultValue={p.content} minHeight={420} />
          <div className="flex items-center gap-4">
            <Check name="published" label="Publicada" defaultChecked={p.published} />
            <SubmitButton>Salvar página</SubmitButton>
          </div>
        </Card>
      </form>
    </>
  );
}
