"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBasket, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const user = useAuth((s) => s.user);
  const toggleCart = useUI((s) => s.toggleCart);
  const cartOpen = useUI((s) => s.cartOpen);

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted transition";
  const active = "text-brand-600";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-card/95 backdrop-blur pb-safe md:hidden" aria-label="Mobil menýu">
      <div className="flex items-stretch">
        <Link href="/" className={cn(item, pathname === "/" && active)}>
          <Home className="h-5.5 w-5.5" /> Baş sahypa
        </Link>
        <Link href="/catalog" className={cn(item, pathname.startsWith("/catalog") && active)}>
          <LayoutGrid className="h-5.5 w-5.5" /> Katalog
        </Link>
        <button onClick={toggleCart} className={cn(item, "relative", cartOpen && active)}>
          <span className="relative">
            <ShoppingBasket className="h-5.5 w-5.5" />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-2 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
          Sebet
        </button>
        <Link href={user ? "/account" : "/login"} className={cn(item, (pathname.startsWith("/account") || pathname === "/login") && active)}>
          <User className="h-5.5 w-5.5" /> {user ? "Hasabym" : "Giriş"}
        </Link>
      </div>
    </nav>
  );
}
