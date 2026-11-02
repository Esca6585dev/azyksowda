"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";
import { setTokenGetter } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      login: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "azyksowda-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAuth.setState({ hydrated: true });
      },
    },
  ),
);

setTokenGetter(() => useAuth.getState().token);

export const isAdmin = (u: User | null | undefined) => !!u && u.role === "admin";
