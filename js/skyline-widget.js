/* ============================================
   Skyline VPS 测评挂件脚本
   路径：source/js/skyline-widget.js
   ============================================ */

function swCopy() {
  var cmd = 'curl -sL https://tinyurl.com/Skyline9119 | bash';
  var btn = document.getElementById('swCopyBtn');
  var txt = document.getElementById('swBtnTxt');
  if (!btn || !txt) return;

  function onSuccess() {
    btn.classList.add('sw-copied');
    txt.textContent = '✓ 复制成功';
    setTimeout(function () {
      btn.classList.remove('sw-copied');
      txt.textContent = '一键复制命令';
    }, 2200);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(onSuccess).catch(fallback);
  } else {
    fallback();
  }

  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = cmd;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); onSuccess(); } catch (e) { /* silent */ }
    document.body.removeChild(ta);
  }
}
