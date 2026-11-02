"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { Category } from "@/lib/types";
import { toast } from "@/store/ui";
import { Card, ErrorBox, PageHeader, Table, Toggle, td, th } from "@/components/admin/ui";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Checkbox, Input, Textarea } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface CatForm {
  name: string;
  emoji: string;
  color: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}
const empty: CatForm = { name: "", emoji: "🧺", color: "#2e9e44", description: "", sort_order: 0, is_active: true };

export default function AdminCategoriesPage() {
  const { data, loading, error, reload } = useFetch<Category[]>("/api/admin/categories");
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [form, setForm] = useState<CatForm>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<Category | null>(null);

  const open = (c: Category | "new") => {
    setEditing(c);
    setErrors({});
    setForm(c === "new" ? { ...empty, sort_order: (data?.length ?? 0) + 1 } : { name: c.name, emoji: c.emoji, color: c.color || "#2e9e44", description: c.description, sort_order: c.sort_order, is_active: c.is_active });
  };

  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      if (editing === "new") {
        await api("/api/admin/categories", { method: "POST", body: form });
        toast("Kategoriýa goşuldy");
      } else if (editing) {
        await api(`/api/admin/categories/${editing.id}`, { method: "PUT", body: form });
        toast("Kategoriýa täzelendi");
      }
      setEditing(null);
      reload();
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.errors ?? {});
        toast(e.message, "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (c: Category, v: boolean) => {
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "PUT", body: { name: c.name, emoji: c.emoji, color: c.color, description: c.description, sort_order: c.sort_order, image: c.image, is_active: v } });
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    }
  };

  const remove = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await api(`/api/admin/categories/${del.id}`, { method: "DELETE" });
      toast("Kategoriýa pozuldy", "info");
      setDel(null);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategoriýalar"
        subtitle={data ? `${data.length} kategoriýa` : undefined}
        actions={
          <Button onClick={() => open("new")}>
            <Plus className="h-4 w-4" /> Täze kategoriýa
          </Button>
        }
      />
      <Card padded={false}>
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
                <th className={th}>#</th>
                <th className={th}>Kategoriýa</th>
                <th className={th}>Slug</th>
                <th className={th}>Harytlar</th>
                <th className={th}>Reňk</th>
                <th className={th}>Işjeň</th>
                <th className={cn(th, "text-right")}>Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.map((c) => (
                <tr key={c.id} className={cn("hover:bg-gray-50/70", !c.is_active && "opacity-60")}>
                  <td className={cn(td, "text-muted")}>{c.sort_order}</td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg text-2xl" style={{ background: `${c.color}1f` }}>
                        {c.emoji}
                      </span>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="max-w-xs truncate text-xs text-muted">{c.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className={cn(td, "font-mono text-xs text-muted")}>{c.slug}</td>
                  <td className={td}>{c.product_count}</td>
                  <td className={td}>
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span className="h-4 w-4 rounded-full border border-line" style={{ background: c.color }} /> {c.color}
                    </span>
                  </td>
                  <td className={td}>
                    <Toggle checked={c.is_active} onChange={(v) => toggle(c, v)} />
                  </td>
                  <td className={cn(td, "text-right")}>
                    <div className="inline-flex gap-1">
                      <button onClick={() => open(c)} className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700" aria-label="Üýtget">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDel(c)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Poz">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Täze kategoriýa" : "Kategoriýany üýtgetmek"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Ýatyr
            </Button>
            <Button onClick={save} loading={busy}>
              Ýatda sakla
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_90px]">
          <Input label="Ady" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="text-center text-xl" maxLength={4} />
          <div className="sm:col-span-2">
            <Textarea label="Beýany" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Reňk</span>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-11 w-14 cursor-pointer rounded-lg border border-line" />
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-11 flex-1 rounded-xl border border-line px-3 font-mono text-sm" />
            </div>
          </label>
          <Input label="Tertip" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} />
          <div className="sm:col-span-2">
            <Checkbox label="Işjeň (saýtda görkez)" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title="Kategoriýany pozmalymy?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDel(null)}>
              Ýok
            </Button>
            <Button variant="danger" onClick={remove} loading={busy}>
              Hawa, poz
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          <b>{del?.name}</b> pozular. Içinde haryt bar bolsa pozup bolmaýar — ilki harytlary başga kategoriýa geçiriň.
        </p>
      </Modal>
    </div>
  );
}
