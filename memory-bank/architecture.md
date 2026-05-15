# SceneEnglish 架构记录

> 作用：记录项目结构、模块职责、数据流、测试策略和后续新增文件说明。写任何代码前必须阅读本文档；每完成一个重大功能或新增关键模块后，必须更新本文档。

---

## 1. 当前阶段

当前项目已完成阶段 0 / Step 0.1，初始化了最小微信小程序 TypeScript 工程。工程可以被微信开发者工具识别，并能运行首页占位页面。

当前源码目录为：

```text
D:\SceneEnglish
  AGENTS.md
  project.config.json
  project.private.config.json
  memory-bank/
    design-document.md
    tech-stack.md
    implementation-plan.md
    ui-notes.md
    progress.md
    architecture.md
  miniprogram/
    app.ts
    app.json
    app.wxss
    sitemap.json
    tsconfig.json
    pages/
      index/
        index.json
        index.ts
        index.wxml
        index.wxss
    typings/
      index.d.ts
```

---

## 2. 目录职责

| 路径 | 作用 |
|---|---|
| `AGENTS.md` | 面向 AI 开发者的项目规则和协作说明 |
| `memory-bank/design-document.md` | 产品定位、MVP 范围、核心流程、内容和验收标准 |
| `memory-bank/tech-stack.md` | 技术栈、模块划分、测试策略和实施顺序建议 |
| `memory-bank/implementation-plan.md` | 面向 AI 开发者的分步实施计划 |
| `memory-bank/ui-notes.md` | UI 风格、Figma 参考、已知视觉问题和后续精修记录 |
| `memory-bank/progress.md` | 实施进度、验证结果和遗留问题记录 |
| `memory-bank/architecture.md` | 本架构记录文件 |
| `.gitignore` | Git 忽略规则，避免依赖、构建产物、日志、本地配置和临时文件进入版本管理 |
| `project.config.json` | 微信开发者工具项目配置，指定 `miniprogram/` 为小程序源码根目录 |
| `project.private.config.json` | 微信开发者工具本地私有配置，已被 `.gitignore` 忽略 |
| `miniprogram/` | 微信小程序源码目录 |
| `tests/` | Vitest 单元测试目录，主要测试 `services` 和 `utils` |

---

## 3. 预计源码结构

```text
miniprogram/
  app.ts
  app.json
  app.wxss

  pages/
    index/
    scene/
    memory/
    listening-writing/
    listening-speaking/
    favorites/
    mistakes/
    review/
    me/

  components/
    scene-card/
    coming-soon-card/
    mode-entry/
    scene-image/
    word-card/
    quiz-progress/
    feedback-toast/
    record-button/

  data/
    scenes.ts

  services/
    sceneService.ts
    wordService.ts
    progressService.ts
    favoriteService.ts
    mistakeService.ts
    quizService.ts
    speechService.ts
    audioService.ts

  utils/
    hotspot.ts
    normalize.ts
    storage.ts
    time.ts

  types/
    index.ts

  assets/
    images/
    audio/
    icons/
```

---

## 4. 模块边界

- 页面层只负责展示、页面状态和用户交互。
- 业务逻辑放在 `services/`。
- 纯函数和平台能力轻封装放在 `utils/`。
- 场景、词表、热区、音频路径和 Coming soon 状态放在 `data/scenes.ts`。
- 类型定义集中放在 `types/index.ts`。
- 页面不直接读写微信本地缓存，统一通过 service 或 storage util 访问。

---

## 5. 数据流

```text
页面 Page
  ↓ 调用
services
  ↓ 读取静态数据 / 写入用户状态
data/scenes.ts + utils/storage.ts
  ↓
微信本地缓存 wx storage
```

用户状态包括：

- `sceneenglish:favorites`
- `sceneenglish:mistakes`
- `sceneenglish:progress`
- `sceneenglish:settings`
- `sceneenglish:onboarding`

用户每次收藏、取消收藏、打开单词卡、完成答题、产生错题或完成引导后，都应立即写入本地缓存。

---

## 6. 核心规则

- MVP 只有 Classroom 可进入。
- Lecture Hall、Dormitory、Cafeteria 只展示锁定状态，点击提示 `Coming soon`。
- 课堂场景图先使用占位 / 低保真资源。
- 热区采用透明 `view` 覆盖法，用百分比定位。
- 练习每组默认 5 题。
- Memory Mode 打开单词卡才计入 `Learned x / 20`。
- Listen + Speak 使用 mock ASR，但用户侧不暴露内部实现概念。
- 错题按错误类型分别计算掌握进度：答对 1 次为 50%，连续答对 2 次完成该类型。

---

## 7. 测试策略

- 自动测试：`services`、`utils`、数据完整性、抽题、收藏、错题、拼写标准化、mock ASR。
- 人工验证：微信开发者工具中的页面跳转、热区点击、音频播放、录音权限、真机预览和 UI 适配。
- 每个实施步骤完成后，需要在 `memory-bank/progress.md` 记录验证结果。

---

## 8. 文件变更记录

后续每新增关键文件或模块，请在这里追加记录：

| 文件路径 | 作用 | 创建/更新阶段 |
|---|---|---|
| `.gitignore` | 忽略 `node_modules/`、`dist/`、`miniprogram/miniprogram_npm/`、日志、本地环境文件、编辑器配置和临时文件 | 阶段 0 / Step 0.0 |
| `project.config.json` | 微信开发者工具项目配置，指定小程序源码根目录和 TypeScript 编译插件 | 阶段 0 / Step 0.1 |
| `project.private.config.json` | 微信开发者工具本地私有配置，不进入版本管理 | 阶段 0 / Step 0.1 |
| `miniprogram/app.json` | 小程序全局配置，注册首页和基础窗口样式 | 阶段 0 / Step 0.1 |
| `miniprogram/app.ts` | 小程序应用入口，初始化最小 `globalData` | 阶段 0 / Step 0.1 |
| `miniprogram/app.wxss` | 小程序全局基础样式 | 阶段 0 / Step 0.1 |
| `miniprogram/sitemap.json` | 小程序页面收录规则占位配置 | 阶段 0 / Step 0.1 |
| `miniprogram/tsconfig.json` | 小程序 TypeScript 配置，为后续类型检查和开发工具编译提供基础 | 阶段 0 / Step 0.1 |
| `miniprogram/typings/index.d.ts` | 最小微信小程序全局类型声明，支撑当前 `App` 和 `Page` TypeScript 文件 | 阶段 0 / Step 0.1 |
| `miniprogram/pages/index/index.json` | 首页页面配置 | 阶段 0 / Step 0.1 |
| `miniprogram/pages/index/index.ts` | 首页页面逻辑，提供 Step 0.1 占位展示数据 | 阶段 0 / Step 0.1 |
| `miniprogram/pages/index/index.wxml` | 首页页面结构，展示最小工程初始化状态 | 阶段 0 / Step 0.1 |
| `miniprogram/pages/index/index.wxss` | 首页页面样式，使用基础浅色 SceneEnglish 风格 | 阶段 0 / Step 0.1 |
