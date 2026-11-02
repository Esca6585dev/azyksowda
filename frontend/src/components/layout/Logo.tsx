import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="48" height="48" rx="12" fill="#2e9e44" />
      <path d="M11 20h26l-2.6 14.2a2.4 2.4 0 0 1-2.4 2H16a2.4 2.4 0 0 1-2.4-2L11 20z" fill="#fff" />
      <path d="M19 20l4.5-8M29 20l-4.5-8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 26h14M18 30h12" stroke="#2e9e44" strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
      <circle cx="35.5" cy="11.5" r="5" fill="#f59e0b" />
      <path d="M35.5 7.2c2.2 1.6 2.2 6.6 0 8.6" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ light = false, className, compact = false }: { light?: boolean; className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 select-none", className)} aria-label="AzykSowda — baş sahypa">
      <LogoMark size={compact ? 32 : 36} />
      <span className={cn("font-extrabold tracking-tight leading-none", compact ? "text-lg" : "text-xl sm:text-2xl")}>
        <span className={light ? "text-white" : "text-brand-600"}>Azyk</span>
        <span className="text-accent-500">Sowda</span>
      </span>
    </Link>
  );
}
