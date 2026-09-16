import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  Image as ImageIcon, 
  Save,
  Upload,
  Copy,
  Zap,
  Tag
} from 'lucide-react';
import type { Product, Category, ProductType, ProductStatus, User } from '../../types';
import { uploadAdminImage } from '../../lib/api';
import { isEquipmentProduct, isEquipmentCategory, getProductUnitLabel } from '../../lib/productHelper';

interface AdminProductsViewProps {
  products: Product[];
  categories: Category[];
  currentUser: User;
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleStatus: (productId: string, newStatus: ProductStatus) => Promise<void>;
}

// Preset high quality cannabis images for quick selection
const CANNABIS_IMAGE_PRESETS = [
  { name: 'GDP Purple Bud', url: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80' },
  { name: 'Purple Punch Cut', url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lemon Popcorn', url: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gelato Crystals', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pre-Roll RAW', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cosmic Gummies', url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80' }
];

// Preset popular effects
const POPULAR_EFFECTS = [
  'ผ่อนคลายลึก',
  'หลับสบาย',
  'เคลิ้มสุข',
  'อารมณ์ดี',
  'ลดความเครียด',
  'โฟกัสดีเยี่ยม',
  'ตัวเบาสบาย',
  'มีพลังงาน',
  'เบิกบานใจ',
  'พร้อมสูบไว'
];

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  products,
  categories,
  currentUser,
  onSaveProduct,
  onDeleteProduct,
  onToggleStatus
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    category_id: categories[0]?.id || '',
    type: 'Hybrid',
    price: 350,
    status: 'AVAILABLE',
    effect_1: 'ผ่อนคลายลึก',
    effect_2: 'หลับสบาย',
    effect_3: 'เคลิ้มสุข',
    description: '',
    image_url: CANNABIS_IMAGE_PRESETS[0].url,
    featured: false,
    display_order: 1
  });

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      category_id: categories[0]?.id || '',
      type: 'Hybrid',
      price: 350,
      status: 'AVAILABLE',
      effect_1: 'ผ่อนคลายลึก',
      effect_2: 'หลับสบาย',
      effect_3: 'เคลิ้มสุข',
      description: '',
      image_url: CANNABIS_IMAGE_PRESETS[0].url,
      featured: false,
      display_order: products.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setEditingProduct(null);
    setFormData({
      ...product,
      id: undefined,
      product_name: `${product.product_name} (Copy)`,
      display_order: products.length + 1
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Image upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    try {
      setUploadingImage(true);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const uploadedUrl = await uploadAdminImage(dataUrl, 'product_img');
          setFormData(prev => ({ ...prev, image_url: uploadedUrl }));
        } catch {
          setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้');
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name?.trim()) {
      setErrorMessage('กรุณากรอกชื่อสินค้า');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      const isEdit = !!editingProduct;
      const isEquip = isEquipmentProduct(formData, categories);

      const cleanedData: Partial<Product> = {
        ...formData,
        product_name: formData.product_name.trim(),
        price: Number(formData.price) >= 0 ? Number(formData.price) : 0,
        display_order: Number(formData.display_order) || 1,
        // Equipment/devices do not have symptoms or bodily effects
        effect_1: isEquip ? '' : (formData.effect_1?.trim() || ''),
        effect_2: isEquip ? '' : (formData.effect_2?.trim() || ''),
        effect_3: isEquip ? '' : (formData.effect_3?.trim() || '')
      };

      if (editingProduct) {
        cleanedData.id = editingProduct.id;
      }

      await onSaveProduct(cleanedData);
      setIsModalOpen(false);
      showNotification(isEdit ? 'อัปเดตข้อมูลสินค้าสำเร็จแล้ว' : 'เพิ่มสินค้าใหม่ลงในระบบเรียบร้อยแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'บันทึกสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const addEffectTag = (effect: string) => {
    if (!formData.effect_1) {
      setFormData({ ...formData, effect_1: effect });
    } else if (!formData.effect_2) {
      setFormData({ ...formData, effect_2: effect });
    } else if (!formData.effect_3) {
      setFormData({ ...formData, effect_3: effect });
    } else {
      // Rotate
      setFormData({ ...formData, effect_1: formData.effect_2, effect_2: formData.effect_3, effect_3: effect });
    }
  };

  const filteredProducts = products.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.product_name.toLowerCase().includes(q);
      const matchEffects = [p.effect_1, p.effect_2, p.effect_3].some(e => e?.toLowerCase().includes(q));
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchEffects && !matchDesc) return false;
    }
    if (categoryFilter !== 'ALL' && p.category_id !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div id="admin-products-view" className="space-y-6 animate-fade-in pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>PRODUCT MANAGEMENT</span>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </h2>
          <p className="text-xs text-purple-300/80">
            เพิ่มสินค้าใหม่ แก้ไขข้อมูล ปรับราคา เปลี่ยนรูปภาพ และจัดการสต็อก (รวม {products.length} รายการ)
          </p>
        </div>

        {/* Big Add Product Button */}
        <button
          onClick={handleOpenAdd}
          className="py-3 px-5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-xl shadow-purple-950/60 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มสินค้าใหม่ (ADD PRODUCT)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-scale-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า สายพันธุ์ หรือเอฟเฟกต์..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-xs text-white placeholder:text-purple-400/50 focus:border-yellow-400 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-white focus:border-yellow-400 focus:outline-none cursor-pointer"
        >
          <option value="ALL">ทุกหมวดหมู่ ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-white focus:border-yellow-400 focus:outline-none cursor-pointer"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="AVAILABLE">พร้อมจำหน่าย (AVAILABLE)</option>
          <option value="SOLD OUT">สินค้าหมด (SOLD OUT)</option>
        </select>
      </div>

      {/* Product List Table / Grid */}
      <div className="rounded-3xl bg-cosmic-card border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-900/40 bg-purple-950/40 text-[11px] font-black uppercase text-purple-300 tracking-wider">
                <th className="p-3.5 pl-5">สินค้า</th>
                <th className="p-3.5">หมวดหมู่</th>
                <th className="p-3.5">สายพันธุ์</th>
                <th className="p-3.5">ราคา (฿)</th>
                <th className="p-3.5">สถานะสต็อก</th>
                <th className="p-3.5 text-center">แนะนำ</th>
                <th className="p-3.5 pr-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-purple-400/60">
                    <p className="font-semibold text-sm mb-2">ไม่พบสินค้าที่ค้นหา</p>
                    <button
                      onClick={handleOpenAdd}
                      className="px-4 py-2 rounded-xl bg-purple-800/50 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มสินค้าใหม่ตอนนี้</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const cat = categories.find(c => c.id === product.category_id);
                  const isAvailable = product.status === 'AVAILABLE';
                  const isEquip = isEquipmentProduct(product, categories);

                  return (
                    <tr key={product.id} className="hover:bg-purple-900/20 transition">
                      {/* Product Name & Image */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-11 h-11 rounded-xl object-cover border border-purple-500/30 shrink-0 bg-purple-950"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = CANNABIS_IMAGE_PRESETS[0].url;
                            }}
                          />
                          <div>
                            <span className="font-black text-white text-xs block truncate max-w-[190px]">
                              {product.product_name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {isEquip ? (
                                <span className="text-[10px] text-blue-300/90 bg-blue-950/70 px-1.5 py-0.2 rounded border border-blue-800/40">
                                  🛠️ อุปกรณ์
                                </span>
                              ) : (
                                <>
                                  {product.effect_1 && (
                                    <span className="text-[10px] text-purple-300/80 bg-purple-950/60 px-1.5 py-0.2 rounded">
                                      #{product.effect_1}
                                    </span>
                                  )}
                                  {product.effect_2 && (
                                    <span className="text-[10px] text-purple-300/80 bg-purple-950/60 px-1.5 py-0.2 rounded">
                                      #{product.effect_2}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[11px] font-bold inline-flex items-center gap-1.5">
                          <span>{cat?.icon || '✨'}</span>
                          <span>{cat?.name || 'ทั่วไป'}</span>
                        </span>
                      </td>

                      {/* Type */}
                      <td className="p-3.5">
                        {isEquip ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black border uppercase bg-blue-950 text-blue-300 border-blue-700/50">
                            อุปกรณ์
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase ${
                            product.type === 'Indica'
                              ? 'bg-purple-950 text-purple-300 border-purple-700/50'
                              : product.type === 'Sativa'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                          }`}>
                            {product.type}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="p-3.5">
                        <span className="font-black text-yellow-300 font-display text-sm">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-purple-400 block font-sans">
                          {getProductUnitLabel(product, categories)}
                        </span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="p-3.5">
                        <button
                          onClick={() => onToggleStatus(product.id, isAvailable ? 'SOLD OUT' : 'AVAILABLE')}
                          className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 hover:bg-rose-900/70'
                          }`}
                          title="คลิกเพื่อสลับสถานะสินค้า"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{isAvailable ? 'พร้อมขาย' : 'สินค้าหมด'}</span>
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="p-3.5 text-center">
                        {product.featured ? (
                          <span className="inline-flex items-center gap-1 text-yellow-400 font-black text-[10px] bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                            <Sparkles className="w-3 h-3" /> YES
                          </span>
                        ) : (
                          <span className="text-purple-400/40 text-[10px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 transition cursor-pointer"
                            title="คัดลอกสินค้า (Duplicate)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-700 text-purple-100 transition cursor-pointer"
                            title="แก้ไขข้อมูลสินค้า"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 transition cursor-pointer"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1d0a33] border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-display">ยืนยันการลบสินค้า</h3>
            <p className="text-xs text-purple-300/80">
              คุณต้องการลบสินค้านี้ออกจากระบบหรือไม่? สินค้าจะไม่แสดงในแคตตาล็อกของลูกค้าอีกต่อไป
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-purple-900/50 text-purple-200 hover:bg-purple-900"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  await onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showNotification('ลบสินค้าเรียบร้อยแล้ว');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1e0d3b] via-[#140827] to-[#0d0519] border-2 border-purple-500/40 p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-2">
                  <span>{editingProduct ? 'EDIT PRODUCT (แก้ไขสินค้า)' : 'ADD NEW PRODUCT (เพิ่มสินค้าใหม่)'}</span>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-xs text-purple-300/70">
                  กรอกรายละเอียดสินค้า รูปภาพ สายพันธุ์ ราคา และเอฟเฟกต์
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-purple-900/40 text-purple-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    ชื่อสินค้า (PRODUCT NAME) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name || ''}
                    onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
                    placeholder="เช่น Granddaddy Purple (GDP), Cosmic Punch"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    หมวดหมู่ (CATEGORY) *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Strain Type */}
                <div>
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    {isEquipmentProduct(formData, categories) ? 'ประเภทสินค้า (TYPE)' : 'สายพันธุ์ (STRAIN TYPE) *'}
                  </label>
                  {isEquipmentProduct(formData, categories) ? (
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span>🛠️ อุปกรณ์ / ของใช้ทั่วไป</span>
                    </div>
                  ) : (
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as ProductType })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none cursor-pointer"
                    >
                      <option value="Hybrid">Hybrid (ไฮบริด)</option>
                      <option value="Indica">Indica (อินดิก้า - ผ่อนคลาย)</option>
                      <option value="Sativa">Sativa (ซาติว่า - ตื่นตัว)</option>
                    </select>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    {isEquipmentProduct(formData, categories) ? 'ราคาต่อชิ้น (PRICE IN ฿) *' : 'ราคาต่อหน่วย / 1G (PRICE IN ฿) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10"
                    value={formData.price ?? 350}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none font-bold"
                  />
                </div>

                {/* Availability Status */}
                <div>
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    สถานะสต็อก (STOCK STATUS) *
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none cursor-pointer"
                  >
                    <option value="AVAILABLE">AVAILABLE (พร้อมจำหน่าย)</option>
                    <option value="SOLD OUT">SOLD OUT (สินค้าหมด)</option>
                  </select>
                </div>

                {/* IMAGE MANAGEMENT */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-yellow-300" />
                      <span>รูปภาพสินค้า (PRODUCT IMAGE) *</span>
                    </label>

                    {/* Image Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'กำลังอัปโหลด...' : '📁 อัปโหลดรูปจากเครื่อง'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-purple-950 border border-purple-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={formData.image_url || CANNABIS_IMAGE_PRESETS[0].url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={formData.image_url || ''}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://... หรือ /uploads/..."
                        className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs focus:border-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset Cannabis Images */}
                  <div>
                    <span className="text-[10px] font-bold text-purple-300/80 block mb-1.5">
                      หรือเลือกจากคอลเลกชันภาพสำเร็จรูป:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CANNABIS_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: preset.url })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                            formData.image_url === preset.url
                              ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50'
                              : 'bg-purple-900/40 text-purple-300 border-purple-800/40 hover:border-purple-600'
                          }`}
                        >
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Effects (3 Slots) - Omitted for Equipment */}
                <div className="sm:col-span-2">
                  {isEquipmentProduct(formData, categories) ? (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-blue-200 text-xs">
                      <Sparkles className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-blue-100 text-sm">
                          หมวดหมู่อุปกรณ์ / ของทั่วไป: ไม่ต้องระบุอาการ (No Symptoms / Effects)
                        </p>
                        <p className="text-blue-300/80 leading-relaxed">
                          สินค้านี้ถูกระบุเป็นอุปกรณ์หรือของทั่วไป ระบบจะซ่อนและล้างข้อมูลอาการให้อัตโนมัติ เพื่อให้หน้าอุปกรณ์แสดงผลข้อมูลที่ถูกต้องและสะอาดตา
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-yellow-300" />
                          <span>เอฟเฟกต์ 3 อันดับ (EFFECTS)</span>
                        </label>
                        <span className="text-[10px] text-purple-400">คลิกที่คำแนะนำด้านล่างเพื่อใส่ไว</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={formData.effect_1 || ''}
                          onChange={e => setFormData({ ...formData, effect_1: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs"
                          placeholder="Effect 1 (เช่น ผ่อนคลาย)"
                        />
                        <input
                          type="text"
                          value={formData.effect_2 || ''}
                          onChange={e => setFormData({ ...formData, effect_2: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs"
                          placeholder="Effect 2 (เช่น หลับสบาย)"
                        />
                        <input
                          type="text"
                          value={formData.effect_3 || ''}
                          onChange={e => setFormData({ ...formData, effect_3: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs"
                          placeholder="Effect 3 (เช่น เคลิ้มสุข)"
                        />
                      </div>

                      {/* Popular Effect Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {POPULAR_EFFECTS.map((eff, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addEffectTag(eff)}
                            className="px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/40 hover:border-yellow-400 text-purple-300 text-[10px] cursor-pointer transition"
                          >
                            +{eff}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Order */}
                <div>
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    ลำดับการแสดงผล (DISPLAY ORDER)
                  </label>
                  <input
                    type="number"
                    value={formData.display_order ?? 1}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-purple-200">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-purple-950 border-purple-700 text-purple-600 accent-purple-600"
                    />
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>สินค้าแนะนำหน้าแรก (Featured Product)</span>
                    </span>
                  </label>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-purple-200 block mb-1">
                    รายละเอียดสินค้า & กลิ่นสัมผัส (DESCRIPTION)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-yellow-400 focus:outline-none"
                    placeholder="อธิบายกลิ่น เทอร์พีน โทนสีม่วง ฟีลลิ่ง และสายพันธุ์แม่..."
                  />
                </div>
              </div>

              {/* Bottom Submit Buttons */}
              <div className="pt-4 border-t border-purple-900/40 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-950/60 text-purple-300 hover:text-white cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'กำลังบันทึก...' : (editingProduct ? 'บันทึกการแก้ไข' : '+ เพิ่มสินค้านี้ลงระบบ')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
