import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/store";

export const revalidate = 300;
export const metadata: Metadata = { title: "Blog", description: "Dicas de saúde, bem-estar e qualidade de vida." };

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-semibold md:text-3xl">Blog Terapimax</h1>
      <p className="mt-1 text-muted">Dicas de saúde, bem-estar e qualidade de vida.</p>
      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted">Em breve, novos conteúdos por aqui.</p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="block overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 hover:shadow-md">
                <div className="relative aspect-[16/9] bg-brand-100">
                  {p.cover_url && <Image src={p.cover_url} alt="" fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />}
                </div>
                <div className="p-4">
                  <time className="text-xs text-muted">{new Date(p.published_at).toLocaleDateString("pt-BR")}</time>
                  <h2 className="mt-1 font-semibold">{p.title}</h2>
                  {p.excerpt && <p className="mt-1 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
