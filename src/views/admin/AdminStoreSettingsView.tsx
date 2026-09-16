import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Truck, 
  MessageCircle, 
  Instagram, 
  MapPin, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  RefreshCw,
  Phone,
  Eye
} from 'lucide-react';
import type { StoreSettings, User } from '../../types';
import { uploadAdminImage } from '../../lib/api';

interface AdminStoreSettingsViewProps {
  settings: StoreSettings | null;
  currentUser: User;
  onSaveSettings: (settings: Partial<StoreSettings>) => Promise<void>;
}

export const AdminStoreSettingsView: React.FC<AdminStoreSettingsViewProps> = ({
  settings,
  currentUser,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<Partial<StoreSettings>>({
    store_name: settings?.store_name || 'PURPLE PUFF',
    description: settings?.description || 'Premium Cosmic Store Experience',
    logo_url: settings?.logo_url || '/logo.png',
    banner_url: settings?.banner_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    opening_time: settings?.opening_time || '10:00',
    closing_time: settings?.closing_time || '02:00',
    line_username: settings?.line_username || '@798shear',
    instagram_username: settings?.instagram_username || 'Pulplepuff',
    contact: settings?.contact || '081-798-SHEAR',
    delivery_available: settings?.delivery_available ?? true,
    location_address: settings?.location_address || 'Bangkok, Thailand (ให้บริการหน้าร้าน & จัดส่ง Express)',
    google_maps: settings?.google_maps || 'https://maps.google.com/?q=Bangkok+Thailand',
    store_policies: settings?.store_policies || 'ผู้ซื้อต้องมีอายุตั้งแต่ 20 ปีบริบูรณ์ขึ้นไป ห้ามสตรีมีครรภ์หรือให้นมบุตรใช้งาน สินค้าเพื่อการผ่อนคลายและดูแลสุขภาวะเท่านั้น'
  });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Logo file upload handler
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WebP)');
      return;
    }

    try {
      setUploadingLogo(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          // Upload to server
          const uploadedUrl = await uploadAdminImage(dataUrl, 'store_logo');
          setFormData(prev => ({ ...prev, logo_url: uploadedUrl }));
        } catch (uploadErr: any) {
          // Fallback to dataUrl directly if server upload fails
          setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้');
      setUploadingLogo(false);
    }
  };

  // Banner file upload handler
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    try {
      setUploadingBanner(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const uploadedUrl = await uploadAdminImage(dataUrl, 'store_banner');
          setFormData(prev => ({ ...prev, banner_url: uploadedUrl }));
        } catch {
          setFormData(prev => ({ ...prev, banner_url: reader.result as string }));
        } finally {
          setUploadingBanner(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้');
      setUploadingBanner(false);
    }
  };

  const handleResetDefaultLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '/logo.png' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      await onSaveSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-store-settings-view" className="space-y-6 animate-fade-in max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
            <span>STORE & BRAND SETTINGS</span>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </h2>
          <p className="text-xs text-purple-300/80">
            แก้ไขโลโก้ร้าน แบนเนอร์ ชื่อแบรนด์ เวลาเปิด-ปิด และข้อมูลทุกอย่างของร้าน
          </p>
        </div>

        {/* Quick View Current Store Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-900/40 text-purple-200 border border-purple-700/40">
            แก้ไขโดย: {currentUser.name}
          </span>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-scale-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>บันทึกการตั้งค่าร้านค้าและโลโก้เรียบร้อยแล้ว! ข้อมูลหน้าแอพและลูกค้าเปลี่ยนทันที</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================ */}
        {/* SECTION 1: STORE LOGO & BRAND ASSETS (HIGHLIGHTED PER REQUEST) */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#200b3d] to-[#120625] border-2 border-purple-500/40 space-y-6 shadow-2xl glow-purple">
          <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
            <h3 className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-yellow-300" />
              <span>โลโก้ร้าน & ภาพแบรนด์ (STORE LOGO & BRAND ASSETS)</span>
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
              CUSTOM LOGO
            </span>
          </div>

          {/* Logo Editor Panel */}
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40">
            {/* Logo Live Visual Display */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-yellow-400 p-[2px] shadow-xl relative group">
                <div className="w-full h-full rounded-[22px] bg-[#120826] p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.logo_url || '/logo.png'}
                    alt="Store Logo"
                    className="w-full h-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center text-xs font-bold text-yellow-300">
                    กำลังอัปโหลด...
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-purple-300 tracking-wider">
                ตัวอย่างโลโก้ปัจจุบัน
              </span>
            </div>

            {/* Logo Controls */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-xs font-black text-purple-200 block mb-1.5 flex items-center justify-between">
                  <span>URL รูปภาพโลโก้ร้าน (LOGO IMAGE URL)</span>
                  <span className="text-[10px] text-purple-400 font-normal">รองรับลิงก์ URL หรืออัปโหลดไฟล์</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo_url || ''}
                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="/logo.png หรือ https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload & Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'กำลังอัปโหลดไฟล์...' : '📁 เลือกไฟล์รูปภาพจากเครื่อง'}</span>
                </button>

                {/* Reset to Mascot Logo */}
                <button
                  type="button"
                  onClick={handleResetDefaultLogo}
                  className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-yellow-300 border border-purple-700/60 text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>ใช้โลโก้มาสคอต PURPLE PUFF</span>
                </button>
              </div>

              <p className="text-[11px] text-purple-300/70">
                *โลโก้นี้จะปรากฏที่ Header บนสุด, Splash Screen ตอนเปิดแอพ, หน้ารายละเอียดร้าน, หน้า Admin และข้อความแชร์
              </p>
            </div>
          </div>

          {/* Banner Editor Panel */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-200">
                ภาพแบนเนอร์หน้าร้าน (STORE HERO BANNER)
              </label>
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={uploadingBanner}
                className="px-3 py-1.5 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingBanner ? 'กำลังอัปโหลด...' : 'อัปโหลดภาพแบนเนอร์'}</span>
              </button>
              <input
                type="file"
                ref={bannerFileInputRef}
                onChange={handleBannerFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Banner Preview */}
            <div className="w-full h-28 sm:h-36 rounded-2xl overflow-hidden border border-purple-700/40 relative">
              <img
                src={formData.banner_url || ''}
                alt="Store Banner Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end p-3">
                <span className="text-xs font-extrabold text-white">
                  ตัวอย่างการแสดงผลบนหน้าแรก (Home View)
                </span>
              </div>
            </div>

            <input
              type="text"
              value={formData.banner_url || ''}
              onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: STORE NAME & BRANDING */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <span>ชื่อร้าน & สโลแกน (STORE BRANDING)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1">
                ชื่อร้านค้า (STORE NAME) *
              </label>
              <input
                type="text"
                required
                value={formData.store_name || ''}
                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1">
                สโลแกน / คำโปรย (SLOGAN)
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: OPENING HOURS */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>เวลาเปิด-ปิด (BUSINESS HOURS - รองรับข้ามวัน)</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/40">
              10:00 - 02:00
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1">
                เวลาเปิด (OPENING TIME)
              </label>
              <input
                type="time"
                value={formData.opening_time || '10:00'}
                onChange={e => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1">
                เวลาปิด (CLOSING TIME - เช่น 02:00 ตีสอง)
              </label>
              <input
                type="time"
                value={formData.closing_time || '02:00'}
                onChange={e => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-purple-400/80">
            *ระบบคำนวณสถานะ OPEN / CLOSED แบบ Real-time ตามเวลาประเทศไทย โดยรองรับการเปิดทำการข้ามวันถึงตีสอง
          </p>
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: CONTACT & SOCIAL CHANNELS */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple-400" />
            <span>ช่องทางติดต่อ & ที่ตั้งร้าน (CONTACT & LOCATION)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#06C755]" />
                <span>LINE USERNAME (LINE ID)</span>
              </label>
              <input
                type="text"
                value={formData.line_username || ''}
                onChange={e => setFormData({ ...formData, line_username: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                placeholder="@798shear"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>INSTAGRAM USERNAME</span>
              </label>
              <input
                type="text"
                value={formData.instagram_username || ''}
                onChange={e => setFormData({ ...formData, instagram_username: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Pulplepuff"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-yellow-300" />
                <span>เบอร์โทรศัพท์ติดต่อ (PHONE NUMBER)</span>
              </label>
              <input
                type="text"
                value={formData.contact || ''}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                placeholder="081-798-SHEAR"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>GOOGLE MAPS URL</span>
              </label>
              <input
                type="url"
                value={formData.google_maps || ''}
                onChange={e => setFormData({ ...formData, google_maps: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-purple-300 block mb-1">
                ที่ตั้งร้าน (STORE ADDRESS / LOCATION)
              </label>
              <input
                type="text"
                value={formData.location_address || ''}
                onChange={e => setFormData({ ...formData, location_address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
                placeholder="Bangkok, Thailand (ให้บริการหน้าร้าน & จัดส่ง Express)"
              />
            </div>

            {/* Delivery Toggle */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center text-yellow-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    DELIVERY_AVAILABLE (บริการจัดส่งถึงที่)
                  </span>
                  <span className="text-[11px] text-purple-300/70">
                    เปิดแสดง Badge "🚚 มีบริการจัดส่ง" ทั่วทั้งแอพ และเปิดให้ลูกค้าเลือกจัดส่งในตระกร้า
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.delivery_available}
                  onChange={e => setFormData({ ...formData, delivery_available: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-yellow-500 border border-purple-700/50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 5: STORE POLICIES */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
            นโยบายและข้อกำหนดร้านค้า (STORE POLICIES & LEGAL)
          </h3>
          <textarea
            rows={3}
            value={formData.store_policies || ''}
            onChange={e => setFormData({ ...formData, store_policies: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
            placeholder="ระบุข้อกำหนดทางกฎหมาย อายุผู้ซื้อ นโยบายการจัดส่ง..."
          />
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="py-4 px-10 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-xl shadow-purple-900/50 flex items-center gap-2.5 cursor-pointer transition active:scale-98 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'SAVE SETTINGS (บันทึกข้อมูลร้านทั้งหมด)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
