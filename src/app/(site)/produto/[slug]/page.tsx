import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/Gallery";
import { ProductGrid, Stars } from "@/components/ProductCard";
import { IconPix, IconShield, IconTruck } from "@/components/icons";
import { installments, money } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import { getCategories, getProduct, getProducts, getSettings } from "@/lib/store";

export const revalidate = 60;
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const desc = (p.short_description || p.description).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  return { title: p.name, description: desc, openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: { params: P }) {
  const { slug } = await params;
  const [p, categories, settings] = await Promise.all([getProduct(slug), getCategories(), getSettings()]);
  if (!p) notFound();
  const cat = categories.find((c) => p.categories.includes(c.slug));
  const related = cat
    ? (await getProducts({ category: cat.slug, limit: 11 })).filter((r) => r.slug !== p.slug).slice(0, 10)
    : [];
  const inst = installments(p.price_cents);
  const pixPrice = Math.round(p.price_cents * (1 - settings.pix_discount_percent / 100));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    sku: p.sku ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (p.price_cents / 100).toFixed(2),
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(p.review_count
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.review_count } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="mb-4 text-xs text-muted" aria-label="Trilha">
        <Link href="/" className="hover:underline">Início</Link>
        {cat && (
          <>
            {" / "}
            <Link href={`/categoria/${cat.slug}`} className="hover:underline">{cat.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10 [&>*]:min-w-0">
        <Gallery images={p.images} name={p.name} />
        <div>
          <h1 className="text-xl font-semibold leading-snug md:text-3xl">{p.name}</h1>
          <div className="mt-2"><Stars rating={p.rating} count={p.review_count} /></div>
          <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
            {p.compare_at_cents && <span className="block text-sm text-muted line-through">{money(p.compare_at_cents)}</span>}
            <span className="text-3xl font-bold">{money(p.price_cents)}</span>
            {inst.n > 1 && (
              <span className="block text-sm text-muted">em até {inst.n}x de {money(inst.value)} no cartão</span>
            )}
            {(settings.pix_discount_percent > 0 || settings.pix_free_shipping) && (
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <IconPix className="h-5 w-5" />
                {settings.pix_discount_percent > 0 ? `${money(pixPrice)} no Pix` : "Pague no Pix"}
                {settings.pix_free_shipping && " + frete grátis"}
              </p>
            )}
          </div>
          {p.short_description && (
            <div className="prose-content mt-4 text-sm" dangerouslySetInnerHTML={{ __html: cleanHtml(p.short_description) }} />
          )}
          <div className="mt-5">
            <AddToCart product={p} />
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><IconTruck className="h-5 w-5 text-brand-600" /> Enviamos para todo o Brasil com código de rastreio</li>
            <li className="flex items-center gap-2"><IconShield className="h-5 w-5 text-brand-600" /> Compra segura e 7 dias para devolução</li>
          </ul>
        </div>
      </div>

      {p.description && (
        <section className="mt-10 rounded-2xl bg-white p-5 ring-1 ring-gray-100 md:p-8">
          <h2 className="mb-2 text-xl font-semibold">Descrição</h2>
          <div className="prose-content text-[15px]" dangerouslySetInnerHTML={{ __html: cleanHtml(p.description) }} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Você também pode gostar</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
