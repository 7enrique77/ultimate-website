const sizeButtons = document.querySelectorAll('#size-options .product-option-btn');
const priceEl = document.getElementById('product-price');
const qtyValueEl = document.getElementById('qty-value');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const statusEl = document.getElementById('product-status');
const carouselEl = document.getElementById('product-carousel');
const dotsEl = document.getElementById('carousel-dots');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const accordionDescriptionEl = document.getElementById('accordion-description');

let state = {
  variantId: sizeButtons[0].dataset.variant,
  quantity: 1,
};

let galleryLoaded = false;
let accordionLoaded = false;
let viewContentTracked = false;
let currentVariant = null;
let slideIndex = 0;

function formatMoney(amount, currencyCode) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
}

function setActive(buttons, matchFn) {
  buttons.forEach((btn) => {
    btn.classList.toggle('product-option-btn-active', matchFn(btn));
  });
}

function goToSlide(index) {
  const slides = carouselEl.querySelectorAll('.product-slide');
  const dots = dotsEl.querySelectorAll('.carousel-dot');
  if (!slides.length) return;
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('product-slide-active', i === slideIndex));
  dots.forEach((dot, i) => dot.classList.toggle('carousel-dot-active', i === slideIndex));
}

function addSlide(url, alt) {
  const img = document.createElement('img');
  img.className = 'product-slide';
  img.src = url;
  img.alt = alt || '';
  carouselEl.appendChild(img);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'carousel-dot';
  dot.style.backgroundImage = `url('${url}')`;
  dot.setAttribute('aria-label', alt || 'View image');
  const index = carouselEl.querySelectorAll('.product-slide').length - 1;
  dot.addEventListener('click', () => goToSlide(index));
  dotsEl.appendChild(dot);
}

function loadGallery(images) {
  images.forEach(({ node }) => addSlide(node.url, node.altText));
  goToSlide(0);
}

prevBtn.addEventListener('click', () => goToSlide(slideIndex - 1));
nextBtn.addEventListener('click', () => goToSlide(slideIndex + 1));

let touchStartX = null;
let touchStartY = null;

carouselEl.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

carouselEl.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  touchStartX = null;
  touchStartY = null;

  if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
  goToSlide(deltaX < 0 ? slideIndex + 1 : slideIndex - 1);
}, { passive: true });

function cleanHtml(html) {
  return html.replace(/<p>\s*<\/p>/gi, '').trim();
}

function loadAccordion(descriptionHtml) {
  if (!descriptionHtml) {
    accordionDescriptionEl.innerHTML = '<p>Coming soon.</p>';
    return;
  }

  accordionDescriptionEl.innerHTML = cleanHtml(descriptionHtml) || '<p>Coming soon.</p>';
}

document.querySelectorAll('.accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('accordion-item-open');
  });
});

async function refreshPrice() {
  priceEl.textContent = 'Loading price...';
  try {
    const variant = await fetchVariant(state.variantId);
    if (!variant) {
      priceEl.textContent = 'Price unavailable';
      return;
    }

    currentVariant = variant;
    if (!viewContentTracked) {
      trackMetaEvent('ViewContent', {
        content_ids: [metaContentId(variant.product.id, variant.id)],
        content_name: variant.product.title,
        content_type: 'product',
        value: Number(variant.price.amount),
        currency: variant.price.currencyCode,
      });
      viewContentTracked = true;
    }

    if (!galleryLoaded && variant.product.images.edges.length) {
      loadGallery(variant.product.images.edges);
      galleryLoaded = true;
    }

    if (!accordionLoaded) {
      loadAccordion(variant.product.descriptionHtml);
      accordionLoaded = true;
    }

    priceEl.textContent = formatMoney(variant.price.amount, variant.price.currencyCode);
  } catch (err) {
    priceEl.textContent = 'Price unavailable';
  }
}

sizeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.variantId = btn.dataset.variant;
    setActive(sizeButtons, (b) => b === btn);
    refreshPrice();
  });
});

document.getElementById('qty-decrease').addEventListener('click', () => {
  state.quantity = Math.max(1, state.quantity - 1);
  qtyValueEl.textContent = state.quantity;
});

document.getElementById('qty-increase').addEventListener('click', () => {
  state.quantity += 1;
  qtyValueEl.textContent = state.quantity;
});

addToCartBtn.addEventListener('click', async () => {
  addToCartBtn.disabled = true;
  statusEl.textContent = 'Adding to cart...';
  try {
    await addToCart(state.variantId, state.quantity, null);
    statusEl.textContent = '';
    if (currentVariant) {
      trackMetaEvent('AddToCart', {
        content_ids: [metaContentId(currentVariant.product.id, currentVariant.id)],
        content_name: currentVariant.product.title,
        content_type: 'product',
        contents: [{ id: metaContentId(currentVariant.product.id, currentVariant.id), quantity: state.quantity }],
        value: Number(currentVariant.price.amount) * state.quantity,
        currency: currentVariant.price.currencyCode,
      });
    }
  } catch (err) {
    statusEl.textContent = 'Something went wrong. Please try again.';
  } finally {
    addToCartBtn.disabled = false;
  }
});

setActive(sizeButtons, (b) => b === sizeButtons[0]);
refreshPrice();
