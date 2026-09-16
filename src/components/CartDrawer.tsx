import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, CheckCircle2, MessageSquare, Truck, ArrowRight } from 'lucide-react';
import type { CartItem, Order, StoreSettings } from '../types';
import { submitCustomerOrder } from '../lib/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: StoreSettings | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('กรุณากรอกชื่อผู้รับ');
      return;
    }
    if (!phone.trim()) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    if (settings?.delivery_available && !address.trim()) {
      setError('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }

    try {
      setSubmitting(true);
      const newOrder = await submitCustomerOrder({
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        items,
        notes
      });
      setCompletedOrder(newOrder);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setSubmitting(false);
    }
  };

  const getLineMessageUrl = (order: Order) => {
    const lineUsername = (settings?.line_username || '@798shear').replace('@', '');
    const itemListText = order.items
      .map(i => `- ${i.product.product_name} x ${i.quantity} (฿${(i.product.price * i.quantity).toLocaleString()})`)
      .join('\n');

    const message = encodeURIComponent(
      `[PURPLE PUFF ORDER #${order.id}]\n` +
      `ผู้สั่ง: ${order.customer_name}\n` +
      `เบอร์โทร: ${order.customer_phone}\n` +
      `ที่อยู่จัดส่ง: ${order.delivery_address || 'รับหน้าร้าน'}\n` +
      `รายการสินค้า:\n${itemListText}\n` +
      `ยอดรวม: ฿${order.total_amount.toLocaleString()}\n` +
      (order.notes ? `หมายเหตุ: ${order.notes}\n` : '') +
      `ขอยืนยันคำสั่งซื้อครับ`
    );

    return `https://line.me/R/oaMessage/@${lineUsername}/?${message}`;
  };

  return (
    <div 
      id="cart-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="cart-drawer-container"
        className="w-full max-w-md h-full bg-[#110724] border-l border-purple-800/40 flex flex-col justify-between shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#180b33] border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {completedOrder ? 'คำสั่งซื้อสำเร็จ' : 'ตะกร้าสินค้า (PURPLE PUFF)'}
              </h2>
              <p className="text-[11px] text-purple-300/70">
                {completedOrder ? `หมายเลขคำสั่งซื้อ #${completedOrder.id}` : `${items.length} รายการที่เลือก`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (completedOrder) setCompletedOrder(null);
              onClose();
            }}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-800/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {completedOrder ? (
            /* Order Completed Success Screen */
            <div className="py-6 text-center space-y-5 animate-scale-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/60 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/60 text-yellow-300 border border-purple-500/40 inline-block mb-2">
                  ORDER PLACED #{completedOrder.id}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  สั่งซื้อในแอพสำเร็จเรียบร้อย!
                </h3>
                <p className="text-xs text-purple-300/80 mt-1 max-w-xs mx-auto">
                  ระบบบันทึกคำสั่งซื้อของคุณแล้ว ทางร้านเตรียมจัดส่งด่วนให้ถึงที่
                </p>
              </div>

              {/* Order summary card */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-left text-xs space-y-2">
                <div className="flex justify-between text-purple-300">
                  <span>ผู้รับ:</span>
                  <span className="text-white font-semibold">{completedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>โทร:</span>
                  <span className="text-white font-semibold">{completedOrder.customer_phone}</span>
                </div>
                {completedOrder.delivery_address && (
                  <div className="flex justify-between text-purple-300">
                    <span>จัดส่ง:</span>
                    <span className="text-white font-semibold text-right max-w-[200px] truncate">{completedOrder.delivery_address}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-purple-800/40 flex justify-between text-sm">
                  <span className="font-bold text-white">ยอดรวม:</span>
                  <span className="font-black text-yellow-300">฿{completedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action: Send to LINE for Instant Confirmation */}
              <div className="space-y-2 pt-2">
                <a
                  href={getLineMessageUrl(completedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#06C755] hover:bg-[#05b34c] text-white flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>แจ้งออเดอร์ทาง LINE ({settings?.line_username || '@798shear'})</span>
                </a>
                <p className="text-[11px] text-purple-400/60">
                  *กดเพื่อส่งสรุปออเดอร์เข้า LINE ร้านได้ทันทีในคลิกเดียว
                </p>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-700/30 transition cursor-pointer"
                >
                  เลือกดูสินค้าต่อ
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-700/30 flex items-center justify-center text-purple-400 mb-3">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-base font-bold text-white">ยังไม่มีสินค้าในตะกร้า</h3>
              <p className="text-xs text-purple-400/70 mt-1 max-w-xs">
                เลือกสินค้าพรีเมียมจากแคตตาล็อกเพื่อเริ่มสั่งซื้อได้เลย
              </p>
            </div>
          ) : (
            /* Items list & Checkout form */
            <>
              {/* Delivery notice */}
              {settings?.delivery_available && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-200">
                  <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span>🚚 มีบริการจัดส่งด่วนถึงที่ (Bangkok Express Delivery)</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  รายการสินค้าในตะกร้า ({items.length})
                </span>
                {items.map(item => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-[#1a0c36] border border-purple-900/40 flex items-center gap-3"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.product_name}
                      className="w-14 h-14 rounded-xl object-cover border border-purple-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.product.product_name}
                      </h4>
                      <p className="text-xs font-black text-yellow-300 mt-0.5">
                        ฿{item.product.price.toLocaleString()} <span className="text-[10px] text-purple-400 font-normal">/ 1G</span>
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-purple-950/70 rounded-lg border border-purple-800/40">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-purple-300 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-purple-300 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-purple-200 ml-auto">
                          ฿{(item.product.price * item.quantity).toLocaleString()}
                        </span>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-purple-400 hover:text-rose-400 transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form id="in-app-checkout-form" onSubmit={handleSubmitOrder} className="pt-3 border-t border-purple-900/40 space-y-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  ข้อมูลสำหรับการจัดส่งในแอพ
                </span>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-purple-300 block mb-1">
                    ชื่อผู้สั่งซื้อ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณกฤษณ์"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-purple-300 block mb-1">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 081-234-5678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-purple-300 block mb-1">
                    ที่อยู่จัดส่ง / พิกัดสถานที่ {settings?.delivery_available && '*'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น คอนโด/บ้านเลขที่ ซอย ถนน แขวง/เขต หรือจุดนัดพบ"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-purple-300 block mb-1">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น โทรแจ้งก่อนส่ง หรือต้องการบิล"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-800/40 text-white text-xs focus:border-purple-400 focus:outline-none placeholder:text-purple-400/40"
                  />
                </div>

                {/* Price summary */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1.5 text-xs">
                  <div className="flex justify-between text-purple-300">
                    <span>ราคาสินค้า:</span>
                    <span className="font-semibold text-white">฿{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>ค่าจัดส่ง:</span>
                    <span className="text-emerald-300 font-semibold">คิดตามระยะทางจริง</span>
                  </div>
                  <div className="pt-2 border-t border-purple-800/40 flex justify-between text-sm font-bold">
                    <span className="text-white">ยอดรวม:</span>
                    <span className="text-yellow-300 font-black text-base">฿{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>กำลังบันทึกคำสั่งซื้อ...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ยืนยันการสั่งซื้อในแอพ (฿{totalAmount.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
