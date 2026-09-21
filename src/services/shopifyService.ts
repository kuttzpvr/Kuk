import {
  AdminConfig,
  CartItem,
  Order,
  PaymentMethod,
  Product,
  ShippingAddress,
  ShopifyCart,
  ShopifyCollection,
  ShopifyConnectionStatus,
  ShopifyCustomer,
  ShopifyCustomerAddress,
  ShopifyCustomerOrder,
} from '../types';
import { DEFAULT_ADMIN_CONFIG } from '../data/mockCatalog';

const CACHE_KEY_PRODUCTS = 'kukapi_live_products';
const CACHE_KEY_CONFIG = 'kukapi_cached_config';
const CACHE_KEY_CART_ID = 'kukapi_shopify_cart_id';
const CACHE_KEY_CUSTOMER_TOKEN = 'kukapi_customer_access_token';

export const shopifyService = {
  getStoredCustomerToken(): string | null {
    try {
      return localStorage.getItem(CACHE_KEY_CUSTOMER_TOKEN);
    } catch (e) {
      return null;
    }
  },

  setStoredCustomerToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(CACHE_KEY_CUSTOMER_TOKEN, token);
      } else {
        localStorage.removeItem(CACHE_KEY_CUSTOMER_TOKEN);
      }
    } catch (e) {}
  },

  getStoredCartId(): string | null {
    try {
      return localStorage.getItem(CACHE_KEY_CART_ID);
    } catch (e) {
      return null;
    }
  },

  setStoredCartId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(CACHE_KEY_CART_ID, id);
      } else {
        localStorage.removeItem(CACHE_KEY_CART_ID);
      }
    } catch (e) {}
  },

  async createCart(
    lines: Array<{ merchandiseId: string; quantity: number }>,
    discountCodes?: string[]
  ): Promise<ShopifyCart> {
    const res = await fetch('/api/shopify/cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, discountCodes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create Shopify cart');
    }
    this.setStoredCartId(data.cart.id);
    return data.cart;
  },

  async getCart(cartId: string): Promise<ShopifyCart | null> {
    try {
      const res = await fetch(`/api/shopify/cart/${encodeURIComponent(cartId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data.cart : null;
    } catch (e) {
      return null;
    }
  },

  async addCartLines(
    cartId: string,
    lines: Array<{ merchandiseId: string; quantity: number }>
  ): Promise<ShopifyCart> {
    const res = await fetch('/api/shopify/cart/lines/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, lines }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add lines to Shopify cart');
    }
    return data.cart;
  },

  async updateCartLines(
    cartId: string,
    lines: Array<{ id: string; quantity: number }>
  ): Promise<ShopifyCart> {
    const res = await fetch('/api/shopify/cart/lines/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, lines }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update Shopify cart lines');
    }
    return data.cart;
  },

  async removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
    const res = await fetch('/api/shopify/cart/lines/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, lineIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to remove lines from Shopify cart');
    }
    return data.cart;
  },
  async getStatus(): Promise<ShopifyConnectionStatus> {
    const res = await fetch('/api/shopify/status');
    const data = await res.json();
    return data;
  },

  async getCollections(): Promise<ShopifyCollection[]> {
    const res = await fetch('/api/shopify/collections');
    if (!res.ok) {
      throw new Error(`Failed to fetch collections (${res.status})`);
    }
    const data = await res.json();
    return data.collections || [];
  },

  async getProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
    tag?: string;
    refresh?: boolean;
  }): Promise<{ products: Product[]; error?: string; fixInstructions?: string }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.refresh) query.set('refresh', 'true');

    const res = await fetch(`/api/shopify/products?${query.toString()}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const errorMsg = data.error || `Failed to fetch products from Shopify (HTTP ${res.status})`;
      return {
        products: [],
        error: errorMsg,
        fixInstructions: data.fixInstructions,
      };
    }

    if (data.products && Array.isArray(data.products)) {
      try {
        localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(data.products));
      } catch (e) {
        // Ignore quota error
      }
      return { products: data.products };
    }

    return { products: [] };
  },

  async getProduct(handle: string): Promise<Product | null> {
    const res = await fetch(`/api/shopify/product/${handle}`);
    if (res.ok) {
      const data = await res.json();
      return data.product || null;
    }
    return null;
  },

  async getAdminConfig(): Promise<AdminConfig> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          localStorage.setItem(CACHE_KEY_CONFIG, JSON.stringify(data.config));
          return data.config;
        }
      }
    } catch (err) {
      console.warn('Error fetching config, reading fallback:', err);
    }
    try {
      const cached = localStorage.getItem(CACHE_KEY_CONFIG);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return DEFAULT_ADMIN_CONFIG;
  },

  async updateAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig> {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update admin config');
    const data = await res.json();
    return data.config;
  },

  async createShopifyCheckout(items: CartItem[], discountCode?: string): Promise<string> {
    const res = await fetch('/api/shopify/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, discountCode }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate checkout link');
    return data.checkoutUrl;
  },

  async createOrder(payload: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    discountCode?: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Order creation failed');
    return data.order;
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch (e) {}
    return null;
  },

  async askAiAssistant(
    prompt: string,
    conversationHistory: any[],
    context?: any
  ): Promise<{
    text: string;
    reply?: string;
    recommendedProducts?: Product[];
    suggestedProductIds?: string[];
    suggestedSize?: string;
    hasDisclaimer: boolean;
  }> {
    const res = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, conversationHistory, context }),
    });
    const data = await res.json();
    return data;
  },

  // ----------------------------------------------------
  // Customer Authentication & Profile API
  // ----------------------------------------------------
  async loginCustomer(email: string, password: string): Promise<{ accessToken: string; expiresAt: string }> {
    const res = await fetch('/api/shopify/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }
    this.setStoredCustomerToken(data.accessToken);
    return { accessToken: data.accessToken, expiresAt: data.expiresAt };
  },

  async registerCustomer(payload: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ customer?: any; accessToken?: string; requiresVerification?: boolean; message?: string }> {
    const res = await fetch('/api/shopify/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed.');
    }
    if (data.accessToken) {
      this.setStoredCustomerToken(data.accessToken);
    }
    return data;
  },

  async recoverPassword(email: string): Promise<string> {
    const res = await fetch('/api/shopify/customer/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Password recovery failed.');
    }
    return data.message || 'Password reset link sent to your email.';
  },

  async getCustomerProfile(token?: string): Promise<ShopifyCustomer | null> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) return null;
    try {
      const res = await fetch('/api/shopify/customer/profile', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          this.setStoredCustomerToken(null);
        }
        return null;
      }
      const data = await res.json();
      return data.customer || null;
    } catch (e) {
      return null;
    }
  },

  async addCustomerAddress(
    address: Partial<ShopifyCustomerAddress>,
    token?: string
  ): Promise<ShopifyCustomerAddress> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) throw new Error('You must be signed in to save addresses.');
    const res = await fetch('/api/shopify/customer/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ address, token: activeToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save address.');
    }
    return data.address;
  },

  async setDefaultAddress(addressId: string, token?: string): Promise<boolean> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) throw new Error('You must be signed in.');
    const res = await fetch('/api/shopify/customer/address/default', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ addressId, token: activeToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update default address.');
    }
    return true;
  },

  async deleteCustomerAddress(addressId: string, token?: string): Promise<boolean> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) throw new Error('You must be signed in.');
    const res = await fetch(`/api/shopify/customer/address/${encodeURIComponent(addressId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete address.');
    }
    return true;
  },

  async updateCustomerAddress(
    addressId: string,
    address: Partial<ShopifyCustomerAddress>,
    token?: string
  ): Promise<ShopifyCustomerAddress> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) throw new Error('You must be signed in to edit addresses.');
    const res = await fetch(`/api/shopify/customer/address/${encodeURIComponent(addressId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({ address, token: activeToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update address.');
    }
    return data.address;
  },

  async getCustomerWishlist(token?: string): Promise<string[]> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) return [];
    try {
      const res = await fetch('/api/customer/wishlist', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.wishlist || [];
    } catch (e) {
      return [];
    }
  },

  async saveCustomerWishlist(productIds: string[], token?: string): Promise<string[]> {
    const activeToken = token || this.getStoredCustomerToken();
    if (!activeToken) return productIds;
    try {
      const res = await fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ productIds }),
      });
      if (!res.ok) return productIds;
      const data = await res.json();
      return data.wishlist || productIds;
    } catch (e) {
      return productIds;
    }
  },

  async logoutCustomer(token?: string): Promise<void> {
    const activeToken = token || this.getStoredCustomerToken();
    if (activeToken) {
      try {
        await fetch('/api/shopify/customer/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ token: activeToken }),
        });
      } catch (e) {}
    }
    this.setStoredCustomerToken(null);
  },

  async searchLiveProducts(query: string): Promise<Product[]> {
    const res = await fetch(`/api/shopify/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  },
};
