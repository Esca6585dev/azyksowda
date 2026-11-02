"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { Category, Product } from "@/lib/types";
import { UNITS } from "@/lib/constants";
import { toast } from "@/store/ui";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUpload from "./ImageUpload";
import { Card } from "./ui";

const QUICK_EMOJI = ["🍎", "🍌", "🍊", "🍇", "🍉", "🥕", "🥔", "🍅", "🥒", "🥬", "🥛", "🧀", "🧈", "🥚", "🍗", "🥩", "🐟", "🍞", "🥐", "🍪", "🍰", "🍫", "🍬", "🍯", "🥤", "🧃", "💧", "☕", "🍵", "🍝", "🍚", "🍜", "🥫", "🍟", "🥜", "🧊", "🍦", "🧴", "🧼", "🧺", "👶", "🍼", "🛒"];

export interface ProductBody {
  name: string;
  description: string;
  brand: string;
  price: number;
  old_price: number;
  unit: string;
  weight: string;
  stock: number;
  image: string;
  emoji: string;
  category_id: number;
  is_featured: boolean;
  is_active: boolean;
}

export function toBody(p: Product, patch: Partial<ProductBody> = {}): ProductBody {
  return {
    name: p.name,
    description: p.description,
    brand: p.brand,
    price: p.price,
    old_price: p.old_price,
    unit: p.unit,
    weight: p.weight,
    stock: p.stock,
    image: p.image,
    emoji: p.emoji,
    category_id: p.category_id,
    is_featured: p.is_featured,
    is_active: p.is_active,
    ...patch,
  };
}

export default function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const { data: categories } = useFetch<Category[]>("/api/admin/categories");
  const [form, setForm] = useState<ProductBody>(
    initial
      ? toBody(initial)
      : { name: "", description: "", brand: "", price: 0, old_price: 0, unit: "sany", weight: "", stock: 50, image: "", emoji: "🛒", category_id: 0, is_featured: false, is_active: true },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ProductBody>(k: K, v: ProductBody[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (k: "price" | "old_price" | "stock") => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) || 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (initial) {
        await api<Product>(`/api/admin/products/${initial.id}`, { method: "PUT", body: form });
        toast("Haryt täzelendi");
      } else {
        await api<Product>("/api/admin/products", { method: "POST", body: form });
        toast("Haryt goşuldy");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors ?? {});
        toast(err.message, "error");
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card title="Esasy maglumatlar">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Haryt ady" required value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} placeholder="Mysal: Elin süýt 2.5%" />
            </div>
            <Select label="Kategoriýa" required value={form.category_id} onChange={(e) => set("category_id", Number(e.target.value))} error={errors.category_id}>
              <option value={0}>— saýlaň —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </Select>
            <Input label="Marka" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Mysal: Elin, Coca Cola" />
            <Input label="Gaplama / agram" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="1 kg, 0.5 L, 100 gr" />
            <Select label="Ölçeg birligi" value={form.unit} onChange={(e) => set("unit", e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <Textarea label="Beýany" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Haryt barada gysgaça maglumat" />
            </div>
          </div>
        </Card>

        <Card title="Baha we ammar">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Baha (manat)" required type="number" min={0} step="0.01" value={form.price} onChange={num("price")} error={errors.price} inputMode="decimal" />
            <Input label="Köne baha (arzanladyş üçin)" type="number" min={0} step="0.01" value={form.old_price} onChange={num("old_price")} error={errors.old_price} hint="0 = arzanladyş ýok" inputMode="decimal" />
            <Input label="Galyndy (ammarda)" required type="number" min={0} step="1" value={form.stock} onChange={num("stock")} error={errors.stock} inputMode="numeric" />
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <Checkbox label="Meşhur haryt (baş sahypada görkez)" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
            <Checkbox label="Satuwda (işjeň)" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Surat">
          <ImageUpload value={form.image} onChange={(u) => set("image", u)} emoji={form.emoji} />
        </Card>
        <Card title="Emoji (surat ýok bolsa)">
          <Input value={form.emoji} onChange={(e) => set("emoji", e.target.value)} className="text-center text-2xl" maxLength={4} />
          <div className="mt-3 flex flex-wrap gap-1">
            {QUICK_EMOJI.map((e) => (
              <button key={e} type="button" onClick={() => set("emoji", e)} className={`grid h-9 w-9 place-items-center rounded-lg text-xl hover:bg-brand-50 ${form.emoji === e ? "bg-brand-100 ring-2 ring-brand-400" : "bg-gray-50"}`}>
                {e}
              </button>
            ))}
          </div>
        </Card>
        <div className="flex gap-2">
          <Button type="submit" size="lg" className="flex-1" loading={loading}>
            {initial ? "Ýatda sakla" : "Haryt goş"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Yza
          </Button>
        </div>
      </div>
    </form>
  );
}
