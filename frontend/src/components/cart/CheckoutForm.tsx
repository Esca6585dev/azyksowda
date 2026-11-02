"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banknote, CreditCard, LockKeyhole } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/ui";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import type { Order, SiteConfig } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Input";
import Button, { btnClass } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ProductImage from "@/components/product/ProductImage";
import { cn } from "@/lib/utils";

export default function CheckoutForm({ site }: { site: SiteConfig }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const cartHydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const authHydrated = useAuth((s) => s.hydrated);
  const setUser = useAuth((s) => s.setUser);

  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "", payment_method: "cash" as "cash" | "card" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [prefilledFor, setPrefilledFor] = useState<number | null>(null);

  // prefill contact fields once the (rehydrated) user is known
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setForm((f) => ({ ...f, name: f.name || user.name, phone: f.phone || user.phone, address: f.address || user.address }));
  }

  const subtotal = Math.round(items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100;
  const count = items.reduce((a, i) => a + i.qty, 0);
  const fee = subtotal >= site.free_delivery_from || subtotal === 0 ? 0 : site.delivery_fee;
  const total = Math.round((subtotal + fee) * 100) / 100;

  if (!cartHydrated || !authHydrated) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Sargyt bermek üçin içeri giriň</h2>
        <p className="mt-1 text-sm text-muted">Sargytlaryňyzy yzarlamak we salgyňyzy ýatda saklamak üçin hasap gerek.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href="/login?next=/checkout" className={btnClass("primary")}>
            Içeri gir
          </Link>
          <Link href="/register?next=/checkout" className={btnClass("outline")}>
            Hasap aç
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState emoji="🧺" title="Sebediňiz boş" text="Sargyt bermek üçin ilki haryt saýlaň." action={{ href: "/catalog", label: "Kataloga geç" }} />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await api<Order>("/api/orders", {
        method: "POST",
        body: { ...form, items: items.map((i) => ({ product_id: i.id, quantity: i.qty })) },
      });
      clear();
      setUser({ ...user, phone: form.phone, address: form.address });
      toast(`Sargyt ${res.data.number} kabul edildi!`);
      router.push(`/account/orders/${res.data.id}?new=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors ?? {});
        toast(err.message, "error");
      } else {
        toast("Näsazlyk ýüze çykdy", "error");
      }
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">1. Eltip bermek maglumatlary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Adyňyz" required value={form.name} onChange={set("name")} error={errors.name} placeholder="Merdan Annaýew" autoComplete="name" />
            <Input label="Telefon" required type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+993 65 123456" autoComplete="tel" inputMode="tel" />
            <div className="sm:col-span-2">
              <Input label="Salgy" required value={form.address} onChange={set("address")} error={errors.address} placeholder="Aşgabat, Parahat 2/1, 14-nji jaý, 25-nji öý" autoComplete="street-address" />
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Bellik (hökman däl)" value={form.note} onChange={set("note")} placeholder="Mysal: gapyny kakmaň, jaň ediň; 3-nji gat, domofon 25" rows={2} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">2. Töleg usuly</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                { v: "cash", icon: Banknote, t: "Nagt", d: "Eltilende kurýere töleýärsiňiz" },
                { v: "card", icon: CreditCard, t: "Bank karty", d: "Eltilende terminal arkaly" },
              ] as const
            ).map((o) => (
              <label key={o.v} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition", form.payment_method === o.v ? "border-brand-500 bg-brand-50" : "border-line hover:border-gray-300")}>
                <input type="radio" name="payment" className="sr-only" checked={form.payment_method === o.v} onChange={() => setForm((f) => ({ ...f, payment_method: o.v }))} />
                <span className={cn("grid h-10 w-10 place-items-center rounded-lg", form.payment_method === o.v ? "bg-brand-500 text-white" : "bg-gray-100 text-muted")}>
                  <o.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{o.t}</span>
                  <span className="text-xs text-muted">{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <aside className="h-fit lg:sticky lg:top-32">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Siziň sargydyňyz</h2>
          <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <ProductImage image={i.image} emoji={i.emoji} name={i.name} className="h-12 w-12 shrink-0 rounded-lg" emojiClassName="!text-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.name}</div>
                  <div className="text-xs text-muted">
                    {i.qty} × {money(i.price)} m.
                  </div>
                </div>
                <div className="text-sm font-semibold">{money(i.qty * i.price)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Harytlar ({count})</dt>
              <dd>{money(subtotal)} manat</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Eltip bermek</dt>
              <dd className={fee === 0 ? "font-semibold text-brand-600" : ""}>{fee === 0 ? "Mugt" : `${money(fee)} manat`}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-lg font-extrabold">
              <dt>Jemi</dt>
              <dd className="text-brand-600">{money(total)} manat</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-4 w-full" loading={loading}>
            Sargydy tassykla
          </Button>
          <p className="mt-2 text-center text-xs text-muted">Tassyklanyňyzdan soň operator siziň bilen habarlaşar.</p>
        </div>
      </aside>
    </form>
  );
}
