// Meta Pixel: "ULTIMATÉ Website" dataset in the Drink Ultimate LLC business.
const META_PIXEL_ID = '1876825240420360';

if (/^\d+$/.test(META_PIXEL_ID)) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
}

// Content IDs match the catalog's retailer IDs, which the Facebook & Instagram app sets to the Shopify variant ID.
function metaContentId(productGid, variantGid) {
  return String(variantGid).split('/').pop();
}

function trackMetaEvent(name, params) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', name, params);
  }
}
