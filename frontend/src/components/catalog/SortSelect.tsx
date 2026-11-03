"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";

export default function SortSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  const value = sp.get("sort") ?? "popular";
  return (
    <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm">
      <ArrowUpDown className="h-4 w-4 text-muted" />
      <span className="hidden text-muted sm:inline">Tertip:</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          next.set("sort", e.target.value);
          next.delete("page");
          router.push(`/catalog?${next.toString()}`);
        }}
        className="bg-transparent font-semibold text-ink focus:outline-none"
        aria-label="Tertipleşdirmek"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
