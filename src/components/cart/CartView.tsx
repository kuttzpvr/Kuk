import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { shopifyService } from '../../services/shopifyService';

export const CartView: React.FC = () => {
  const {
    cart,
    shopifyCart,
    isSyncingCart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    promoDiscount,
    adminConfig,
    setCurrentScreen,
    setActiveTab,
    showToast,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isGeneratingShopifyUrl, setIsGeneratingShopifyUrl] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Calculations
  const freeShippingNeeded = Math.max(0, adminConfig.freeShippingThreshold - cartSubtotal);
  const shippingFee = cartSubtotal >= adminConfig.freeShippingThreshold || cartSubtotal === 0
    ? 0
    : adminConfig.shippingFee;
  const estimatedTotal = cartSubtotal - promoDiscount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromoCode(couponInput);
    setCouponMsg({ text: res.message, success: res.success });
    if (res.success) setCouponInput('');
  };

  const handleShopifyWebCheckout = async () => {
    setIsGeneratingShopifyUrl(true);
    try {
      let url: string;
      if (shopifyCart?.checkoutUrl) {
        url = shopifyCart.checkoutUrl;
        if (appliedPromo) {
          url += (url.includes('?') ? '&' : '?') + `discount=${encodeURIComponent(appliedPromo)}`;
        }
      } else {
        url = await shopifyService.createShopifyCheckout(cart, appliedPromo);
      }
      setCheckoutUrl(url);
      showToast('Shopify checkout ready! Opening checkout...', 'success');
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Handled via displayed link
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate Shopify checkout session', 'error');
    } finally {
      setIsGeneratingShopifyUrl(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-zinc-950">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
          Looks like you haven't added any KUKAPI streetwear or ethnic pieces to your cart yet.
        </p>
        <button
          onClick={() => {
            setActiveTab('shop');
            setCurrentScreen('main');
          }}
          className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-3.5 pt-3 pb-28 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-zinc-950 tracking-tight">
            Shopping Bag ({cart.length})
          </h1>
          {shopifyCart?.id && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shopify Storefront Cart Connected</span>
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-zinc-500">
          Subtotal: ₹{cartSubtotal}
        </span>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-900">
            {freeShippingNeeded === 0
              ? '🎉 You unlocked FREE Express Shipping!'
              : `Add ₹${freeShippingNeeded} more for Free Express Shipping`}
          </span>
          <span className="text-[11px] text-zinc-500">
            Goal: ₹{adminConfig.freeShippingThreshold}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                (cartSubtotal / adminConfig.freeShippingThreshold) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col gap-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex gap-3 items-center"
          >
            {/* Thumbnail */}
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
              <img
                src={item.product.featuredImage}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between self-stretch py-0.5">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1">
                    {item.product.title}
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Variant: <span className="font-semibold text-zinc-800">{item.selectedVariant.size}</span>
                  {item.selectedVariant.color && (
                    <span> · {item.selectedVariant.color}</span>
                  )}
                </p>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-black text-sm text-zinc-950">
                    ₹{item.selectedVariant.price * item.quantity}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-zinc-400">
                      (₹{item.selectedVariant.price} each)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-zinc-100 px-2.5 py-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-zinc-600 hover:text-black p-0.5"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-zinc-950 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-zinc-600 hover:text-black p-0.5"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Code Section */}
      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-2">
        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-zinc-700" />
          Discount Promo Code
        </span>

        {appliedPromo ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-emerald-800 tracking-wider">
                {appliedPromo}
              </span>
              <span className="text-emerald-700">Applied (-₹{promoDiscount})</span>
            </div>
            <button
              onClick={removePromoCode}
              className="text-rose-600 hover:text-rose-800 font-bold text-[11px]"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. KUKAPI10 or FASHION20"
              className="flex-1 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold uppercase text-zinc-900 placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-zinc-950"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
            >
              Apply
            </button>
          </form>
        )}

        {couponMsg && (
          <p
            className={`text-[11px] font-medium ${
              couponMsg.success ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {couponMsg.text}
          </p>
        )}
      </div>

      {/* Bill Breakdown */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-2.5 text-xs">
        <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-zinc-900">
          Order Summary
        </h3>

        <div className="flex justify-between text-zinc-600">
          <span>Bag Subtotal</span>
          <span className="font-bold text-zinc-900">₹{cartSubtotal}</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Coupon Discount</span>
            <span>-₹{promoDiscount}</span>
          </div>
        )}

        <div className="flex justify-between text-zinc-600">
          <span>Express Delivery</span>
          <span>
            {shippingFee === 0 ? (
              <span className="font-bold text-emerald-700">FREE</span>
            ) : (
              `₹${shippingFee}`
            )}
          </span>
        </div>

        <div className="border-t border-zinc-100 pt-2 flex justify-between items-baseline font-heading font-black text-sm text-zinc-950">
          <span>Total</span>
          <span>₹{estimatedTotal}</span>
        </div>
      </div>

      {/* Generated Shopify Checkout Link Banner */}
      {checkoutUrl && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-xs text-emerald-950 uppercase tracking-wide">
              Official Shopify Checkout Ready
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              kukapi.myshopify.com
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your live Shopify checkout session with {cart.length} item{cart.length > 1 ? 's' : ''} has been created via Shopify Storefront API.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              id="open-shopify-checkout-anchor"
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs text-center hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Open Shopify Checkout</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(checkoutUrl);
                showToast('Shopify checkout URL copied to clipboard!', 'success');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100/50 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Primary Shopify Checkout Action */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          id="proceed-shopify-checkout-btn"
          onClick={handleShopifyWebCheckout}
          disabled={isGeneratingShopifyUrl}
          className="w-full py-4 px-6 rounded-2xl bg-zinc-950 text-white font-extrabold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isGeneratingShopifyUrl ? (
            <span>Generating Shopify Checkout Session...</span>
          ) : (
            <>
              <span>Proceed to Shopify Checkout (₹{estimatedTotal})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-zinc-400">
          Powered directly by KUKAPI's live Shopify Storefront API
        </p>
      </div>
    </div>
  );
};
