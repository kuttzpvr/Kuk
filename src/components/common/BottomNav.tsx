import React from 'react';
import { Home, Compass, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentScreen,
    setCurrentScreen,
    cartCount,
    wishlist,
  } = useShop();

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'home', label: 'HOME', icon: <Home className="w-5 h-5" /> },
    { tab: 'shop', label: 'SHOP', icon: <Compass className="w-5 h-5" /> },
    { tab: 'search', label: 'SEARCH', icon: <Search className="w-5 h-5" /> },
    {
      tab: 'wishlist',
      label: 'WISHLIST',
      icon: <Heart className="w-5 h-5" />,
      badge: wishlist.length > 0 ? wishlist.length : undefined,
    },
    { tab: 'account', label: 'ACCOUNT', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-zinc-200 safe-area-inset-bottom">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab && currentScreen === 'main';
          return (
            <button
              key={item.tab}
              id={`nav-tab-${item.tab}`}
              onClick={() => {
                setActiveTab(item.tab);
                setCurrentScreen('main');
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] relative transition-all active:scale-95 ${
                isActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider mt-1 font-heading">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-zinc-950 rounded-full mt-0.5 absolute -bottom-0.5" />
              )}
            </button>
          );
        })}

        {/* Floating Cart Indicator */}
        <button
          id="cart-indicator-btn"
          onClick={() => {
            setActiveTab('shop');
            setCurrentScreen('checkout');
          }}
          className={`absolute -top-5 right-4 sm:right-6 bg-zinc-950 text-white p-3 rounded-full shadow-lg hover:bg-zinc-800 transition-transform active:scale-90 flex items-center justify-center ${
            cartCount > 0 ? 'scale-100 ring-4 ring-white' : 'scale-90 opacity-90'
          }`}
          title="Open Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-amber-400 text-zinc-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </div>
    </nav>
  );
};
