import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-xs px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md border animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto ${
            toast.type === 'success'
              ? 'bg-zinc-950/95 text-white border-zinc-700'
              : toast.type === 'error'
              ? 'bg-red-950/95 text-red-100 border-red-800'
              : 'bg-zinc-900/95 text-zinc-100 border-zinc-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
