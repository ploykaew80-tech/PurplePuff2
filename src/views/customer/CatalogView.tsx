import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import type { Product, Category, ProductType } from '../../types';
import { isEquipmentCategory } from '../../lib/productHelper';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  onViewProductDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  initialCategory,
  onViewProductDetails,
  onAddToCart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('ALL'); // 'ALL' | 'AVAILABLE' | 'SOLD_OUT'
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED'); // 'RECOMMENDED' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);
  const isBrowsingEquipment = isEquipmentCategory(currentCategoryObj);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') count++;
    if (selectedType !== 'ALL') count++;
    if (selectedAvailability !== 'ALL') count++;
    if (maxPrice < 1000) count++;
    return count;
  }, [selectedCategory, selectedType, selectedAvailability, maxPrice]);

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedAvailability('ALL');
    setMaxPrice(1000);
    setSearchQuery('');
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.product_name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesEffects = [product.effect_1, product.effect_2, product.effect_3]
          .some(e => e?.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesEffects) return false;
      }

      // 2. Category
      if (selectedCategory !== 'ALL' && product.category_id !== selectedCategory) {
        return false;
      }

      // 3. Type
      if (selectedType !== 'ALL' && product.type !== selectedType) {
        return false;
      }

      // 4. Availability
      if (selectedAvailability === 'AVAILABLE' && product.status !== 'AVAILABLE') {
        return false;
      }
      if (selectedAvailability === 'SOLD_OUT' && product.status !== 'SOLD OUT') {
        return false;
      }

      // 5. Price
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'NEWEST') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      // Recommended: featured first, then display_order
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.display_order - b.display_order;
    });
  }, [products, searchQuery, selectedCategory, selectedType, selectedAvailability, maxPrice, sortBy]);

  return (
    <div id="customer-catalog-view" className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <span>ALL PRODUCTS</span>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </h1>
          <p className="text-xs text-purple-300/80">
            {isBrowsingEquipment
              ? `อุปกรณ์และของทั่วไป (${filteredProducts.length} รายการ)`
              : `สินค้าและสายพันธุ์ทั้งหมด (${filteredProducts.length} รายการ)`}
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-purple-400/80 font-medium">เรียงตาม:</span>
          <select
            id="catalog-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-white focus:border-purple-400 focus:outline-none cursor-pointer"
          >
            <option value="RECOMMENDED">Recommended (แนะนำ)</option>
            <option value="NEWEST">Newest (มาใหม่)</option>
            <option value="PRICE_ASC">Price: Low → High (ราคาต่ำ-สูง)</option>
            <option value="PRICE_DESC">Price: High → Low (ราคาสูง-ต่ำ)</option>
          </select>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder={isBrowsingEquipment ? "ค้นหาอุปกรณ์ บ้อง เครื่องบด กระดาษโรล..." : "ค้นหาสินค้า สายพันธุ์ อาการ หรือสัมผัส..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs sm:text-sm text-white placeholder:text-purple-400/50 focus:border-purple-400 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          id="catalog-filter-toggle-btn"
          onClick={() => setIsFilterOpen(true)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95 shrink-0 ${
            activeFiltersCount > 0
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-400 glow-purple-sm'
              : 'bg-purple-950/40 border-purple-800/40 text-purple-200 hover:border-purple-500/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Horizontal Quick Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Product Grid: 2 cols Mobile, 3 cols Tablet, 4 cols Desktop */}
      {filteredProducts.length === 0 ? (
        <div id="catalog-empty-state" className="py-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-950/50 border border-purple-700/30 flex items-center justify-center text-purple-400">
            <Filter className="w-7 h-7 opacity-60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">NO PRODUCTS FOUND</h3>
            <p className="text-xs text-purple-300/70 mt-1 max-w-xs mx-auto">
              ไม่พบสินค้าตรงตามเงื่อนไขที่คุณเลือก ลองปรับตัวกรองหรือคำค้นหาใหม่
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-800/60 hover:bg-purple-700 text-purple-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        </div>
      ) : (
        <div 
          id="catalog-product-grid"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredProducts.map(product => {
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
      )}

      {/* Filter Modal / Drawer */}
      {isFilterOpen && (
        <div 
          id="catalog-filter-modal-overlay"
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsFilterOpen(false)}
        >
          <div 
            id="catalog-filter-modal"
            className="w-full max-w-sm h-full bg-[#130728] border-l border-purple-800/40 p-5 flex flex-col justify-between shadow-2xl relative overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white font-display">ตัวกรองสินค้า</h3>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Category Filter */}
              <div>
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
                  Category (หมวดหมู่)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left transition ${
                      selectedCategory === 'ALL'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left transition truncate ${
                        selectedCategory === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Type Filter: Sativa / Hybrid / Indica (Hidden for Equipment) */}
              {!isBrowsingEquipment && (
                <div>
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
                    Type (สายพันธุ์)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['ALL', 'Sativa', 'Hybrid', 'Indica'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition ${
                          selectedType === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
                        }`}
                      >
                        {type === 'ALL' ? 'ทั้งหมด' : type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Availability Filter */}
              <div>
                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
                  Availability (สถานะ)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'ALL', label: 'ทั้งหมด' },
                    { id: 'AVAILABLE', label: 'AVAILABLE' },
                    { id: 'SOLD_OUT', label: 'SOLD OUT' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedAvailability(item.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition ${
                        selectedAvailability === item.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/30'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Max Price (ราคาสูงสุด)
                  </label>
                  <span className="text-xs font-extrabold text-yellow-300">
                    ฿{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-purple-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-purple-400 mt-1">
                  <span>฿150</span>
                  <span>฿1,000+</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-purple-800/40 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/60 border border-purple-800/40 transition cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-md transition cursor-pointer"
              >
                ดู {filteredProducts.length} รายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
