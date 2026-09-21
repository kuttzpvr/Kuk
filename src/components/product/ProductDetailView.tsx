import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  MapPin,
  Ruler,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useShop } from '../../context/ShopContext';
import { SizeChartModal } from './SizeChartModal';
import { ExternalLink, X } from 'lucide-react';

export const ProductDetailView: React.FC<{ product: Product }> = ({ product }) => {
  const {
    closeProductDetail,
    addToCart,
    buyNow,
    isSyncingCart,
    toggleWishlist,
    isInWishlist,
    setCurrentScreen,
    setActiveTab,
    showToast,
    setIsAiModalOpen,
  } = useShop();

  const isWished = isInWishlist(product.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants[0]?.size || 'M'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants[0]?.color || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('400001');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(
    '⚡ Cash on Delivery Available for 400001. Delivery in 3-4 business days.'
  );
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [buyNowCheckoutUrl, setBuyNowCheckoutUrl] = useState<string | null>(null);

  // Find exact matching variant based on size and color
  const currentVariant: ProductVariant =
    product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase())
    ) ||
    product.variants.find((v) => v.size === selectedSize) ||
    product.variants[0];

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const uniqueColors = Array.from(
    new Set(
      product.variants.map((v) => ({
        color: v.color,
        hex: v.colorHex,
      }))
    )
  ).filter(
    (v, i, arr) => arr.findIndex((item) => item.color === v.color) === i
  );

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setPincodeStatus(
      `⚡ Cash on Delivery is AVAILABLE for ${pincode}! Estimated delivery in 3 business days via Delhivery Express.`
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on KUKAPI:`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      const url = await buyNow(product, currentVariant, quantity);
      setBuyNowCheckoutUrl(url);
      showToast('Shopify checkout generated! Opening checkout...', 'success');
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Modal below provides direct link
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize Shopify checkout', 'error');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-50 min-h-screen pb-28 animate-in fade-in duration-200">
      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={closeProductDetail}
          className="p-1.5 rounded-full hover:bg-zinc-100 transition-colors flex items-center gap-1 text-xs font-semibold text-zinc-800"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-950" />
          <span>Back</span>
        </button>

        <span className="font-heading font-extrabold text-xs tracking-widest text-zinc-900 uppercase">
          KUKAPI APPAREL
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full text-zinc-600 hover:bg-zinc-100"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-1.5 rounded-full ${
              isWished ? 'text-rose-600' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto w-full flex flex-col gap-5 px-3.5 pt-2">
        {/* 1. Large Image Gallery */}
        <div className="flex flex-col gap-2">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-200 shadow-md border border-zinc-200/80">
            <img
              src={product.images[selectedImageIndex] || product.featuredImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-3.5 left-3.5 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.gsm && (
              <span className="absolute top-3.5 right-3.5 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700">
                {product.gsm}
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-zinc-950 ring-2 ring-zinc-950/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Product Header & Pricing */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-bold tracking-wider uppercase text-zinc-700">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-zinc-900">{product.rating}</span>
              <span className="text-zinc-400">({product.reviewCount} reviews)</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-zinc-950 leading-snug">
            {product.title}
          </h1>

          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="font-heading font-black text-2xl text-zinc-950">
              ₹{product.price}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-zinc-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Save ₹{product.compareAtPrice - product.price} ({product.discountPercent}%)
            </span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Inclusive of all taxes. Free shipping on prepaid orders over ₹999.
          </p>
        </div>

        {/* 3. Color Selection */}
        {uniqueColors.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">
                Color: <span className="font-normal text-zinc-600">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              {uniqueColors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c.color)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor.toLowerCase() === c.color.toLowerCase()
                      ? 'border-zinc-950 scale-110 shadow-sm'
                      : 'border-zinc-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.color}
                >
                  {selectedColor.toLowerCase() === c.color.toLowerCase() && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        c.hex === '#f4f1ea' || c.hex === '#fffff0' ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Size Selection & Interactive Size Chart */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">
              Select Size: <span className="font-black text-zinc-950">{selectedSize}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-xs font-bold text-zinc-900 flex items-center gap-1 hover:underline"
              >
                <Ruler className="w-3.5 h-3.5 text-zinc-600" />
                <span>Size Chart</span>
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>AI Fit Finder</span>
              </button>
            </div>
          </div>

          {/* Size Pills */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {uniqueSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[48px] py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-zinc-950 text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-zinc-500 mt-1">
            Fit: <span className="font-semibold text-zinc-800">{product.fit}</span>
          </p>
        </div>

        {/* 5. Quantity Selector */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900">Quantity</span>
          <div className="flex items-center gap-3 bg-zinc-100 px-3 py-1.5 rounded-2xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-xs text-zinc-950 w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. PIN Code COD & Delivery Check */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
            <MapPin className="w-4 h-4 text-zinc-700" />
            <span>Delivery & COD Availability Check</span>
          </div>
          <form onSubmit={handlePincodeCheck} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter 6-digit PIN code"
              className="flex-1 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
            >
              Check
            </button>
          </form>
          {pincodeStatus && (
            <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100 mt-1">
              {pincodeStatus}
            </p>
          )}
        </div>

        {/* 7. Product Description & Fabric Spec */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-3">
          <h3 className="font-heading font-extrabold text-sm text-zinc-950">
            Product Story & Craftsmanship
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-light">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 text-[11px]">
            <div>
              <span className="text-zinc-400 block">Fabric:</span>
              <span className="font-bold text-zinc-900">{product.fabric}</span>
            </div>
            {product.gsm && (
              <div>
                <span className="text-zinc-400 block">Weight / Feel:</span>
                <span className="font-bold text-zinc-900">{product.gsm}</span>
              </div>
            )}
            <div>
              <span className="text-zinc-400 block">Wash Care:</span>
              <span className="font-bold text-zinc-900">{product.care}</span>
            </div>
            <div>
              <span className="text-zinc-400 block">Dispatch:</span>
              <span className="font-bold text-zinc-900">Within 24 Hours</span>
            </div>
          </div>
        </div>

        {/* 8. Customer Reviews Section */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-zinc-950">
              Verified Buyer Reviews ({product.reviews?.length || 0})
            </h3>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating} / 5</span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="py-2.5 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  {rev.sizeBought && (
                    <span className="text-[10px] text-zinc-400">
                      Purchased: {rev.sizeBought}
                    </span>
                  )}
                  <p className="text-zinc-600 mt-0.5 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-3">No reviews yet for this drop.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 safe-area-inset-bottom">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            id="add-to-cart-btn"
            disabled={isSyncingCart}
            onClick={() => addToCart(product, currentVariant, quantity)}
            className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-xs hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isSyncingCart ? 'Adding to Shopify Bag...' : 'Add to Bag'}</span>
          </button>
          <button
            id="buy-now-btn"
            disabled={isBuyingNow}
            onClick={handleBuyNow}
            className="flex-1 py-3 px-4 rounded-2xl bg-zinc-950 text-white font-extrabold text-xs hover:bg-zinc-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{isBuyingNow ? 'Creating Shopify Checkout...' : `Buy Now · ₹${currentVariant.price * quantity}`}</span>
          </button>
        </div>
      </div>

      {/* Buy Now Shopify Checkout Ready Modal */}
      {buyNowCheckoutUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-zinc-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-heading font-black text-sm text-zinc-950 uppercase tracking-wide">
                  Shopify Checkout Ready
                </span>
              </div>
              <button
                onClick={() => setBuyNowCheckoutUrl(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              A real Shopify checkout session for <span className="font-bold text-zinc-900">{product.title} ({currentVariant.size})</span> has been created on <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px] text-zinc-800">kukapi.myshopify.com</code>.
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Selected Variant</span>
                <span className="font-semibold text-zinc-800">{currentVariant.size}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Quantity</span>
                <span className="font-semibold text-zinc-800">{quantity}</span>
              </div>
              <div className="flex justify-between text-zinc-950 font-bold border-t border-zinc-200 pt-1 mt-1">
                <span>Total Due</span>
                <span>₹{currentVariant.price * quantity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                id="modal-open-shopify-checkout-anchor"
                href={buyNowCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs text-center hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Open Shopify Checkout</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(buyNowCheckoutUrl);
                  showToast('Shopify checkout URL copied!', 'success');
                }}
                className="px-3.5 py-3 rounded-xl bg-zinc-100 text-zinc-800 font-bold text-xs hover:bg-zinc-200 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        product={product}
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </div>
  );
};
