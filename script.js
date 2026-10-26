const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > navbar.offsetHeight) {
    navbar.classList.add('navbar-hidden');
  } else {
    navbar.classList.remove('navbar-hidden');
  }

  navbar.classList.toggle('navbar-scrolled', currentScrollY > 0);

  lastScrollY = currentScrollY;
});

const dropdownToggle = document.querySelector('.navbar-dropdown-toggle');
const dropdownMenu = document.querySelector('.navbar-dropdown-menu');

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle('navbar-dropdown-open');
  });

  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('navbar-dropdown-open');
  });
}

const hamburger = document.getElementById('navbar-hamburger');
const navbarLinks = document.getElementById('navbar-links');

if (hamburger && navbarLinks) {
  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
    navbarLinks.classList.toggle('navbar-links-open');
  });

  document.addEventListener('click', (event) => {
    if (!navbarLinks.contains(event.target)) {
      navbarLinks.classList.remove('navbar-links-open');
    }
  });
}

const showcaseCan = document.querySelector('.showcase-can');

function updateShowcaseCanScale() {
  const windowHeight = window.innerHeight;
  const rect = showcaseCan.getBoundingClientRect();
  const start = windowHeight;
  const end = windowHeight - rect.height;
  const range = start - end;

  let progress = range > 0 ? (start - rect.top) / range : 1;
  progress = Math.min(Math.max(progress, 0), 1);

  const scale = 1.4 - 0.4 * progress;
  showcaseCan.style.transform = `scale(${scale})`;
}

if (showcaseCan) {
  window.addEventListener('scroll', updateShowcaseCanScale);
  window.addEventListener('resize', updateShowcaseCanScale);
  updateShowcaseCanScale();
}

const stripInner = document.querySelector('.strip-inner');

function updateStripScale() {
  const windowHeight = window.innerHeight;
  const rect = stripInner.getBoundingClientRect();
  const start = windowHeight;
  const end = windowHeight - rect.height;
  const range = start - end;

  let progress = range > 0 ? (start - rect.top) / range : 1;
  progress = Math.min(Math.max(progress, 0), 1);

  const scale = 0.6 + 0.4 * progress;
  stripInner.style.transform = `scale(${scale})`;
}

if (stripInner) {
  window.addEventListener('scroll', updateStripScale);
  window.addEventListener('resize', updateStripScale);
  updateStripScale();
}

const originalReviewsRow = document.getElementById('original-reviews-row');

if (originalReviewsRow) {
  let autoScrollPaused = false;
  let resumeTimeout;
  const scrollSpeed = 0.4;

  const setWidth = () => originalReviewsRow.scrollWidth / 3;

  originalReviewsRow.scrollLeft = setWidth();

  function tickReviewsScroll() {
    if (!autoScrollPaused) {
      originalReviewsRow.scrollLeft += scrollSpeed;
    }

    const width = setWidth();
    if (originalReviewsRow.scrollLeft >= width * 2) {
      originalReviewsRow.scrollLeft -= width;
    } else if (originalReviewsRow.scrollLeft <= 0) {
      originalReviewsRow.scrollLeft += width;
    }

    requestAnimationFrame(tickReviewsScroll);
  }

  function pauseAutoScroll() {
    autoScrollPaused = true;
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      autoScrollPaused = false;
    }, 2500);
  }

  originalReviewsRow.addEventListener('wheel', pauseAutoScroll, { passive: true });
  originalReviewsRow.addEventListener('touchstart', pauseAutoScroll, { passive: true });
  originalReviewsRow.addEventListener('mousedown', pauseAutoScroll);

  requestAnimationFrame(tickReviewsScroll);
}

const flavorGrid = document.querySelector('.flavor-grid');

if (flavorGrid) {
  const flavorTrack = flavorGrid.querySelector('.flavor-carousel-track');
  const flavorCards = flavorGrid.querySelectorAll('.flavor-card');
  const flavorDots = flavorGrid.querySelectorAll('.flavor-carousel-dot');
  const flavorPrevBtn = document.getElementById('flavor-carousel-prev');
  const flavorNextBtn = document.getElementById('flavor-carousel-next');
  let flavorIndex = 0;
  let flavorBaseOffset = 0;
  let flavorDragStartX = 0;
  let flavorDragCurrentX = 0;
  let flavorIsDragging = false;

  function getFlavorOffset(index) {
    const card = flavorCards[index];
    if (!card) return 0;
    const containerWidth = flavorGrid.clientWidth;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    return containerWidth / 2 - cardCenter;
  }

  function updateFlavorCarouselPosition() {
    if (!flavorTrack) return;
    flavorBaseOffset = getFlavorOffset(flavorIndex);
    flavorTrack.style.transform = `translateX(${flavorBaseOffset}px)`;
  }

  function goToFlavorCard(index) {
    flavorIndex = (index + flavorCards.length) % flavorCards.length;
    flavorCards.forEach((card, i) => card.classList.toggle('flavor-card-active', i === flavorIndex));
    flavorDots.forEach((dot, i) => dot.classList.toggle('flavor-carousel-dot-active', i === flavorIndex));
    updateFlavorCarouselPosition();
  }

  if (flavorPrevBtn && flavorNextBtn) {
    flavorPrevBtn.addEventListener('click', () => goToFlavorCard(flavorIndex - 1));
    flavorNextBtn.addEventListener('click', () => goToFlavorCard(flavorIndex + 1));
  }

  flavorDots.forEach((dot, i) => {
    dot.addEventListener('click', () => goToFlavorCard(i));
  });

  if (flavorTrack) {
    flavorTrack.addEventListener('touchstart', (event) => {
      flavorIsDragging = true;
      flavorDragStartX = event.touches[0].clientX;
      flavorDragCurrentX = flavorDragStartX;
      flavorTrack.style.transition = 'none';
    }, { passive: true });

    flavorTrack.addEventListener('touchmove', (event) => {
      if (!flavorIsDragging) return;
      flavorDragCurrentX = event.touches[0].clientX;
      const delta = flavorDragCurrentX - flavorDragStartX;
      flavorTrack.style.transform = `translateX(${flavorBaseOffset + delta}px)`;
    }, { passive: true });

    flavorTrack.addEventListener('touchend', () => {
      if (!flavorIsDragging) return;
      flavorIsDragging = false;
      flavorTrack.style.transition = '';
      const delta = flavorDragCurrentX - flavorDragStartX;
      const threshold = 40;
      if (delta > threshold) {
        goToFlavorCard(flavorIndex - 1);
      } else if (delta < -threshold) {
        goToFlavorCard(flavorIndex + 1);
      } else {
        updateFlavorCarouselPosition();
      }
    });
  }

  window.addEventListener('resize', updateFlavorCarouselPosition);
  updateFlavorCarouselPosition();

  function playFlavorHint() {
    if (!flavorTrack) return;
    const hintDistance = 34;
    setTimeout(() => {
      flavorTrack.style.transform = `translateX(${flavorBaseOffset - hintDistance}px)`;
      setTimeout(() => {
        flavorTrack.style.transform = `translateX(${flavorBaseOffset}px)`;
      }, 420);
    }, 900);
  }

  playFlavorHint();
}
