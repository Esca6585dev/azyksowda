import type { MetadataRoute } from "next";
import { fetchCategories, fetchProducts } from "@/lib/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts({ limit: 100, sort: "newest" })]);
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...categories.map((c) => ({ url: `${base}/catalog?category=${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.items.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
