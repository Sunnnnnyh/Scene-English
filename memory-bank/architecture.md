# SceneEnglish 架构记录

> 作用：记录项目结构、模块职责、数据流、测试策略和后续新增文件说明。写任何代码前必须阅读本文档；每完成一个重大功能或新增关键模块后，必须更新本文档。

---

## 1. 当前阶段

当前项目已完成阶段 0 / Step 0.3，已初始化微信小程序 TypeScript 工程，建立基础目录结构和全部规划页面占位，并配置基础开发质量工具。工程可以被微信开发者工具识别，所有已注册页面都能打开占位页；TypeScript、ESLint、Prettier 和 Vitest 命令均可运行。

当前源码目录为：

```text
D:\SceneEnglish
  AGENTS.md
  package.json
  package-lock.json
  tsconfig.json
  tsconfig.miniprogram.json
  tsconfig.test.json
  eslint.config.js
  vitest.config.ts
  .prettierrc.json
  .prettierignore
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
      scene/
      memory/
      listening-writing/
      listening-speaking/
      favorites/
      mistakes/
      review/
      me/
    components/
    data/
    services/
    utils/
    types/
    assets/
      images/
      audio/
      icons/
    typings/
      index.d.ts
  tests/
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
| `package.json` | Node 开发脚本和 TypeScript / ESLint / Prettier / Vitest 开发依赖配置 |
| `package-lock.json` | npm 依赖锁定文件，保证质量工具版本可复现 |
| `tsconfig.json` | 根 TypeScript 配置，引用小程序源码和测试两个子配置 |
| `tsconfig.miniprogram.json` | 小程序源码 TypeScript 类型检查配置 |
| `tsconfig.test.json` | 测试和 Node 配置文件 TypeScript 类型检查配置 |
| `eslint.config.js` | ESLint flat config，用于检查小程序 TS、测试和配置文件 |
| `vitest.config.ts` | Vitest 单元测试配置 |
| `.prettierrc.json` | Prettier 格式化规则 |
| `.prettierignore` | Prettier 忽略规则 |
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

当前质量检查命令：

```powershell
$env:PATH = "D:\SceneEnglish\.tools\node-v24.11.1-win-x64;$env:PATH"
.\.tools\node-v24.11.1-win-x64\npm.cmd run typecheck
.\.tools\node-v24.11.1-win-x64\npm.cmd run lint
.\.tools\node-v24.11.1-win-x64\npm.cmd run format:check
.\.tools\node-v24.11.1-win-x64\npm.cmd test
```

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
| `miniprogram/pages/scene/` | 场景学习首页占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/memory/` | 单词记忆模式占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/listening-writing/` | 听力 + 默写模式占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/listening-speaking/` | 听力 + 口语模式占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/favorites/` | 收藏夹占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/mistakes/` | 错题夹占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/review/` | 复习入口占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/pages/me/` | 轻量个人页占位页面目录 | 阶段 0 / Step 0.2 |
| `miniprogram/components/` | 后续通用组件目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/data/` | 后续本地场景和单词数据目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/services/` | 后续业务服务层目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/utils/` | 后续工具函数目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/types/` | 后续集中类型定义目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/assets/images/` | 后续图片资源目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/assets/audio/` | 后续音频资源目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `miniprogram/assets/icons/` | 后续图标资源目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `tests/` | 后续 Vitest 单元测试目录，目前使用 `.gitkeep` 保留空目录 | 阶段 0 / Step 0.2 |
| `package.json` | 配置开发依赖和 `typecheck`、`lint`、`format`、`format:check`、`test` 脚本 | 阶段 0 / Step 0.3 |
| `package-lock.json` | 锁定 npm 开发依赖版本 | 阶段 0 / Step 0.3 |
| `tsconfig.json` | 根 TypeScript 配置，引用小程序源码和测试两个子配置 | 阶段 0 / Step 0.3 |
| `tsconfig.miniprogram.json` | 小程序源码类型检查配置，加载 `miniprogram-api-typings` | 阶段 0 / Step 0.3 |
| `tsconfig.test.json` | 测试和 Node 配置文件类型检查配置，加载 Node 和 Vitest 类型 | 阶段 0 / Step 0.3 |
| `eslint.config.js` | ESLint 检查配置 | 阶段 0 / Step 0.3 |
| `.prettierrc.json` | Prettier 格式化配置 | 阶段 0 / Step 0.3 |
| `.prettierignore` | Prettier 忽略配置 | 阶段 0 / Step 0.3 |
| `vitest.config.ts` | Vitest 测试配置 | 阶段 0 / Step 0.3 |
| `tests/smoke.test.ts` | 占位 smoke test，用于验证测试环境可运行 | 阶段 0 / Step 0.3 |
| `miniprogram/tsconfig.json` | 更新为微信开发者工具可识别官方小程序全局类型 | 阶段 0 / Step 0.3 |
| `miniprogram/typings/index.d.ts` | 保留 `IAppOption`，移除与官方类型重复的 `App` / `Page` 声明 | 阶段 0 / Step 0.3 |

## 9. 阶段 1 / Step 1.1 类型架构更新

`miniprogram/types/index.ts` 现在是小程序源码的集中领域类型模块。该文件只描述业务数据结构，不混入页面 UI 状态。

核心职责：

- `Scene` 描述可学习场景和 coming soon 场景，包括图片路径、原始画布尺寸、词数和场景状态。
- `Word` 描述单词记录，包括中文、英文、音标、例句、实用表达、音频路径和热区坐标。
- `UserProgress`、`Favorite`、`Mistake` 和 `OnboardingState` 描述后续会通过 service 层和 storage 工具持久化的本地用户数据。
- `MistakeTypeStats` 和 `Mistake` 支持按 `click`、`spelling`、`speaking` 分别记录弱项，包括错误次数、连续答对次数、掌握进度和最近错误时间。
- `QuizQuestion`、`QuizRound` 和 `QuizAnswerResult` 为后续 Listen + Spell、Listen + Speak 和错题复习流程提供可复用业务类型。
- `SpeechResult` 定义可替换的语音识别结果契约，用于 MVP 阶段的 mock ASR 和后续真实 ASR。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/types/index.ts` | 集中定义场景、单词、学习进度、收藏、错题、练习流程、语音识别结果、本地存储包装和新手引导状态等核心 TypeScript 领域类型。 | 阶段 1 / Step 1.1 |
| `miniprogram/types/.gitkeep` | 已删除，因为 `miniprogram/types/` 目录已经包含真实类型模块。 | 阶段 1 / Step 1.1 |

## 10. 阶段 1 / Step 1.2 场景数据更新

`miniprogram/data/scenes.ts` 现在负责维护 MVP 阶段的静态场景列表。

当前场景记录：

- `classroom`：available，20 个单词，MVP 可学习场景。
- `lecture-hall`：coming soon，不可进入。
- `dormitory`：coming soon，不可进入。
- `cafeteria`：coming soon，不可进入。

导出内容：

- `scenes`：完整场景列表。
- `availableScenes`：筛选出 `status === "available"` 的场景列表。
- `comingSoonScenes`：筛选出 `status === "comingSoon"` 的场景列表。

`tests/scenes.test.ts` 验证：

- 4 个场景 id 都可以读取；
- Classroom 是唯一可进入场景；
- 所有非 Classroom 场景都保持 `comingSoon`。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/data/scenes.ts` | 定义 MVP 静态场景数据，并导出 available / coming-soon 场景列表。 | 阶段 1 / Step 1.2 |
| `tests/scenes.test.ts` | 使用 Vitest 覆盖场景数据完整性和可进入状态规则。 | 阶段 1 / Step 1.2 |
| `miniprogram/data/.gitkeep` | 已删除，因为 `miniprogram/data/` 目录已经包含真实场景数据模块。 | 阶段 1 / Step 1.2 |
