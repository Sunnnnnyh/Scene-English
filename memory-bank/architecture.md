# SceneEnglish 架构记录

> 作用：记录项目结构、模块职责、数据流、测试策略和后续新增文件说明。写任何代码前必须阅读本文档；每完成一个重大功能或新增关键模块后，必须更新本文档。

---

## 1. 当前阶段

当前项目已完成阶段 2 / Step 2.11，已初始化微信小程序 TypeScript 工程，建立基础目录结构和全部规划页面占位，配置基础开发质量工具，完成核心类型、场景数据、Classroom 20 个单词静态数据、占位图片 / 音频资源，并实现本地缓存工具、字符串标准化工具、热区计算工具、场景服务、单词服务、收藏服务、学习进度服务、错题服务、抽题服务、音频服务和 mock 口语识别服务。工程可以被微信开发者工具识别，所有已注册页面都能打开占位页；TypeScript、ESLint、Prettier 和 Vitest 命令均可运行。

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
- `classroomWords`：Classroom 场景的 20 个单词数据。

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

## 11. 阶段 1 / Step 1.3 教室单词数据更新

`miniprogram/data/scenes.ts` 现在同时维护 Classroom 场景的 MVP 词表数据。`classroomWords` 是后续 `wordService`、单词卡、记忆模式、听力默写、口语练习和错题复习的静态数据来源。

当前词表包含 20 个单词：

- `blackboard`
- `whiteboard`
- `projector`
- `podium`
- `desk`
- `chair`
- `backpack`
- `textbook`
- `notebook`
- `pencil`
- `pen`
- `eraser`
- `chalk`
- `ruler`
- `window`
- `curtain`
- `door`
- `clock`
- `socket`
- `trash-can`

每个单词记录包含：

- 基础内容：`id`、`sceneId`、`cn`、`en`、`phonetic`。
- 学习内容：`exampleEn`、`exampleCn`、`expressionEn`、`expressionCn`。
- 资源与交互：`audioUrl`、`position`。

当前 `position` 坐标为基于 1920 × 1080 原始画布的临时合理值，后续在 Step 1.4 准备占位图和正式视觉资源后需要重新校准。

`tests/scenes.test.ts` 已补充词表数据完整性验证：

- Classroom 词表正好 20 个单词；
- 单词 id 不重复；
- 所有单词都属于 `classroom`；
- 核心学习字段均非空；
- 音频路径与单词 id 保持一致；
- 热区宽高为正数；
- Classroom `wordCount` 与 `classroomWords.length` 保持一致。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/data/scenes.ts` | 新增 `classroomWords`，定义 Classroom 20 个单词及其学习内容、音频路径和临时热区坐标。 | 阶段 1 / Step 1.3 |
| `tests/scenes.test.ts` | 补充 Classroom 词表完整性测试，覆盖数量、唯一性、必填字段、音频路径、热区坐标和 `wordCount` 对齐。 | 阶段 1 / Step 1.3 |

## 12. 阶段 1 / Step 1.4 占位资源更新

当前已为 Classroom 场景准备基础占位资源，资源路径与 `miniprogram/data/scenes.ts` 中的场景和单词数据保持一致。

图片资源：

- `miniprogram/assets/images/classroom-cover.png`：场景选择页后续使用的 Classroom 封面占位图。
- `miniprogram/assets/images/classroom.png`：记忆模式和练习模式后续使用的 Classroom 场景占位图。

音频资源：

- `miniprogram/assets/audio/*.mp3`：20 个单词的临时静音占位音频，文件名与单词 id 一致。
- `miniprogram/assets/audio/README.md`：说明当前音频为临时静音占位资源，后续用户测试前需要替换为真实发音。

当前音频文件均复制自 `silent-mp3-datauri@1.0.0` 的 `silence.mp3`（MIT license），仅用于验证路径和播放接口可找到资源，不代表真实单词发音。

`tests/assets.test.ts` 验证：

- Classroom 封面图和场景图存在；
- 图片文件为 PNG；
- 20 个单词音频文件均存在且非空。

`tsconfig.test.json` 更新：

- `moduleResolution` 使用 `Node`，兼容微信开发者工具内置 TypeScript 服务。
- `skipLibCheck` 设为 `true`，避免 Vite / Vitest 依赖库声明在微信开发者工具中造成无关误报，同时继续检查项目测试代码。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/assets/images/classroom-cover.png` | Classroom 封面占位图。 | 阶段 1 / Step 1.4 |
| `miniprogram/assets/images/classroom.png` | Classroom 场景占位图。 | 阶段 1 / Step 1.4 |
| `miniprogram/assets/audio/*.mp3` | 20 个单词的临时静音占位音频，路径与 `classroomWords` 保持一致。 | 阶段 1 / Step 1.4 |
| `miniprogram/assets/audio/README.md` | 记录占位音频来源、用途和后续替换要求。 | 阶段 1 / Step 1.4 |
| `tests/assets.test.ts` | 验证 Classroom 图片和单词音频资源存在且路径可用。 | 阶段 1 / Step 1.4 |
| `tsconfig.test.json` | 调整测试 TypeScript 配置以兼容微信开发者工具，同时保持本地测试类型检查可运行。 | 阶段 1 / Step 1.4 |

## 13. 阶段 2 / Step 2.1 本地缓存工具更新

`miniprogram/utils/storage.ts` 现在是本地缓存访问的统一工具模块。页面和 service 后续不应直接调用原始 `wx.getStorageSync`、`wx.setStorageSync` 或 `wx.removeStorageSync`，而应通过本工具或基于本工具的 service 访问缓存。

导出内容：

- `StorageAdapter`：抽象同步 storage 接口，便于在 Vitest 中注入 fake storage，也便于后续迁移或测试。
- `getStorageKey(entity)`：将 `favorites`、`mistakes`、`progress`、`settings`、`onboarding` 转换为统一的 `sceneenglish:` 前缀 key。
- `createLocalStore(data)`：生成 `LocalStore<T>` 包装，包含 `version: 1`、`updatedAt` 和业务 `data`。
- `readStorage(entity, defaultValue, adapter?)`：读取缓存，空数据、坏数据或读取异常时返回默认值。
- `writeStorage(entity, data, adapter?)`：将业务数据包装为 `LocalStore<T>` 后写入缓存。
- `removeStorage(entity, adapter?)`：按统一 key 删除缓存。

实现细节：

- 小程序运行时默认从 `globalThis.wx` 获取 storage adapter。
- 测试中可以显式传入 fake adapter，避免 Node 环境依赖小程序全局对象。
- 读取逻辑只接受带 `version`、`updatedAt` 和 `data` 字段的本地存储包装；异常结构会走默认值兜底。

`tests/storage.test.ts` 验证：

- 所有缓存 key 都带 `sceneenglish:` 前缀；
- 写入数据带版本和更新时间；
- 首次读取不存在数据时返回默认值；
- 写入后再次读取能得到相同业务数据；
- 异常结构不会导致页面崩溃，会返回默认值；
- storage adapter 抛错时返回默认值；
- 删除操作使用规范 key，并能清空对应数据。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/utils/storage.ts` | 封装本地缓存 key、读写、删除、默认值兜底和 `LocalStore<T>` 包装。 | 阶段 2 / Step 2.1 |
| `tests/storage.test.ts` | 使用 Vitest 覆盖 storage 工具的 key、读写、默认值、异常兜底和删除行为。 | 阶段 2 / Step 2.1 |
| `miniprogram/utils/.gitkeep` | 已删除，因为 `miniprogram/utils/` 目录已经包含真实工具模块。 | 阶段 2 / Step 2.1 |

## 14. 阶段 2 / Step 2.2 字符串标准化工具更新

`miniprogram/utils/normalize.ts` 现在是拼写判断的标准化工具模块。后续 Listen + Spell、quiz service 或其他拼写判断逻辑应复用该模块，避免页面层重复实现大小写和空格处理。

导出内容：

- `normalizeSpelling(value)`：对输入执行 `trim()` 和 `toLowerCase()`。
- `isNormalizedSpellingMatch(input, target)`：比较标准化后的用户输入和目标拼写。

当前规则：

- 忽略大小写差异。
- 忽略首尾空格。
- 不做复杂相似度判断。
- 不折叠单词内部空格；例如 `trash  can` 不等于 `trash can`。

`tests/normalize.test.ts` 验证：

- 首尾空格会被去除；
- 大小写会被统一为小写；
- 大小写不同仍判定为同一拼写；
- 首尾空格不同仍判定为同一拼写；
- 不同拼写保持不匹配；
- 内部多余空格不会被自动修正。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/utils/normalize.ts` | 实现 Listen + Spell 拼写判断所需的标准化和匹配函数。 | 阶段 2 / Step 2.2 |
| `tests/normalize.test.ts` | 使用 Vitest 覆盖拼写标准化、大小写、首尾空格和不同拼写判断规则。 | 阶段 2 / Step 2.2 |

## 15. 阶段 2 / Step 2.3 热区计算工具更新

`miniprogram/utils/hotspot.ts` 现在是场景图透明热区定位和点击判断的工具模块。后续场景页面、Memory Mode 或其他需要点击场景物品的页面应复用该模块，避免页面层重复计算坐标和边界。

导出内容：

- `Point`：表示点击点坐标。
- `PercentHotspotPosition`：表示转换后的百分比热区位置。
- `convertHotspotToPercent(position, baseWidth, baseHeight)`：将基于原始画布的 `x`、`y`、`width`、`height` 转换为百分比。
- `createHotspotStyle(position, baseWidth, baseHeight)`：生成透明热区 `view` 可直接使用的 `left`、`top`、`width`、`height` 样式字符串。
- `isPointInHotspot(point, position)`：判断点击点是否位于热区内，热区边界视为可点击。

当前规则：

- 热区数据仍来源于 `classroomWords.position`。
- 百分比定位基于场景原始画布尺寸转换，适配后续响应式场景图。
- 点击边界包含在热区内，避免用户点到物体边缘时被误判为未点击。

`tests/hotspot.test.ts` 验证：

- 原始画布坐标可转换为百分比；
- 等比例缩放画布时转换结果保持一致；
- 可生成透明热区 `view` 使用的样式字符串；
- 热区内部点击返回 `true`；
- 热区边界点击返回 `true`；
- 热区外点击返回 `false`。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/utils/hotspot.ts` | 实现场景热区百分比转换、样式字符串生成和点击命中判断。 | 阶段 2 / Step 2.3 |
| `tests/hotspot.test.ts` | 使用 Vitest 覆盖热区坐标转换、样式生成和点击命中规则。 | 阶段 2 / Step 2.3 |

## 16. 阶段 2 / Step 2.4 场景服务更新

`miniprogram/services/sceneService.ts` 现在是场景数据读取的 service 层入口。后续场景选择页和场景学习首页应优先通过该服务读取场景列表和场景详情，避免页面直接依赖 `data/scenes.ts` 的筛选逻辑。

导出内容：

- `getScenes()`：返回全部 MVP 场景，并保持数据文件中的展示顺序。
- `getAvailableScenes()`：返回可学习场景，目前只有 Classroom。
- `getComingSoonScenes()`：返回不可进入的 Coming soon 场景。
- `getSceneById(sceneId)`：按场景 id 查找场景详情；未知 id 返回 `undefined`，由页面或调用方决定兜底展示。

当前规则：

- 服务层只读取本地静态数据，不依赖页面、不读写本地缓存。
- Classroom 是唯一 `available` 场景。
- Lecture Hall、Dormitory、Cafeteria 保持 `comingSoon`，后续页面点击时只提示 `Coming soon`。

`tests/sceneService.test.ts` 验证：

- 全部场景按预期顺序返回；
- Classroom 是唯一可学习场景；
- 非 Classroom 场景都作为 Coming soon 返回；
- 可以按 `classroom` 查询到场景详情；
- 查询未知 scene id 时返回 `undefined`。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/sceneService.ts` | 封装场景列表、可学习场景、Coming soon 场景和按 id 获取场景详情的读取能力。 | 阶段 2 / Step 2.4 |
| `tests/sceneService.test.ts` | 使用 Vitest 覆盖场景服务读取、筛选和未知 id 兜底行为。 | 阶段 2 / Step 2.4 |

## 17. 阶段 2 / Step 2.5 单词服务更新

`miniprogram/services/wordService.ts` 现在是单词数据读取的 service 层入口。后续单词卡、记忆模式、听力默写、口语练习和错题复习应优先通过该服务读取单词列表和单词详情，避免页面直接依赖 `data/scenes.ts` 的词表导出。

导出内容：

- `getWordsBySceneId(sceneId)`：按场景 id 返回对应单词列表；未知场景返回空数组。
- `getWordById(wordId)`：按 word id 查找单词详情；未知单词返回 `undefined`。

当前规则：

- 服务层只读取本地静态词表，不依赖页面、不读写本地缓存。
- Classroom 当前返回 20 个 MVP 单词。
- 返回的单词数据保留 `expressionEn` 和 `expressionCn`，确保单词卡能展示实用表达。
- 未知场景和未知单词使用明确兜底值，避免调用方误以为一定存在数据。

`tests/wordService.test.ts` 验证：

- Classroom 场景返回 20 个单词；
- 返回单词都属于 `classroom`；
- 可以按 `projector` 查询到完整学习字段，包括例句、音标、实用表达和音频路径；
- 可以按 `trash-can` 查询跨列表单词；
- 未知 scene id 返回空数组；
- 未知 word id 返回 `undefined`。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/wordService.ts` | 封装按场景获取单词列表和按 word id 获取单词详情的读取能力。 | 阶段 2 / Step 2.5 |
| `tests/wordService.test.ts` | 使用 Vitest 覆盖单词服务读取、实用表达字段保留和未知输入兜底行为。 | 阶段 2 / Step 2.5 |

## 18. 阶段 2 / Step 2.6 收藏服务更新

`miniprogram/services/favoriteService.ts` 现在是收藏数据的 service 层入口。后续单词卡和收藏夹页面应通过该服务统一读取和修改收藏状态，避免页面直接读写 `wx storage`。

导出内容：

- `getFavorites(adapter?)`：读取收藏列表；无缓存或异常数据时返回空数组。
- `addFavorite(wordId, sceneId, adapter?)`：添加收藏并立即写入本地缓存。
- `removeFavorite(wordId, adapter?)`：按 word id 取消收藏并立即写入本地缓存。
- `isFavorite(wordId, adapter?)`：按 word id 查询收藏状态。

当前规则：

- 收藏数据写入 `sceneenglish:favorites`。
- 同一单词只能收藏一次；重复收藏时保留首次收藏时间，不新增重复记录。
- 添加和取消收藏后立即写入缓存，不依赖页面退出或后续统一保存。
- service 支持注入 `StorageAdapter`，方便 Vitest 使用 fake storage，也保留微信小程序运行时默认 storage adapter。

`tests/favoriteService.test.ts` 验证：

- 初始收藏列表为空；
- 添加收藏后返回包含 `wordId`、`sceneId` 和 `createdAt` 的收藏记录；
- 添加收藏会立即写入 `sceneenglish:favorites`；
- 重复收藏同一 word id 不会产生重复记录；
- `isFavorite` 能正确反映收藏状态；
- 取消收藏后列表和状态同步更新。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/favoriteService.ts` | 封装收藏列表读取、添加收藏、取消收藏和收藏状态查询，并通过 storage 工具持久化。 | 阶段 2 / Step 2.6 |
| `tests/favoriteService.test.ts` | 使用 Vitest 覆盖收藏服务空状态、写入缓存、去重、状态查询和取消收藏同步行为。 | 阶段 2 / Step 2.6 |

## 19. 阶段 2 / Step 2.7 学习进度服务更新

`miniprogram/services/progressService.ts` 现在是学习进度数据的 service 层入口。后续单词卡、记忆模式、听力默写、口语练习和场景学习首页应通过该服务记录已学单词、练习完成次数和读取 `Learned x / 20` 所需数据。

导出内容：

- `getSceneProgress(sceneId, adapter?)`：按场景 id 读取学习进度；无缓存时返回默认进度。
- `recordLearnedWord(sceneId, wordId, adapter?)`：记录已学单词，并立即写入本地缓存。
- `recordModeCompletion(sceneId, mode, adapter?)`：按学习模式累加完成次数，并立即写入本地缓存。

当前规则：

- 学习进度数据写入 `sceneenglish:progress`。
- `Learned x / 20` 只依赖 `learnedWordIds` 的去重数量。
- 同一单词重复记录 learned 不会重复计数。
- `memory` 累加 `completedMemoryCount`。
- `listeningWriting` 累加 `completedWritingCount`。
- `listeningSpeaking` 累加 `completedSpeakingCount`。
- service 支持注入 `StorageAdapter`，方便 Vitest 使用 fake storage，也保留微信小程序运行时默认 storage adapter。

`tests/progressService.test.ts` 验证：

- 初始场景进度为空学习列表和 0 次完成次数；
- 记录 learned word 后会立即写入 `sceneenglish:progress`；
- 重复记录同一 learned word 不会重复计数；
- Memory、Listen + Spell、Listen + Speak 三类完成次数能分别累加；
- 不同场景的进度相互隔离。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/progressService.ts` | 封装场景学习进度读取、记录已学单词和记录三类模式完成次数，并通过 storage 工具持久化。 | 阶段 2 / Step 2.7 |
| `tests/progressService.test.ts` | 使用 Vitest 覆盖学习进度默认值、learned 去重、完成次数累加和多场景隔离行为。 | 阶段 2 / Step 2.7 |

## 20. 阶段 2 / Step 2.8 错题服务更新

`miniprogram/services/mistakeService.ts` 现在是错题数据的 service 层入口。后续 Listen + Spell、Listen + Speak、错题夹和错题专项练习应通过该服务统一记录错误、更新掌握进度和移出错题。

导出内容：

- `getMistakes(adapter?)`：读取错题列表；无缓存或异常数据时返回空数组。
- `recordMistake(wordId, sceneId, mistakeType, adapter?)`：记录一次 `click`、`spelling` 或 `speaking` 错误。
- `recordMistakeCorrectAnswer(wordId, mistakeType, adapter?)`：记录某个错误类型的一次正确作答，并更新掌握进度。
- `removeMistake(wordId, adapter?)`：手动移出整个错题单词。

当前规则：

- 错题数据写入 `sceneenglish:mistakes`。
- 错题按单词累计，同时按 `click`、`spelling`、`speaking` 分别记录弱项。
- 同一错误类型重复错误会增加该类型的 `mistakeCount`，并重置 `correctStreak` 和 `masteryProgress`。
- 同一错误类型答对 1 次后 `correctStreak` 为 1，`masteryProgress` 为 50。
- 同一错误类型连续答对 2 次后，该错误类型从该词的 `typeStats` 中移除。
- 一个单词的所有错误类型都移除后，该单词自动从错题列表移除。
- service 支持注入 `StorageAdapter`，方便 Vitest 使用 fake storage，也保留微信小程序运行时默认 storage adapter。

`tests/mistakeService.test.ts` 验证：

- 初始错题列表为空；
- 记录错误后会立即写入 `sceneenglish:mistakes`；
- 同一单词同一错误类型多次错误会增加错误次数；
- 同一单词可以同时保留不同错误类型；
- 同一错误类型答对 1 次后掌握进度为 50；
- 同一错误类型连续答对 2 次后该弱项被移除；
- 所有弱项都被移除后该单词自动离开错题列表；
- 手动移出错题后列表同步更新。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/mistakeService.ts` | 封装错题列表读取、错误记录、按错误类型更新掌握进度、弱项自动移除和手动移出能力，并通过 storage 工具持久化。 | 阶段 2 / Step 2.8 |
| `tests/mistakeService.test.ts` | 使用 Vitest 覆盖错题服务记录、累计、分类型统计、掌握进度、自动移出和手动移出行为。 | 阶段 2 / Step 2.8 |

## 21. 阶段 2 / Step 2.9 抽题服务更新

`miniprogram/services/quizService.ts` 现在是练习题组生成的 service 层入口。后续 Listen + Spell、Listen + Speak 和错题专项练习页面应通过该服务生成 `QuizRound`，避免页面层重复实现抽题优先级和兜底规则。

导出内容：

- `DEFAULT_QUIZ_QUESTION_COUNT`：默认每轮 5 题。
- `createPracticeQuizRound(params)`：生成普通练习题组。
- `createMistakePracticeQuizRound(params)`：生成错题专项练习题组。

当前规则：

- 普通练习先按传入词表顺序选取已学词。
- 已学词不足默认题量时，从未学词中按词表顺序补足。
- 一轮内不重复选同一个单词，除非调用方传入的数据本身不足。
- 总词量不足默认题量时，按实际可用词量生成较短题组。
- 错题专项练习按低掌握进度、高错误次数、最近错误时间和词表顺序排序。
- 错题专项练习支持通过 `targetMistakeType` 只生成某一类弱项题目。
- 生成的题目使用现有 `QuizRound` 和 `QuizQuestion` 类型，`targetMistakeType` 会保留在错题专项题目中。

`tests/quizService.test.ts` 验证：

- 普通练习会优先抽取已学词；
- 已学词不足时会从未学词补足；
- 可用词足够时一轮内不重复；
- 可用词不足 5 个时生成较短题组；
- 错题专项练习按错误次数和掌握进度优先；
- 可以按单一错误类型生成错题专项题目。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/quizService.ts` | 封装普通练习和错题专项练习的题组生成逻辑，输出可被听写、口语和错题专项页面复用的 `QuizRound`。 | 阶段 2 / Step 2.9 |
| `tests/quizService.test.ts` | 使用 Vitest 覆盖普通练习抽题优先级、未学词补足、去重、少量词兜底、错题弱项优先和指定错误类型抽题。 | 阶段 2 / Step 2.9 |

## 22. 阶段 2 / Step 2.10 音频服务更新

`miniprogram/services/audioService.ts` 现在是单词音频播放的统一 service 层入口。后续单词卡、收藏夹、Listen + Spell、Listen + Speak 和错题专项练习页面应通过该服务播放音频，避免页面重复创建和管理 `InnerAudioContext`。

导出内容：

- `AudioErrorHandler`：音频播放错误回调类型。
- `AudioPlaybackOptions`：播放选项，目前包含 `onError`。
- `AudioContextLike`：音频上下文最小接口，便于在测试中注入 fake context。
- `AudioContextFactory`：音频上下文创建函数类型。
- `AudioService`：统一定义 `play`、`stop`、`replay` 和 `dispose` 能力。
- `createAudioService(createContext?)`：创建可注入上下文工厂的音频服务实例。
- `audioService`：小程序运行时默认音频服务实例，内部使用 `wx.createInnerAudioContext`。

当前规则：

- 默认音频服务从 `globalThis.wx.createInnerAudioContext` 创建微信小程序音频上下文。
- 调用 `play(src)` 时会先停止并释放上一条音频上下文，再创建新上下文播放目标资源。
- `replay()` 会停止当前音频后重新播放当前资源，不创建新上下文。
- `stop()` 只停止当前音频，不释放上下文。
- `dispose()` 停止并释放当前上下文，适合页面离开时调用。
- 播放错误通过 `onError` 回调交给页面层处理，service 不直接展示 toast 或 modal。

`tests/audioService.test.ts` 验证：

- 可以播放指定单词音频路径；
- 播放新音频前会停止并释放上一条音频；
- 重播当前音频不会创建新上下文；
- 异步播放错误会传给调用方；
- 同步播放异常会传给调用方；
- 页面离开时可停止并释放当前音频上下文。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/audioService.ts` | 封装单词音频播放、停止、重播、错误回调和页面离开释放能力，默认使用微信小程序 `wx.createInnerAudioContext`。 | 阶段 2 / Step 2.10 |
| `tests/audioService.test.ts` | 使用 Vitest 和 fake audio context 覆盖音频服务播放、切换、重播、错误回调和释放行为。 | 阶段 2 / Step 2.10 |

## 23. 阶段 2 / Step 2.11 口语识别服务更新

`miniprogram/services/speechService.ts` 现在是 MVP 阶段口语识别流程的 service 层入口。后续 Listen + Speak 页面应通过该服务提交录音文件路径和目标单词，获取统一的识别结果；真实 ASR 接入时应优先替换该 service 的内部实现，避免改动页面流程。

导出内容：

- `MockSpeechScenario`：开发阶段可控 mock 场景，包含 `success`、`failure` 和 `empty`。
- `SpeechRecognitionOptions`：单次识别选项，支持传入 `scenario` 或指定 `transcript`。
- `SpeechServiceOptions`：创建服务时的配置，目前包含 `defaultScenario`。
- `SpeechService`：统一定义 `recognizeWord(audioFilePath, targetWord, options?)` 能力。
- `createSpeechService(options?)`：创建可配置默认 mock 场景的口语识别服务实例。
- `speechService`：小程序运行时默认 mock 口语识别服务实例。

当前规则：

- MVP 阶段 `provider` 固定返回 `mock`。
- `success` 场景默认返回目标词本身，并判定通过。
- `failure` 场景默认返回 `unrecognized speech`，并判定失败。
- `empty` 场景返回空字符串，并判定失败。
- 调用方可以传入 `transcript` 精确模拟识别文本，便于测试目标词匹配、空结果和识别为其他词。
- 识别匹配复用拼写标准化工具，忽略大小写和首尾空格；第一版不做复杂相似度判断。
- service 不直接展示 toast 或 modal，也不向普通用户暴露 mock 概念；后续 Me 页面可用于展示开发 / 演示状态说明。

`tests/speechService.test.ts` 验证：

- 识别文本与目标词一致时通过；
- 识别文本为空时失败；
- 识别文本为其他词时失败；
- 可以创建固定成功场景的服务实例；
- 可以创建固定失败场景的服务实例；
- 默认导出的 `speechService` 可返回 mock 识别结果。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/speechService.ts` | 封装 MVP 阶段 mock 口语识别接口，支持成功、失败、空结果和指定 transcript，并返回统一 `SpeechResult`。 | 阶段 2 / Step 2.11 |
| `tests/speechService.test.ts` | 使用 Vitest 覆盖 mock 口语识别服务的通过、失败、空结果、可控演示场景和默认服务实例。 | 阶段 2 / Step 2.11 |
