import Link from "next/link";
import { btnClass } from "./Button";
import { cn } from "@/lib/utils";

interface Props {
  emoji?: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
  className?: string;
}

export default function EmptyState({ emoji = "🧺", title, text, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card bg-card px-6 py-14 text-center shadow-card", className)}>
      <div className="text-5xl">{emoji}</div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && (
        <Link href={action.href} className={btnClass("primary", "md", "mt-5")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
