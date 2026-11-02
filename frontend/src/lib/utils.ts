/** Tiny className joiner (no runtime deps). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Soft tinted gradient for emoji product tiles, derived from a hex color. */
export function tileGradient(hex?: string | null): string {
  const c = hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#2e9e44";
  return `linear-gradient(135deg, ${c}14 0%, ${c}33 100%)`;
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
