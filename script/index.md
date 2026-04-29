---
title: VPS 一键检测工具
layout: page
aside: false
top_img: false
hide_title: true
comments: false
description: 一条命令快速检测 VPS 的网络测速、IP 归属和流媒体解锁情况。
---

<div class="script-tool-page">
<section class="script-tool-hero">
<div class="script-tool-hero__eyebrow">Skyline Lab / VPS Toolkit</div>
<h1>VPS 一键检测工具</h1>
<p>把网络测速、IP 归属和流媒体解锁检测收进一条命令里，适合先快速判断这台 VPS 值不值得继续部署。</p>
</section>

<section class="script-tool-command">
<p class="script-tool-command__label">先执行：</p>

<div class="script-tool-terminal-card">
<div class="script-tool-terminal-card__head">
<div class="script-tool-terminal-card__lights" aria-hidden="true">
<span></span>
<span></span>
<span></span>
</div>
<span class="script-tool-terminal-card__title">BASH</span>
<button class="script-tool-copy-inline" id="scriptToolCopyBtn" type="button" aria-label="一键复制命令">
<i class="fas fa-copy" aria-hidden="true"></i>
<span class="script-tool-copy-inline__text">一键复制</span>
</button>
</div>

<div class="script-tool-terminal-card__body">
<div class="script-tool-terminal-line">
<span class="script-tool-terminal-line__num">1</span>
<code class="script-tool-terminal-line__cmd" id="scriptToolCmd">curl -sL https://tinyurl.com/Skyline9119 | bash</code>
</div>
</div>
</div>

<div class="script-tool-actions">
<a class="script-tool-link" href="https://www.youtube.com/@guo1986" target="_blank" rel="noopener">去 YouTube 看实操</a>
</div>
</section>

<section class="script-tool-grid">
<article class="script-tool-info">
<h2>这个脚本会帮你看什么</h2>
<ul>
<li><strong>网络测速</strong>：快速看上下行、延迟和基础链路表现。</li>
<li><strong>IP 归属与质量</strong>：帮助判断机房、ASN 和基础网络环境。</li>
<li><strong>流媒体解锁</strong>：快速确认常见平台是否可用。</li>
</ul>
</article>

<article class="script-tool-info">
<h2>适合什么时候用</h2>
<ul>
<li>刚买完 VPS，先做第一轮体检。</li>
<li>准备部署 OpenClaw、代理或其他服务之前。</li>
<li>更换机房、线路或 IP 后重新确认质量。</li>
</ul>
</article>
</section>
</div>

<script>
  (() => {
    const button = document.getElementById('scriptToolCopyBtn');
    const command = document.getElementById('scriptToolCmd');
    if (!button || !command) return;

    const text = command.textContent.trim();
    const buttonText = button.querySelector('.script-tool-copy-inline__text');
    const reset = () => {
      if (buttonText) buttonText.textContent = '一键复制';
      button.disabled = false;
      button.classList.remove('is-copied');
    };

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        if (buttonText) buttonText.textContent = '复制成功';
      } catch (error) {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.focus();
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        if (buttonText) buttonText.textContent = '复制成功';
      }

      button.disabled = true;
      button.classList.add('is-copied');
      setTimeout(reset, 1800);
    });
  })();
</script>
