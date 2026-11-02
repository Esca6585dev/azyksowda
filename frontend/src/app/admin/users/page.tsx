"use client";

import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { api, ApiError, buildQuery } from "@/lib/api";
import { useDebounced, useFetch } from "@/lib/hooks";
import type { User } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { AdminPagination, Card, ErrorBox, PageHeader, Table, Toggle, td, th } from "@/components/admin/ui";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const me = useAuth((s) => s.user);
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const path = `/api/admin/users${buildQuery({ q: dq, role, page, limit: 20 })}`;
  const { data, meta, loading, error, reload } = useFetch<User[]>(path);

  const update = async (u: User, body: { role?: string; is_active?: boolean }) => {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PUT", body });
      toast("Ulanyjy täzelendi");
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    }
  };

  return (
    <div>
      <PageHeader title="Ulanyjylar" subtitle={meta ? `Jemi ${meta.total} ulanyjy` : undefined} />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Ady, e-poçta, telefon..." className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-line bg-white px-3 text-sm">
            <option value="">Ähli rollar</option>
            <option value="admin">Administrator</option>
            <option value="user">Müşderi</option>
          </select>
        </div>
        {error ? (
          <div className="p-4">
            <ErrorBox message={error} />
          </div>
        ) : loading && !data ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : (
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Ulanyjy</th>
                <th className={th}>Telefon</th>
                <th className={th}>Sargytlar</th>
                <th className={th}>Rol</th>
                <th className={th}>Işjeň</th>
                <th className={th}>Hasaba alnan</th>
                <th className={th}>Soňky giriş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className={cn("hover:bg-gray-50/70", !u.is_active && "opacity-60")}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-white", u.role === "admin" ? "bg-ink" : "bg-brand-500")}>{u.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {u.name} {u.role === "admin" && <ShieldCheck className="h-4 w-4 text-brand-600" />}
                            {self && <span className="text-[10px] text-muted">(siz)</span>}
                          </div>
                          <div className="truncate text-xs text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={cn(td, "text-muted")}>{u.phone || "—"}</td>
                    <td className={td}>{u.order_count ?? 0}</td>
                    <td className={td}>
                      <select value={u.role} disabled={self} onChange={(e) => update(u, { role: e.target.value })} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-semibold disabled:opacity-50">
                        <option value="user">Müşderi</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className={td}>
                      <Toggle checked={u.is_active} disabled={self} onChange={(v) => update(u, { is_active: v })} />
                    </td>
                    <td className={cn(td, "text-xs text-muted")}>{formatDate(u.created_at)}</td>
                    <td className={cn(td, "text-xs text-muted")}>{u.last_login ? formatDateTime(u.last_login) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <AdminPagination meta={meta} onPage={setPage} />
      </Card>
    </div>
  );
}
