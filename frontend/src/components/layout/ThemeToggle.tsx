"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Ak tema" : "Gara tema";
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full text-ink transition hover:bg-gray-100",
        withLabel ? "h-11 w-full rounded-xl border border-line px-4 text-sm font-medium" : "h-10 w-10",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <span className="relative grid h-5 w-5 place-items-center">
        <Sun className={cn("absolute h-5 w-5 transition-all", dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
        <Moon className={cn("absolute h-5 w-5 transition-all", dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
      </span>
      {withLabel && <span>{label}</span>}
    </button>
  );
}
