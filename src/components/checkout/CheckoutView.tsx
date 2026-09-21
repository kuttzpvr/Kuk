import React, { useState } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Banknote,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PaymentMethod, ShippingAddress } from '../../types';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    shopifyCart,
    cartSubtotal,
    promoDiscount,
    appliedPromo,
    adminConfig,
    user,
    setCurrentScreen,
    generateShopifyCheckoutUrl,
    showToast,
  } = useShop();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('partial_cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopifyCheckoutUrl, setShopifyCheckoutUrl] = useState<string | null>(null);

  // Address State
  const defaultAddr = user?.savedAddresses[0];
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: defaultAddr?.name || user?.name || 'Aarav Singhania',
    email: defaultAddr?.email || user?.email || 'customer@kukapi.com',
    phone: defaultAddr?.phone || '+91 98200 12345',
    addressLine1: defaultAddr?.addressLine1 || 'B-702, Oberoi Sky City, Borivali East',
    addressLine2: defaultAddr?.addressLine2 || 'Near Western Express Highway',
    city: defaultAddr?.city || 'Mumbai',
    state: defaultAddr?.state || 'Maharashtra',
    pincode: defaultAddr?.pincode || '400066',
  });

  // Calculate totals
  const shippingFee = cartSubtotal >= adminConfig.freeShippingThreshold ? 0 : adminConfig.shippingFee;
  const codHandlingFee = paymentMethod === 'online' ? 0 : adminConfig.codFee;
  const grandTotal = cartSubtotal - promoDiscount + shippingFee + codHandlingFee;

  // Partial COD vs Full Online vs Full COD Math
  let payableNow = grandTotal;
  let remainingCod = 0;

  if (paymentMethod === 'partial_cod') {
    payableNow = Math.min(adminConfig.codAdvance, grandTotal);
    remainingCod = Math.max(0, grandTotal - payableNow);
  } else if (paymentMethod === 'cod') {
    payableNow = 0;
    remainingCod = grandTotal;
  } else {
    payableNow = grandTotal;
    remainingCod = 0;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = await generateShopifyCheckoutUrl(appliedPromo);
      setShopifyCheckoutUrl(url);
      showToast('Official Shopify checkout session created!', 'success');
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Shown via displayed button
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate Shopify checkout session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-50 min-h-screen pb-28 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('main')}
          className="p-1.5 rounded-full hover:bg-zinc-100 flex items-center gap-1 text-xs font-semibold text-zinc-800"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-950" />
          <span>Back to Bag</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Checkout</span>
        </div>

        <div className="w-8" />
      </div>

      <div className="max-w-xl mx-auto w-full px-3.5 pt-3 flex flex-col gap-4">
        {/* Step 1: Customer & Delivery Address */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h2 className="font-heading font-extrabold text-sm text-zinc-950 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Delivery Details</span>
            </h2>
            <span className="text-[10px] text-zinc-400">Pan-India Express</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="col-span-2">
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                placeholder="Recipient name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                placeholder="+91 Mobile number"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={shippingAddress.email}
                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                placeholder="For order tracking"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Flat / House / Building Address *
              </label>
              <input
                type="text"
                value={shippingAddress.addressLine1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                placeholder="Street address"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">City *</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={shippingAddress.pincode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 2: Payment Architecture Selection */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h2 className="font-heading font-extrabold text-sm text-zinc-950 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              <span>Payment Mode & COD Architecture</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Secure
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* OPTION 1: COD Advance (Recommended) */}
            <label
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                paymentMethod === 'partial_cod'
                  ? 'border-zinc-950 bg-zinc-950/5 shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'partial_cod'}
                    onChange={() => setPaymentMethod('partial_cod')}
                    className="mt-1 text-zinc-950 focus:ring-zinc-950"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-950">
                        COD Advance (Partial Payment)
                      </span>
                      <span className="bg-amber-400 text-zinc-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Pay ₹{adminConfig.codAdvance} online now to confirm order. Remaining ₹{Math.max(0, grandTotal - adminConfig.codAdvance)} payable on delivery!
                    </p>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              </div>
            </label>

            {/* OPTION 2: Full Online Payment */}
            <label
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                paymentMethod === 'online'
                  ? 'border-zinc-950 bg-zinc-950/5 shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="mt-1 text-zinc-950 focus:ring-zinc-950"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-950">
                        Full Online Payment (UPI, Cards, NetBanking)
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Save ₹{adminConfig.codFee} COD Fee
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Instant verification, zero COD convenience fee, priority warehouse dispatch.
                    </p>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              </div>
            </label>

            {/* OPTION 3: Full Cash on Delivery */}
            <label
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                paymentMethod === 'cod'
                  ? 'border-zinc-950 bg-zinc-950/5 shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-zinc-950 focus:ring-zinc-950"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-950 block">
                      Full Cash on Delivery (COD)
                    </span>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Pay entire ₹{grandTotal} in cash/UPI when courier arrives at your door (+₹{adminConfig.codFee} handling).
                    </p>
                  </div>
                </div>
                <Banknote className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Precise COD Payment Split Matrix */}
        <div className="bg-zinc-950 text-white p-4 rounded-3xl shadow-lg border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Payment Breakdown Matrix
            </span>
            <span className="text-[11px] text-zinc-400">
              Method: {paymentMethod === 'partial_cod' ? 'COD Advance' : paymentMethod === 'cod' ? 'Full COD' : 'Prepaid Online'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
              <span className="text-[10px] text-zinc-400 block mb-0.5">Total Amount</span>
              <span className="font-heading font-black text-sm text-white">₹{grandTotal}</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-2xl">
              <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">Payable Now</span>
              <span className="font-heading font-black text-sm text-emerald-300">₹{payableNow}</span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl">
              <span className="text-[10px] text-amber-400 font-bold block mb-0.5">Remaining COD</span>
              <span className="font-heading font-black text-sm text-amber-300">₹{remainingCod}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-300 bg-white/5 p-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {paymentMethod === 'partial_cod'
                ? `You will only be charged ₹${payableNow} online today. Our delivery agent will collect remaining ₹${remainingCod} at your doorstep.`
                : paymentMethod === 'cod'
                ? `You pay ₹0 now. Keep ₹${remainingCod} ready at delivery.`
                : '100% payment processed online via encrypted gateway.'}
            </span>
          </div>
        </div>

        {/* Generated Shopify Checkout Link Banner */}
        {shopifyCheckoutUrl && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-4 flex flex-col gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-heading font-black text-xs text-emerald-950 uppercase tracking-wide">
                Live Shopify Checkout Session Ready
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                kukapi.myshopify.com
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your real checkout session has been generated on Shopify. Complete your purchase directly on Shopify's official checkout.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                id="checkout-screen-open-shopify-anchor"
                href={shopifyCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs text-center hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Open Shopify Checkout</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(shopifyCheckoutUrl);
                  showToast('Shopify checkout link copied!', 'success');
                }}
                className="px-3.5 py-3 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100/50 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Place Order CTA */}
        <button
          id="confirm-place-order-btn"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-zinc-950 text-white font-extrabold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Generating Official Shopify Checkout...</span>
          ) : (
            <>
              <span>
                Proceed to Official Shopify Checkout (₹{grandTotal})
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-400 text-center">
          By clicking confirm, you accept KUKAPI's terms of service and 7-day hassle-free return policy.
        </p>
      </div>
    </div>
  );
};
