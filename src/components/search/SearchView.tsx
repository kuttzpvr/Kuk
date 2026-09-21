import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, Loader2, Sparkles, Filter } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../shop/ProductCard';

export const SearchView: React.FC = () => {
  const {
    products,
    openProductDetail,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    executeSearch,
  } = useShop();

  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendingKeywords = [
    '240 GSM',
    'Oversized',
    'Chanderi Silk',
    'Cargo',
    'Black',
    'Heavyweight',
    'Kurti',
  ];

  // Derive instant suggestions as user types
  useEffect(() => {
    const q = localQuery.trim().toLowerCase();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    const matches = new Set<string>();
    products.forEach((p) => {
      if (p.title.toLowerCase().includes(q)) {
        matches.add(p.title);
      }
      p.tags?.forEach((t) => {
        if (t.toLowerCase().includes(q)) matches.add(t);
      });
      if (p.fabric?.toLowerCase().includes(q)) {
        matches.add(p.fabric);
      }
      if (p.category?.toLowerCase().includes(q)) {
        matches.add(p.category);
      }
    });
    setSuggestions(Array.from(matches).slice(0, 5));
  }, [localQuery, products]);

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        executeSearch(localQuery.trim());
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSelectTerm = (term: string) => {
    setLocalQuery(term);
    setSearchQuery(term);
    setShowSuggestions(false);
    executeSearch(term);
    addRecentSearch(term);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // If search query is non-empty, use searchResults (or fallback to filter over catalog)
  const results = localQuery.trim()
    ? searchResults.length > 0
      ? searchResults
      : products.filter((p) => {
          const q = localQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.fabric?.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        })
    : [];

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-24 max-w-2xl mx-auto w-full animate-in fade-in duration-150">
      {/* Search Input Bar */}
      <div className="relative z-20">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSelectTerm(localQuery);
              }
            }}
            placeholder="Search heavy tees, fabrics, silhouettes..."
            className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 shadow-xs transition-colors"
          />
          {localQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Instant Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && localQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-zinc-100 z-30">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTerm(s)}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-zinc-800 hover:bg-zinc-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950" />
                  <span className="line-clamp-1">{s}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* WHEN NO QUERY: Show Recent Searches & Trending Topics */}
      {!localQuery.trim() ? (
        <div className="flex flex-col gap-5 pt-1">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-zinc-400 hover:text-zinc-900 font-normal transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTerm(term)}
                    className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs text-zinc-800 hover:border-zinc-950 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              Popular KUKAPI Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {trendingKeywords.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectTerm(kw)}
                  className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-800 transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations from Catalog */}
          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">Featured Curations</span>
              <span className="text-[11px] text-zinc-500">Live Shopify Catalog</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* RESULTS SECTION */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Results for <strong className="text-zinc-900">"{localQuery}"</strong>
            </span>
            {isSearching ? (
              <span className="flex items-center gap-1 text-zinc-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Searching...
              </span>
            ) : (
              <span>{results.length} item{results.length !== 1 ? 's' : ''} found</span>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-zinc-950">
                No matching garments found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                We couldn't find any products matching "{localQuery}". Try searching for categories like "oversized", "kurti", "chanderi", or "t-shirt".
              </p>
              <button
                onClick={handleClear}
                className="mt-4 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
