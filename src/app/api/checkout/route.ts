import { NextResponse } from "next/server";
import { createPreference, hasMercadoPago } from "@/lib/mercadopago";
import { getProductsBySlugs, getSettings } from "@/lib/store";
import { hasSupabase } from "@/lib/supabase/env";
import { supabaseService } from "@/lib/supabase/server";
import { computeTotals } from "@/lib/totals";
import type { OrderItem } from "@/lib/types";

type Body = {
  method: "pix" | "card";
  customer: { name: string; email: string; phone: string; cpf: string };
  address: { cep: string; street: string; number: string; complement: string; district: string; city: string; state: string };
  items: { slug: string; quantity: number; options: Record<string, string> }[];
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export async function POST(req: Request) {
  if (!hasSupabase) {
    return NextResponse.json({ error: "A loja está em modo de demonstração: o banco de dados ainda não foi conectado." }, { status: 503 });
  }
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const method = body.method === "card" ? "card" : "pix";
  const customer = {
    name: str(body.customer?.name),
    email: str(body.customer?.email).toLowerCase(),
    phone: str(body.customer?.phone, 30),
    cpf: str(body.customer?.cpf, 20),
  };
  const address = {
    cep: str(body.address?.cep, 10).replace(/\D/g, ""),
    street: str(body.address?.street),
    number: str(body.address?.number, 20),
    complement: str(body.address?.complement),
    district: str(body.address?.district),
    city: str(body.address?.city),
    state: str(body.address?.state, 2).toUpperCase(),
  };
  if (!customer.name || !/^\S+@\S+\.\S+$/.test(customer.email) || customer.phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Confira nome, e-mail e telefone." }, { status: 400 });
  }
  if (!validCpf(customer.cpf)) return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
  if (address.cep.length !== 8 || !address.street || !address.number || !address.city || address.state.length !== 2) {
    return NextResponse.json({ error: "Confira o endereço de entrega." }, { status: 400 });
  }

  const wanted = (Array.isArray(body.items) ? body.items : [])
    .slice(0, 50)
    .map((i) => ({ slug: str(i.slug), quantity: Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 1))), options: i.options ?? {} }));
  if (wanted.length === 0) return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });

  // Preços sempre vêm do banco, nunca do navegador.
  const products = await getProductsBySlugs([...new Set(wanted.map((w) => w.slug))]);
  const items: OrderItem[] = [];
  for (const w of wanted) {
    const p = products.find((x) => x.slug === w.slug);
    if (!p || !p.in_stock) {
      return NextResponse.json({ error: `O produto "${w.slug}" não está mais disponível.` }, { status: 409 });
    }
    const options: Record<string, string> = {};
    for (const o of p.options) {
      const v = typeof w.options[o.name] === "string" ? w.options[o.name] : "";
      if (!o.values.includes(v)) return NextResponse.json({ error: `Escolha ${o.name} para ${p.name}.` }, { status: 400 });
      options[o.name] = v;
    }
    items.push({ slug: p.slug, name: p.name, image: p.images[0] ?? null, price_cents: p.price_cents, quantity: w.quantity, options });
  }

  const settings = await getSettings();
  const subtotal = items.reduce((n, i) => n + i.price_cents * i.quantity, 0);
  const t = computeTotals(settings, subtotal, method);

  const db = supabaseService();
  const { data: order, error } = await db
    .from("orders")
    .insert({
      customer,
      address,
      items,
      subtotal_cents: t.subtotal,
      shipping_cents: t.shipping,
      discount_cents: t.discount,
      total_cents: t.total,
      payment_method: method,
    })
    .select("id, number")
    .single();
  if (error || !order) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível registrar o pedido. Tente novamente." }, { status: 500 });
  }

  if (!hasMercadoPago) return NextResponse.json({ redirect: `/pedido/${order.id}` });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  try {
    const pref = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      totalCents: t.total,
      method,
      payer: { name: customer.name, email: customer.email },
      siteUrl,
    });
    await db.from("orders").update({ payment_id: `pref:${pref.id}` }).eq("id", order.id);
    return NextResponse.json({ redirect: pref.init_point });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao iniciar o pagamento. Tente novamente em instantes." }, { status: 502 });
  }
}
