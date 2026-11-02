"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  add: (p: Product, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  qtyOf: (id: number) => number;
}

const maxFor = (stock: number) => (stock > 0 ? Math.min(stock, 99) : 99);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      add: (p, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === p.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === p.id ? { ...i, qty: Math.min(maxFor(p.stock), i.qty + qty), stock: p.stock, price: p.price } : i,
              ),
            };
          }
          const item: CartItem = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            old_price: p.old_price,
            image: p.image,
            emoji: p.emoji,
            weight: p.weight,
            unit: p.unit,
            stock: p.stock,
            qty: Math.min(maxFor(p.stock), qty),
          };
          return { items: [...s.items, item] };
        }),
      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(maxFor(i.stock), qty) } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, i) => a + i.qty, 0),
      subtotal: () => Math.round(get().items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100,
      qtyOf: (id) => get().items.find((i) => i.id === id)?.qty ?? 0,
    }),
    {
      name: "azyksowda-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useCart.setState({ hydrated: true });
      },
    },
  ),
);
