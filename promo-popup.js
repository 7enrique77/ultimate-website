const PROMO_CODE = 'WELCOME40';
const PROMO_PERCENT = 40;

const PROMO_CLAIMED_KEY = 'ultimate_promo_claimed';
const PROMO_DISMISSED_KEY = 'ultimate_promo_dismissed_session';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const offerParam = getQueryParam('offer');
const utmSource = getQueryParam('utm_source');
if (offerParam || utmSource) {
  sessionStorage.setItem('ultimate_last_offer', offerParam || '');
  sessionStorage.setItem('ultimate_last_utm_source', utmSource || '');
}

const isAdVisit = Boolean(offerParam);
const alreadyClaimed = Boolean(localStorage.getItem(PROMO_CLAIMED_KEY));
const dismissedThisSession = Boolean(sessionStorage.getItem(PROMO_DISMISSED_KEY));

if (!alreadyClaimed && !dismissedThisSession) {
  const popup = document.createElement('div');
  popup.className = 'promo-popup';
  popup.innerHTML = `
    <div class="promo-popup-overlay" id="promo-popup-overlay"></div>
    <div class="promo-popup-card">
      <button type="button" class="promo-popup-close" id="promo-popup-close" aria-label="Close">&times;</button>
      <div class="promo-popup-offer" id="promo-popup-offer">
        <p class="promo-popup-eyebrow">${isAdVisit ? 'YOUR OFFER IS WAITING' : 'NEW HERE?'}</p>
        <h2 class="promo-popup-title">${PROMO_PERCENT}% OFF<br>YOUR FIRST ORDER</h2>
        <p class="promo-popup-sub">Enter your email and we'll unlock it instantly &mdash; no code to remember.</p>
        <form class="promo-popup-form" id="promo-popup-form">
          <input class="promo-popup-input" type="email" id="promo-popup-email" placeholder="Enter your email" required>
          <button type="submit" class="merch-button story-cta-button promo-popup-submit">UNLOCK ${PROMO_PERCENT}% OFF</button>
        </form>
        <p class="promo-popup-fineprint">One-time use for new customers. Can't be combined with other offers.</p>
      </div>
      <div class="promo-popup-success" id="promo-popup-success" hidden>
        <p class="promo-popup-eyebrow">YOU'RE IN</p>
        <h2 class="promo-popup-title">${PROMO_PERCENT}% OFF<br>APPLIED</h2>
        <p class="promo-popup-sub">It'll come off your cart automatically at checkout. Code <strong>${PROMO_CODE}</strong> is also saved to this browser.</p>
        <a class="merch-button story-cta-button promo-popup-submit" href="/buy">SHOP NOW</a>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  const popupOverlay = document.getElementById('promo-popup-overlay');
  const popupClose = document.getElementById('promo-popup-close');
  const popupForm = document.getElementById('promo-popup-form');
  const popupEmail = document.getElementById('promo-popup-email');
  const popupOfferEl = document.getElementById('promo-popup-offer');
  const popupSuccessEl = document.getElementById('promo-popup-success');

  function openPromoPopup() {
    popup.classList.add('promo-popup-open');
  }

  function closePromoPopup() {
    popup.classList.remove('promo-popup-open');
    sessionStorage.setItem(PROMO_DISMISSED_KEY, 'true');
  }

  popupOverlay.addEventListener('click', closePromoPopup);
  popupClose.addEventListener('click', closePromoPopup);

  popupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = popupEmail.value;
    const submitBtn = popupForm.querySelector('.promo-popup-submit');
    submitBtn.disabled = true;

    if (typeof subscribeToShopifyNewsletter === 'function') {
      subscribeToShopifyNewsletter(email);
    }

    localStorage.setItem(PROMO_CLAIMED_KEY, 'true');
    localStorage.setItem('ultimate_promo_code', PROMO_CODE);

    if (typeof trackMetaEvent === 'function') {
      trackMetaEvent('Lead', { content_name: 'promo_welcome40' });
    }
    if (typeof applyPromoCodeToCart === 'function') {
      applyPromoCodeToCart(PROMO_CODE);
    }

    popupOfferEl.hidden = true;
    popupSuccessEl.hidden = false;
  });

  if (isAdVisit) {
    setTimeout(openPromoPopup, 600);
  } else {
    let shown = false;
    const showOnce = () => {
      if (shown) return;
      shown = true;
      openPromoPopup();
    };
    setTimeout(showOnce, 6000);
    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && e.clientY <= 0) showOnce();
    });
  }
}
