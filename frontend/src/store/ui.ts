"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface UIState {
  cartOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setMenu: (open: boolean) => void;
  toast: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: number) => void;
}

let seq = 1;

export const useUI = create<UIState>((set, get) => ({
  cartOpen: false,
  menuOpen: false,
  toasts: [],
  openCart: () => set({ cartOpen: true, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set({ cartOpen: !get().cartOpen, menuOpen: false }),
  setMenu: (open) => set({ menuOpen: open, cartOpen: false }),
  toast: (message, type = "success") => {
    const id = seq++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, type }] }));
    setTimeout(() => get().dismiss(id), 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (message: string, type?: Toast["type"]) => useUI.getState().toast(message, type);
