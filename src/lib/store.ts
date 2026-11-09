import "server-only";
import seed from "../../data/seed.json";
import { hasSupabase } from "./supabase/env";
import { supabasePublic } from "./supabase/server";
import type { Banner, Category, Page, Post, Product, Settings } from "./types";

/**
 * Leitura da vitrine. Com o Supabase configurado, lê do banco; sem ele
 * (desenvolvimento ou pré-visualização), usa data/seed.json importado do WooCommerce.
 */

const SEED = seed as unknown as {
  settings: Settings;
  banners: Banner[];
  categories: Category[];
  products: Product[];
  pages: Page[];
  posts: Post[];
};

export async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return SEED.settings;
  const { data } = await supabasePublic().from("settings").select("data").eq("id", 1).maybeSingle();
  return { ...SEED.settings, ...((data?.data as Partial<Settings>) ?? {}) };
}

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return [...SEED.categories].sort((a, b) => a.sort_order - b.sort_order);
  const { data, error } = await supabasePublic().from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data as Category[];
}

/** Só as categorias que têm algum produto ativo (para menus e vitrine). */
export async function getActiveCategories(): Promise<Category[]> {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const used = new Set(products.flatMap((p) => p.categories));
  return cats.filter((c) => used.has(c.slug));
}

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

type ProductQuery = {
  category?: string;
  search?: string;
  flag?: "is_bestseller" | "is_new" | "is_featured";
  sort?: "relevance" | "price_asc" | "price_desc" | "name";
  limit?: number;
};

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function getProducts(q: ProductQuery = {}): Promise<Product[]> {
  let list: Product[];
  if (!hasSupabase) {
    list = SEED.products.filter((p) => p.active);
    if (q.category) list = list.filter((p) => p.categories.includes(q.category!));
    if (q.flag) list = list.filter((p) => p[q.flag!]);
    if (q.search) {
      const terms = normalize(q.search).split(/\s+/).filter(Boolean);
      list = list.filter((p) => terms.every((t) => normalize(p.name).includes(t)));
    }
  } else {
    let query = supabasePublic().from("products").select("*").eq("active", true);
    if (q.category) query = query.contains("categories", [q.category]);
    if (q.flag) query = query.eq(q.flag, true);
    if (q.search) {
      for (const t of q.search.split(/\s+/).filter(Boolean)) {
        query = query.ilike("name", `%${t.replace(/[%_,()]/g, "")}%`);
      }
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    list = data as Product[];
  }
  const sorted = [...list];
  if (q.sort === "price_asc") sorted.sort((a, b) => a.price_cents - b.price_cents);
  if (q.sort === "price_desc") sorted.sort((a, b) => b.price_cents - a.price_cents);
  if (q.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  // Produtos em estoque primeiro.
  sorted.sort((a, b) => Number(b.in_stock) - Number(a.in_stock));
  return q.limit ? sorted.slice(0, q.limit) : sorted;
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return SEED.products.find((p) => p.slug === slug && p.active) ?? null;
  const { data } = await supabasePublic()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  if (!hasSupabase) return SEED.products.filter((p) => slugs.includes(p.slug) && p.active);
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*")
    .in("slug", slugs)
    .eq("active", true);
  if (error) throw error;
  return data as Product[];
}

export async function getBanners(): Promise<Banner[]> {
  if (!hasSupabase) return SEED.banners.filter((b) => b.active);
  const { data } = await supabasePublic()
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return (data as Banner[]) ?? [];
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!hasSupabase) return SEED.pages.find((p) => p.slug === slug && p.published) ?? null;
  const { data } = await supabasePublic()
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Page) ?? null;
}

export async function getPages(): Promise<Page[]> {
  if (!hasSupabase) return SEED.pages.filter((p) => p.published);
  const { data } = await supabasePublic().from("pages").select("slug,title,published").eq("published", true);
  return (data as Page[]) ?? [];
}

export async function getPosts(): Promise<Post[]> {
  if (!hasSupabase) return SEED.posts.filter((p) => p.published);
  const { data } = await supabasePublic()
    .from("posts")
    .select("slug,title,excerpt,cover_url,published,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data as Post[]) ?? [];
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!hasSupabase) return SEED.posts.find((p) => p.slug === slug && p.published) ?? null;
  const { data } = await supabasePublic()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Post) ?? null;
}
