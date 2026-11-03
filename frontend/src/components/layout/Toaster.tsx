"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg animate-slide-up",
            t.type === "success" && "bg-slate-800 dark:bg-slate-700",
            t.type === "error" && "bg-red-600",
            t.type === "info" && "bg-brand-600",
          )}
        >
          {t.type === "success" && <CheckCircle2 className="h-4.5 w-4.5 text-brand-300" />}
          {t.type === "error" && <XCircle className="h-4.5 w-4.5" />}
          {t.type === "info" && <Info className="h-4.5 w-4.5" />}
          {t.message}
        </button>
      ))}
    </div>
  );
}
