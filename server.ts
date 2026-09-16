import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword } from './server/db';
import type { UserRole, Product } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Explicitly serve uploads folder
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// In-memory active sessions: token -> { userId: string, expiresAt: number }
interface Session {
  userId: string;
  expiresAt: number;
}

const SESSIONS_FILE = path.join(process.cwd(), 'server', 'sessions.json');

function loadSessionsFromDisk(): Map<string, Session> {
  const map = new Map<string, Session>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const obj = JSON.parse(raw);
        const now = Date.now();
        for (const [token, s] of Object.entries(obj as Record<string, Session>)) {
          if (s && s.expiresAt > now) {
            map.set(token, s);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Non-fatal: Could not read sessions.json:', err);
  }
  return map;
}

function persistSessionsToDisk(map: Map<string, Session>) {
  try {
    const obj: Record<string, Session> = {};
    const now = Date.now();
    for (const [token, s] of map.entries()) {
      if (s && s.expiresAt > now) {
        obj[token] = s;
      }
    }
    const tmp = `${SESSIONS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf-8');
    fs.renameSync(tmp, SESSIONS_FILE);
  } catch (err) {
    console.warn('Non-fatal: Could not persist sessions.json:', err);
  }
}

const sessions = loadSessionsFromDisk();

// Simple login rate limiting
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(ip: string): boolean {
  const record = loginAttempts.get(ip);
  if (!record) return true;
  if (Date.now() < record.lockedUntil) return false;
  return true;
}

function recordFailedLogin(ip: string) {
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 5 * 60 * 1000; // 5 min lock
    record.count = 0;
  }
  loginAttempts.set(ip, record);
}

function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: ReturnType<typeof db.getUserById>;
  sessionToken?: string;
}

function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ACCESS DENIED: Authentication required' });
  }

  const token = authHeader.substring(7);
  let session = sessions.get(token);

  // If not found in memory, reload from disk in case of server restart
  if (!session) {
    const diskSessions = loadSessionsFromDisk();
    session = diskSessions.get(token);
    if (session) {
      sessions.set(token, session);
    }
  }

  if (!session || Date.now() > session.expiresAt) {
    if (session) {
      sessions.delete(token);
      persistSessionsToDisk(sessions);
    }
    return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  }

  const user = db.getUserById(session.userId);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'ACCESS DENIED: Account inactive or not found.' });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

function authorizeRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ACCESS DENIED: Insufficient permissions for this action.' });
    }
    next();
  };
}

// -------------------------------------------------------------
// PUBLIC API (Read-only for catalog, with in-app checkout order)
// -------------------------------------------------------------

app.get('/api/public/store-settings', (req, res) => {
  try {
    const settings = db.getStoreSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/categories', (req, res) => {
  try {
    const categories = db.getCategories().filter(c => c.status === 'ACTIVE');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/products', (req, res) => {
  try {
    const products = db.getProducts(false); // only active / available / sold out, excluding archived
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product || product.status === 'ARCHIVED') {
      return res.status(404).json({ error: 'PRODUCT NOT FOUND' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/promotions', (req, res) => {
  try {
    const promos = db.getPromotions(true); // active only
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// In-app checkout ("ทำให้ซื้อในแอพได้เลย")
app.post('/api/public/orders', (req, res) => {
  try {
    const { customer_name, customer_phone, delivery_address, items, notes } = req.body;

    if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please provide name, phone number, and at least 1 item' });
    }

    // Verify prices from server-side database
    let total = 0;
    const validatedItems = items.map(item => {
      const dbProduct = db.getProductById(item.product.id);
      if (!dbProduct || dbProduct.status === 'ARCHIVED') {
        throw new Error(`Product ${item.product.product_name} is no longer available`);
      }
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      total += dbProduct.price * qty;
      return {
        product: dbProduct,
        quantity: qty
      };
    });

    const newOrder = db.addOrder({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      delivery_address: (delivery_address || '').trim(),
      items: validatedItems,
      total_amount: total,
      notes: (notes || '').trim()
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION API
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many failed login attempts. Please wait 5 minutes.' });
  }

  const { email, password, remember } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const userRecord = db.findUserByEmail(email);
  if (!userRecord) {
    recordFailedLogin(clientIp);
    return res.status(401).json({ error: 'Email หรือ Password ไม่ถูกต้อง' });
  }

  if (userRecord.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  const computedHash = hashPassword(password, userRecord.salt);
  if (computedHash !== userRecord.password_hash) {
    recordFailedLogin(clientIp);
    return res.status(401).json({ error: 'Email หรือ Password ไม่ถูกต้อง' });
  }

  clearLoginAttempts(clientIp);

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const durationMs = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  sessions.set(token, {
    userId: userRecord.id,
    expiresAt: Date.now() + durationMs
  });
  persistSessionsToDisk(sessions);

  db.updateLastLogin(userRecord.id);

  db.logActivity({
    user_id: userRecord.id,
    user_name: userRecord.name,
    action: 'LOGIN',
    entity_type: 'user',
    entity_id: userRecord.id,
    metadata: { email: userRecord.email, role: userRecord.role }
  });

  const { password_hash, salt, ...safeUser } = userRecord;
  res.json({
    token,
    user: safeUser
  });
});

app.get('/api/auth/me', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  if (req.sessionToken) {
    sessions.delete(req.sessionToken);
    persistSessionsToDisk(sessions);
  }
  if (req.user) {
    db.logActivity({
      user_id: req.user.id,
      user_name: req.user.name,
      action: 'LOGOUT',
      entity_type: 'user',
      entity_id: req.user.id
    });
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// Dashboard Stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const products = db.getProducts(true);
    const available = products.filter(p => p.status === 'AVAILABLE').length;
    const soldOut = products.filter(p => p.status === 'SOLD OUT').length;
    const activePromos = db.getPromotions(true).length;
    const orders = db.getOrders();
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

    res.json({
      totalProducts: products.filter(p => p.status !== 'ARCHIVED').length,
      availableProducts: available,
      soldOutProducts: soldOut,
      activePromotions: activePromos,
      totalOrders: orders.length,
      pendingOrders: pendingOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products Management
app.get('/api/admin/products', authenticateAdmin, (req, res) => {
  try {
    const products = db.getProducts(true); // Include archived
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const {
      product_name,
      category_id,
      type,
      description,
      effect_1,
      effect_2,
      effect_3,
      price,
      image_url,
      status,
      featured,
      display_order
    } = req.body;

    if (!product_name || !product_name.trim()) {
      return res.status(400).json({ error: 'Product Name is required' });
    }
    if (!category_id) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    const created = db.addProduct({
      product_name: product_name.trim(),
      category_id,
      type: type || 'Hybrid',
      description: description?.trim() || '',
      effect_1: effect_1?.trim() || '',
      effect_2: effect_2?.trim() || '',
      effect_3: effect_3?.trim() || '',
      price: Number(price),
      image_url: image_url || 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
      status: status || 'AVAILABLE',
      featured: Boolean(featured),
      display_order: Number(display_order) || 99,
      created_by: req.user?.name,
      updated_by: req.user?.name
    });

    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'PRODUCT CREATED',
      entity_type: 'product',
      entity_id: created.id,
      metadata: { product_name: created.product_name, price: created.price }
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_by: req.user?.name };
    if (updates.price !== undefined) {
      const parsedPrice = Number(updates.price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        updates.price = parsedPrice;
      }
    }
    if (updates.display_order !== undefined) {
      const parsedOrder = parseInt(String(updates.display_order), 10);
      if (!isNaN(parsedOrder)) {
        updates.display_order = parsedOrder;
      }
    }

    // If category is equipment or general, keep effects clean
    const categoryId = String(updates.category_id || '').toLowerCase();
    const productName = String(updates.product_name || '').toLowerCase();
    const isEquip = 
      categoryId === 'cat-general' ||
      categoryId.includes('equip') ||
      categoryId.includes('device') ||
      productName.includes('grinder') ||
      productName.includes('เครื่องบด') ||
      productName.includes('บ้อง') ||
      productName.includes('กระดาษโรล');

    if (isEquip) {
      if (updates.effect_1 === undefined || updates.effect_1 === null || updates.effect_1) updates.effect_1 = '';
      if (updates.effect_2 === undefined || updates.effect_2 === null || updates.effect_2) updates.effect_2 = '';
      if (updates.effect_3 === undefined || updates.effect_3 === null || updates.effect_3) updates.effect_3 = '';
    }

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'PRODUCT UPDATED',
      entity_type: 'product',
      entity_id: id,
      metadata: { product_name: updated.product_name, price: updated.price, status: updated.status }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
});

app.post('/api/admin/products/:id/duplicate', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const duplicated = db.duplicateProduct(req.params.id, req.user?.name || 'Admin');
    if (!duplicated) {
      return res.status(404).json({ error: 'Original product not found' });
    }
    res.status(201).json(duplicated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/products/:id/archive', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const archived = db.archiveProduct(req.params.id, req.user?.name || 'Admin');
    if (!archived) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(archived);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/products/:id/restore', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const restored = db.restoreProduct(req.params.id, req.user?.name || 'Admin');
    if (!restored) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(restored);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/products/bulk-sync', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'products must be an array' });
    }
    const allProducts = db.bulkUpsertProducts(products, req.user?.name || 'Admin');
    res.json({ success: true, count: products.length, products: allProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories Management
app.get('/api/admin/categories', authenticateAdmin, (req, res) => {
  try {
    const cats = db.getCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, icon, description, display_order, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const cat = db.addCategory({
      name: name.trim(),
      icon: icon || '✨',
      description: description || '',
      display_order: Number(display_order) || 99,
      status: status || 'ACTIVE'
    });
    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'CATEGORY CREATED',
      entity_type: 'category',
      entity_id: cat.id,
      metadata: { name: cat.name }
    });
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Promotions Management
app.get('/api/admin/promotions', authenticateAdmin, (req, res) => {
  try {
    const promos = db.getPromotions(false);
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/promotions', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, image_url, start_date, end_date, status, display_order } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const promo = db.addPromotion({
      title: title.trim(),
      description: description?.trim() || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      start_date: start_date || new Date().toISOString().slice(0, 10),
      end_date: end_date || '',
      status: status || 'ACTIVE',
      display_order: Number(display_order) || 1
    });

    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'PROMOTION CREATED',
      entity_type: 'promotion',
      entity_id: promo.id,
      metadata: { title: promo.title }
    });

    res.status(201).json(promo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/promotions/:id', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updatePromotion(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Promotion not found' });

    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'PROMOTION UPDATED',
      entity_type: 'promotion',
      entity_id: req.params.id,
      metadata: { title: updated.title }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/promotions/:id', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const deleted = db.deletePromotion(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Promotion not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Store Settings
app.get('/api/admin/store-settings', authenticateAdmin, (req, res) => {
  res.json(db.getStoreSettings());
});

app.put('/api/admin/store-settings', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateStoreSettings(req.body, req.user?.name || 'Admin');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Image Upload Endpoint (Handles base64 data URLs for logos, product images, banners)
app.post('/api/admin/upload-image', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'dataUrl is required' });
    }

    // Matches data:image/png;base64,... or similar
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a URL or path, just return it
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('/')) {
        return res.json({ url: dataUrl });
      }
      return res.status(400).json({ error: 'Invalid base64 data URL format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('svg')) ext = '.svg';

    const safePrefix = (filename || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const uniqueName = `${safePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;

    db.logActivity({
      user_id: req.user?.id || 'admin',
      user_name: req.user?.name || 'Admin',
      action: 'IMAGE UPLOADED',
      entity_type: 'image',
      entity_id: uniqueName,
      metadata: { url: publicUrl, size: buffer.length }
    });

    res.json({ url: publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process image upload' });
  }
});


// Orders Management
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', authenticateAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, req.user?.name || 'Admin');
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Users Management (SUPER ADMIN ONLY)
app.get('/api/admin/users', authenticateAdmin, authorizeRoles(['SUPER ADMIN']), (req, res) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', authenticateAdmin, authorizeRoles(['SUPER ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const created = db.addUser({ name, email, role: role || 'STAFF', password }, req.user?.name || 'Super Admin');
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id', authenticateAdmin, authorizeRoles(['SUPER ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateUser(req.params.id, req.body, req.user?.name || 'Super Admin');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Activity Logs
app.get('/api/admin/activity', authenticateAdmin, (req, res) => {
  try {
    const logs = db.getActivityLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER START
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PURPLE PUFF Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
