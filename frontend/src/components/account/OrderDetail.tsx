"use client";

import Link from "next/link";
import { Banknote, Check, CreditCard, MapPin, Phone, StickyNote, User } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUS, ORDER_STATUS_LIST } from "@/lib/constants";
import { formatDateTime, money } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import ProductImage from "@/components/product/ProductImage";
import { cn } from "@/lib/utils";

const FLOW: OrderStatus[] = ["pending", "confirmed", "delivering", "delivered"];

export default function OrderDetail({ order, actions }: { order: Order; actions?: React.ReactNode }) {
  const idx = FLOW.indexOf(order.status);
  const cancelled = order.status === "cancelled";
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">Sargyt {order.number}</h2>
              <div className="text-sm text-muted">{formatDateTime(order.created_at)}</div>
            </div>
            <StatusBadge status={order.status} className="text-sm" />
          </div>

          {cancelled ? (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Bu sargyt ýatyryldy. Harytlaryň galyndysy ammara gaýtaryldy.</div>
          ) : (
            <ol className="mt-5 grid grid-cols-4 gap-1">
              {FLOW.map((s, i) => {
                const done = i <= idx;
                return (
                  <li key={s} className="relative text-center">
                    {i > 0 && <span className={cn("absolute left-[-50%] right-[50%] top-3.5 h-0.5", i <= idx ? "bg-brand-500" : "bg-gray-200")} />}
                    <span className={cn("relative mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold ring-4 ring-card", done ? "bg-brand-500 text-white" : "bg-gray-200 text-muted")}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={cn("mt-1.5 block text-[11px] font-medium sm:text-xs", done ? "text-brand-700" : "text-muted")}>{ORDER_STATUS[s].label}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rounded-2xl bg-card shadow-card">
          <div className="border-b border-line px-5 py-3 font-bold">Harytlar ({order.item_count})</div>
          <ul className="divide-y divide-line">
            {order.items?.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-5 py-3">
                <Link href={`/product/${i.slug}`}>
                  <ProductImage image={i.image} emoji={i.emoji} name={i.name} className="h-14 w-14 rounded-xl" emojiClassName="!text-3xl" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${i.slug}`} className="clamp-2 text-sm font-semibold hover:text-brand-700">
                    {i.name}
                  </Link>
                  <div className="text-xs text-muted">
                    {i.weight} · {i.quantity} × {money(i.price)} manat
                  </div>
                </div>
                <div className="font-bold">{money(i.total)} m.</div>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Harytlar</dt>
              <dd>{money(order.subtotal)} manat</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Eltip bermek</dt>
              <dd>{order.delivery_fee === 0 ? "Mugt" : `${money(order.delivery_fee)} manat`}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <dt>Jemi</dt>
              <dd className="text-brand-600">{money(order.total)} manat</dd>
            </div>
          </dl>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="font-bold">Eltip bermek</h3>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li className="flex gap-2.5">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted" /> {order.name}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                {order.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" /> {order.address}
            </li>
            {order.note && (
              <li className="flex gap-2.5">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted" /> {order.note}
              </li>
            )}
            <li className="flex gap-2.5">
              {order.payment_method === "card" ? <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted" /> : <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-muted" />}
              {order.payment_method === "card" ? "Bank karty (eltilende)" : "Nagt (eltilende)"}
            </li>
          </ul>
        </div>
        {actions}
        <div className="rounded-2xl bg-card p-5 text-xs text-muted shadow-card">
          Statuslar: {ORDER_STATUS_LIST.map((s) => ORDER_STATUS[s].label).join(" → ")}
        </div>
      </aside>
    </div>
  );
}
