"use client";

import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "@/store/ui";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
}

/** "Sebede goş" button that turns into a quantity stepper once the item is in the cart. */
export default function AddToCart({ product, size = "sm", className, fullWidth }: Props) {
  const qty = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);

  const h = size === "lg" ? "h-12" : size === "md" ? "h-11" : "h-9";
  const text = size === "lg" ? "text-base" : "text-sm";
  const out = product.stock <= 0;

  if (out) {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-xl bg-gray-100 px-3 font-semibold text-muted", h, text, fullWidth && "w-full", className)}>
        Gutardy
      </span>
    );
  }

  if (qty > 0) {
    return (
      <div className={cn("inline-flex items-center overflow-hidden rounded-xl bg-brand-500 text-white shadow-sm", h, fullWidth && "w-full justify-between", className)}>
        <button type="button" onClick={() => setQty(product.id, qty - 1)} className="grid h-full w-10 place-items-center hover:bg-brand-600" aria-label="Azalt">
          <Minus className="h-4 w-4" />
        </button>
        <span className={cn("min-w-8 text-center font-bold tabular-nums", text)}>{qty}</span>
        <button
          type="button"
          onClick={() => {
            if (qty >= product.stock) {
              toast(`Ammarda diňe ${product.stock} ${product.unit} bar`, "info");
              return;
            }
            setQty(product.id, qty + 1);
          }}
          className="grid h-full w-10 place-items-center hover:bg-brand-600"
          aria-label="Köpelt"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(product, 1);
        toast("Haryt sebede goşuldy");
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3.5 font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-600 active:scale-[0.97]",
        h,
        text,
        fullWidth && "w-full",
        className,
      )}
    >
      <ShoppingBasket className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>{size === "sm" && !fullWidth ? "Sebede" : "Sebede goş"}</span>
    </button>
  );
}
