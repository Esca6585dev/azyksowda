"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut, Package, User as UserIcon } from "lucide-react";
import { isAdmin, useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account", label: "Profil", icon: UserIcon, exact: true },
  { href: "/account/orders", label: "Sargytlarym", icon: Package },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) {
    return (
      <div className="wrap py-8">
        <div className="h-72 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div className="wrap py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-500 text-lg font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <div className="truncate font-bold">{user.name}</div>
              <div className="truncate text-xs text-muted">{user.email}</div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-card p-2 shadow-card lg:flex-col" aria-label="Hasap menýusy">
            {TABS.map((t) => {
              const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition", active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-gray-50 hover:text-ink")}>
                  <t.icon className="h-4.5 w-4.5" /> {t.label}
                </Link>
              );
            })}
            {isAdmin(user) && (
              <Link href="/admin" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                <LayoutDashboard className="h-4.5 w-4.5" /> Admin panel
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 lg:mt-2"
            >
              <LogOut className="h-4.5 w-4.5" /> Çykmak
            </button>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
