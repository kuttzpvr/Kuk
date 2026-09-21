import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant } from '../../types';

export const WishlistView: React.FC = () => {
  const {
    products,
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    moveWishlistItemToCart,
    openProductDetail,
    setActiveTab,
    setCurrentScreen,
  } = useShop();

  // Selected variant map per product
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [movingId, setMovingId] = useState<string | null>(null);

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleVariantSelect = (productId: string, variant: ProductVariant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  const handleMoveToCart = async (product: Product) => {
    setMovingId(product.id);
    try {
      const variant = selectedVariants[product.id] || product.variants[0];
      await moveWishlistItemToCart(product, variant);
    } finally {
      setMovingId(null);
    }
  };

  if (wishedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-sm mx-auto animate-in fade-in duration-150">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-zinc-950">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
          Tap the heart icon on any KUKAPI garment to save your favorite streetwear cuts and silhouettes here.
        </p>
        <button
          onClick={() => {
            setActiveTab('shop');
            setCurrentScreen('main');
          }}
          className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24 max-w-2xl mx-auto w-full animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-zinc-950 tracking-tight">
            Saved Favorites ({wishedProducts.length})
          </h1>
          <p className="text-[11px] text-zinc-500">Your personalized streetwear collection</p>
        </div>
        <span className="text-xs font-medium text-zinc-500">Curated Wardrobe</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {wishedProducts.map((prod) => {
          const currentVariant = selectedVariants[prod.id] || prod.variants[0];
          const hasMultipleSizes = prod.variants.length > 1;

          return (
            <div
              key={prod.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all"
            >
              <div
                className="relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer"
                onClick={() => openProductDetail(prod)}
              >
                <img
                  src={prod.featuredImage}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(prod.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-zinc-500 hover:text-rose-600 shadow-sm transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <h3
                    onClick={() => openProductDetail(prod)}
                    className="font-heading font-semibold text-xs text-zinc-900 line-clamp-1 cursor-pointer hover:underline"
                  >
                    {prod.title}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-heading font-black text-sm text-zinc-950">
                      ₹{currentVariant ? currentVariant.price : prod.price}
                    </span>
                    {prod.compareAtPrice > prod.price && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        ₹{prod.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {/* Stock Availability Indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        prod.availableForSale
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          prod.availableForSale ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {prod.availableForSale ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>

                  {/* Size chips if multiple sizes available */}
                  {hasMultipleSizes && (
                    <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar">
                      {prod.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleVariantSelect(prod.id, v)}
                          className={`min-w-6 h-6 px-1.5 rounded-md text-[10px] font-bold border transition-all ${
                            currentVariant?.id === v.id
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleMoveToCart(prod)}
                  disabled={movingId === prod.id}
                  className="w-full py-2 px-2.5 rounded-xl bg-zinc-950 text-white text-[11px] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60 shadow-2xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{movingId === prod.id ? 'Moving...' : 'Move to Bag'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
