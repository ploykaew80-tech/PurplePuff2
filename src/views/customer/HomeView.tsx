import React from 'react';
import { 
  Sparkles, 
  Grid, 
  Tag, 
  MessageCircle, 
  ArrowRight, 
  Clock, 
  Truck, 
  Flame, 
  ExternalLink 
} from 'lucide-react';
import { isStoreOpen } from '../../lib/storeTime';
import { CategoryCard } from '../../components/CategoryCard';
import { ProductCard } from '../../components/ProductCard';
import type { Category, Product, StoreSettings } from '../../types';

interface HomeViewProps {
  settings: StoreSettings | null;
  categories: Category[];
  featuredProducts: Product[];
  onSelectCategory: (categoryId: string) => void;
  onNavigateCatalog: () => void;
  onNavigatePromotion: () => void;
  onNavigateContact: () => void;
  onViewProductDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  categories,
  featuredProducts,
  onSelectCategory,
  onNavigateCatalog,
  onNavigatePromotion,
  onNavigateContact,
  onViewProductDetails,
  onAddToCart
}) => {
  const storeStatus = isStoreOpen(
    settings?.opening_time || '10:00',
    settings?.closing_time || '02:00'
  );

  return (
    <div id="customer-home-view" className="space-y-8 pb-12 animate-fade-in">
      {/* 1. HERO BANNER */}
      <section id="home-hero-banner" className="relative rounded-3xl overflow-hidden border border-purple-500/30 glow-purple">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full min-h-[260px] sm:min-h-[320px] bg-[#160a2d] overflow-hidden">
          {/* Background image */}
          <img
            src={settings?.banner_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'}
            alt="Purple Puff Hero"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0616] via-[#120826]/75 to-transparent" />
          
          {/* Subtle cosmic glow lights */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-fuchsia-500/20 rounded-full blur-3xl" />

          {/* Hero Content */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
            <div className="max-w-xl">
              {/* Delivery banner tag if delivery available */}
              {settings?.delivery_available && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-bold mb-3">
                  <Truck className="w-3.5 h-3.5" />
                  <span>🚚 มีบริการจัดส่งด่วน</span>
                </div>
              )}

              <p className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-purple-300 uppercase mb-1">
                WELCOME TO
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-2 drop-shadow-md">
                {settings?.store_name || 'PURPLE PUFF'}
              </h1>
              <p className="text-xs sm:text-base text-purple-200/90 font-medium mb-5 line-clamp-2">
                {settings?.description || 'Premium Store Experience — คัดสรรเฉพาะดอกคุณภาพเกรดพรีเมียม สดใหม่ กลิ่นแน่น'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="hero-cta-catalog-btn"
                  onClick={onNavigateCatalog}
                  className="py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 flex items-center gap-2 cursor-pointer transition active:scale-95 glow-purple-sm"
                >
                  <span>เลือกชมสินค้าทั้งหมด</span>
                  <ArrowRight className="w-4 h-4 text-yellow-300" />
                </button>

                <div className="px-3.5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-purple-500/20 flex items-center gap-2 text-xs font-semibold text-purple-200">
                  <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span>{storeStatus.badgeText} ({settings?.opening_time || '10:00'} — {settings?.closing_time || '02:00'})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS (3 buttons with Icon + Text) */}
      <section id="home-quick-actions" className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <button
          id="quick-action-all-products"
          onClick={onNavigateCatalog}
          className="p-3.5 sm:p-5 rounded-2xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/50 flex flex-col items-center text-center group cursor-pointer transition hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:text-white group-hover:scale-110 group-hover:bg-purple-600 transition mb-2 shadow-inner">
            <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-display">
            ดูสินค้าทั้งหมด
          </span>
          <span className="text-[10px] text-purple-300/60 hidden sm:block mt-0.5">
            สายพันธุ์และอุปกรณ์
          </span>
        </button>

        <button
          id="quick-action-promotion"
          onClick={onNavigatePromotion}
          className="p-3.5 sm:p-5 rounded-2xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/50 flex flex-col items-center text-center group cursor-pointer transition hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-fuchsia-900/50 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 group-hover:text-white group-hover:scale-110 group-hover:bg-fuchsia-600 transition mb-2 shadow-inner">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-display">
            โปรโมชั่น
          </span>
          <span className="text-[10px] text-purple-300/60 hidden sm:block mt-0.5">
            เซ็ตคุ้ม & ส่วนลดพิเศษ
          </span>
        </button>

        <button
          id="quick-action-contact"
          onClick={onNavigateContact}
          className="p-3.5 sm:p-5 rounded-2xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/50 flex flex-col items-center text-center group cursor-pointer transition hover:-translate-y-0.5"
        >
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:text-white group-hover:scale-110 group-hover:bg-indigo-600 transition mb-2 shadow-inner">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white font-display">
            ติดต่อร้าน
          </span>
          <span className="text-[10px] text-purple-300/60 hidden sm:block mt-0.5">
            LINE & Instagram
          </span>
        </button>
      </section>

      {/* 3. CATEGORY SECTION (EXPLORE CATEGORIES) */}
      <section id="home-categories-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <span>EXPLORE CATEGORIES</span>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </h2>
            <p className="text-xs text-purple-300/70">
              เลือกหมวดหมู่ที่ต้องการชม
            </p>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => onSelectCategory(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. FEATURED SECTION */}
      <section id="home-featured-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <span>FEATURED</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-purple-600 to-yellow-500 text-black uppercase">
                HOT
              </span>
            </h2>
            <p className="text-xs text-purple-300/70">
              สายพันธุ์เด่นคัดสรรยอดนิยม
            </p>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredProducts.slice(0, 4).map(product => {
            const cat = categories.find(c => c.id === product.category_id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={cat?.name}
                onViewDetails={onViewProductDetails}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer id="home-footer" className="mt-12 pt-8 border-t border-purple-900/40 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-black tracking-wider text-white font-display">
                {settings?.store_name || 'PURPLE PUFF'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              {settings?.description || 'Premium Store Experience — คัดเกรดพิเศษเพื่อสุนทรียะแห่งความผ่อนคลาย'}
            </p>
            {settings?.delivery_available && (
              <p className="text-xs text-yellow-300 font-semibold mt-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> มีบริการจัดส่งด่วน (Delivery Available)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              OPENING HOURS
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>{settings?.opening_time || '10:00'} — {settings?.closing_time || '02:00'} (ตีสอง)</span>
            </div>
            <p className="text-[11px] text-purple-400/80">
              *เปิดบริการทุกวัน รองรับการสั่งซื้อและจัดส่งช่วงดึก
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              CONTACT & SOCIAL MEDIA
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <a
                href={`https://line.me/R/ti/p/${(settings?.line_username || '@798shear').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200 hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                <span>LINE:</span>
                <span className="font-bold underline">{settings?.line_username || '@798shear'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={`https://instagram.com/${settings?.instagram_username || 'Pulplepuff'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200 hover:text-fuchsia-300 flex items-center gap-1.5 transition"
              >
                <span>Instagram:</span>
                <span className="font-bold underline">{settings?.instagram_username || 'Pulplepuff'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-950/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-purple-400/60 gap-2">
          <span>© {new Date().getFullYear()} {settings?.store_name || 'PURPLE PUFF'}. All rights reserved.</span>
          <span>สำหรับผู้มีอายุ 20 ปีบริบูรณ์ขึ้นไปเท่านั้น</span>
        </div>
      </footer>
    </div>
  );
};
