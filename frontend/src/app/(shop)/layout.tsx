import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import MobileNav from "@/components/layout/MobileNav";
import { fetchCategories, fetchSiteConfig } from "@/lib/api";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, site] = await Promise.all([fetchCategories(), fetchSiteConfig()]);
  return (
    <>
      <Header categories={categories} site={site} />
      <main className="flex-1">{children}</main>
      <Footer site={site} categories={categories} />
      <CartDrawer site={site} />
      <MobileNav />
    </>
  );
}
