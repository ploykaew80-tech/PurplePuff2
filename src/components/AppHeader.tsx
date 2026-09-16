import React from 'react';
import { ShoppingBag, Lock, Sparkles, Clock } from 'lucide-react';
import { isStoreOpen } from '../lib/storeTime';
import type { StoreSettings } from '../types';

interface AppHeaderProps {
  settings: StoreSettings | null;
  cartCount: number;
  onOpenCart: () => void;
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onGoHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onAdminClick,
  isAdminLoggedIn,
  onGoHome
}) => {
  const storeStatus = isStoreOpen(
    settings?.opening_time || '10:00',
    settings?.closing_time || '02:00'
  );

  return (
    <header 
      id="app-header"
      className="sticky top-0 z-40 w-full bg-[#0d071d]/90 backdrop-blur-md border-b border-purple-900/40 px-4 py-3 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <button
          id="header-brand-btn"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-600 p-[1.5px] shadow-md group-hover:scale-105 transition overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-[#120826] flex items-center justify-center overflow-hidden">
              <img
                src={settings?.logo_url || '/logo.png'}
                alt={settings?.store_name || 'PURPLE PUFF'}
                className="w-full h-full object-contain p-0.5 rounded-[10px]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to text if broken
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-white font-display leading-tight">
                {settings?.store_name || 'PURPLE PUFF'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300/30" />
            </div>
            <p className="text-[10px] font-semibold text-purple-300/70 tracking-widest uppercase">
              {settings?.description ? settings.description.slice(0, 30) : 'Cosmic Dispensary'}
            </p>
          </div>
        </button>

        {/* Right Section: Store Status, Cart & Admin Access */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Store Status Indicator */}
          <div 
            id="header-store-status"
            className={`hidden xs:flex sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
              storeStatus.isOpen
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="font-bold">{storeStatus.badgeText}</span>
            <span className="text-purple-300/60 hidden md:inline">|</span>
            <span className="text-[11px] text-purple-200/80 hidden md:inline flex items-center gap-1">
              <Clock className="w-3 h-3 inline" />
              {storeStatus.statusText}
            </span>
          </div>

          {/* Cart Icon Button */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition cursor-pointer active:scale-95"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-5 h-5 text-purple-200" />
            {cartCount > 0 && (
              <span 
                id="cart-badge-count"
                className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-yellow-400 text-black text-[11px] font-extrabold flex items-center justify-center shadow-lg animate-scale-in"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Switch Button */}
          <button
            id="header-admin-btn"
            onClick={onAdminClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-95 ${
              isAdminLoggedIn
                ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-yellow-200 border-purple-400/50 glow-purple-sm'
                : 'bg-purple-950/40 text-purple-300 hover:text-white border-purple-800/40 hover:bg-purple-900/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isAdminLoggedIn ? 'ADMIN PANEL' : 'ADMIN'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
