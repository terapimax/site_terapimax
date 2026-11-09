import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cleanHtml } from "@/lib/sanitize";
import { getPage, getSettings } from "@/lib/store";

export const revalidate = 300;
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: page.title } : {};
}

export default async function CmsPage({ params }: { params: P }) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">{page.title}</h1>
      <div className="prose-content rounded-2xl bg-white p-5 ring-1 ring-gray-100 md:p-8" dangerouslySetInnerHTML={{ __html: cleanHtml(page.content) }} />
      {slug === "contato" && (
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          className="mt-6 inline-block rounded-xl bg-[#25d366] px-6 py-3 font-semibold text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chamar no WhatsApp
        </a>
      )}
    </article>
  );
}
