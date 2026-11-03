import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Meta } from "@/lib/types";

interface Props {
  meta: Meta;
  /** Builds the href for a page number. */
  hrefFor: (page: number) => string;
  className?: string;
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ meta, hrefFor, className }: Props) {
  if (!meta || meta.total_pages <= 1) return null;
  const { page, total_pages } = meta;
  const items = pageList(page, total_pages);
  const btn = "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-line bg-card px-3 text-sm font-medium transition hover:border-brand-400 hover:text-brand-700";
  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-1.5", className)} aria-label="Sahypalar">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={btn} aria-label="Öňki">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btn, "opacity-40")}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}
      {items.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={cn(btn, p === page && "border-brand-500 bg-brand-500 text-white hover:text-white")} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        ),
      )}
      {page < total_pages ? (
        <Link href={hrefFor(page + 1)} className={btn} aria-label="Indiki">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(btn, "opacity-40")}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
