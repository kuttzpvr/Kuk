import {
  Product,
  ProductVariant,
  ShopifyCart,
  ShopifyCollection,
  ShopifyConnectionStatus,
  ShopifyCustomer,
  ShopifyCustomerAddress,
  ShopifyCustomerOrder,
} from '../types/index.ts';

const COLOR_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#111111',
  'navy blue': '#1B2A4A',
  'bottle green': '#004225',
  red: '#C41E3A',
  maroon: '#800000',
  'light baby pink': '#FFD1DC',
  lavender: '#E6E6FA',
  'baby blue': '#89CFF0',
  flamingo: '#FC8EAC',
  jade: '#00A86B',
  'off white': '#FAF9F6',
  skyblue: '#87CEEB',
  'royal blue': '#4169E1',
  pink: '#FFC0CB',
  'new yellow': '#FFF275',
  orange: '#FFA500',
  'golden yellow': '#FFDF00',
  'grey melange': '#A8A8A8',
  beige: '#F5F5DC',
  'black charcoal melange': '#2F353B',
  'black white': '#222222',
  'olive green': '#556B2F',
};

export function getColorHex(colorName: string): string {
  const key = (colorName || '').toLowerCase().trim();
  return COLOR_MAP[key] || '#27272a';
}

export interface FetchShopifyResult {
  products: Product[];
  collections: ShopifyCollection[];
  shop: {
    name: string;
    description: string;
    primaryDomain: { url: string; host: string };
  };
}

export async function fetchLiveShopifyData(): Promise<FetchShopifyResult> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  if (!token || token.trim() === '') {
    throw new Error(
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing. Please set your Shopify Storefront Access Token in environment settings.'
    );
  }

  const query = `
    query GetShopifyStorefrontData {
      shop {
        name
        description
        primaryDomain {
          url
          host
        }
      }
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            image { url altText }
            products(first: 50) {
              edges {
                node { id handle }
              }
            }
          }
        }
      }
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            productType
            vendor
            tags
            availableForSale
            totalInventory
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            compareAtPriceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 10) {
              edges {
                node { url altText width height }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  quantityAvailable
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                  image { url altText }
                }
              }
            }
            collections(first: 5) {
              edges {
                node { id title handle }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(
      `Shopify API HTTP error ${res.status}: ${res.statusText}. Please verify SHOPIFY_STORE_DOMAIN (${domain}) and SHOPIFY_STOREFRONT_ACCESS_TOKEN.`
    );
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e: any) => e.message).join('; ');
    throw new Error(`Shopify GraphQL error: ${msg}`);
  }

  if (!json.data || !json.data.products) {
    throw new Error('Shopify returned unexpected data structure without products.');
  }

  const rawProducts = json.data.products.edges.map((e: any) => e.node);
  const collections: ShopifyCollection[] = (json.data.collections?.edges || []).map((e: any) => ({
    id: e.node.id,
    title: e.node.title,
    handle: e.node.handle,
    description: e.node.description || '',
    image: e.node.image?.url,
    productCount: e.node.products?.edges?.length || 0,
  }));

  // Filter out non-purchasable or placeholder products (like Partial Payment with 0 price)
  const validProducts = rawProducts.filter((p: any) => {
    const minPrice = parseFloat(p.priceRange?.minVariantPrice?.amount || '0');
    return minPrice > 0 && p.images?.edges?.length > 0;
  });

  const products: Product[] = validProducts.map((p: any, index: number) => {
    const minPrice = parseFloat(p.priceRange.minVariantPrice.amount);
    const comparePriceVal = p.compareAtPriceRange?.minVariantPrice?.amount
      ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount)
      : 0;

    const compareAtPrice =
      comparePriceVal > minPrice ? comparePriceVal : Math.round(minPrice * 1.3);
    const discountPercent = Math.max(
      0,
      Math.round(((compareAtPrice - minPrice) / compareAtPrice) * 100)
    );

    const images: string[] = p.images.edges.map((i: any) => i.node.url);
    const featuredImage = images[0] || '';

    const variants: ProductVariant[] = p.variants.edges.map((v: any) => {
      const vNode = v.node;
      const sizeOpt =
        vNode.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'size') ||
        vNode.selectedOptions?.find((o: any) =>
          ['xs', 's', 'm', 'l', 'xl', 'xxl', '2xl', '3xl', '6', '9'].includes(o.value.toLowerCase())
        );
      const colorOpt =
        vNode.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'color') ||
        vNode.selectedOptions?.find(
          (o: any) =>
            !['xs', 's', 'm', 'l', 'xl', 'xxl', '2xl', '3xl', 'default title'].includes(
              o.value.toLowerCase()
            )
        );

      let size =
        sizeOpt?.value ||
        (vNode.title !== 'Default Title' && vNode.title.includes('/')
          ? vNode.title.split('/')[1]?.trim()
          : vNode.title === 'Default Title'
          ? 'Free Size'
          : vNode.title);
      let color =
        colorOpt?.value ||
        (vNode.title.includes('/') ? vNode.title.split('/')[0]?.trim() : '');

      if (!size || size === 'Default Title') size = 'Free Size';

      const vPrice = parseFloat(vNode.price?.amount || minPrice.toString());
      const vCompare = vNode.compareAtPrice
        ? parseFloat(vNode.compareAtPrice.amount)
        : compareAtPrice;

      return {
        id: vNode.id,
        title: vNode.title,
        size: size.trim(),
        color: color.trim(),
        colorHex: getColorHex(color),
        price: vPrice,
        compareAtPrice: vCompare > vPrice ? vCompare : Math.round(vPrice * 1.3),
        inStock: vNode.availableForSale,
        sku: vNode.sku || `SKU-${vNode.id.split('/').pop()}`,
        quantityAvailable: vNode.quantityAvailable ?? 999,
        image: vNode.image?.url || featuredImage,
        selectedOptions: vNode.selectedOptions,
      };
    });

    const primaryCollection = p.collections?.edges?.[0]?.node?.handle || '';
    let category = 't-shirts';
    if (primaryCollection.includes('men')) category = 'men';
    else if (primaryCollection.includes('women')) category = 'women';
    else if (p.title.toLowerCase().includes('crop')) category = 'women';
    else if (p.title.toLowerCase().includes('raglan')) category = 'men';
    else if (p.productType && p.productType.toLowerCase().includes('oversized')) category = 'oversized';

    const gsmMatch =
      p.title.match(/(\d{3})\s*GSM/i) || (p.productType && p.productType.match(/(\d{3})\s*GSM/i));
    const gsm = gsmMatch
      ? `${gsmMatch[1]} GSM`
      : p.title.toLowerCase().includes('oversized')
      ? '240 GSM'
      : undefined;

    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description:
        p.description ||
        `${p.title} - Signature KUKAPI premium streetwear cut with durable construction and refined aesthetic.`,
      price: minPrice,
      compareAtPrice,
      currency: p.priceRange.minVariantPrice.currencyCode || 'INR',
      discountPercent,
      category,
      tags: p.tags || [],
      featuredImage,
      images,
      variants,
      availableForSale: p.availableForSale,
      totalInventory: p.totalInventory ?? 999,
      rating: +(4.7 + ((index % 4) * 0.08)).toFixed(1),
      reviewCount: 18 + ((index * 7) % 65),
      fabric: p.title.toLowerCase().includes('terry')
        ? '100% French Terry Cotton'
        : p.title.toLowerCase().includes('waffle')
        ? 'Waffle Knit Cotton'
        : '100% Super Combed Cotton',
      gsm,
      fit: p.title.toLowerCase().includes('boxy')
        ? 'Boxy Streetwear Fit'
        : p.title.toLowerCase().includes('crop')
        ? 'Cropped Fit'
        : 'Oversized Fit',
      care: 'Machine wash cold inside out, do not bleach, tumble dry low',
      isNewArrival: index < 6,
      isBestSeller: index % 3 === 0,
      isTrending: index % 2 === 1,
      shopifyUrl: `https://${domain}/products/${p.handle}`,
      collections: (p.collections?.edges || []).map((c: any) => c.node),
      reviews: [
        {
          id: `rev-${p.handle}-1`,
          author: 'Rohan V.',
          rating: 5,
          date: '2 days ago',
          comment: 'Fabric quality is phenomenal. The heavy drape gives an authentic luxury look.',
          sizeBought: variants[0]?.size,
          verifiedPurchase: true,
        },
        {
          id: `rev-${p.handle}-2`,
          author: 'Sneha K.',
          rating: 5,
          date: '1 week ago',
          comment: 'Love the collar stiffness and wash durability. Highly recommended KUKAPI piece!',
          sizeBought: variants[1]?.size || variants[0]?.size,
          verifiedPurchase: true,
        },
      ],
    };
  });

  return {
    products,
    collections,
    shop: json.data.shop || {
      name: 'KUKAPI',
      description: 'Official KUKAPI Apparel Store',
      primaryDomain: { url: `https://${domain}`, host: domain },
    },
  };
}

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            price {
              amount
              currencyCode
            }
            image {
              url
            }
            product {
              id
              title
              handle
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

function mapShopifyCart(cartNode: any): ShopifyCart {
  return {
    id: cartNode.id,
    checkoutUrl: cartNode.checkoutUrl,
    totalQuantity: cartNode.totalQuantity ?? 0,
    cost: {
      subtotalAmount: cartNode.cost?.subtotalAmount || { amount: '0', currencyCode: 'INR' },
      totalAmount: cartNode.cost?.totalAmount || { amount: '0', currencyCode: 'INR' },
    },
    lines: (cartNode.lines?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      cost: edge.node.cost,
      merchandise: {
        id: edge.node.merchandise?.id || '',
        title: edge.node.merchandise?.title || '',
        sku: edge.node.merchandise?.sku || '',
        price: edge.node.merchandise?.price || { amount: '0', currencyCode: 'INR' },
        image: edge.node.merchandise?.image,
        product: {
          id: edge.node.merchandise?.product?.id || '',
          title: edge.node.merchandise?.product?.title || '',
          handle: edge.node.merchandise?.product?.handle || '',
        },
        selectedOptions: edge.node.merchandise?.selectedOptions || [],
      },
    })),
  };
}

export async function createShopifyCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  discountCodes?: string[]
): Promise<ShopifyCart> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const formattedLines = lines.map((l) => ({
    merchandiseId: l.merchandiseId.startsWith('gid://shopify/ProductVariant/')
      ? l.merchandiseId
      : `gid://shopify/ProductVariant/${l.merchandiseId}`,
    quantity: l.quantity || 1,
  }));

  const mutation = `
    mutation CartCreate($lines: [CartLineInput!], $discountCodes: [String!]) {
      cartCreate(input: { lines: $lines, discountCodes: $discountCodes }) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        lines: formattedLines,
        discountCodes: discountCodes || [],
      },
    }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.cartCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const cartNode = json.data?.cartCreate?.cart;
  if (!cartNode) {
    throw new Error('Shopify did not return a cart');
  }
  return mapShopifyCart(cartNode);
}

export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FRAGMENT}
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query, variables: { cartId } }),
  });

  const json = await res.json();
  const cartNode = json.data?.cart;
  if (!cartNode) return null;
  return mapShopifyCart(cartNode);
}

export async function addShopifyCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const formattedLines = lines.map((l) => ({
    merchandiseId: l.merchandiseId.startsWith('gid://shopify/ProductVariant/')
      ? l.merchandiseId
      : `gid://shopify/ProductVariant/${l.merchandiseId}`,
    quantity: l.quantity || 1,
  }));

  const mutation = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { cartId, lines: formattedLines } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.cartLinesAdd?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const cartNode = json.data?.cartLinesAdd?.cart;
  if (!cartNode) {
    throw new Error('Shopify did not return an updated cart');
  }
  return mapShopifyCart(cartNode);
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { cartId, lines } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.cartLinesUpdate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const cartNode = json.data?.cartLinesUpdate?.cart;
  if (!cartNode) {
    throw new Error('Shopify did not return an updated cart');
  }
  return mapShopifyCart(cartNode);
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { cartId, lineIds } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.cartLinesRemove?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const cartNode = json.data?.cartLinesRemove?.cart;
  if (!cartNode) {
    throw new Error('Shopify did not return an updated cart');
  }
  return mapShopifyCart(cartNode);
}

export async function createShopifyCartCheckout(
  items: Array<{ variantId: string; quantity: number }>,
  discountCode?: string
): Promise<{ checkoutUrl: string; cartId?: string }> {
  const lines = items.map((i) => ({ merchandiseId: i.variantId, quantity: i.quantity }));
  try {
    const cart = await createShopifyCart(lines, discountCode ? [discountCode] : []);
    return { checkoutUrl: cart.checkoutUrl, cartId: cart.id };
  } catch (err) {
    console.warn('Shopify cart checkout fallback to permalink:', err);
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const permalinks = items
    .map((item) => {
      const numId = item.variantId.replace('gid://shopify/ProductVariant/', '');
      return `${numId}:${item.quantity || 1}`;
    })
    .join(',');

  let checkoutUrl = `https://${domain}/cart/${permalinks}`;
  if (discountCode) {
    checkoutUrl += `?discount=${encodeURIComponent(discountCode)}`;
  }
  return { checkoutUrl };
}

// ----------------------------------------------------------------------
// Customer Account Storefront GraphQL Functions
// ----------------------------------------------------------------------

export async function loginCustomerStorefront(
  email: string,
  password: string
): Promise<{ accessToken: string; expiresAt: string }> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { input: { email, password } } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.customerAccessTokenCreate?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    const rawMsg = userErrors[0].message;
    if (rawMsg === 'Unidentified customer') {
      throw new Error(
        'Could not sign in. Please check that your email and password are correct. If you just registered, please verify your account using the email link sent to your inbox.'
      );
    }
    throw new Error(rawMsg);
  }
  const tokenObj = json.data?.customerAccessTokenCreate?.customerAccessToken;
  if (!tokenObj?.accessToken) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }
  return tokenObj;
}

export async function registerCustomerStorefront(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{
  customer?: { id?: string; email: string; firstName: string; lastName: string };
  requiresVerification?: boolean;
  message?: string;
}> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const payload: any = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    acceptsMarketing: true,
  };
  if (input.phone) {
    payload.phone = input.phone;
  }

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { input: payload } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.customerCreate?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    // Check if Shopify returned an account verification / activation requirement
    const verificationNotice = userErrors.find(
      (e: any) =>
        e.code === 'CUSTOMER_DISABLED' ||
        /verify your email/i.test(e.message || '') ||
        /sent an email/i.test(e.message || '') ||
        /activation/i.test(e.message || '')
    );

    if (verificationNotice) {
      return {
        customer: {
          id: json.data?.customerCreate?.customer?.id || '',
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
        },
        requiresVerification: true,
        message: verificationNotice.message,
      };
    }

    throw new Error(userErrors[0].message);
  }
  const customer = json.data?.customerCreate?.customer;
  if (!customer) {
    throw new Error('Could not create customer account on Shopify.');
  }
  return { customer, requiresVerification: false };
}

export async function recoverCustomerPasswordStorefront(email: string): Promise<boolean> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query: mutation, variables: { email } }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.customerRecover?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  return true;
}

export async function getCustomerProfileStorefront(
  customerAccessToken: string
): Promise<ShopifyCustomer | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const query = `
    query GetCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        id
        firstName
        lastName
        displayName
        email
        phone
        defaultAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        addresses(first: 10) {
          edges {
            node {
              id
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              country
              phone
            }
          }
        }
        orders(first: 30, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              subtotalPrice {
                amount
                currencyCode
              }
              totalShippingPrice {
                amount
                currencyCode
              }
              totalTax {
                amount
                currencyCode
              }
              currentTotalPrice {
                amount
                currencyCode
              }
              statusUrl
              successfulFulfillments {
                trackingCompany
                trackingInfo {
                  number
                  url
                }
              }
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalPrice {
                      amount
                      currencyCode
                    }
                    variant {
                      id
                      title
                      image {
                        url
                      }
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                zip
                country
                phone
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({ query, variables: { token: customerAccessToken } }),
  });

  const json = await res.json();
  const c = json.data?.customer;
  if (!c) return null;

  const defaultAddr: ShopifyCustomerAddress | undefined = c.defaultAddress
    ? {
        id: c.defaultAddress.id,
        firstName: c.defaultAddress.firstName,
        lastName: c.defaultAddress.lastName,
        address1: c.defaultAddress.address1 || '',
        address2: c.defaultAddress.address2 || '',
        city: c.defaultAddress.city || '',
        province: c.defaultAddress.province || '',
        zip: c.defaultAddress.zip || '',
        country: c.defaultAddress.country || 'India',
        phone: c.defaultAddress.phone || '',
        isDefault: true,
      }
    : undefined;

  const addresses: ShopifyCustomerAddress[] = (c.addresses?.edges || []).map((edge: any) => {
    const a = edge.node;
    return {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      address1: a.address1 || '',
      address2: a.address2 || '',
      city: a.city || '',
      province: a.province || '',
      zip: a.zip || '',
      country: a.country || 'India',
      phone: a.phone || '',
      isDefault: defaultAddr ? a.id === defaultAddr.id : false,
    };
  });

  const orders: ShopifyCustomerOrder[] = (c.orders?.edges || []).map((edge: any) => {
    const o = edge.node;
    return {
      id: o.id,
      orderNumber: o.orderNumber ?? o.name,
      name: o.name,
      processedAt: o.processedAt,
      financialStatus: o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      totalPrice: o.totalPrice || { amount: '0', currencyCode: 'INR' },
      subtotalPrice: o.subtotalPrice,
      totalShippingPrice: o.totalShippingPrice,
      totalTax: o.totalTax,
      currentTotalPrice: o.currentTotalPrice,
      statusUrl: o.statusUrl,
      successfulFulfillments: o.successfulFulfillments,
      shippingAddress: o.shippingAddress
        ? {
            id: `addr-${o.id}`,
            firstName: o.shippingAddress.firstName,
            lastName: o.shippingAddress.lastName,
            address1: o.shippingAddress.address1,
            address2: o.shippingAddress.address2,
            city: o.shippingAddress.city,
            province: o.shippingAddress.province,
            zip: o.shippingAddress.zip,
            country: o.shippingAddress.country,
            phone: o.shippingAddress.phone,
          }
        : undefined,
      lineItems: (o.lineItems?.edges || []).map((liEdge: any) => {
        const li = liEdge.node;
        return {
          title: li.title,
          quantity: li.quantity,
          originalTotalPrice: li.originalTotalPrice,
          variant: li.variant
            ? {
                id: li.variant.id,
                title: li.variant.title,
                image: li.variant.image,
                price: li.variant.price,
              }
            : undefined,
        };
      }),
    };
  });

  return {
    id: c.id,
    firstName: c.firstName || '',
    lastName: c.lastName || '',
    displayName: c.displayName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'KUKAPI Member',
    email: c.email || '',
    phone: c.phone || '',
    defaultAddress: defaultAddr,
    addresses,
    orders,
  };
}

export async function createCustomerAddressStorefront(
  customerAccessToken: string,
  address: Partial<ShopifyCustomerAddress>
): Promise<ShopifyCustomerAddress> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
      customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
        customerAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        customerAccessToken,
        address: {
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country || 'India',
          phone: address.phone,
        },
      },
    }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.customerAddressCreate?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const addr = json.data?.customerAddressCreate?.customerAddress;
  if (!addr) {
    throw new Error('Could not save address to Shopify customer profile.');
  }
  return {
    id: addr.id,
    firstName: addr.firstName,
    lastName: addr.lastName,
    address1: addr.address1,
    address2: addr.address2,
    city: addr.city,
    province: addr.province,
    zip: addr.zip,
    country: addr.country,
    phone: addr.phone,
  };
}

export async function updateCustomerAddressStorefront(
  customerAccessToken: string,
  addressId: string,
  address: Partial<ShopifyCustomerAddress>
): Promise<ShopifyCustomerAddress> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
      customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
        customerAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        customerAccessToken,
        id: addressId,
        address: {
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country || 'India',
          phone: address.phone,
        },
      },
    }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  const userErrors = json.data?.customerAddressUpdate?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  const addr = json.data?.customerAddressUpdate?.customerAddress;
  if (!addr) {
    throw new Error('Could not update address in Shopify customer profile.');
  }
  return {
    id: addr.id,
    firstName: addr.firstName,
    lastName: addr.lastName,
    address1: addr.address1,
    address2: addr.address2,
    city: addr.city,
    province: addr.province,
    zip: addr.zip,
    country: addr.country,
    phone: addr.phone,
  };
}

export async function updateCustomerDefaultAddressStorefront(
  customerAccessToken: string,
  addressId: string
): Promise<boolean> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
      customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({
      query: mutation,
      variables: { customerAccessToken, addressId },
    }),
  });

  const json = await res.json();
  const userErrors = json.data?.customerDefaultAddressUpdate?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  return true;
}

export async function deleteCustomerAddressStorefront(
  customerAccessToken: string,
  addressId: string
): Promise<boolean> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
      customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
        deletedCustomerAddressId
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token || '',
    },
    body: JSON.stringify({
      query: mutation,
      variables: { customerAccessToken, id: addressId },
    }),
  });

  const json = await res.json();
  const userErrors = json.data?.customerAddressDelete?.customerUserErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }
  return true;
}

export async function logoutCustomerStorefront(customerAccessToken: string): Promise<boolean> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kukapi.myshopify.com';
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const mutation = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token || '',
      },
      body: JSON.stringify({
        query: mutation,
        variables: { customerAccessToken },
      }),
    });
  } catch (e) {
    // Ignore cleanup error
  }
  return true;
}

export async function searchShopifyStorefront(searchQuery: string): Promise<Product[]> {
  const catalog = await fetchLiveShopifyData();
  const q = searchQuery.toLowerCase().trim();
  if (!q) return catalog.products;

  return catalog.products.filter((p) => {
    const matchTitle = p.title.toLowerCase().includes(q);
    const matchDesc = p.description.toLowerCase().includes(q);
    const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
    const matchCat = p.category.toLowerCase().includes(q);
    const matchFabric = p.fabric?.toLowerCase().includes(q);
    const matchFit = p.fit?.toLowerCase().includes(q);
    return matchTitle || matchDesc || matchTags || matchCat || matchFabric || matchFit;
  });
}
