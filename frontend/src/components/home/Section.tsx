import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ title, subtitle, href, linkLabel = "Hemmesi", children, className, id }: Props) {
  return (
    <section id={id} className={cn("wrap py-8 sm:py-10", className)}>
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            {linkLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
