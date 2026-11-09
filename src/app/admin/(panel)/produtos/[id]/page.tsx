import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import ImagesEditor from "@/components/admin/ImagesEditor";
import RichEditor from "@/components/admin/RichEditor";
import { Card, Check, Field, inputCls, SubmitButton } from "@/components/admin/ui";
import { centsToInput, requireAdmin } from "@/lib/admin";
import type { Category, Product } from "@/lib/types";
import { deleteProduct, saveProduct } from "../../../actions";

const EMPTY: Product = {
  slug: "", name: "", sku: null, short_description: "", description: "", price_cents: 0, compare_at_cents: null,
  images: [], categories: [], options: [], in_stock: true, stock: null, is_bestseller: false, is_new: true,
  is_featured: false, rating: 0, review_count: 0, active: true,
};

export default async function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const isNew = id === "novo";
  const [{ data: prod }, { data: cats }] = await Promise.all([
    isNew ? Promise.resolve({ data: EMPTY }) : sb.from("products").select("*").eq("id", id).maybeSingle(),
    sb.from("categories").select("*").order("sort_order"),
  ]);
  if (!prod) notFound();
  const p = prod as Product;
  const optionsText = p.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join("\n");

  return (
    <>
      <Link href="/admin/produtos" className="text-sm text-brand-700">← Produtos</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isNew ? "Novo produto" : p.name}</h1>
        {!isNew && (
          <div className="flex gap-2">
            <Link href={`/produto/${p.slug}`} target="_blank" className="rounded-lg px-3 py-2 text-sm text-brand-700 hover:bg-brand-50">Ver na loja ↗</Link>
            <ConfirmDelete action={deleteProduct} fields={{ id: p.id! }} />
          </div>
        )}
      </div>
      <form action={saveProduct} className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {!isNew && <input type="hidden" name="id" value={p.id} />}
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="Nome do produto"><input name="name" required defaultValue={p.name} className={inputCls} /></Field>
            <Field label="Endereço (slug)" hint="Deixe em branco para gerar a partir do nome. Mudar o endereço de um produto existente quebra links antigos.">
              <input name="slug" defaultValue={p.slug} className={inputCls} />
            </Field>
            <Field label="Resumo (aparece ao lado do preço)"><RichEditor name="short_description" defaultValue={p.short_description} minHeight={100} /></Field>
            <Field label="Descrição completa"><RichEditor name="description" defaultValue={p.description} minHeight={320} /></Field>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">Imagens</h2>
            <ImagesEditor initial={p.images} />
          </Card>
          <Card>
            <Field label="Variações" hint="Uma por linha, no formato  Nome: opção 1, opção 2. Ex.: Cor: Branco, Verde, Rosa">
              <textarea name="options" rows={3} defaultValue={optionsText} className={inputCls} />
            </Field>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-3">
            <Field label="Preço (R$)"><input name="price" required inputMode="decimal" defaultValue={centsToInput(p.price_cents)} className={inputCls} /></Field>
            <Field label="Preço “de” riscado (R$)" hint="Opcional. Mostra o desconto."><input name="compare_at" inputMode="decimal" defaultValue={centsToInput(p.compare_at_cents)} className={inputCls} /></Field>
            <Field label="SKU / código"><input name="sku" defaultValue={p.sku ?? ""} className={inputCls} /></Field>
            <Field label="Estoque" hint="Opcional, só para controle."><input name="stock" type="number" min={0} defaultValue={p.stock ?? ""} className={inputCls} /></Field>
          </Card>
          <Card className="space-y-2">
            <Check name="active" label="Visível na loja" defaultChecked={p.active} />
            <Check name="in_stock" label="Disponível para compra" defaultChecked={p.in_stock} />
            <Check name="is_featured" label="Destaque na página inicial" defaultChecked={p.is_featured} />
            <Check name="is_bestseller" label="Mais vendido" defaultChecked={p.is_bestseller} />
            <Check name="is_new" label="Novidade" defaultChecked={p.is_new} />
          </Card>
          <Card>
            <p className="mb-2 text-sm font-medium">Categorias</p>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {((cats as Category[]) ?? []).map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="categories" value={c.slug} defaultChecked={p.categories.includes(c.slug)} className="h-4 w-4 accent-brand-600" />
                  {c.name}
                </label>
              ))}
            </div>
          </Card>
          <div className="sticky bottom-4"><SubmitButton>Salvar produto</SubmitButton></div>
        </div>
      </form>
    </>
  );
}
