import Image from "next/image";
import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";
import { ProductGrid } from "@/components/ProductCard";
import { IconCard, IconPix, IconShield, IconTruck } from "@/components/icons";
import { getActiveCategories, getBanners, getProducts, getSettings } from "@/lib/store";

export const revalidate = 60;

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="border-b-4 border-brand-600 pb-1 text-xl font-semibold md:text-2xl">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand-700 hover:underline">
            Ver todos →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function Home() {
  const [banners, categories, featured, bestsellers, news, settings] = await Promise.all([
    getBanners(),
    getActiveCategories(),
    getProducts({ flag: "is_featured", limit: 10 }),
    getProducts({ flag: "is_bestseller", limit: 10 }),
    getProducts({ flag: "is_new", limit: 10 }),
    getSettings(),
  ]);
  const all = await getProducts();
  // Categoria sem foto própria usa a foto do primeiro produto dela.
  const catImage = (slug: string, own: string | null) =>
    own ?? all.find((p) => p.categories.includes(slug) && p.images[0])?.images[0] ?? null;
  const massageadores = await getProducts({ category: "massageadores", limit: 10 });
  const suplementos = await getProducts({ category: "suplementos", limit: 10 });

  const perks = [
    { icon: IconTruck, title: "Entrega para todo o Brasil", text: "Acompanhe seu pedido pelo código de rastreio" },
    { icon: IconPix, title: "Pague com Pix", text: settings.pix_free_shipping ? "E ganhe frete grátis" : "Aprovação na hora" },
    { icon: IconCard, title: "Parcele no cartão", text: "Em até 12x pelo Mercado Pago" },
    { icon: IconShield, title: "Compra segura", text: "Seus dados protegidos" },
  ];

  return (
    <>
      <BannerCarousel banners={banners} />

      <section className="mx-auto mt-6 max-w-7xl px-4">
        <ul className="no-scrollbar flex snap-x gap-3 overflow-x-auto md:grid md:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex min-w-[240px] snap-start items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
              <Icon className="h-8 w-8 shrink-0 text-brand-600" />
              <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="text-xs text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Section title="Categorias" href="/loja">
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {categories.map((c) => (
            <li key={c.slug} className="snap-start">
              <Link
                href={`/categoria/${c.slug}`}
                className="flex w-28 flex-col items-center gap-2 text-center md:w-36"
              >
                <span className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-white ring-4 ring-brand-100 md:h-32 md:w-32">
                  {catImage(c.slug, c.image_url) ? (
                    <Image src={catImage(c.slug, c.image_url)!} alt="" fill sizes="128px" className="object-contain p-2" />
                  ) : (
                    <span className="text-2xl font-bold text-brand-700">{c.name.slice(0, 1)}</span>
                  )}
                </span>
                <span className="text-sm font-medium leading-tight">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {featured.length > 0 && (
        <Section title="Destaques" href="/loja">
          <ProductGrid products={featured} />
        </Section>
      )}
      {massageadores.length > 0 && (
        <Section title="Massageadores" href="/categoria/massageadores">
          <ProductGrid products={massageadores} />
        </Section>
      )}
      {bestsellers.length > 0 && (
        <Section title="Mais vendidos" href="/loja?colecao=mais-vendidos">
          <ProductGrid products={bestsellers} />
        </Section>
      )}
      {suplementos.length > 0 && (
        <Section title="Vitaminas e suplementos" href="/categoria/suplementos">
          <ProductGrid products={suplementos} />
        </Section>
      )}
      {news.length > 0 && (
        <Section title="Novidades" href="/loja?colecao=novidades">
          <ProductGrid products={news} />
        </Section>
      )}
    </>
  );
}
