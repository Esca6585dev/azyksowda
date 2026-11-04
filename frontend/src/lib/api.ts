import type { Category, Meta, Product, SiteConfig } from "./types";

/**
 * API base. Server components call the Go API directly (API_URL); the browser
 * uses NEXT_PUBLIC_API_URL or, when unset, same-origin paths that next.config.ts
 * rewrites to the API — the way nginx routes /api and /uploads in production.
 */
export const API_BASE =
  typeof window === "undefined"
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_URL || "";

export const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Meta;
  message?: string;
  errors?: Record<string, string>;
  actions?: string[];
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  formData?: FormData;
  cache?: RequestCache;
  revalidate?: number;
}

let tokenGetter: () => string | null = () => null;
/** Lets the auth store register how to read the current token (client only). */
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

/** Generic JSON fetch against the Go API. Throws ApiError on non-2xx. */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = opts.token !== undefined ? opts.token : tokenGetter();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const init: RequestInit & { next?: { revalidate?: number } } = {
    method: opts.method ?? "GET",
    headers,
    body,
    cache: opts.cache ?? "no-store",
  };
  if (opts.revalidate !== undefined) {
    delete init.cache;
    init.next = { revalidate: opts.revalidate };
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError("Serwer bilen baglanyşyk ýok. Backend işleýärmi?", 0);
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    /* non-json */
  }
  if (!res.ok || !json || json.success === false) {
    throw new ApiError(json?.message || `Ýalňyşlyk (${res.status})`, res.status, json?.errors);
  }
  return json;
}

/** Resolve an image path returned by the API into an absolute URL. */
export function imgUrl(src?: string | null): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${PUBLIC_API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
}

// ---------- typed helpers used by server components (never throw) ----------

export interface ProductQuery {
  q?: string;
  category?: string;
  sort?: string;
  page?: number | string;
  limit?: number;
  featured?: boolean | string;
  discount?: boolean | string;
  in_stock?: boolean | string;
  brand?: string;
  min_price?: string;
  max_price?: string;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === false) continue;
    sp.set(k, v === true ? "1" : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function fetchProducts(q: ProductQuery = {}): Promise<{ items: Product[]; meta: Meta | null; error: string | null }> {
  try {
    const res = await api<Product[]>(`/api/products${buildQuery(q as Record<string, string | number | boolean | undefined>)}`);
    return { items: res.data ?? [], meta: res.meta ?? null, error: null };
  } catch (e) {
    return { items: [], meta: null, error: e instanceof Error ? e.message : "Ýalňyşlyk" };
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await api<Category[]>("/api/categories");
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const res = await api<Category>(`/api/categories/${encodeURIComponent(slug)}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchProduct(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  try {
    const res = await api<{ product: Product; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`);
    return res.data;
  } catch {
    return null;
  }
}

export const DEFAULT_SITE: SiteConfig = {
  name: "AzykSowda",
  delivery_fee: 10,
  free_delivery_from: 200,
  currency: "manat",
  phone: "+993 12 947635",
  phone2: "+993 12 947550",
  email: "azyk.harytlar@gmail.com",
  address: "Türkmenistan, Aşgabat şäheri, Azady köçesi 12",
  work_hours: "Her gün 08:00 - 23:00",
};

export async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await api<SiteConfig>("/api/config");
    return { ...DEFAULT_SITE, ...res.data };
  } catch {
    return DEFAULT_SITE;
  }
}
