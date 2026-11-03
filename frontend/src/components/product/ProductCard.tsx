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
  const out = p.stock <= 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-card border border-line bg-card p-2 transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover sm:p-2.5",
        className,
      )}
    >
      <Link href={href} className="relative block overflow-hidden rounded-xl" tabIndex={-1} aria-hidden="true">
        <ProductImage image={p.image} emoji={p.emoji} name={p.name} color={p.category?.color} className={cn("aspect-square w-full rounded-xl", out && "opacity-60")} priority={priority} />

        {off > 0 && <span className="absolute bottom-2 left-2 rounded-lg bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">-{off}%</span>}
        {isNew && off === 0 && <span className="absolute bottom-2 left-2 rounded-lg bg-accent-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">Täze</span>}
        {out ? (
          <span className="absolute inset-x-2 top-2 rounded-lg bg-slate-800/85 px-2 py-1 text-center text-[11px] font-semibold text-white">Ammarda ýok</span>
        ) : (
          p.stock <= 5 && <span className="absolute right-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm">Az galdy</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        {p.brand ? (
          <span className="truncate text-[13px] font-bold leading-tight text-ink sm:text-sm">{p.brand}</span>
        ) : (
          p.category?.name && <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">{p.category.name}</span>
        )}
        <Link href={href} className="clamp-2 mt-0.5 min-h-[2.5em] text-[13px] leading-snug text-muted transition-colors hover:text-brand-700 sm:text-sm">
          {p.name}
        </Link>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
          <span className={cn("text-base font-extrabold tabular-nums sm:text-lg", off > 0 ? "text-red-600" : "text-ink")}>{money(p.price)} m.</span>
          {off > 0 && <span className="text-xs font-semibold tabular-nums text-gray-400 line-through">{money(p.old_price)} m.</span>}
        </div>

        <AddToCart product={p} size="sm" fullWidth className="mt-2" />
      </div>
    </article>
  );
}
