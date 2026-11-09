import { NextResponse } from "next/server";
import { getPayment, mapStatus, validWebhookSignature } from "@/lib/mercadopago";
import { supabaseService } from "@/lib/supabase/server";

// O Mercado Pago avisa aqui quando um pagamento muda. Conferimos direto na API dele
// antes de mudar o pedido, então um aviso falso não marca nada como pago.
export async function POST(req: Request) {
  const url = new URL(req.url);
  let payload: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    payload = await req.json();
  } catch {
    /* alguns avisos vêm só na query string */
  }
  const type = payload.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(payload.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (type !== "payment" || !id) return NextResponse.json({ ok: true });
  if (!validWebhookSignature(req.headers, id)) return NextResponse.json({ error: "assinatura" }, { status: 401 });

  const payment = await getPayment(id);
  const status = mapStatus(payment.status);
  if (!payment.external_reference || !status) return NextResponse.json({ ok: true });

  const db = supabaseService();
  const { data: order } = await db.from("orders").select("status").eq("id", payment.external_reference).maybeSingle();
  if (!order) return NextResponse.json({ ok: true });

  // Não volta um pedido já enviado/entregue para "pago".
  const canChange =
    order.status === "pending" || (order.status === "paid" && status !== "paid") || status === "refunded";
  if (canChange) {
    await db
      .from("orders")
      .update({ status, payment_id: String(payment.id), updated_at: new Date().toISOString() })
      .eq("id", payment.external_reference);
  }
  return NextResponse.json({ ok: true });
}
