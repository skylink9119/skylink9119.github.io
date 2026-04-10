/**
 * 优化的粒子动画 + 渐变流动背景
 * 仅首页启用，支持 PJAX 生命周期，避免移动端滚动冲突
 */

(function () {
  'use strict';

  const config = {
    particleColors: ['#22d3ee', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
    lineColors: ['34,211,238', '236,72,153', '139,92,246'],
    maxLineDistance: 120,
    baseSpeed: 0.3,
    mouseRadius: 150,
    interactionStrength: 1.5,
    fadeInDuration: 1200,
    minDesktopWidth: 901
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    initialized: false,
    canvas: null,
    ctx: null,
    particles: [],
    width: 0,
    height: 0,
    mouse: { x: -1000, y: -1000, radius: config.mouseRadius },
    startTime: 0,
    animationId: 0,
    fadeId: 0,
    listeners: [],
    cardCleanups: []
  };

  function isHomePage() {
    return !!(document.body && document.body.classList.contains('home'));
  }

  function shouldEnableEffect() {
    if (!isHomePage()) return false;
    if (prefersReducedMotion.matches) return false;
    return window.innerWidth >= config.minDesktopWidth;
  }

  function getParticleCount() {
    if (state.width >= 1600) return 60;
    if (state.width >= 1200) return 52;
    return 42;
  }

  function addListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    state.listeners.push(function () {
      target.removeEventListener(type, handler, options);
    });
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * state.width;
      this.y = Math.random() * state.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * config.baseSpeed;
      this.speedY = (Math.random() - 0.5) * config.baseSpeed;
      this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
      this.lineColor = config.lineColors[Math.floor(Math.random() * config.lineColors.length)];
      this.opacity = Math.random() * 0.5 + 0.3;
      this.waveOffset = Math.random() * Math.PI * 2;
      this.waveSpeed = Math.random() * 0.02 + 0.01;
      this.waveAmplitude = Math.random() * 0.5 + 0.2;

      if (!initial) {
        this.x = Math.random() > 0.5 ? 0 : state.width;
        this.y = Math.random() * state.height;
      }
    }

    update(nowMs) {
      const wavePhase = nowMs * 0.001 * this.waveSpeed + this.waveOffset;
      const waveX = Math.sin(wavePhase) * this.waveAmplitude;
      const waveY = Math.cos(wavePhase) * this.waveAmplitude;

      if (this.x > state.width || this.x < 0 || this.y > state.height || this.y < 0) {
        this.reset(false);
      }

      const dx = state.mouse.x - this.x;
      const dy = state.mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < state.mouse.radius) {
        const force = (state.mouse.radius - distance) / state.mouse.radius;
        const angle = Math.atan2(dy, dx);

        this.speedX += Math.cos(angle) * force * config.interactionStrength * 0.1;
        this.speedY += Math.sin(angle) * force * config.interactionStrength * 0.1;
        this.opacity = Math.min(0.9, this.opacity + force * 0.1);
      } else {
        this.opacity = Math.max(0.3, this.opacity - 0.01);
      }

      const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
      const maxSpeed = config.baseSpeed * 2;
      if (speed > maxSpeed) {
        this.speedX = (this.speedX / speed) * maxSpeed;
        this.speedY = (this.speedY / speed) * maxSpeed;
      }

      this.x += this.speedX + waveX;
      this.y += this.speedY + waveY;

      this.speedX *= 0.99;
      this.speedY *= 0.99;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, this.color + 'FF');
      gradient.addColorStop(1, this.color + '00');

      ctx.fillStyle = gradient;
      ctx.fill();

      if (this.opacity > 0.6) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '30';
        ctx.fill();
      }
    }
  }

  function initParticles() {
    const count = getParticleCount();
    state.particles = Array.from({ length: count }, function () {
      return new Particle();
    });
  }

  function drawLines() {
    const maxDistSq = config.maxLineDistance * config.maxLineDistance;

    for (let i = 0; i < state.particles.length; i++) {
      const a = state.particles[i];

      for (let j = i + 1; j < state.particles.length; j++) {
        const b = state.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const opacity = (1 - distSq / maxDistSq) * 0.3;
          state.ctx.beginPath();
          state.ctx.strokeStyle = 'rgba(' + a.lineColor + ',' + opacity.toFixed(3) + ')';
          state.ctx.lineWidth = 0.3;
          state.ctx.moveTo(a.x, a.y);
          state.ctx.lineTo(b.x, b.y);
          state.ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!state.initialized || !state.ctx) return;

    const now = performance.now();
    state.ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
    state.ctx.fillRect(0, 0, state.width, state.height);

    for (let i = 0; i < state.particles.length; i++) {
      const particle = state.particles[i];
      particle.update(now);
      particle.draw(state.ctx);
    }

    drawLines();
    state.animationId = window.requestAnimationFrame(animate);
  }

  function resizeCanvas() {
    if (!state.canvas) return;

    state.width = state.canvas.width = window.innerWidth;
    state.height = state.canvas.height = window.innerHeight;
    initParticles();
  }

  function handleMouseMove(event) {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
  }

  function handleMouseLeave() {
    state.mouse.x = -1000;
    state.mouse.y = -1000;
  }

  function handleTouchMove(event) {
    if (!event.touches || event.touches.length === 0) return;

    state.mouse.x = event.touches[0].clientX;
    state.mouse.y = event.touches[0].clientY;
  }

  function fadeInCanvas() {
    if (!state.canvas) return;

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / config.fadeInDuration, 1);
    state.canvas.style.opacity = String(progress * 0.7);

    if (progress < 1) {
      state.fadeId = window.requestAnimationFrame(fadeInCanvas);
    }
  }

  function bindCardTracking() {
    state.cardCleanups.forEach(function (cleanup) { cleanup(); });
    state.cardCleanups = [];

    const cards = document.querySelectorAll('.recent-post-item');
    cards.forEach(function (card) {
      const onMove = function (event) {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      };

      const onLeave = function () {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      state.cardCleanups.push(function () {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  function init() {
    if (state.initialized) return;

    const oldCanvas = document.getElementById('particle-canvas');
    if (oldCanvas && oldCanvas.parentNode) oldCanvas.parentNode.removeChild(oldCanvas);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 1.2s ease';

    document.body.appendChild(canvas);

    state.canvas = canvas;
    state.ctx = ctx;
    state.startTime = performance.now();
    state.initialized = true;

    resizeCanvas();
    bindCardTracking();
    animate();
    fadeInCanvas();

    addListener(window, 'resize', resizeCanvas);
    addListener(window, 'mousemove', handleMouseMove, { passive: true });
    addListener(window, 'mouseleave', handleMouseLeave, { passive: true });
    addListener(window, 'touchmove', handleTouchMove, { passive: true });
  }

  function cleanup() {
    if (!state.initialized) return;

    if (state.animationId) {
      window.cancelAnimationFrame(state.animationId);
      state.animationId = 0;
    }

    if (state.fadeId) {
      window.cancelAnimationFrame(state.fadeId);
      state.fadeId = 0;
    }

    state.listeners.forEach(function (remove) { remove(); });
    state.listeners = [];

    state.cardCleanups.forEach(function (cleanupCard) { cleanupCard(); });
    state.cardCleanups = [];

    if (state.canvas && state.canvas.parentNode) {
      state.canvas.parentNode.removeChild(state.canvas);
    }

    state.canvas = null;
    state.ctx = null;
    state.particles = [];
    state.mouse.x = -1000;
    state.mouse.y = -1000;
    state.initialized = false;
  }

  function reconcile() {
    if (shouldEnableEffect()) {
      init();
      bindCardTracking();
    } else {
      cleanup();
    }
  }

  function onReady(handler) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handler, { once: true });
    } else {
      handler();
    }
  }

  onReady(reconcile);

  document.addEventListener('pjax:send', cleanup);
  document.addEventListener('pjax:complete', function () {
    window.requestAnimationFrame(reconcile);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cleanup();
    } else {
      reconcile();
    }
  });

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', reconcile);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(reconcile);
  }

  window.cleanupCombinedBackground = cleanup;
})();
