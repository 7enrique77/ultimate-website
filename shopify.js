const SHOPIFY_DOMAIN = 'nvemg5-0e.myshopify.com';
const STOREFRONT_TOKEN = '61cb859fe15ee96bd4d3f2766e349a4c';
const API_VERSION = '2024-10';
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

async function shopifyFetch(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }
  return json.data;
}

function variantGid(id) {
  return `gid://shopify/ProductVariant/${id}`;
}

function sellingPlanGid(id) {
  return `gid://shopify/SellingPlan/${id}`;
}

async function fetchVariant(variantId) {
  const query = `
    query getVariant($id: ID!) {
      node(id: $id) {
        ... on ProductVariant {
          id
          title
          availableForSale
          price { amount currencyCode }
          image { url altText }
          product {
            id
            title
            descriptionHtml
            images(first: 10) {
              edges { node { url altText } }
            }
          }
          sellingPlanAllocations(first: 10) {
            edges {
              node {
                sellingPlan { id name }
                checkoutChargeAmount { amount currencyCode }
              }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch(query, { id: variantGid(variantId) });
  return data.node;
}

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        sellingPlanAllocation {
          sellingPlan { name }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText }
            product { title }
          }
        }
      }
    }
  }
`;

function buildLine(variantId, quantity, sellingPlanId) {
  const line = {
    merchandiseId: variantGid(variantId),
    quantity,
  };
  if (sellingPlanId) {
    line.sellingPlanId = sellingPlanGid(sellingPlanId);
  }
  return line;
}

async function cartCreate(variantId, quantity, sellingPlanId) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const input = { lines: [buildLine(variantId, quantity, sellingPlanId)] };
  const data = await shopifyFetch(query, { input });
  const result = data.cartCreate;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join(', '));
  }
  return result.cart;
}

async function cartGet(cartId) {
  const query = `
    query getCart($id: ID!) {
      cart(id: $id) { ${CART_FIELDS} }
    }
  `;
  const data = await shopifyFetch(query, { id: cartId });
  return data.cart;
}

async function cartLinesAdd(cartId, variantId, quantity, sellingPlanId) {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch(query, {
    cartId,
    lines: [buildLine(variantId, quantity, sellingPlanId)],
  });
  const result = data.cartLinesAdd;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join(', '));
  }
  return result.cart;
}

async function cartLinesUpdate(cartId, lineId, quantity) {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lines: [{ id: lineId, quantity }] });
  const result = data.cartLinesUpdate;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join(', '));
  }
  return result.cart;
}

async function cartLinesRemove(cartId, lineId) {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }
  `;
  const data = await shopifyFetch(query, { cartId, lineIds: [lineId] });
  const result = data.cartLinesRemove;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join(', '));
  }
  return result.cart;
}
