import Link from "next/link";
import type { Product } from "@/lib/types";
import { money, discountPercent } from "@/lib/format";
import ProductImage from "./ProductImage";
import AddToCart from "./AddToCart";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  className?: string;
  priority?: boolean;
}

export default function ProductCard({ product: p, className, priority }: Props) {
  const off = discountPercent(p.price, p.old_price);
  // "new" badge for products added in the last 7 days; reading the clock here is intentional
  // eslint-disable-next-line react-hooks/purity
  const isNew = Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 7;
  const href = `/product/${p.slug}`;
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover", className)}>
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <ProductImage image={p.image} emoji={p.emoji} name={p.name} color={p.category?.color} className="aspect-[4/3] w-full" priority={priority} />
      </Link>

      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {off > 0 && <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">-{off}%</span>}
        {isNew && off === 0 && <span className="rounded-md bg-accent-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">Täze</span>}
        {p.stock > 0 && p.stock <= 5 && <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 shadow">Az galdy</span>}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {p.category?.name && <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{p.category.name}</span>}
        <Link href={href} className="clamp-2 text-[15px] font-semibold leading-snug text-ink hover:text-brand-700">
          {p.name}
        </Link>
        <div className="text-xs text-muted">
          {p.weight || p.unit}
          {p.brand && <span className="before:mx-1 before:content-['·']">{p.brand}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="leading-tight">
            <div className="text-lg font-extrabold text-brand-600">
              {money(p.price)} <span className="text-xs font-semibold text-muted">manat</span>
            </div>
            {off > 0 && <div className="text-xs text-muted line-through">{money(p.old_price)} manat</div>}
          </div>
          <AddToCart product={p} size="sm" />
        </div>
      </div>
    </article>
  );
}
