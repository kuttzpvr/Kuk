import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200/70 shadow-xs animate-pulse">
      {/* 4:5 Image placeholder */}
      <div className="relative aspect-[4/5] bg-zinc-200/80">
        <div className="absolute top-2.5 left-2.5 w-16 h-4 rounded-full bg-zinc-300/80" />
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-zinc-300/80" />
      </div>

      {/* Details placeholder */}
      <div className="p-3 sm:p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-1">
          <div className="w-12 h-3 rounded bg-zinc-200" />
          <div className="w-16 h-3 rounded bg-zinc-200" />
        </div>
        <div className="w-4/5 h-4 rounded bg-zinc-200" />
        <div className="flex items-center justify-between pt-1">
          <div className="w-16 h-5 rounded bg-zinc-300/80" />
          <div className="w-14 h-4 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
};
