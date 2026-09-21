import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './components/common/SplashScreen';
import { ToastContainer } from './components/common/ToastContainer';
import { HomeView } from './components/home/HomeView';
import { ProductListingView } from './components/shop/ProductListingView';
import { SearchView } from './components/search/SearchView';
import { WishlistView } from './components/wishlist/WishlistView';
import { AccountView } from './components/account/AccountView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { OrderTrackingView } from './components/orders/OrderTrackingView';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { AdminConfigModal } from './components/admin/AdminConfigModal';
import { FlutterExportModal } from './components/flutter/FlutterExportModal';
import { AndroidExportModal } from './components/android/AndroidExportModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    currentScreen,
    selectedProduct,
    cart,
    viewMode,
  } = useShop();

  const [showSplash, setShowSplash] = useState(true);

  // Screen Dispatcher
  const renderCurrentView = () => {
    if (currentScreen === 'product_detail' && selectedProduct) {
      return <ProductDetailView product={selectedProduct} />;
    }

    if (currentScreen === 'checkout') {
      return cart.length > 0 ? <CheckoutView /> : <CartView />;
    }

    if (currentScreen === 'order_tracking') {
      return <OrderTrackingView />;
    }

    if (currentScreen === 'notifications') {
      return <NotificationsModal />;
    }

    // Default: Main Tabs
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ProductListingView />;
      case 'search':
        return <SearchView />;
      case 'wishlist':
        return <WishlistView />;
      case 'account':
        return <AccountView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center sm:p-4 selection:bg-zinc-950 selection:text-white">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Main Container: Mobile Phone Mockup Frame or Responsive Full Width */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-white overflow-hidden shadow-2xl ${
          viewMode === 'mobile'
            ? 'max-w-md min-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 relative sm:ring-1 sm:ring-white/10'
            : 'max-w-6xl min-h-screen'
        }`}
      >
        {/* Dynamic Island / Speaker notch on mobile mockup */}
        {viewMode === 'mobile' && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white select-none">
            <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-end px-2.5">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
            </div>
          </div>
        )}

        {/* Global Store Header */}
        <Header />

        {/* Main Active Screen Content */}
        <main className="flex-1 flex flex-col bg-zinc-50/50">
          {renderCurrentView()}
        </main>

        {/* Bottom Navigation on Main Screen */}
        {currentScreen === 'main' && <BottomNav />}
      </div>

      {/* Modals & Overlays */}
      <AiAssistantModal />
      <AdminConfigModal />
      <FlutterExportModal />
      <AndroidExportModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
