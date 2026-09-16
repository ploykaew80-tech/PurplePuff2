import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, CheckCircle, AlertTriangle, Sparkles, Plus, Minus } from 'lucide-react';
import type { Product, Category } from '../types';
import { isEquipmentProduct, getProductUnitLabel } from '../lib/productHelper';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  categories,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const category = categories.find(c => c.id === product.category_id);
  const isAvailable = product.status === 'AVAILABLE';
  const isEquipment = isEquipmentProduct(product, categories);
  const effects = [product.effect_1, product.effect_2, product.effect_3].filter(Boolean);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div 
      id="product-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="product-detail-card"
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1c0d38] to-[#0d0619] border border-purple-500/30 glow-purple shadow-2xl relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Sticky Bar with Back Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-[#1c0d38]/90 backdrop-blur-md border-b border-purple-900/30">
          <button
            id="product-detail-back-btn"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/20 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับ</span>
          </button>
          <div className="flex items-center gap-2">
            <span 
              className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                isAvailable 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}
            >
              {isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
            </span>
          </div>
        </div>

        {/* Large Product Image */}
        <div className="relative w-full aspect-video sm:aspect-[4/3] bg-purple-950/40 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c0d38] via-transparent to-transparent" />
          
          {/* Floating Category Badge */}
          {category && (
            <div className="absolute bottom-3 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-purple-200 border border-purple-500/30 flex items-center gap-1.5">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${
                isEquipment 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {isEquipment ? '🛠️ อุปกรณ์ / ทั่วไป' : product.type}
              </span>
              {product.featured && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> FEATURED
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              {product.product_name}
            </h2>
          </div>

          {/* 3 Effects Tags - Omitted entirely for equipment */}
          {!isEquipment && effects.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-purple-300/80 uppercase tracking-wider block mb-2">
                Effects (สัมผัสและอารมณ์)
              </span>
              <div className="flex flex-wrap gap-2">
                {effects.map((effect, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/50 text-purple-200 border border-purple-500/30 shadow-sm"
                  >
                    ✨ {effect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-purple-950/30 p-4 rounded-2xl border border-purple-800/30">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
              DESCRIPTION
            </span>
            <p className="text-sm text-purple-200/90 leading-relaxed whitespace-pre-line">
              {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>

          {/* Price & Direct Purchase Section */}
          <div className="pt-2 border-t border-purple-900/40">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-xs text-purple-400 font-semibold block">ราคาต่อหน่วย</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-yellow-300 font-display">
                    ฿{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-purple-300/80 font-medium">
                    {getProductUnitLabel(product, categories)}
                  </span>
                </div>
              </div>

              {/* Quantity Counter if Available */}
              {isAvailable && (
                <div className="flex items-center gap-2 bg-purple-950/60 p-1.5 rounded-2xl border border-purple-500/30">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-xl bg-purple-800/60 hover:bg-purple-700 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white font-display">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-purple-800/60 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isAvailable ? (
              <button
                id="product-detail-add-to-cart-btn"
                onClick={handleAdd}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xl ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-purple-600/30'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>เพิ่มลงในรายการแล้ว!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 text-yellow-200" />
                    <span>สั่งซื้อทันที / เพิ่มในตะกร้า (฿{(product.price * quantity).toLocaleString()})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-center text-sm font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>สินค้าหมดชั่วคราว (SOLD OUT)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
