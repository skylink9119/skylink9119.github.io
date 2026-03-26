/**
 * Butterfly 博客自动主题切换器 v2.0
 * 专为 hexo-theme-butterfly 深度适配
 *
 * 功能：
 *   - 每次刷新随机切换一套主题色方案
 *   - 同一个标签页内保持稳定（不闪烁）
 *   - 覆盖 Butterfly 的 CSS 变量 + 注入精准选择器
 *   - 右下角小圆点指示器，点击可手动切换下一个
 *   - 6套精心设计的配色方案
 */

(function () {
  'use strict';

  // ============================================================
  // 主题配置
  // Butterfly 使用的 CSS 变量：--default-bg-color, --btn-bg,
  // --btn-hover-color, --pseudo-hover, --scrollbar-color 等
  // ============================================================
  var THEMES = [
    {
      name: 'sky-blue',
      label: '天空蓝',
      accent: '#49B1F5',        // 主色（Butterfly 默认）
      accentDark: '#1a8fd1',    // 深一阶
      accentLight: '#e8f4fd',   // 浅底
      hover: '#FF7242',         // hover 色（保持 Butterfly 默认橙）
      globalBg: '#f8f9fa',
      cardBg: '#ffffff',
      fontColor: '#4C4948',
      metaColor: '#858585',
    },
    {
      name: 'forest-green',
      label: '森林绿',
      accent: '#27ae60',
      accentDark: '#1a7a43',
      accentLight: '#eafaf1',
      hover: '#f39c12',
      globalBg: '#f4faf6',
      cardBg: '#ffffff',
      fontColor: '#2c3e50',
      metaColor: '#7f8c8d',
    },
    {
      name: 'sunset-orange',
      label: '暖阳橙',
      accent: '#e67e22',
      accentDark: '#c0600a',
      accentLight: '#fef5ec',
      hover: '#e74c3c',
      globalBg: '#fffbf7',
      cardBg: '#ffffff',
      fontColor: '#3d2b1f',
      metaColor: '#8e6b55',
    },
    {
      name: 'rose-pink',
      label: '樱花粉',
      accent: '#e91e8c',
      accentDark: '#b5146c',
      accentLight: '#fde8f4',
      hover: '#9b59b6',
      globalBg: '#fff8fc',
      cardBg: '#ffffff',
      fontColor: '#3a1a2c',
      metaColor: '#8c5a74',
    },
    {
      name: 'deep-purple',
      label: '深空紫',
      accent: '#7c4dff',
      accentDark: '#5e35b1',
      accentLight: '#f0ebff',
      hover: '#e040fb',
      globalBg: '#faf8ff',
      cardBg: '#ffffff',
      fontColor: '#1a1033',
      metaColor: '#7b6f9a',
    },
    {
      name: 'dark-night',
      label: '暗夜黑',
      accent: '#64b5f6',
      accentDark: '#42a5f5',
      accentLight: '#1e2a3a',
      hover: '#ff8a65',
      globalBg: '#181818',
      cardBg: '#242424',
      fontColor: '#e8e8e8',
      metaColor: '#9e9e9e',
    },
  ];

  // ============================================================
  // 选主题逻辑
  // ============================================================
  function pickTheme() {
    var SESSION_KEY = 'bf_auto_theme';
    var stored = sessionStorage.getItem(SESSION_KEY);

    if (stored) {
      var found = THEMES.filter(function (t) { return t.name === stored; })[0];
      if (found) return found;
    }

    var lastKey = localStorage.getItem('bf_auto_theme_last');
    var candidates = THEMES.filter(function (t) { return t.name !== lastKey; });
    if (candidates.length === 0) candidates = THEMES;

    var chosen = candidates[Math.floor(Math.random() * candidates.length)];
    sessionStorage.setItem(SESSION_KEY, chosen.name);
    localStorage.setItem('bf_auto_theme_last', chosen.name);
    return chosen;
  }

  // ============================================================
  // 应用主题 —— 覆盖 Butterfly CSS 变量 + 注入选择器覆盖
  // ============================================================
  function applyTheme(theme) {
    var root = document.documentElement;

    // ① 覆盖 Butterfly 在 :root 暴露的 CSS 变量
    root.style.setProperty('--default-bg-color', theme.accent);
    root.style.setProperty('--btn-bg', theme.accent);
    root.style.setProperty('--btn-hover-color', theme.hover);
    root.style.setProperty('--pseudo-hover', theme.hover);
    root.style.setProperty('--scrollbar-color', theme.accent);
    root.style.setProperty('--text-bg-hover', hexToRgba(theme.accent, 0.7));
    root.style.setProperty('--global-bg', theme.globalBg);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--font-color', theme.fontColor);
    root.style.setProperty('--text-highlight-color', theme.fontColor);
    root.style.setProperty('--card-meta', theme.metaColor);
    root.style.setProperty('--hr-border', hexToRgba(theme.accent, 0.4));
    root.style.setProperty('--hr-before-color', hexToRgba(theme.accent, 0.6));

    // ② 注入 CSS 精准覆盖 Butterfly 编译进去的硬编码颜色
    var styleId = 'bf-theme-override';
    var existing = document.getElementById(styleId);
    if (existing) existing.remove();

    var css = [
      // 导航栏滚动后背景
      '#nav.nav--fixed, #nav:not(.nav--hide) { background: ' + theme.accent + ' !important; }',

      // a 链接 hover 颜色
      'a:hover { color: ' + theme.accent + ' !important; }',

      // 文章卡片封面遮罩线条
      '.post-meta a:hover { color: ' + theme.accent + ' !important; }',

      // 分页按钮当前页
      '.pagination .page-number.current, .pagination .extend:hover { background: ' + theme.accent + ' !important; border-color: ' + theme.accent + ' !important; }',

      // 标签云 hover
      '#tag-cloud a:hover, .tag-cloud a:hover { background: ' + theme.accent + ' !important; border-color: ' + theme.accent + ' !important; }',

      // 目录 TOC 当前项
      '#article-container .toc-item.active > .toc-link, #toc .active > a { color: ' + theme.accent + ' !important; }',

      // 搜索高亮
      '#local-search-result .search-keyword { color: ' + theme.accent + ' !important; }',

      // 按钮
      '.btn, .button { background: ' + theme.accent + ' !important; border-color: ' + theme.accent + ' !important; }',
      '.btn:hover, .button:hover { background: ' + theme.hover + ' !important; border-color: ' + theme.hover + ' !important; }',

      // 右侧栏标题 decoration
      '#aside-content .card-widget { border-top: 3px solid ' + theme.accent + '; }',

      // 时间轴圆点
      '.timeline .entry-date::before { background: ' + theme.accent + ' !important; border-color: ' + theme.accentLight + ' !important; }',
      '.timeline .timeline-item::before { border-color: ' + theme.accent + ' !important; }',

      // archive 时间轴
      '.archive-list .archive-list-date::before { background: ' + theme.accent + ' !important; }',

      // 文章标题悬停
      '.post-title a:hover, .recent-post-info .post-title:hover { color: ' + theme.accent + ' !important; }',

      // 代码高亮语言标签
      'figure.highlight .code-caption, .hljs .code-lang { color: ' + theme.accent + ' !important; }',

      // li 前的小圆点
      '.list-beauty li:hover::before, .side-card ul li:hover::before { border-color: ' + theme.accent + ' !important; }',

      // 侧边栏文字高亮
      '#aside-content .card-info-social-icons .social-icon:hover { color: ' + theme.accent + ' !important; }',

      // 首页覆盖颜色
      '.site-meta .site-subtitle, #site-subtitle { color: ' + hexToRgba(theme.accent === '#49B1F5' ? '#fff' : '#fff', 0.9) + '; }',

      // card bg 确保覆盖
      '.card-widget, .post-card, .recent-post-item { background: ' + theme.cardBg + ' !important; }',

      // 全局背景
      'body { background: ' + theme.globalBg + ' !important; }',

      // 暗夜主题特殊处理
      (theme.name === 'dark-night' ? [
        'body { color: ' + theme.fontColor + ' !important; }',
        '#nav { background: #1a1a1a !important; }',
        '.card-widget, .post-card, .recent-post-item { background: ' + theme.cardBg + ' !important; border-color: #333 !important; }',
        'code, pre { background: #1e2a3a !important; color: #abb2bf !important; }',
      ].join('\n') : ''),
    ].join('\n');

    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);

    // ③ 切换暗色模式时，触发 Butterfly 内置的 darkmode（如果开启了的话）
    if (theme.name === 'dark-night') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // 只在非暗夜主题时移除 dark（避免和用户设置冲突）
      if (document.documentElement.getAttribute('data-theme') === 'dark'
          && sessionStorage.getItem('bf_auto_theme') === 'dark-night') {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    // ④ 移动端 meta theme-color
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = theme.accent;

    console.log('%c🎨 ' + theme.label + ' (' + theme.name + ')', 'color:' + theme.accent + ';font-weight:bold;');
  }

  // ============================================================
  // 工具：十六进制转 rgba
  // ============================================================
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ============================================================
  // 右下角主题指示器
  // ============================================================
  function addIndicator(theme) {
    var old = document.getElementById('bf-theme-dot');
    if (old) old.remove();

    var dot = document.createElement('div');
    dot.id = 'bf-theme-dot';
    dot.title = '当前：' + theme.label + '（点击换下一个，刷新随机换）';
    dot.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'width:14px',
      'height:14px',
      'border-radius:50%',
      'background:' + theme.accent,
      'box-shadow: 0 0 0 3px ' + hexToRgba(theme.accent, 0.25) + ', 0 2px 8px rgba(0,0,0,.2)',
      'cursor:pointer',
      'z-index:99999',
      'transition:transform .2s,box-shadow .2s',
    ].join(';');

    dot.addEventListener('mouseenter', function () {
      dot.style.transform = 'scale(1.6)';
      dot.style.boxShadow = '0 0 0 5px ' + hexToRgba(theme.accent, 0.2) + ', 0 4px 12px rgba(0,0,0,.25)';
    });
    dot.addEventListener('mouseleave', function () {
      dot.style.transform = 'scale(1)';
      dot.style.boxShadow = '0 0 0 3px ' + hexToRgba(theme.accent, 0.25) + ', 0 2px 8px rgba(0,0,0,.2)';
    });

    dot.addEventListener('click', function () {
      var currentName = sessionStorage.getItem('bf_auto_theme');
      var idx = THEMES.findIndex(function (t) { return t.name === currentName; });
      var next = THEMES[(idx + 1) % THEMES.length];
      sessionStorage.setItem('bf_auto_theme', next.name);
      localStorage.setItem('bf_auto_theme_last', next.name);
      applyTheme(next);
      addIndicator(next);
    });

    document.body.appendChild(dot);
  }

  // ============================================================
  // 启动
  // ============================================================
  var theme = pickTheme();

  // 立即注入 CSS 变量（防止 FOUC 闪烁）
  applyTheme(theme);

  // DOM 就绪后再添加指示器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      addIndicator(theme);
    });
  } else {
    addIndicator(theme);
  }

  // Butterfly PJAX 支持（单页跳转后重新应用）
  document.addEventListener('pjax:complete', function () {
    var currentName = sessionStorage.getItem('bf_auto_theme');
    var current = THEMES.filter(function (t) { return t.name === currentName; })[0] || theme;
    applyTheme(current);
    addIndicator(current);
  });

})();
