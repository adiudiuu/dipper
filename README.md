# 七政

三维轨道 + 侧栏读数，让**农历、节气、星象**一眼可见；借此了解古人观天授时的智慧。

定位：**教学向历象观天**，不是算命 App。

**技术栈：** Vue 3 · Vite · Three.js · Vue Router · MIT

## 「七政」释义

出典：《尚书·舜典》「璇玑玉衡，以齐七政」。通常**七政**指**日、月**与**金、木、水、火、土**五星。本站以此为名，做轨道与历法对照，供观象与学习。

## 本地运行

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

开发默认端口：`5173`。

## 操作摘要

- **三维：** 左键旋转 · 右键/中键平移 · 滚轮缩放 · Shift 拨日
- **日期：** 顶栏选公历；`←` / `→` 换日（Shift 为 ±30 日）
- **星象：** 西象 / 古象纲 / 古象繁 / 全部；古象可显名或隐名
- **历象：** 右侧面板可收起；含公历、农历·道历·岁星、节气·月相、节日列表
- **默认：** 一键恢复日期、相机、星象与面板初始态

## 路由（加新页）

路由集中在 `src/router/index.js`（`createWebHistory`）。

1. 在 `src/views/` 新建 `XxxView.vue`
2. 在 `routes` 增加一项，例如：

```js
{ path: '/about', name: 'about', component: () => import('../views/AboutView.vue') }
```

当前 `/` → `HomeView`（主界面）。

## Cloudflare Pages

本仓库为 Vite SPA，构建产物在 `dist/`。

| 项 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 建议 18+ |

深链刷新：`public/_redirects` 已配置 `/* /index.html 200`，构建时会复制到 `dist/_redirects`，避免 SPA 深链 404。

Dashboard 新建 Pages 项目 → 连接仓库 → 填上表 Build command / Output directory 即可。

## 字体

已去掉 Google Fonts CDN。字重文件在 **`public/fonts/`**（Noto Sans/Serif SC 400/500/600、JetBrains Mono 400/500，含拉丁子集），由 `src/style.css` 的 `@font-face` 本地加载。

## 开源许可

本项目以 **MIT License** 完全开源，见根目录 [`LICENSE`](./LICENSE)。欢迎使用、修改与再分发。

## 参考

- [余钊焕·星图](https://yzhxxzxy.github.io/cn/starcharts.html)：三垣二十八宿等名表/连线人工对照用，非可编程数据源。
- [Celestial Dial · 星盘年月日](https://lab.est.im/celestial_dial/)：历象/授时交互示意参考，非星官名表校对源。
