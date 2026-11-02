export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  order_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  image: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  old_price: number;
  unit: string;
  weight: string;
  stock: number;
  sold: number;
  image: string;
  emoji: string;
  category_id: number;
  category?: Category;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "confirmed" | "delivering" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  slug: string;
  image: string;
  emoji: string;
  weight: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  number: string;
  user_id: number;
  user?: User;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  item_count: number;
  name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: "cash" | "card";
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number | null;
  user_email: string;
  action: string;
  entity: string;
  entity_id: number;
  level: "info" | "warn" | "error";
  message: string;
  details: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface SiteConfig {
  name: string;
  delivery_fee: number;
  free_delivery_from: number;
  currency: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  work_hours: string;
}

export interface DayStat {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface Stats {
  users: number;
  products: number;
  active_products: number;
  categories: number;
  orders: number;
  pending_orders: number;
  revenue: number;
  today_orders: number;
  today_revenue: number;
  orders_by_status: { status: OrderStatus; count: number }[];
  sales_7d: DayStat[];
  recent_orders: Order[];
  top_products: Product[];
  low_stock: Product[];
  recent_logs: ActivityLog[];
}

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  old_price: number;
  image: string;
  emoji: string;
  weight: string;
  unit: string;
  stock: number;
  qty: number;
}
