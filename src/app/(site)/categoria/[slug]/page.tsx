import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getActiveCategories, getCategory, getProducts } from "@/lib/store";

type P = Promise<{ slug: string }>;
type SP = Promise<{ ordem?: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  return { title: c?.name ?? "Categoria", description: c?.description || undefined };
}

export default async function CategoryPage({ params, searchParams }: { params: P; searchParams: SP }) {
  const { slug } = await params;
  const { ordem } = await searchParams;
  const [category, categories, products] = await Promise.all([
    getCategory(slug),
    getActiveCategories(),
    getProducts({ category: slug, sort: ordem as "price_asc" | "price_desc" | "name" | undefined }),
  ]);
  if (!category) notFound();
  return (
    <Listing
      title={category.name}
      description={category.description}
      products={products}
      categories={categories}
      active={slug}
    />
  );
}
