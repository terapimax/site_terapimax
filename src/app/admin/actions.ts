"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseBRL, requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import type { SupabaseClient } from "@supabase/supabase-js";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const b = (fd: FormData, k: string) => fd.get(k) === "on";

/** Roda a ação; se der erro, volta para `back` mostrando a mensagem em vez de quebrar a página. */
async function run(back: string, fn: () => Promise<string>) {
  let dest: string;
  try {
    dest = await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro inesperado.";
    dest = `${back}${back.includes("?") ? "&" : "?"}erro=${encodeURIComponent(msg)}`;
  }
  redirect(dest);
}

function refreshSite() {
  revalidatePath("/", "layout");
}

/** Envia as imagens novas do formulário para o Storage e devolve as URLs públicas. */
async function uploadFiles(sb: SupabaseClient, files: FormDataEntryValue[], folder: string) {
  const urls: string[] = [];
  for (const f of files) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (!f.type.startsWith("image/")) throw new Error("Envie apenas imagens.");
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from("media").upload(path, f, { contentType: f.type, upsert: false });
    if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);
    urls.push(sb.storage.from("media").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

function parseOptions(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, values = ""] = line.split(":");
      return { name: name.trim(), values: values.split(",").map((v) => v.trim()).filter(Boolean) };
    })
    .filter((o) => o.name && o.values.length);
}

// ---------- Produtos ----------
export async function saveProduct(fd: FormData) {
  const { sb } = await requireAdmin();
  await run(`/admin/produtos/${s(fd, "id") || "novo"}`, async () => {
    const id = s(fd, "id");
    const name = s(fd, "name");
    const price = parseBRL(fd.get("price"));
    if (!name || price == null) throw new Error("Nome e preço são obrigatórios.");
    const kept = fd.getAll("images").map(String).filter(Boolean);
    const uploaded = await uploadFiles(sb, fd.getAll("new_images"), "produtos");
    const stockRaw = s(fd, "stock");
    const row = {
      name,
      slug: slugify(s(fd, "slug") || name),
      sku: s(fd, "sku") || null,
      price_cents: price,
      compare_at_cents: parseBRL(fd.get("compare_at")),
      stock: stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0),
      in_stock: b(fd, "in_stock"),
      active: b(fd, "active"),
      is_featured: b(fd, "is_featured"),
      is_bestseller: b(fd, "is_bestseller"),
      is_new: b(fd, "is_new"),
      categories: fd.getAll("categories").map(String),
      options: parseOptions(s(fd, "options")),
      images: [...kept, ...uploaded],
      short_description: s(fd, "short_description"),
      description: s(fd, "description"),
      updated_at: new Date().toISOString(),
    };
    const q = id ? sb.from("products").update(row).eq("id", id) : sb.from("products").insert(row);
    const { error } = await q;
    if (error) throw new Error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
    refreshSite();
    return "/admin/produtos?ok=1";
  });
}

export async function deleteProduct(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/produtos", async () => {
    const { error } = await sb.from("products").delete().eq("id", s(fd, "id"));
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/produtos";
  });
}

// ---------- Categorias ----------
export async function saveCategory(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/categorias", async () => {
    const original = s(fd, "original_slug");
    const name = s(fd, "name");
    if (!name) throw new Error("Informe o nome.");
    const [img] = await uploadFiles(sb, fd.getAll("new_image"), "categorias");
    const row = {
      slug: slugify(s(fd, "slug") || name),
      name,
      description: s(fd, "description"),
      sort_order: parseInt(s(fd, "sort_order"), 10) || 0,
      image_url: img ?? (s(fd, "image_url") || null),
    };
    const { error } = original
      ? await sb.from("categories").update(row).eq("slug", original)
      : await sb.from("categories").insert(row);
    if (error) throw new Error(error.message);
    if (original && original !== row.slug) {
      // Atualiza os produtos que usavam o slug antigo.
      const { data } = await sb.from("products").select("id,categories").contains("categories", [original]);
      for (const p of data ?? []) {
        await sb
          .from("products")
          .update({ categories: (p.categories as string[]).map((c) => (c === original ? row.slug : c)) })
          .eq("id", p.id);
      }
    }
    refreshSite();
    return "/admin/categorias?ok=1";
  });
}

export async function deleteCategory(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/categorias", async () => {
    const { error } = await sb.from("categories").delete().eq("slug", s(fd, "slug"));
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/categorias";
  });
}

// ---------- Banners ----------
export async function saveBanner(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/banners", async () => {
    const id = s(fd, "id");
    const [desk] = await uploadFiles(sb, fd.getAll("new_image"), "banners");
    const [mob] = await uploadFiles(sb, fd.getAll("new_mobile_image"), "banners");
    const image_url = desk ?? s(fd, "image_url");
    if (!image_url) throw new Error("Envie a imagem do banner.");
    const row = {
      title: s(fd, "title"),
      link: s(fd, "link") || "/",
      sort_order: parseInt(s(fd, "sort_order"), 10) || 0,
      active: b(fd, "active"),
      image_url,
      mobile_image_url: mob ?? (s(fd, "mobile_image_url") || null),
    };
    const { error } = id ? await sb.from("banners").update(row).eq("id", id) : await sb.from("banners").insert(row);
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/banners?ok=1";
  });
}

export async function deleteBanner(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/banners", async () => {
    await sb.from("banners").delete().eq("id", s(fd, "id"));
    refreshSite();
    return "/admin/banners";
  });
}

// ---------- Páginas ----------
export async function savePage(fd: FormData) {
  const { sb } = await requireAdmin();
  await run(`/admin/paginas/${s(fd, "original_slug") || "novo"}`, async () => {
    const original = s(fd, "original_slug");
    const title = s(fd, "title");
    if (!title) throw new Error("Informe o título.");
    const row = {
      slug: slugify(s(fd, "slug") || title),
      title,
      content: s(fd, "content"),
      published: b(fd, "published"),
      updated_at: new Date().toISOString(),
    };
    const { error } = original
      ? await sb.from("pages").update(row).eq("slug", original)
      : await sb.from("pages").insert(row);
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/paginas?ok=1";
  });
}

export async function deletePage(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/paginas", async () => {
    await sb.from("pages").delete().eq("slug", s(fd, "slug"));
    refreshSite();
    return "/admin/paginas";
  });
}

// ---------- Blog ----------
export async function savePost(fd: FormData) {
  const { sb } = await requireAdmin();
  await run(`/admin/blog/${s(fd, "original_slug") || "novo"}`, async () => {
    const original = s(fd, "original_slug");
    const title = s(fd, "title");
    if (!title) throw new Error("Informe o título.");
    const [cover] = await uploadFiles(sb, fd.getAll("new_cover"), "blog");
    const row = {
      slug: slugify(s(fd, "slug") || title),
      title,
      excerpt: s(fd, "excerpt"),
      content: s(fd, "content"),
      cover_url: cover ?? (s(fd, "cover_url") || null),
      published: b(fd, "published"),
      published_at: s(fd, "published_at") ? new Date(s(fd, "published_at")).toISOString() : new Date().toISOString(),
    };
    const { error } = original
      ? await sb.from("posts").update(row).eq("slug", original)
      : await sb.from("posts").insert(row);
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/blog?ok=1";
  });
}

export async function deletePost(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/blog", async () => {
    await sb.from("posts").delete().eq("slug", s(fd, "slug"));
    refreshSite();
    return "/admin/blog";
  });
}

// ---------- Pedidos ----------
const STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"];

export async function updateOrder(fd: FormData) {
  const { sb } = await requireAdmin();
  await run(`/admin/pedidos/${s(fd, "id")}`, async () => {
    const id = s(fd, "id");
    const status = s(fd, "status");
    if (!STATUSES.includes(status)) throw new Error("Status inválido.");
    const { error } = await sb
      .from("orders")
      .update({
        status,
        tracking_code: s(fd, "tracking_code") || null,
        notes: s(fd, "notes") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/pedidos");
    return `/admin/pedidos/${id}?ok=1`;
  });
}

// ---------- Configurações ----------
export async function saveSettings(fd: FormData) {
  const { sb } = await requireAdmin();
  await run("/admin/configuracoes", async () => {
    const data = {
      store_name: s(fd, "store_name"),
      tagline: s(fd, "tagline"),
      topbar_text: s(fd, "topbar_text"),
      whatsapp: s(fd, "whatsapp").replace(/\D/g, ""),
      email: s(fd, "email"),
      instagram: s(fd, "instagram"),
      hours: s(fd, "hours"),
      flat_shipping_cents: parseBRL(fd.get("flat_shipping")) ?? 0,
      free_shipping_min_cents: parseBRL(fd.get("free_shipping_min")) ?? 0,
      pix_discount_percent: Math.max(0, Math.min(50, Number(s(fd, "pix_discount_percent")) || 0)),
      pix_free_shipping: b(fd, "pix_free_shipping"),
    };
    const { error } = await sb.from("settings").upsert({ id: 1, data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    refreshSite();
    return "/admin/configuracoes?ok=1";
  });
}

export async function signOut() {
  const { sb } = await requireAdmin();
  await sb.auth.signOut();
  redirect("/admin/login");
}
