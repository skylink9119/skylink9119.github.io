---
title: 2026年R76S安装配置PassWall2全流程：VLESS REALITY Vision国内外分流
date: 2026-09-03 21:51:00
updated: 2026-09-04 21:02:40
tags: [R76S, iStoreOS, PassWall2, Xray, VLESS, REALITY, Vision]
categories: [技术教程, 网络链路]
keywords: R76S PassWall2教程,iStoreOS安装PassWall2,aarch64_generic,VLESS REALITY Vision,PassWall2国内外分流,Xray分流教程
description: R76S 与 iStoreOS 24.10.8 安装配置 PassWall2 26.9.2 全流程，覆盖 ARM64 依赖、中文包、Xray Core、自建 VLESS REALITY Vision 节点、CN 国内直连分流和常见故障排查。
ai: 本文从零演示 R76S 安装 PassWall2、配置 Xray VLESS REALITY Vision 自建节点，并实现国内直连、其他流量代理，附 OpenClash 冲突处理、DNS、FakeDNS、备份和重装方法。
aside: true
toc: true
---

<div class="passwall2-video-container">
  <iframe
    src="https://www.youtube.com/embed/bK5zV9IRT90"
    title="R76S 上安装和配置 PassWall2：VLESS REALITY Vision 国内外分流视频教程"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

<style>
.passwall2-video-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}
.passwall2-video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}
</style>

{% btn 'https://youtu.be/bK5zV9IRT90', ' 在 YouTube 观看完整视频 ', 'fab fa-youtube', 'red larger' %}
{% btn 'https://www.youtube.com/@guo1986', ' 订阅 Skyline YouTube 频道 ', 'fab fa-youtube', 'blue larger' %}

> 本文适用于 FriendlyElec NanoPi R76S、iStoreOS 24.10.8、OPKG 软件包管理器，以及 `aarch64_generic` 架构。示例版本为 PassWall2 26.9.2，节点为自建 VLESS + REALITY + `xtls-rprx-vision`。
>
> 发布时间：2026-09-03

本文的下载地址固定到 26.9.2-1，以保证前端、中文包和依赖版本相互匹配。未来使用新版本时，应从官方 Releases 同一版本页面下载全部文件，不要混装不同版本的前端和依赖。

## 最终效果

完成本文后，路由器将实现：

- 国内域名和国内 IP 直接连接；
- 其他流量通过自建的 VLESS REALITY 节点；
- 路由器本机和局域网设备自动使用透明代理；
- 不需要在手机、电脑、电视上逐台设置代理；
- OpenClash 可以保留安装，但不会与 PassWall2 同时运行。

<!-- more -->

## 一、开始前需要准备什么

你需要准备以下信息：

- VPS 地址，可以是 IP 或域名；
- 服务端监听端口；
- VLESS UUID；
- REALITY 公钥；
- REALITY Short ID；
- SNI，也就是服务端 `serverNames` 中使用的域名；
- 服务端流控为 `xtls-rprx-vision`。

安全提醒：完整的 `vless://` 链接和 UUID 相当于访问凭据，不要公开到博客、截图或聊天记录中。客户端只需要 REALITY 公钥，绝对不要把服务端的 REALITY 私钥填入路由器。

## 二、确认设备架构

通过 iStoreOS 的“系统 → 终端”执行：

```sh
cat /etc/openwrt_release
opkg print-architecture
```

R76S 在本文环境下应该能看到：

```text
aarch64_generic
```

R76S 使用 Rockchip RK3576，是 64 位 ARM 设备，OpenWrt 目标为 `rockchip/armv8`。不要下载 `x86_64`、`aarch64_cortex-a53` 或其他架构的软件包，也不要使用 `--force-architecture` 强制安装。

参考：[OpenWrt NanoPi R76S 硬件资料](https://openwrt.org/toh/hwdata/friendlyarm/friendlyarm_nanopi_r76s)

## 三、避免与 OpenClash 冲突

OpenClash 和 PassWall2 可以同时安装，但不要同时开启透明代理。两者都会修改 DNS、dnsmasq 和 Firewall4/NFTables 规则，同时运行容易出现断网、DNS 异常或流量重复转发。

如果当前正在运行 OpenClash，先执行：

```sh
/etc/init.d/openclash stop
/etc/init.d/openclash disable
```

这不会卸载 OpenClash，只是停止服务并关闭开机启动。以后想换回 OpenClash，应先关闭 PassWall2。

## 四、更新软件包列表

执行：

```sh
opkg update
```

看到多个 `Signature check passed.` 即表示软件源签名验证正常。最后若仅出现下面这种清理锁文件警告，一般不影响更新结果：

```text
opkg_conf_deinit: Couldn't unlink /var/lock/opkg.lock: No such file or directory
```

## 五、安装 PassWall2 依赖

PassWall2 的 LuCI 前端包是 `all.ipk`，但 `tcping`、`geoview` 等依赖仍然必须与 CPU 架构匹配。OpenWrt 官方源通常没有这些 PassWall2 专用依赖，因此从 PassWall2 官方发行版下载 `aarch64_generic` 依赖包。

先创建临时目录：

```sh
mkdir -p /tmp/pw2-install
cd /tmp/pw2-install
```

下载安装包：

```sh
wget -O passwall-deps.zip 'https://github.com/Openwrt-Passwall/openwrt-passwall2/releases/download/26.9.2-1/passwall_packages_ipk_aarch64_generic.zip'
```

解压：

```sh
unzip -o passwall-deps.zip
```

如果提示 `unzip: not found`，先安装解压工具：

```sh
opkg install unzip
unzip -o passwall-deps.zip
```

安装必要依赖：

```sh
opkg install ./tcping_0.3-r1_aarch64_generic.ipk
opkg install ./geoview_0.2.6-r1_aarch64_generic.ipk
```

不要一次安装压缩包里的全部代理核心。本文只使用 Xray，其他 Shadowsocks 服务端、旧协议核心没有必要占用存储空间。

## 六、安装 PassWall2 和简体中文包

下载 PassWall2：

```sh
wget -O passwall2.ipk 'https://github.com/Openwrt-Passwall/openwrt-passwall2/releases/download/26.9.2-1/luci-app-passwall2_26.9.2-r1_all.ipk'
```

下载简体中文语言包：

```sh
wget -O passwall2-zh-cn.ipk 'https://github.com/Openwrt-Passwall/openwrt-passwall2/releases/download/26.9.2-1/luci-i18n-passwall2-zh-cn_26.9.2_all.ipk'
```

依次安装：

```sh
opkg install ./passwall2.ipk
opkg install ./passwall2-zh-cn.ipk
```

清理 LuCI 菜单缓存并重启后台服务：

```sh
rm -f /tmp/luci-indexcache
/etc/init.d/rpcd restart
```

刷新 iStoreOS 页面，进入“服务 → PassWall2”。安装文件均来自 [PassWall2 官方 26.9.2-1 发行版](https://github.com/Openwrt-Passwall/openwrt-passwall2/releases/tag/26.9.2-1)。

## 七、安装 Xray Core

仅安装 PassWall2 前端后，“节点类型”下拉框可能是空的，因为 PassWall2 只有检测到核心程序后才显示对应的节点类型。

进入：

```text
PassWall2 → 组件更新
```

找到“Xray 版本”一行：

1. 保持 Xray 程序路径为 `/usr/bin/xray`；
2. 点击“点击更新”；
3. 等待安装完成，不要中途刷新页面；
4. 确认“Xray 版本【无】”变成具体版本号，例如 `26.7.28`。

对于单个 VLESS REALITY Vision 节点，不需要额外安装 Sing-box。Sing-box 更适合 TUIC、AnyTLS、SSH 或混合多协议订阅。

## 八、手动添加 VLESS REALITY Vision 节点

进入：

```text
PassWall2 → 节点列表 → 添加
```

填写以下参数：

| PassWall2 字段 | 填写内容 |
|---|---|
| 节点备注 | 自定义，例如 `dmit` |
| 别名 | 保持 `default` |
| 类型 | `Xray` |
| 协议 | `VLESS` |
| 地址 | VPS 的 IP 或域名 |
| 端口 | 服务端监听端口，例如 `443` |
| ID | VLESS UUID |
| 加密方式 encryption | `none` |
| flow | `xtls-rprx-vision` |
| TLS | 开启 |
| REALITY | 开启 |
| SNI 域名 | 服务端 `serverNames` 中的域名，不带 `https://` 和端口 |
| Public Key | 服务端生成的 REALITY 公钥 |
| Short ID | 服务端 `shortIds` 中使用的值，不带 `0x` |
| Spider X | `/` |
| Finger Print | `chrome` |
| 传输方式 | `RAW (TCP)` |
| 伪装类型 | `none` |
| Mux | 关闭 |
| ML-DSA-65 | 未专门配置时关闭 |

当前版本的 PassWall2 将普通 TCP 显示为 `RAW (TCP)`，这是正常现象。字段定义可在 [PassWall2 官方 Xray 节点配置源码](https://github.com/Openwrt-Passwall/openwrt-passwall2/blob/main/luci-app-passwall2/luasrc/model/cbi/passwall2/client/type/2_xray.lua) 中核对。

填写完成后点击“保存并应用”。

## 九、先验证单节点能否连接

在配置分流前，先确认节点本身可用。这样出现问题时，能够区分是节点参数错误还是分流规则错误。

进入“基本设置”，设置：

- 主开关：开启；
- 节点：直接选择 `Xray VLESS：[dmit]`；
- 路由器本机代理：开启；
- 客户端代理：开启；
- 节点 Socks 监听端口：保持 `1070`；
- 节点 Socks 本机监听：保持开启；
- Socks 主开关：不需要开启。

点击“保存并应用”，等待顶部显示“Core 运行中”，然后测试 Google 和 GitHub 连接。

注意：节点列表中的 TCP Ping 只代表服务器端口能够连接，不代表 UUID、REALITY 公钥、SNI 和 Short ID 一定正确。最终要以 Core 正常运行和 URL 测试成功为准。

如果单节点无法连接，先不要继续配置分流，直接查看本文后面的故障排查部分。

## 十、更新 GeoIP 和 GeoSite 规则

国内外分流依赖 GeoIP 和 GeoSite 数据。进入“规则管理”中的规则更新区域：

- GeoIP 更新 URL：选择 `Loyalsoldier/geoip`；
- Geosite 更新 URL：选择 `Loyalsoldier/geosite`；
- Geo 资源文件目录：保持默认；
- 执行一次手动更新。

如果 GitHub 下载失败，再选择带 `(CDN)` 的版本。不要选择标有 `(IR)` 或 `(RU)` 的规则，它们分别面向伊朗和俄罗斯。

## 十一、创建“国内直连、其他代理”的分流节点

进入：

```text
PassWall2 → 节点列表 → 添加
```

设置：

| 字段 | 选择 |
|---|---|
| 节点备注 | `国内外分流` |
| 别名 | `default` |
| 类型 | `Xray` |
| 协议 | `分流` |
| 分流规则组 | `CN` |
| Domain Strategy | `IPOnDemand` |
| Domain Matcher | `hybrid` |
| 直连 DNS 结果写入 IPSet | 开启 |
| GeoIP 数据解析 | 开启 |
| FakeDNS 主开关 | 关闭 |

在页面下方的规则表中设置：

| 规则 | 节点选择 |
|---|---|
| CN | `直连` |
| DirectFront | `直连` |
| DirectGame | `直连` |
| ProxyFront | `使用默认节点` |
| ProxyGame | `使用默认节点` |
| 默认 | `Xray VLESS：[dmit]` |

FakeDNS 和前置代理全部保持关闭，然后点击“保存并应用”。

PassWall2 默认 `CN` 规则使用 `geosite:cn` 和 `geoip:cn`，用于匹配国内域名与国内 IP。默认规则可参考 [PassWall2 官方默认配置](https://github.com/Openwrt-Passwall/openwrt-passwall2/blob/main/luci-app-passwall2/root/usr/share/passwall2/0_default_config)。

## 十二、启用国内外分流

回到“基本设置”，把“节点”从具体的 dmit 节点改为：

```text
Xray 分流：[国内外分流]
```

确认以下开关：

- 主开关：开启；
- 路由器本机代理：开启；
- 客户端代理：开启；
- Socks 主开关：关闭。

点击“保存并应用”。

测试以下网站：

- 国内直连：百度、淘宝、哔哩哔哩；
- 代理访问：Google、GitHub；
- 在运行日志中确认国内域名命中 `CN` 或直连规则。

如果直接在“基本设置”里选择 `Xray VLESS：[dmit]`，未匹配分流规则的所有流量都会使用该节点，国内网站可能明显变慢。日常使用应选择刚创建的“国内外分流”节点。

## 十三、DNS 和 FakeDNS 怎么设置

第一次配置时建议保持 DNS 页面的默认值，不要同时修改太多选项。

建议：

- FakeDNS：关闭；
- 直连 DNS：保持系统默认或使用可靠的国内 DNS；
- 远程 DNS：保持 PassWall2 默认值；
- 浏览器若单独启用了“安全 DNS”，出现解析异常时可暂时关闭后测试。

FakeDNS 适合流媒体 DNS 解锁、需要让远端节点获取目标域名、或特殊 DNS 优化场景。单个 VLESS REALITY 节点的普通国内外分流不需要开启 FakeDNS，贸然开启反而可能增加排查难度。

## 十四、Socks 配置是什么

PassWall2 页面底部还有一个独立的“Socks 配置”。它用于给电脑或其他软件提供显式 SOCKS5 地址，例如：

```text
路由器IP:1081
```

这不是透明代理的必要功能。只要“主开关”和“客户端代理”已经开启，局域网设备就会自动经过 PassWall2。Socks 行显示红色 `X`，通常只是因为“Socks 主开关”没有开启，并不代表主透明代理故障。

## 十五、常见问题排查

### 1. 安装时提示缺少 tcping 或 geoview

确认架构：

```sh
opkg print-architecture
```

必须包含 `aarch64_generic`。然后重新执行本文第五部分的依赖安装命令。不要使用 `--force-architecture`。

### 2. “类型”下拉框是空的

原因通常是 Xray Core 尚未安装。进入“组件更新”，安装 Xray。程序路径保持：

```text
/usr/bin/xray
```

### 3. Core 显示“未运行”

先关闭主开关，避免全网断线，然后查看：

```sh
tail -n 100 /tmp/log/passwall2.log
logread | grep -i passwall2 | tail -n 100
```

重点检查：

- UUID 是否正确；
- 地址和端口是否正确；
- SNI 是否与服务端 `serverNames` 一致；
- Public Key 是否误填成服务端私钥；
- Short ID 是否一致；
- flow 是否为 `xtls-rprx-vision`；
- 传输方式是否为 `RAW (TCP)`。

### 4. 开启后整个局域网无法上网

先恢复网络：

```sh
/etc/init.d/passwall2 stop
```

然后检查：

- OpenClash 是否仍在运行；
- 基本设置是否选择了无效的示例节点；
- Xray Core 是否已经安装；
- 单节点是否通过 URL 测试；
- 运行日志中的第一条实际错误。

### 5. 国外网站正常，但国内网站很慢

通常是国内流量也经过了境外节点。检查：

- 基本设置应选择 `Xray 分流：[国内外分流]`，而不是直接选择 dmit；
- `CN`、`DirectFront`、`DirectGame` 必须设置为“直连”；
- GeoIP 和 GeoSite 是否更新成功；
- OpenClash 是否已停止。

### 6. 百度正常，Google/GitHub 不通

这通常说明路由器本身能联网，但代理节点未成功工作。先把基本节点改成具体的 dmit 节点进行单节点测试，再查看运行日志。不要一开始就同时排查 DNS、FakeDNS 和分流规则。

## 十六、备份配置

配置成功后建议立即备份：

```sh
cp /etc/config/passwall2 /etc/config/passwall2.backup
```

该文件包含节点访问参数，应避免公开。升级前也建议通过 PassWall2 的维护页面导出配置。

## 十七、卸载和干净重装

普通卸载可能保留被修改过的 `/etc/config/passwall2`，因此重新安装后旧问题仍可能存在。需要干净重装时，先确认已经记录节点参数。

备份并卸载：

```sh
[ -f /etc/config/passwall2 ] && cp /etc/config/passwall2 /etc/config/passwall2.before-reinstall.bak

/etc/init.d/passwall2 stop 2>/dev/null
opkg remove luci-i18n-passwall2-zh-cn
opkg remove luci-app-passwall2

rm -f /etc/config/passwall2
rm -rf /tmp/etc/passwall2
rm -f /tmp/log/passwall2.log
rm -f /tmp/log/passwall2_server.log
rm -f /tmp/luci-indexcache

/etc/init.d/rpcd restart
```

然后重新执行本文第五、六、七部分。`tcping`、`geoview` 和 `/usr/bin/xray` 可以保留复用，不必每次删除。

## 十八、核心选择建议

对于本文的自建 VLESS REALITY Vision 节点，建议使用 Xray：

- REALITY 和 Vision 配置直接；
- 只需要一个核心，结构更简单；
- 减少不必要的软件包和排查变量。

以下情况再考虑 Sing-box：

- 使用 TUIC、AnyTLS 或 SSH 节点；
- 同时使用多个不同协议，希望由一个核心统一处理；
- 某个节点明确要求 Sing-box；
- 相同配置在 Xray 上存在兼容问题，需要替代核心测试。

PassWall2 当前支持的核心和协议列表可参考 [官方项目说明](https://github.com/Openwrt-Passwall/openwrt-passwall2#-features)。

## 结语

R76S 的性能足以运行 PassWall2，实际稳定性更多取决于正确的软件包架构、节点参数、DNS 和分流规则。最稳妥的配置顺序始终是：

```text
确认架构
→ 安装依赖与前端
→ 安装 Xray Core
→ 验证单节点
→ 更新 GeoIP/GeoSite
→ 创建 CN 分流
→ 最后再调整 DNS 或高级功能
```

遇到问题时先关闭 PassWall2 恢复网络，再查看运行日志中的第一条错误。不要同时开启 OpenClash，也不要在基础连接尚未验证前启用 FakeDNS、前置代理或复杂规则。

## 资料来源

- [PassWall2 官方项目](https://github.com/Openwrt-Passwall/openwrt-passwall2)
- [PassWall2 26.9.2-1 官方发行版](https://github.com/Openwrt-Passwall/openwrt-passwall2/releases/tag/26.9.2-1)
- [PassWall2 Xray 节点配置源码](https://github.com/Openwrt-Passwall/openwrt-passwall2/blob/main/luci-app-passwall2/luasrc/model/cbi/passwall2/client/type/2_xray.lua)
- [PassWall2 默认分流配置](https://github.com/Openwrt-Passwall/openwrt-passwall2/blob/main/luci-app-passwall2/root/usr/share/passwall2/0_default_config)
- [OpenWrt NanoPi R76S 硬件资料](https://openwrt.org/toh/hwdata/friendlyarm/friendlyarm_nanopi_r76s)
