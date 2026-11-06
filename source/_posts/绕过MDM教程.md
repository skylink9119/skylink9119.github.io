---
title: 2026 macOS MDM 远程管理教程：恢复模式、脚本核对与排错
date: 2026-03-04
updated: 2026-11-06 22:48:19
tags: [macOS, MDM, 系统工具]
categories: [技术教程]
description: 区分 Mac 远程管理与激活锁，整理组织释放、恢复模式准备、第三方脚本固定版本核对，以及磁盘、账户和重启后再次注册的排错方法。
keywords: macOS, MDM, 远程管理, 激活锁, 恢复模式, Apple Silicon, Intel Mac
---

<h1 id="2026-最新-macOS-MDM-远程管理（Remote-Management）绕过全攻略">macOS MDM 远程管理：先判断，再处理</h1>
<p><strong>更新：2026 年 11 月 6 日。</strong>重装 Mac 后出现 Remote Management，先确认屏幕显示的组织、设备来源和管理方式。本文整理官方解除路径、恢复模式准备、原教程使用的第三方脚本及排错方法；脚本仅完成源码核对，未在各型号、各 macOS 版本上逐一实测，不承诺通用或永久生效。</p>
<blockquote><p>仅在你拥有并获准调整管理状态的设备上操作。公司、学校在用设备请联系管理员；二手设备请先让卖家完成组织释放与交接。修改前备份数据，恢复模式下的磁盘操作可能影响账户和文件。</p></blockquote>
<h2 id="identify">1. 先区分远程管理、激活锁与磁盘密码</h2>
<table><thead><tr><th>看到的提示</th><th>优先处理方式</th></tr></thead><tbody>
<tr><td>Remote Management，显示公司或学校名称</td><td>向该组织或卖家核实自动设备注册状态，要求完成管理解除与设备交接。</td></tr>
<tr><td>要求原 Apple 账户激活</td><td>这是激活锁问题，需由原账户持有人或具备相应权限的组织处理，不能套用本文的本地脚本。</td></tr>
<tr><td>磁盘被锁定、要求用户密码或恢复密钥</td><td>先解锁磁盘；不要把 FileVault 密码、固件密码与 MDM 当成同一种问题。</td></tr>
</tbody></table>
<p>激活锁与设备管理有不同的处理机制，参见 <a href="https://support.apple.com/guide/deployment/activation-lock-depf4ab94ef1/web" target="_blank" rel="noopener noreferrer">Apple：Apple 设备上的激活锁</a>。仅仅能够进入桌面，也不能证明设备已从原组织释放。</p>
<h2 id="official-release">2. 能联系原组织时，先走官方解除流程</h2>
<ol><li>记录设备序列号与屏幕上的组织名称，通过私下渠道联系卖家或管理员。</li><li>请组织核查 MDM 和 Apple Business／Apple School Manager 中的设备记录，完成对应的退役、解除管理与组织释放。只删除一个本地账户不等于完成交接。</li><li>如涉及激活锁，应先由有权限的人员处理，再释放设备。</li><li>获得释放确认并备份数据后，再按管理员与 Apple 的指引抹掉、恢复设备，联网完成设置并核对结果。</li></ol>
<p>Apple 的设备释放说明要求由具备权限的人员操作，并指出释放后需要抹掉和恢复设备。参见 <a href="https://support.apple.com/guide/business/release-devices-axmec4d28461/1/web/1" target="_blank" rel="noopener noreferrer">Apple Business：释放设备</a>。</p>
<p>如果已经能进入桌面，可在<strong>系统设置 → 通用 → 设备管理</strong>查看描述文件。能否移除取决于管理方式；没有移除权限时应联系管理员。参见 <a href="https://support.apple.com/en-euro/guide/mac-help/mh35474/27/mac/27" target="_blank" rel="noopener noreferrer">Apple：更改设备管理设置</a>。</p>
<h2 id="recovery">3. 恢复模式准备：先确认目标磁盘</h2>
<ul><li><strong>Apple 芯片 Mac：</strong>完全关机后按住电源按钮，出现启动选项后选择“选项 → 继续”。</li><li><strong>Intel Mac：</strong>开机或重启时立即按住 Command（⌘）+ R。</li><li>按提示选择管理员并解锁磁盘；下载文件需要可用网络。在顶部菜单选择“实用工具 → 终端”。</li></ul>
<p>参见 <a href="https://support.apple.com/en-sg/102518" target="_blank" rel="noopener noreferrer">Apple：从 macOS 恢复功能启动</a>。进入恢复模式的方法与第三方脚本能否在该系统运行是两回事。</p>
<p>可先执行以下只读命令，记录系统卷与数据卷，确认不是外接备份盘。卷名不一定是 Macintosh HD。</p>
<pre><code class="language-bash">diskutil list
ls /Volumes</code></pre>
<p>磁盘未挂载或加密未解锁时，先在磁盘工具中核对目标卷；不要靠反复重命名、抹盘或删除目录来尝试消除报错。</p>
<h2 id="script">4. 原教程的第三方脚本：固定版本并分步检查</h2>
<p>原教程引用的是 <a href="https://github.com/assafdori/bypass-mdm" target="_blank" rel="noopener noreferrer">assafdori/bypass-mdm</a>，不是 Apple 官方工具。本次核对固定提交 <code>60583be37d41f314cb04a99e260071fc31a2eaf4</code> 中的 <code>bypass-mdm-v2.sh</code>，避免直接执行随时变化的 main 分支。</p>
<p>源码会尝试识别卷、创建本地管理员、修改 hosts 与本地设置标记，并可能把数据卷改名为 Data。它不会替原组织完成服务器端的设备释放。运行前应查看完整源码，确认目标卷、已有账户与备份；多系统、多数据卷或已有重要数据的环境不宜照搬。</p>
<p><strong>第一步：只下载，不执行。</strong></p>
<pre><code class="language-bash">curl -fL --proto '=https' --connect-timeout 15 --max-time 120 \
  'https://raw.githubusercontent.com/assafdori/bypass-mdm/60583be37d41f314cb04a99e260071fc31a2eaf4/bypass-mdm-v2.sh' \
  -o bypass-mdm.sh</code></pre>
<p><strong>第二步：核对文件。</strong>以下摘要仅对应上述固定版本。必须看到校验通过；如果缺少 shasum、下载失败或摘要不符，先停止，不要继续执行。</p>
<pre><code class="language-bash">printf '%s  %s\n' \
  '1aa477aad2ee4b2dbf2e59214dee05b73c81b392d74f89ac341db77597a98256' \
  'bypass-mdm.sh' | shasum -a 256 -c -</code></pre>
<p>摘要一致仅证明文件与本次核对版本一致，不代表兼容性或执行安全保证。阅读源码后，才决定是否继续：</p>
<pre><code class="language-bash">cat bypass-mdm.sh</code></pre>
<p><strong>第三步：仅在授权、备份和源码核对都完成后运行。</strong></p>
<pre><code class="language-bash">bash bypass-mdm.sh</code></pre>
<p>该固定版本的选项 1 为 <code>Bypass MDM from Recovery</code>。以实际显示的系统卷、数据卷和提示为准；信息不符就取消。临时管理员应使用不与已有账户冲突的用户名和独立强密码，不使用旧文推荐的 <code>1234</code>。脚本可能显示输入的密码，不要公开完整终端截图。</p>
<p>脚本打印成功不代表每一步都成功。保留并核对 warning／error；无法判断时停止，把报错行、macOS 版本和磁盘布局整理给可信的技术人员，隐去密码、序列号和个人信息。</p>
<h2 id="after-restart">5. 重启后核对与账户整理</h2>
<ul><li>确认预期账户可以登录，并核查“系统设置 → 通用 → 设备管理”中的实际状态。</li><li>确认个人管理员能正常登录、数据可访问，且 FileVault 解锁与恢复方式可用，再决定是否删除临时账户。不要先删掉唯一可用的管理员。</li><li>如果再次出现注册界面，回到原组织核实设备释放状态，不能把本地脚本的成功提示当成永久解除证明。</li></ul>
<p>Apple 说明，macOS 14 或更高版本上，仍登记在组织且初次设置时未注册管理的 Mac 可能显示全屏注册体验。因此旧文“一次运行即可彻底解决”的表述不适合作为保证。参见 <a href="https://support.apple.com/guide/deployment/automated-device-enrollment-management-dep73069dd57/1/web" target="_blank" rel="noopener noreferrer">Apple：自动设备注册与设备管理</a>。</p>
<h2 id="troubleshooting">6. 常见报错如何处理</h2>
<table><thead><tr><th>现象</th><th>检查方向</th></tr></thead><tbody>
<tr><td>Could not resolve host</td><td>检查恢复模式网络与 DNS，确认能访问下载地址。不要通过关闭 HTTPS 证书验证来解决。</td></tr>
<tr><td>curl 返回错误、下载到网页或校验失败</td><td>停止执行，检查网络和固定链接，重新下载后再校验；不要运行空文件或 HTML 页面。</td></tr>
<tr><td>Could not detect system/data volume</td><td>检查是否在恢复模式、系统是否已安装、正确卷是否解锁挂载；多卷环境需人工核对。</td></tr>
<tr><td>Read-only file system / Permission denied</td><td>记录具体路径并核对卷与权限；仅看到“只读”不足以判断应采取何种修改。</td></tr>
<tr><td>用户名已存在或账户创建失败</td><td>不要覆盖已有账户；先检查目标数据卷与冲突账户。</td></tr>
<tr><td>联网、更新或重装后又提示管理</td><td>核对组织登记状态与完整日志，不再沿用“补一行 hosts 就能永久解决”的结论。</td></tr>
</tbody></table>
<h2 id="used-mac">7. 二手 Mac 交接检查</h2>
<p>要求卖家确认组织释放和激活锁状态，保留购买与交接凭证，联网完成设置后再验收。能进入桌面、没有立即弹窗或卖家演示脚本成功，都不能单独替代这一步。具体兼容性必须按实际机型与 macOS 版本验证；本文没有覆盖所有 Apple 芯片与 Intel Mac 的实测矩阵。</p>
<h2 id="video">观看更多视频教程</h2>
<p>更多 macOS、VPS 与服务器运维实操内容，请访问 <a href="https://www.youtube.com/@SKYBYTE9119" target="_blank" rel="noopener noreferrer">SKYBYTE YouTube 技术频道</a>。</p>
