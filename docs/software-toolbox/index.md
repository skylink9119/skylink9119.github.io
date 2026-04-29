---
title: VPS 与部署软件工具箱
layout: page
description: 汇总 VPS 搭建、SSH 连接、文件传输、代码编辑、Docker 部署与 API 调试常用软件的官方下载入口，方便新手统一下载。
keywords: VPS工具箱,SSH工具下载,部署软件工具箱,Docker下载,VS Code下载,WinSCP下载,Termius下载
top_img: false
---

<div class="software-toolbox-hero">
  <div class="software-toolbox-hero__eyebrow">Official Downloads</div>
  <h1>VPS 与部署软件工具箱</h1>
  <p>下面这些链接我都优先整理成了官网或官方文档入口，方便你在搭建 VPS、部署项目、调试 API 时统一下载，不用再到处翻第三方镜像站。</p>
</div>

<div class="software-toolbox-nav">
  <a href="#terminal-ssh">终端与 SSH</a>
  <a href="#file-transfer">文件传输</a>
  <a href="#editor-tools">编辑器与代码工具</a>
  <a href="#docker-api">Docker 与 API 调试</a>
  <a href="#openclaw-tools">OpenClaw 部署相关</a>
  <a href="#windows-guide">Windows 下载说明</a>
  <a href="#mac-guide">Mac 下载说明</a>
  <a href="#openclaw-checklist">OpenClaw 安装后清单</a>
</div>

> 说明：下面优先放“官方站点”或“官方文档下载页”。这样后续版本更新时，你点进去通常都还是最新版本。

<div id="terminal-ssh"></div>

## 终端与 SSH

<div class="software-toolbox-grid">
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux / iOS / Android</div>
    <h3>Termius</h3>
    <p>适合新手的 SSH 客户端，支持多端同步、密钥管理和 SFTP，拿来连 VPS 很省心。</p>
    <a class="software-toolbox-card__link" href="https://termius.com/download" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows</div>
    <h3>Windows Terminal</h3>
    <p>Windows 下很好用的官方终端，适合搭配 PowerShell、WSL 和 SSH 一起用。</p>
    <a class="software-toolbox-card__link" href="https://apps.microsoft.com/detail/9n0dx20hk701?hl=en-US&gl=US" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">macOS</div>
    <h3>iTerm2</h3>
    <p>macOS 上非常经典的终端替代品，功能比系统自带 Terminal 更完整。</p>
    <a class="software-toolbox-card__link" href="https://iterm2.com/downloads.html" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Warp</h3>
    <p>更现代的终端界面，适合喜欢更强交互体验和 AI 辅助命令行的人。</p>
    <a class="software-toolbox-card__link" href="https://www.warp.dev/download" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
</div>

<div id="file-transfer"></div>

## 文件传输与 SFTP

<div class="software-toolbox-grid">
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows</div>
    <h3>WinSCP</h3>
    <p>Windows 上最常见的 SFTP / SCP / FTP 文件传输工具之一，传配置、改文件都很方便。</p>
    <a class="software-toolbox-card__link" href="https://winscp.net/eng/download.php" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS</div>
    <h3>Cyberduck</h3>
    <p>适合喜欢更简洁界面的用户，支持 SFTP、WebDAV 和常见云存储。</p>
    <a class="software-toolbox-card__link" href="https://cyberduck.io/download/" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>FileZilla Client</h3>
    <p>老牌文件传输工具，FTP / SFTP 兼容性不错，很多用户都用过。</p>
    <a class="software-toolbox-card__link" href="https://filezilla-project.org/download.php?type=client" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
</div>

<div id="editor-tools"></div>

## 编辑器与代码工具

<div class="software-toolbox-grid">
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Visual Studio Code</h3>
    <p>改配置、写脚本、远程开发和部署项目时都很好用，也是我最推荐的新手编辑器之一。</p>
    <a class="software-toolbox-card__link" href="https://code.visualstudio.com/download" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Git</h3>
    <p>部署项目、拉代码、同步更新时几乎一定会用到。Windows 建议装官方安装包，Linux 建议直接包管理器安装。</p>
    <a class="software-toolbox-card__link" href="https://git-scm.com/downloads.html" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">macOS / Linux</div>
    <h3>Homebrew</h3>
    <p>macOS 上非常好用的包管理器，很多开发和部署工具都能直接一条命令装好。</p>
    <a class="software-toolbox-card__link" href="https://brew.sh/" target="_blank" rel="noopener nofollow">官网安装页</a>
  </div>
</div>

<div id="docker-api"></div>

## Docker 与 API 调试

<div class="software-toolbox-grid">
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Docker Desktop</h3>
    <p>本地开发容器和部署前测试最常用。个人、小团队和教育场景通常够用，大企业请先看官方授权说明。</p>
    <a class="software-toolbox-card__link" href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Postman</h3>
    <p>调试接口、测试 API Key、验证部署后的接口响应时很常用。</p>
    <a class="software-toolbox-card__link" href="https://www.postman.com/downloads/" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
</div>

<div id="openclaw-tools"></div>

## 部署 OpenClaw 会用到的软件

<div class="software-toolbox-grid">
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Node.js</h3>
    <p>OpenClaw 本地安装和很多相关命令都依赖 Node.js。按 2026 年 3 月 26 日我核对到的官方页面，当前最新 LTS 是 `v24.14.1`。</p>
    <a class="software-toolbox-card__link" href="https://nodejs.org/en/download" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>pnpm</h3>
    <p>如果你后面会自己拉项目、装依赖或本地改 OpenClaw 相关前端项目，`pnpm` 会很常用。官方文档要求非独立脚本安装时系统里要先有 Node.js 18.12 以上。</p>
    <a class="software-toolbox-card__link" href="https://pnpm.io/installation" target="_blank" rel="noopener nofollow">官方安装文档</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Docker Desktop</h3>
    <p>如果你准备走容器化部署、测试镜像或后续扩展服务，Docker Desktop 会很实用。官方页面可以直接按系统下载对应版本。</p>
    <a class="software-toolbox-card__link" href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
  <div class="software-toolbox-card">
    <div class="software-toolbox-card__meta">Windows / macOS / Linux</div>
    <h3>Git</h3>
    <p>你如果要拉取仓库、同步更新、管理配置模板或自己维护工作流，Git 基本都会用到。</p>
    <a class="software-toolbox-card__link" href="https://git-scm.com/downloads/" target="_blank" rel="noopener nofollow">官方下载</a>
  </div>
</div>

## 部署 OpenClaw 前先装什么

如果你只想知道“在正式装 OpenClaw 之前，我最少应该先装什么”，那最简清单就是下面这 4 项：

1. `Node.js`
   这是运行 OpenClaw 和相关命令的基础环境。按我在 2026 年 3 月 26 日核对到的官方页面，当前最新 LTS 是 `v24.14.0`。
2. `一个终端工具`
   Windows 建议 `Windows Terminal`，macOS 建议 `iTerm2`。如果你想多端同步服务器列表，可以直接装 `Termius`。
3. `VS Code`
   用来改配置、看日志、编辑脚本最省事。
4. `pnpm`
   如果你后续会自己管理前端项目、依赖或工作区，这个非常实用。

如果你准备做得更完整，再额外加这两项：

- `Git`
- `Docker Desktop`

## 部署 OpenClaw 我最推荐的组合

### macOS

- `iTerm2 + Homebrew + Node.js + pnpm + VS Code`
- 如果你需要图形化容器管理，再补一个 `Docker Desktop`

### Windows

- `Windows Terminal + Termius + Node.js + pnpm + VS Code`
- 如果你走容器化开发，再装 `Docker Desktop`

### 只想最快跑起来

- 终端：`Termius` 或 `Windows Terminal / iTerm2`
- 运行环境：`Node.js`
- 包管理：`pnpm`
- 编辑器：`VS Code`

<div id="windows-guide"></div>

## Windows 怎么一步步下载这些软件

### 1. 下载 Node.js

1. 打开 [Node.js 官方下载页](https://nodejs.org/en/download)
2. 优先选择 `LTS` 版本
3. 在 Windows 区域下载 `Installer`
4. 双击安装包，基本一路下一步即可
5. 安装完成后打开终端，执行：

```bash
node -v
npm -v
```

如果能看到版本号，说明装好了。

### 2. 下载终端工具

你有两种更推荐的选法：

- 官方简洁路线：装 [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/install?source=recommendations)
- 多设备同步路线：装 [Termius](https://termius.com/download/windows)

如果你是纯新手，我建议：

1. 先装 `Windows Terminal`
2. 后面真的需要同步服务器列表，再补一个 `Termius`

### 3. 下载 VS Code

1. 打开 [VS Code 官方下载页](https://code.visualstudio.com/download)
2. 在 Windows 区域选择 `User Installer`
3. 下载后运行安装程序
4. 安装完成后，建议勾选“添加到 PATH”和“右键菜单打开”

### 4. 下载 pnpm

先确认你已经装好了 `Node.js`，再打开 [pnpm 官方安装文档](https://pnpm.io/installation)。

对大多数 Windows 用户来说，最直接的方法是在终端执行：

```bash
npm install -g pnpm
```

装好后执行：

```bash
pnpm -v
```

### 5. 如果你还想用 Docker

1. 打开 [Docker Desktop for Windows 官方文档](https://docs.docker.com/desktop/setup/install/windows-install/)
2. 先确认你的系统满足官方要求
3. 按官方指引启用 `WSL 2`
4. 下载并安装 Docker Desktop
5. 首次启动后接受许可协议

### 6. 如果你还要拉仓库或管理配置

直接打开 [Git 官方下载页](https://git-scm.com/downloads/)

Windows 下通常会自动跳到下载入口，装好后执行：

```bash
git --version
```

<div id="mac-guide"></div>

## macOS 怎么一步步下载这些软件

### 1. 下载 Node.js

1. 打开 [Node.js 官方下载页](https://nodejs.org/en/download)
2. 优先选择 `LTS`
3. 在 macOS 区域按你的芯片选择安装包
4. 下载 `.pkg` 或安装包后按提示安装
5. 安装完成后打开终端执行：

```bash
node -v
npm -v
```

### 2. 下载终端工具

macOS 下最推荐的两种：

- [iTerm2 官方下载页](https://iterm2.com/downloads.html)
- [Termius for macOS](https://termius.com/download/macos)

如果你只想要一个更顺手的终端，先装 `iTerm2` 就够了。  
如果你想跨设备同步主机列表，再补一个 `Termius`。

### 3. 先装 Homebrew

打开 [Homebrew 官网](https://brew.sh/)，按官方首页给出的命令安装：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

装好后执行：

```bash
brew -v
```

### 4. 下载 VS Code

1. 打开 [VS Code 官方下载页](https://code.visualstudio.com/download)
2. 在 Mac 区域按你的芯片选择 `Apple silicon` 或 `Intel`
3. 下载 `.dmg`
4. 拖到 `Applications`

### 5. 下载 pnpm

先确认 `Node.js` 已安装，再打开 [pnpm 官方安装文档](https://pnpm.io/installation)。

对大多数 macOS 用户来说，最直接的方法是：

```bash
npm install -g pnpm
```

装好后执行：

```bash
pnpm -v
```

### 6. 如果你还想用 Docker

1. 打开 [Docker Desktop for Mac 官方文档](https://docs.docker.com/desktop/setup/install/mac-install/)
2. 按你的芯片选择 `Apple silicon` 或 `Intel`
3. 下载并安装 Docker Desktop
4. 首次打开时接受协议并完成初始化

### 7. 如果你还要拉仓库或管理配置

打开 [Git 官方下载页](https://git-scm.com/downloads/)

如果你已经装了 Homebrew，也可以直接：

```bash
brew install git
```

然后执行：

```bash
git --version
```

<div id="openclaw-checklist"></div>

## OpenClaw 安装后第一步该做什么

如果你已经把 OpenClaw 装好了，建议不要急着直接开始乱配。最省事的顺序是下面这样：

### 第一步：先确认基础环境有没有装对

执行这些命令确认：

```bash
node -v
npm -v
pnpm -v
```

如果这里就报错，说明环境还没装完整，先别继续往下折腾。

### 第二步：先跑一次最基础的启动或安装验证

你应该先确认：

- OpenClaw 命令能不能正常执行
- 本地或服务器环境有没有明显报错
- 依赖有没有缺失

如果你是新手，先确保“能跑起来”，再去追求花哨配置。

### 第三步：准备 API Key

OpenClaw 本身不是模型提供商，所以你需要先准备至少一家 API：

- OpenAI
- Claude
- Gemini
- OpenRouter

建议新手先准备一家最常用的，不要一上来全接。

### 第四步：先做最小可用配置

优先完成：

- 能调用一个模型
- 能正常返回结果
- 能确认网络和权限没问题

先达到“可用”，再去做“复杂”。

### 第五步：再决定要不要继续做这些增强

你后面可以再按需补：

- `AGENTS.md`
- `SOUL.md`
- `USER.md`
- `MEMORY.md`
- Docker 化部署
- 博客与 YouTube 工作流自动化

### 我最建议的新手顺序

1. 装好 Node.js、终端、VS Code、pnpm
2. 跑通 OpenClaw
3. 接入一家 API
4. 验证能正常使用
5. 再去做助理化和工作流配置

## 我更推荐你怎么装

### Windows 用户

- 终端：优先 `Windows Terminal`，再按需装 `Termius`
- 传文件：首选 `WinSCP`
- 编辑器：`VS Code`
- 容器：`Docker Desktop`

### macOS 用户

- 终端：优先 `iTerm2`，需要多端同步时再装 `Termius`
- 包管理：先装 `Homebrew`
- 传文件：`Cyberduck`
- 编辑器：`VS Code`

### 新手最省事的一套组合

- SSH：`Termius`
- 文件传输：`WinSCP` 或 `Cyberduck`
- 编辑器：`VS Code`
- 容器：`Docker Desktop`
- API 调试：`Postman`

## 接下来可以直接看这些教程

- [VPS 专题导航](/docs/vps-setup/)
- [教程文档中心](/docs/)
