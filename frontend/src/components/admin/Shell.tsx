"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LayoutDashboard, LogOut, Menu, Package, ScrollText, ShoppingBag, Tags, Users, X } from "lucide-react";
import { isAdmin, useAuth } from "@/store/auth";
import Logo, { LogoMark } from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { btnClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dolandyryş paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Sargytlar", icon: ShoppingBag },
  { href: "/admin/products", label: "Harytlar", icon: Package },
  { href: "/admin/categories", label: "Kategoriýalar", icon: Tags },
  { href: "/admin/users", label: "Ulanyjylar", icon: Users },
  { href: "/admin/logs", label: "Loglar", icon: ScrollText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // close the mobile drawer on navigation (state adjustment during render, no effect)
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LogoMark size={48} className="animate-pulse" />
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md rounded-2xl bg-card p-8 text-center shadow-card">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-xl font-bold">Rugsat ýok</h1>
          <p className="mt-1 text-sm text-muted">Bu bölüm diňe administratorlar üçin. Siz {user.email} hökmünde girdiňiz.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/" className={btnClass("primary")}>
              Saýta geç
            </Link>
            <button onClick={logout} className={btnClass("outline")}>
              Çykmak
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nav = (
    <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin menýusy">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-brand-500 text-white shadow-sm" : "text-gray-300 hover:bg-white/10 hover:text-white")}>
            <n.icon className="h-4.5 w-4.5" /> {n.label}
          </Link>
        );
      })}
      <div className="pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-4.5 w-4.5" /> Saýta geç
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#15221a] text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo light />
        </div>
        {nav}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 font-bold">{user.name.charAt(0)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user.name}</div>
              <div className="truncate text-xs text-gray-400">{user.email}</div>
            </div>
            <button onClick={logout} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Çykmak">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#15221a] text-white shadow-2xl animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Logo light compact />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-300 hover:bg-white/10" aria-label="Ýap">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <button onClick={logout} className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-white/10">
              <LogOut className="h-4.5 w-4.5" /> Çykmak
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-card/95 px-4 backdrop-blur sm:px-6 lg:h-16">
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-gray-100 lg:hidden" aria-label="Menýu">
            <Menu className="h-5.5 w-5.5" />
          </button>
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <ThemeToggle />
            <span className="hidden text-muted sm:inline">Admin:</span>
            <span className="font-semibold">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
