import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '../types';
import { isEquipmentProduct, getProductUnitLabel } from '../lib/productHelper';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onViewDetails,
  onAddToCart
}) => {
  const isAvailable = product.status === 'AVAILABLE';
  const isEquipment = isEquipmentProduct(product);

  // Type color badge
  const getTypeBadgeStyle = (type: Product['type']) => {
    if (isEquipment) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    switch (type) {
      case 'Sativa':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Indica':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Hybrid':
      default:
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
    }
  };

  const effects = [product.effect_1, product.effect_2, product.effect_3].filter(Boolean);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group rounded-2xl bg-cosmic-card overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/50 hover:border-purple-400/40"
    >
      {/* Image & Badges */}
      <div 
        className="relative aspect-square w-full overflow-hidden cursor-pointer bg-purple-950/50"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image_url}
          alt={product.product_name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e071e] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          <span 
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${getTypeBadgeStyle(product.type)}`}
          >
            {isEquipment ? '🛠️ อุปกรณ์' : product.type}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${
              isAvailable
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
          </span>
        </div>

        {/* Category Tag overlay on bottom of image */}
        {categoryName && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-purple-200 border border-purple-500/20">
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-sm sm:text-base font-bold text-white font-display line-clamp-1 group-hover:text-purple-300 transition cursor-pointer"
            title={product.product_name}
          >
            {product.product_name}
          </h3>

          {/* Effects Tags - Hidden for equipment */}
          {!isEquipment ? (
            <div className="flex flex-wrap gap-1 mt-2 min-h-[22px]">
              {effects.slice(0, 3).map((eff, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-purple-950/60 text-purple-300/90 border border-purple-800/40"
                >
                  #{eff}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2 min-h-[22px]">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40">
                🛠️ อุปกรณ์และของทั่วไป
              </span>
            </div>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-3 border-t border-purple-900/30">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-[10px] text-purple-400 font-semibold">ราคา</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-yellow-300 font-display">
                  ฿{product.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-purple-300/70 font-medium">
                  {getProductUnitLabel(product)}
                </span>
              </div>
            </div>

            {/* Quick Add To Cart Button */}
            {isAvailable && onAddToCart && (
              <button
                id={`add-cart-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400 transition cursor-pointer active:scale-95"
                title="ใส่ตะกร้า"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Details Button */}
          <button
            id={`view-details-btn-${product.id}`}
            onClick={() => onViewDetails(product)}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#26114a] hover:bg-purple-700/60 text-purple-100 border border-purple-500/30 hover:border-purple-400 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span>VIEW DETAILS</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
