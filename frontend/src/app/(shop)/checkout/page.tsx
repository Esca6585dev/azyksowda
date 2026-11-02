import type { Metadata } from "next";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { fetchSiteConfig } from "@/lib/api";

export const metadata: Metadata = { title: "Sargyt bermek", robots: { index: false } };

export default async function CheckoutPage() {
  const site = await fetchSiteConfig();
  return (
    <div className="wrap py-6 sm:py-8">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Sargyt bermek</h1>
      <CheckoutForm site={site} />
    </div>
  );
}
