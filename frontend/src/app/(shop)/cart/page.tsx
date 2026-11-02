import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { fetchSiteConfig } from "@/lib/api";

export const metadata: Metadata = { title: "Sebet", robots: { index: false } };

export default async function CartPage() {
  const site = await fetchSiteConfig();
  return (
    <div className="wrap py-6 sm:py-8">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Sebet</h1>
      <CartView site={site} />
    </div>
  );
}
