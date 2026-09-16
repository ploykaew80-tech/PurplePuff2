import React from 'react';
import { Tag, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import type { Promotion } from '../../types';

interface PromotionViewProps {
  promotions: Promotion[];
  onNavigateCatalog: () => void;
}

export const PromotionView: React.FC<PromotionViewProps> = ({
  promotions,
  onNavigateCatalog
}) => {
  const activePromos = promotions.filter(p => p.status === 'ACTIVE');

  return (
    <div id="customer-promotion-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
          <span>PROMOTION</span>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </h1>
        <p className="text-xs text-purple-300/80">
          สิทธิพิเศษ โปรโมชั่น และเซ็ตสุดคุ้มประจำร้าน PURPLE PUFF
        </p>
      </div>

      {activePromos.length === 0 ? (
        <div id="no-active-promotions" className="py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-950/50 border border-purple-700/30 flex items-center justify-center text-purple-400">
            <Tag className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">NO ACTIVE PROMOTIONS</h3>
            <p className="text-xs text-purple-300/70 mt-1 max-w-xs mx-auto">
              ขณะนี้ยังไม่มีรายการโปรโมชั่นที่เปิดใช้งาน ติดตามอัปเดตดีลใหม่ได้เร็วๆ นี้
            </p>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white transition cursor-pointer"
          >
            <span>ดูสินค้าทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {activePromos.map(promo => (
            <div
              key={promo.id}
              id={`promo-card-${promo.id}`}
              className="rounded-3xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/40 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-purple-950/50 flex flex-col md:flex-row"
            >
              {/* Promo Banner Image */}
              <div className="relative md:w-2/5 aspect-[16/9] md:aspect-auto overflow-hidden bg-purple-950">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-purple-600 to-yellow-400 text-black uppercase tracking-wider shadow-md">
                    {promo.status}
                  </span>
                </div>
              </div>

              {/* Promo Details */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white font-display mb-2">
                    {promo.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200/85 leading-relaxed whitespace-pre-line mb-4">
                    {promo.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-purple-300/80">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>ระยะเวลา: {promo.start_date || 'เริ่มแล้ว'} {promo.end_date ? `— ${promo.end_date}` : ''}</span>
                  </div>

                  <button
                    onClick={onNavigateCatalog}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>เลือกซื้อสินค้าในโปรนี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
