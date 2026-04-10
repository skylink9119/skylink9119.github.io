(function () {
  'use strict';

  var MANAGED_ATTR = 'data-page-style-managed';
  var CONFIG_ID = 'page-style-config';
  var ANCHOR_ID = 'page-style-anchor';

  function readWantedStyles() {
    var configEl = document.getElementById(CONFIG_ID);
    if (!configEl) return [];

    try {
      var parsed = JSON.parse(configEl.textContent || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(Boolean);
    } catch (error) {
      console.warn('Failed to parse page style config:', error);
      return [];
    }
  }

  function syncPageStyles() {
    var head = document.head;
    if (!head) return;

    var anchor = document.getElementById(ANCHOR_ID);
    var wanted = Array.from(new Set(readWantedStyles()));
    var managedLinks = Array.from(
      head.querySelectorAll('link[rel="stylesheet"][' + MANAGED_ATTR + '="true"]')
    );
    var managedByHref = new Map();

    managedLinks.forEach(function (link) {
      managedByHref.set(link.getAttribute('href'), link);
    });

    managedLinks.forEach(function (link) {
      if (wanted.indexOf(link.getAttribute('href')) === -1) {
        link.remove();
      }
    });

    var insertAfter = anchor;

    wanted.forEach(function (href) {
      var link = managedByHref.get(href);

      if (!link || !head.contains(link)) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute(MANAGED_ATTR, 'true');
      }

      if (insertAfter && insertAfter.parentNode === head) {
        if (insertAfter.nextSibling !== link) {
          head.insertBefore(link, insertAfter.nextSibling);
        }
      } else if (!head.contains(link)) {
        head.appendChild(link);
      }

      insertAfter = link;
    });
  }

  function scheduleSync() {
    window.requestAnimationFrame(syncPageStyles);
  }

  document.addEventListener('DOMContentLoaded', scheduleSync);
  document.addEventListener('pjax:complete', scheduleSync);
  window.addEventListener('pageshow', scheduleSync);
})();
