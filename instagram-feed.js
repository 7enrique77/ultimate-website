const INSTAFEED_API_KEY = 'ifk_55b21e336e2330e9e952d9b42868ad33915c5db1a8afbc5d';
const INSTAFEED_ACCOUNT = 'nvemg5-0e.myshopify.com';
const INSTAFEED_ENDPOINT = `https://instafeed.nfcube.com/feed/v6?limit=9&account=${INSTAFEED_ACCOUNT}&fu=1&fid=0`;

const PLAY_ICON = '<svg viewBox="0 0 24 24" class="instagram-feed-item-icon"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const CAROUSEL_ICON = '<svg viewBox="0 0 24 24" class="instagram-feed-item-icon instagram-feed-item-icon-small"><rect x="4" y="4" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 20h10a2 2 0 0 0 2-2V8" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

async function loadInstagramFeed() {
  const grid = document.getElementById('instagram-feed-grid');
  if (!grid) return;

  try {
    const res = await fetch(INSTAFEED_ENDPOINT, {
      headers: { 'X-API-Key': INSTAFEED_API_KEY },
    });
    const json = await res.json();
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const postLimit = isMobile ? 6 : 9;
    const posts = (json.data || []).slice(0, postLimit);
    if (!posts.length) return;

    grid.innerHTML = posts.map((post) => {
      const imageUrl = post.images && post.images.standard_resolution ? post.images.standard_resolution.url : '';
      if (!imageUrl) return '';
      const captionText = post.caption && post.caption.text ? post.caption.text : '';
      const alt = captionText.slice(0, 120).replace(/"/g, '&quot;');
      const videoUrl = post.videos && post.videos.standard_resolution ? post.videos.standard_resolution.url : '';

      if (post.type === 'video' && videoUrl) {
        return `
          <a class="instagram-feed-item" href="${post.link}" target="_blank" rel="noopener noreferrer">
            <video class="instagram-feed-item-image" src="${videoUrl}" poster="${imageUrl}" autoplay muted loop playsinline></video>
          </a>
        `;
      }

      const icon = post.type === 'video' ? PLAY_ICON : post.type === 'carousel_album' ? CAROUSEL_ICON : '';
      return `
        <a class="instagram-feed-item" href="${post.link}" target="_blank" rel="noopener noreferrer">
          <img class="instagram-feed-item-image" src="${imageUrl}" alt="${alt}" loading="lazy">
          ${icon}
        </a>
      `;
    }).join('');
  } catch (err) {
    grid.remove();
  }
}

loadInstagramFeed();
