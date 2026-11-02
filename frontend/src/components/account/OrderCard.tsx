import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatDateTime, money } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import ProductImage from "@/components/product/ProductImage";

export default function OrderCard({ order, href }: { order: Order; href: string }) {
  const items = order.items ?? [];
  return (
    <Link href={href} className="block rounded-2xl bg-white p-4 shadow-card transition hover:shadow-card-hover sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold">Sargyt {order.number}</div>
          <div className="text-xs text-muted">{formatDateTime(order.created_at)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-2">
          {items.slice(0, 5).map((i) => (
            <ProductImage key={i.id} image={i.image} emoji={i.emoji} name={i.name} className="h-10 w-10 rounded-lg ring-2 ring-white" emojiClassName="!text-xl" />
          ))}
          {items.length > 5 && <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-xs font-semibold ring-2 ring-white">+{items.length - 5}</span>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted">{order.item_count} haryt</div>
            <div className="font-extrabold text-brand-600">{money(order.total)} manat</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </div>
      </div>
    </Link>
  );
}
