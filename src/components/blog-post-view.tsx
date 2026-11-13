import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absolutizeLinks, MAIN_SITE } from "@/lib/host";
import { cleanHtml } from "@/lib/sanitize";
import { getPost } from "@/lib/store";

export async function postMetadata(slug: string): Promise<Metadata> {
  const post = await getPost(slug);
  return post
    ? { title: post.title, description: post.excerpt, openGraph: { images: post.cover_url ? [post.cover_url] : [] } }
    : {};
}

export default async function BlogPostView({ slug, onBlogHost = false }: { slug: string; onBlogHost?: boolean }) {
  const post = await getPost(slug);
  if (!post) notFound();
  const html = cleanHtml(post.content);
  const shop = onBlogHost ? MAIN_SITE : "";
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <time className="text-sm text-muted">{new Date(post.published_at).toLocaleDateString("pt-BR")}</time>
      <h1 className="mt-1 text-2xl font-semibold md:text-4xl">{post.title}</h1>
      {post.cover_url && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-white">
          <Image src={post.cover_url} alt="" fill priority sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
        </div>
      )}
      <div className="prose-content mt-6 text-[16px]" dangerouslySetInnerHTML={{ __html: onBlogHost ? absolutizeLinks(html) : html }} />
      <aside className="mt-10 rounded-2xl bg-brand-50 p-5 text-center">
        <p className="font-semibold">Cuide do seu corpo, você mora nele.</p>
        <p className="mt-1 text-sm text-muted">Conheça os produtos de bem-estar da Terapimax.</p>
        <a href={`${shop}/loja` || "/loja"} className="mt-3 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
          Ver a loja
        </a>
      </aside>
      <p className="mt-6 text-center text-sm">
        <Link href={onBlogHost ? "/" : "/blog"} className="text-brand-700 underline">← Voltar ao blog</Link>
      </p>
    </article>
  );
}
