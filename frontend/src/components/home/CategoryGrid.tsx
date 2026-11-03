import Link from "next/link";
import type { Category } from "@/lib/types";
import { imgUrl } from "@/lib/api";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
      {categories.map((c) => {
        const src = imgUrl(c.image);
        return (
          <Link
            key={c.id}
            href={`/catalog?category=${c.slug}`}
            className="group flex flex-col items-center rounded-card border border-line bg-card p-2.5 text-center transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:p-3"
          >
            <span className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl" style={{ background: `${c.color}14` }}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" loading="lazy" className="photo-tile h-[82%] w-[82%] rounded-lg object-contain p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <span className="text-4xl transition-transform group-hover:scale-110 sm:text-5xl">{c.emoji}</span>
              )}
              <span className="absolute left-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card/90 text-base shadow-sm">{c.emoji}</span>
            </span>
            <span className="mt-2 line-clamp-2 text-xs font-semibold leading-tight sm:text-sm">{c.name}</span>
            <span className="mt-0.5 text-[11px] text-muted">{c.product_count} haryt</span>
          </Link>
        );
      })}
    </div>
  );
}
