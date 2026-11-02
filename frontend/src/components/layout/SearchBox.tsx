"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import ProductImage from "@/components/product/ProductImage";
import { cn } from "@/lib/utils";

interface Props {
  size?: "md" | "lg";
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export default function SearchBox({ size = "md", className, autoFocus, placeholder = "Haryt gözle: süýt, çörek, alma..." }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const spQ = sp.get("q") ?? "";
  const [q, setQ] = useState(spQ);
  const [prevSpQ, setPrevSpQ] = useState(spQ);
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // keep the input in sync when the URL ?q= changes (navigation), without an effect
  if (spQ !== prevSpQ) {
    setPrevSpQ(spQ);
    setQ(spQ);
  }

  const term = q.trim();
  const visibleItems = term.length >= 2 ? items : [];

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api<Product[]>(`/api/products/suggest?q=${encodeURIComponent(term)}`);
        if (!cancelled) setItems(res.data ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [term]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = q.trim();
    setOpen(false);
    router.push(term ? `/catalog?q=${encodeURIComponent(term)}` : "/catalog");
  };

  const big = size === "lg";
  const showList = open && term.length >= 2;

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <Search className={cn("pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted", big ? "h-5 w-5" : "h-4.5 w-4.5")} />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className={cn(
            "w-full rounded-xl border border-line bg-white text-ink placeholder:text-gray-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden",
            big ? "h-13 pl-11 pr-28 text-base" : "h-10 pl-10 pr-20 text-sm",
          )}
          aria-label="Gözleg"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setItems([]);
            }}
            className={cn("absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-gray-100", big ? "right-24" : "right-16")}
            aria-label="Arassala"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-brand-500 font-semibold text-white transition hover:bg-brand-600",
            big ? "h-10 px-4 text-sm" : "h-7 px-3 text-xs",
          )}
        >
          Gözle
        </button>
      </form>

      {showList && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-card-hover animate-fade-in">
          {visibleItems.length === 0 ? (
            <div className="px-4 py-5 text-sm text-muted">{loading ? "Gözlenýär..." : "Hiç zat tapylmady"}</div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {visibleItems.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-brand-50"
                  >
                    <ProductImage image={p.image} emoji={p.emoji} name={p.name} className="h-11 w-11 shrink-0 rounded-lg" emojiClassName="!text-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{p.name}</div>
                      <div className="text-xs text-muted">{p.weight}</div>
                    </div>
                    <div className="text-sm font-bold text-brand-600">{money(p.price)} m.</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => submit()} className="flex w-full items-center justify-between border-t border-line px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            &quot;{q.trim()}&quot; boýunça ähli netijeler
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
