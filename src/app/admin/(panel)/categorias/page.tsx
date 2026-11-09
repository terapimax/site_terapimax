import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { Card, Field, inputCls, PageHead, Saved, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import { deleteCategory, saveCategory } from "../../actions";

function CategoryForm({ c }: { c?: Category }) {
  return (
    <form action={saveCategory} className="grid gap-3 md:grid-cols-[1fr_1fr_90px] md:items-end">
      {c && <input type="hidden" name="original_slug" value={c.slug} />}
      {c?.image_url && <input type="hidden" name="image_url" value={c.image_url} />}
      <Field label="Nome"><input name="name" required defaultValue={c?.name} className={inputCls} /></Field>
      <Field label="Endereço (slug)"><input name="slug" defaultValue={c?.slug} placeholder="gerado do nome" className={inputCls} /></Field>
      <Field label="Ordem"><input name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} className={inputCls} /></Field>
      <Field label="Descrição"><input name="description" defaultValue={c?.description} className={inputCls} /></Field>
      <Field label="Imagem (círculo da home)"><input type="file" name="new_image" accept="image/*" className="text-sm" /></Field>
      <div><SubmitButton>{c ? "Salvar" : "Adicionar"}</SubmitButton></div>
    </form>
  );
}

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return (
    <>
      <PageHead title="Categorias" />
      <Saved show={ok === "1"} />
      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Nova categoria</h2>
        <CategoryForm />
      </Card>
      <div className="space-y-3">
        {((data as Category[]) ?? []).map((c) => (
          <Card key={c.slug}>
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image_url && <img src={c.image_url} alt="" className="h-10 w-10 rounded-full object-cover" />}
              <h3 className="flex-1 font-semibold">{c.name}</h3>
              <ConfirmDelete action={deleteCategory} fields={{ slug: c.slug }} message="Excluir esta categoria? Os produtos continuam existindo." />
            </div>
            <CategoryForm c={c} />
          </Card>
        ))}
      </div>
    </>
  );
}
