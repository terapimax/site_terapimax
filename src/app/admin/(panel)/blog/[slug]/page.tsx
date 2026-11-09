import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import RichEditor from "@/components/admin/RichEditor";
import { Card, Check, Field, inputCls, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Post } from "@/lib/types";
import { deletePost, savePost } from "../../../actions";

export default async function PostEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb } = await requireAdmin();
  const isNew = slug === "novo";
  const { data } = isNew
    ? { data: { slug: "", title: "", excerpt: "", content: "", cover_url: null, published: false, published_at: new Date().toISOString() } }
    : await sb.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const p = data as Post;
  return (
    <>
      <Link href="/admin/blog" className="text-sm text-brand-700">← Blog</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isNew ? "Novo post" : p.title}</h1>
        {!isNew && <ConfirmDelete action={deletePost} fields={{ slug: p.slug }} />}
      </div>
      <form action={savePost}>
        <Card className="space-y-4">
          {!isNew && <input type="hidden" name="original_slug" value={p.slug} />}
          {p.cover_url && <input type="hidden" name="cover_url" value={p.cover_url} />}
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_200px]">
            <Field label="Título"><input name="title" required defaultValue={p.title} className={inputCls} /></Field>
            <Field label="Endereço (slug)"><input name="slug" defaultValue={p.slug} className={inputCls} /></Field>
            <Field label="Data"><input name="published_at" type="date" defaultValue={p.published_at.slice(0, 10)} className={inputCls} /></Field>
          </div>
          <Field label="Resumo (aparece na lista e no Google)"><textarea name="excerpt" rows={2} defaultValue={p.excerpt} className={inputCls} /></Field>
          <Field label="Imagem de capa">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.cover_url && <img src={p.cover_url} alt="" className="h-16 rounded" />}
              <input type="file" name="new_cover" accept="image/*" className="text-sm" />
            </div>
          </Field>
          <RichEditor name="content" defaultValue={p.content} minHeight={420} />
          <div className="flex items-center gap-4">
            <Check name="published" label="Publicado" defaultChecked={p.published} />
            <SubmitButton>Salvar post</SubmitButton>
          </div>
        </Card>
      </form>
    </>
  );
}
