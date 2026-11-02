import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { btnClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Logo />
      <div className="mt-10 text-7xl">🥕</div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Sahypa tapylmady</h1>
      <p className="mt-2 max-w-sm text-muted">Gözleýän sahypaňyz ýok ýa-da başga ýere göçürilen bolmagy mümkin.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className={btnClass("primary")}>
          Baş sahypa
        </Link>
        <Link href="/catalog" className={btnClass("outline")}>
          Katalog
        </Link>
      </div>
    </div>
  );
}
