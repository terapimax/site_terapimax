import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/components/cart";
import { getActiveCategories, getSettings } from "@/lib/store";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getActiveCategories()]);
  return (
    <CartProvider>
      <Header categories={categories} topbar={settings.topbar_text} />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
    </CartProvider>
  );
}
