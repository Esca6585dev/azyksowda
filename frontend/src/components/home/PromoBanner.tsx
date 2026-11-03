import Link from "next/link";
import { btnClass } from "@/components/ui/Button";

export default function PromoBanner({ freeFrom }: { freeFrom: number }) {
  return (
    <div className="wrap py-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 p-6 text-white shadow-card sm:p-8">
          <span className="absolute -right-6 -top-6 text-[120px] opacity-20 select-none" aria-hidden="true">🚚</span>
          <h3 className="relative text-xl font-extrabold sm:text-2xl">Mugt eltip bermek</h3>
          <p className="relative mt-1 max-w-xs text-sm text-white/90 sm:text-base">{freeFrom} manatdan ýokary ähli sargytlara eltip bermek mugt.</p>
          <Link href="/catalog" className={btnClass("ghost", "md", "relative mt-4 bg-card text-accent-700 hover:bg-accent-50 hover:text-accent-700")}>
            Söwda etmek
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-6 text-white shadow-card sm:p-8">
          <span className="absolute -right-6 -top-6 text-[120px] opacity-20 select-none" aria-hidden="true">🥗</span>
          <h3 className="relative text-xl font-extrabold sm:text-2xl">Her gün täze önümler</h3>
          <p className="relative mt-1 max-w-xs text-sm text-white/90 sm:text-base">Miweler we gök önümler her säher ýerli bazardan getirilýär.</p>
          <Link href="/catalog?category=gok-onumler" className={btnClass("ghost", "md", "relative mt-4 bg-card text-brand-700 hover:bg-brand-50 hover:text-brand-700")}>
            Gök önümler
          </Link>
        </div>
      </div>
    </div>
  );
}
