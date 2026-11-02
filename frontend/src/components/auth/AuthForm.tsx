"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/ui";
import type { User } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { LogoMark } from "@/components/layout/Logo";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "";
  const login = useAuth((s) => s.login);
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace(next || (user.role === "admin" ? "/admin" : "/account"));
  }, [hydrated, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await api<{ token: string; user: User }>(path, { method: "POST", body, token: null });
      login(res.data.token, res.data.user);
      toast(mode === "login" ? `Hoş geldiňiz, ${res.data.user.name.split(" ")[0]}!` : "Hasabyňyz döredildi!");
      router.replace(next || (res.data.user.role === "admin" ? "/admin" : "/"));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors ?? {});
        toast(err.message, "error");
      } else {
        toast("Näsazlyk ýüze çykdy", "error");
      }
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isLogin = mode === "login";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={52} />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{isLogin ? "Içeri giriň" : "Hasap açyň"}</h1>
          <p className="mt-1 text-sm text-muted">{isLogin ? "E-poçta we parolyňyzy giriziň" : "Birnäçe sekuntda hasap dörediň"}</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isLogin && <Input label="Adyňyz" required value={form.name} onChange={set("name")} error={errors.name} placeholder="Merdan Annaýew" autoComplete="name" />}
          <Input label="E-poçta" required type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="siz@mail.com" autoComplete="email" inputMode="email" />
          {!isLogin && <Input label="Telefon (hökman däl)" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+993 65 123456" autoComplete="tel" />}
          <div className="relative">
            <Input
              label="Parol"
              required
              type={show ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              placeholder={isLogin ? "••••••••" : "Azyndan 6 simwol"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              className="pr-11"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-[38px] text-muted hover:text-ink" aria-label={show ? "Paroly gizle" : "Paroly görkez"}>
              {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {isLogin ? "Içeri gir" : "Hasap aç"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {isLogin ? (
            <>
              Hasabyňyz ýokmy?{" "}
              <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-600 hover:underline">
                Hasap açyň
              </Link>
            </>
          ) : (
            <>
              Eýýäm hasabyňyz barmy?{" "}
              <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-600 hover:underline">
                Içeri giriň
              </Link>
            </>
          )}
        </p>
      </div>

      {isLogin && process.env.NODE_ENV === "development" && (
        <div className="mt-4 rounded-xl border border-dashed border-accent-300 bg-accent-50 p-4 text-xs text-accent-800">
          <div className="font-bold">Synag hasaplary (diňe dev režimde görünýär)</div>
          <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
            <button type="button" className="rounded-lg bg-white px-2 py-1.5 text-left hover:bg-accent-100" onClick={() => setForm((f) => ({ ...f, email: "admin@azyksowda.com", password: "admin123" }))}>
              <b>Admin:</b> admin@azyksowda.com / admin123
            </button>
            <button type="button" className="rounded-lg bg-white px-2 py-1.5 text-left hover:bg-accent-100" onClick={() => setForm((f) => ({ ...f, email: "test@azyksowda.com", password: "test123" }))}>
              <b>Müşderi:</b> test@azyksowda.com / test123
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
