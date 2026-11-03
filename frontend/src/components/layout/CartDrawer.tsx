"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBasket, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { money } from "@/lib/format";
import ProductImage from "@/components/product/ProductImage";
import { btnClass } from "@/components/ui/Button";
import type { SiteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CartDrawer({ site }: { site: SiteConfig }) {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = Math.round(items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100;
  const count = items.reduce((a, i) => a + i.qty, 0);
  const fee = subtotal >= site.free_delivery_from || subtotal === 0 ? 0 : site.delivery_fee;
  const remaining = Math.max(0, site.free_delivery_from - subtotal);
  const progress = Math.min(100, (subtotal / site.free_delivery_from) * 100);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <div
        className={cn("fixed inset-0 z-[80] bg-black/45 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[90] flex h-full w-full max-w-[440px] flex-col bg-card shadow-drawer transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Sebet"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBasket className="h-5 w-5 text-brand-600" /> Sebet
            {count > 0 && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{count}</span>}
          </h2>
          <button onClick={close} className="rounded-lg p-2 text-muted hover:bg-gray-100" aria-label="Ýap">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="text-6xl">🧺</div>
            <h3 className="text-lg font-bold">Sebediňiz boş</h3>
            <p className="text-sm text-muted">Katalogdan halan harytlaryňyzy saýlaň.</p>
            <Link href="/catalog" onClick={close} className={btnClass("primary", "md", "mt-2")}>
              Kataloga geç
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {subtotal > 0 && (
                <div className="my-4 rounded-xl bg-brand-50 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-brand-800">
                    <Truck className="h-4 w-4" />
                    {remaining > 0 ? (
                      <span>
                        Mugt eltip bermek üçin ýene <b>{money(remaining)} manat</b>
                      </span>
                    ) : (
                      <span>Eltip bermek mugt! 🎉</span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <ul className="divide-y divide-line">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 py-3">
                    <Link href={`/product/${i.slug}`} onClick={close} className="shrink-0">
                      <ProductImage image={i.image} emoji={i.emoji} name={i.name} className="h-18 w-18 rounded-xl" emojiClassName="!text-3xl" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${i.slug}`} onClick={close} className="clamp-2 text-sm font-semibold leading-snug hover:text-brand-700">
                        {i.name}
                      </Link>
                      <div className="text-xs text-muted">{i.weight}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex h-8 items-center overflow-hidden rounded-lg border border-line">
                          <button onClick={() => setQty(i.id, i.qty - 1)} className="grid h-full w-8 place-items-center hover:bg-gray-100" aria-label="Azalt">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                          <button onClick={() => setQty(i.id, i.qty + 1)} className="grid h-full w-8 place-items-center hover:bg-gray-100" aria-label="Köpelt">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-brand-600">{money(i.qty * i.price)} manat</div>
                          {i.qty > 1 && <div className="text-[11px] text-muted">{money(i.price)} × {i.qty}</div>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => remove(i.id)} className="self-start rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Poz">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4 pb-safe">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Harytlar ({count})</span>
                  <span>{money(subtotal)} manat</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Eltip bermek</span>
                  <span>{fee === 0 ? "Mugt" : `${money(fee)} manat`}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-extrabold">
                  <span>Jemi</span>
                  <span className="text-brand-600">{money(subtotal + fee)} manat</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/cart" onClick={close} className={btnClass("outline", "md")}>
                  Sebedi görmek
                </Link>
                <Link href="/checkout" onClick={close} className={btnClass("primary", "md")}>
                  Sargyt bermek
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
