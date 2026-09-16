import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchPublicData, 
  checkAdminSession, 
  adminLogout, 
  fetchAdminDashboardData,
  saveAdminProduct,
  deleteAdminProduct,
  updateAdminProductStatus,
  saveAdminCategory,
  saveAdminPromotion,
  deleteAdminPromotion,
  saveAdminSettings,
  updateAdminOrderStatus,
  saveAdminUser,
  deleteAdminUser
} from './lib/api';
import type { 
  Product, 
  Category, 
  Promotion, 
  StoreSettings, 
  User, 
  CartItem, 
  AdminStats, 
  ActivityLog, 
  Order,
  ProductStatus,
  OrderStatus 
} from './types';

// Customer Components & Views
import { SplashScreen } from './components/SplashScreen';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { AppHeader } from './components/AppHeader';
import { BottomNav, type CustomerTab } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HomeView } from './views/customer/HomeView';
import { CatalogView } from './views/customer/CatalogView';
import { PromotionView } from './views/customer/PromotionView';
import { ContactView } from './views/customer/ContactView';

// Admin Components & Views
import { AdminLoginView } from './views/admin/AdminLoginView';
import { AdminLayout, type AdminTab } from './components/AdminLayout';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminProductsView } from './views/admin/AdminProductsView';
import { AdminCategoriesView } from './views/admin/AdminCategoriesView';
import { AdminPromotionsView } from './views/admin/AdminPromotionsView';
import { AdminOrdersView } from './views/admin/AdminOrdersView';
import { AdminStoreSettingsView } from './views/admin/AdminStoreSettingsView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminActivityLogView } from './views/admin/AdminActivityLogView';

export default function App() {
  // Navigation & View States
  const [showSplash, setShowSplash] = useState(true);
  const [ageVerified, setAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem('purplepuff_age_verified') === 'true';
  });
  const [ageRejected, setAgeRejected] = useState(false);
  
  const [viewMode, setViewMode] = useState<'CUSTOMER' | 'ADMIN_LOGIN' | 'ADMIN_PANEL'>('CUSTOMER');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('HOME');
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<string>('ALL');

  // Customer Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('purplepuff_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Store & Catalog Data
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Admin Data & Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('purplepuff_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Load public store data
  const loadPublicData = useCallback(async () => {
    try {
      const data = await fetchPublicData();
      setSettings(data.settings);
      setCategories(data.categories);
      setProducts(data.products);
      setPromotions(data.promotions);
    } catch (err) {
      console.error('Failed to load public data:', err);
    }
  }, []);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    try {
      const data = await fetchAdminDashboardData();
      setAdminStats(data.stats);
      setAdminLogs(data.logs);
      setAdminOrders(data.orders);
      setAdminUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }, []);

  // Initial mount check
  useEffect(() => {
    loadPublicData();

    // Check if admin session exists
    checkAdminSession().then(res => {
      if (res.authenticated && res.user) {
        setCurrentUser(res.user);
      }
    });
  }, [loadPublicData]);

  // When admin panel is active, refresh admin data
  useEffect(() => {
    if (viewMode === 'ADMIN_PANEL' && currentUser) {
      loadAdminData();
    }
  }, [viewMode, currentUser, loadAdminData]);

  // Handle Age Verification
  const handleConfirmAge = () => {
    setAgeVerified(true);
    setAgeRejected(false);
    localStorage.setItem('purplepuff_age_verified', 'true');
  };

  const handleRejectAge = () => {
    setAgeRejected(prev => !prev);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Admin Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setViewMode('ADMIN_PANEL');
    setAdminTab('DASHBOARD');
  };

  const handleLogout = async () => {
    await adminLogout();
    setCurrentUser(null);
    setViewMode('CUSTOMER');
  };

  const handleSaveProduct = async (prod: Partial<Product>) => {
    await saveAdminProduct(prod);
    await loadPublicData();
    await loadAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteAdminProduct(id);
    await loadPublicData();
    await loadAdminData();
  };

  const handleToggleProductStatus = async (id: string, newStatus: ProductStatus) => {
    await updateAdminProductStatus(id, newStatus);
    await loadPublicData();
    await loadAdminData();
  };

  const handleSaveCategory = async (cat: Partial<Category>) => {
    await saveAdminCategory(cat);
    await loadPublicData();
  };

  const handleSavePromotion = async (promo: Partial<Promotion>) => {
    await saveAdminPromotion(promo);
    await loadPublicData();
    await loadAdminData();
  };

  const handleDeletePromotion = async (id: string) => {
    await deleteAdminPromotion(id);
    await loadPublicData();
    await loadAdminData();
  };

  const handleSaveSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await saveAdminSettings(newSettings);
    setSettings(updated);
    await loadAdminData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateAdminOrderStatus(orderId, status);
    await loadAdminData();
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }) => {
    await saveAdminUser(userData);
    await loadAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteAdminUser(userId);
    await loadAdminData();
  };

  // Switch to catalog with a selected category
  const handleSelectCategoryFromHome = (categoryId: string) => {
    setCatalogInitialCategory(categoryId);
    setCustomerTab('CATALOG');
  };

  return (
    <div className="min-h-screen bg-cosmic-dark text-[#f3e8ff] font-sans selection:bg-purple-600 selection:text-white relative">
      {/* 1. Splash Screen on first load */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          brandName={settings?.store_name || 'PURPLE PUFF'}
          slogan={settings?.description || 'PREMIUM COSMIC STORE EXPERIENCE'}
        />
      )}

      {/* 2. Age Verification Modal (Requirement: 20+ years old) */}
      {!ageVerified && (
        <AgeVerificationModal
          onConfirm={handleConfirmAge}
          onReject={handleRejectAge}
          rejected={ageRejected}
        />
      )}

      {/* 3. VIEW ROUTER: Admin Login / Admin Panel / Customer App */}
      {viewMode === 'ADMIN_LOGIN' ? (
        <AdminLoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToCustomer={() => setViewMode('CUSTOMER')}
          logoUrl={settings?.logo_url || '/logo.png'}
          storeName={settings?.store_name || 'PURPLE PUFF'}
        />
      ) : viewMode === 'ADMIN_PANEL' && currentUser ? (
        <AdminLayout
          currentUser={currentUser}
          activeTab={adminTab}
          onTabChange={setAdminTab}
          onLogout={handleLogout}
          onBackToStore={() => setViewMode('CUSTOMER')}
          logoUrl={settings?.logo_url || '/logo.png'}
          storeName={settings?.store_name || 'PURPLE PUFF'}
        >
          {adminTab === 'DASHBOARD' && (
            <AdminDashboardView
              stats={adminStats}
              activityLogs={adminLogs}
              currentUser={currentUser}
              onNavigateTab={setAdminTab}
              onQuickAddProduct={() => setAdminTab('PRODUCTS')}
            />
          )}

          {adminTab === 'PRODUCTS' && (
            <AdminProductsView
              products={products}
              categories={categories}
              currentUser={currentUser}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleStatus={handleToggleProductStatus}
            />
          )}

          {adminTab === 'CATEGORIES' && (
            <AdminCategoriesView
              categories={categories}
              currentUser={currentUser}
              onSaveCategory={handleSaveCategory}
            />
          )}

          {adminTab === 'PROMOTIONS' && (
            <AdminPromotionsView
              promotions={promotions}
              currentUser={currentUser}
              onSavePromotion={handleSavePromotion}
              onDeletePromotion={handleDeletePromotion}
            />
          )}

          {adminTab === 'ORDERS' && (
            <AdminOrdersView
              orders={adminOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {adminTab === 'STORE_SETTINGS' && (
            <AdminStoreSettingsView
              settings={settings}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {adminTab === 'USERS' && (
            <AdminUsersView
              users={adminUsers}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {adminTab === 'ACTIVITY_LOG' && (
            <AdminActivityLogView
              logs={adminLogs}
            />
          )}
        </AdminLayout>
      ) : (
        /* CUSTOMER APP FLOW */
        <div id="customer-app-wrapper" className="min-h-screen flex flex-col justify-between">
          {/* Header */}
          <AppHeader
            settings={settings}
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onAdminClick={() => {
              if (currentUser) {
                setViewMode('ADMIN_PANEL');
              } else {
                setViewMode('ADMIN_LOGIN');
              }
            }}
            isAdminLoggedIn={!!currentUser}
            onGoHome={() => setCustomerTab('HOME')}
          />

          {/* Main Customer Tab View */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-20">
            {customerTab === 'HOME' && (
              <HomeView
                settings={settings}
                categories={categories}
                featuredProducts={products.filter(p => p.featured)}
                onSelectCategory={handleSelectCategoryFromHome}
                onNavigateCatalog={() => {
                  setCatalogInitialCategory('ALL');
                  setCustomerTab('CATALOG');
                }}
                onNavigatePromotion={() => setCustomerTab('PROMOTION')}
                onNavigateContact={() => setCustomerTab('CONTACT')}
                onViewProductDetails={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            )}

            {customerTab === 'CATALOG' && (
              <CatalogView
                products={products}
                categories={categories}
                initialCategory={catalogInitialCategory}
                onViewProductDetails={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            )}

            {customerTab === 'PROMOTION' && (
              <PromotionView
                promotions={promotions}
                onNavigateCatalog={() => setCustomerTab('CATALOG')}
              />
            )}

            {customerTab === 'CONTACT' && (
              <ContactView settings={settings} />
            )}
          </main>

          {/* Customer Bottom Navigation */}
          <BottomNav
            activeTab={customerTab}
            onTabChange={tab => {
              if (tab === 'CATALOG') setCatalogInitialCategory('ALL');
              setCustomerTab(tab);
            }}
          />

          {/* Customer Product Detail Modal */}
          {selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              categories={categories}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Customer Cart Drawer / In-App Direct Checkout */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            settings={settings}
          />
        </div>
      )}
    </div>
  );
}
