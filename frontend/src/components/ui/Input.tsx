import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-xl border border-line bg-card px-3.5 text-[15px] text-ink placeholder:text-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50";

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Field({ label, error, hint, required, children, className }: BaseProps & { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({ label, error, hint, required, className, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <input className={cn(fieldBase, "h-11", error && "border-red-400 focus:border-red-500 focus:ring-red-100", className)} required={required} {...rest} />
    </Field>
  );
}

export function Textarea({ label, error, hint, required, className, ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <textarea className={cn(fieldBase, "min-h-[96px] py-2.5", error && "border-red-400", className)} required={required} {...rest} />
    </Field>
  );
}

export function Select({ label, error, hint, required, className, children, ...rest }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <select className={cn(fieldBase, "h-11 pr-9 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat", error && "border-red-400", className)} required={required} {...rest}>
        {children}
      </select>
    </Field>
  );
}

export function Checkbox({ label, className, ...rest }: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none text-sm", className)}>
      <input type="checkbox" className="h-4.5 w-4.5 rounded border-line text-brand-500 accent-brand-500" {...rest} />
      <span>{label}</span>
    </label>
  );
}
