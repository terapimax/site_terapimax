import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";
import { MAIN_SITE } from "@/lib/host";
import { getSettings } from "@/lib/store";

export const revalidate = 300;

// Layout do subdomínio blog.terapimax.com.br (a loja fica no site principal).
export default async function BlogSiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <BlogHeader />
      <main>{children}</main>
      <Footer settings={settings} base={MAIN_SITE} />
    </>
  );
}
