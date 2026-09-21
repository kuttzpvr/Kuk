import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ChevronLeft,
  Share2,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { OrderTimelineEvent } from '../../types';

export const OrderTrackingView: React.FC = () => {
  const { currentOrder, setCurrentScreen, setActiveTab, showToast } = useShop();

  if (!currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <Package className="w-12 h-12 text-zinc-400 mb-3" />
        <h2 className="font-heading font-bold text-lg text-zinc-900">No active order selected</h2>
        <button
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen('main');
          }}
          className="mt-4 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const handleShareTracking = () => {
    navigator.clipboard?.writeText(
      `Track your KUKAPI Order ${currentOrder.orderNumber}: Tracking # ${currentOrder.trackingNumber} via ${currentOrder.carrier}`
    );
    showToast('Tracking details copied to clipboard!', 'success');
  };

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing at Hub', icon: Package },
    { key: 'shipped', label: 'Shipped (In Transit)', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  // Map order status to index
  const statusIndexMap: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
  };

  const currentStepIndex = statusIndexMap[currentOrder.status] ?? 1;

  return (
    <div className="flex flex-col bg-zinc-50 min-h-screen pb-28 animate-in fade-in duration-200">
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen('main');
          }}
          className="p-1.5 rounded-full hover:bg-zinc-100 flex items-center gap-1 text-xs font-semibold text-zinc-800"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-950" />
          <span>Home</span>
        </button>

        <span className="font-heading font-extrabold text-xs tracking-widest text-zinc-900 uppercase">
          LIVE SHIPMENT TRACKING
        </span>

        <button
          onClick={handleShareTracking}
          className="p-1.5 rounded-full text-zinc-600 hover:bg-zinc-100"
          title="Share Tracking"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full px-3.5 pt-3 flex flex-col gap-4">
        {/* Order Success Header Card */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {currentOrder.status.toUpperCase()}
            </span>
            <h1 className="font-heading font-black text-xl text-zinc-950 mt-1">
              Order {currentOrder.orderNumber}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Estimated Delivery: <strong>{currentOrder.estimatedDelivery}</strong>
            </p>
          </div>

          <div className="w-full bg-zinc-50 rounded-2xl p-3 border border-zinc-200/60 flex items-center justify-between text-xs text-left">
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">Carrier & Waybill</span>
              <span className="font-bold text-zinc-900">
                {currentOrder.carrier} ({currentOrder.trackingNumber})
              </span>
            </div>
            <span className="text-emerald-700 bg-emerald-100/70 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Truck className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        {/* Visual Milestone Timeline */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-4">
          <h2 className="font-heading font-extrabold text-sm text-zinc-950">
            Shipment Milestones
          </h2>

          <div className="flex flex-col gap-5 relative pl-6 border-l-2 border-zinc-200 ml-2">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative flex flex-col items-start text-xs">
                  {/* Circle marker */}
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCurrent
                        ? 'bg-zinc-950 border-zinc-950 text-white ring-4 ring-zinc-200'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-zinc-300 text-zinc-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  <span
                    className={`font-heading font-bold ${
                      isCurrent
                        ? 'text-zinc-950 font-black text-sm'
                        : isPastOrCurrent
                        ? 'text-zinc-800'
                        : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </span>

                  {isCurrent && (
                    <span className="text-[11px] text-zinc-500 mt-0.5">
                      Your parcel is being handled at the fulfillment hub with priority care.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment & COD Breakdown Card */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-2.5 text-xs">
          <h2 className="font-heading font-extrabold text-sm text-zinc-950">
            Payment & Balance Summary
          </h2>

          <div className="flex justify-between text-zinc-600">
            <span>Payment Mode</span>
            <span className="font-bold text-zinc-900 capitalize">
              {currentOrder.paymentMethod.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between text-zinc-600">
            <span>Total Order Value</span>
            <span className="font-bold text-zinc-900">₹{currentOrder.total || currentOrder.totalAmount}</span>
          </div>

          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Amount Paid Online (Advance)</span>
            <span className="font-bold">₹{currentOrder.payableNow}</span>
          </div>

          <div className="border-t border-zinc-100 pt-2 flex justify-between items-baseline font-heading font-black text-sm text-zinc-950">
            <span>To Pay on Delivery (Cash / UPI)</span>
            <span className={currentOrder.remainingCod > 0 ? 'text-amber-600' : 'text-zinc-900'}>
              ₹{currentOrder.remainingCod}
            </span>
          </div>

          {currentOrder.remainingCod > 0 ? (
            <div className="mt-1 p-2.5 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200/70 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please keep ₹{currentOrder.remainingCod} ready for the courier agent upon arrival.</span>
            </div>
          ) : (
            <div className="mt-1 p-2.5 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200/70 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paid in full! No doorstep collection required.</span>
            </div>
          )}
        </div>

        {/* Items Ordered List */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-3">
          <h2 className="font-heading font-extrabold text-sm text-zinc-950">
            Items in this Shipment ({currentOrder.items.length})
          </h2>

          <div className="flex flex-col divide-y divide-zinc-100">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                <img
                  src={item.product.featuredImage}
                  alt={item.product.title}
                  className="w-12 h-14 object-cover rounded-lg bg-zinc-100"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-900 line-clamp-1">{item.product.title}</h4>
                  <p className="text-[11px] text-zinc-500">
                    Size: {item.selectedVariant.size} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-zinc-950">
                  ₹{item.selectedVariant.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col gap-1 text-xs">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-zinc-700">
            Delivering To
          </h3>
          <p className="font-bold text-zinc-900 mt-1">{currentOrder.shippingAddress.name}</p>
          <p className="text-zinc-600">{currentOrder.shippingAddress.addressLine1}</p>
          <p className="text-zinc-600">
            {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} -{' '}
            {currentOrder.shippingAddress.pincode}
          </p>
          <p className="text-zinc-500 mt-1">Phone: {currentOrder.shippingAddress.phone}</p>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => {
            setActiveTab('shop');
            setCurrentScreen('main');
          }}
          className="w-full py-3.5 rounded-2xl bg-zinc-950 text-white font-extrabold text-xs hover:bg-zinc-800 transition-all active:scale-95"
        >
          Continue Shopping KUKAPI
        </button>
      </div>
    </div>
  );
};
