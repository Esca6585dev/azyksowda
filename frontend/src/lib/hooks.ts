"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import type { Meta } from "./types";

interface Result<T> {
  key: string | null;
  data: T | null;
  meta: Meta | null;
  actions: string[] | null;
  error: string | null;
  status: number | null;
}

/**
 * Client-side data hook for authenticated API reads. Re-fetches when `path`
 * changes or `reload()` is called. `loading` is derived from the request key,
 * so no state is written synchronously inside the effect.
 */
export function useFetch<T>(path: string | null) {
  const [tick, setTick] = useState(0);
  const key = path ? `${path}#${tick}` : null;
  const [res, setRes] = useState<Result<T>>({ key: null, data: null, meta: null, actions: null, error: null, status: null });

  useEffect(() => {
    if (!key || !path) return;
    let alive = true;
    api<T>(path)
      .then((r) => {
        if (!alive) return;
        setRes({ key, data: r.data, meta: r.meta ?? null, actions: r.actions ?? null, error: null, status: 200 });
      })
      .catch((e) => {
        if (!alive) return;
        setRes((s) => ({ ...s, key, error: e instanceof Error ? e.message : "Ýalňyşlyk", status: e instanceof ApiError ? e.status : null }));
      });
    return () => {
      alive = false;
    };
  }, [key, path]);

  const loading = key !== null && res.key !== key;
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: res.data, meta: res.meta, actions: res.actions, status: res.status, error: loading ? null : res.error, loading, reload };
}

/** Debounced value. */
export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
