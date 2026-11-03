"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { api, ApiError, imgUrl } from "@/lib/api";
import { toast } from "@/store/ui";
import { Spinner } from "@/components/ui/Button";

interface Props {
  value: string;
  onChange: (url: string) => void;
  emoji?: string;
}

export default function ImageUpload({ value, onChange, emoji }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const src = imgUrl(value);

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast("Faýl 5 MB-dan uly bolmaly däl", "error");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ url: string }>("/api/admin/upload", { method: "POST", formData: fd });
      onChange(res.data.url);
      toast("Surat ýüklendi");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Surat ýüklenmedi", "error");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="relative grid aspect-square w-full max-w-[260px] place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-muted">
            <span className="text-5xl">{emoji || <ImagePlus className="h-10 w-10" />}</span>
            <span className="mt-2 text-xs">Surat ýok — emoji görkeziler</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-card/70">
            <Spinner className="h-6 w-6 text-brand-600" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => ref.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100" disabled={busy}>
          <Upload className="h-4 w-4" /> Surat ýükle
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-600 hover:bg-red-100">
            <Trash2 className="h-4 w-4" /> Aýyr
          </button>
        )}
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ýa-da surat URL (https://... ýa-da /uploads/...)"
        className="h-9 w-full rounded-lg border border-line px-3 text-xs focus:border-brand-500 focus:outline-none"
      />
      <p className="text-[11px] text-muted">jpg, png, webp, gif, svg · iň köp 5 MB · maslahat 800×800</p>
    </div>
  );
}
