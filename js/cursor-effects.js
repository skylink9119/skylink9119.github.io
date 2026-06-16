(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;

  if (prefersReduced || isCoarse || window.innerWidth <= 900) return;

  var html = document.documentElement;
  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var rafId = null;

  function isInteractive(target) {
    return !!(target && target.closest('a, button, input, textarea, select, summary, .site-page, .nav-vps-tool, .topic-entry-card, .recent-post-item, #card-info-btn, #pagination .page-number'));
  }

  function setPosition(node, x, y) {
    node.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
  }

  function animate() {
    setPosition(glow, mouseX, mouseY);

    rafId = window.requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    var hover = isInteractive(event.target);
    glow.classList.toggle('is-visible', hover);
    glow.classList.toggle('is-hover', hover);

    if (!rafId) animate();
  }, { passive: true });

  document.addEventListener('mousedown', function () {
    glow.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', function () {
    glow.classList.remove('is-clicking');
  });

  document.addEventListener('mouseleave', function () {
    glow.classList.remove('is-visible');
  });

  window.addEventListener('blur', function () {
    glow.classList.remove('is-visible');
  });
})();
