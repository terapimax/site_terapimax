import "server-only";
import { hasSupabase } from "./supabase/env";
import { supabaseService } from "./supabase/server";
import type { Order } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderById(id: string): Promise<Order | null> {
  if (!hasSupabase || !UUID.test(id)) return null;
  const { data } = await supabaseService().from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order) ?? null;
}

export async function findOrder(number: number, email: string): Promise<Order | null> {
  if (!hasSupabase || !Number.isFinite(number)) return null;
  const { data } = await supabaseService()
    .from("orders")
    .select("*")
    .eq("number", number)
    .eq("customer->>email", email.trim().toLowerCase())
    .maybeSingle();
  return (data as Order) ?? null;
}
