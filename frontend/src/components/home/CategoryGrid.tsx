import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalog?category=${c.slug}`}
          className="group flex flex-col items-center rounded-card bg-white p-3 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-4"
        >
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl text-3xl transition-transform group-hover:scale-110 sm:h-16 sm:w-16 sm:text-4xl"
            style={{ background: `${c.color}1f` }}
          >
            {c.emoji}
          </span>
          <span className="mt-2.5 line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">{c.name}</span>
          <span className="mt-0.5 text-[11px] text-muted">{c.product_count} haryt</span>
        </Link>
      ))}
    </div>
  );
}
