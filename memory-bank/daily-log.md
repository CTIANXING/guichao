# 开发日常日志

> 每个开发日结束时更新。新会话的第一条指令就是让 AI 读取本文档。

---

## 会话分享链接备份

> 电脑崩溃/闪退时，TUI 会话不可恢复。使用 `/share` 命令将对话同步到云端作为保险。

**每次子步骤完成或每日结束前**：
1. 用户在 OpenCode TUI 中手动执行 `/share`
2. 将生成的链接（如 `https://opencode.ai/s/xxxxx`）发给 AI
3. AI 将链接写入下方当日章节的「会话分享链接」字段

崩溃后可通过链接查看完整对话历史，辅助 AI 重建上下文。

---

## 会话启动模板

**每次开启 OpenCode 新会话，第一句话粘贴以下内容**：

```
加载以下记忆文档：
1. memory-bank/product-plan.md（产品规划与架构）
2. memory-bank/daily-log.md（本文档，每日进度）

当前日期：[填入日期]
上次结束于：[从下方日志中复制最新日期的最后一行]
遇到的问题：[无 / 有，描述]

请先读取这两个文件，确认当前进度，然后我们继续。
```

---

## Day 1 — 2026-06-10：工程搭建 + 基础 UI 骨架 ✅ 完成

### 计划任务

| 步骤 | 内容 | 状态 |
|------|------|------|
| 1.1 | `npx create-expo-app` 初始化项目（TypeScript），项目名 `homevault` | ✅ |
| 1.2 | 安装依赖：expo-router, expo-sqlite, zustand, react-native-reanimated, react-native-gesture-handler, async-storage, @expo/vector-icons, react-dom, react-native-web | ✅ |
| 1.3 | 配置 Expo Router 底部 Tab 导航（5 个 Tab） | ✅ |
| 1.4 | 创建 5 个占位页面文件 | ✅ |
| 1.5 | PC Web 验证 + Git 首次 commit | ✅ |
| 1.6 | 建立全局主题文件（Colors / FontSize / Radius / Shadow / Spacing）+ 5 个占位页面套用主题 | ✅ |

### 会话分享链接

- （未记录）

### 遗留问题

- zustand 安装时有 peer dependency 冲突，使用 `--legacy-peer-deps` 解决，暂不影响功能
- 3D 相关依赖（expo-gl, expo-three, three）未安装，计划 Day 4 技术验证时再装

### 本次会话创建/修改的文件

- `app.json` — 修改：添加 scheme、web 配置、应用名"归巢"
- `index.ts` — 重写为 expo-router entry
- `App.tsx` — 已删除（expo-router 不需要）
- `app/_layout.tsx` — 新建：根布局 Stack
- `app/(tabs)/_layout.tsx` — 新建：5 个 Tab + Ionicons 图标
- `app/(tabs)/index.tsx` — 新建→修改：首页，品牌展示
- `app/(tabs)/rooms.tsx` — 新建→修改：房间列表，空态卡片
- `app/(tabs)/room3d.tsx` — 新建→修改：3D 视图，空态卡片
- `app/(tabs)/search.tsx` — 新建→修改：搜索，空态卡片
- `app/(tabs)/settings.tsx` — 新建→修改：设置，空态卡片
- `constants/theme.ts` — 新建：全局主题常量（Colors, FontSize, FontWeight, Radius, Shadow, Spacing）
- `package.json` — 修改：添加依赖
- Git commit: `b814d4e` — "Day 1: 项目初始化 + Tab 导航骨架"

---

## Day 2 — 2026-06-10：数据层骨架 ✅ 完成

### 计划任务

| 步骤 | 内容 | 状态 |
|------|------|------|
| 2.1 | 实现 SQLite 数据库初始化脚本（5 张表） | ✅ |
| 2.2 | 编写 DAO 层（roomDao, storageUnitDao, itemDao） | ✅ |
| 2.3 | 编写 aiCategoryDao + settingsDao | ✅ |
| 2.4 | 首页临时 CRUD 自检脚本 | ✅ |
| 2.5 | TypeScript 检查 + Web 构建 + Git commit | ✅ |

### 会话分享链接

- （未记录）

### 遗留问题

- expo-sqlite Web 端 wasm 文件无法被 Metro 解析，新增 `metro.config.js` 添加 `assetExts: ['wasm']` 解决
- 首页 `index.tsx` 当前包含临时 CRUD 自检代码，Day 3 需替换为正式首页

### 本次会话创建/修改的文件

- `db/database.ts` — 新建：数据库单例 + 5 张表自动建表
- `db/roomDao.ts` — 新建：Room CRUD + update 动态字段
- `db/storageUnitDao.ts` — 新建：StorageUnit CRUD + getByRoomId + getChildren + 级联
- `db/itemDao.ts` — 新建：Item CRUD + getByStorageUnitId + getByCategoryId + deleteByStorageUnitId + updateCategoryIds + clearAllCategories
- `db/aiCategoryDao.ts` — 新建：AICategory CRUD + replaceAll（全量替换 + 更新 item.category_id）
- `db/settingsDao.ts` — 新建：key-value CRUD + getAll
- `app/(tabs)/index.tsx` — 修改：临时 CRUD 自检（创建→读取→更新→父子→级联→清理）
- `metro.config.js` — 新建：解决 expo-sqlite wasm 文件 Metro 打包问题
- Git commit: `5f069a3` — "Day 2: SQLite 初始化 + DAO 层"

---

## Day 3 — 2026-06-10：房间列表页 + 创建房间弹窗 ✅ 完成

### 计划任务

| 步骤 | 内容 | 状态 |
|------|------|------|
| 3.1 | 创建 Zustand roomStore（异步读写 SQLite） | ✅ |
| 3.2 | 重写房间列表页（FlatList + 空态 + FAB） | ✅ |
| 3.3 | 创建房间弹窗（名称 + 小数滑块 0.1m 精度 + 预设 + 实时线框预览） | ✅ |
| 3.4 | 首页 index.tsx 移除自检代码，恢复品牌页 | ✅ |
| 3.5 | tsc + web build + git commit | ✅ |

### 会话分享链接

- （未记录）

### 修订记录

| 修订 | 内容 |
|------|------|
| 修订1 | 隐藏高度显示（X:Z 替代 X:1:Z）；滑块改为 0.1m 精度；预设用 × 符号 |
| 修订2 | 滑块上限扩展到 12 米；Web 端用原生 `<input>` 解决实时更新 |
| 修订3 | 修复预览框不实时变形——移除 StyleSheet 中固定 `height: 100` 冲突 |
| 修订4 | 用 `onLayout` + 显式计算宽高替代 `aspectRatio`；弹窗固定 `maxWidth: 420` |

### 遗留问题

- 无

### 本次会话创建/修改的文件

- `stores/roomStore.ts` — 新建
- `components/CreateRoomModal.tsx` — 新建（历经 4 次修订）
- `app/(tabs)/rooms.tsx` — 重写
- `app/(tabs)/index.tsx` — 修改
- `package.json` — 修改：新增 `@react-native-community/slider`
- `metro.config.js` — 修改
- Git commits: `a573923` → `302bcd5` → `f998de9` → `c8dfce8` → `8ee25be`
- GitHub push: ✅ `main` 分支已推送

---

## Day 4 — 2026-06-10：3D 技术验证 ✅ 通过

### 计划任务

| 步骤 | 内容 | 状态 |
|------|------|------|
| 4.1 | 安装 expo-gl / expo-three / three | ✅ |
| 4.2 | 在 room3d.tsx 渲染可旋转立方体 + 触摸旋转 (PanResponder) | ✅ |
| 4.3 | Web 构建验证 | ✅ 992 modules, bundle 2.7MB |
| 4.4 | 记录结果 + git commit + push | ✅ |

### 会话分享链接

- https://opncd.ai/share/OZe65QBT

### 技术验证结论

**expo-gl + expo-three + three.js 三者串联成功**：Web 端编译通过，bundle 无报错。立方体 + 线框 + 网格地面 + 双光源（环境光 + 方向光）+ PanResponder 手势旋转均已实现。

- three.js 警告仅涉及未使用的 loaders（ObjLoader/GLTFLoader 等），不影响核心功能
- Web bundle 从 1.7MB 增至 2.7MB（+1MB 为 three.js），在可接受范围
- **Plan B（Skia 2.5D）暂不需要**，继续走 3D 路线

### 遗留问题

- 需在真机上验证 3D 帧率（Day 5 之后）

### 本次会话创建/修改的文件

- `components/CubeDemo.tsx` — 新建：GLView + Three.js 场景（立方体、光照、网格地面、PanResponder 旋转）
- `app/(tabs)/room3d.tsx` — 修改：引用 CubeDemo
- `package.json` — 修改：新增 expo-gl, expo-three, three, @types/three
- Git commit: `9a7f5de` — "Day 4: 3D技术验证 - expo-gl + three.js 立方体渲染成功"
- GitHub push: ✅
## Day 5 — 待开始

### 会话分享链接

- （待记录）

## Day 6 — 待开始

### 会话分享链接

- （待记录）

## Day 7 — 待开始

### 会话分享链接

- （待记录）

## Day 8 — 待开始

### 会话分享链接

- （待记录）

## Day 9 — 待开始

### 会话分享链接

- （待记录）

## Day 10 — 待开始

### 会话分享链接

- （待记录）

## Day 11 — 待开始

### 会话分享链接

- （待记录）

## Day 12 — 待开始

### 会话分享链接

- （待记录）

## Day 13 — 待开始

### 会话分享链接

- （待记录）

## Day 14 — 待开始

### 会话分享链接

- （待记录）

## Day 15 — 待开始

### 会话分享链接

- （待记录）
