import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, Clock, PackageCheck, Truck } from "lucide-react";
import ProductImage from "@/components/product/ProductImage";
import ProductGrid from "@/components/product/ProductGrid";
import BuyBox from "@/components/product/BuyBox";
import Section from "@/components/home/Section";
import { fetchProduct, fetchSiteConfig } from "@/lib/api";
import { discountPercent, money } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  if (!data) return { title: "Haryt tapylmady" };
  const p = data.product;
  return {
    title: `${p.name}${p.weight ? ` ${p.weight}` : ""} — ${money(p.price)} manat`,
    description: p.description?.slice(0, 160),
    openGraph: { title: p.name, description: p.description?.slice(0, 160) },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [data, site] = await Promise.all([fetchProduct(slug), fetchSiteConfig()]);
  if (!data) notFound();
  const { product: p, related } = data;
  const off = discountPercent(p.price, p.old_price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    brand: p.brand || undefined,
    category: p.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "TMT",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <div className="wrap py-5 sm:py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted sm:text-sm" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-700">Baş sahypa</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/catalog" className="hover:text-brand-700">Katalog</Link>
          {p.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/catalog?category=${p.category.slug}`} className="hover:text-brand-700">{p.category.name}</Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-semibold text-ink">{p.name}</span>
        </nav>

        <div className="grid gap-6 rounded-2xl bg-white p-4 shadow-card sm:p-6 md:grid-cols-2 lg:gap-10 lg:p-8">
          <div className="group relative">
            <ProductImage image={p.image} emoji={p.emoji} name={p.name} color={p.category?.color} className="aspect-square w-full rounded-2xl" emojiClassName="!text-[7rem] sm:!text-[9rem]" priority />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {off > 0 && <span className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow">-{off}%</span>}
              {p.is_featured && <span className="rounded-lg bg-accent-500 px-2 py-1 text-xs font-bold text-white shadow">Meşhur</span>}
            </div>
          </div>

          <div className="flex flex-col">
            {p.category && (
              <Link href={`/catalog?category=${p.category.slug}`} className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${p.category.color}1f`, color: p.category.color }}>
                {p.category.emoji} {p.category.name}
              </Link>
            )}
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              {p.brand && (
                <span>
                  Marka: <b className="text-ink">{p.brand}</b>
                </span>
              )}
              {p.weight && (
                <span>
                  Gaplama: <b className="text-ink">{p.weight}</b>
                </span>
              )}
              <span>Kod: #{p.id}</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <div className="text-4xl font-extrabold text-brand-600">
                {money(p.price)} <span className="text-base font-semibold text-muted">manat / {p.unit}</span>
              </div>
              {off > 0 && <div className="pb-1.5 text-lg text-muted line-through">{money(p.old_price)}</div>}
            </div>

            <div className="mt-2 text-sm">
              {p.stock > 10 ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
                  <PackageCheck className="h-4 w-4" /> Ammarda bar
                </span>
              ) : p.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-accent-700">
                  <PackageCheck className="h-4 w-4" /> Az galdy: {p.stock} {p.unit}
                </span>
              ) : (
                <span className="font-medium text-red-600">Ammarda ýok</span>
              )}
            </div>

            <div className="mt-6">
              <BuyBox product={p} />
            </div>

            <ul className="mt-6 grid gap-2.5 rounded-xl bg-surface p-4 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2.5">
                <Truck className="h-4.5 w-4.5 shrink-0 text-brand-600" /> {site.free_delivery_from} manatdan mugt eltip bermek
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 shrink-0 text-brand-600" /> 1-2 sagadyň içinde eltip berýäris
              </li>
              <li className="flex items-center gap-2.5">
                <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-brand-600" /> Täzelik we hil kepilligi
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-base">💳</span> Nagt ýa-da kart bilen töleg
              </li>
            </ul>

            {p.description && (
              <div className="mt-6">
                <h2 className="text-base font-bold">Haryt barada</h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-gray-700">{p.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section title="Meňzeş harytlar" href={p.category ? `/catalog?category=${p.category.slug}` : "/catalog"} className="pt-0">
          <ProductGrid products={related} />
        </Section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
