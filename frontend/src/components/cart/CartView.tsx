"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, Truck } from "lucide-react";
import { useCart } from "@/store/cart";
import { money } from "@/lib/format";
import ProductImage from "@/components/product/ProductImage";
import EmptyState from "@/components/ui/EmptyState";
import { btnClass } from "@/components/ui/Button";
import type { SiteConfig } from "@/lib/types";

export default function CartView({ site }: { site: SiteConfig }) {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const subtotal = Math.round(items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100;
  const count = items.reduce((a, i) => a + i.qty, 0);
  const fee = subtotal >= site.free_delivery_from || subtotal === 0 ? 0 : site.delivery_fee;
  const remaining = Math.max(0, site.free_delivery_from - subtotal);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  if (items.length === 0) {
    return <EmptyState emoji="🧺" title="Sebediňiz boş" text="Katalogdan halan harytlaryňyzy saýlap, sebede goşuň." action={{ href: "/catalog", label: "Kataloga geç" }} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-bold">
            Harytlar <span className="text-muted">({count})</span>
          </h2>
          <button onClick={clear} className="text-sm text-muted hover:text-red-600">
            Sebedi arassala
          </button>
        </div>
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
              <Link href={`/product/${i.slug}`} className="shrink-0">
                <ProductImage image={i.image} emoji={i.emoji} name={i.name} className="h-20 w-20 rounded-xl sm:h-24 sm:w-24" emojiClassName="!text-4xl" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/product/${i.slug}`} className="clamp-2 font-semibold leading-snug hover:text-brand-700">
                      {i.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted">
                      {i.weight} · {money(i.price)} manat / {i.unit}
                    </div>
                  </div>
                  <button onClick={() => remove(i.id)} className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Poz">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-line">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-full w-9 place-items-center hover:bg-gray-100" aria-label="Azalt">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-9 text-center font-semibold tabular-nums">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-full w-9 place-items-center hover:bg-gray-100" aria-label="Köpelt">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-lg font-extrabold text-brand-600">{money(i.qty * i.price)} m.</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-4 py-3 sm:px-5">
          <Link href="/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            ← Söwdany dowam et
          </Link>
        </div>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-32">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Sargyt jemi</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Harytlar ({count})</dt>
              <dd>{money(subtotal)} manat</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Eltip bermek</dt>
              <dd className={fee === 0 ? "font-semibold text-brand-600" : ""}>{fee === 0 ? "Mugt" : `${money(fee)} manat`}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <dt>Jemi</dt>
              <dd className="text-brand-600">{money(subtotal + fee)} manat</dd>
            </div>
          </dl>
          {remaining > 0 && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-accent-50 p-2.5 text-xs text-accent-700">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Ýene {money(remaining)} manatlyk haryt goşsaňyz, eltip bermek mugt bolar.
            </p>
          )}
          <Link href="/checkout" className={btnClass("primary", "lg", "mt-4 w-full")}>
            Sargyt bermek
          </Link>
          <p className="mt-2 text-center text-xs text-muted">Töleg eltilende nagt ýa-da kart bilen</p>
        </div>
      </aside>
    </div>
  );
}
