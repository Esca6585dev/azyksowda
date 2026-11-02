"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "@/store/ui";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import Button, { btnClass } from "@/components/ui/Button";

export default function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const max = product.stock > 0 ? Math.min(product.stock, 99) : 0;

  if (product.stock <= 0) {
    return (
      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-muted">Bu haryt häzir ammarda ýok. Tiz wagtda gaýtadan satuwda bolar.</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center overflow-hidden rounded-xl border border-line bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center hover:bg-gray-100" aria-label="Azalt">
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => setQty(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
            className="h-full w-14 border-x border-line text-center text-base font-bold tabular-nums focus:outline-none"
            aria-label="Mukdar"
          />
          <button onClick={() => setQty((q) => Math.min(max, q + 1))} className="grid h-full w-11 place-items-center hover:bg-gray-100" aria-label="Köpelt">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1 sm:flex-none sm:min-w-56"
          onClick={() => {
            add(product, qty);
            toast(`${product.name} sebede goşuldy (${qty} ${product.unit})`);
          }}
        >
          <ShoppingBasket className="h-5 w-5" /> Sebede goş · {money(product.price * qty)} m.
        </Button>
      </div>
      {inCart > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 text-brand-700">
            <Check className="h-4 w-4" /> Sebetde {inCart} {product.unit} bar
          </span>
          <Link href="/cart" className={btnClass("soft", "sm")}>
            Sebede geç
          </Link>
          <Link href="/checkout" className={btnClass("accent", "sm")}>
            Sargyt bermek
          </Link>
        </div>
      )}
    </div>
  );
}
