import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { Card, Check, Field, inputCls, PageHead, Saved, SubmitButton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Banner } from "@/lib/types";
import { deleteBanner, saveBanner } from "../../actions";

function BannerForm({ b }: { b?: Banner }) {
  return (
    <form action={saveBanner} className="space-y-3">
      {b?.id && <input type="hidden" name="id" value={b.id} />}
      {b?.image_url && <input type="hidden" name="image_url" value={b.image_url} />}
      {b?.mobile_image_url && <input type="hidden" name="mobile_image_url" value={b.mobile_image_url} />}
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_90px]">
        <Field label="Título (texto alternativo)"><input name="title" defaultValue={b?.title} className={inputCls} /></Field>
        <Field label="Link ao clicar" hint="Ex.: /categoria/massageadores"><input name="link" defaultValue={b?.link ?? "/"} className={inputCls} /></Field>
        <Field label="Ordem"><input name="sort_order" type="number" defaultValue={b?.sort_order ?? 0} className={inputCls} /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Imagem computador" hint="Recomendado 1920×500"><input type="file" name="new_image" accept="image/*" required={!b} className="text-sm" /></Field>
        <Field label="Imagem celular (opcional)" hint="Recomendado 800×1000"><input type="file" name="new_mobile_image" accept="image/*" className="text-sm" /></Field>
      </div>
      <div className="flex items-center gap-4">
        <Check name="active" label="Ativo" defaultChecked={b?.active ?? true} />
        <SubmitButton>{b ? "Salvar" : "Adicionar banner"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function BannersAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("banners").select("*").order("sort_order");
  return (
    <>
      <PageHead title="Banners da página inicial" />
      <Saved show={ok === "1"} />
      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Novo banner</h2>
        <BannerForm />
      </Card>
      <div className="space-y-4">
        {((data as Banner[]) ?? []).map((b) => (
          <Card key={b.id}>
            <div className="mb-3 flex flex-wrap items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt="" className="w-full max-w-md rounded-lg" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.mobile_image_url && <img src={b.mobile_image_url} alt="" className="h-32 rounded-lg" />}
              <div className="ml-auto"><ConfirmDelete action={deleteBanner} fields={{ id: b.id! }} /></div>
            </div>
            <BannerForm b={b} />
          </Card>
        ))}
      </div>
    </>
  );
}
