import BlogIndexView, { blogMetadata } from "@/components/blog-index-view";

export const revalidate = 300;
export const metadata = { ...blogMetadata, robots: { index: false } };

export default BlogIndexView;
