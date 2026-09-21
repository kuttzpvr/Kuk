import React from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';

export const ProductCard: React.FC<{ product: Product; priority?: boolean }> = ({
  product,
  priority = false,
}) => {
  const { openProductDetail, toggleWishlist, isInWishlist } = useShop();
  const isWished = isInWishlist(product.id);

  // Group unique sizes and colors
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.colorHex)));

  return (
    <div
      id={`product-card-${product.handle}`}
      onClick={() => openProductDetail(product)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer relative select-none"
    >
      {/* Image Container with 4:5 Fashion Aspect Ratio */}
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
        <img
          src={product.featuredImage}
          alt={product.title}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.isBestSeller && (
            <span className="bg-zinc-950 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
          {product.gsm && (
            <span className="bg-amber-500 text-zinc-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              {product.gsm.split(' ')[0]} GSM
            </span>
          )}
          {product.discountPercent > 0 && !product.isBestSeller && (
            <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 shadow-sm backdrop-blur-md ${
            isWished
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-zinc-600 hover:bg-white hover:text-zinc-950'
          }`}
          title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Color Swatch Preview on bottom-left */}
        {uniqueColors.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-1 rounded-full">
            {uniqueColors.slice(0, 4).map((hex, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-xs"
                style={{ backgroundColor: hex }}
              />
            ))}
            {uniqueColors.length > 4 && (
              <span className="text-[8px] font-bold text-white leading-none">
                +{uniqueColors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1 text-[11px] text-zinc-500">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold ml-1 text-zinc-800">{product.rating}</span>
            </div>
            <span className="text-zinc-400">({product.reviewCount})</span>
            <span className="text-zinc-300">·</span>
            <span className="text-zinc-500 capitalize">{product.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-xs sm:text-sm text-zinc-900 line-clamp-1 leading-snug group-hover:text-zinc-600 transition-colors">
            {product.title}
          </h3>

          {/* Fabric & Fit mini info */}
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
            {product.fabric}
          </p>
        </div>

        {/* Pricing & Sizes */}
        <div className="mt-2 pt-2 border-t border-zinc-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-sm sm:text-base text-zinc-950">
              ₹{product.price}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-[11px] text-zinc-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            Save ₹{product.compareAtPrice - product.price}
          </span>
        </div>
      </div>
    </div>
  );
};
