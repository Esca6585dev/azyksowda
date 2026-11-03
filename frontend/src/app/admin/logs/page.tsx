"use client";

import { Fragment, useState } from "react";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import { buildQuery } from "@/lib/api";
import { useDebounced, useFetch } from "@/lib/hooks";
import type { ActivityLog } from "@/lib/types";
import { ACTION_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { AdminPagination, Card, ErrorBox, PageHeader, Table, td, th } from "@/components/admin/ui";
import Button from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

function pretty(details: string) {
  try {
    return JSON.stringify(JSON.parse(details), null, 2);
  } catch {
    return details;
  }
}

export default function AdminLogsPage() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [action, setAction] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<number | null>(null);
  const path = `/api/admin/logs${buildQuery({ q: dq, action, level, page, limit: 50 })}`;
  const { data, meta, actions, loading, error, reload } = useFetch<ActivityLog[]>(path);

  return (
    <div>
      <PageHeader
        title="Hereket loglary"
        subtitle="Giriş, sargyt, haryt we beýleki ähli amallaryň taryhy"
        actions={
          <Button variant="soft" size="sm" onClick={reload}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Täzele
          </Button>
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="E-poçta, habar, IP..." className="h-10 w-full rounded-xl border border-line pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" />
          </div>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="h-10 max-w-[220px] rounded-xl border border-line bg-card px-3 text-sm">
            <option value="">Ähli hereketler</option>
            <option value="auth.*">Giriş / hasap</option>
            <option value="order.*">Sargytlar</option>
            <option value="product.*">Harytlar</option>
            <option value="category.*">Kategoriýalar</option>
            <option value="user.*">Ulanyjylar</option>
            <optgroup label="Anyk">
              {actions?.map((a) => (
                <option key={a} value={a}>
                  {ACTION_LABEL[a] ?? a}
                </option>
              ))}
            </optgroup>
          </select>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-line bg-card px-3 text-sm">
            <option value="">Ähli derejeler</option>
            <option value="info">Info</option>
            <option value="warn">Duýduryş</option>
            <option value="error">Ýalňyşlyk</option>
          </select>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorBox message={error} />
          </div>
        ) : loading && !data ? (
          <div className="p-4">
            <TableSkeleton rows={10} />
          </div>
        ) : (
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Wagt</th>
                <th className={th}>Dereje</th>
                <th className={th}>Hereket</th>
                <th className={th}>Ulanyjy</th>
                <th className={th}>Habar</th>
                <th className={th}>IP</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((l) => (
                <Fragment key={l.id}>
                  <tr className="hover:bg-gray-50/70">
                    <td className={cn(td, "whitespace-nowrap text-xs text-muted")}>{formatDateTime(l.created_at)}</td>
                    <td className={td}>
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold uppercase", l.level === "warn" ? "bg-accent-100 text-accent-700" : l.level === "error" ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700")}>{l.level}</span>
                    </td>
                    <td className={td}>
                      <div className="text-sm font-semibold">{ACTION_LABEL[l.action] ?? l.action}</div>
                      <div className="font-mono text-[11px] text-muted">
                        {l.action}
                        {l.entity && ` · ${l.entity}#${l.entity_id}`}
                      </div>
                    </td>
                    <td className={cn(td, "text-xs")}>{l.user_email || <span className="text-muted">—</span>}</td>
                    <td className={cn(td, "max-w-md")}>
                      <div className="truncate">{l.message}</div>
                    </td>
                    <td className={cn(td, "font-mono text-xs text-muted")}>{l.ip}</td>
                    <td className={td}>
                      {(l.details || l.user_agent) && (
                        <button onClick={() => setOpen(open === l.id ? null : l.id)} className="rounded-lg p-1.5 text-muted hover:bg-gray-100" aria-label="Jikme-jik">
                          <ChevronDown className={cn("h-4 w-4 transition-transform", open === l.id && "rotate-180")} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === l.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-5 py-3">
                        {l.details && <pre className="overflow-x-auto rounded-lg bg-[#111714] p-3 text-xs text-green-200">{pretty(l.details)}</pre>}
                        {l.user_agent && <div className="mt-2 text-xs text-muted">UA: {l.user_agent}</div>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted">
                    Log tapylmady
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
        <AdminPagination meta={meta} onPage={setPage} />
      </Card>
    </div>
  );
}
