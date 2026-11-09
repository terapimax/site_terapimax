import "server-only";
import { redirect } from "next/navigation";
import { hasSupabase } from "./supabase/env";
import { supabaseServer } from "./supabase/server";

/** Garante que quem chama é admin; devolve o cliente com a sessão dele. */
export async function requireAdmin() {
  if (!hasSupabase) redirect("/admin");
  const sb = await supabaseServer();
  const { data: user } = await sb.auth.getUser();
  if (!user.user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("is_admin");
  if (!ok) redirect("/admin/login?erro=sem-acesso");
  return { sb, user: user.user };
}

export function parseBRL(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").replace(/[^\d,.-]/g, "").trim();
  if (!s) return null;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Math.round(Number(normalized) * 100);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function centsToInput(c: number | null | undefined) {
  return c == null ? "" : (c / 100).toFixed(2).replace(".", ",");
}
