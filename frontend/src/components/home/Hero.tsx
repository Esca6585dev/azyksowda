import Link from "next/link";
import { Suspense } from "react";
import { Clock, ShieldCheck, Truck } from "lucide-react";
import SearchBox from "@/components/layout/SearchBox";
import { btnClass } from "@/components/ui/Button";
import ProductImage from "@/components/product/ProductImage";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

interface Props {
  productCount: number;
  categoryCount: number;
  freeFrom: number;
  /** a few real products for the decorative basket card */
  showcase?: Product[];
}

const FALLBACK_SHOWCASE = [
  { id: 1, name: "Alma gyzyl", weight: "1 kg", price: 15, emoji: "🍎", image: "" },
  { id: 2, name: "Süýt 2.5%", weight: "1 L", price: 12, emoji: "🥛", image: "" },
  { id: 3, name: "Tamdyr çörek", weight: "1 sany", price: 4, emoji: "🫓", image: "" },
];

const FLOATERS = [
  { emoji: "🍎", cls: "left-[6%] top-[14%] text-5xl", delay: "0s" },
  { emoji: "🥦", cls: "left-[18%] bottom-[12%] text-4xl", delay: "1.2s" },
  { emoji: "🥛", cls: "right-[8%] top-[18%] text-5xl", delay: "0.6s" },
  { emoji: "🍞", cls: "right-[22%] bottom-[14%] text-4xl", delay: "1.8s" },
  { emoji: "🍊", cls: "left-[44%] top-[6%] text-3xl", delay: "2.4s" },
];

export default function Hero({ productCount, categoryCount, freeFrom, showcase }: Props) {
  const basket = showcase && showcase.length >= 3 ? showcase.slice(0, 3) : FALLBACK_SHOWCASE;
  const basketTotal = basket.reduce((a, p) => a + p.price, 0);
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1e6630] via-[#2e9e44] to-[#5ab268] text-white dark:from-[#0b1f12] dark:via-[#12361f] dark:to-[#1b5129]">
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <span key={i} className={`absolute select-none opacity-25 ${f.cls}`} style={{ filter: "blur(0.3px)" }}>
            {f.emoji}
          </span>
        ))}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-400/20" />
      </div>

      <div className="wrap relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">
            <Clock className="h-4 w-4" /> Aşgabat boýunça 1-2 sagadyň içinde eltip bermek
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Täze azyk harytlary —<br className="hidden sm:block" /> <span className="text-accent-300">amatly bahadan</span>, öýüňize çenli
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg lg:mx-0">
            Miweler, gök önümler, süýt, et, çörek we başga-da {productCount}+ haryt. Sargyt beriň, galanyny biz ederis.
          </p>

          <div className="mx-auto mt-7 max-w-xl lg:mx-0">
            <Suspense fallback={<div className="h-13 rounded-xl bg-white/80" />}>
              <SearchBox size="lg" />
            </Suspense>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            <Link href="/catalog" className={btnClass("accent", "lg")}>
              Katalogy aç
            </Link>
            <Link href="/catalog?discount=1" className={btnClass("ghost", "lg", "bg-white/15 text-white hover:bg-white/25 hover:text-white")}>
              🔥 Arzanladyşlar
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-3 text-left sm:max-w-lg lg:max-w-none">
            {[
              { k: `${productCount}+`, v: "haryt" },
              { k: `${categoryCount}`, v: "kategoriýa" },
              { k: `${freeFrom} m.`, v: "mugt eltip bermek" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
                <dt className="text-lg font-extrabold leading-none sm:text-2xl">{s.k}</dt>
                <dd className="mt-1 text-[11px] text-white/85 sm:text-xs">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* decorative basket card */}
        <div className="relative mx-auto hidden w-full max-w-sm lg:block" aria-hidden="true">
          <div className="rounded-3xl bg-card/95 p-5 text-ink shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Siziň sebediňiz</span>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">3 haryt</span>
            </div>
            <ul className="mt-4 space-y-3">
              {basket.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <ProductImage image={i.image} emoji={i.emoji} name={i.name} className="h-12 w-12 shrink-0 rounded-xl border border-line" emojiClassName="!text-2xl" pad="p-1" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{i.name}</span>
                    <span className="text-xs text-muted">{i.weight}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-brand-600">{money(i.price)} m.</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Jemi</span>
              <span className="text-lg font-extrabold text-brand-600">{money(basketTotal)} manat</span>
            </div>
            <div className="mt-3 flex h-11 items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white">Sargyt bermek</div>
          </div>
          <div className="absolute -left-8 -top-6 flex items-center gap-2 rounded-2xl bg-card p-3 text-ink shadow-xl">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-100 text-accent-600">
              <Truck className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-semibold leading-tight">
              Çalt eltip
              <br />
              bermek
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 flex items-center gap-2 rounded-2xl bg-card p-3 text-ink shadow-xl">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-semibold leading-tight">
              Hil
              <br />
              kepilligi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
