import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  Loader2,
  Check,
  Sparkles,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from './ProductCard';

export const ProductListingView: React.FC = () => {
  const {
    products,
    collections,
    isLoadingProducts,
    shopifyError,
    shopifyFixInstructions,
    refreshCatalog,
  } = useShop();

  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('popular');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Multi-attribute filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // Derive all available sizes and colors from actual Shopify products & variants
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.size && v.size !== 'One Size') set.add(v.size);
      });
    });
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'Free Size'];
    return Array.from(set).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.localeCompare(b);
    });
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.color && !map.has(v.color.toLowerCase())) {
          map.set(v.color.toLowerCase(), v.colorHex || '#18181b');
        }
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hex,
    }));
  }, [products]);

  // Real Shopify Collections list (strictly real collections from Storefront API)
  const validCollections = useMemo(() => {
    const list = [{ id: 'all', title: 'All Garments', count: products.length }];
    if (collections && collections.length > 0) {
      collections.forEach((c) => {
        if (c.handle !== 'frontpage' && (c.productCount > 0 || (c.products && c.products.length > 0))) {
          list.push({
            id: c.handle,
            title: c.title,
            count: c.productCount || c.products?.length || 0,
          });
        }
      });
    }
    return list;
  }, [collections, products.length]);

  // Dynamic Multi-Attribute Filtering & Sorting Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Collection filter
        if (selectedCollection !== 'all') {
          const inShopifyCollection = p.collections?.some(
            (c) =>
              c.handle.toLowerCase() === selectedCollection.toLowerCase() ||
              c.title.toLowerCase() === selectedCollection.toLowerCase()
          );
          const categoryMatch = p.category?.toLowerCase() === selectedCollection.toLowerCase();
          const tagMatch = p.tags?.some((t) => t.toLowerCase() === selectedCollection.toLowerCase());
          const titleMatch = p.title.toLowerCase().includes(selectedCollection.toLowerCase());
          if (!inShopifyCollection && !categoryMatch && !tagMatch && !titleMatch) {
            return false;
          }
        }

        // 2. Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
          const matchFabric = p.fabric?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchTags && !matchFabric) return false;
        }

        // 3. Price Filter
        if (p.price > maxPrice) return false;

        // 4. Availability Filter
        if (inStockOnly && !p.availableForSale) return false;

        // 5. Size Filter (must match at least one selected size)
        if (selectedSizes.length > 0) {
          const hasSize = p.variants.some((v) => selectedSizes.includes(v.size));
          if (!hasSize) return false;
        }

        // 6. Color Filter (must match at least one selected color)
        if (selectedColors.length > 0) {
          const hasColor = p.variants.some((v) =>
            selectedColors.some((c) => v.color.toLowerCase() === c.toLowerCase())
          );
          if (!hasColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
        return 0; // Popular / Featured default
      });
  }, [
    products,
    selectedCollection,
    searchQuery,
    maxPrice,
    inStockOnly,
    selectedSizes,
    selectedColors,
    sortBy,
  ]);

  // Active filter count
  const activeFiltersCount =
    (selectedCollection !== 'all' ? 1 : 0) +
    (selectedSizes.length > 0 ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 5000 ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCollection('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setMaxPrice(5000);
    setSearchQuery('');
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24">
      {/* Real Shopify Error Banner if connection fails */}
      {shopifyError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Shopify Storefront API Error</span>
          </div>
          <p className="text-xs text-rose-800 font-mono bg-white/70 p-2 rounded-lg border border-rose-200 break-words">
            {shopifyError}
          </p>
          {shopifyFixInstructions && (
            <p className="text-xs text-rose-700">
              <span className="font-semibold">How to fix:</span> {shopifyFixInstructions}
            </p>
          )}
          <button
            onClick={() => refreshCatalog()}
            className="self-start mt-1 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Header with Title & Result Count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-zinc-950 tracking-tight">
            KUKAPI Catalog
          </h1>
          <p className="text-[11px] text-zinc-500 font-medium">
            {isLoadingProducts ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing live Shopify inventory...
              </span>
            ) : (
              `Showing ${filteredProducts.length} of ${products.length} live Shopify products`
            )}
          </p>
        </div>

        {/* Filter Drawer Toggle with Badge */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
            showFilterDrawer || activeFiltersCount > 0
              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Search & Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search heavyweight tees, kurtis..."
            className="w-full bg-white border border-zinc-200 rounded-full pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-white border border-zinc-200 text-zinc-800 text-xs font-bold rounded-full pl-3 pr-8 py-2 focus:outline-none focus:border-zinc-950 transition-colors cursor-pointer shadow-2xs"
          >
            <option value="popular">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Real Shopify Collections Pills Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {validCollections.map((col) => (
          <button
            key={col.id}
            onClick={() => setSelectedCollection(col.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCollection === col.id
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {col.title} {col.count > 0 && `(${col.count})`}
          </button>
        ))}
      </div>

      {/* COMPREHENSIVE FILTER DRAWER */}
      {showFilterDrawer && (
        <div className="p-4 bg-white rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-800" />
              <span className="font-heading font-extrabold text-sm text-zinc-950">
                Filter Catalog ({filteredProducts.length} results)
              </span>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-950 underline"
              >
                Reset All ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* 1. Price Range */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
              <span>Max Price</span>
              <span className="font-extrabold text-zinc-950">Up to ₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-zinc-950 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>₹500</span>
              <span>₹2,500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* 2. Availability */}
          <div className="flex items-center justify-between py-1 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-800">In Stock Only</span>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                inStockOnly ? 'bg-zinc-950' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  inStockOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Sizes from live variants */}
          {availableSizes.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-2">
              <span className="text-xs font-bold text-zinc-800">Available Sizes</span>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((sz) => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Colors from live variants */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-2">
              <span className="text-xs font-bold text-zinc-800">Color Palette</span>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleColor(c.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
                        active
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-base text-zinc-950">
            No products match your criteria
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            Try loosening your filters or resetting the price/size selection.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
