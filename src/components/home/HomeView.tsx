import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Tag,
  ChevronRight,
  Star,
  RefreshCw,
  Quote,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../shop/ProductCard';
import { ProductCardSkeleton } from '../common/ProductCardSkeleton';

export const HomeView: React.FC = () => {
  const {
    products,
    collections,
    isLoadingProducts,
    setActiveTab,
    openProductDetail,
    recentlyViewed,
    setIsAiModalOpen,
    shopifyError,
    shopifyFixInstructions,
    refreshCatalog,
    setSelectedCollectionHandle,
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCatalog();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Categorized products
  const bestSellers = products.filter((p) => p.isBestSeller);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

  // New arrivals: products sorted or tagged as new, or latest entries
  const newArrivals = products.slice(-4).reverse();

  // Valid real collections
  const realCollections = (collections || []).filter(
    (c) => c.handle !== 'frontpage' && (c.productCount > 0 || (c.products && c.products.length > 0))
  );

  const categories = [
    { id: 'all', label: 'All Drops' },
    ...realCollections.map((c) => ({ id: c.handle, label: c.title })),
  ];

  const filteredFeed =
    selectedCategory === 'all'
      ? products
      : products.filter(
          (p) =>
            p.category.toLowerCase() === selectedCategory.toLowerCase() ||
            p.collections?.some((c) => c.handle.toLowerCase() === selectedCategory.toLowerCase())
        );

  const customerReviews = [
    {
      id: 'rev-1',
      name: 'Rohan Mehta',
      city: 'Bengaluru',
      rating: 5,
      comment: 'The 240 GSM oversized tee has the most substantial drape I have seen in India. Zero shrinkage after 3 washes.',
      product: '240 GSM Oversized Acid Wash Tee',
      date: 'Verified Buyer · 2 days ago',
    },
    {
      id: 'rev-2',
      name: 'Ananya Sharma',
      city: 'Mumbai',
      rating: 5,
      comment: 'Loved the Chanderi Silk detailing! The blend of traditional silhouette with modern streetwear cut is genius.',
      product: 'Handcrafted Chanderi Silk Kurti',
      date: 'Verified Buyer · 5 days ago',
    },
    {
      id: 'rev-3',
      name: 'Kabir Verma',
      city: 'Delhi NCR',
      rating: 5,
      comment: 'Cash on delivery arrived via Delhivery within 48 hours. Premium packaging and solid rib collar.',
      product: 'Heavyweight Graphic Backprint Tee',
      date: 'Verified Buyer · 1 week ago',
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Real Shopify Error Banner if connection fails */}
      {shopifyError && (
        <div className="mx-3.5 mt-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="text-rose-600 font-extrabold">●</span>
            <span>Shopify Storefront Connection Notice</span>
          </div>
          <p className="text-xs text-rose-800 font-mono bg-white/70 p-2 rounded-lg border border-rose-200 break-words">
            {shopifyError}
          </p>
          {shopifyFixInstructions && (
            <p className="text-xs text-rose-700">
              <span className="font-semibold">Action required:</span> {shopifyFixInstructions}
            </p>
          )}
          <button
            onClick={() => refreshCatalog()}
            className="self-start mt-1 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 1. HERO BANNER (KUKAPI Brand Identity) */}
      <section className="relative mx-3.5 mt-3 rounded-3xl overflow-hidden bg-zinc-950 text-white min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 shadow-xl border border-zinc-800">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
            alt="KUKAPI Streetwear Autumn Drop"
            className="w-full h-full object-cover object-top opacity-55 filter contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Top Floating Refresh / Status Indicator */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handlePullRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/20 transition-all active:scale-90"
            title="Refresh Live Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="relative z-10 max-w-lg flex flex-col items-start gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AUTHENTIC KUKAPI · 240 GSM LUXURY</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white leading-tight">
            HEAVYWEIGHT SILHOUETTES & MODERN CRAFT.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-md font-light leading-relaxed">
            Combed compact cotton engineered for Indian climate. Real-time Shopify inventory & express nationwide delivery.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <button
              id="hero-shop-now-btn"
              onClick={() => setActiveTab('shop')}
              className="px-5 py-2.5 rounded-full bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="hero-ask-stylist-btn"
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-medium hover:bg-white/20 transition-all"
            >
              Stylist Recommendation
            </button>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP */}
      <section className="grid grid-cols-3 gap-2 px-4 text-center">
        <div className="bg-white p-2.5 rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center">
          <Truck className="w-4 h-4 text-zinc-800 mb-1" />
          <span className="text-[11px] font-bold text-zinc-900">Pan-India Express</span>
          <span className="text-[9px] text-zinc-500">COD Available</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-zinc-800 mb-1" />
          <span className="text-[11px] font-bold text-zinc-900">100% Authentic</span>
          <span className="text-[9px] text-zinc-500">Direct from Shopify</span>
        </div>
        <div className="bg-white p-2.5 rounded-2xl border border-zinc-200/80 flex flex-col items-center justify-center">
          <RotateCcw className="w-4 h-4 text-zinc-800 mb-1" />
          <span className="text-[11px] font-bold text-zinc-900">Easy Exchanges</span>
          <span className="text-[9px] text-zinc-500">Hassle-free 7 Days</span>
        </div>
      </section>

      {/* 3. FEATURED SHOPIFY COLLECTIONS GRID */}
      {realCollections.length > 0 && (
        <section className="px-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-base text-zinc-950 tracking-tight">
              Featured Collections
            </h2>
            <button
              onClick={() => setActiveTab('shop')}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {realCollections.slice(0, 3).map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  setSelectedCollectionHandle(col.handle);
                  setActiveTab('shop');
                }}
                className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs hover:border-zinc-950 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Collection
                  </span>
                  <h3 className="font-heading font-extrabold text-xs text-zinc-900 mt-0.5 group-hover:text-zinc-950">
                    {col.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] font-bold text-zinc-600 group-hover:text-zinc-950">
                  <span>{col.productCount || col.products?.length || 0} Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. BEST SELLERS SECTION */}
      <section className="px-3.5 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-zinc-950 tracking-tight">
              Best Sellers
            </h2>
            <p className="text-[11px] text-zinc-500 font-medium">
              Most sought-after heavyweight garments
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="text-xs font-bold text-zinc-800 hover:text-black flex items-center gap-0.5"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayBestSellers.map((product) => (
              <ProductCard key={product.id} product={product} priority />
            ))}
          </div>
        )}
      </section>

      {/* 5. NEW ARRIVALS SECTION */}
      {newArrivals.length > 0 && (
        <section className="px-3.5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-extrabold text-lg text-zinc-950 tracking-tight">
                  New Arrivals
                </h2>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-400 text-zinc-950 rounded-full">
                  Fresh
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Latest cuts crafted for season 2026
              </p>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="text-xs font-bold text-zinc-800 hover:text-black flex items-center gap-0.5"
            >
              <span>See Drops</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. CUSTOMER REVIEWS / SOCIAL PROOF */}
      <section className="px-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-base text-zinc-950 tracking-tight">
              Community Reviews & Proof
            </h2>
            <p className="text-[11px] text-zinc-500">
              Verified buyers across India sharing authentic feedback
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.9 / 5</span>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {customerReviews.map((rev) => (
            <div
              key={rev.id}
              className="w-72 sm:w-80 shrink-0 p-4 bg-white rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-400">{rev.city}</span>
                </div>
                <p className="text-xs text-zinc-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-zinc-900 block">{rev.name}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {rev.date}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 max-w-[100px] truncate text-right">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. RECENTLY VIEWED STRIP */}
      {recentlyViewed.length > 0 && (
        <section className="px-3.5 flex flex-col gap-2.5">
          <h3 className="font-heading font-bold text-sm text-zinc-900 tracking-tight">
            Recently Viewed
          </h3>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {recentlyViewed.map((prod) => (
              <div
                key={prod.id}
                onClick={() => openProductDetail(prod)}
                className="w-28 shrink-0 bg-white rounded-xl overflow-hidden border border-zinc-200 cursor-pointer hover:shadow-sm"
              >
                <img
                  src={prod.featuredImage}
                  alt={prod.title}
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="p-1.5 text-center">
                  <p className="text-[10px] font-semibold text-zinc-900 truncate">
                    {prod.title}
                  </p>
                  <p className="text-[10px] font-black text-zinc-950">₹{prod.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
