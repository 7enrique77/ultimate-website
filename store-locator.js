const STORE_LOCATIONS = [
  { name: 'Panna Gas Station', address: '2620 Weston Rd, Weston, FL 33331', lat: 26.0859664, lng: -80.3709712 },
  { name: 'Panna Town Center', address: '1731 Main St, Weston, FL 33326', lat: 26.0972115, lng: -80.3815013 },
  { name: 'Bodega Ortega', address: '2859 Bird Ave Ste 1L, Miami, FL 33133', lat: 25.7355719, lng: -80.2393163 },
  { name: 'Nude Miami', address: '1100 Brickell Bay Dr #107, Miami, FL 33131', lat: 25.7631139, lng: -80.1904150 },
  { name: "A's Marketplace", address: '41 SE 5th St STE CU2, Miami, FL 33131', lat: 25.7691115, lng: -80.1917854 },
  { name: 'Basquet', address: '2829 Bird Ave, Miami, FL 33133', lat: 25.7358126, lng: -80.2391373 },
  { name: "Coconut Grove Farmer's Market", address: '3300 Grand Ave, Miami, FL 33133', lat: 25.7277267, lng: -80.2472893 },
];

function directionsUrl(store) {
  return `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
}

function initStoreLocator() {
  const mapEl = document.getElementById('store-locator-map');
  const listEl = document.getElementById('store-locator-list');
  if (!mapEl || !listEl || typeof L === 'undefined') return;

  const map = L.map(mapEl);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  const markers = {};
  const bounds = L.latLngBounds(STORE_LOCATIONS.map((s) => [s.lat, s.lng]));
  map.fitBounds(bounds, { padding: [40, 40] });

  STORE_LOCATIONS.forEach((store, index) => {
    const marker = L.marker([store.lat, store.lng]).addTo(map);
    marker.bindPopup(`<strong>${store.name}</strong><br>${store.address}<br><a href="${directionsUrl(store)}" target="_blank" rel="noopener noreferrer">Get Directions</a>`);
    markers[index] = marker;
  });

  listEl.innerHTML = STORE_LOCATIONS.map((store, index) => `
    <div class="store-locator-item" data-index="${index}">
      <p class="store-locator-item-name">${store.name}</p>
      <p class="store-locator-item-address">${store.address}</p>
      <a class="store-locator-item-link" href="${directionsUrl(store)}" target="_blank" rel="noopener noreferrer">Get Directions</a>
    </div>
  `).join('');

  listEl.querySelectorAll('.store-locator-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.store-locator-item-link')) return;
      const index = item.getAttribute('data-index');
      const store = STORE_LOCATIONS[index];
      map.setView([store.lat, store.lng], 15);
      markers[index].openPopup();
    });
  });
}

initStoreLocator();
