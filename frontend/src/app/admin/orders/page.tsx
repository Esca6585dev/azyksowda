"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { buildQuery } from "@/lib/api";
import { useDebounced, useFetch } from "@/lib/hooks";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/lib/constants";
import { formatDateTime, money } from "@/lib/format";
import { AdminPagination, Card, ErrorBox, PageHeader, Table, td, th } from "@/components/admin/ui";
import StatusSelect from "@/components/admin/StatusSelect";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  // admin pages mount client-side only (shell waits for auth hydration), so the URL can seed the filter
  const [status, setStatus] = useState<OrderStatus | "">(() => {
    if (typeof window === "undefined") return "";
    const s = new URLSearchParams(window.location.search).get("status") as OrderStatus | null;
    return s && ORDER_STATUS_LIST.includes(s) ? s : "";
  });
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [page, setPage] = useState(1);

  const path = `/api/admin/orders${buildQuery({ status, q: dq, page, limit: 20 })}`;
  const { data, meta, loading, error, reload } = useFetch<Order[]>(path);

  return (
    <div>
      <PageHeader title="Sargytlar" subtitle={meta ? `Jemi ${meta.total} sargyt` : undefined} />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
          <div className="scroll-x flex gap-1.5">
            <button onClick={() => { setStatus(""); setPage(1); }} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", status === "" ? "border-ink bg-ink text-white" : "border-line bg-white")}>
              Hemmesi
            </button>
            {ORDER_STATUS_LIST.map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", status === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
                {ORDER_STATUS[s].label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Belgi, at, telefon, salgy..." className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
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
                <th className={th}>Sargyt</th>
                <th className={th}>Müşderi</th>
                <th className={th}>Harytlar</th>
                <th className={th}>Jemi</th>
                <th className={th}>Töleg</th>
                <th className={th}>Status</th>
                <th className={cn(th, "text-right")}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/70">
                  <td className={td}>
                    <Link href={`/admin/orders/${o.id}`} className="font-bold text-brand-700 hover:underline">
                      {o.number}
                    </Link>
                    <div className="text-xs text-muted">{formatDateTime(o.created_at)}</div>
                  </td>
                  <td className={td}>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted">
                      {o.phone} {o.user?.email && `· ${o.user.email}`}
                    </div>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-1">
                      <span className="text-lg leading-none">{o.items?.slice(0, 4).map((i) => i.emoji).join("")}</span>
                      <span className="text-xs text-muted">{o.item_count} sany</span>
                    </div>
                  </td>
                  <td className={cn(td, "font-bold")}>{money(o.total)} m.</td>
                  <td className={cn(td, "text-xs text-muted")}>{o.payment_method === "card" ? "Kart" : "Nagt"}</td>
                  <td className={td}>
                    <StatusSelect order={o} onChanged={reload} />
                  </td>
                  <td className={cn(td, "text-right")}>
                    <Link href={`/admin/orders/${o.id}`} className="inline-grid rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700" aria-label="Gör">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">
                    Sargyt tapylmady
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
        <AdminPagination meta={meta} onPage={setPage} />
      </Card>
    </div>
  );
}
