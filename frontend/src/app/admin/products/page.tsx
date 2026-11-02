"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { api, ApiError, buildQuery } from "@/lib/api";
import { useDebounced, useFetch } from "@/lib/hooks";
import type { Category, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { toast } from "@/store/ui";
import { AdminPagination, Card, ErrorBox, PageHeader, Table, Toggle, td, th } from "@/components/admin/ui";
import { toBody } from "@/components/admin/ProductForm";
import ProductImage from "@/components/product/ProductImage";
import Button, { btnClass } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const path = `/api/admin/products${buildQuery({ q: dq, category, status, low_stock: lowStock, sort, page, limit: 20 })}`;
  const { data, meta, loading, error, reload } = useFetch<Product[]>(path);
  const { data: categories } = useFetch<Category[]>("/api/admin/categories");

  const patch = async (p: Product, changes: Partial<ReturnType<typeof toBody>>) => {
    try {
      await api(`/api/admin/products/${p.id}`, { method: "PUT", body: toBody(p, changes) });
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    }
  };

  const remove = async () => {
    if (!del) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>(`/api/admin/products/${del.id}`, { method: "DELETE" });
      toast(res.data.message, "info");
      setDel(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    } finally {
      setBusy(false);
    }
  };

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Harytlar"
        subtitle={meta ? `Jemi ${meta.total} haryt` : undefined}
        actions={
          <Link href="/admin/products/new" className={btnClass("primary", "md")}>
            <Plus className="h-4 w-4" /> Täze haryt
          </Link>
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => resetPage(setQ)(e.target.value)} placeholder="Ady, markasy boýunça gözle..." className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <select value={category} onChange={(e) => resetPage(setCategory)(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="">Ähli kategoriýalar</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name} ({c.product_count})
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="">Ähli statuslar</option>
            <option value="active">Satuwda</option>
            <option value="inactive">Ýapyk</option>
          </select>
          <select value={sort} onChange={(e) => resetPage(setSort)(e.target.value)} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="newest">Täzeler</option>
            <option value="popular">Köp satylan</option>
            <option value="price_asc">Arzan → gymmat</option>
            <option value="price_desc">Gymmat → arzan</option>
            <option value="name">Ady</option>
          </select>
          <button onClick={() => resetPage(setLowStock)(!lowStock)} className={cn("h-10 rounded-xl border px-3 text-sm font-medium", lowStock ? "border-accent-500 bg-accent-50 text-accent-700" : "border-line bg-white")}>
            Az galan (≤10)
          </button>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorBox message={error} />
          </div>
        ) : loading && !data ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : (
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Haryt</th>
                <th className={th}>Kategoriýa</th>
                <th className={th}>Baha</th>
                <th className={th}>Galyndy</th>
                <th className={th}>Satyldy</th>
                <th className={th}>Meşhur</th>
                <th className={th}>Satuwda</th>
                <th className={cn(th, "text-right")}>Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((p) => (
                <tr key={p.id} className={cn("hover:bg-gray-50/70", !p.is_active && "opacity-60")}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <ProductImage image={p.image} emoji={p.emoji} name={p.name} color={p.category?.color} className="h-11 w-11 shrink-0 rounded-lg" emojiClassName="!text-2xl" />
                      <div className="min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="block truncate font-semibold hover:text-brand-700">
                          {p.name}
                        </Link>
                        <div className="truncate text-xs text-muted">
                          #{p.id} · {p.weight}
                          {p.brand && ` · ${p.brand}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <span className="text-xs">
                      {p.category?.emoji} {p.category?.name}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="font-semibold">{money(p.price)} m.</div>
                    {p.old_price > p.price && <div className="text-xs text-muted line-through">{money(p.old_price)}</div>}
                  </td>
                  <td className={td}>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 10 ? "bg-accent-100 text-accent-700" : "bg-brand-50 text-brand-700")}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className={cn(td, "text-muted")}>{p.sold}</td>
                  <td className={td}>
                    <button onClick={() => patch(p, { is_featured: !p.is_featured })} className={cn("rounded-lg p-1.5", p.is_featured ? "text-accent-500" : "text-gray-300 hover:text-accent-400")} aria-label="Meşhur">
                      <Star className="h-5 w-5" fill={p.is_featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className={td}>
                    <Toggle checked={p.is_active} onChange={(v) => patch(p, { is_active: v })} label="Satuwda" />
                  </td>
                  <td className={cn(td, "text-right")}>
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700" aria-label="Üýtget">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setDel(p)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Poz">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted">
                    Haryt tapylmady
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
        <AdminPagination meta={meta} onPage={setPage} />
      </Card>

      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title="Harydy pozmalymy?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDel(null)}>
              Ýok
            </Button>
            <Button variant="danger" onClick={remove} loading={busy}>
              Hawa, poz
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          <b>{del?.name}</b> pozular. Eger haryt sargytlarda bar bolsa, pozulman diňe satuwdan aýrylar.
        </p>
      </Modal>
    </div>
  );
}
