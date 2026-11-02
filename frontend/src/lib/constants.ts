import type { OrderStatus } from "./types";

export const SITE_NAME = "AzykSowda";
export const SITE_TAGLINE = "Azyk harytlary — amatly bahadan, öýüňize çenli";

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending: { label: "Garaşylýar", color: "bg-accent-100 text-accent-700 ring-accent-200", dot: "bg-accent-500" },
  confirmed: { label: "Tassyklandy", color: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  delivering: { label: "Ýolda", color: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  delivered: { label: "Gowşuryldy", color: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-500" },
  cancelled: { label: "Ýatyryldy", color: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
};

export const ORDER_STATUS_LIST: OrderStatus[] = ["pending", "confirmed", "delivering", "delivered", "cancelled"];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "popular", label: "Meşhurlygy boýunça" },
  { value: "newest", label: "Täzeler" },
  { value: "price_asc", label: "Arzandan gymmada" },
  { value: "price_desc", label: "Gymmatdan arzana" },
  { value: "discount", label: "Arzanladyş" },
  { value: "name", label: "Ady boýunça" },
];

export const PAYMENT_LABEL: Record<string, string> = {
  cash: "Nagt (eltilende)",
  card: "Bank karty (eltilende terminal)",
};

export const UNITS = ["sany", "kg", "L", "gr", "ml", "paket", "desse"];

export const ACTION_LABEL: Record<string, string> = {
  "auth.login": "Giriş",
  "auth.login_failed": "Nädogry giriş",
  "auth.login_blocked": "Bloklanan giriş",
  "auth.register": "Hasap açma",
  "auth.logout": "Çykyş",
  "user.profile_update": "Profil täzelendi",
  "user.update": "Ulanyjy üýtgedildi",
  "order.create": "Täze sargyt",
  "order.cancel": "Sargyt ýatyryldy",
  "order.status": "Sargyt statusy",
  "product.create": "Haryt goşuldy",
  "product.update": "Haryt täzelendi",
  "product.delete": "Haryt pozuldy",
  "product.deactivate": "Haryt ýapyldy",
  "category.create": "Kategoriýa goşuldy",
  "category.update": "Kategoriýa täzelendi",
  "category.delete": "Kategoriýa pozuldy",
  upload: "Surat ýüklendi",
  "seed.users": "Seed: ulanyjylar",
  "seed.catalog": "Seed: katalog",
  "seed.orders": "Seed: sargytlar",
};
