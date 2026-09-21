import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onFinish, 600);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0c0d10] text-white flex flex-col items-center justify-between p-8 transition-opacity duration-700 select-none ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-between items-center text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
        <span>KUKAPI STOREFRONT</span>
        <span>SHOPIFY ARCHITECTURE</span>
      </div>

      <div className="flex flex-col items-center text-center my-auto">
        {/* Monogram / Brandmark */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-zinc-700/60 flex items-center justify-center shadow-2xl mb-6 transform transition-transform duration-1000 animate-pulse">
          <span className="font-heading font-black text-3xl tracking-widest text-white">
            K
          </span>
        </div>

        {/* Brand Name */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-[0.35em] text-white mb-2">
          KUKAPI
        </h1>

        {/* Sub-label */}
        <p className="text-xs tracking-[0.25em] text-zinc-400 font-medium uppercase mt-2">
          Youthful · Minimal · Premium
        </p>

        {/* Origin tag */}
        <span className="inline-block mt-4 text-[10px] tracking-[0.2em] text-zinc-600 uppercase border border-zinc-800 px-3 py-1 rounded-full">
          Indian Streetwear & Contemporary Silhouettes
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white animate-pulse" />
        </div>
        <span className="text-[10px] text-zinc-600 tracking-widest uppercase">
          Initializing Storefront v2.4
        </span>
      </div>
    </div>
  );
};
