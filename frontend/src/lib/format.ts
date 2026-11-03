/** "15.00" | "2.50" — price with two decimals (tenge), without currency. */
export function money(n: number | undefined | null): string {
  const v = Number(n ?? 0);
  return (Math.round(v * 100) / 100).toFixed(2);
}

/** "15 manat" */
export function price(n: number | undefined | null): string {
  return `${money(n)} manat`;
}

export function discountPercent(priceNow: number, old: number): number {
  if (!old || old <= priceNow) return 0;
  return Math.round((1 - priceNow / old) * 100);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ýaňyja";
  if (diff < 3600) return `${Math.floor(diff / 60)} min öň`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sagat öň`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} gün öň`;
  return formatDate(iso);
}

export function plural(n: number, word: string): string {
  return `${n} ${word}`;
}
