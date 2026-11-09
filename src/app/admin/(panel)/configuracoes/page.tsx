import { Card, Check, Field, inputCls, PageHead, Saved, SubmitButton } from "@/components/admin/ui";
import { centsToInput, requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/store";
import { saveSettings } from "../../actions";

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageHead title="Configurações da loja" />
      <Saved show={ok === "1"} />
      <form action={saveSettings} className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-semibold">Loja</h2>
          <Field label="Nome da loja"><input name="store_name" defaultValue={s.store_name} className={inputCls} /></Field>
          <Field label="Frase (rodapé)"><input name="tagline" defaultValue={s.tagline} className={inputCls} /></Field>
          <Field label="Faixa do topo" hint="Deixe vazio para esconder."><input name="topbar_text" defaultValue={s.topbar_text} className={inputCls} /></Field>
          <Field label="WhatsApp (com DDI e DDD)" hint="Ex.: 5511916109651"><input name="whatsapp" defaultValue={s.whatsapp} className={inputCls} /></Field>
          <Field label="E-mail de atendimento"><input name="email" type="email" defaultValue={s.email} className={inputCls} /></Field>
          <Field label="Instagram (link)"><input name="instagram" defaultValue={s.instagram} className={inputCls} /></Field>
          <Field label="Horário de atendimento"><input name="hours" defaultValue={s.hours} className={inputCls} /></Field>
        </Card>
        <Card className="h-fit space-y-3">
          <h2 className="font-semibold">Frete e pagamento</h2>
          <Field label="Frete fixo (R$)" hint="Cobrado quando o pedido não tem frete grátis. 0 = sempre grátis.">
            <input name="flat_shipping" inputMode="decimal" defaultValue={centsToInput(s.flat_shipping_cents)} className={inputCls} />
          </Field>
          <Field label="Frete grátis acima de (R$)" hint="0 = desligado.">
            <input name="free_shipping_min" inputMode="decimal" defaultValue={centsToInput(s.free_shipping_min_cents)} className={inputCls} />
          </Field>
          <Field label="Desconto no Pix (%)">
            <input name="pix_discount_percent" type="number" min={0} max={50} defaultValue={s.pix_discount_percent} className={inputCls} />
          </Field>
          <Check name="pix_free_shipping" label="Frete grátis para pagamentos no Pix" defaultChecked={s.pix_free_shipping} />
          <div className="pt-2"><SubmitButton>Salvar configurações</SubmitButton></div>
        </Card>
      </form>
    </>
  );
}
