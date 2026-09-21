import React, { useState } from 'react';
import { Bell, X, CheckCheck, Sparkles, Package, Tag, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const NotificationsModal: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    setCurrentScreen,
    setActiveTab,
  } = useShop();

  const [activeFilter, setActiveFilter] = useState<'all' | 'order' | 'sale' | 'product'>('all');

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  return (
    <div className="flex flex-col bg-zinc-50 min-h-screen pb-28 animate-in fade-in duration-200">
      {/* App Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('main')}
          className="p-1.5 rounded-full hover:bg-zinc-100 text-xs font-bold text-zinc-800"
        >
          Close
        </button>

        <span className="font-heading font-extrabold text-xs tracking-widest text-zinc-900 uppercase">
          NOTIFICATIONS & ALERTS
        </span>

        <button
          onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full px-3.5 pt-3 flex flex-col gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'order', label: 'Orders & Tracking' },
            { id: 'sale', label: 'Flash Deals' },
            { id: 'product', label: 'Restock Drops' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'bg-zinc-950 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                item.read
                  ? 'bg-white/80 border-zinc-200 text-zinc-700'
                  : 'bg-white border-zinc-950/20 shadow-xs ring-1 ring-zinc-950/5'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'order'
                    ? 'bg-emerald-50 text-emerald-600'
                    : item.type === 'sale'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {item.type === 'order' ? (
                  <Package className="w-4 h-4" />
                ) : item.type === 'sale' ? (
                  <Tag className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-heading font-bold text-xs text-zinc-950">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* FCM Push Architecture Info */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 flex flex-col gap-1.5">
          <span className="font-bold text-zinc-900 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-zinc-800" />
            <span>FCM (Firebase Cloud Messaging) Push Service</span>
          </span>
          <p className="text-[11px] leading-relaxed">
            Registered devices receive instant APNs/FCM web & mobile notifications when order status changes to Shipped, or when limited drops restock.
          </p>
        </div>
      </div>
    </div>
  );
};
