import React, { useState } from 'react';
import { ShoppingBag, Clock, Phone, MapPin, CheckCircle, Truck, XCircle, Search } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';

interface AdminOrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      await onUpdateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-950/70 border-blue-500/40 text-blue-300';
      case 'DELIVERING':
        return 'bg-purple-950/70 border-purple-500/40 text-purple-300';
      case 'COMPLETED':
        return 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300';
      case 'CANCELLED':
        return 'bg-rose-950/70 border-rose-500/40 text-rose-300';
      case 'PENDING':
      default:
        return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
    }
  };

  return (
    <div id="admin-orders-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display">
          IN-APP ORDERS MANAGEMENT
        </h2>
        <p className="text-xs text-purple-300/80">
          รายการคำสั่งซื้อจากลูกค้าที่สั่งซื้อผ่านแอพ ({orders.length} ออเดอร์)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า เบอร์โทร หรือเลขที่ออเดอร์..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder:text-purple-400/40 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-white focus:border-purple-400 focus:outline-none cursor-pointer"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="PENDING">PENDING (รอตรวจสอบ)</option>
          <option value="CONFIRMED">CONFIRMED (ยืนยันแล้ว)</option>
          <option value="DELIVERING">DELIVERING (กำลังจัดส่ง)</option>
          <option value="COMPLETED">COMPLETED (สำเร็จ)</option>
          <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-cosmic-card border border-purple-500/20 p-8 space-y-2">
            <ShoppingBag className="w-8 h-8 text-purple-400/50 mx-auto" />
            <h3 className="text-sm font-bold text-white">ไม่พบคำสั่งซื้อ</h3>
            <p className="text-xs text-purple-400/70">
              ยังไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const orderDate = new Date(order.created_at);
            const dateStr = orderDate.toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const timeStr = orderDate.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-cosmic-card border border-purple-500/20 hover:border-purple-400/40 transition shadow-xl space-y-4"
              >
                {/* Top order summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-900/40">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-white text-sm font-display">
                      #{order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-purple-300/70 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{dateStr} {timeStr}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/30">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                      ลูกค้า
                    </span>
                    <p className="font-bold text-white">{order.customer_name}</p>
                    <p className="text-purple-300 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-purple-400" />
                      <span>{order.customer_phone}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/30 sm:col-span-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">
                      ที่อยู่จัดส่ง
                    </span>
                    <p className="text-purple-200 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{order.delivery_address || 'รับหน้าร้าน'}</span>
                    </p>
                    {order.notes && (
                      <p className="text-[11px] text-yellow-300/80 mt-1">
                        หมายเหตุ: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="p-3.5 rounded-2xl bg-[#14082c] border border-purple-900/30 space-y-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                    รายการสินค้าที่สั่งซื้อ ({order.items.length})
                  </span>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-purple-200">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.product.image_url}
                            alt={item.product.product_name}
                            className="w-6 h-6 rounded-md object-cover border border-purple-500/30"
                          />
                          <span className="font-semibold">{item.product.product_name}</span>
                          <span className="text-purple-400 font-normal">x {item.quantity}</span>
                        </div>
                        <span className="font-bold text-white">
                          ฿{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-purple-800/40 flex justify-between items-center text-sm font-bold">
                    <span className="text-purple-200">ยอดรวมทั้งสิ้น:</span>
                    <span className="text-yellow-300 text-base font-black">
                      ฿{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <span className="text-xs text-purple-400/80 mr-auto font-medium">
                    ปรับสถานะออเดอร์:
                  </span>

                  <button
                    disabled={updatingId === order.id || order.status === 'CONFIRMED'}
                    onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-900/40 hover:bg-blue-800 text-blue-200 border border-blue-700/30 transition disabled:opacity-30 cursor-pointer"
                  >
                    ยืนยันออเดอร์
                  </button>

                  <button
                    disabled={updatingId === order.id || order.status === 'DELIVERING'}
                    onClick={() => handleStatusChange(order.id, 'DELIVERING')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-700/30 transition disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>กำลังจัดส่ง</span>
                  </button>

                  <button
                    disabled={updatingId === order.id || order.status === 'COMPLETED'}
                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/30 transition disabled:opacity-30 cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>สำเร็จ</span>
                  </button>

                  <button
                    disabled={updatingId === order.id || order.status === 'CANCELLED'}
                    onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/30 transition disabled:opacity-30 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
