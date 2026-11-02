"use client";

import Link from "next/link";
import { AlertTriangle, Banknote, Clock, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { Stats } from "@/lib/types";
import { ACTION_LABEL, ORDER_STATUS } from "@/lib/constants";
import { formatDateTime, money, timeAgo } from "@/lib/format";
import { Card, ErrorBox, PageHeader, StatCard, Table, td, th } from "@/components/admin/ui";
import SalesChart from "@/components/admin/SalesChart";
import { StatusBadge } from "@/components/ui/Badge";
import ProductImage from "@/components/product/ProductImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: s, loading, error } = useFetch<Stats>("/api/admin/stats");

  if (error) return <ErrorBox message={error} />;
  if (loading || !s) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statusTotal = s.orders_by_status.reduce((a, r) => a + r.count, 0) || 1;

  return (
    <div className="space-y-5">
      <PageHeader title="Dolandyryş paneli" subtitle={`Soňky täzelenme: ${formatDateTime(new Date().toISOString())}`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Şu günki sargytlar" value={s.today_orders} hint={`${money(s.today_revenue)} manat`} icon={<ShoppingBag className="h-6 w-6" />} tone="green" />
        <StatCard label="Garaşylýan sargytlar" value={s.pending_orders} hint="tassyklamaly" icon={<Clock className="h-6 w-6" />} tone="orange" />
        <StatCard label="Jemi girdeji" value={`${money(s.revenue)} m.`} hint={`${s.orders} sargyt`} icon={<Banknote className="h-6 w-6" />} tone="blue" />
        <StatCard label="Ulanyjylar" value={s.users} hint={`${s.active_products}/${s.products} haryt satuwda`} icon={<Users className="h-6 w-6" />} tone="violet" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Soňky 7 günüň satuwy" actions={<TrendingUp className="h-4.5 w-4.5 text-brand-600" />}>
          <SalesChart days={s.sales_7d} />
        </Card>
        <Card title="Sargyt statuslary">
          <ul className="space-y-3">
            {(["pending", "confirmed", "delivering", "delivered", "cancelled"] as const).map((st) => {
              const row = s.orders_by_status.find((r) => r.status === st);
              const n = row?.count ?? 0;
              return (
                <li key={st}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", ORDER_STATUS[st].dot)} /> {ORDER_STATUS[st].label}
                    </span>
                    <b>{n}</b>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={cn("h-full rounded-full", ORDER_STATUS[st].dot)} style={{ width: `${(n / statusTotal) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/admin/orders?status=pending" className="mt-4 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700">
            Garaşylýan sargytlara geç →
          </Link>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Soňky sargytlar" padded={false} actions={<Link href="/admin/orders" className="text-sm font-semibold text-brand-600">Hemmesi</Link>}>
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Sargyt</th>
                <th className={th}>Müşderi</th>
                <th className={th}>Jemi</th>
                <th className={th}>Status</th>
                <th className={th}>Wagt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {s.recent_orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/70">
                  <td className={td}>
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className={td}>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted">{o.phone}</div>
                  </td>
                  <td className={cn(td, "font-semibold")}>{money(o.total)} m.</td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={cn(td, "text-muted")}>{timeAgo(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-5">
          <Card title="Az galan harytlar" actions={<AlertTriangle className="h-4.5 w-4.5 text-accent-600" />}>
            {s.low_stock.length === 0 ? (
              <p className="text-sm text-muted">Ähli harytlar ýeterlik.</p>
            ) : (
              <ul className="space-y-2.5">
                {s.low_stock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <ProductImage image={p.image} emoji={p.emoji} name={p.name} className="h-9 w-9 rounded-lg" emojiClassName="!text-lg" />
                    <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-brand-700">
                      {p.name}
                    </Link>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", p.stock === 0 ? "bg-red-100 text-red-700" : "bg-accent-100 text-accent-700")}>{p.stock} {p.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Iň köp satylanlar" actions={<Package className="h-4.5 w-4.5 text-brand-600" />}>
            <ul className="space-y-2.5">
              {s.top_products.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-muted">{i + 1}</span>
                  <ProductImage image={p.image} emoji={p.emoji} name={p.name} className="h-9 w-9 rounded-lg" emojiClassName="!text-lg" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted">{p.sold} satyldy</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Soňky hereketler" padded={false} actions={<Link href="/admin/logs" className="text-sm font-semibold text-brand-600">Ähli loglar</Link>}>
        <ul className="divide-y divide-line">
          {s.recent_logs.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm sm:px-5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", l.level === "warn" ? "bg-accent-500" : l.level === "error" ? "bg-red-500" : "bg-brand-500")} />
              <span className="w-32 shrink-0 truncate text-xs font-semibold text-muted">{ACTION_LABEL[l.action] ?? l.action}</span>
              <span className="min-w-0 flex-1 truncate">{l.message}</span>
              <span className="hidden shrink-0 text-xs text-muted sm:inline">{l.user_email}</span>
              <span className="shrink-0 text-xs text-muted">{timeAgo(l.created_at)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
