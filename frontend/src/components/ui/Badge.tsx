import { cn } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function Badge({ children, className, tone = "neutral" }: { children: React.ReactNode; className?: string; tone?: "neutral" | "green" | "orange" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    green: "bg-brand-50 text-brand-700",
    orange: "bg-accent-100 text-accent-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", s.color, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
