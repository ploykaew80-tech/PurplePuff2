import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { 
  Product, 
  Category, 
  Promotion, 
  StoreSettings, 
  User, 
  ActivityLog, 
  Order 
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'server', 'data.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  store_settings: StoreSettings;
  users: (User & { password_hash: string; salt: string })[];
  activity_logs: ActivityLog[];
  orders: Order[];
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

const initialCategories: Category[] = [
  {
    id: 'cat-pop',
    name: '🌸 ดอก POP',
    icon: '🌸',
    description: 'ดอกไซส์ Popcorn ราคาสบายกระเป๋า คุณภาพเต็มเม็ด',
    display_order: 1,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-top',
    name: '👑 ดอก TOP',
    icon: '👑',
    description: 'Top Shelf ระดับพรีเมียม กลิ่นแน่น คัดเกรดพิเศษ',
    display_order: 2,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-greenhouse',
    name: '🌿 ดอก GREEN HOUSE',
    icon: '🌿',
    description: 'ปลูกระบบ Green House ควบคุมแสงธรรมชาติ คุณภาพคงที่',
    display_order: 3,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-trim',
    name: '✂️ TRIM',
    icon: '✂️',
    description: 'Trim Sugar Leaves คัดพิเศษ เหมาะสำหรับสกัดหรือผสม',
    display_order: 4,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-preroll',
    name: '🚬 พันลำ',
    icon: '🚬',
    description: 'Pre-rolls พันสดพร้อมสูบ ดอกล้วนไม่มีก้าน',
    display_order: 5,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-general',
    name: '🛠️ อุปกรณ์ / ของทั่วไป',
    icon: '🛠️',
    description: 'อุปกรณ์ บ้อง กระดาษโรล ไฟแช็ค และแอคเซสเซอรี่',
    display_order: 6,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-promotion',
    name: '🔥 PROMOTION',
    icon: '🔥',
    description: 'ดีลเด็ดและเซ็ตสุดคุ้มประจำสัปดาห์',
    display_order: 7,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-edible',
    name: '🍭 ขนม',
    icon: '🍭',
    description: 'เยลลี่ คุกกี้ และขนมผสมสูตรพิเศษ อร่อยกลมกล่อม',
    display_order: 8,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-001',
    product_name: 'Granddaddy Purple (GDP)',
    category_id: 'cat-top',
    type: 'Indica',
    description: 'สายพันธุ์ตำนานสีม่วงเข้ม กลิ่นเบอร์รี่และองุ่นสุกเด่นชัด ให้ความผ่อนคลายล้ำลึก สบายตัวสูงสุด เหมาะสำหรับพักผ่อนยามค่ำคืน',
    effect_1: 'ผ่อนคลายลึก',
    effect_2: 'หลับสบาย',
    effect_3: 'เคลิ้มสุข',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-002',
    product_name: 'Purple Punch Cosmic Cut',
    category_id: 'cat-top',
    type: 'Indica',
    description: 'ไฮบริดอินดิก้าชั้นยอด กลิ่นบลูเบอร์รี่มัฟฟินและทาร์ตผลไม้หวานฉ่ำ ไตรโคมประกายประกายม่วงระยิบระยับ ปรับอารมณ์ให้สงบผ่อนคลาย',
    effect_1: 'สงบจิตใจ',
    effect_2: 'ลดความเครียด',
    effect_3: 'ตัวเบาสบาย',
    price: 420,
    image_url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-003',
    product_name: 'Super Lemon Haze Pop',
    category_id: 'cat-pop',
    type: 'Sativa',
    description: 'ดอกป๊อปคอร์นขนาดกะทัดรัด กลิ่นเลมอนเปรี้ยวสดชื่น กระปรี้กระเปร่า สมองแล่น มีพลังงานสร้างสรรค์ เหมาะสำหรับช่วงกลางวัน',
    effect_1: 'มีพลังงาน',
    effect_2: 'โฟกัสดีเยี่ยม',
    effect_3: 'อารมณ์ดี',
    price: 250,
    image_url: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-004',
    product_name: 'Gelato #33 (Larry Bird)',
    category_id: 'cat-top',
    type: 'Hybrid',
    description: 'สายพันธุ์ไฮบริดที่สมดุลอย่างสมบูรณ์แบบ กลิ่นหวานครีมวนิลาผสมซิตรัส บรรเทาอาการเมื่อยล้าและเพิ่มความสุขสดชื่น',
    effect_1: 'สมดุลทั้งตัว',
    effect_2: 'เบิกบานใจ',
    effect_3: 'ผ่อนคลายกล้ามเนื้อ',
    price: 480,
    image_url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-005',
    product_name: 'Thai Stick Vintage GH',
    category_id: 'cat-greenhouse',
    type: 'Sativa',
    description: 'สายพันธุ์แลนด์เรซไทยคลาสสิก ปลูกในระบบกรีนเฮ้าส์อินทรีย์ ให้กลิ่นดินผสมผลไม้เมืองร้อน หัวโปร่ง โล่งสบาย อารมณ์สดใส',
    effect_1: 'สมองโล่ง',
    effect_2: 'สร้างสรรค์',
    effect_3: 'หัวเราะง่าย',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: false,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-006',
    product_name: 'Purple Cosmic Pre-Roll 1G',
    category_id: 'cat-preroll',
    type: 'Indica',
    description: 'พันลำสำเร็จรูปพร้อมสูบ 1 กรัม ดอก GDP 100% ไม่มีก้าน ห่อด้วยกระดาษ RAW Organic Hemp กลิ่นหอมฟุ้ง พกพาสะดวก',
    effect_1: 'พร้อมสูบไว',
    effect_2: 'หลับลึก',
    effect_3: 'คลายกังวล',
    price: 190,
    image_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-007',
    product_name: 'Premium Sugar Leaf Trim 10G',
    category_id: 'cat-trim',
    type: 'Hybrid',
    description: 'เศษใบชูการ์ลีฟคัดพิเศษ ไตรโคมขาวประกาย เหมาะสำหรับนำไปสกัดเนย ชา หรือผสมสมุนไพร คุ้มค่า ปริมาณ 10 กรัม',
    effect_1: 'คุ้มค่าสูง',
    effect_2: 'กลิ่นหอมเบา',
    effect_3: 'ชิลสบาย',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: false,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-008',
    product_name: 'Cosmic Purple Space Gummies',
    category_id: 'cat-edible',
    type: 'Hybrid',
    description: 'เยลลี่องุ่นผสมสารสกัดธรรมชาติ เคี้ยวหนึบ รสชาติหวานอมเปรี้ยว ให้ความรู้สึกนุ่มนวล ผ่อนคลายต่อเนื่องยาวนาน บรรจุ 5 ชิ้น',
    effect_1: 'รสชาติอร่อย',
    effect_2: 'ออกฤทธิ์นาน',
    effect_3: 'อารมณ์ละมุน',
    price: 320,
    image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: true,
    display_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-009',
    product_name: 'Purple Puff Grinder 4-Piece',
    category_id: 'cat-general',
    type: 'Hybrid',
    description: 'เครื่องบดอะลูมิเนียมเกรดอากาศยาน 4 ชั้น สีม่วง Cosmic Purple เลเซอร์โลโก้ PURPLE PUFF ฟันบดคมเฉียบ กรองเกสรละเอียด',
    effect_1: '',
    effect_2: '',
    effect_3: '',
    price: 390,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    featured: false,
    display_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  },
  {
    id: 'prod-010',
    product_name: 'Runtz Tropical Edition (Limited)',
    category_id: 'cat-top',
    type: 'Hybrid',
    description: 'สายพันธุ์หายาก ฟีโนไทป์สีม่วงผลไม้ รสชาติหวานเหมือนลูกกวาดผลไม้รวม สินค้ามีจำนวนจำกัดและกำลังรอรอบเก็บเกี่ยวใหม่',
    effect_1: 'เคลิ้มสุขสูง',
    effect_2: 'รสชาติลูกกวาด',
    effect_3: 'ผ่อนคลายลึก',
    price: 520,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    status: 'SOLD OUT',
    featured: false,
    display_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'Super Admin'
  }
];

const initialPromotions: Promotion[] = [
  {
    id: 'promo-001',
    title: '💜 NIGHT OWL VIBES — ลด 15% หลังเที่ยงคืน',
    description: 'สั่งซื้อช่วง 00:00 — 02:00 ทุกรายการสินค้าดอก TOP ลดทันที 15% เพียงแจ้งรหัส "PURPLENIGHT" ทาง LINE',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-09-01',
    end_date: '2026-10-31',
    status: 'ACTIVE',
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'promo-002',
    title: '🚀 COSMIC TRIO PACK — เซ็ต 3 ดอกเด็ด 999.-',
    description: 'รวม 3 ตัวท็อป Granddaddy Purple + Gelato #33 + Super Lemon Haze อย่างละ 1 กรัม ในกล่องของขวัญม่วง Limited Edition',
    image_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-09-10',
    end_date: '2026-10-15',
    status: 'ACTIVE',
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialStoreSettings: StoreSettings = {
  id: 'store-main',
  store_name: 'PURPLE PUFF',
  logo_url: '/uploads/store_logo_purple_heart.jpg',
  banner_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  description: 'PURPLE PUFF — Cosmic & Premium Dispensary Store ดอกคัดเกรดพรีเมียม สดใหม่ กลิ่นแน่น คัดเฉพาะสายพันธุ์ชั้นนำ พร้อมบริการจัดส่งด่วนถึงที่',
  opening_time: '10:00',
  closing_time: '02:00',
  contact: '081-798-SHEAR',
  line_username: '@798shear',
  instagram_username: 'Pulplepuff',
  delivery_available: true,
  facebook: 'PurplePuffOfficial',
  google_maps: 'https://maps.google.com/?q=Bangkok+Thailand',
  location_address: 'Bangkok, Thailand (ให้บริการหน้าร้าน & จัดส่ง Express)',
  store_policies: 'ผู้ซื้อต้องมีอายุตั้งแต่ 20 ปีบริบูรณ์ขึ้นไป ห้ามสตรีมีครรภ์หรือให้นมบุตรใช้งาน สินค้าเพื่อการผ่อนคลายและดูแลสุขภาวะเท่านั้น',
  updated_at: new Date().toISOString()
};

function buildInitialUsers() {
  const adminSalt = generateSalt();
  const managerSalt = generateSalt();
  const staffSalt = generateSalt();

  return [
    {
      id: 'usr-001',
      name: 'Super Admin Ploy',
      email: 'admin@purplepuff.com',
      role: 'SUPER ADMIN' as const,
      status: 'ACTIVE' as const,
      created_at: '2026-01-01T00:00:00.000Z',
      last_login: new Date().toISOString(),
      salt: adminSalt,
      password_hash: hashPassword('purplepuff123', adminSalt)
    },
    {
      id: 'usr-002',
      name: 'Store Manager Mark',
      email: 'manager@purplepuff.com',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      created_at: '2026-02-15T00:00:00.000Z',
      last_login: new Date().toISOString(),
      salt: managerSalt,
      password_hash: hashPassword('manager123', managerSalt)
    },
    {
      id: 'usr-003',
      name: 'Staff Purple Puff',
      email: 'staff@purplepuff.com',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      created_at: '2026-03-01T00:00:00.000Z',
      last_login: new Date().toISOString(),
      salt: staffSalt,
      password_hash: hashPassword('purplepuffstaff', staffSalt)
    }
  ];
}

const initialOrders: Order[] = [
  {
    id: 'ORD-1001',
    customer_name: 'คุณณัฐพล',
    customer_phone: '089-123-4567',
    delivery_address: 'คอนโดสุขุมวิท 24 แขวงคลองตัน เขตคลองเตย กทม. 10110',
    items: [
      { product: initialProducts[0], quantity: 2 },
      { product: initialProducts[5], quantity: 1 }
    ],
    total_amount: 1090,
    status: 'CONFIRMED',
    notes: 'ส่งช่วงค่ำหลัง 20:00 น. โทรแจ้งก่อนส่งครับ',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialLogs: ActivityLog[] = [
  {
    id: 'log-001',
    user_id: 'usr-001',
    user_name: 'Super Admin Ploy',
    action: 'STORE SETTINGS UPDATED',
    entity_type: 'store_settings',
    entity_id: 'store-main',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    metadata: { note: 'Initial configuration with overnight 02:00 closing schedule' }
  },
  {
    id: 'log-002',
    user_id: 'usr-001',
    user_name: 'Super Admin Ploy',
    action: 'PRODUCT CREATED',
    entity_type: 'product',
    entity_id: 'prod-001',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    metadata: { product_name: 'Granddaddy Purple (GDP)', price: 450 }
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim()) {
          return JSON.parse(raw);
        }
      } catch (err) {
        console.error('Failed to read db file, attempting backup recovery', err);
        const backupFile = `${DB_FILE}.bak`;
        if (fs.existsSync(backupFile)) {
          try {
            const backupRaw = fs.readFileSync(backupFile, 'utf-8');
            if (backupRaw && backupRaw.trim()) {
              const recovered = JSON.parse(backupRaw);
              console.log('Successfully recovered database from backup file');
              return recovered;
            }
          } catch (bErr) {
            console.error('Failed to recover from backup file', bErr);
          }
        }
      }
    }

    const defaultData: DatabaseSchema = {
      products: initialProducts,
      categories: initialCategories,
      promotions: initialPromotions,
      store_settings: initialStoreSettings,
      users: buildInitialUsers(),
      activity_logs: initialLogs,
      orders: initialOrders
    };

    this.save(defaultData);
    return defaultData;
  }

  private save(data?: DatabaseSchema) {
    if (data) this.data = data;
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      const backupFile = `${DB_FILE}.bak`;
      const json = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(tempFile, json, 'utf-8');
      if (fs.existsSync(DB_FILE)) {
        try {
          fs.copyFileSync(DB_FILE, backupFile);
        } catch {
          // Ignore backup copy non-fatal error
        }
      }
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically write DB_FILE, fallback to direct write:', err);
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (syncErr) {
        console.error('Critical: Direct write to DB_FILE also failed:', syncErr);
      }
    }
  }

  // Categories
  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.display_order - b.display_order);
  }

  addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.categories[idx];
  }

  // Products
  getProducts(includeArchived = false): Product[] {
    return this.data.products
      .filter(p => includeArchived || p.status !== 'ARCHIVED')
      .sort((a, b) => a.display_order - b.display_order);
  }

  getProductById(id: string): Product | null {
    return this.data.products.find(p => p.id === id) || null;
  }

  addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.products[idx];
  }

  archiveProduct(id: string, userName: string): Product | null {
    const updated = this.updateProduct(id, { status: 'ARCHIVED', updated_by: userName });
    if (updated) {
      this.logActivity({
        user_id: 'user',
        user_name: userName,
        action: 'PRODUCT ARCHIVED',
        entity_type: 'product',
        entity_id: id,
        metadata: { product_name: updated.product_name }
      });
    }
    return updated;
  }

  restoreProduct(id: string, userName: string): Product | null {
    const updated = this.updateProduct(id, { status: 'AVAILABLE', updated_by: userName });
    if (updated) {
      this.logActivity({
        user_id: 'user',
        user_name: userName,
        action: 'PRODUCT RESTORED',
        entity_type: 'product',
        entity_id: id,
        metadata: { product_name: updated.product_name }
      });
    }
    return updated;
  }

  duplicateProduct(id: string, userName: string): Product | null {
    const orig = this.getProductById(id);
    if (!orig) return null;
    const duplicated = this.addProduct({
      ...orig,
      product_name: `${orig.product_name} (Copy)`,
      created_by: userName,
      updated_by: userName,
      display_order: this.data.products.length + 1
    });
    this.logActivity({
      user_id: 'user',
      user_name: userName,
      action: 'PRODUCT CREATED',
      entity_type: 'product',
      entity_id: duplicated.id,
      metadata: { duplicated_from: orig.id, product_name: duplicated.product_name }
    });
    return duplicated;
  }

  bulkUpsertProducts(items: Partial<Product>[], userName: string): Product[] {
    const now = new Date().toISOString();
    const updatedList: Product[] = [];

    items.forEach((item, index) => {
      if (!item.product_name) return;

      let existingIndex = -1;
      if (item.id) {
        existingIndex = this.data.products.findIndex(p => p.id === item.id);
      }
      if (existingIndex === -1 && item.product_name) {
        existingIndex = this.data.products.findIndex(
          p => p.product_name.trim().toLowerCase() === item.product_name!.trim().toLowerCase()
        );
      }

      if (existingIndex >= 0) {
        // Update existing product
        const existing = this.data.products[existingIndex];
        const updated: Product = {
          ...existing,
          ...item,
          id: existing.id,
          product_name: item.product_name || existing.product_name,
          category_id: item.category_id || existing.category_id,
          type: item.type || existing.type,
          price: Number(item.price ?? existing.price),
          status: item.status || existing.status,
          effect_1: item.effect_1 !== undefined ? item.effect_1 : existing.effect_1,
          effect_2: item.effect_2 !== undefined ? item.effect_2 : existing.effect_2,
          effect_3: item.effect_3 !== undefined ? item.effect_3 : existing.effect_3,
          description: item.description !== undefined ? item.description : existing.description,
          image_url: item.image_url || existing.image_url,
          featured: item.featured !== undefined ? item.featured : existing.featured,
          display_order: item.display_order ?? existing.display_order,
          custom_fields: { ...(existing.custom_fields || {}), ...(item.custom_fields || {}) },
          updated_at: now,
          updated_by: userName
        };
        this.data.products[existingIndex] = updated;
        updatedList.push(updated);
      } else {
        // Insert new product
        const newProduct: Product = {
          id: item.id || `prod-${Date.now()}-${index}`,
          product_name: item.product_name,
          category_id: item.category_id || this.data.categories[0]?.id || 'cat-pop',
          type: item.type || 'Hybrid',
          price: Number(item.price || 350),
          status: item.status || 'AVAILABLE',
          effect_1: item.effect_1 || 'ผ่อนคลาย',
          effect_2: item.effect_2 || '',
          effect_3: item.effect_3 || '',
          description: item.description || '',
          image_url: item.image_url || 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
          featured: Boolean(item.featured),
          display_order: item.display_order || (this.data.products.length + 1),
          custom_fields: item.custom_fields || {},
          created_at: now,
          updated_at: now,
          created_by: userName,
          updated_by: userName
        };
        this.data.products.push(newProduct);
        updatedList.push(newProduct);
      }
    });

    this.save();
    this.logActivity({
      user_id: 'user',
      user_name: userName,
      action: 'GOOGLE_SHEETS_SYNC',
      entity_type: 'products',
      entity_id: 'bulk',
      metadata: { count: updatedList.length }
    });

    return this.data.products;
  }

  // Promotions
  getPromotions(onlyActive = false): Promotion[] {
    const now = new Date().toISOString().slice(0, 10);
    return this.data.promotions
      .filter(p => {
        if (!onlyActive) return true;
        if (p.status !== 'ACTIVE') return false;
        if (p.end_date && p.end_date < now) return false;
        return true;
      })
      .sort((a, b) => a.display_order - b.display_order);
  }

  addPromotion(promo: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promotion {
    const newPromo: Promotion = {
      ...promo,
      id: `promo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.promotions.push(newPromo);
    this.save();
    return newPromo;
  }

  updatePromotion(id: string, updates: Partial<Promotion>): Promotion | null {
    const idx = this.data.promotions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.promotions[idx] = {
      ...this.data.promotions[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.promotions[idx];
  }

  deletePromotion(id: string): boolean {
    const before = this.data.promotions.length;
    this.data.promotions = this.data.promotions.filter(p => p.id !== id);
    if (this.data.promotions.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  // Store Settings
  getStoreSettings(): StoreSettings {
    return this.data.store_settings;
  }

  updateStoreSettings(updates: Partial<StoreSettings>, userName: string): StoreSettings {
    this.data.store_settings = {
      ...this.data.store_settings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    this.logActivity({
      user_id: 'user',
      user_name: userName,
      action: 'STORE SETTINGS UPDATED',
      entity_type: 'store_settings',
      entity_id: this.data.store_settings.id,
      metadata: updates
    });
    return this.data.store_settings;
  }

  // Users & Auth
  findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserById(id: string): User | null {
    const u = this.data.users.find(usr => usr.id === id);
    if (!u) return null;
    const { password_hash, salt, ...safeUser } = u;
    return safeUser;
  }

  getUsers(): User[] {
    return this.data.users.map(({ password_hash, salt, ...safeUser }) => safeUser);
  }

  addUser(userData: { name: string; email: string; role: User['role']; password: string }, creatorName: string): User {
    const salt = generateSalt();
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'ACTIVE' as const,
      created_at: new Date().toISOString(),
      salt,
      password_hash: hashPassword(userData.password, salt)
    };
    this.data.users.push(newUser);
    this.save();
    this.logActivity({
      user_id: 'user',
      user_name: creatorName,
      action: 'USER CREATED',
      entity_type: 'user',
      entity_id: newUser.id,
      metadata: { name: newUser.name, role: newUser.role, email: newUser.email }
    });
    const { password_hash, salt: s, ...safe } = newUser;
    return safe;
  }

  updateUser(id: string, updates: Partial<User> & { password?: string }, actorName: string): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const existing = this.data.users[idx];

    let newHash = existing.password_hash;
    let newSalt = existing.salt;
    if (updates.password) {
      newSalt = generateSalt();
      newHash = hashPassword(updates.password, newSalt);
    }

    this.data.users[idx] = {
      ...existing,
      ...updates,
      password_hash: newHash,
      salt: newSalt
    };
    this.save();

    if (updates.role && updates.role !== existing.role) {
      this.logActivity({
        user_id: 'user',
        user_name: actorName,
        action: 'USER ROLE UPDATED',
        entity_type: 'user',
        entity_id: id,
        metadata: { old_role: existing.role, new_role: updates.role }
      });
    }

    const { password_hash, salt, ...safe } = this.data.users[idx];
    return safe;
  }

  updateLastLogin(userId: string) {
    const u = this.data.users.find(usr => usr.id === userId);
    if (u) {
      u.last_login = new Date().toISOString();
      this.save();
    }
  }

  // Orders
  getOrders(): Order[] {
    return [...this.data.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'status'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], userName: string): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updated_at = new Date().toISOString();
    this.save();
    this.logActivity({
      user_id: 'user',
      user_name: userName,
      action: 'ORDER STATUS UPDATED',
      entity_type: 'order',
      entity_id: orderId,
      metadata: { new_status: status }
    });
    return order;
  }

  // Activity Log
  logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.activity_logs.unshift(newLog);
    // Keep max 500 logs
    if (this.data.activity_logs.length > 500) {
      this.data.activity_logs = this.data.activity_logs.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  getActivityLogs(): ActivityLog[] {
    return this.data.activity_logs;
  }
}

export const db = new Database();
