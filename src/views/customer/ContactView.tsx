import React from 'react';
import { 
  MessageCircle, 
  Instagram, 
  Clock, 
  MapPin, 
  Truck, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import type { StoreSettings } from '../../types';
import { isStoreOpen } from '../../lib/storeTime';

interface ContactViewProps {
  settings: StoreSettings | null;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings }) => {
  const storeStatus = isStoreOpen(
    settings?.opening_time || '10:00',
    settings?.closing_time || '02:00'
  );

  const lineHandle = settings?.line_username || '@798shear';
  const lineClean = lineHandle.replace('@', '');
  const lineUrl = `https://line.me/R/ti/p/${lineClean}`;

  const igHandle = settings?.instagram_username || 'Pulplepuff';
  const igUrl = `https://instagram.com/${igHandle}`;

  return (
    <div id="customer-contact-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
          <span>CONTACT PURPLE PUFF</span>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </h1>
        <p className="text-xs text-purple-300/80">
          ช่องทางติดต่อ สั่งซื้อด่วน สอบถามข้อมูล และที่ตั้งร้าน
        </p>
      </div>

      {/* Main Contact Card */}
      <div className="rounded-3xl bg-cosmic-card border border-purple-500/30 p-5 sm:p-8 space-y-6 glow-purple">
        {/* Store Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {settings?.store_name || 'PURPLE PUFF'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600/30 text-purple-200 border border-purple-500/30">
                OFFICIAL
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-1">
              {settings?.description || 'Premium Dispensary Store'}
            </p>
          </div>

          <div className={`px-3.5 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 self-start sm:self-auto ${
            storeStatus.isOpen 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>สถานะ: {storeStatus.badgeText} ({storeStatus.statusText})</span>
          </div>
        </div>

        {/* Primary Contact Buttons (LINE & Instagram) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LINE Button */}
          <a
            id="contact-line-btn"
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#06C755]/20 to-emerald-900/30 border border-[#06C755]/50 hover:border-[#06C755] transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#06C755] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-300 block">LINE OFFICIAL</span>
                <span className="text-base sm:text-lg font-black text-white group-hover:text-[#06C755] transition">
                  {lineHandle}
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">
                  แตะเพื่อแอดไลน์ & สั่งซื้อ
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </a>

          {/* Instagram Button */}
          <a
            id="contact-instagram-btn"
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-gradient-to-br from-fuchsia-950/30 to-purple-900/30 border border-fuchsia-500/40 hover:border-fuchsia-400 transition flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <Instagram className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-fuchsia-300 block">INSTAGRAM</span>
                <span className="text-base sm:text-lg font-black text-white group-hover:text-fuchsia-300 transition">
                  {igHandle}
                </span>
                <span className="text-[10px] text-fuchsia-400/80 block mt-0.5">
                  ติดตามภาพสินค้าและรีวิว
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-fuchsia-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </a>
        </div>

        {/* Operating Hours & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Opening Hours */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>OPENING HOURS (เวลาทำการ)</span>
            </div>
            <p className="text-xl font-extrabold text-white font-display">
              {settings?.opening_time || '10:00'} — {settings?.closing_time || '02:00'}
            </p>
            <p className="text-xs text-purple-300/80">
              *เปิดทำการทุกวัน ปิดตี 2 (ข้ามวัน overnight schedule)
            </p>
          </div>

          {/* Delivery Availability */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-yellow-300" />
              <span>DELIVERY SERVICE (บริการจัดส่ง)</span>
            </div>
            {settings?.delivery_available ? (
              <div>
                <p className="text-base sm:text-lg font-extrabold text-yellow-300 flex items-center gap-1.5">
                  <span>🚚 มีบริการจัดส่ง</span>
                </p>
                <p className="text-xs text-purple-200/80 mt-1">
                  จัดส่งด่วน Grab / Lalamove ทั่วกรุงเทพฯ และปริมณฑล หรือจัดส่งพัสดุด่วน
                </p>
              </div>
            ) : (
              <p className="text-xs text-purple-400">
                ขณะนี้งดบริการจัดส่งชั่วคราว ให้บริการเฉพาะรับหน้าร้าน
              </p>
            )}
          </div>
        </div>

        {/* Location & Policies */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 space-y-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                LOCATION & ADDRESS
              </span>
              <p className="text-xs sm:text-sm text-white font-medium mt-0.5">
                {settings?.location_address || 'Bangkok, Thailand (ให้บริการหน้าร้านและบริการจัดส่ง Express)'}
              </p>
              {settings?.google_maps && (
                <a
                  href={settings.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-white underline mt-1.5"
                >
                  <span>เปิดดูใน Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {settings?.store_policies && (
            <div className="pt-3 border-t border-purple-900/30 flex items-start gap-2 text-xs text-purple-300/80">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p>{settings.store_policies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
