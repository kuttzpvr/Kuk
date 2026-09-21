import React, { useState } from 'react';
import {
  Package,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ShopifyCustomerOrder } from '../../types';
import { OrderDetailsModal } from './OrderDetailsModal';

export const MyOrdersView: React.FC = () => {
  const { customer, customerOrders, orders, setActiveTab, setCurrentScreen, setCurrentOrder } = useShop();
  const [selectedOrder, setSelectedOrder] = useState<ShopifyCustomerOrder | null>(null);

  // Normalize local orders to ShopifyCustomerOrder format if customerOrders is empty
  const displayedOrders: ShopifyCustomerOrder[] =
    customerOrders.length > 0
      ? customerOrders
      : orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber.replace(/[^0-9]/g, '') || o.orderNumber,
          name: o.orderNumber,
          processedAt: o.date,
          financialStatus: (o.paymentStatus || (o.paymentMethod === 'online' ? 'paid' : 'pending')) === 'paid' ? 'PAID' : 'PENDING',
          fulfillmentStatus: o.status === 'delivered' ? 'FULFILLED' : 'IN_TRANSIT',
          totalPrice: {
            amount: (o.total || o.totalAmount || 0).toString(),
            currencyCode: 'INR',
          },
          totalAmount: o.total || o.totalAmount || 0,
          lineItems: o.items.map((item) => ({
            title: item.product.title,
            quantity: item.quantity,
            variant: {
              id: item.variantId,
              title: item.selectedVariant?.size ? `Size: ${item.selectedVariant.size}` : '',
              price: {
                amount: (item.selectedVariant?.price || item.product.price).toString(),
                currencyCode: 'INR',
              },
              image: item.product.featuredImage ? { url: item.product.featuredImage } : undefined,
            },
            originalTotalPrice: {
              amount: ((item.selectedVariant?.price || item.product.price) * item.quantity).toString(),
              currencyCode: 'INR',
            },
          })),
          shippingAddress: o.shippingAddress
            ? {
                id: 'addr_' + o.id,
                name: o.shippingAddress.name,
                address1: o.shippingAddress.addressLine1,
                address2: o.shippingAddress.addressLine2,
                city: o.shippingAddress.city,
                province: o.shippingAddress.state,
                zip: o.shippingAddress.pincode,
                phone: o.shippingAddress.phone,
              }
            : undefined,
        }));

  if (displayedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-white rounded-3xl border border-zinc-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="font-heading font-extrabold text-base text-zinc-950">
          No Orders Yet
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
          {customer
            ? "You haven't placed any orders with this Shopify account yet."
            : 'Sign in to sync your verified Shopify order history, or explore our latest streetwear drops.'}
        </p>
        <button
          onClick={() => {
            setActiveTab('shop');
            setCurrentScreen('main');
          }}
          className="mt-4 px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-zinc-700" />
          <span>All Orders ({displayedOrders.length})</span>
        </span>
        <span className="text-[11px] text-zinc-500">Live Shopify History</span>
      </div>

      <div className="flex flex-col gap-3">
        {displayedOrders.map((order) => {
          const dateStr = order.processedAt
            ? new Date(order.processedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Recent';

          const primaryItem = order.lineItems?.[0];
          const totalQty = order.lineItems?.reduce((s, i) => s + i.quantity, 0) || 1;
          const totalAmt = order.totalPrice
            ? Math.round(parseFloat(order.totalPrice.amount))
            : order.totalAmount || 0;

          const isPaid = order.financialStatus === 'PAID';
          const isFulfilled = order.fulfillmentStatus === 'FULFILLED';

          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="p-4 bg-white rounded-3xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all cursor-pointer flex flex-col gap-3 group active:scale-[0.99]"
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-xs text-zinc-950">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-[11px] text-zinc-400">· {dateStr}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.financialStatus || 'PAID'}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isFulfilled
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {order.fulfillmentStatus || 'UNFULFILLED'}
                  </span>
                </div>
              </div>

              {/* Order Thumbnail & Primary Item */}
              <div className="flex items-center gap-3">
                {primaryItem?.variant?.image?.url ? (
                  <img
                    src={primaryItem.variant.image.url}
                    alt={primaryItem.title}
                    className="w-14 h-16 object-cover rounded-2xl border border-zinc-200 bg-zinc-50 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-xs text-zinc-950 line-clamp-1 group-hover:text-zinc-700">
                    {primaryItem?.title || `Order #${order.orderNumber}`}
                  </h4>
                  {order.lineItems && order.lineItems.length > 1 && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      + {order.lineItems.length - 1} other item{order.lineItems.length > 2 ? 's' : ''}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {totalQty} item{totalQty > 1 ? 's' : ''}
                    </span>
                    <span className="font-heading font-extrabold text-sm text-zinc-950">
                      ₹{totalAmt}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
