import React from 'react';
import {
  Bell,
  Smartphone,
  Monitor,
  Sparkles,
  Sliders,
  Code2,
  WifiOff,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    setCurrentScreen,
    setIsAiModalOpen,
    setIsAdminModalOpen,
    setIsFlutterModalOpen,
    setIsAndroidModalOpen,
    viewMode,
    toggleViewMode,
    isOffline,
    adminConfig,
  } = useShop();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 transition-colors">
      {/* Announcement Bar */}
      {adminConfig.announcement && (
        <div className="bg-zinc-950 text-white text-[11px] font-medium py-1.5 px-3 text-center tracking-wide overflow-hidden whitespace-nowrap text-ellipsis flex items-center justify-center gap-1.5">
          <span>{adminConfig.announcement}</span>
        </div>
      )}

      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="bg-amber-500 text-black text-[11px] font-semibold py-1 px-3 text-center flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode active - using cached product catalog</span>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3.5 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div
          id="brand-logo"
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen('main');
          }}
          className="cursor-pointer select-none flex items-baseline gap-2"
        >
          <span className="font-extrabold text-xl tracking-[0.25em] text-zinc-950 font-heading">
            KUKAPI
          </span>
          <span className="hidden sm:inline-block text-[9px] font-semibold tracking-widest text-zinc-500 uppercase">
            Official Storefront
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Stylist Pulse Button */}
          <button
            id="ai-stylist-btn"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-800 text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95"
            title="KUKAPI AI Shopping Stylist"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden xs:inline">AI Stylist</span>
          </button>

          {/* Device Mockup Toggle */}
          <button
            id="toggle-view-btn"
            onClick={toggleViewMode}
            className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title={viewMode === 'mobile' ? 'Switch to Full Screen View' : 'Switch to Mobile Frame'}
          >
            {viewMode === 'mobile' ? (
              <Monitor className="w-4 h-4 text-zinc-700" />
            ) : (
              <Smartphone className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Android Kotlin & Compose Preview */}
          <button
            id="android-export-btn"
            onClick={() => setIsAndroidModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 text-xs font-semibold"
            title="Native Android App & Jetpack Compose Preview"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Android App</span>
          </button>

          {/* Flutter Architecture Export Code View */}
          <button
            id="flutter-export-btn"
            onClick={() => setIsFlutterModalOpen(true)}
            className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Flutter & Dart Architecture Source Code"
          >
            <Code2 className="w-4 h-4 text-zinc-700" />
          </button>

          {/* Admin COD Settings */}
          <button
            id="admin-config-btn"
            onClick={() => setIsAdminModalOpen(true)}
            className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Admin COD & Store Configuration"
          >
            <Sliders className="w-4 h-4 text-zinc-700" />
          </button>

          {/* Notifications */}
          <button
            id="notifications-btn"
            onClick={() => setCurrentScreen('notifications')}
            className="relative p-1.5 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
