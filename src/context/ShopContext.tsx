import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  AdminConfig,
  CartItem,
  NotificationItem,
  Order,
  Product,
  ProductFilters,
  ProductVariant,
  ShippingAddress,
  ShopifyCart,
  ShopifyCollection,
  ShopifyConnectionStatus,
  ShopifyCustomer,
  ShopifyCustomerAddress,
  ShopifyCustomerOrder,
  UserProfile,
} from '../types';
import { shopifyService } from '../services/shopifyService';
import { DEFAULT_ADMIN_CONFIG } from '../data/mockCatalog';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ShopContextType {
  products: Product[];
  isLoadingProducts: boolean;
  shopifyError: string | null;
  shopifyFixInstructions?: string;
  collections: ShopifyCollection[];
  connectionStatus: ShopifyConnectionStatus | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentScreen: 'main' | 'product_detail' | 'checkout' | 'order_tracking' | 'notifications' | 'order_details';
  setCurrentScreen: (screen: 'main' | 'product_detail' | 'checkout' | 'order_tracking' | 'notifications' | 'order_details') => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  cart: CartItem[];
  shopifyCart: ShopifyCart | null;
  isSyncingCart: boolean;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void> | void;
  removeFromCart: (cartItemId: string) => Promise<void> | void;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void> | void;
  clearCart: () => void;
  buyNow: (product: Product, variant: ProductVariant, quantity?: number) => Promise<string>;
  generateShopifyCheckoutUrl: (discountCode?: string) => Promise<string>;
  cartCount: number;
  cartSubtotal: number;
  appliedPromo: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  promoDiscount: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveWishlistItemToCart: (product: Product, variant?: ProductVariant) => Promise<void>;

  recentlyViewed: Product[];
  adminConfig: AdminConfig;
  updateAdminConfig: (updates: Partial<AdminConfig>) => Promise<void>;

  // Customer Account (Real Shopify Storefront Auth)
  customer: ShopifyCustomer | null;
  isCustomerLoading: boolean;
  customerError: string | null;
  clearCustomerError: () => void;
  loginCustomer: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (payload: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string }>;
  recoverCustomerPassword: (email: string) => Promise<string>;
  logoutCustomer: () => Promise<void>;
  refreshCustomerProfile: () => Promise<void>;
  addCustomerAddress: (address: Partial<ShopifyCustomerAddress>) => Promise<boolean>;
  updateCustomerAddress: (addressId: string, address: Partial<ShopifyCustomerAddress>) => Promise<boolean>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
  deleteCustomerAddress: (addressId: string) => Promise<boolean>;

  // Customer Orders
  customerOrders: ShopifyCustomerOrder[];
  selectedCustomerOrder: ShopifyCustomerOrder | null;
  setSelectedCustomerOrder: (order: ShopifyCustomerOrder | null) => void;

  // Legacy user compatibility
  user: UserProfile | null;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  saveAddress: (address: ShippingAddress) => void;

  // Legacy orders
  orders: Order[];
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  createOrder: (payload: any) => Promise<Order>;
  trackOrderById: (orderId: string) => Promise<boolean>;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Product[];
  isSearching: boolean;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  executeSearch: (query: string) => Promise<Product[]>;

  // Collections & Filters
  selectedCollectionHandle: string;
  setSelectedCollectionHandle: (handle: string) => void;
  filters: ProductFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>;
  resetFilters: () => void;
  filteredProducts: Product[];

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isFlutterModalOpen: boolean;
  setIsFlutterModalOpen: (open: boolean) => void;
  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
  viewMode: 'mobile' | 'responsive';
  toggleViewMode: () => void;
  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  isOffline: boolean;
  refreshCatalog: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('kukapi_live_products');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [shopifyError, setShopifyError] = useState<string | null>(null);
  const [shopifyFixInstructions, setShopifyFixInstructions] = useState<string | undefined>(undefined);
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ShopifyConnectionStatus | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentScreen, setCurrentScreen] = useState<
    'main' | 'product_detail' | 'checkout' | 'order_tracking' | 'notifications' | 'order_details'
  >('main');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const [isSyncingCart, setIsSyncingCart] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kukapi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kukapi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kukapi_recent_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_ADMIN_CONFIG);
  const [appliedPromo, setAppliedPromo] = useState<string>('KUKAPI10');
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('kukapi_user');
      return saved
        ? JSON.parse(saved)
        : {
            id: 'usr_guest_1',
            name: 'Aarav Singhania',
            email: 'aarav.fashion@example.com',
            phone: '+91 98200 12345',
            savedAddresses: [
              {
                name: 'Aarav Singhania',
                email: 'aarav.fashion@example.com',
                phone: '+91 98200 12345',
                addressLine1: 'B-702, Oberoi Sky City, Borivali East',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400066',
                isDefault: true,
              },
            ],
          };
    } catch (e) {
      return null;
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kukapi_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: '🎉 Welcome to KUKAPI',
      message: 'Enjoy 10% off your first luxury street fit with code KUKAPI10',
      type: 'sale',
      timestamp: '10m ago',
      read: false,
    },
    {
      id: 'notif_2',
      title: '✨ 240 GSM Restock Alert',
      message: 'Unisex Oversized Classic T-Shirt in Sage Green is back in all sizes!',
      type: 'product',
      timestamp: '2h ago',
      read: false,
    },
  ]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Customer State (Shopify Storefront Customer Account)
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState<boolean>(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState<ShopifyCustomerOrder | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kukapi_recent_searches');
      return saved ? JSON.parse(saved) : ['Oversized', 'Acid wash', 'Men', 'Terry Cotton'];
    } catch (e) {
      return ['Oversized', 'Acid wash', 'Men', 'Terry Cotton'];
    }
  });

  // Collections & Filter State
  const [selectedCollectionHandle, setSelectedCollectionHandle] = useState<string>('all');
  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: [0, 5000],
    sizes: [],
    colors: [],
    inStockOnly: false,
    collectionHandle: 'all',
    sortBy: 'featured',
  });

  function cartItemsFromShopify(sCart: ShopifyCart | null, allProducts: Product[]): CartItem[] {
    if (!sCart || !sCart.lines) return [];
    return sCart.lines.map((line) => {
      const matchedProduct = allProducts.find(
        (p) => p.id === line.merchandise.product.id || p.handle === line.merchandise.product.handle
      );

      const priceNum = parseFloat(line.merchandise.price.amount) || 0;
      const sizeOpt =
        line.merchandise.selectedOptions.find((o) => o.name.toLowerCase() === 'size')?.value ||
        line.merchandise.title.split('/')[1]?.trim() ||
        line.merchandise.title;
      const colorOpt =
        line.merchandise.selectedOptions.find((o) => o.name.toLowerCase() === 'color')?.value ||
        line.merchandise.title.split('/')[0]?.trim() ||
        '';

      const variant: ProductVariant = {
        id: line.merchandise.id,
        title: line.merchandise.title,
        size: sizeOpt,
        color: colorOpt,
        colorHex: '#111111',
        price: priceNum,
        compareAtPrice: priceNum,
        inStock: true,
        sku: (line.merchandise as any).sku || '',
        image: line.merchandise.image?.url,
      };

      const product: Product = matchedProduct || {
        id: line.merchandise.product.id,
        handle: line.merchandise.product.handle,
        title: line.merchandise.product.title,
        description: `${line.merchandise.product.title} - Official KUKAPI apparel`,
        price: priceNum,
        compareAtPrice: priceNum,
        currency: line.merchandise.price.currencyCode || 'INR',
        discountPercent: 0,
        category: 'streetwear',
        tags: [],
        featuredImage: line.merchandise.image?.url || '',
        images: line.merchandise.image?.url ? [line.merchandise.image.url] : [],
        variants: [variant],
        availableForSale: true,
        rating: 4.8,
        reviewCount: 24,
        fabric: '100% Super Combed Cotton',
        fit: 'Oversized Fit',
        care: 'Machine wash cold',
        shopifyUrl: `https://kukapi.myshopify.com/products/${line.merchandise.product.handle}`,
      };

      return {
        id: line.id,
        productId: line.merchandise.product.id,
        variantId: line.merchandise.id,
        product,
        selectedVariant: variant,
        quantity: line.quantity,
        shopifyLineId: line.id,
      };
    });
  }

  // Restore live Shopify cart on startup
  useEffect(() => {
    const restoreCart = async () => {
      const storedId = shopifyService.getStoredCartId();
      if (storedId) {
        setIsSyncingCart(true);
        try {
          const liveCart = await shopifyService.getCart(storedId);
          if (liveCart && liveCart.lines.length > 0) {
            setShopifyCart(liveCart);
            setCart(cartItemsFromShopify(liveCart, products));
          } else {
            shopifyService.setStoredCartId(null);
          }
        } catch (err) {
          console.warn('Could not restore live Shopify cart:', err);
        } finally {
          setIsSyncingCart(false);
        }
      }
    };
    restoreCart();
  }, []);

  // Synchronize cart state whenever shopifyCart changes
  useEffect(() => {
    if (shopifyCart) {
      setCart(cartItemsFromShopify(shopifyCart, products));
    }
  }, [shopifyCart, products]);

  // Sync online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online! Catalog synchronized.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('No internet connection. Operating in offline cached mode.', 'info');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kukapi_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Save Wishlist (local storage for guest, remote sync for customer)
  useEffect(() => {
    try {
      localStorage.setItem('kukapi_wishlist', JSON.stringify(wishlist));
      const token = shopifyService.getStoredCustomerToken();
      if (token) {
        shopifyService.saveCustomerWishlist(wishlist, token).catch(() => {});
      }
    } catch (e) {}
  }, [wishlist]);

  // Save Orders
  useEffect(() => {
    try {
      localStorage.setItem('kukapi_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  // Save User
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('kukapi_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('kukapi_user');
      }
    } catch (e) {}
  }, [user]);

  const syncUserProfileFromCustomer = (cust: ShopifyCustomer) => {
    setUser({
      id: cust.id,
      name: cust.displayName || `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'KUKAPI Customer',
      email: cust.email,
      phone: cust.phone || '',
      savedAddresses: (cust.addresses || []).map((a) => ({
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || cust.displayName,
        email: cust.email,
        phone: a.phone || cust.phone || '',
        addressLine1: a.address1,
        addressLine2: a.address2,
        city: a.city,
        state: a.province || '',
        pincode: a.zip,
        isDefault: a.isDefault,
      })),
    });
  };

  // Restore customer session on startup if access token exists
  useEffect(() => {
    const loadCustomer = async () => {
      const token = shopifyService.getStoredCustomerToken();
      if (!token) {
        setIsCustomerLoading(false);
        return;
      }
      setIsCustomerLoading(true);
      try {
        const prof = await shopifyService.getCustomerProfile(token);
        if (prof) {
          setCustomer(prof);
          syncUserProfileFromCustomer(prof);
        } else {
          shopifyService.setStoredCustomerToken(null);
        }
      } catch (err) {
        console.warn('Could not restore Shopify customer:', err);
      } finally {
        setIsCustomerLoading(false);
      }
    };
    loadCustomer();
  }, []);

  // Initial data load
  const refreshCatalog = async () => {
    setIsLoadingProducts(true);
    try {
      const [prodRes, collectionsRes, statusRes, configRes] = await Promise.allSettled([
        shopifyService.getProducts({ refresh: true }),
        shopifyService.getCollections(),
        shopifyService.getStatus(),
        shopifyService.getAdminConfig(),
      ]);

      if (prodRes.status === 'fulfilled') {
        if (prodRes.value.error) {
          setShopifyError(prodRes.value.error);
          setShopifyFixInstructions(prodRes.value.fixInstructions);
        } else {
          setProducts(prodRes.value.products);
          setShopifyError(null);
          setShopifyFixInstructions(undefined);
        }
      } else {
        setShopifyError(prodRes.reason?.message || 'Failed to connect to Shopify');
      }

      if (collectionsRes.status === 'fulfilled') {
        setCollections(collectionsRes.value);
      }

      if (statusRes.status === 'fulfilled') {
        setConnectionStatus(statusRes.value);
      }

      if (configRes.status === 'fulfilled') {
        setAdminConfig(configRes.value);
      }
    } catch (err: any) {
      console.error('Catalog load error:', err);
      setShopifyError(err.message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen('product_detail');
    // Add to recently viewed without duplicates
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('kukapi_recent_viewed', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const closeProductDetail = () => {
    setCurrentScreen('main');
  };

  const addToCart = async (product: Product, variant: ProductVariant, quantity = 1) => {
    setIsSyncingCart(true);
    try {
      let updatedCart: ShopifyCart;
      const variantGid = variant.id.startsWith('gid://shopify/ProductVariant/')
        ? variant.id
        : `gid://shopify/ProductVariant/${variant.id}`;

      if (shopifyCart && shopifyCart.id) {
        updatedCart = await shopifyService.addCartLines(shopifyCart.id, [
          { merchandiseId: variantGid, quantity },
        ]);
      } else {
        const storedId = shopifyService.getStoredCartId();
        if (storedId) {
          try {
            updatedCart = await shopifyService.addCartLines(storedId, [
              { merchandiseId: variantGid, quantity },
            ]);
          } catch (e) {
            updatedCart = await shopifyService.createCart([
              { merchandiseId: variantGid, quantity },
            ]);
          }
        } else {
          updatedCart = await shopifyService.createCart([
            { merchandiseId: variantGid, quantity },
          ]);
        }
      }

      setShopifyCart(updatedCart);
      shopifyService.setStoredCartId(updatedCart.id);
      showToast(`Added ${product.title} (${variant.size}) to Shopify Bag`, 'success');
    } catch (err: any) {
      console.error('Error adding to Shopify cart:', err);
      showToast(err.message || 'Failed to update Shopify bag', 'error');
    } finally {
      setIsSyncingCart(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const targetCartId = shopifyCart?.id || shopifyService.getStoredCartId();
    if (!targetCartId) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('Item removed from cart', 'info');
      return;
    }
    setIsSyncingCart(true);
    try {
      const updatedCart = await shopifyService.removeCartLines(targetCartId, [cartItemId]);
      setShopifyCart(updatedCart);
      showToast('Item removed from Shopify Bag', 'info');
    } catch (err: any) {
      console.error('Error removing from Shopify cart:', err);
      showToast(err.message || 'Failed to remove item', 'error');
    } finally {
      setIsSyncingCart(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    const targetCartId = shopifyCart?.id || shopifyService.getStoredCartId();
    if (!targetCartId) return;

    setIsSyncingCart(true);
    try {
      const updatedCart = await shopifyService.updateCartLines(targetCartId, [
        { id: cartItemId, quantity },
      ]);
      setShopifyCart(updatedCart);
      showToast('Bag quantity updated in Shopify', 'info');
    } catch (err: any) {
      console.error('Error updating Shopify cart quantity:', err);
      showToast(err.message || 'Failed to update quantity', 'error');
    } finally {
      setIsSyncingCart(false);
    }
  };

  const clearCart = () => {
    shopifyService.setStoredCartId(null);
    setShopifyCart(null);
    setCart([]);
  };

  const buyNow = async (
    product: Product,
    variant: ProductVariant,
    quantity = 1
  ): Promise<string> => {
    setIsSyncingCart(true);
    try {
      const variantGid = variant.id.startsWith('gid://shopify/ProductVariant/')
        ? variant.id
        : `gid://shopify/ProductVariant/${variant.id}`;

      const checkoutCart = await shopifyService.createCart([
        { merchandiseId: variantGid, quantity },
      ]);
      setShopifyCart(checkoutCart);
      shopifyService.setStoredCartId(checkoutCart.id);
      return checkoutCart.checkoutUrl;
    } catch (err: any) {
      console.error('Buy Now checkout error:', err);
      showToast(err.message || 'Failed to initialize Shopify checkout', 'error');
      throw err;
    } finally {
      setIsSyncingCart(false);
    }
  };

  const generateShopifyCheckoutUrl = async (discountCode?: string): Promise<string> => {
    if (shopifyCart?.checkoutUrl) {
      let url = shopifyCart.checkoutUrl;
      if (discountCode) {
        url += (url.includes('?') ? '&' : '?') + `discount=${encodeURIComponent(discountCode)}`;
      }
      return url;
    }
    const items = cart;
    return await shopifyService.createShopifyCheckout(items, discountCode);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isAlready = prev.includes(productId);
      if (isAlready) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to Wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast('Removed from Wishlist', 'info');
  };

  const moveWishlistItemToCart = async (product: Product, variant?: ProductVariant) => {
    const chosenVariant = variant || product.variants[0];
    if (!chosenVariant) return;
    await addToCart(product, chosenVariant, 1);
    removeFromWishlist(product.id);
  };

  const cartCount = shopifyCart
    ? shopifyCart.totalQuantity
    : cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = shopifyCart
    ? Math.round(parseFloat(shopifyCart.cost.subtotalAmount.amount) || 0)
    : cart.reduce((sum, item) => sum + item.selectedVariant.price * item.quantity, 0);

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const promo = adminConfig.promoCodes.find((p) => p.code === clean);
    if (!promo) {
      return { success: false, message: 'Invalid promo coupon code.' };
    }
    if (cartSubtotal < promo.minCart) {
      return {
        success: false,
        message: `Min order value for ${promo.code} is ₹${promo.minCart}. Add ₹${
          promo.minCart - cartSubtotal
        } more!`,
      };
    }
    setAppliedPromo(promo.code);
    return { success: true, message: `Applied! You get ${promo.discountPercent}% OFF.` };
  };

  const removePromoCode = () => {
    setAppliedPromo('');
  };

  const promoDiscount = React.useMemo(() => {
    if (!appliedPromo) return 0;
    const promo = adminConfig.promoCodes.find((p) => p.code === appliedPromo);
    if (!promo || cartSubtotal < promo.minCart) return 0;
    return Math.round((cartSubtotal * promo.discountPercent) / 100);
  }, [appliedPromo, adminConfig.promoCodes, cartSubtotal]);

  const updateAdminConfig = async (updates: Partial<AdminConfig>) => {
    try {
      const updated = await shopifyService.updateAdminConfig(updates);
      setAdminConfig(updated);
      showToast('Admin store configurations updated', 'success');
    } catch (err: any) {
      showToast('Failed to update config', 'error');
    }
  };

  // -----------------------------------------------------------------
  // Customer Authentication & Management (Shopify Storefront API)
  // -----------------------------------------------------------------
  const refreshCustomerProfile = async () => {
    const token = shopifyService.getStoredCustomerToken();
    if (!token) return;
    try {
      const prof = await shopifyService.getCustomerProfile(token);
      if (prof) {
        setCustomer(prof);
        syncUserProfileFromCustomer(prof);
        try {
          const remoteW = await shopifyService.getCustomerWishlist(token);
          if (remoteW && remoteW.length > 0) {
            setWishlist((prev) => Array.from(new Set([...prev, ...remoteW])));
          }
        } catch (e) {}
      }
    } catch (e) {}
  };

  const loginCustomer = async (email: string, password: string): Promise<boolean> => {
    setIsCustomerLoading(true);
    setCustomerError(null);
    try {
      const { accessToken } = await shopifyService.loginCustomer(email, password);
      const prof = await shopifyService.getCustomerProfile(accessToken);
      if (prof) {
        setCustomer(prof);
        syncUserProfileFromCustomer(prof);
        try {
          const remoteW = await shopifyService.getCustomerWishlist(accessToken);
          if (remoteW && remoteW.length > 0) {
            setWishlist((prev) => Array.from(new Set([...prev, ...remoteW])));
          }
        } catch (e) {}
        showToast(`Welcome back, ${prof.firstName || prof.displayName || 'Collector'}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      setCustomerError(err.message || 'Login failed');
      showToast(err.message || 'Login failed', 'error');
      return false;
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const registerCustomer = async (payload: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    setIsCustomerLoading(true);
    setCustomerError(null);
    try {
      const result = await shopifyService.registerCustomer(payload);
      if (result.accessToken) {
        const prof = await shopifyService.getCustomerProfile(result.accessToken);
        if (prof) {
          setCustomer(prof);
          syncUserProfileFromCustomer(prof);
          try {
            const remoteW = await shopifyService.getCustomerWishlist(result.accessToken);
            if (remoteW && remoteW.length > 0) {
              setWishlist((prev) => Array.from(new Set([...prev, ...remoteW])));
            }
          } catch (e) {}
        }
      }

      if (result.requiresVerification) {
        showToast(
          result.message || 'Verification email sent! Please check your inbox.',
          'info'
        );
        return {
          success: true,
          requiresVerification: true,
          message: result.message || `We have sent an email to ${payload.email}, please click the link included to verify your email address.`,
        };
      }

      showToast('KUKAPI Account created successfully!', 'success');
      return { success: true, requiresVerification: false, message: 'Account created successfully!' };
    } catch (err: any) {
      setCustomerError(err.message || 'Registration failed');
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const recoverCustomerPassword = async (email: string): Promise<string> => {
    try {
      const msg = await shopifyService.recoverPassword(email);
      showToast(msg, 'success');
      return msg;
    } catch (err: any) {
      showToast(err.message || 'Recovery failed', 'error');
      throw err;
    }
  };

  const clearCustomerError = () => {
    setCustomerError(null);
  };

  const logoutCustomer = async (): Promise<void> => {
    await shopifyService.logoutCustomer();
    setCustomer(null);
    setUser(null);
    setSelectedCustomerOrder(null);
    showToast('Signed out of KUKAPI account', 'info');
  };

  const addCustomerAddress = async (addr: Partial<ShopifyCustomerAddress>): Promise<boolean> => {
    try {
      await shopifyService.addCustomerAddress(addr);
      await refreshCustomerProfile();
      showToast('New delivery address saved', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
      return false;
    }
  };

  const updateCustomerAddress = async (
    addressId: string,
    addr: Partial<ShopifyCustomerAddress>
  ): Promise<boolean> => {
    try {
      await shopifyService.updateCustomerAddress(addressId, addr);
      await refreshCustomerProfile();
      showToast('Delivery address updated', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update address', 'error');
      return false;
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    try {
      await shopifyService.setDefaultAddress(addressId);
      await refreshCustomerProfile();
      showToast('Default address updated', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to update default address', 'error');
      return false;
    }
  };

  const deleteCustomerAddress = async (addressId: string): Promise<boolean> => {
    try {
      await shopifyService.deleteCustomerAddress(addressId);
      await refreshCustomerProfile();
      showToast('Address deleted', 'info');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete address', 'error');
      return false;
    }
  };

  const customerOrders: ShopifyCustomerOrder[] = useMemo(() => {
    return customer?.orders || [];
  }, [customer]);

  // -----------------------------------------------------------------
  // Search Logic
  // -----------------------------------------------------------------
  const executeSearch = async (query: string): Promise<Product[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    setIsSearching(true);
    try {
      const results = await shopifyService.searchLiveProducts(query);
      setSearchResults(results);
      addRecentSearch(query.trim());
      return results;
    } catch (err) {
      const q = query.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
      setSearchResults(filtered);
      return filtered;
    } finally {
      setIsSearching(false);
    }
  };

  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('kukapi_recent_searches', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('kukapi_recent_searches');
    } catch (e) {}
  };

  // -----------------------------------------------------------------
  // Filter & Collection Engine
  // -----------------------------------------------------------------
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 5000],
      sizes: [],
      colors: [],
      inStockOnly: false,
      collectionHandle: 'all',
      sortBy: 'featured',
    });
    setSelectedCollectionHandle('all');
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filter by collection
    if (selectedCollectionHandle && selectedCollectionHandle !== 'all') {
      list = list.filter((p) => {
        const inCol = p.collections?.some(
          (c) => c.handle.toLowerCase() === selectedCollectionHandle.toLowerCase()
        );
        const handleMatch = p.category?.toLowerCase() === selectedCollectionHandle.toLowerCase();
        const tagMatch = p.tags?.some(
          (t) => t.toLowerCase() === selectedCollectionHandle.toLowerCase()
        );
        const titleMatch = p.title.toLowerCase().includes(selectedCollectionHandle.toLowerCase());
        return inCol || handleMatch || tagMatch || titleMatch;
      });
    }

    // Filter by price range
    if (filters.priceRange && filters.priceRange.length === 2) {
      list = list.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    }

    // Filter by inStockOnly
    if (filters.inStockOnly) {
      list = list.filter((p) => p.availableForSale);
    }

    // Filter by sizes
    if (filters.sizes && filters.sizes.length > 0) {
      list = list.filter((p) =>
        p.variants.some((v) => filters.sizes.includes(v.size))
      );
    }

    // Filter by colors
    if (filters.colors && filters.colors.length > 0) {
      list = list.filter((p) =>
        p.variants.some((v) =>
          filters.colors.some((c) => v.color.toLowerCase().includes(c.toLowerCase()))
        )
      );
    }

    // Sorting
    if (filters.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, selectedCollectionHandle, filters]);

  const loginUser = (email: string, name = 'KUKAPI Shopper') => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: '+91 98765 43210',
      savedAddresses: [
        {
          name,
          email,
          phone: '+91 98765 43210',
          addressLine1: 'Flat 304, Emerald Heights, Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          isDefault: true,
        },
      ],
    };
    setUser(newUser);
    showToast(`Logged in as ${name}`, 'success');
  };

  const logoutUser = () => {
    setUser(null);
    showToast('Logged out of KUKAPI account', 'info');
  };

  const saveAddress = (address: ShippingAddress) => {
    if (!user) return;
    setUser({
      ...user,
      savedAddresses: [address, ...user.savedAddresses.filter((a) => a.addressLine1 !== address.addressLine1)],
    });
    showToast('Delivery address saved', 'success');
  };

  const createOrder = async (payload: any): Promise<Order> => {
    const newOrder = await shopifyService.createOrder({
      ...payload,
      discountCode: appliedPromo,
    });
    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();
    // Add confirmation notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `📦 Order ${newOrder.orderNumber} Confirmed!`,
        message: `Your package is being prepared. Tracking code: ${newOrder.trackingNumber}`,
        type: 'order',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
    return newOrder;
  };

  const trackOrderById = async (orderId: string): Promise<boolean> => {
    const local = orders.find((o) => o.orderNumber.toUpperCase() === orderId.toUpperCase() || o.id === orderId);
    if (local) {
      setCurrentOrder(local);
      setCurrentScreen('order_tracking');
      return true;
    }
    const remote = await shopifyService.getOrder(orderId);
    if (remote) {
      setCurrentOrder(remote);
      setCurrentScreen('order_tracking');
      return true;
    }
    return false;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'mobile' ? 'responsive' : 'mobile'));
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        shopifyError,
        shopifyFixInstructions,
        collections,
        connectionStatus,
        activeTab,
        setActiveTab,
        currentScreen,
        setCurrentScreen,
        selectedProduct,
        openProductDetail,
        closeProductDetail,
        cart,
        shopifyCart,
        isSyncingCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        generateShopifyCheckoutUrl,
        cartCount,
        cartSubtotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        promoDiscount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveWishlistItemToCart,
        recentlyViewed,
        adminConfig,
        updateAdminConfig,
        customer,
        isCustomerLoading,
        customerError,
        clearCustomerError,
        loginCustomer,
        registerCustomer,
        recoverCustomerPassword,
        logoutCustomer,
        refreshCustomerProfile,
        addCustomerAddress,
        updateCustomerAddress,
        setDefaultAddress,
        deleteCustomerAddress,
        customerOrders,
        selectedCustomerOrder,
        setSelectedCustomerOrder,
        user,
        loginUser,
        logoutUser,
        saveAddress,
        orders,
        currentOrder,
        setCurrentOrder,
        createOrder,
        trackOrderById,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        executeSearch,
        selectedCollectionHandle,
        setSelectedCollectionHandle,
        filters,
        setFilters,
        resetFilters,
        filteredProducts,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        isAiModalOpen,
        setIsAiModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isFlutterModalOpen,
        setIsFlutterModalOpen,
        isAndroidModalOpen,
        setIsAndroidModalOpen,
        viewMode,
        toggleViewMode,
        toasts,
        showToast,
        isOffline,
        refreshCatalog,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
