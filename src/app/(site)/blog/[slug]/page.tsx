import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cleanHtml } from "@/lib/sanitize";
import { getPost } from "@/lib/store";

export const revalidate = 300;
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt, openGraph: { images: post.cover_url ? [post.cover_url] : [] } } : {};
}

export default async function PostPage({ params }: { params: P }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <time className="text-sm text-muted">{new Date(post.published_at).toLocaleDateString("pt-BR")}</time>
      <h1 className="mt-1 text-2xl font-semibold md:text-4xl">{post.title}</h1>
      {post.cover_url && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={post.cover_url} alt="" fill priority sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
        </div>
      )}
      <div className="prose-content mt-6 text-[16px]" dangerouslySetInnerHTML={{ __html: cleanHtml(post.content) }} />
    </article>
  );
}
