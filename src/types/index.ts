export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  compareAtPrice: number;
  inStock: boolean;
  sku: string;
  quantityAvailable?: number;
  image?: string;
  selectedOptions?: { name: string; value: string }[];
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
    };
    image?: {
      url: string;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: {
      name: string;
      value: string;
    }[];
  };
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: ShopifyCartLine[];
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: string;
  productCount: number;
  products?: Product[];
}

export interface ShopifyConnectionStatus {
  connected: boolean;
  storeName?: string;
  domain: string;
  productsCount?: number;
  collectionsCount?: number;
  responseTimeMs?: number;
  error?: string;
  fixInstructions?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  sizeBought?: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number;
  currency: string;
  discountPercent: number;
  category: string;
  tags: string[];
  featuredImage: string;
  images: string[];
  variants: ProductVariant[];
  availableForSale: boolean;
  totalInventory?: number;
  rating: number;
  reviewCount: number;
  fabric: string;
  gsm?: string;
  fit: string;
  care: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  shopifyUrl: string;
  options?: ProductOption[];
  collections?: { id: string; title: string; handle: string }[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  shopifyLineId?: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export type PaymentMethod = 'online' | 'cod' | 'partial_cod';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  totalAmount?: number;
  payableNow: number;
  remainingCod: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
}

export interface AdminConfig {
  codFee: number;
  codAdvance: number;
  minCodOrderValue: number;
  maxCodOrderValue: number;
  freeShippingThreshold: number;
  shippingFee: number;
  announcement: string;
  storeName: string;
  storefrontUrl: string;
  promoCodes: { code: string; discountPercent: number; minCart: number }[];
}

export interface ShopifyCustomerAddress {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface ShopifyCustomerOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
    };
  };
  originalTotalPrice?: {
    amount: string;
    currencyCode: string;
  };
}

export interface ShopifyCustomerOrder {
  id: string;
  orderNumber: string | number;
  name?: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalAmount?: number;
  subtotalPrice?: {
    amount: string;
    currencyCode: string;
  };
  totalShippingPrice?: {
    amount: string;
    currencyCode: string;
  };
  totalTax?: {
    amount: string;
    currencyCode: string;
  };
  currentTotalPrice?: {
    amount: string;
    currencyCode: string;
  };
  lineItems: ShopifyCustomerOrderLineItem[];
  shippingAddress?: ShopifyCustomerAddress;
  statusUrl?: string;
  successfulFulfillments?: {
    trackingCompany?: string;
    trackingInfo?: {
      number?: string;
      url?: string;
    }[];
  }[];
}

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  defaultAddress?: ShopifyCustomerAddress;
  addresses: ShopifyCustomerAddress[];
  orders: ShopifyCustomerOrder[];
}

export interface ProductFilters {
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  collectionHandle: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  savedAddresses: ShippingAddress[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'sale' | 'product' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  suggestedSize?: string;
  sizeAdviceDisclaimer?: boolean;
}

export type ActiveTab = 'home' | 'shop' | 'search' | 'wishlist' | 'account';
