import { Leaf, Smartphone, Headset } from "lucide-react";
import Hero from "@/components/home/Hero";
import FeatureStrip from "@/components/home/FeatureStrip";
import CategoryGrid from "@/components/home/CategoryGrid";
import PromoBanner from "@/components/home/PromoBanner";
import Section from "@/components/home/Section";
import ProductGrid from "@/components/product/ProductGrid";
import ApiDown from "@/components/ui/ApiDown";
import { fetchCategories, fetchProducts, fetchSiteConfig } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, site, discount, featured, newest] = await Promise.all([
    fetchCategories(),
    fetchSiteConfig(),
    fetchProducts({ discount: true, limit: 10 }),
    fetchProducts({ featured: true, limit: 10 }),
    fetchProducts({ sort: "newest", limit: 10 }),
  ]);
  const productCount = categories.reduce((a, c) => a + (c.product_count || 0), 0) || featured.meta?.total || 200;
  const apiDown = categories.length === 0 && featured.error;

  return (
    <>
      <Hero productCount={productCount} categoryCount={categories.length || 14} freeFrom={site.free_delivery_from} />
      <FeatureStrip />

      {apiDown ? (
        <ApiDown message={featured.error} />
      ) : (
        <>
          <Section title="Kategoriýalar" subtitle="Gerekli harydy bölümler boýunça tapyň" href="/catalog" linkLabel="Ähli harytlar">
            <CategoryGrid categories={categories} />
          </Section>

          {discount.items.length > 0 && (
            <Section title="🔥 Arzanladyşlar" subtitle="Çäkli wagt üçin ýörite bahalar" href="/catalog?discount=1">
              <ProductGrid products={discount.items} />
            </Section>
          )}

          <PromoBanner freeFrom={site.free_delivery_from} />

          {featured.items.length > 0 && (
            <Section title="Meşhur harytlar" subtitle="Müşderilerimiziň iň köp saýlaýanlary" href="/catalog?featured=1">
              <ProductGrid products={featured.items} />
            </Section>
          )}

          {newest.items.length > 0 && (
            <Section title="Täze harytlar" subtitle="Ýaňy-ýakynda goşulanlar" href="/catalog?sort=newest">
              <ProductGrid products={newest.items} />
            </Section>
          )}

          <Section title="Näme üçin AzykSowda?">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Leaf, title: "Täzelik kepilligi", text: "Miweler we gök önümler her gün irden ýerli daýhan bazaryndan getirilýär. Halamasaňyz — yzyna alýarys." },
                { icon: Smartphone, title: "Telefondan amatly sargyt", text: "Saýt mobil telefonda doly işleýär. Sebede goşuň, salgyňyzy ýazyň — 2 minutda sargyt taýýar." },
                { icon: Headset, title: "Goldaw her gün", text: `${site.work_hours}. Soraglaryňyz üçin ${site.phone} belgä jaň ediň.` },
              ].map((f) => (
                <div key={f.title} className="rounded-card bg-white p-6 shadow-card">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
