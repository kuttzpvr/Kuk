import React from 'react';
import {
  X,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ShopifyCustomerOrder } from '../../types';

interface OrderDetailsModalProps {
  order: ShopifyCustomerOrder | null;
  onClose: () => void;
  onTrack?: (order: ShopifyCustomerOrder) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onTrack }) => {
  if (!order) return null;

  const dateStr = order.processedAt
    ? new Date(order.processedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  // Format financial status
  const financialStatus = (order.financialStatus || 'PAID').replace(/_/g, ' ');
  const fulfillmentStatus = (order.fulfillmentStatus || 'UNFULFILLED').replace(/_/g, ' ');

  const isFulfilled = order.fulfillmentStatus === 'FULFILLED';
  const isPaid = order.financialStatus === 'PAID';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-sm text-zinc-950">
                Order #{order.orderNumber}
              </h2>
              <p className="text-[11px] text-zinc-500">{dateStr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>Payment: {financialStatus}</span>
            </div>

            <div
              className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${
                isFulfilled
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Fulfillment: {fulfillmentStatus}</span>
            </div>
          </div>

          {/* VISUAL ORDER TRACKING TIMELINE */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-xs text-zinc-950 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Order Tracking Timeline</span>
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Shopify Verified Status
              </span>
            </div>

            {/* Timeline Steps (Order Placed -> Confirmed -> Processing -> Shipped -> Out for Delivery -> Delivered) */}
            <div className="relative pl-6 flex flex-col gap-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {/* Step 1: Order Placed */}
              <div className="relative flex flex-col">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-zinc-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Order Placed</span>
                  <span className="text-[10px] text-zinc-400 font-medium">{dateStr}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Order confirmed and registered in system.</p>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-zinc-50 ${
                    isPaid || order.financialStatus === 'AUTHORIZED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  {isPaid || order.financialStatus === 'AUTHORIZED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Confirmed</span>
                  {isPaid && (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Paid</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {isPaid
                    ? 'Payment verified & order inventory allocated.'
                    : 'Order received, pending payment or COD advance verification.'}
                </p>
              </div>

              {/* Step 3: Processing */}
              <div className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-zinc-50 ${
                    isFulfilled || order.fulfillmentStatus === 'IN_TRANSIT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-950 text-white animate-pulse'
                  }`}
                >
                  {isFulfilled || order.fulfillmentStatus === 'IN_TRANSIT' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Processing</span>
                  {!isFulfilled && (
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">In Progress</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {isFulfilled
                    ? 'Garments customized, inspected, and packed.'
                    : 'Studio quality inspection & packaging underway.'}
                </p>
              </div>

              {/* Step 4: Shipped */}
              <div className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-zinc-50 ${
                    isFulfilled || order.fulfillmentStatus === 'IN_TRANSIT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}
                >
                  {isFulfilled || order.fulfillmentStatus === 'IN_TRANSIT' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Truck className="w-3 h-3" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Shipped</span>
                  {isFulfilled && (
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Dispatched</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {isFulfilled
                    ? `Handed over to logistics carrier (${order.successfulFulfillments?.[0]?.trackingCompany || 'Courier'}).`
                    : 'Dispatches upon completion of packaging.'}
                </p>
              </div>

              {/* Step 5: Out for Delivery */}
              <div className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-zinc-50 ${
                    order.fulfillmentStatus === 'DELIVERED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}
                >
                  {order.fulfillmentStatus === 'DELIVERED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Out for Delivery</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {order.fulfillmentStatus === 'DELIVERED'
                    ? 'Courier delivery agent arrived at your address.'
                    : 'Scheduled once package arrives at your local delivery hub.'}
                </p>
              </div>

              {/* Step 6: Delivered */}
              <div className="relative flex flex-col">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-zinc-50 ${
                    order.fulfillmentStatus === 'DELIVERED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-400'
                  }`}
                >
                  {order.fulfillmentStatus === 'DELIVERED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-300" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 text-xs">Delivered</span>
                  {order.fulfillmentStatus === 'DELIVERED' && (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Completed</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {order.fulfillmentStatus === 'DELIVERED'
                    ? 'Delivered safely to shipping destination.'
                    : 'Final delivery confirmation.'}
                </p>
              </div>
            </div>

            {/* COURIER & LIVE TRACKING DETAILS (Only from actual Shopify data) */}
            {order.successfulFulfillments &&
            order.successfulFulfillments.length > 0 &&
            order.successfulFulfillments.some((f) => f.trackingInfo && f.trackingInfo.length > 0) ? (
              <div className="mt-2 p-3 rounded-xl bg-zinc-900 text-white flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Courier Shipment Information</span>
                  </div>
                  <span className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                    Live
                  </span>
                </div>
                {order.successfulFulfillments.map((ful, fIdx) => (
                  <div key={fIdx} className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400">Courier Partner:</span>
                      <span className="font-bold text-zinc-100">{ful.trackingCompany || 'Express Delivery'}</span>
                    </div>
                    {ful.trackingInfo?.map((trk, tIdx) => (
                      <div key={tIdx} className="flex flex-col gap-1.5">
                        {trk.number && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-400">Tracking # / AWB:</span>
                            <span className="font-mono font-bold text-emerald-300">{trk.number}</span>
                          </div>
                        )}
                        {trk.url && (
                          <a
                            href={trk.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Track Shipment</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1 p-2.5 rounded-xl bg-zinc-100 text-zinc-600 text-[11px] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>
                  Tracking details will be assigned once dispatched by our logistics partner. No shipment tracking has been registered yet.
                </span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">
              Purchased Items ({order.lineItems?.length || 0})
            </span>
            <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
              {order.lineItems?.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center gap-3">
                  {item.variant?.image?.url ? (
                    <img
                      src={item.variant.image.url}
                      alt={item.title}
                      className="w-14 h-16 object-cover rounded-xl border border-zinc-200 shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-14 h-16 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0 text-zinc-400">
                      <Package className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-zinc-900 line-clamp-1">{item.title}</h3>
                    {item.variant?.title && item.variant.title !== 'Default Title' && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                        Variant: {item.variant.title}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-zinc-500">Qty: {item.quantity}</span>
                      <span className="font-heading font-extrabold text-zinc-950">
                        {item.originalTotalPrice
                          ? `₹${Math.round(parseFloat(item.originalTotalPrice.amount))}`
                          : item.variant?.price
                          ? `₹${Math.round(parseFloat(item.variant.price.amount) * item.quantity)}`
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-1">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-zinc-700" />
                <span>Shipping Address</span>
              </span>
              <p className="font-semibold text-zinc-800 mt-0.5">
                {order.shippingAddress.name ||
                  `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
              </p>
              <p className="text-zinc-600">{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p className="text-zinc-600">{order.shippingAddress.address2}</p>
              )}
              <p className="text-zinc-500">
                {order.shippingAddress.city}
                {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''} -{' '}
                {order.shippingAddress.zip}
              </p>
              {order.shippingAddress.phone && (
                <p className="text-zinc-400 mt-0.5">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          )}

          {/* Pricing Summary */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col gap-1.5">
            <span className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">
              Payment Breakdown
            </span>
            {order.subtotalPrice && (
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>₹{Math.round(parseFloat(order.subtotalPrice.amount))}</span>
              </div>
            )}
            {order.totalShippingPrice && (
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>
                  {parseFloat(order.totalShippingPrice.amount) === 0
                    ? 'FREE'
                    : `₹${Math.round(parseFloat(order.totalShippingPrice.amount))}`}
                </span>
              </div>
            )}
            {order.totalTax && parseFloat(order.totalTax.amount) > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>GST Tax (Included)</span>
                <span>₹{Math.round(parseFloat(order.totalTax.amount))}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-1.5 border-t border-zinc-200">
              <span>Total Paid</span>
              <span>
                {order.totalPrice
                  ? `₹${Math.round(parseFloat(order.totalPrice.amount))}`
                  : `₹${order.totalAmount}`}
              </span>
            </div>
          </div>

          {/* Shopify Order Status URL */}
          {order.statusUrl && (
            <a
              href={order.statusUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl border border-zinc-300 text-zinc-800 font-bold hover:bg-zinc-100 transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <span>View Official Shopify Order Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
