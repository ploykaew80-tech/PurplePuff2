import type {
  Product,
  Category,
  Promotion,
  StoreSettings,
  User,
  ActivityLog,
  Order,
  AdminStats,
  CartItem
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('purplepuff_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ---------------- Public API ----------------

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/public/store-settings`);
  if (!res.ok) throw new Error('Failed to load store settings');
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/public/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/public/products`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/public/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE}/public/promotions`);
  if (!res.ok) throw new Error('Failed to load promotions');
  return res.json();
}

export async function submitCustomerOrder(data: {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: CartItem[];
  notes?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/public/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit order');
  }
  return res.json();
}

// ---------------- Auth API ----------------

export async function adminLogin(email: string, password: string, remember = false): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid credentials');
  }
  const data = await res.json();
  localStorage.setItem('purplepuff_admin_token', data.token);
  localStorage.setItem('purplepuff_admin_user', JSON.stringify(data.user));
  return data;
}

export async function checkAdminSession(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      localStorage.removeItem('purplepuff_admin_token');
      localStorage.removeItem('purplepuff_admin_user');
      return { authenticated: false };
    }
    const data = await res.json();
    return { authenticated: true, user: data.user };
  } catch {
    return { authenticated: false };
  }
}

export async function fetchPublicData(): Promise<{
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
}> {
  const [settings, categories, products, promotions] = await Promise.all([
    fetchStoreSettings(),
    fetchCategories(),
    fetchProducts(),
    fetchPromotions()
  ]);
  return { settings, categories, products, promotions };
}

export async function fetchAdminDashboardData(): Promise<{
  stats: AdminStats;
  logs: ActivityLog[];
  orders: Order[];
  users: User[];
}> {
  const [stats, logs, orders, users] = await Promise.all([
    adminGetStats(),
    adminGetActivityLogs(),
    adminGetOrders(),
    adminGetUsers().catch(() => [])
  ]);
  return { stats, logs, orders, users };
}

export async function saveAdminProduct(product: Partial<Product>): Promise<Product> {
  if (product.id) {
    return adminUpdateProduct(product.id, product);
  }
  return adminCreateProduct(product);
}

export async function deleteAdminProduct(id: string): Promise<Product> {
  return adminArchiveProduct(id);
}

export async function updateAdminProductStatus(id: string, status: Product['status']): Promise<Product> {
  return adminUpdateProduct(id, { status });
}

export async function saveAdminCategory(category: Partial<Category>): Promise<Category> {
  if (category.id) {
    return adminUpdateCategory(category.id, category);
  }
  return adminCreateCategory(category);
}

export async function saveAdminPromotion(promo: Partial<Promotion>): Promise<Promotion> {
  if (promo.id) {
    return adminUpdatePromotion(promo.id, promo);
  }
  return adminCreatePromotion(promo);
}

export async function deleteAdminPromotion(id: string): Promise<void> {
  return adminDeletePromotion(id);
}

export async function saveAdminSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  return adminUpdateStoreSettings(settings);
}

export async function saveAdminUser(userData: Partial<User> & { password?: string }): Promise<User> {
  if (userData.id) {
    return adminUpdateUser(userData.id, userData);
  }
  return adminCreateUser({
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role || 'STAFF',
    password: userData.password || 'password123'
  });
}

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete user');
}


export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } finally {
    localStorage.removeItem('purplepuff_admin_token');
    localStorage.removeItem('purplepuff_admin_user');
  }
}

// ---------------- Admin API ----------------

export async function adminGetStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function adminGetProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load admin products');
  return res.json();
}

export async function adminBulkSyncProducts(products: Partial<Product>[]): Promise<{ success: boolean; count: number; products: Product[] }> {
  const res = await fetch(`${API_BASE}/admin/products/bulk-sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ products })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to sync products');
  }
  return res.json();
}

export async function adminCreateProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create product');
  }
  return res.json();
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product');
  }
  return res.json();
}

export async function adminDuplicateProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to duplicate product');
  return res.json();
}

export async function adminArchiveProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}/archive`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to archive product');
  return res.json();
}

export async function adminRestoreProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/admin/products/${id}/restore`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to restore product');
  return res.json();
}

export async function adminGetCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/admin/categories`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function adminCreateCategory(cat: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cat)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function adminUpdateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function adminGetPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE}/admin/promotions`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load promotions');
  return res.json();
}

export async function adminCreatePromotion(promo: Partial<Promotion>): Promise<Promotion> {
  const res = await fetch(`${API_BASE}/admin/promotions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(promo)
  });
  if (!res.ok) throw new Error('Failed to create promotion');
  return res.json();
}

export async function adminUpdatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
  const res = await fetch(`${API_BASE}/admin/promotions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update promotion');
  return res.json();
}

export async function adminDeletePromotion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/promotions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete promotion');
}

export async function adminGetStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/admin/store-settings`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load store settings');
  return res.json();
}

export async function adminUpdateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/admin/store-settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update store settings');
  return res.json();
}

export async function adminGetOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function adminUpdateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export const updateAdminOrderStatus = adminUpdateOrderStatus;


export async function adminGetUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function adminCreateUser(user: { name: string; email: string; role: User['role']; password: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create user');
  }
  return res.json();
}

export async function adminUpdateUser(id: string, updates: Partial<User> & { password?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function adminGetActivityLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_BASE}/admin/activity`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to load activity logs');
  return res.json();
}

export async function uploadAdminImage(dataUrl: string, filename?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/admin/upload-image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ dataUrl, filename })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload image');
  }
  const data = await res.json();
  return data.url;
}

