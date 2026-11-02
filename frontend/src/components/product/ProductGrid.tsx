import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  className?: string;
  cols?: "catalog" | "wide";
}

export default function ProductGrid({ products, className, cols = "wide" }: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4",
        cols === "wide" ? "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
