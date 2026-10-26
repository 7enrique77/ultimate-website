const CART_ID_KEY = 'ultimate_cart_id';

function getCartId() {
  return localStorage.getItem(CART_ID_KEY);
}

function setCartId(id) {
  localStorage.setItem(CART_ID_KEY, id);
}

function formatCartMoney(amount, currencyCode) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
}

const cartDrawer = document.createElement('div');
cartDrawer.className = 'cart-drawer';
cartDrawer.innerHTML = `
  <div class="cart-drawer-overlay" id="cart-overlay"></div>
  <div class="cart-drawer-panel">
    <div class="cart-drawer-header">
      <h2 class="cart-drawer-title">YOUR CART</h2>
      <button type="button" class="cart-drawer-close" id="cart-close" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-drawer-lines" id="cart-lines"></div>
    <div class="cart-drawer-footer">
      <div class="cart-drawer-subtotal">
        <span>Subtotal</span>
        <span id="cart-subtotal">$0.00</span>
      </div>
      <button type="button" class="cart-drawer-checkout" id="cart-checkout">CHECKOUT</button>
    </div>
  </div>
`;
document.body.appendChild(cartDrawer);

const cartOverlay = document.getElementById('cart-overlay');
const cartLinesEl = document.getElementById('cart-lines');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartCheckoutBtn = document.getElementById('cart-checkout');
const cartCloseBtn = document.getElementById('cart-close');
const cartCountEls = document.querySelectorAll('.navbar-cart-count');
const cartToggleEls = document.querySelectorAll('.navbar-cart');

let currentCart = null;

function openCartDrawer() {
  cartDrawer.classList.add('cart-drawer-open');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('cart-drawer-open');
}

function renderCart(cart) {
  currentCart = cart;

  const totalQuantity = cart ? cart.totalQuantity : 0;
  cartCountEls.forEach((el) => {
    el.textContent = totalQuantity;
    el.hidden = totalQuantity === 0;
  });

  if (!cart || cart.lines.edges.length === 0) {
    cartLinesEl.innerHTML = '<p class="cart-drawer-empty">Your cart is empty.</p>';
    cartSubtotalEl.textContent = formatCartMoney(0, 'USD');
    cartCheckoutBtn.disabled = true;
    return;
  }

  cartCheckoutBtn.disabled = false;
  cartSubtotalEl.textContent = formatCartMoney(
    cart.cost.subtotalAmount.amount,
    cart.cost.subtotalAmount.currencyCode
  );

  cartLinesEl.innerHTML = '';
  cart.lines.edges.forEach(({ node: line }) => {
    const merch = line.merchandise;
    const planName = line.sellingPlanAllocation ? line.sellingPlanAllocation.sellingPlan.name : null;

    const row = document.createElement('div');
    row.className = 'cart-line';
    row.innerHTML = `
      <img class="cart-line-image" src="${merch.image ? merch.image.url : ''}" alt="${merch.image ? merch.image.altText || '' : ''}">
      <div class="cart-line-info">
        <p class="cart-line-title">${merch.product.title}</p>
        <p class="cart-line-variant">${merch.title}${planName ? ' &middot; ' + planName : ''}</p>
        <div class="cart-line-quantity">
          <button type="button" class="cart-line-qty-btn" data-action="decrease">&minus;</button>
          <span>${line.quantity}</span>
          <button type="button" class="cart-line-qty-btn" data-action="increase">+</button>
        </div>
      </div>
      <div class="cart-line-side">
        <p class="cart-line-price">${formatCartMoney(merch.price.amount, merch.price.currencyCode)}</p>
        <button type="button" class="cart-line-remove" data-action="remove">Remove</button>
      </div>
    `;

    row.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      const newQty = line.quantity - 1;
      if (newQty <= 0) {
        handleRemoveLine(line.id);
      } else {
        handleUpdateLine(line.id, newQty);
      }
    });
    row.querySelector('[data-action="increase"]').addEventListener('click', () => {
      handleUpdateLine(line.id, line.quantity + 1);
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => {
      handleRemoveLine(line.id);
    });

    cartLinesEl.appendChild(row);
  });
}

async function handleUpdateLine(lineId, quantity) {
  const cart = await cartLinesUpdate(getCartId(), lineId, quantity);
  renderCart(cart);
}

async function handleRemoveLine(lineId) {
  const cart = await cartLinesRemove(getCartId(), lineId);
  renderCart(cart);
}

async function addToCart(variantId, quantity, sellingPlanId) {
  const cartId = getCartId();
  let cart;
  if (cartId) {
    try {
      cart = await cartLinesAdd(cartId, variantId, quantity, sellingPlanId);
    } catch (err) {
      cart = null;
    }
  }
  if (!cart) {
    cart = await cartCreate(variantId, quantity, sellingPlanId);
    setCartId(cart.id);
  }
  renderCart(cart);
  openCartDrawer();
}

cartToggleEls.forEach((btn) => btn.addEventListener('click', () => openCartDrawer()));
cartOverlay.addEventListener('click', closeCartDrawer);
cartCloseBtn.addEventListener('click', closeCartDrawer);
cartCheckoutBtn.addEventListener('click', () => {
  if (currentCart) {
    window.location.href = currentCart.checkoutUrl;
  }
});

(async function initCart() {
  const cartId = getCartId();
  if (!cartId) {
    renderCart(null);
    return;
  }
  try {
    const cart = await cartGet(cartId);
    renderCart(cart);
  } catch (err) {
    renderCart(null);
  }
})();
