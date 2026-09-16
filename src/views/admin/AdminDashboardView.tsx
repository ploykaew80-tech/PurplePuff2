import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  ShoppingBag, 
  Plus, 
  Edit, 
  Layers, 
  Settings, 
  Clock, 
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';
import type { AdminStats, ActivityLog, User } from '../../types';
import type { AdminTab } from '../../components/AdminLayout';

interface AdminDashboardViewProps {
  stats: AdminStats | null;
  activityLogs: ActivityLog[];
  currentUser: User;
  onNavigateTab: (tab: AdminTab) => void;
  onQuickAddProduct: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  activityLogs,
  currentUser,
  onNavigateTab,
  onQuickAddProduct
}) => {
  const statCards = [
    {
      title: 'TOTAL PRODUCTS',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      subtitle: 'สินค้าทั้งหมดในระบบ',
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'text-purple-300 bg-purple-900/40 border-purple-500/30'
    },
    {
      title: 'AVAILABLE',
      value: stats?.availableProducts ?? 0,
      icon: CheckCircle2,
      subtitle: 'พร้อมจำหน่าย',
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'text-emerald-300 bg-emerald-900/40 border-emerald-500/30'
    },
    {
      title: 'SOLD OUT',
      value: stats?.soldOutProducts ?? 0,
      icon: AlertCircle,
      subtitle: 'สินค้าหมดชั่วคราว',
      color: 'from-rose-600 to-red-600',
      badgeColor: 'text-rose-300 bg-rose-900/40 border-rose-500/30'
    },
    {
      title: 'ACTIVE PROMOTIONS',
      value: stats?.activePromotions ?? 0,
      icon: Tag,
      subtitle: 'โปรโมชั่นที่เปิดใช้งาน',
      color: 'from-amber-500 to-fuchsia-600',
      badgeColor: 'text-yellow-300 bg-yellow-900/40 border-yellow-500/30'
    }
  ];

  return (
    <div id="admin-dashboard-view" className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#241147] via-[#1a0c36] to-[#120726] border border-purple-500/30 glow-purple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest block mb-1">
            ยินดีต้อนรับสู่ระบบบริหารจัดการ
          </span>
          <h2 className="text-2xl font-black text-white font-display">
            สวัสดี, {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            สิทธิ์การใช้งาน: <strong className="text-white">{currentUser.role}</strong> — ข้อมูลและสถานะอัปเดตแบบเรียลไทม์
          </p>
        </div>

        <button
          onClick={onQuickAddProduct}
          className="py-3 px-5 rounded-2xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-yellow-200" />
          <span>+ ADD PRODUCT</span>
        </button>
      </div>

      {/* 1. Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-3xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/40 transition flex flex-col justify-between shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-purple-300 uppercase font-display">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                  {card.value}
                </span>
                <p className="text-[11px] text-purple-400/80 mt-1 truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 2. Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-sm font-extrabold text-purple-200 uppercase tracking-wider font-display">
          QUICK ACTIONS (เมนูด่วน)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            id="quick-add-product"
            onClick={onQuickAddProduct}
            className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/30 hover:border-purple-400/50 text-left transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 group-hover:text-white flex items-center justify-center mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block">ADD PRODUCT</span>
            <span className="text-[10px] text-purple-400">เพิ่มสินค้าใหม่</span>
          </button>

          <button
            id="quick-edit-products"
            onClick={() => onNavigateTab('PRODUCTS')}
            className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/30 hover:border-purple-400/50 text-left transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 group-hover:text-white flex items-center justify-center mb-2">
              <Edit className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block">EDIT PRODUCTS</span>
            <span className="text-[10px] text-purple-400">จัดการรายการสินค้า</span>
          </button>

          <button
            id="quick-manage-categories"
            onClick={() => onNavigateTab('CATEGORIES')}
            className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/30 hover:border-purple-400/50 text-left transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-fuchsia-600/30 text-fuchsia-300 group-hover:text-white flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block">MANAGE CATEGORIES</span>
            <span className="text-[10px] text-purple-400">หมวดหมู่และไอคอน</span>
          </button>

          <button
            id="quick-manage-promotions"
            onClick={() => onNavigateTab('PROMOTIONS')}
            className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/30 hover:border-purple-400/50 text-left transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-300 group-hover:text-white flex items-center justify-center mb-2">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block">MANAGE PROMOTIONS</span>
            <span className="text-[10px] text-purple-400">โปรโมชั่นและแบนเนอร์</span>
          </button>

          <button
            id="quick-store-settings"
            onClick={() => onNavigateTab('STORE_SETTINGS')}
            className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/30 hover:border-purple-400/50 text-left transition cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 group-hover:text-white flex items-center justify-center mb-2">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block">STORE SETTINGS</span>
            <span className="text-[10px] text-purple-400">ข้อมูลร้านและเวลาเปิด</span>
          </button>
        </div>
      </section>

      {/* 3. Recent Activity Log */}
      <section className="rounded-3xl bg-cosmic-card border border-purple-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-display">
              RECENT ACTIVITY (กิจกรรมล่าสุด)
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('ACTIVITY_LOG')}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activityLogs.length === 0 ? (
          <div className="py-8 text-center text-purple-400/60 text-xs">
            ยังไม่มีประวัติกิจกรรมล่าสุด
          </div>
        ) : (
          <div className="divide-y divide-purple-900/30">
            {activityLogs.slice(0, 6).map(log => {
              const logDate = new Date(log.timestamp);
              const dateFormatted = logDate.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const timeFormatted = logDate.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/50 text-purple-200 border border-purple-700/40">
                        {log.action}
                      </span>
                      <span className="font-semibold text-white truncate">
                        {log.metadata?.product_name || log.metadata?.title || log.entity_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300/60 mt-0.5">
                      ดำเนินการโดย: <span className="text-purple-200 font-medium">{log.user_name}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0 text-purple-400/70 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{dateFormatted} {timeFormatted}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
