# rayu-daily

Rayu 的个人每日日记，纯静态单页应用（SPA），部署在 GitHub Pages 上，微信内可直接打开。

## 功能

- 侧边栏按月份分组展示所有日记，支持搜索
- Hash 路由（`#/YYYY-MM-DD`），可直接分享某一天的链接
- 极简 Markdown 渲染器（标题、列表、引用、代码块、链接等），零依赖
- 界面为中文，时间显示按 Asia/Shanghai（北京时间）
- 支持浅色 / 深色模式（跟随系统）
- 移动端自适应（侧边栏抽屉式展开）

## 目录结构

```
index.html          页面入口
assets/app.js       SPA 逻辑（路由、侧边栏、加载日记）
assets/markdown.js  极简 Markdown 渲染器
assets/style.css    样式
diary/*.md          日记原文（YYYY-MM-DD.md）
manifest.json       由 build.py 生成的日记索引
build.py            重新生成 manifest.json
```

## 写一篇新日记

在 `diary/` 下新建 `YYYY-MM-DD.md`（可选 YAML 简易 front matter）：

```markdown
---
title: 标题
weather: 晴
mood: 平静
---

正文……
```

然后重新生成索引并提交：

```bash
python3 build.py
```

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

GitHub Pages 从 `main` 分支根目录发布，站点地址：
https://keepline.github.io/rayu-daily/
