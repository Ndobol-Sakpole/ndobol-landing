const scenePath = '/assets/images/scenes-v4';

// Art-directed sources preserve the white copy zone at each breakpoint.
function scenePicture(name, className, { lazy = false, priority = false } = {}) {
  const path = name === 'footer' ? '/assets/images/scenes-v5' : scenePath;
  const version = name === 'footer' ? 'v5' : 'v4';
  return `<picture class="${className}">
    <source media="(max-width: 760px)" srcset="${path}/${name}-mobile-${version}.webp" width="1024" height="1536">
    <img src="${path}/${name}-desktop-${version}.webp" alt="" width="1536" height="1024" decoding="async" ${lazy ? 'loading="lazy"' : ''} ${priority ? 'fetchpriority="high"' : ''}>
  </picture>`;
}

export function riverScene({ footer = false } = {}) {
  if (footer) {
    return `<div class="finish-scene" role="img" aria-label="Anjing, monyet, tupai, dan babi duduk tertawa bersama di dermaga finis, dengan bendera kotak-kotak dan piala bambu">
      ${scenePicture('footer', 'finish-art', { lazy: true })}
    </div>`;
  }
  return `<div class="river-scene" role="img" aria-label="Anjing, monyet, tupai, dan babi berpose kocak menjaga keseimbangan di atas getek, menyusuri kanal desa tropis">
    ${scenePicture('hero', 'river-background', { priority: true })}
    <picture class="river-crew">
      <source media="(max-width: 760px)" srcset="/assets/images/scenes-v3/hero-crew-mobile-v3.webp" width="1122" height="1402">
      <img src="${scenePath}/hero-crew-desktop-v4.webp" alt="" width="1942" height="809" decoding="async" fetchpriority="high">
    </picture>
  </div>`;
}
