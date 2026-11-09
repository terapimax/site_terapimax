import "server-only";
import crypto from "node:crypto";

const API = "https://api.mercadopago.com";

export const hasMercadoPago = Boolean(process.env.MP_ACCESS_TOKEN);

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function createPreference(args: {
  orderId: string;
  orderNumber: number;
  totalCents: number;
  method: "pix" | "card";
  payer: { name: string; email: string };
  siteUrl: string;
}) {
  const back = `${args.siteUrl}/pedido/${args.orderId}`;
  const excluded =
    args.method === "pix"
      ? [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }]
      : [{ id: "bank_transfer" }, { id: "ticket" }, { id: "atm" }];
  const body = {
    items: [
      {
        id: args.orderId,
        title: `Pedido Terapimax #${args.orderNumber}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number((args.totalCents / 100).toFixed(2)),
      },
    ],
    payer: { name: args.payer.name, email: args.payer.email },
    external_reference: args.orderId,
    payment_methods: { excluded_payment_types: excluded, installments: 12 },
    back_urls: { success: back, pending: back, failure: back },
    auto_return: "approved",
    notification_url: `${args.siteUrl}/api/mercadopago/webhook`,
    statement_descriptor: "TERAPIMAX",
  };
  return mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type MpPayment = { id: number; status: string; external_reference: string | null; payment_method_id: string };

export function getPayment(id: string) {
  return mp<MpPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

/** Confere a assinatura x-signature do webhook (quando MP_WEBHOOK_SECRET está configurado). */
export function validWebhookSignature(headers: Headers, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const sig = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(sig.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return expected.length === parts.v1.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}

export function mapStatus(s: string): "paid" | "cancelled" | "refunded" | null {
  if (s === "approved") return "paid";
  // "rejected" fica pendente: o cliente pode tentar pagar de novo.
  if (s === "cancelled") return "cancelled";
  if (s === "refunded" || s === "charged_back") return "refunded";
  return null;
}
