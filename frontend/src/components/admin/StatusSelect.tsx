"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/lib/constants";
import { toast } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function StatusSelect({ order, onChanged, className }: { order: Order; onChanged?: (o: Order) => void; className?: string }) {
  const [busy, setBusy] = useState(false);
  const s = ORDER_STATUS[order.status];
  const locked = order.status === "cancelled";
  return (
    <select
      value={order.status}
      disabled={busy || locked}
      onChange={async (e) => {
        const status = e.target.value as OrderStatus;
        if (status === "cancelled" && !confirm(`${order.number} sargydy ýatyrmalymy? Harytlar ammara gaýtarylar.`)) return;
        setBusy(true);
        try {
          const res = await api<Order>(`/api/admin/orders/${order.id}/status`, { method: "PUT", body: { status } });
          toast(`${order.number}: ${ORDER_STATUS[status].label}`);
          onChanged?.(res.data);
        } catch (err) {
          toast(err instanceof ApiError ? err.message : "Näsazlyk", "error");
        } finally {
          setBusy(false);
        }
      }}
      className={cn("h-9 rounded-lg border px-2.5 text-xs font-semibold ring-1 ring-inset focus:outline-none disabled:opacity-60", s.color, "border-transparent", className)}
      aria-label="Sargyt statusy"
    >
      {ORDER_STATUS_LIST.map((st) => (
        <option key={st} value={st}>
          {ORDER_STATUS[st].label}
        </option>
      ))}
    </select>
  );
}
