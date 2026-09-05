/* SKYBYTE glass. No dependencies; optical distortion never touches content. */
(() => {
  'use strict';
  if (window.skybyteGlass) return;
  const selector = '#recent-posts .recent-post-item, #aside-content .card-widget';
  const ns = 'http://www.w3.org/2000/svg';
  const desktop = matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  const contrast = matchMedia('(prefers-contrast: more)');
  // Safari/Firefox retain the CSS material: URL backdrop filters differ by engine.
  const chromium = /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/OPR\//.test(navigator.userAgent);
  let controller, visibility, resize, defs, frame = 0, pending = null;
  let sequence = 0;
  const cards = new Map();

  function svg(name, attrs = {}) {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  // Rounded-rectangle normal map. Displacement tapers to zero inside the rim.
  function lensMap(width, height, radius) {
    const ratio = Math.min(1, 640 / width, 400 / height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round(width * ratio));
    canvas.height = Math.max(2, Math.round(height * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const image = ctx.createImageData(canvas.width, canvas.height);
    const rim = Math.min(20, radius * .8);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const px = (x + .5) / ratio - width / 2;
        const py = (y + .5) / ratio - height / 2;
        const qx = Math.abs(px) - (width / 2 - radius);
        const qy = Math.abs(py) - (height / 2 - radius);
        const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
        const length = Math.hypot(ax, ay);
        const depth = -(length + Math.min(Math.max(qx, qy), 0) - radius);
        let nx = 0, ny = 0;
        if (length > 0) { nx = ax / length; ny = ay / length; }
        else if (qx > qy) nx = 1;
        else ny = 1;
        const bend = depth > 0 && depth < rim ? Math.sin(Math.PI * depth / rim) : 0;
        const i = (y * canvas.width + x) * 4;
        image.data[i] = 128 - Math.sign(px) * nx * bend * 110;
        image.data[i + 1] = 128 - Math.sign(py) * ny * bend * 110;
        image.data[i + 2] = 128;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function makeLens(card) {
    const entry = cards.get(card);
    if (!entry || !entry.visible || !defs) return;
    const width = card.clientWidth, height = card.clientHeight;
    const size = `${width}:${height}`;
    if (!width || !height || entry.size === size) return;
    const radius = Math.min(parseFloat(getComputedStyle(card).borderTopLeftRadius) || 28, height / 2);
    const map = lensMap(width, height, radius);
    if (!map) return;
    const id = `skybyte-lens-${++sequence}`;
    const filter = svg('filter', { id, x: 0, y: 0, width, height,
      filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' });
    filter.append(svg('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '1.1', result: 'soft' }));
    filter.append(svg('feImage', { href: map, x: 0, y: 0, width, height, preserveAspectRatio: 'none', result: 'lens' }));
    filter.append(svg('feDisplacementMap', { in: 'soft', in2: 'lens', scale: 20, xChannelSelector: 'R', yChannelSelector: 'G' }));
    defs.append(filter);
    card.style.setProperty('--glass-filter', `url("#${id}")`);
    card.dataset.glassReady = '';
    entry.filter?.remove();
    entry.filter = filter;
    entry.size = size;
  }

  function paintLight() {
    frame = 0;
    if (!pending) return;
    const { card, x, y } = pending;
    pending = null;
    if (!card.isConnected) return;
    const box = card.getBoundingClientRect();
    const rx = Math.max(0, Math.min(1, (x - box.left) / box.width));
    const ry = Math.max(0, Math.min(1, (y - box.top) / box.height));
    card.style.setProperty('--glass-x', `${(rx * 100).toFixed(1)}%`);
    card.style.setProperty('--glass-y', `${(ry * 100).toFixed(1)}%`);
    card.style.setProperty('--glass-angle', `${Math.round(Math.atan2(ry - .5, rx - .5) * 180 / Math.PI + 90)}deg`);
  }

  function clear() {
    controller?.abort();
    visibility?.disconnect();
    resize?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0; pending = null;
    cards.forEach((entry, card) => {
      delete card.dataset.glassReady;
      ['--glass-filter', '--glass-x', '--glass-y', '--glass-angle'].forEach(key => card.style.removeProperty(key));
    });
    cards.clear();
    defs?.parentNode.remove();
    defs = null;
    document.documentElement.classList.remove('glass-refraction');
  }

  function init() {
    clear();
    if (!desktop.matches || reduceMotion.matches || reduceTransparency.matches || contrast.matches) return;
    controller = new AbortController();
    const options = { passive: true, signal: controller.signal };
    const canRefract = chromium && 'IntersectionObserver' in window && 'ResizeObserver' in window;
    if (canRefract) {
      const root = svg('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
      root.style.cssText = 'position:absolute;pointer-events:none;overflow:hidden';
      root.id = 'skybyte-glass-optics';
      defs = svg('defs'); root.append(defs); document.body.append(root);
      document.documentElement.classList.add('glass-refraction');
      visibility = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          const entry = cards.get(target);
          if (entry) { entry.visible = isIntersecting; if (isIntersecting) makeLens(target); }
        });
      }, { rootMargin: '120px' });
      resize = new ResizeObserver(entries => entries.forEach(({ target }) => makeLens(target)));
    }
    document.querySelectorAll(selector).forEach(card => {
      cards.set(card, { visible: false, size: '', filter: null });
      card.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        pending = { card, x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(paintLight);
      }, options);
      card.addEventListener('pointerleave', () => {
        if (pending?.card === card) pending = null;
        ['--glass-x', '--glass-y', '--glass-angle'].forEach(key => card.style.removeProperty(key));
      }, options);
      visibility?.observe(card);
      resize?.observe(card);
    });
  }

  window.skybyteGlass = { refresh: init };
  document.addEventListener('pjax:send', clear);
  document.addEventListener('pjax:complete', init);
  [desktop, reduceMotion, reduceTransparency, contrast].forEach(query => query.addEventListener('change', init));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
