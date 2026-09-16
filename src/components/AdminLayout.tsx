import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Tag, 
  Settings, 
  Users, 
  History, 
  LogOut, 
  Store, 
  Menu, 
  X, 
  Shield, 
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';
import type { User } from '../types';

export type AdminTab = 
  | 'DASHBOARD' 
  | 'PRODUCTS' 
  | 'CATEGORIES' 
  | 'PROMOTIONS' 
  | 'ORDERS'
  | 'GOOGLE_SHEETS'
  | 'STORE_SETTINGS' 
  | 'USERS' 
  | 'ACTIVITY_LOG';

interface AdminLayoutProps {
  currentUser: User;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onBackToStore: () => void;
  children: React.ReactNode;
  logoUrl?: string;
  storeName?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  onBackToStore,
  children,
  logoUrl = '/logo.png',
  storeName = 'PURPLE PUFF'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = currentUser.role === 'SUPER ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || isSuperAdmin;

  const navItems = [
    { id: 'DASHBOARD' as AdminTab, label: 'DASHBOARD', icon: LayoutDashboard, allowed: true },
    { id: 'PRODUCTS' as AdminTab, label: 'PRODUCTS', icon: Package, allowed: true },
    { id: 'CATEGORIES' as AdminTab, label: 'CATEGORIES', icon: Layers, allowed: isAdmin },
    { id: 'PROMOTIONS' as AdminTab, label: 'PROMOTIONS', icon: Tag, allowed: isAdmin },
    { id: 'ORDERS' as AdminTab, label: 'ORDERS', icon: ShoppingBag, allowed: true },
    { id: 'GOOGLE_SHEETS' as AdminTab, label: 'GOOGLE SHEETS', icon: FileSpreadsheet, allowed: isAdmin },
    { id: 'STORE_SETTINGS' as AdminTab, label: 'STORE SETTINGS', icon: Settings, allowed: isAdmin },
    { id: 'USERS' as AdminTab, label: 'USERS', icon: Users, allowed: isSuperAdmin },
    { id: 'ACTIVITY_LOG' as AdminTab, label: 'ACTIVITY LOG', icon: History, allowed: isAdmin },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div id="admin-layout" className="min-h-screen bg-[#090412] text-[#f3e8ff] flex flex-col md:flex-row">
      {/* Top Mobile Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#120726]/95 backdrop-blur-md border-b border-purple-900/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-purple-900/40 text-purple-200 border border-purple-800/40"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm text-white font-display">
            {storeName} ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-800/60 text-yellow-300 border border-purple-600/40">
            {currentUser.role}
          </span>
          <button
            onClick={onLogout}
            className="p-2 text-rose-300 hover:text-rose-200 cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sidebar: Desktop & Mobile Drawer */}
      <aside
        id="admin-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 w-64 h-screen bg-[#110723] border-r border-purple-900/40 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-[9px] bg-[#120826] flex items-center justify-center overflow-hidden">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="w-full h-full object-contain p-0.5"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white font-display">
                  {storeName}
                </h2>
                <span className="text-[10px] font-bold text-purple-400 tracking-wider">
                  ADMIN DASHBOARD
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-purple-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Capsule */}
          <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-purple-950/40 border border-purple-800/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-800/70 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-300/90">
                <Shield className="w-3 h-3 text-purple-400 shrink-0" />
                <span>{currentUser.role}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.filter(item => item.allowed).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id.toLowerCase()}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-950/50 glow-purple-sm'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-purple-900/40 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-800/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Store className="w-4 h-4 text-purple-400" />
            <span>ไปหน้าร้าน (Customer View)</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Desktop Top Header */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-purple-900/40">
          <div>
            <span className="text-xs font-extrabold text-purple-400 tracking-wider uppercase">
              ADMIN CONTROL CENTER
            </span>
            <h1 className="text-2xl font-black text-white font-display">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-800/40 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <div className="h-6 w-[1px] bg-purple-900/60" />

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
              <div className="w-7 h-7 rounded-full bg-purple-700/60 flex items-center justify-center text-xs font-black text-white">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                <span className="text-[10px] font-semibold text-yellow-300">{currentUser.role}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {children}
      </main>
    </div>
  );
};
