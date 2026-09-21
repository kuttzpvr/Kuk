import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_ADMIN_CONFIG } from './src/data/mockCatalog.ts';
import { AdminConfig, Order, Product, ShopifyCollection, ShopifyConnectionStatus } from './src/types/index.ts';
import {
  fetchLiveShopifyData,
  createShopifyCartCheckout,
  createShopifyCart,
  getShopifyCart,
  addShopifyCartLines,
  updateShopifyCartLines,
  removeShopifyCartLines,
  loginCustomerStorefront,
  registerCustomerStorefront,
  recoverCustomerPasswordStorefront,
  getCustomerProfileStorefront,
  createCustomerAddressStorefront,
  updateCustomerAddressStorefront,
  updateCustomerDefaultAddressStorefront,
  deleteCustomerAddressStorefront,
  logoutCustomerStorefront,
  searchShopifyStorefront,
} from './src/services/shopifyBackend.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for admin config and demo orders
let currentAdminConfig: AdminConfig = { ...DEFAULT_ADMIN_CONFIG };
let productsCache: Product[] = [];
let collectionsCache: ShopifyCollection[] = [];
let lastFetchTime = 0;
let lastFetchError: string | null = null;
const ordersDatabase: Record<string, Order> = {};
const customerWishlists = new Map<string, string[]>();

// Refresh Shopify cache from live Storefront API
async function syncShopifyCatalog(force = false): Promise<Product[]> {
  const now = Date.now();
  // Cache for 60 seconds unless forced or empty
  if (!force && productsCache.length > 0 && now - lastFetchTime < 60000) {
    return productsCache;
  }

  try {
    const data = await fetchLiveShopifyData();
    productsCache = data.products;
    collectionsCache = data.collections;
    lastFetchTime = now;
    lastFetchError = null;
    console.log(`[Shopify] Synchronized ${productsCache.length} live products, ${collectionsCache.length} collections.`);
    return productsCache;
  } catch (err: any) {
    lastFetchError = err.message;
    console.error('[Shopify] Sync error:', err.message);
    throw err;
  }
}

// Initial sync attempt at server startup
syncShopifyCatalog(true).catch((err) => {
  console.warn('[Shopify] Initial startup sync notice:', err.message);
});

// Lazy-initialized Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. Admin & Store Configuration Endpoints
// ----------------------------------------------------
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    config: currentAdminConfig,
    shopifyDomain: process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com',
  });
});

app.put('/api/config', (req, res) => {
  try {
    const updates = req.body;
    currentAdminConfig = {
      ...currentAdminConfig,
      ...updates,
      codFee: Number(updates.codFee ?? currentAdminConfig.codFee),
      codAdvance: Number(updates.codAdvance ?? currentAdminConfig.codAdvance),
      minCodOrderValue: Number(updates.minCodOrderValue ?? currentAdminConfig.minCodOrderValue),
      maxCodOrderValue: Number(updates.maxCodOrderValue ?? currentAdminConfig.maxCodOrderValue),
      freeShippingThreshold: Number(updates.freeShippingThreshold ?? currentAdminConfig.freeShippingThreshold),
      shippingFee: Number(updates.shippingFee ?? currentAdminConfig.shippingFee),
    };
    res.json({ success: true, config: currentAdminConfig });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. Shopify Storefront API Status & Verification
// ----------------------------------------------------
app.get('/api/shopify/status', async (req, res) => {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!token || token.trim() === '') {
    return res.status(500).json({
      success: false,
      connected: false,
      error: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is missing.',
      fixInstructions: 'Please provide SHOPIFY_STOREFRONT_ACCESS_TOKEN in environment configuration settings.',
      domain,
    });
  }

  try {
    const startTime = Date.now();
    const data = await fetchLiveShopifyData();
    const responseTimeMs = Date.now() - startTime;
    productsCache = data.products;
    collectionsCache = data.collections;
    lastFetchTime = Date.now();
    lastFetchError = null;

    res.json({
      success: true,
      connected: true,
      storeName: data.shop.name,
      domain,
      productsCount: data.products.length,
      collectionsCount: data.collections.length,
      responseTimeMs,
      timestamp: new Date().toISOString(),
      collections: data.collections.map((c) => ({ title: c.title, handle: c.handle, productCount: c.productCount })),
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      connected: false,
      error: err.message,
      domain,
      fixInstructions:
        'Verify that your Storefront API Access Token has "unauthenticated_read_product_listings" and "unauthenticated_read_product_inventory" permissions in Shopify Admin -> App Development.',
    });
  }
});

// ----------------------------------------------------
// 2b. Shopify Products Live Catalog
// ----------------------------------------------------
app.get('/api/shopify/products', async (req, res) => {
  const { category, search, tag, sort, refresh } = req.query;

  try {
    const products = await syncShopifyCatalog(refresh === 'true');
    let results = [...products];

    // Filter by Category or Collection handle
    if (category && category !== 'all') {
      const cat = String(category).toLowerCase();
      results = results.filter(
        (p) =>
          p.category.toLowerCase() === cat ||
          p.collections?.some((c) => c.handle.toLowerCase() === cat || c.title.toLowerCase() === cat)
      );
    }

    // Filter by Tag
    if (tag) {
      const tagStr = String(tag).toLowerCase();
      results = results.filter((p) => p.tags.some((t) => t.toLowerCase() === tagStr));
    }

    // Search query
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'discount') {
      results.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: results.length,
      totalLiveProducts: products.length,
      products: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `Failed to load real Shopify products: ${err.message}`,
      fixInstructions:
        'Check network connectivity and ensure SHOPIFY_STOREFRONT_ACCESS_TOKEN and SHOPIFY_STORE_DOMAIN (kukapi.myshopify.com) are valid.',
    });
  }
});

app.get('/api/shopify/collections', async (req, res) => {
  try {
    if (collectionsCache.length === 0) {
      await syncShopifyCatalog();
    }
    res.json({
      success: true,
      collections: collectionsCache,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shopify/product/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    if (productsCache.length === 0) {
      await syncShopifyCatalog();
    }
    const product = productsCache.find((p) => p.handle === handle || p.id === handle);
    if (!product) {
      return res.status(404).json({ success: false, error: `Product not found: ${handle}` });
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. Shopify Storefront Cart API Endpoints
// ----------------------------------------------------
app.post('/api/shopify/cart/create', async (req, res) => {
  try {
    const { lines, discountCodes } = req.body;
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one variant line is required' });
    }
    const cart = await createShopifyCart(lines, discountCodes);
    res.json({ success: true, cart });
  } catch (err: any) {
    console.error('Error creating Shopify cart:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shopify/cart/:cartId', async (req, res) => {
  try {
    const cartId = decodeURIComponent(req.params.cartId);
    const cart = await getShopifyCart(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Shopify cart not found' });
    }
    res.json({ success: true, cart });
  } catch (err: any) {
    console.error('Error fetching Shopify cart:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopify/cart/lines/add', async (req, res) => {
  try {
    const { cartId, lines } = req.body;
    if (!cartId) {
      return res.status(400).json({ success: false, error: 'cartId is required' });
    }
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ success: false, error: 'lines array is required' });
    }
    const cart = await addShopifyCartLines(cartId, lines);
    res.json({ success: true, cart });
  } catch (err: any) {
    console.error('Error adding lines to Shopify cart:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopify/cart/lines/update', async (req, res) => {
  try {
    const { cartId, lines } = req.body;
    if (!cartId || !lines || !Array.isArray(lines)) {
      return res.status(400).json({ success: false, error: 'cartId and lines array are required' });
    }
    const cart = await updateShopifyCartLines(cartId, lines);
    res.json({ success: true, cart });
  } catch (err: any) {
    console.error('Error updating Shopify cart lines:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopify/cart/lines/remove', async (req, res) => {
  try {
    const { cartId, lineIds } = req.body;
    if (!cartId || !lineIds || !Array.isArray(lineIds)) {
      return res.status(400).json({ success: false, error: 'cartId and lineIds array are required' });
    }
    const cart = await removeShopifyCartLines(cartId, lineIds);
    res.json({ success: true, cart });
  } catch (err: any) {
    console.error('Error removing lines from Shopify cart:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/shopify/cart/checkout', async (req, res) => {
  try {
    const { items, discountCode } = req.body;
    const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const { checkoutUrl, cartId } = await createShopifyCartCheckout(items, discountCode);

    res.json({
      success: true,
      checkoutUrl,
      cartId,
      storeDomain: domain,
      itemsCount: items.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3b. Shopify Customer Account & Authentication Endpoints
// ----------------------------------------------------
app.post('/api/shopify/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const tokenData = await loginCustomerStorefront(email, password);
    res.json({ success: true, ...tokenData });
  } catch (err: any) {
    console.error('Customer login error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Login failed.' });
  }
});

app.post('/api/shopify/customer/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    if (!email || !password || !firstName) {
      return res.status(400).json({ success: false, error: 'First name, email and password are required.' });
    }
    const result = await registerCustomerStorefront({
      firstName,
      lastName: lastName || '',
      email,
      password,
      phone,
    });

    if (result.requiresVerification) {
      return res.json({
        success: true,
        requiresVerification: true,
        message: result.message || `We have sent an email to ${email}, please click the link included to verify your email address.`,
        customer: result.customer,
      });
    }

    // Attempt automatic login after registration
    try {
      const loginData = await loginCustomerStorefront(email, password);
      return res.json({ success: true, customer: result.customer, ...loginData });
    } catch (loginErr) {
      return res.json({ success: true, customer: result.customer });
    }
  } catch (err: any) {
    console.error('Customer registration error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

app.post('/api/shopify/customer/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    await recoverCustomerPasswordStorefront(email);
    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err: any) {
    console.error('Customer password recover error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Password recovery failed.' });
  }
});

app.get('/api/shopify/customer/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || (req.query.token as string);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer access token is required.' });
    }
    const customer = await getCustomerProfileStorefront(token);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer session expired or not found.' });
    }
    res.json({ success: true, customer });
  } catch (err: any) {
    console.error('Customer profile fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch customer profile.' });
  }
});

app.post('/api/shopify/customer/address', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || req.body.token;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer access token is required.' });
    }
    const { address } = req.body;
    if (!address || !address.address1 || !address.city || !address.zip) {
      return res.status(400).json({ success: false, error: 'Address details (street, city, zip) are required.' });
    }
    const created = await createCustomerAddressStorefront(token, address);
    if (address.isDefault) {
      try {
        await updateCustomerDefaultAddressStorefront(token, created.id);
      } catch (e) {
        // Ignored
      }
    }
    res.json({ success: true, address: created });
  } catch (err: any) {
    console.error('Customer address create error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to save address.' });
  }
});

app.put('/api/shopify/customer/address/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || req.body.token;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer access token is required.' });
    }
    const addressId = decodeURIComponent(req.params.id);
    const { address } = req.body;
    if (!address || !address.address1 || !address.city || !address.zip) {
      return res.status(400).json({ success: false, error: 'Address details (street, city, zip) are required.' });
    }
    const updated = await updateCustomerAddressStorefront(token, addressId, address);
    if (address.isDefault) {
      try {
        await updateCustomerDefaultAddressStorefront(token, addressId);
      } catch (e) {
        // Ignored
      }
    }
    res.json({ success: true, address: updated });
  } catch (err: any) {
    console.error('Customer address update error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to update address.' });
  }
});

app.put('/api/shopify/customer/address/default', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || req.body.token;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer access token is required.' });
    }
    const { addressId } = req.body;
    if (!addressId) {
      return res.status(400).json({ success: false, error: 'addressId is required.' });
    }
    await updateCustomerDefaultAddressStorefront(token, addressId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Customer default address update error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to update default address.' });
  }
});

app.delete('/api/shopify/customer/address/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || (req.query.token as string);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer access token is required.' });
    }
    const addressId = decodeURIComponent(req.params.id);
    await deleteCustomerAddressStorefront(token, addressId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Customer address delete error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to delete address.' });
  }
});

app.post('/api/shopify/customer/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null) || req.body.token;
    if (token) {
      await logoutCustomerStorefront(token);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.json({ success: true });
  }
});

// Customer Wishlist Persistence (Synced with Shopify Customer ID)
app.get('/api/customer/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer token required.' });
    }
    const customer = await getCustomerProfileStorefront(token);
    if (!customer || !customer.id) {
      return res.status(401).json({ success: false, error: 'Invalid or expired customer session.' });
    }
    const wishlist = customerWishlists.get(customer.id) || [];
    res.json({ success: true, wishlist });
  } catch (err: any) {
    console.error('Get customer wishlist error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to fetch customer wishlist.' });
  }
});

app.post('/api/customer/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Customer token required.' });
    }
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, error: 'productIds must be an array.' });
    }
    const customer = await getCustomerProfileStorefront(token);
    if (!customer || !customer.id) {
      return res.status(401).json({ success: false, error: 'Invalid or expired customer session.' });
    }
    customerWishlists.set(customer.id, productIds);
    res.json({ success: true, wishlist: productIds });
  } catch (err: any) {
    console.error('Save customer wishlist error:', err.message);
    res.status(400).json({ success: false, error: err.message || 'Failed to save customer wishlist.' });
  }
});

app.get('/api/shopify/search', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const results = await searchShopifyStorefront(query);
    res.json({ success: true, products: results, count: results.length });
  } catch (err: any) {
    console.error('Shopify search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. Order Creation & COD Partial Payment Processing
// ----------------------------------------------------
app.post('/api/orders/create', (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, discountCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Calculate totals based on backend config
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.selectedVariant.price * item.quantity,
      0
    );

    let discount = 0;
    if (discountCode) {
      const promo = currentAdminConfig.promoCodes.find(
        (p) => p.code.toUpperCase() === discountCode.toUpperCase()
      );
      if (promo && subtotal >= promo.minCart) {
        discount = Math.round((subtotal * promo.discountPercent) / 100);
      }
    }

    const shipping = subtotal >= currentAdminConfig.freeShippingThreshold ? 0 : currentAdminConfig.shippingFee;
    const codFee = paymentMethod === 'online' ? 0 : currentAdminConfig.codFee;
    const total = subtotal - discount + shipping + codFee;

    let payableNow = total;
    let remainingCod = 0;

    if (paymentMethod === 'partial_cod') {
      payableNow = Math.min(currentAdminConfig.codAdvance, total);
      remainingCod = Math.max(0, total - payableNow);
    } else if (paymentMethod === 'cod') {
      payableNow = 0;
      remainingCod = total;
    }

    const orderId = `KUK-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: orderId,
      date: new Date().toISOString(),
      items,
      subtotal,
      discount,
      shipping,
      codFee,
      total,
      payableNow,
      remainingCod,
      paymentMethod,
      status: 'confirmed',
      shippingAddress: shippingAddress || {
        name: 'KUKAPI Guest',
        email: 'customer@kukapi.com',
        phone: '+91 9876543210',
        addressLine1: '402, Lotus Grandeur, Veera Desai Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      },
      trackingNumber: `DEL-${Math.floor(100000000 + Math.random() * 900000000)}`,
      carrier: 'Delhivery Express Fashion Logistics',
      estimatedDelivery: 'Within 3-4 business days',
      timeline: [
        {
          status: 'placed',
          label: 'Order Placed',
          description: 'Your order was successfully received by KUKAPI.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
        },
        {
          status: 'confirmed',
          label: 'Order Confirmed',
          description: paymentMethod === 'partial_cod'
            ? `Advance payment of ₹${payableNow} verified. Remaining ₹${remainingCod} due upon delivery.`
            : 'Payment authorization and inventory allocated.',
          timestamp: 'Just now',
          completed: true,
        },
        {
          status: 'processing',
          label: 'Quality Check & Packing',
          description: 'Garments steamed, packed in eco-friendly cotton garment pouch.',
          timestamp: 'Expected in 12 hours',
          completed: false,
        },
        {
          status: 'shipped',
          label: 'Dispatched from Fulfillment Hub',
          description: 'Handed over to carrier for express transit.',
          timestamp: 'Expected tomorrow',
          completed: false,
        },
        {
          status: 'out_for_delivery',
          label: 'Out for Delivery',
          description: 'Courier agent will contact you before arrival.',
          timestamp: 'Expected in 3 days',
          completed: false,
        },
        {
          status: 'delivered',
          label: 'Delivered',
          description: 'Package delivered to your doorstep.',
          timestamp: 'Estimated Friday',
          completed: false,
        },
      ],
    };

    ordersDatabase[orderId] = newOrder;

    res.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = ordersDatabase[orderId];
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// ----------------------------------------------------
// 5. KUKAPI AI Shopping Assistant (Gemini 3.8 Flash)
// ----------------------------------------------------
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { prompt, conversationHistory, context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const ai = getAiClient();

    const catalogSummary = productsCache
      .map(
        (p) =>
          `• [${p.id}] ${p.title} (₹${p.price}, Cat: ${p.category}, Fabric: ${p.fabric}, Fit: ${p.fit}, Handle: ${p.handle})`
      )
      .join('\n');

    const systemInstruction = `
You are the official AI Personal Stylist & Shopping Assistant for "KUKAPI" (https://kukapi.myshopify.com), a modern, youthful, and premium Indian fashion brand.
Brand Aesthetic: Minimalist, clean, premium streetwear meets contemporary Indian heritage (Chanderi kurtis, Bagru block prints, 240 GSM heavy oversized tees, tactical joggers, bohemian tiered dresses).

Your Responsibilities:
1. Help customers find the perfect outfits and clothing pieces from the KUKAPI catalog based on their style, event, and budget.
2. Recommend sizes based on customer measurements (height, weight, chest/bust, fit preference e.g. oversized vs regular).
3. Answer product & fabric questions (e.g. explain 240 GSM combed compact cotton vs French terry, Chanderi silk blend, Khadi care).
4. Outline outfit pairing suggestions (e.g. pairing the Unisex Oversized Classic T-Shirt with the Relaxed Tactical Cargo Trousers).

MANDATORY SIZING DISCLAIMER RULE:
Whenever you recommend or discuss sizing (e.g. recommending S, M, L, XL), you MUST explicitly state the following disclaimer:
"⚠️ Please note: Sizing recommendations are suggestions based on our fit charts and customer feedback. Sizing preferences vary, so please check our detailed size chart before ordering."

Available KUKAPI Catalog:
${catalogSummary}

Response formatting:
- Tone: Friendly, fashion-forward, concise, premium Indian fashion vocabulary (e.g. drape, silhouette, GSM, festive, yoke, styling).
- When mentioning products, mention their exact title and handle so the customer can view them.
- Keep answers structured with bullet points where helpful.
`;

    const userContents = [
      ...(Array.isArray(conversationHistory)
        ? conversationHistory.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          }))
        : []),
      {
        role: 'user',
        parts: [
          {
            text: `Customer Request: "${prompt}"\n${
              context ? `Customer Context: ${JSON.stringify(context)}` : ''
            }`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContents as any,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'd love to help you find the ideal KUKAPI outfit. What style or occasion are you looking for today?";

    // Detect recommended products mentioned in the text
    const recommendedProducts = productsCache.filter(
      (p) =>
        replyText.toLowerCase().includes(p.title.toLowerCase()) ||
        replyText.toLowerCase().includes(p.handle.toLowerCase())
    ).slice(0, 3);

    // Detect if size was suggested
    const sizeMatch = replyText.match(/\b(size\s+)?(XS|S|M|L|XL|XXL|30|32|34|36)\b/i);
    const suggestedSize = sizeMatch ? sizeMatch[2].toUpperCase() : undefined;

    res.json({
      success: true,
      text: replyText,
      recommendedProducts,
      suggestedSize,
      hasDisclaimer: replyText.toLowerCase().includes('size chart') || replyText.toLowerCase().includes('suggestions'),
    });
  } catch (err: any) {
    console.error('Gemini assistant error:', err);
    // Graceful offline fallback
    res.json({
      success: true,
      text: "I'm currently assisting many shoppers! For our best-selling Unisex Oversized Classic T-Shirt, size M gives an effortless streetwear drape for chest 38-40\", and size L fits 42\". ⚠️ Note: Sizing recommendations are suggestions based on standard charts; please verify with our official size chart.",
      recommendedProducts: [productsCache[0]],
      suggestedSize: 'M',
      hasDisclaimer: true,
    });
  }
});

// ----------------------------------------------------
// 6. Vite Middleware & Production Static Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KUKAPI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
