import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Meta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions, padded = true }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode; padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl bg-card shadow-card", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          {title && <h2 className="font-bold">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon, tone = "green" }: { label: string; value: ReactNode; hint?: string; icon: ReactNode; tone?: "green" | "orange" | "blue" | "red" | "violet" }) {
  const tones = {
    green: "bg-brand-50 text-brand-600",
    orange: "bg-accent-100 text-accent-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", tones[tone])}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted">{label}</div>
        <div className="truncate text-xl font-extrabold">{value}</div>
        {hint && <div className="text-[11px] text-muted">{hint}</div>}
      </div>
    </div>
  );
}

export const th = "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";
export const td = "px-3 py-3 align-middle text-sm first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse">{children}</table>
    </div>
  );
}

export function AdminPagination({ meta, onPage }: { meta: Meta | null; onPage: (p: number) => void }) {
  if (!meta || meta.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm sm:px-5">
      <span className="text-muted">
        Jemi {meta.total} · sahypa {meta.page}/{meta.total_pages}
      </span>
      <div className="flex gap-1.5">
        <button disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-card disabled:opacity-40" aria-label="Öňki">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button disabled={meta.page >= meta.total_pages} onClick={() => onPage(meta.page + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-card disabled:opacity-40" aria-label="Indiki">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50", checked ? "bg-brand-500" : "bg-gray-300")}
    >
      <span className={cn("inline-block h-5 w-5 rounded-full bg-card shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
