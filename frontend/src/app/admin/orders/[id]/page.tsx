"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Printer } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { Order } from "@/lib/types";
import { ErrorBox } from "@/components/admin/ui";
import StatusSelect from "@/components/admin/StatusSelect";
import OrderDetail from "@/components/account/OrderDetail";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { btnClass } from "@/components/ui/Button";

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error, reload } = useFetch<Order>(`/api/admin/orders/${id}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" /> Sargytlar
        </Link>
        <button onClick={() => window.print()} className={btnClass("ghost", "sm", "no-print")}>
          <Printer className="h-4 w-4" /> Çap et
        </button>
      </div>
      {error ? (
        <ErrorBox message={error} />
      ) : loading || !order ? (
        <TableSkeleton rows={5} />
      ) : (
        <OrderDetail
          order={order}
          actions={
            <div className="rounded-2xl bg-white p-5 shadow-card no-print">
              <h3 className="font-bold">Statusy üýtgetmek</h3>
              <div className="mt-3">
                <StatusSelect order={order} onChanged={reload} className="h-11 w-full text-sm" />
              </div>
              {order.user && (
                <div className="mt-4 border-t border-line pt-3 text-sm">
                  <div className="text-xs font-semibold uppercase text-muted">Müşderi hasaby</div>
                  <div className="mt-1 font-medium">{order.user.name}</div>
                  <a href={`mailto:${order.user.email}`} className="inline-flex items-center gap-1.5 text-brand-700 hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {order.user.email}
                  </a>
                  <div className="mt-1 text-xs text-muted">ID: {order.user.id}</div>
                </div>
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
