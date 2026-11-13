import type { Metadata } from "next";
import BlogPostView, { postMetadata } from "@/components/blog-post-view";

export const revalidate = 300;
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  return postMetadata((await params).slug);
}

export default async function BlogHostPost({ params }: { params: P }) {
  return <BlogPostView slug={(await params).slug} onBlogHost />;
}
