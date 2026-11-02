"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/ui";
import type { User } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const user = useAuth((s) => s.user)!;
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address, current_password: "", new_password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<User>("/api/auth/me").then((r) => setUser(r.data)).catch(() => {});
  }, [setUser]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await api<User>("/api/auth/profile", { method: "PUT", body: form });
      setUser(res.data);
      setForm((f) => ({ ...f, current_password: "", new_password: "" }));
      toast("Profil täzelendi");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors ?? {});
        toast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { l: "Sargytlar", v: user.order_count ?? 0 },
          { l: "Hasap açylan", v: formatDate(user.created_at) },
          { l: "Rol", v: user.role === "admin" ? "Administrator" : "Müşderi" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-white p-4 shadow-card">
            <div className="text-xs text-muted">{s.l}</div>
            <div className="mt-1 text-lg font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-bold">Şahsy maglumatlar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Adyňyz" required value={form.name} onChange={set("name")} error={errors.name} />
          <Input label="E-poçta" value={user.email} disabled hint="E-poçtany üýtgedip bolmaýar" />
          <Input label="Telefon" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+993 65 123456" />
          <Input label="Salgy" value={form.address} onChange={set("address")} error={errors.address} placeholder="Aşgabat, ..." />
        </div>

        <h2 className="mt-8 text-lg font-bold">Paroly üýtgetmek</h2>
        <p className="text-sm text-muted">Üýtgetmek islemeseňiz boş goýuň.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Häzirki parol" type="password" value={form.current_password} onChange={set("current_password")} error={errors.current_password} autoComplete="current-password" />
          <Input label="Täze parol" type="password" value={form.new_password} onChange={set("new_password")} error={errors.new_password} autoComplete="new-password" minLength={6} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={loading}>
            Ýatda sakla
          </Button>
        </div>
      </form>
    </div>
  );
}
