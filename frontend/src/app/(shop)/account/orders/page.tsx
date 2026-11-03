"use client";

import { useState } from "react";
import { useFetch } from "@/lib/hooks";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/lib/constants";
import OrderCard from "@/components/account/OrderCard";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function MyOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, meta, loading, error } = useFetch<Order[]>(`/api/orders?page=${page}&limit=10${status ? `&status=${status}` : ""}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Sargytlarym</h1>
        <div className="scroll-x flex gap-1.5">
          <button onClick={() => { setStatus(""); setPage(1); }} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", status === "" ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-card")}>
            Hemmesi
          </button>
          {ORDER_STATUS_LIST.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", status === s ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-card")}>
              {ORDER_STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : !data || data.length === 0 ? (
        <EmptyState emoji="📦" title="Sargyt ýok" text="Siz entek sargyt bermediňiz." action={{ href: "/catalog", label: "Söwda etmek" }} />
      ) : (
        <>
          <div className="space-y-3">
            {data.map((o) => (
              <OrderCard key={o.id} order={o} href={`/account/orders/${o.id}`} />
            ))}
          </div>
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-10 rounded-xl border border-line bg-card px-4 text-sm font-medium disabled:opacity-40">
                Öňki
              </button>
              <span className="text-sm text-muted">
                {meta.page} / {meta.total_pages}
              </span>
              <button disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)} className="h-10 rounded-xl border border-line bg-card px-4 text-sm font-medium disabled:opacity-40">
                Indiki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
