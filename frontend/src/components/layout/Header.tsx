"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Package, Percent, Phone, ShoppingBasket, Sparkles, User, X } from "lucide-react";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import { imgUrl } from "@/lib/api";
import { useCart } from "@/store/cart";
import { isAdmin, useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import type { Category, SiteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
  site: SiteConfig;
}

const NAV = [
  { href: "/", label: "Baş sahypa" },
  { href: "/catalog", label: "Katalog" },
  { href: "/catalog?discount=1", label: "Arzanladyşlar", icon: Percent },
  { href: "/catalog?sort=newest", label: "Täze harytlar", icon: Sparkles },
  { href: "/contact", label: "Habarlaşmak" },
];

export default function Header({ categories, site }: Props) {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const toggleCart = useUI((s) => s.toggleCart);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    setMenu(false);
  }, [pathname, setMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const doLogout = () => {
    logout();
    setUserOpen(false);
    setMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      {/* top row */}
      <div className="wrap flex h-16 items-center gap-3 sm:gap-5">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-gray-100 md:hidden"
          onClick={() => setMenu(!menuOpen)}
          aria-label="Menýu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Logo />

        <div className="hidden flex-1 md:block md:max-w-xl lg:max-w-2xl">
          <Suspense fallback={<div className="h-10 rounded-xl bg-gray-100" />}>
            <SearchBox />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-50 xl:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Phone className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-medium text-muted">Sargyt üçin</span>
              {site.phone}
            </span>
          </a>

          {/* user */}
          {hydrated && user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold hover:bg-brand-50"
                aria-haspopup="menu"
                aria-expanded={userOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white">{user.name.charAt(0).toUpperCase()}</span>
                <span className="max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-card py-1.5 shadow-card-hover animate-fade-in" role="menu">
                    <div className="border-b border-line px-4 py-2.5">
                      <div className="truncate text-sm font-semibold">{user.name}</div>
                      <div className="truncate text-xs text-muted">{user.email}</div>
                    </div>
                    <Link href="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50" role="menuitem">
                      <User className="h-4 w-4 text-muted" /> Hasabym
                    </Link>
                    <Link href="/account/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50" role="menuitem">
                      <Package className="h-4 w-4 text-muted" /> Sargytlarym
                    </Link>
                    {isAdmin(user) && (
                      <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50" role="menuitem">
                        <LayoutDashboard className="h-4 w-4" /> Admin panel
                      </Link>
                    )}
                    <button onClick={doLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem">
                      <LogOut className="h-4 w-4" /> Çykmak
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden h-10 items-center gap-2 rounded-xl border border-brand-500 px-4 text-sm font-semibold text-brand-600 transition hover:bg-brand-500 hover:text-white md:inline-flex">
              <User className="h-4 w-4" /> Içeri gir
            </Link>
          )}

          {/* cart */}
          <button
            onClick={toggleCart}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100 sm:h-11 sm:w-11"
            aria-label={`Sebet, ${count} haryt`}
          >
            <ShoppingBasket className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white shadow animate-fade-in">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* mobile search */}
      <div className="wrap pb-3 md:hidden">
        <Suspense fallback={<div className="h-10 rounded-xl bg-gray-100" />}>
          <SearchBox />
        </Suspense>
      </div>

      {/* desktop nav */}
      <nav className="hidden border-t border-line md:block" aria-label="Esasy menýu">
        <div className="wrap flex h-11 items-center gap-1">
          <div className="group relative">
            <button className="flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-3.5 text-sm font-semibold text-white">
              <Menu className="h-4 w-4" /> Kategoriýalar
              <ChevronDown className="h-4 w-4 opacity-80" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[640px] translate-y-1 rounded-xl border border-line bg-card p-3 opacity-0 shadow-card-hover transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid grid-cols-2 gap-1">
                {categories.map((c) => (
                  <Link key={c.id} href={`/catalog?category=${c.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-brand-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg text-xl" style={{ background: `${c.color}1f` }}>
                      {imgUrl(c.image) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl(c.image)!} alt="" loading="lazy" className="photo-tile h-full w-full object-contain p-0.5" />
                      ) : (
                        c.emoji
                      )}
                    </span>
                    <span className="flex-1 font-medium">{c.name}</span>
                    <span className="text-xs text-muted">{c.product_count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href.split("?")[0]) && !n.href.includes("?");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn("flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-brand-50 hover:text-brand-700", active && "text-brand-700")}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {n.label}
              </Link>
            );
          })}
          <span className="ml-auto hidden text-xs text-muted lg:block">{site.work_hours}</span>
        </div>
      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[116px] z-40 overflow-y-auto bg-card md:hidden animate-fade-in">
          <div className="wrap py-4">
            {hydrated && user ? (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-lg font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{user.name}</div>
                  <div className="truncate text-xs text-muted">{user.email}</div>
                </div>
                <button onClick={doLogout} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Çykmak">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Link href="/login" className="flex h-11 items-center justify-center rounded-xl border border-brand-500 font-semibold text-brand-600">
                  Içeri gir
                </Link>
                <Link href="/register" className="flex h-11 items-center justify-center rounded-xl bg-brand-500 font-semibold text-white">
                  Hasap aç
                </Link>
              </div>
            )}

            <ul className="divide-y divide-line rounded-xl border border-line">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex items-center px-4 py-3 font-medium">
                    {n.label}
                  </Link>
                </li>
              ))}
              {hydrated && user && (
                <>
                  <li>
                    <Link href="/account/orders" className="flex items-center px-4 py-3 font-medium">
                      Sargytlarym
                    </Link>
                  </li>
                  {isAdmin(user) && (
                    <li>
                      <Link href="/admin" className="flex items-center px-4 py-3 font-semibold text-brand-700">
                        Admin panel
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <h4 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-muted">Kategoriýalar</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link key={c.id} href={`/catalog?category=${c.slug}`} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm font-medium">
                  <span className="text-xl">{c.emoji}</span>
                  <span className="truncate">{c.name}</span>
                </Link>
              ))}
            </div>

            <ThemeToggle withLabel className="mt-6" />

            <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-muted">
              <div className="font-semibold text-ink">{site.phone}</div>
              <div>{site.work_hours}</div>
              <div className="mt-1">{site.address}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
