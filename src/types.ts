export type ProductType = 'Sativa' | 'Hybrid' | 'Indica';

export type ProductStatus = 'AVAILABLE' | 'SOLD OUT' | 'ARCHIVED';

export type CategoryStatus = 'ACTIVE' | 'HIDDEN';

export type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED';

export type UserRole = 'SUPER ADMIN' | 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  product_name: string;
  category_id: string;
  type: ProductType;
  description: string;
  effect_1: string;
  effect_2: string;
  effect_3: string;
  price: number;
  image_url: string;
  status: ProductStatus;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  custom_fields?: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  display_order: number;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  status: PromotionStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  logo_url: string;
  banner_url: string;
  description: string;
  opening_time: string; // e.g. "10:00"
  closing_time: string; // e.g. "02:00" (overnight)
  contact: string;
  line_username: string; // e.g. "@798shear"
  instagram_username: string; // e.g. "Pulplepuff"
  delivery_available: boolean;
  facebook?: string;
  google_maps?: string;
  location_address?: string;
  store_policies?: string;
  google_sheet_id?: string;
  google_sheet_url?: string;
  google_sheet_synced_at?: string;
  google_sheet_columns?: string[];
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: CartItem[];
  total_amount: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface AdminStats {
  totalProducts: number;
  availableProducts: number;
  soldOutProducts: number;
  activePromotions: number;
  totalOrders: number;
  pendingOrders: number;
}
