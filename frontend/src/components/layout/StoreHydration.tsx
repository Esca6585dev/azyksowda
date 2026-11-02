"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * Rehydrates the persisted zustand stores after mount (avoids SSR hydration
 * mismatches) and re-validates the stored session against the API.
 */
export default function StoreHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
    useAuth.persist.rehydrate();

    const { token } = useAuth.getState();
    if (!token) return;
    api<User>("/api/auth/me")
      .then((res) => useAuth.getState().setUser(res.data))
      .catch((e) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          useAuth.getState().logout();
        }
      });
  }, []);
  return null;
}
