import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import ApiDown from "@/components/ui/ApiDown";
import SortSelect from "@/components/catalog/SortSelect";
import { buildQuery, fetchCategories, fetchProducts } from "@/lib/api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

function pickParams(sp: SP) {
  return {
    q: sp.q || undefined,
    category: sp.category || undefined,
    sort: sp.sort || undefined,
    discount: sp.discount === "1" ? "1" : undefined,
    featured: sp.featured === "1" ? "1" : undefined,
    in_stock: sp.in_stock === "1" ? "1" : undefined,
    min_price: sp.min_price || undefined,
    max_price: sp.max_price || undefined,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.q) return { title: `"${sp.q}" gözleg` };
  if (sp.category) {
    const cats = await fetchCategories();
    const c = cats.find((x) => x.slug === sp.category);
    if (c) return { title: c.name, description: c.description };
  }
  if (sp.discount === "1") return { title: "Arzanladyşlar" };
  return { title: "Katalog", description: "AzykSowda — ähli azyk harytlary bir ýerde" };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const params = pickParams(sp);
  const page = Math.max(1, Number(sp.page) || 1);

  const [categories, result] = await Promise.all([fetchCategories(), fetchProducts({ ...params, page, limit: 24 })]);
  const current = categories.find((c) => c.slug === params.category);

  const title = params.q
    ? `"${params.q}" boýunça gözleg`
    : current
      ? current.name
      : params.discount
        ? "Arzanladyşlar"
        : params.featured
          ? "Meşhur harytlar"
          : "Ähli harytlar";

  const hrefFor = (p: number) => `/catalog${buildQuery({ ...params, page: p > 1 ? p : undefined })}`;
  const withParam = (patch: Record<string, string | undefined>) => `/catalog${buildQuery({ ...params, ...patch })}`;

  if (result.error && categories.length === 0) return <ApiDown message={result.error} />;

  return (
    <div className="wrap py-5 sm:py-8">
      {/* breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted sm:text-sm" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Baş sahypa</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/catalog" className={cn("hover:text-brand-700", !current && !params.q && "font-semibold text-ink")}>Katalog</Link>
        {current && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-ink">{current.name}</span>
          </>
        )}
      </nav>

      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
        {/* sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-5">
            <div className="rounded-card bg-card p-4 shadow-card">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Filter className="h-4 w-4 text-brand-600" /> Kategoriýalar
              </h3>
              <ul className="space-y-0.5">
                <li>
                  <Link href={withParam({ category: undefined })} className={cn("flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-brand-50", !params.category && "bg-brand-50 font-semibold text-brand-700")}>
                    <span>🛒 Ähli harytlar</span>
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={withParam({ category: c.slug })} className={cn("flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-brand-50", params.category === c.slug && "bg-brand-50 font-semibold text-brand-700")}>
                      <span className="flex items-center gap-2">
                        <span>{c.emoji}</span> {c.name}
                      </span>
                      <span className="text-xs text-muted">{c.product_count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card bg-card p-4 shadow-card">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Süzgüç
              </h3>
              <div className="space-y-2 text-sm">
                <Link href={withParam({ discount: params.discount ? undefined : "1" })} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-brand-50", params.discount && "bg-red-50 font-semibold text-red-700")}>
                  <span className={cn("grid h-4.5 w-4.5 place-items-center rounded border", params.discount ? "border-red-500 bg-red-500 text-white" : "border-gray-300")}>{params.discount && "✓"}</span>
                  Diňe arzanladyşlar
                </Link>
                <Link href={withParam({ in_stock: params.in_stock ? undefined : "1" })} className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-brand-50", params.in_stock && "bg-brand-50 font-semibold text-brand-700")}>
                  <span className={cn("grid h-4.5 w-4.5 place-items-center rounded border", params.in_stock ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300")}>{params.in_stock && "✓"}</span>
                  Diňe ammarda barlar
                </Link>
              </div>
              <form action="/catalog" method="get" className="mt-4 border-t border-line pt-4">
                {params.q && <input type="hidden" name="q" value={params.q} />}
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                {params.discount && <input type="hidden" name="discount" value="1" />}
                <div className="mb-2 text-xs font-semibold text-muted">Baha (manat)</div>
                <div className="flex items-center gap-2">
                  <input name="min_price" type="number" min={0} step="0.5" defaultValue={params.min_price} placeholder="0" className="h-9 w-full rounded-lg border border-line px-2 text-sm focus:border-brand-500 focus:outline-none" />
                  <span className="text-muted">—</span>
                  <input name="max_price" type="number" min={0} step="0.5" defaultValue={params.max_price} placeholder="500" className="h-9 w-full rounded-lg border border-line px-2 text-sm focus:border-brand-500 focus:outline-none" />
                </div>
                <button className="mt-2 h-9 w-full rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600">Ulan</button>
                {(params.min_price || params.max_price) && (
                  <Link href={withParam({ min_price: undefined, max_price: undefined })} className="mt-1.5 block text-center text-xs text-muted hover:text-ink">
                    Arassala
                  </Link>
                )}
              </form>
            </div>
          </div>
        </aside>

        {/* content */}
        <div className="min-w-0">
          {/* mobile category chips */}
          <div className="scroll-x -mx-4 mb-4 flex gap-2 px-4 pb-1 lg:hidden">
            <Link href={withParam({ category: undefined })} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", !params.category ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-card")}>
              Hemmesi
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={withParam({ category: c.slug })} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", params.category === c.slug ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-card")}>
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
              <p className="text-sm text-muted">{result.meta?.total ?? 0} haryt tapyldy</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={withParam({ discount: params.discount ? undefined : "1" })} className={cn("inline-flex h-10 items-center rounded-xl border px-3 text-sm font-medium lg:hidden", params.discount ? "border-red-500 bg-red-50 text-red-700" : "border-line bg-card")}>
                🔥 Arzan
              </Link>
              <Suspense fallback={<div className="h-10 w-40 rounded-xl bg-card" />}>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {current?.description && <p className="mb-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{current.emoji} {current.description}</p>}

          {result.items.length === 0 ? (
            <EmptyState emoji="🔍" title="Haryt tapylmady" text={params.q ? `"${params.q}" boýunça hiç zat tapylmady. Başga söz bilen synanyşyň.` : "Bu süzgüç boýunça haryt ýok."} action={{ href: "/catalog", label: "Ähli harytlar" }} />
          ) : (
            <>
              <ProductGrid products={result.items} cols="catalog" />
              {result.meta && <Pagination meta={result.meta} hrefFor={hrefFor} className="mt-8" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
