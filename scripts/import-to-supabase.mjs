// Importa data/seed.json (produtos, categorias, páginas, banners, configurações) para o Supabase
// e copia as imagens do WordPress para o Storage, para o site novo não depender do servidor antigo.
//
// Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-to-supabase.mjs [--admin seu@email.com] [--sem-imagens]
//
// Pode rodar mais de uma vez: registros com o mesmo slug são atualizados, não duplicados.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const args = process.argv.slice(2);
const adminEmail = args.includes("--admin") ? args[args.indexOf("--admin") + 1] : null;
const copyImages = !args.includes("--sem-imagens");

const sb = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));

const cache = new Map();
const failed = new Set();
async function copy(src, folder) {
  if (!copyImages || !src || !src.includes("terapimax.com.br/wp-content/")) return src;
  if (cache.has(src)) return cache.get(src);
  const name = createHash("sha1").update(src).digest("hex").slice(0, 16);
  const ext = (src.split("?")[0].split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${name}.${ext}`;
  try {
    const res = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0 (terapimax-migracao)", Accept: "image/*" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = Buffer.from(await res.arrayBuffer());
    const { error } = await sb.storage
      .from("media")
      .upload(path, body, { contentType: res.headers.get("content-type") ?? "image/jpeg", upsert: true });
    if (error) throw error;
    const out = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    cache.set(src, out);
    return out;
  } catch (e) {
    console.warn(`  ! não copiei ${src}: ${e.message ?? e}`);
    failed.add(src);
    return src;
  }
}

/** Troca imagens do WordPress dentro do HTML das descrições. */
async function rewriteHtml(html, folder) {
  const srcs = [...new Set([...html.matchAll(/src="(https:\/\/terapimax\.com\.br\/wp-content\/[^"]+)"/g)].map((m) => m[1]))];
  for (const s of srcs) {
    const out = await copy(s, folder);
    if (failed.has(s)) {
      // Imagem que já não existe no site antigo: remove a tag para não aparecer quebrada.
      const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp(`<img[^>]*src="${esc}"[^>]*>`, "g"), "");
    } else {
      html = html.split(s).join(out);
    }
  }
  return html;
}

async function upsert(table, rows, onConflict) {
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length}`);
}

await upsert("settings", [{ id: 1, data: seed.settings }], "id");

const categories = [];
for (const c of seed.categories) categories.push({ ...c, image_url: await copy(c.image_url, "categorias") });
await upsert("categories", categories, "slug");

const products = [];
for (const [i, p] of seed.products.entries()) {
  process.stdout.write(`  produto ${i + 1}/${seed.products.length}\r`);
  const images = [];
  for (const img of p.images) images.push(await copy(img, "produtos"));
  products.push({
    ...p,
    images,
    description: await rewriteHtml(p.description, "produtos"),
    short_description: await rewriteHtml(p.short_description, "produtos"),
  });
}
await upsert("products", products, "slug");

const pages = [];
for (const p of seed.pages) pages.push({ ...p, content: await rewriteHtml(p.content, "paginas") });
await upsert("pages", pages, "slug");

const posts = [];
for (const p of seed.posts) posts.push({ ...p, cover_url: await copy(p.cover_url, "blog"), content: await rewriteHtml(p.content, "blog") });
if (posts.length) await upsert("posts", posts, "slug");

const { count } = await sb.from("banners").select("id", { count: "exact", head: true });
if (!count) {
  const banners = [];
  for (const b of seed.banners) {
    banners.push({ ...b, image_url: await copy(b.image_url, "banners"), mobile_image_url: await copy(b.mobile_image_url, "banners") });
  }
  await upsert("banners", banners, "id");
}

if (adminEmail) {
  await upsert("admins", [{ email: adminEmail.toLowerCase() }], "email");
}
console.log("Importação concluída.");
