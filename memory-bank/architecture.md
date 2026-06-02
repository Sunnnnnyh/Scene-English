# SceneEnglish 架构记录

> 作用：记录项目结构、模块职责、数据流、测试策略和后续新增文件说明。写任何代码前必须阅读本文档；每完成一个重大功能或新增关键模块后，必须更新本文档。

---

## 1. 当前阶段

### Current Active Development Baseline - 2026-06-02

- Current active plan: `memory-bank/implementation-plan-v2-scene-tutor.md`.
- Historical plan: `memory-bank/implementation-plan.md` remains useful as v1/MVP background, but it is no longer the source for deciding the next implementation step.
- Current available learning scenes: `Classroom` and `Lecture Hall`.
- Current coming-soon scenes: `Dormitory` and `Cafeteria`.
- Current v2 scope: Scene Tutor for available scenes, with first-release support for `Ask AI` and `Make Sentences` only.
- Latest validated implementation: v2 Scene Tutor Step 5.3 Ask AI structured result card, plus CloudBase `sceneTutor` deployment configuration and Node 16-compatible HTTPS provider request handling.
- Next implementation target: v2 Scene Tutor Step 6.1, building the Make Sentences panel input and word-selection shell.
- Verification rule: complete typecheck, lint, format check, and full test suite are run by the user unless explicitly requested. Codex may run focused checks for the current change.
- Reading note: earlier sections that describe `Classroom` as the only available scene or `Lecture Hall` as locked are historical. Use this section, latest numbered architecture entries, and `progress.md` for the current state.

当前项目已完成阶段 6 / Step 6.5 Listen + Spell 拼写输入、答案校验和基础完成页。项目已初始化微信小程序 TypeScript 工程，建立基础目录结构和全部规划页面占位，配置基础开发质量工具，完成核心类型、场景数据、Classroom 20 个单词静态数据、正式 Classroom 图片、正式热区校准和真实单词音频资源，并实现本地缓存工具、字符串标准化工具、热区计算工具、场景服务、单词服务、收藏服务、学习进度服务、错题服务、抽题服务、音频服务和 mock 口语识别服务。首页已接入场景选择页，可以展示 Classroom 主场景和 Lecture Hall、Dormitory、Cafeteria 三个 Coming soon 场景；底部导航已包含 Home / Learn / Review / Me。Home 负责选择学习场景，Learn 负责进入当前学习场景；MVP 阶段只有 Classroom，因此直接点击 Learn 默认进入 Classroom 学习首页。Classroom 学习首页可查看场景预览、学习进度和三个学习模式入口，Coming soon 场景只提示不跳转。点击学习模式入口时，当前采用 Learn tab 内部状态切换，不再 `navigateTo` 普通页面，从而避免底部 tabBar 在过渡中消失。Review 页已预留收藏夹和错题夹全局入口，Me 页已展示本地轻量统计和 mock ASR 状态。Memory Mode 当前优先在 Learn tab 内联视图中推进：已能稳定展示 Classroom 场景图，并根据 Classroom 20 个单词数据覆盖透明热区；Memory 视图标题下方同样展示 `单词进度`、`Learned x / 20` 和进度条；点击热区会打开对应单词卡，卡片展示英文、中文、美式音标、音频播放入口、收藏状态和 1 条 Useful expression；点击 Useful expression 英文句子可展开或收起中文翻译，并通过 `sceneenglish:onboarding` 记录表达翻译轻引导完成状态。点击热区打开单词卡时会通过 `progressService` 记录该词为已学，并刷新 `Learned x / 20` 进度；点击星标会通过 `favoriteService` 写入或移除收藏；打开单词卡时会自动播放当前单词音频一次，用户也可以手动复听。Favorites 页面已接入真实收藏列表：从本地收藏记录生成列表项，支持空状态，允许点击多个收藏项同时展开音标和 Useful expression，并在展开详情中支持播放单词音频和取消收藏；取消收藏后会写入 `sceneenglish:favorites` 并立即刷新列表。Listen + Spell 当前已能生成 5 题练习开始状态、播放当前题音频、完成听音找物点击判断并进入拼写输入：目标音频播放结束前点击热区不会进入判定，播放结束后才允许选择物品；点对后进入 `spellingReady`，输入框和并排的 `Play audio` / `Submit` 按钮成为视觉焦点；首次点错会记录 `click` 类型错题并允许重试，第二次点错会高亮正确物品并进入拼写；首次拼写错误会记录 `spelling` 类型错题并允许再试一次，第二次拼写错误会展示正确拼写并等待用户继续；答题后通过 `Continue` 进入下一题，完成 5 题后展示 `Round complete`，可开启新一组或结束练习。正确和错误反馈已补充短 WAV 音效，其中错误音效保留但更柔和并降低播放音量。点击空白区域只给轻提示。首次进入单词记忆模式时会展示一次性轻引导，高亮 `projector` 并通过 `sceneenglish:onboarding` 本地缓存记录完成状态。工程可以被微信开发者工具识别，所有已注册页面都能打开；TypeScript、ESLint、Prettier 和 Vitest 命令均可运行。

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
| `memory-bank/prd-v2-scene-tutor.md` | 当前 v2 Scene Tutor 产品范围、用户流程、能力边界和验收标准 |
| `memory-bank/implementation-plan-v2-scene-tutor.md` | 当前 v2 Scene Tutor 主实施计划和下一步来源 |
| `memory-bank/implementation-plan.md` | 历史 v1/MVP 分步实施计划，仅作背景参考 |
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

- Current v2 note: `Classroom` and `Lecture Hall` are both available learning scenes. The older rule that only `Classroom` can be entered is historical v1/MVP context.
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
- `Word` 描述单词记录，包括中文、英文、音标、底层例句字段、实用表达、音频路径和热区坐标；当前 MVP 用户界面只展示实用表达，不展示 Example / 例句区块。
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
- 学习内容：`exampleEn`、`exampleCn`、`expressionEn`、`expressionCn`。其中 `exampleEn` / `exampleCn` 仅作为底层保留字段，当前 MVP 展示内容以 `expressionEn` / `expressionCn` 为准。
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

## 24. 阶段 3 / Step 3.1 场景选择页更新

`miniprogram/pages/index/` 现在是 MVP 首页和场景选择页，不再只是工程初始化占位页。首页通过 `sceneService` 获取场景数据，并通过 `indexViewModel` 将场景列表整理为页面可直接渲染的数据。

当前首页职责：

- 展示 SceneEnglish 标识和“按真实场景学习英语单词”的产品说明。
- 展示 Classroom 主场景卡，包括封面图、中英文名称和 `20 words`。
- 展示 Lecture Hall、Dormitory、Cafeteria 三个 Coming soon 卡片。
- 点击 Classroom 时跳转到 `/pages/scene/scene?sceneId=classroom`。
- 点击 Coming soon 场景时显示 `Coming soon`，不发生页面跳转。

`miniprogram/pages/index/indexViewModel.ts` 负责：

- `createIndexViewModel(scenes)`：根据场景数据生成首页展示模型，区分可学习场景和 Coming soon 场景。
- `getIndexSceneAction(sceneId, scenes)`：根据场景状态返回点击行为，可学习场景返回 `navigate`，Coming soon 或未知场景返回 `toast`。

`tests/indexViewModel.test.ts` 验证：

- 首页 view model 会从场景数据生成 1 个 Classroom 卡片和 3 个 Coming soon 卡片；
- Classroom 卡片包含 `20 words` 和 `Start learning`；
- Coming soon 场景的状态为 `Coming soon`；
- Classroom 点击行为为跳转到场景学习首页；
- Lecture Hall 等未开放场景点击行为为 `Coming soon` 提示。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/index/index.ts` | 接入首页 view model，处理场景卡点击；Classroom 跳转，Coming soon 显示轻提示。 | 阶段 3 / Step 3.1 |
| `miniprogram/pages/index/index.wxml` | 将首页结构从初始化占位替换为场景选择页，展示 Classroom 和 Coming soon 场景卡。 | 阶段 3 / Step 3.1 |
| `miniprogram/pages/index/index.wxss` | 为场景选择页补充基础浅色 UI、场景卡、状态标签和按钮样式。 | 阶段 3 / Step 3.1 |
| `miniprogram/pages/index/indexViewModel.ts` | 封装首页展示模型和场景点击行为，便于自动测试页面业务规则。 | 阶段 3 / Step 3.1 |
| `tests/indexViewModel.test.ts` | 使用 Vitest 覆盖首页场景卡生成和 Classroom / Coming soon 点击规则。 | 阶段 3 / Step 3.1 |

## 25. 阶段 3 / Step 3.2 场景学习首页更新

`miniprogram/pages/scene/` 现在是 Classroom 场景学习首页，不再是占位页。该页面承接首页的 Classroom 场景卡，负责展示当前场景信息、学习进度和场景内学习模式入口。

当前场景学习首页职责：

- 读取页面参数 `sceneId`，默认使用 `classroom`。
- 通过 `sceneService` 获取场景详情；未知或未开放场景显示 `Coming soon` 轻提示。
- 通过 `progressService` 读取当前场景学习进度，展示 `Learned x / 20` 和进度条。
- 展示 Classroom 场景预览图。
- 展示三个学习模式入口：单词记忆、听力 + 默写、听力 + 口语。
- 单词记忆作为推荐入口使用视觉状态突出，但三种学习模式卡片尺寸保持一致。
- 点击学习模式入口时跳转到对应页面，并携带 `sceneId=classroom`。

当前信息架构判断：

- 收藏夹和错题夹不再放在具体场景学习首页中。
- 收藏夹和错题夹属于跨场景复习资产，后续应放到首页、Review 或 Me 等全局入口中处理。
- 当前 Step 3.2 只完成场景内学习路径入口，不提前实现全局复习入口的位置调整。

`miniprogram/pages/scene/sceneViewModel.ts` 负责：

- `createSceneViewModel(scene, progress)`：根据场景和学习进度生成页面展示模型。
- `getSceneEntryAction(entryId, sceneId)`：根据学习模式生成目标页面路由。

`tests/sceneViewModel.test.ts` 验证：

- Classroom 页面模型包含场景标题、场景图、`Learned 0 / 20` 和 0% 进度。
- 进度会根据 `learnedWordIds` 数量计算，例如 3 / 20 对应 15%。
- 三个学习模式入口分别跳转到 memory、listening-writing 和 listening-speaking 页面。
- 场景首页模型不包含收藏夹 / 错题夹入口。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | 接入场景详情、学习进度和场景首页 view model，处理三个学习模式入口跳转。 | 阶段 3 / Step 3.2 |
| `miniprogram/pages/scene/scene.wxml` | 将场景学习首页从占位结构替换为 Classroom 预览、进度和三个学习模式入口。 | 阶段 3 / Step 3.2 |
| `miniprogram/pages/scene/scene.wxss` | 为场景学习首页补充基础浅色 UI、场景预览、进度条和等高学习模式卡片样式。 | 阶段 3 / Step 3.2 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 封装场景学习首页展示模型、学习进度展示和学习模式入口路由。 | 阶段 3 / Step 3.2 |
| `tests/sceneViewModel.test.ts` | 使用 Vitest 覆盖场景学习首页 view model、进度计算、学习模式路由和收藏夹 / 错题夹不在场景页展示的规则。 | 阶段 3 / Step 3.2 |

## 26. 阶段 3 / Step 3.3 基础导航与全局入口更新

`miniprogram/app.json` 现在定义 Home / Learn / Review / Me 四个底部导航入口。当前信息架构约定为：

- Home：场景选择页，展示 Classroom 和 Coming soon 场景。
- Learn：当前学习场景的学习首页。MVP 只有 Classroom，因此直接进入 Learn 时显示 Classroom 学习首页。
- Review：跨场景复习入口，集中承载收藏夹和错题夹入口。
- Me：轻量个人页，不做登录，只展示本地学习统计和 mock ASR 状态。

当前页面职责变化：

- 首页 Classroom 场景卡通过 `wx.switchTab` 进入 Learn tab，不再使用 `navigateTo` 进入 tabBar 页面。
- Learn tab 中单词记忆、听力 + 默写、听力 + 口语三个学习模式入口不再 `navigateTo` 独立普通页面，而是在 `pages/scene/scene` 内设置 `activeMode` 并切换当前 tab 内的模式视图，避免底部 tabBar 过渡消失。
- 当前 tab 内模式视图提供 `返回 Classroom` 按钮，返回动作为清空 `activeMode` 并回到 Classroom 学习首页。
- 单词记忆、听力 + 默写、听力 + 口语三个独立页面文件暂时保留，避免本次体验修复扩大为大范围页面重构。
- Review 页展示收藏夹和错题夹两个全局入口，点击后分别进入 `/pages/favorites/favorites` 和 `/pages/mistakes/mistakes`。
- Me 页通过 `progressService`、`favoriteService` 和 `mistakeService` 读取本地数据，展示已学单词数、收藏数、错题数和 `Mock ASR enabled`。

运行时注意事项：

- Review / Me / 三个学习占位页当前不依赖新增页面 helper 模块，避免微信开发者工具运行时报辅助模块未编译或未定义。
- 与页面展示规则相关的辅助 view model 测试仍保留在 Vitest 中，用于约束 Step 3.3 的导航与轻量页面规则。
- Learn tab 使用 `miniprogram/pages/scene/scene.wxss` 中的固定高度布局承载 Classroom 学习首页和当前 tab 内模式视图；页面主体尽量保持一屏展示，同时外层容器允许 `overflow-y: auto`，用于适配小屏和特殊机型，避免底部 tabBar 遮挡学习模式入口。

`tests/navigation.test.ts`、`tests/learningPageViewModel.test.ts`、`tests/reviewViewModel.test.ts`、`tests/meViewModel.test.ts` 和 `tests/sceneInlineMode.test.ts` 验证：

- `app.json` 注册 Home / Learn / Review / Me 四个底部 tab；
- Learn tab 学习模式入口不再使用 `wx.navigateTo`，而是在当前 tab 内切换 `activeMode`；
- 学习占位页仍保留返回 Classroom 的 switchTab 行为；
- Review 页预留收藏夹和错题夹全局入口；
- Me 页统计来自本地进度、收藏和错题数据。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/app.json` | 新增 Home / Learn / Review / Me 底部导航配置。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/index/index.ts` | 将 Classroom 场景卡行为调整为 `wx.switchTab` 进入 Learn tab。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/index/indexViewModel.ts` | 将 Classroom 点击动作建模为 `switchTab`，匹配 tabBar 页面导航规则。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/memory/memory.ts` | 为单词记忆占位页补充返回 Classroom 的页面数据和交互。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/memory/memory.wxml` | 为单词记忆占位页补充返回 Classroom 按钮。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/memory/memory.wxss` | 为单词记忆占位页补充返回按钮样式。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-writing/listening-writing.ts` | 为听力 + 默写占位页补充返回 Classroom 的页面数据和交互。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-writing/listening-writing.wxml` | 为听力 + 默写占位页补充返回 Classroom 按钮。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-writing/listening-writing.wxss` | 为听力 + 默写占位页补充返回按钮样式。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-speaking/listening-speaking.ts` | 为听力 + 口语占位页补充返回 Classroom 的页面数据和交互。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-speaking/listening-speaking.wxml` | 为听力 + 口语占位页补充返回 Classroom 按钮。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/listening-speaking/listening-speaking.wxss` | 为听力 + 口语占位页补充返回按钮样式。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/review/review.ts` | 将 Review 从占位页调整为全局复习入口页，处理收藏夹和错题夹跳转。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/review/review.wxml` | 展示收藏夹和错题夹两个全局复习入口。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/review/review.wxss` | 为 Review 全局入口页补充基础浅色 UI 和入口卡片样式。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/me/me.ts` | 接入本地进度、收藏和错题数据，生成轻量个人页统计。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/me/me.wxml` | 展示昵称占位、本地统计和 mock ASR 状态。 | 阶段 3 / Step 3.3 |
| `miniprogram/pages/me/me.wxss` | 为 Me 轻量个人页补充统计卡和状态卡样式。 | 阶段 3 / Step 3.3 |
| `tests/navigation.test.ts` | 使用 Vitest 覆盖底部导航配置。 | 阶段 3 / Step 3.3 |
| `tests/learningPageViewModel.test.ts` | 使用 Vitest 覆盖学习占位页返回 Classroom 的规则。 | 阶段 3 / Step 3.3 |
| `tests/reviewViewModel.test.ts` | 使用 Vitest 覆盖 Review 全局入口结构。 | 阶段 3 / Step 3.3 |
| `tests/meViewModel.test.ts` | 使用 Vitest 覆盖 Me 页轻量统计模型。 | 阶段 3 / Step 3.3 |
| `tests/sceneLayout.test.ts` | 使用 Vitest 约束 Learn tab 的场景首页布局：页面外层允许纵向滚动、保留底部安全区，并固定当前场景图和学习模式卡片尺寸。 | Learn 页底部导航适配修复 |
| `miniprogram/pages/scene/scene.ts` | 将 Learn tab 学习模式入口从 `wx.navigateTo` 改为当前 tab 内设置 `activeMode`，并提供返回 Classroom 首页的状态切换。 | Learn tab 学习模式内联切换体验修复 |
| `miniprogram/pages/scene/scene.wxml` | 为 Learn tab 增加 Classroom 首页和当前模式视图的条件渲染结构。 | Learn tab 学习模式内联切换体验修复 |
| `miniprogram/pages/scene/scene.wxss` | 为 Learn tab 当前模式视图补充基础样式和返回按钮样式。 | Learn tab 学习模式内联切换体验修复 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 将学习模式入口动作从普通页面 `navigate` 调整为当前 tab 内 `selectMode`。 | Learn tab 学习模式内联切换体验修复 |
| `tests/sceneInlineMode.test.ts` | 使用 Vitest 约束 Learn tab 学习模式入口不再调用 `wx.navigateTo`，防止底部 tabBar 过渡消失问题回归。 | Learn tab 学习模式内联切换体验修复 |

## 27. 阶段 4 / Step 4.1 单词记忆页场景图展示更新

`miniprogram/pages/memory/` 现在是单词记忆模式的第一步页面，不再只是占位页。当前 Step 4.1 只负责稳定展示 Classroom 场景图，并为后续透明热区覆盖、首次引导和单词卡弹层预留页面基础。

当前页面职责：

- 读取页面参数 `sceneId`，默认使用 `classroom`。
- 通过 `sceneService` 获取场景详情；未知或未开放场景显示 `Coming soon` 轻提示。
- 展示 `教室 Classroom`、`单词记忆`、简短说明文案和 Classroom 场景图。
- 使用 16:9 场景图容器与 `aspectFit` 图片模式，保证当前低保真占位图在常见手机宽度下不变形。
- 保留底部 `返回 Classroom` 主按钮，返回动作为 `wx.switchTab({ url: "/pages/scene/scene" })`。

运行时注意事项：

- `memory.ts` 当前保持页面运行时自包含，不依赖新增页面 helper 模块，避免微信开发者工具运行时报辅助模块未编译或未定义。
- `miniprogram/pages/memory/memoryViewModel.ts` 只用于 Vitest 约束 Step 4.1 的展示模型，当前不由小程序页面运行时直接 import。
- 当前页面文案避免提示“点击物品”，因为透明热区和点击识别将在 Step 4.2 才接入。

`tests/memoryLayout.test.ts`、`tests/memoryRuntime.test.ts` 和 `tests/memoryViewModel.test.ts` 验证：

- Memory 页面使用稳定的场景图容器和 `aspectFit` 图片模式；
- Memory 页面只保留底部返回按钮，不再显示右上角重复返回按钮；
- `memory.ts` 不直接依赖 `./memoryViewModel`，避免小程序运行时 helper 模块缺失；
- 展示模型包含 Classroom 场景名称、场景图路径、16:9 图片比例和返回 Classroom 的 switchTab 行为。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/memory/memory.ts` | 将单词记忆页从占位逻辑调整为读取 Classroom 场景并生成场景图展示数据，同时保持运行时不依赖新增页面 helper。 | 阶段 4 / Step 4.1 |
| `miniprogram/pages/memory/memory.wxml` | 将单词记忆页结构替换为场景名称、标题、说明文案、16:9 场景图和底部返回按钮。 | 阶段 4 / Step 4.1 |
| `miniprogram/pages/memory/memory.wxss` | 为单词记忆页补充基础浅色 UI、稳定 16:9 场景图容器和底部返回按钮样式。 | 阶段 4 / Step 4.1 |
| `miniprogram/pages/memory/memoryViewModel.ts` | 为 Vitest 提供单词记忆页 Step 4.1 展示模型约束；当前不由小程序运行时直接依赖。 | 阶段 4 / Step 4.1 |
| `tests/memoryLayout.test.ts` | 使用 Vitest 约束 Memory 页面场景图布局和底部返回按钮规则。 | 阶段 4 / Step 4.1 |
| `tests/memoryRuntime.test.ts` | 使用 Vitest 约束 `memory.ts` 不依赖新增页面 helper，防止微信运行时 helper 模块缺失回归。 | 阶段 4 / Step 4.1 |
| `tests/memoryViewModel.test.ts` | 使用 Vitest 覆盖 Memory 页面 Step 4.1 展示模型。 | 阶段 4 / Step 4.1 |

## 28. 阶段 4 / Step 4.2 透明热区覆盖更新

Memory Mode 的透明热区当前优先接入 `miniprogram/pages/scene/` 的 Learn tab 内联模式视图，而不是继续扩展独立 `miniprogram/pages/memory/` 页面。这样可以延续已验证通过的交互方向：点击学习模式后仍停留在 Learn tab 内，底部 tabBar 不消失。

当前职责：

- `sceneViewModel` 根据当前 Classroom 场景的 `baseWidth`、`baseHeight` 和 20 个单词的 `position` 生成 `memoryHotspots`。
- 每个 `memoryHotspots` 项包含 `wordId`、英文 `label` 和可直接用于 WXML 的百分比定位样式。
- Memory 内联视图在场景图上覆盖透明 `view` 热区。
- 点击热区时通过 `wordId` 识别单词，并在当前 Step 中显示“已识别：英文单词”。
- 点击场景图空白区域只显示轻提示，不弹出单词卡，也不记录错题。

运行时注意事项：

- 热区使用 `catchtap="onMemoryHotspotTap"`，避免热区点击继续冒泡触发空白区域提示。
- 当前热区仍基于低保真占位图和临时坐标，只用于跑通功能闭环；后续替换正式教室图片后，需要同步更新图片画布尺寸和 20 个物品热区坐标。
- 本步骤只完成点击识别，不实现完整单词卡；单词卡将在后续 Step 4.4 接入。

`tests/sceneMemoryHotspots.test.ts` 验证：

- Classroom 会生成 20 个透明热区；
- 代表性物品 `projector` 的 `wordId`、英文 label 和百分比定位样式正确；
- Memory 内联视图中存在 `memoryHotspots` 循环、`data-word-id`、热区 `catchtap` 和空白区域 `bindtap`。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | 为 Learn tab 内联 Memory 视图生成 20 个透明热区展示数据。 | 阶段 4 / Step 4.2 |
| `miniprogram/pages/scene/scene.ts` | 接入 Classroom 单词数据，处理 Memory 热区点击和空白区域点击反馈。 | 阶段 4 / Step 4.2 |
| `miniprogram/pages/scene/scene.wxml` | 在 Learn tab 内联 Memory 场景图上覆盖透明热区。 | 阶段 4 / Step 4.2 |
| `miniprogram/pages/scene/scene.wxss` | 为 Memory 透明热区补充绝对定位和按下态调试反馈样式。 | 阶段 4 / Step 4.2 |
| `tests/sceneMemoryHotspots.test.ts` | 使用 Vitest 约束 Memory 热区数据生成、WXML 覆盖层绑定和空白点击行为。 | 阶段 4 / Step 4.2 |

## 29. 阶段 4 / Step 4.3 首次轻引导更新

Memory Mode 现在接入一次性轻引导，用于帮助首次进入单词记忆模式的用户理解“场景图里的物品可以点击”。该能力继续落在 Learn tab 内联 Memory 视图中，保持底部 tabBar 可见。

当前职责：

- `onboardingService` 负责读取和写入 `sceneenglish:onboarding` 本地缓存。
- `shouldShowMemoryGuide()` 根据 `memoryGuideCompleted` 判断是否需要展示 Memory 引导。
- `completeMemoryGuide()` 将 `memoryGuideCompleted` 写为 `true`，并更新 `updatedAt`。
- `sceneViewModel` 提供 `showMemoryGuide` 默认值和 `memoryGuideWordId: "projector"`，作为页面初始状态和高亮目标。
- `scene.ts` 在用户进入 Memory 模式时读取引导状态；用户点击任意热区或点击“我知道了”后完成引导并写入本地缓存。
- `scene.wxml` 在 Memory 场景图上展示引导浮层，并对 `projector` 热区追加高亮样式。
- `scene.wxss` 定义引导热区高亮、引导浮层、提示文案和关闭按钮样式。

运行时注意事项：

- 当前 Step 4.3 只负责引导用户点击，不实现完整单词卡；点击热区后仍沿用 Step 4.2 的“已识别：英文单词”反馈。
- 引导状态写入本地缓存后，后续再次进入 Memory 模式不再重复展示。
- 如果开发者需要重新验证首次引导，应在微信开发者工具中清空本地缓存，或移除 `sceneenglish:onboarding`。

`tests/onboardingService.test.ts` 和 `tests/sceneMemoryGuide.test.ts` 验证：

- 空缓存时 Memory 引导应展示；
- 完成引导后会写入 `sceneenglish:onboarding`；
- 完成后再次读取时不再展示；
- Memory 视图包含引导浮层、关闭按钮和 `projector` 高亮绑定；
- `scene.ts` 会调用 onboarding service 读取和完成引导。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/onboardingService.ts` | 封装首次引导状态读取、判断和完成写入，当前用于 Memory Mode 一次性轻引导。 | 阶段 4 / Step 4.3 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 为 Learn tab 内联 Memory 视图补充引导默认状态和 `projector` 引导目标。 | 阶段 4 / Step 4.3 |
| `miniprogram/pages/scene/scene.ts` | 在进入 Memory 模式时读取引导状态，并在点击热区或关闭引导时写入完成状态。 | 阶段 4 / Step 4.3 |
| `miniprogram/pages/scene/scene.wxml` | 在 Learn tab 内联 Memory 视图中渲染首次引导浮层、关闭按钮和引导热区高亮绑定。 | 阶段 4 / Step 4.3 |
| `miniprogram/pages/scene/scene.wxss` | 为首次轻引导补充高亮热区、引导浮层和关闭按钮样式。 | 阶段 4 / Step 4.3 |
| `tests/onboardingService.test.ts` | 使用 Vitest 覆盖 Memory 引导首次展示、完成状态写入和后续不再展示。 | 阶段 4 / Step 4.3 |
| `tests/sceneMemoryGuide.test.ts` | 使用 Vitest 约束 Learn tab Memory 引导 UI、`projector` 高亮目标和 onboarding service 调用。 | 阶段 4 / Step 4.3 |

## 30. 阶段 4 / Step 4.4 单词卡更新

Memory Mode 现在在 Learn tab 内联视图中打开单词卡。用户点击 Classroom 场景图中的透明热区后，页面通过 `wordId` 从 `wordService` 读取单词详情，并构建轻量单词卡状态。

当前职责：

- `miniprogram/pages/scene/sceneViewModel.ts` 定义 `SceneMemoryWordCard`，并通过 `createMemoryWordCard(word)` 从 `Word` 生成页面展示状态。
- `SceneMemoryWordCard` 当前只包含单词基础信息和 1 条 Useful expression：`wordId`、`en`、`cn`、`phonetic`、`expressionEn`、`expressionCn`、`showExpressionCn`。
- `miniprogram/pages/scene/scene.ts` 在 Memory 热区点击时读取单词详情，设置 `selectedMemoryWordCard`，并读取表达翻译轻引导状态。
- `onToggleMemoryTranslation` 负责切换 Useful expression 中文翻译展开状态；首次使用时调用 `completeMemoryTranslationGuide()` 写入本地缓存。
- `onCloseMemoryWordCard` 负责关闭单词卡并清理表达翻译引导显示状态。
- `miniprogram/services/onboardingService.ts` 的 `OnboardingState` 新增 `memoryTranslationGuideCompleted`，用于记录 Useful expression 中文展开引导是否完成。
- `miniprogram/data/scenes.ts` 中的 20 条 Useful expression 已调整为更自然、稍复杂且不全是问句的课堂 / 校园表达。
- Memory 单词卡不展示例句区块；`Word` 数据中的 `exampleEn` / `exampleCn` 字段继续保留，供数据完整性和后续可能的其他学习形态使用。
- Memory 视图中旧的“已打开 xxx / 已识别 xxx”占位提示已移除，对应页面状态 `selectedMemoryWordLabel` 已清理。
- 单词卡布局改为场景图下方的页面流卡片，不再使用底部 fixed 浮层；展开中文翻译时上边界保持稳定、下边界向下延伸。
- 关闭入口是卡片右上角的小圆形叉号。

运行时注意事项：

- 当前 Step 4.4 只实现单词卡内容展示、Useful expression 中文展开和关闭；音频播放将在 Step 4.5 接入。
- 当前 Step 4.4 不记录 learned，也不接入收藏状态；相关本地进度和收藏写入将在 Step 4.6 接入。
- 表达翻译引导和 Memory 点击引导共用 `sceneenglish:onboarding` 本地缓存对象，但使用不同字段互不覆盖。

`tests/sceneMemoryWordCard.test.ts` 验证：

- `createMemoryWordCard` 只生成 Useful expression 展示状态，不包含 example 展示字段；
- Memory WXML 中单词卡只展示 Useful expression，不包含 Example 区块；
- Useful expression 英文句子绑定点击展开中文；
- 表达翻译轻引导存在；
- 关闭按钮使用小圆形叉号，不使用大按钮；
- 旧的“已打开”占位提示和 `selectedMemoryWordLabel` 状态不再出现；
- 单词卡样式在页面流中展开，不再使用底部 fixed 浮层。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/data/scenes.ts` | 调整 20 条 Classroom Useful expression，使其更自然、稍复杂且不全是问句。 | 阶段 4 / Step 4.4 |
| `miniprogram/types/index.ts` | 为 `OnboardingState` 补充表达翻译轻引导完成状态。 | 阶段 4 / Step 4.4 |
| `miniprogram/services/onboardingService.ts` | 补充 Useful expression 中文展开引导的读取和完成写入能力。 | 阶段 4 / Step 4.4 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 定义 Memory 单词卡展示状态并生成只含 Useful expression 的卡片模型。 | 阶段 4 / Step 4.4 |
| `miniprogram/pages/scene/scene.ts` | 在 Memory 热区点击时打开单词卡，并处理 Useful expression 中文展开、轻引导完成和关闭交互。 | 阶段 4 / Step 4.4 |
| `miniprogram/pages/scene/scene.wxml` | 渲染 Memory 单词卡、Useful expression 点击区、表达翻译轻引导和右上角小圆形关闭入口。 | 阶段 4 / Step 4.4 |
| `miniprogram/pages/scene/scene.wxss` | 为页面流单词卡、展开翻译、小圆形关闭按钮和表达翻译轻引导补充样式。 | 阶段 4 / Step 4.4 |
| `tests/sceneMemoryWordCard.test.ts` | 使用 Vitest 约束 Memory 单词卡内容、翻译展开、关闭入口、占位提示移除和页面流展开样式。 | 阶段 4 / Step 4.4 |
| `tests/onboardingService.test.ts` | 覆盖表达翻译轻引导首次展示和完成后不再展示。 | 阶段 4 / Step 4.4 |
| `tests/scenes.test.ts` | 补充 Useful expression 内容质量约束，避免表达全部变成问句。 | 阶段 4 / Step 4.4 |
| `tests/wordService.test.ts` | 更新服务层测试中的 Useful expression 预期内容。 | 阶段 4 / Step 4.4 |

## 31. 阶段 4 / Step 4.5 单词卡音频播放更新

Memory Mode 单词卡现在提供单词音频播放入口。该能力继续落在 `miniprogram/pages/scene/` 的 Learn tab 内联 Memory 视图中，不新增独立页面流程，也不进入收藏或已学记录逻辑。

当前职责：

- `miniprogram/pages/scene/sceneViewModel.ts` 的 `SceneMemoryWordCard` 新增 `audioUrl`，由 `createMemoryWordCard(word)` 从 `Word.audioUrl` 透传到页面状态。
- `miniprogram/pages/scene/scene.wxml` 在单词音标旁渲染圆形播放按钮，并绑定 `onPlayMemoryWordAudio`。
- `miniprogram/pages/scene/scene.ts` 负责 Memory 单词卡音频的运行时管理：点击播放时创建 `wx.createInnerAudioContext()`，播放新音频前释放旧上下文，关闭卡片、返回 Classroom、页面隐藏或卸载时停止/释放当前音频。
- `miniprogram/pages/scene/scene.wxss` 为音频按钮补充圆形按钮和按下态样式。

运行时注意事项：

- scene 页当前不直接 import `miniprogram/services/audioService.ts`。微信开发者工具中曾出现 `services/audioService.js is not defined`，导致页面脚本在注册 `Page({...})` 前中断；因此本步骤采用页面内小范围音频上下文管理，延续此前对小程序页面运行时 helper module 风险的处理方式。
- `miniprogram/services/audioService.ts` 仍保留为服务层音频封装，并由 `tests/audioService.test.ts` 覆盖；后续如果确认微信开发者工具编译链能稳定收集 service helper，再考虑统一复用。
- 当前 `miniprogram/assets/audio/*.mp3` 是 Step 1.4 准备的静音占位文件。播放按钮用于验证音频路径和播放流程，真实用户测试前需要替换为审核过的单词发音音频。
- Step 4.5 不记录 learned，也不接入 favorite；相关本地进度和收藏写入将在 Step 4.6 接入。

`tests/sceneMemoryWordCard.test.ts` 验证：

- `createMemoryWordCard` 会携带 `audioUrl`；
- Memory 单词卡 WXML 存在音频播放按钮和点击绑定；
- scene 页存在 `playMemoryWordAudio`、`stopMemoryWordAudio`、`createInnerAudioContext` 和播放失败轻提示；
- scene 页不再直接依赖 `../../services/audioService`，防止小程序运行时 helper module 缺失问题回归；
- 音频按钮样式存在。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | 为 Memory 单词卡展示状态补充 `audioUrl`。 | 阶段 4 / Step 4.5 |
| `miniprogram/pages/scene/scene.ts` | 在 scene 页面内管理单词卡音频播放、停止、释放和播放失败轻提示，避免运行时 helper module 缺失中断页面注册。 | 阶段 4 / Step 4.5 |
| `miniprogram/pages/scene/scene.wxml` | 在 Memory 单词卡音标旁渲染圆形音频播放按钮并绑定点击事件。 | 阶段 4 / Step 4.5 |
| `miniprogram/pages/scene/scene.wxss` | 为单词卡音频播放按钮补充圆形按钮、图标和按下态样式。 | 阶段 4 / Step 4.5 |
| `tests/sceneMemoryWordCard.test.ts` | 约束单词卡 `audioUrl`、音频按钮、播放方法、运行时依赖边界和样式。 | 阶段 4 / Step 4.5 |

## 32. 阶段 4 / Step 4.6 单词卡收藏和已学记录更新

Memory Mode 单词卡现在接入收藏状态和已学记录。该能力继续落在 `miniprogram/pages/scene/` 的 Learn tab 内联 Memory 视图中，复用已有 `favoriteService` 和 `progressService`，不新增页面或依赖。

当前职责：

- `miniprogram/pages/scene/sceneViewModel.ts` 的 `SceneMemoryWordCard` 新增 `isFavorite`，由 `createMemoryWordCard(word, isFavorite)` 带入页面状态。
- `miniprogram/pages/scene/scene.ts` 在热区打开单词卡时调用 `recordLearnedWord(sceneId, wordId)` 记录已学，并通过 `refreshSceneProgress(sceneId)` 刷新 `progressLabel` 和 `progressPercent`。
- `miniprogram/pages/scene/scene.ts` 在打开单词卡时调用 `isFavorite(wordId)` 读取收藏状态，并在 `onToggleMemoryFavorite` 中调用 `addFavorite` 或 `removeFavorite` 更新本地收藏缓存。
- `miniprogram/pages/scene/scene.wxml` 在音频按钮旁渲染小星标收藏按钮，绑定 `onToggleMemoryFavorite`，并根据 `selectedMemoryWordCard.isFavorite` 切换选中状态。
- `miniprogram/pages/scene/scene.wxss` 为收藏星标补充圆形按钮、选中态和按下态样式。

运行时注意事项：

- `recordLearnedWord` 已在 service 层处理去重，因此重复打开同一个单词不会重复增加已学数量。
- 收藏状态写入 `sceneenglish:favorites`，当前 Step 只负责单词卡层面的写入和显示；收藏夹列表页面仍留到后续阶段实现。
- 打开单词卡后会即时刷新 Learn tab 当前页面的进度字段，用户返回 Classroom 学习首页时能看到最新进度。

`tests/sceneMemoryWordCard.test.ts` 验证：

- `createMemoryWordCard` 支持 `isFavorite` 展示状态；
- Memory 单词卡 WXML 存在收藏按钮、收藏状态绑定和选中态 class；
- scene 页调用 `recordLearnedWord`、`isFavorite`、`addFavorite`、`removeFavorite` 和 `refreshSceneProgress`；
- 收藏按钮样式和选中态样式存在。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | 为 Memory 单词卡展示状态补充 `isFavorite`，并支持创建卡片时传入当前收藏状态。 | 阶段 4 / Step 4.6 |
| `miniprogram/pages/scene/scene.ts` | 在打开 Memory 单词卡时记录已学、刷新进度、读取收藏状态，并处理收藏 / 取消收藏。 | 阶段 4 / Step 4.6 |
| `miniprogram/pages/scene/scene.wxml` | 在 Memory 单词卡音频按钮旁渲染星标收藏按钮并绑定点击事件。 | 阶段 4 / Step 4.6 |
| `miniprogram/pages/scene/scene.wxss` | 为单词卡收藏按钮补充圆形按钮、选中态和按下态样式。 | 阶段 4 / Step 4.6 |
| `tests/sceneMemoryWordCard.test.ts` | 约束单词卡收藏状态、收藏按钮绑定、已学记录调用、进度刷新和收藏样式。 | 阶段 4 / Step 4.6 |

## 33. 阶段 5 / Step 5.1 收藏夹列表更新

Favorites 页面现在展示真实收藏列表。该页面属于全局复习入口，从 `Review` tab 进入，不放在具体 Classroom 学习首页中。

当前职责：

- `miniprogram/pages/favorites/favorites.ts` 在页面显示时通过 `getFavorites()` 读取本地收藏记录，并用 `getWordById()`、`getSceneById()` 拼装页面列表数据。
- `favorites.ts` 保留 `selectedFavoriteWordIds` 页面状态，用于记录当前展开的收藏项；该状态是数组，因此多个卡片可以同时展开。
- `onToggleFavoriteDetail` 根据点击项的 `wordId` 切换该项是否展开，再重新生成页面数据。
- `miniprogram/pages/favorites/favorites.wxml` 渲染收藏列表、空状态和收藏项详情；详情只展示音标和 1 条 Useful expression，不展示 Example / 例句。
- `miniprogram/pages/favorites/favorites.wxss` 为收藏页、列表卡片、场景标签、展开详情、Useful expression 和空状态提供基础样式。
- `miniprogram/pages/favorites/favoritesViewModel.ts` 作为测试用展示模型，约束收藏列表的数据结构和空状态；小程序运行时页面不 import 该 helper，避免此前 helper module 缺失类问题回归。

运行时注意事项：

- 当前 Step 5.1 只实现收藏夹列表查看和详情展开；音频播放与取消收藏留到 Step 5.2。
- 收藏页读取的是 `sceneenglish:favorites`，因此 Memory 单词卡中的星标状态和 Favorites 列表共享同一份本地数据。
- Favorites 中展开的句子同样使用 `Word.expressionEn` / `Word.expressionCn`，保持与 Memory 单词卡的内容策略一致。

`tests/favoritesPage.test.ts` 验证：

- `createFavoritesViewModel` 能从收藏记录生成列表项；
- 空收藏时展示空状态；
- WXML 渲染收藏列表、空状态、点击展开绑定、音标和 Useful expression；
- WXML 不包含 Example、`exampleEn` 或 `exampleCn`；
- 页面运行时使用 service 读取收藏、单词和场景数据，不 import `./favoritesViewModel`；
- 样式包含收藏列表、收藏项、展开详情、Useful expression 和空状态。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/favorites/favorites.ts` | 从本地收藏记录构建真实收藏列表，并支持多个收藏项同时展开或收起详情。 | 阶段 5 / Step 5.1 |
| `miniprogram/pages/favorites/favorites.wxml` | 渲染 Favorites 列表、空状态、收藏项基础信息和展开后的音标 / Useful expression。 | 阶段 5 / Step 5.1 |
| `miniprogram/pages/favorites/favorites.wxss` | 为收藏页、列表项、展开详情、Useful expression 和空状态补充基础样式。 | 阶段 5 / Step 5.1 |
| `miniprogram/pages/favorites/favoritesViewModel.ts` | 提供测试用 Favorites 展示模型，约束收藏列表和空状态数据结构。 | 阶段 5 / Step 5.1 |
| `tests/favoritesPage.test.ts` | 约束 Favorites 列表、空状态、详情展开、Useful expression 内容和运行时依赖边界。 | 阶段 5 / Step 5.1 |

## 34. Memory 单词记忆界面进度条更新

Learn tab 内联 Memory 视图现在也展示当前 Classroom 的已学进度。该进度与 Classroom 学习首页共用同一组页面状态，不新增独立业务逻辑。

当前职责：

- `miniprogram/pages/scene/scene.wxml` 在 `activeMode === "memory"` 时渲染 `memory-progress-section`，展示 `单词进度`、`progressLabel` 和基于 `progressPercent` 的进度条。
- `miniprogram/pages/scene/scene.wxss` 为 Memory 视图内进度条补充紧凑的页面流样式。
- `miniprogram/pages/scene/scene.ts` 继续通过已有 `recordLearnedWord` 和 `refreshSceneProgress` 更新 `progressLabel` / `progressPercent`；Memory 进度条自动复用这些状态。

运行时注意事项：

- 该进度条只在 Memory 单词记忆界面展示，不影响听力默写和听力口语占位视图。
- 该进度条使用与 Classroom 学习首页相同的数据源，因此重复点击同一单词不会重复增加进度。

`tests/sceneMemoryWordCard.test.ts` 验证：

- Memory 视图包含 `memory-progress-section`；
- Memory 视图展示 `单词进度` 和 `progressLabel`；
- 进度条宽度绑定 `progressPercent`；
- 样式使用页面流布局，不使用 fixed 定位。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.wxml` | 在 Learn tab 内联 Memory 视图中渲染单词进度文字和进度条。 | Memory 进度条补充 |
| `miniprogram/pages/scene/scene.wxss` | 为 Memory 视图内进度条补充紧凑页面流样式。 | Memory 进度条补充 |
| `tests/sceneMemoryWordCard.test.ts` | 约束 Memory 视图内进度条的渲染、数据绑定和样式边界。 | Memory 进度条补充 |

## 35. 阶段 5 / Step 5.2 收藏夹播放和取消收藏更新

Favorites 页面现在支持在收藏夹内播放单词音频并取消收藏。该能力继续落在 `miniprogram/pages/favorites/` 页面内，复用已有 `favoriteService` 的取消收藏能力，不新增依赖或页面。

当前职责：

- `miniprogram/pages/favorites/favoritesViewModel.ts` 的 `FavoriteListItem` 新增 `audioUrl`，用于测试约束收藏项携带对应单词音频路径。
- `miniprogram/pages/favorites/favorites.ts` 的页面列表项同步携带 `audioUrl`，并继续由 `getFavorites()`、`getWordById()` 和 `getSceneById()` 拼装运行时数据。
- `favorites.ts` 新增收藏夹页面内音频上下文管理：播放前释放旧上下文，页面隐藏时停止音频，页面卸载时释放音频上下文。
- `onPlayFavoriteAudio` 通过展开项中的 `audioUrl` 调用 `wx.createInnerAudioContext()` 播放音频；播放失败时显示“音频暂时无法播放”轻提示。
- `onRemoveFavorite` 通过 `removeFavorite(wordId)` 写入 `sceneenglish:favorites`，并立即重新生成 Favorites 页面数据。
- 取消收藏时会同步移除该词的展开状态，避免刷新后保留无效的 `selectedFavoriteWordIds`。
- `miniprogram/pages/favorites/favorites.wxml` 在展开详情中渲染 `Play` 和 `Remove` 按钮，并使用 `catchtap` 避免按钮点击冒泡触发卡片展开 / 收起。
- `miniprogram/pages/favorites/favorites.wxss` 为收藏夹操作按钮补充基础样式。

运行时注意事项：

- 当前 Favorites 页面延续此前对小程序 helper module 运行时风险的处理方式，不直接 import `../../services/audioService`，而是在页面内管理小范围音频上下文。
- 当前 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频；播放按钮用于验证路径和播放流程，真实用户测试前需要替换为正式发音音频。
- 取消收藏后，Memory 单词卡再次打开同一单词时会通过 `favoriteService.isFavorite()` 读到最新状态，从而保持收藏状态同步。

`tests/favoritesPage.test.ts` 验证：

- `createFavoritesViewModel` 会为收藏项携带 `audioUrl`；
- Favorites WXML 存在播放按钮、取消收藏按钮、音频路径绑定和点击绑定；
- Favorites 页面运行时包含 `onPlayFavoriteAudio`、`onRemoveFavorite`、`playFavoriteAudio`、`stopFavoriteAudio` 和播放失败轻提示；
- Favorites 页面不直接依赖 `../../services/audioService`，防止小程序运行时 helper module 缺失问题回归；
- 样式包含收藏夹操作区、操作按钮和取消收藏按钮状态。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/favorites/favorites.ts` | 为 Favorites 页面补充收藏项音频播放、页面离开时音频停止 / 释放、取消收藏和列表即时刷新能力。 | 阶段 5 / Step 5.2 |
| `miniprogram/pages/favorites/favorites.wxml` | 在收藏项展开详情中渲染 `Play` 和 `Remove` 操作按钮，并绑定播放和取消收藏事件。 | 阶段 5 / Step 5.2 |
| `miniprogram/pages/favorites/favorites.wxss` | 为收藏夹播放和取消收藏操作区补充按钮布局、按下态和移除按钮样式。 | 阶段 5 / Step 5.2 |
| `miniprogram/pages/favorites/favoritesViewModel.ts` | 为测试用 Favorites 展示模型补充 `audioUrl` 字段，约束收藏项音频路径。 | 阶段 5 / Step 5.2 |
| `tests/favoritesPage.test.ts` | 约束 Favorites 页面音频播放、取消收藏、运行时依赖边界和操作按钮样式。 | 阶段 5 / Step 5.2 |

## 36. 阶段 6 / Step 6.1 听力 + 默写开始状态更新

Learn tab 内联“听力 + 默写”模式现在可以开始一轮练习。该步骤只建立练习开始状态，不实现听音找物点击判断、拼写输入或结束页。

当前职责：

- `miniprogram/pages/scene/sceneViewModel.ts` 新增 `SceneListeningWritingState` 和 `SceneListeningWritingQuestion`，用于表示听写模式当前题号、总题数、展示标签和当前题音频路径。
- `createEmptyListeningWritingState()` 提供听写模式的空状态，供 Classroom 首页、返回和非听写模式切换时复位。
- `createListeningWritingStartState(round, words)` 从当前练习轮次和词表中生成页面展示状态；首题展示为 `1 / 5`，并只暴露音频路径和内部题目信息，不暴露目标英文答案。
- `miniprogram/pages/scene/scene.ts` 在点击“听力 + 默写”入口时生成 5 题练习轮次，并写入 `listeningWritingRound` 与 `listeningWritingState`。
- `scene.ts` 为 Step 6.1 在页面内保留轻量 `createPracticeQuizRound` 实现，避免微信开发者工具运行时缺失 `services/quizService.js` 造成页面注册失败；通用 `quizService` 仍保留给 service 层测试和后续非页面逻辑。
- `scene.ts` 新增听写模式音频上下文管理，负责播放当前目标单词音频，并在返回 Classroom、页面隐藏和页面卸载时停止或释放音频。
- `miniprogram/pages/scene/scene.wxml` 为 `activeMode === "listeningWriting"` 渲染 Classroom 场景图、题号 `{{listeningWritingState.questionLabel}}` 和“播放单词音频”按钮。
- `miniprogram/pages/scene/scene.wxss` 为听写开始面板、题号行和播放按钮补充基础样式。

运行时注意事项：

- 听写开始面板不展示目标英文单词，避免用户在听音阶段直接看到答案。
- 当前音频资源仍是静音占位文件；按钮用于验证路径和播放流程，真实学习体验需要在 Step 6.1.5 替换为真实发音文件。
- 当前页面运行时不直接 import `../../services/quizService`，这是为了规避与此前 `audioService` 类似的小程序 helper module 缺失问题。

`tests/listeningWritingStart.test.ts` 验证：

- `scene.ts` 在选择听写模式时生成 5 题开始状态，并使用 `mode: "listeningWriting"` 和 `learnedWordIds`；
- `scene.ts` 不运行时 import `../../services/quizService`；
- WXML 渲染听写专用分支、题号和播放按钮；
- 页面内存在听写音频播放、停止和释放逻辑；
- WXSS 包含听写开始面板、题号行和播放按钮样式。

`tests/sceneViewModel.test.ts` 验证：

- `createListeningWritingStartState` 能从首题生成 `currentQuestionNumber: 1`、`totalQuestionCount: 5`、`questionLabel: "1 / 5"` 和目标单词音频路径。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | 为 Learn tab 内联听写模式补充开始状态类型、空状态和首题展示状态创建函数。 | 阶段 6 / Step 6.1 |
| `miniprogram/pages/scene/scene.ts` | 在选择听写模式时生成 5 题开始轮次，管理目标音频播放，并避免运行时 import `quizService`。 | 阶段 6 / Step 6.1 |
| `miniprogram/pages/scene/scene.wxml` | 渲染听写模式开始面板、当前题号和播放单词音频按钮。 | 阶段 6 / Step 6.1 |
| `miniprogram/pages/scene/scene.wxss` | 为听写开始面板、题号展示和播放按钮补充基础样式。 | 阶段 6 / Step 6.1 |
| `tests/listeningWritingStart.test.ts` | 约束听写模式开始状态、题号展示、播放入口、运行时依赖边界和样式。 | 阶段 6 / Step 6.1 |
| `tests/sceneViewModel.test.ts` | 补充听写开始状态的首题题号和音频路径单元测试。 | 阶段 6 / Step 6.1 |

## 37. 阶段 6 / Step 6.1.5 正式 Classroom 图片资源更新

Classroom 当前已从低保真占位图切换为正式风格场景图。该更新完成 Step 6.1.5 的图片资源部分；热区校准已在后续同一步维护中完成，真实音频替换仍需继续完成。

当前职责：

- `miniprogram/assets/picture/classroom.png` 是当前 Classroom 正式场景图资源，用于 Classroom 封面图和场景图展示。
- `miniprogram/data/scenes.ts` 中 Classroom 的 `coverImage` 和 `sceneImage` 均指向 `/assets/picture/classroom.png`。
- `miniprogram/assets/images/classroom-cover.png` 和 `miniprogram/assets/images/classroom.png` 已删除，避免旧占位图继续留在资源目录中造成混淆。
- `miniprogram/assets/images/coming-soon-cover.png` 继续保留，供 Lecture Hall、Dormitory、Cafeteria 三个 Coming soon 场景使用。
- `tests/assets.test.ts` 继续验证所有被场景数据引用的图片资源存在、非空且为 PNG。

运行时注意事项：

- 当前图片和热区坐标已经绑定到正式 Classroom 图；如果后续再次替换图片，必须重新校准 `classroomWords[].position`。
- 当前图片只解决正式视觉资源接入和热区校准；20 个 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/assets/picture/classroom.png` | 当前 Classroom 正式场景图资源，同时作为 Classroom 封面和学习场景图使用。 | 阶段 6 / Step 6.1.5 |
| `miniprogram/assets/images/classroom-cover.png` | 已删除，旧 Classroom 封面占位图不再使用。 | 阶段 6 / Step 6.1.5 |
| `miniprogram/assets/images/classroom.png` | 已删除，旧 Classroom 场景占位图不再使用。 | 阶段 6 / Step 6.1.5 |
| `miniprogram/data/scenes.ts` | 将 Classroom 的 `coverImage` 和 `sceneImage` 更新为 `/assets/picture/classroom.png`。 | 阶段 6 / Step 6.1.5 |
| `tests/assets.test.ts` | 更新 Classroom 图片资源测试文案，继续覆盖图片存在性和 PNG 文件头。 | 阶段 6 / Step 6.1.5 |
| `tests/memoryViewModel.test.ts` | 更新 Memory 展示模型中的 Classroom 场景图路径预期。 | 阶段 6 / Step 6.1.5 |
| `tests/sceneViewModel.test.ts` | 更新 Learn tab 场景展示模型中的 Classroom 场景图路径预期。 | 阶段 6 / Step 6.1.5 |

## 38. 阶段 6 / Step 6.1.5 正式 Classroom 热区校准更新

Classroom 正式图片热区现在已重新校准。该更新继续落在 `miniprogram/data/scenes.ts` 的静态词表数据中，不新增页面、服务或依赖。

当前职责：

- Classroom 场景的 `baseWidth` / `baseHeight` 已从旧占位图尺寸改为正式图片实际尺寸 `1672 x 941`。
- `classroomWords[].position` 已基于正式 Classroom 图片重新标定 20 个物品热区。
- 热区坐标仍使用原始图片像素坐标，由 `miniprogram/utils/hotspot.ts` 在页面渲染时换算为百分比。
- 小物件热区优先保证移动端可点击性，其中 chalk 的热区覆盖黑板托盘上的单根粉笔并适度放大。
- `memory-bank/design-document.md` 中 Classroom 数据样例同步记录正式图片尺寸。

运行时注意事项：

- Memory Mode 当前热区点击应与正式 Classroom 图片物品位置对齐。
- 后续 Step 6.2 的听音找物点击判断可以复用同一组 `classroomWords[].position` 数据。
- 如果后续再次更换 Classroom 图片或裁切比例，必须同步更新 `baseWidth` / `baseHeight`、20 个 `position` 和对应测试。
- 真实音频替换尚未完成，当前 `miniprogram/assets/audio/*.mp3` 仍为静音占位文件。

`tests/scenes.test.ts` 验证：

- Classroom 正式图片尺寸为 `1672 x 941`；
- 20 个 Classroom 热区坐标与当前正式图校准结果一致；
- 词表数量、音频路径、音标和 Useful expression 质量约束继续通过。

`tests/sceneMemoryHotspots.test.ts` 和 `tests/memoryViewModel.test.ts` 验证：

- Memory 热区百分比样式使用新图尺寸换算；
- Memory 展示模型中的图片比例与正式图尺寸一致。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/data/scenes.ts` | 将 Classroom 基准尺寸更新为 `1672 x 941`，并重新标定 20 个正式图热区坐标。 | 阶段 6 / Step 6.1.5 |
| `memory-bank/design-document.md` | 同步 Classroom 数据样例中的正式图片基准尺寸。 | 阶段 6 / Step 6.1.5 |
| `tests/scenes.test.ts` | 补充正式图片尺寸和 20 个热区校准坐标约束。 | 阶段 6 / Step 6.1.5 |
| `tests/sceneMemoryHotspots.test.ts` | 更新 Memory 热区百分比样式预期，确保使用新图尺寸换算。 | 阶段 6 / Step 6.1.5 |
| `tests/memoryViewModel.test.ts` | 更新 Memory 展示模型中的正式图比例预期。 | 阶段 6 / Step 6.1.5 |

## 39. 阶段 6 / Step 6.1.5 正式单词音频资源更新

Classroom 的 20 个单词音频现在已经从静音 / 临时占位资源替换为可听的短 MP3 单词发音文件。音频文件继续放在 `miniprogram/assets/audio/` 下，文件名与 `miniprogram/data/scenes.ts` 中各单词的 `audioUrl` 保持一致，因此 Memory 单词卡、Favorites 播放和 Listen + Spell 当前题目播放都复用同一批资源路径。

当前职责：
- `miniprogram/assets/audio/*.mp3` 保存 Classroom 20 个单词的短 MP3 发音资源。
- `miniprogram/data/scenes.ts` 继续作为音频路径的唯一数据来源，每个 `Word.audioUrl` 指向对应文件。
- `tests/assets.test.ts` 校验所有 Classroom 音频文件存在、体积符合短单词 MP3 资源预期，并且文件头为 MP3 格式。

运行时注意事项：

- 当前音频可用于 MVP 演示和用户测试，但不是品牌级定制录音；后续扩展多场景时，可以将这套路径约定保留，把生产方式升级为稳定 TTS 流程或人工审核录音。
- 如果后续替换任一音频文件，应保持文件名和 `audioUrl` 不变，除非同步更新数据文件和资源测试。
- Memory 单词卡、Favorites 和 Listen + Spell 均依赖同一批音频资源，因此替换文件时需要至少抽查这三个入口的播放行为。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/assets/audio/*.mp3` | 保存 Classroom 20 个单词的正式短 MP3 发音资源，供 Memory、Favorites 和 Listen + Spell 复用。 | 阶段 6 / Step 6.1.5 |
| `tests/assets.test.ts` | 将音频资源校验更新为真实 MP3 文件校验，覆盖文件存在、短音频体积和 MP3 文件头。 | 阶段 6 / Step 6.1.5 |

## 40. Memory 单词卡自动播放体验优化

Memory 热区点击打开单词卡时，现在会自动播放当前单词音频一次。该能力直接复用 `miniprogram/pages/scene/scene.ts` 中既有的页面内音频上下文管理，不新增 service、不引入依赖，也不改变 Favorites 或 Listen + Spell 的播放入口。

当前职责：
- `onMemoryHotspotTap` 负责在找到目标单词、记录已学、刷新单词卡数据后，调用 `playMemoryWordAudio(selectedWord.audioUrl, ...)` 自动播放一次。
- `playMemoryWordAudio` 继续负责释放旧 Memory 音频上下文、创建新的 `wx.createInnerAudioContext()`、设置 `src`、绑定错误提示并播放。
- 单词卡上的 `onPlayMemoryWordAudio` 仍作为手动复听入口，行为与自动播放共用同一套底层播放逻辑。

运行时注意事项：

- 快速点击不同热区时，旧音频会先释放，再播放新单词，避免多段音频重叠。
- 关闭单词卡、切回 Classroom、页面隐藏或卸载时，仍沿用既有停止 / 释放逻辑。
- 自动播放失败只给轻提示，不阻塞单词卡查看。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | 在 Memory 热区打开单词卡后自动播放当前单词音频，同时保留手动播放按钮复听能力。 | Memory 单词卡自动播放体验优化 |
| `tests/sceneMemoryWordCard.test.ts` | 补充 Memory 热区打开单词卡时会触发自动播放的回归测试。 | Memory 单词卡自动播放体验优化 |

## 41. 阶段 6 / Step 6.2 听音找物点击判断

Listen + Spell 当前题目进入后，用户需要先播放并听完目标单词音频，随后才能点击 Classroom 图片中的透明热区选择物品。该步骤复用 Memory Mode 已校准的 20 个 Classroom 热区，不新增图片、服务或依赖。

当前职责：
- `scene.wxml` 在 Listen + Spell 模式中渲染 Classroom 场景图、透明热区层和当前练习反馈。
- `scene.ts` 的 `onPlayListeningWritingAudio` 播放当前题音频，并在音频 `onEnded` 后将 `listeningWritingCanSelectObject` 置为 `true`。
- `scene.ts` 的 `onListeningWritingHotspotTap` 负责听音找物判定：音频未听完时只提示先听音频；点对后进入 `spellingReady`；点错一次记录 `click` 类型错题并允许重试；第二次点错提示正确物品并进入 `spellingReady`。
- `sceneViewModel.ts` 维护 `listeningWritingCanSelectObject`，确保新题、切换模式和返回首页时都回到不可点击状态。
- `mistakeService.recordMistake(..., "click")` 继续承载点击选择错误的错题记录。

运行时注意事项：

- 音频未播放或尚未播放结束时，点击热区不会判对错，也不会写入错题。
- 已经点对并进入 `spellingReady` 后，继续点击其他物品不会再次判错。
- 点击图片空白区域只给轻提示，不计入错题。
- 当前 Step 6.2 只完成“听音找物”点击判断；后续拼写输入与答案校验应继续作为下一步实现。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.wxml` | 在 Listen + Spell 模式中渲染 Classroom 图片热区层和点击反馈入口。 | 阶段 6 / Step 6.2 |
| `miniprogram/pages/scene/scene.wxss` | 补充 Listen + Spell 场景图片、热区、高亮和反馈样式。 | 阶段 6 / Step 6.2 |
| `miniprogram/pages/scene/scene.ts` | 实现听完音频后才允许点击、热区判定、错题记录、正确高亮和进入拼写准备状态。 | 阶段 6 / Step 6.2 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 新增 `listeningWritingCanSelectObject` 状态，用于控制听音找物点击门禁。 | 阶段 6 / Step 6.2 |
| `tests/listeningWritingStart.test.ts` | 覆盖 Listen + Spell 热区渲染、点击判定、答对后忽略后续点击和音频结束后才允许选择的回归测试。 | 阶段 6 / Step 6.2 |

## 42. 阶段 6 / Step 6.3-6.4 Listen + Spell 拼写闭环与界面返修

Listen + Spell 当前在听音找物后继续进入拼写输入和本轮完成状态。该更新仍位于 Learn tab 内联 `scene` 页面中，不新增独立页面、不新增依赖，并继续复用 `normalize`、`mistakeService` 和当前题音频资源。

当前职责：
- `scene.wxml` 在 `spellingReady` 阶段渲染拼写输入区，并将 `Play audio` 和 `Submit` 两个操作按钮并排放在输入框下方；听音 / 找物阶段仍保留顶部大号 `Play Word Audio` 按钮。
- `scene.ts` 使用 `isNormalizedSpellingMatch` 判断拼写，忽略大小写和首尾空格；首次拼写错误记录 `spelling` 类型错题并允许重试，第二次拼写错误展示正确拼写。
- `scene.ts` 通过 `prepareListeningWritingNextStep` 让用户在答题反馈后点击 `Continue` 再进入下一题；最后一题完成后进入 `Round complete`。
- `scene.ts` 通过 `onRestartListeningWritingRound` 开启新 5 题，并优先排除上一轮单词；通过 `onEndListeningWritingPractice` 返回 Classroom 学习首页。
- `scene.ts` 管理正确 / 错误反馈短音效，错误音效保留但降低播放音量，不阻塞学习流程。
- `scene.wxss` 负责拼写区、并排按钮、正确拼写展示、完成页双按钮和柔和目标高亮样式。
- `tests/listeningWritingStart.test.ts` 约束拼写输入、拼写错误记录、继续按钮、完成页、反馈音效、柔和高亮和拼写阶段按钮布局。
- `tests/assets.test.ts` 约束 Listen + Spell 反馈 WAV 音效资源存在且格式正确。

运行时注意事项：

- 拼写阶段不再显示上方的重复步骤提示框，避免 `Spell now` 被重复展示。
- 拼写阶段隐藏顶部大号 `Play Word Audio`，改由输入框下方的 `Play audio` 按钮承担复听入口。
- 完成页的 `New 5-word set` 和 `End practice` 并排展示，分别对应重新开始一轮和返回 Classroom 学习首页。
- 当前完成页仍是基础完成状态，后续如需展示正确数、错误数、新增错题数，可继续在 Step 6.4 的统计增强中补充。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.wxml` | 补充 Listen + Spell 拼写输入区、拼写阶段并排操作按钮、正确答案展示、继续按钮和完成页双按钮。 | 阶段 6 / Step 6.3-6.4 |
| `miniprogram/pages/scene/scene.wxss` | 补充拼写输入区、反馈卡、柔和高亮、并排按钮和完成页布局样式。 | 阶段 6 / Step 6.3-6.4 |
| `miniprogram/pages/scene/scene.ts` | 实现拼写判断、`spelling` 错题记录、反馈音效、下一题推进、新一组练习和结束练习逻辑。 | 阶段 6 / Step 6.3-6.4 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 扩展 Listen + Spell 页面状态，包含步骤文案、反馈类型、拼写输入、答案展示、完成页和继续按钮状态。 | 阶段 6 / Step 6.3-6.4 |
| `miniprogram/assets/audio/feedback-correct.wav` | Listen + Spell 正确反馈短音效资源。 | 阶段 6 / Step 6.3-6.4 |
| `miniprogram/assets/audio/feedback-wrong.wav` | Listen + Spell 错误反馈短音效资源，当前为柔和短提示音。 | 阶段 6 / Step 6.3-6.4 |
| `tests/listeningWritingStart.test.ts` | 覆盖 Listen + Spell 拼写闭环、完成页、反馈音效和界面返修约束。 | 阶段 6 / Step 6.3-6.4 |
| `tests/assets.test.ts` | 补充反馈 WAV 音效资源存在性与格式校验。 | 阶段 6 / Step 6.3-6.4 |

## 43. 阶段 6 / Step 6.5 抽题优先级验证更新

Listen + Spell 的普通练习抽题规则现在明确为“已学词优先随机，不足 5 题时由未学词随机补足”。该规则同时落在 service 层和 Learn tab 内联运行时代码中，保证单元测试可验证、微信小程序运行时也能按相同规则生成题目。

当前职责：

- `miniprogram/services/quizService.ts` 的 `createPracticeQuizRound` 先拆分 learned / unlearned 两个词池，再分别洗牌；已学词池优先进入本轮题目，数量不足时再从未学词池补足。
- `createPracticeQuizRound` 支持注入 `random` 函数，便于用确定性随机序列测试抽题优先级，不影响生产运行时默认随机行为。
- `miniprogram/pages/scene/scene.ts` 保留页面内联抽题实现，以避开微信运行时 helper module 解析边界；该内联实现同步使用相同的 learned-first 随机补足规则。
- 新一轮 Listen + Spell 仍优先排除上一轮已经出现过的词，再按已学词优先规则抽题，降低连续两轮重复感。
- `createMistakePracticeQuizRound` 保持错题专项的弱项优先规则：按目标错误类型过滤，再综合低掌握度、高错误次数、较新的最近错误时间和词表顺序排序。

运行时注意事项：

- 普通 Listen + Spell 从学习过的词中优先随机抽题；如果用户已学词少于 5 个，未学词会自动补齐本轮。
- 错题专项的端到端入口尚未进入当前阶段；目前通过 service 层单元测试保障弱项优先规则，等 Step 7.4 完成入口后再做手动流程验证。

测试覆盖：

- `tests/quizService.test.ts` 覆盖普通抽题的 learned-first 随机补足、可注入随机函数，以及错题专项的弱项排序。
- `tests/listeningWritingStart.test.ts` 覆盖 Learn tab 内联 Listen + Spell 抽题规则和新一轮排除上一轮词的行为。
- `tests/sceneViewModel.test.ts` 继续覆盖首题显示状态、题号和音频路径等展示模型。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/quizService.ts` | 更新普通练习抽题为已学词优先随机、不足时未学词补足，并支持注入随机函数用于确定性测试。 | 阶段 6 / Step 6.5 |
| `miniprogram/pages/scene/scene.ts` | 同步 Learn tab 内联 Listen + Spell 抽题规则，并保留新一轮优先排除上一轮词的逻辑。 | 阶段 6 / Step 6.5 |
| `tests/quizService.test.ts` | 补充普通抽题优先级、随机性注入和错题专项弱项优先规则测试。 | 阶段 6 / Step 6.5 |
| `tests/listeningWritingStart.test.ts` | 补充 Listen + Spell 页面内联抽题与新一轮排除上一轮词的回归测试。 | 阶段 6 / Step 6.5 |
| `tests/sceneViewModel.test.ts` | 保持听写开始状态展示模型覆盖，随 Step 6.5 抽题行为同步验证。 | 阶段 6 / Step 6.5 |

## 44. Listen + Spell 错误反馈音效小修记录

Listen + Spell 的错误反馈音效继续使用本地 WAV 资源，不引入新依赖、不新增音频服务。当前版本保留短促错误提示音，用于点击错误物品或拼写错误时的即时反馈；最终声音风格可在后续 UI / 体验精修阶段统一处理。

当前职责：

- `miniprogram/assets/audio/feedback-wrong.wav` 保存当前错误反馈短音效。
- `miniprogram/pages/scene/scene.ts` 继续通过 `playListeningWritingFeedbackSound("wrong")` 播放错误反馈，并将错误音效音量控制为低于正确音效。
- `tests/assets.test.ts` 除了校验反馈 WAV 存在和格式正确外，也校验音频采样峰值大于静音阈值，避免出现合法 WAV 但完全无声的资源回归。

文件变更记录补充：

| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/assets/audio/feedback-wrong.wav` | Listen + Spell 错误反馈短音效资源，当前版本已由用户确认可接受。 | Listen + Spell 错误反馈音效小修 |
| `miniprogram/pages/scene/scene.ts` | 调整错误反馈音效播放音量，保持错误反馈存在但不过分突兀。 | Listen + Spell 错误反馈音效小修 |
| `tests/assets.test.ts` | 增加反馈 WAV 非静音校验，防止格式合法但无声的资源问题回归。 | Listen + Spell 错误反馈音效小修 |

## 45. 阶段 7 / Step 7.1 错题列表

错题夹页面现在从 `mistakeService.getMistakes()` 读取本地错题记录，并将记录整理为可展示的列表。当前 Step 只负责展示，不提供手动移出、自动移出或专项练习入口。

当前职责：
- `miniprogram/pages/mistakes/mistakes.ts` 在页面初始化和 `onShow` 时刷新本地错题列表。
- `miniprogram/pages/mistakes/mistakes.ts` 会结合 `wordService.getWordById` 和 `sceneService.getSceneById` 补全单词与场景展示信息。
- 错题列表按总错误次数递减排序；总错误次数来自该单词所有错误类型的 `mistakeCount` 之和。
- 每个错题项展示英文、中文、场景、总错误次数、最近错误日期，以及每个错误类型的错误次数、最近错误日期和掌握进度。
- `miniprogram/pages/mistakes/mistakesViewModel.ts` 提供同等的展示模型生成逻辑，供单元测试稳定验证。
- `tests/mistakesPage.test.ts` 约束错题列表模型、排序规则、空状态、页面结构、刷新逻辑和样式类名。

运行时注意事项：
- 当前页面不会修改错题数据；Step 7.2 再实现手动移出错题。
- 当前页面只展示已有掌握进度；Step 7.3 再实现通过专项练习更新掌握进度并自动移除弱项。
- 当前页面不提供 `Practice` 入口；Step 7.4 再根据错误类型进入对应专项练习。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/mistakes/mistakes.ts` | 将错题夹页面接入本地错题记录，生成按总错误次数递减排序的错题列表，并在 `onShow` 时刷新。 | 阶段 7 / Step 7.1 |
| `miniprogram/pages/mistakes/mistakes.wxml` | 渲染错题列表、错误类型明细、掌握进度条和空状态。 | 阶段 7 / Step 7.1 |
| `miniprogram/pages/mistakes/mistakes.wxss` | 补充错题列表、错误类型卡片、进度条和空状态样式。 | 阶段 7 / Step 7.1 |
| `miniprogram/pages/mistakes/mistakesViewModel.ts` | 提供错题夹展示模型生成逻辑，便于测试错题聚合、排序和展示字段。 | 阶段 7 / Step 7.1 |
| `tests/mistakesPage.test.ts` | 覆盖错题夹列表展示、总错误次数递减排序、空状态、页面刷新和样式约束。 | 阶段 7 / Step 7.1 |
## 46. 阶段 7 / Step 7.2 手动移出错题

错题夹页面现在支持用户从列表中手动移出某个错题单词。该能力复用既有 `mistakeService.removeMistake(wordId)`，不新增数据结构、不改变错题记录规则，也不进入掌握进度自动移出或错题专项练习入口范围。

当前职责：
- `miniprogram/pages/mistakes/mistakes.ts` 引入 `removeMistake`，并新增 `onRemoveMistake` 事件处理；点击后先弹出确认框，确认后移出对应 `wordId` 的错题记录并调用 `setData(createPageData())` 刷新页面。
- `miniprogram/pages/mistakes/mistakes.wxml` 在每个错题项中渲染 `Remove` 按钮，并通过 `data-word-id` 把当前单词 id 传给页面事件。
- `miniprogram/pages/mistakes/mistakes.wxss` 补充错题项底部操作区和移出按钮样式。
- `tests/mistakesPage.test.ts` 约束手动移出入口、确认弹窗、确认后刷新逻辑，以及弹窗说明不再出现“answering wrong later”一类引导再次答错的文案。

运行时注意事项：
- 取消确认弹窗不会修改本地错题数据。
- 确认移出会删除该单词的整条错题记录，而不是只移除某一种错误类型。
- 当前弹窗说明文案为 `This word will leave your mistake list.`，避免暗示用户需要再次答错才能恢复。
- Step 7.3 的自动移出和 Step 7.4 的错题专项练习入口尚未实现。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/mistakes/mistakes.ts` | 新增错题手动移出事件，确认后调用 `removeMistake` 并刷新列表。 | 阶段 7 / Step 7.2 |
| `miniprogram/pages/mistakes/mistakes.wxml` | 在每个错题项中新增 `Remove` 操作按钮并绑定当前 `wordId`。 | 阶段 7 / Step 7.2 |
| `miniprogram/pages/mistakes/mistakes.wxss` | 补充错题项操作区和移出按钮样式。 | 阶段 7 / Step 7.2 |
| `tests/mistakesPage.test.ts` | 覆盖手动移出错题入口、确认弹窗、确认后刷新和弹窗文案回归。 | 阶段 7 / Step 7.2 |
## 47. 阶段 7 / Step 7.3 自动移出边界修正

错题服务层已经具备 `recordMistakeCorrectAnswer()`：同一错误类型答对 1 次后进度为 50%，连续答对 2 次后移除该错误类型，所有错误类型移除后整词从错题记录中移除。本次页面层补充一个边界防线：如果本地数据中出现 `typeStats` 已为空的错题记录，错题夹展示层不会再渲染该词，而是把它视为已掌握并自动移出列表。

当前职责：
- `miniprogram/pages/mistakes/mistakesViewModel.ts` 在生成 `MistakeListItem` 时跳过 `typeItems.length === 0` 的记录，保证测试模型不会展示已无弱项的错题。
- `miniprogram/pages/mistakes/mistakes.ts` 同步运行时内联聚合逻辑，避免微信小程序实际页面渲染 0 错误空卡片。
- `tests/mistakesPage.test.ts` 覆盖空 `typeStats` 记录被视为已移出，页面进入空状态的回归行为。

运行时注意事项：
- 本次修正只处理“已无弱项的错题记录不应出现在错题夹中”的展示边界。
- 真实练习中答对后调用 `recordMistakeCorrectAnswer()` 的流程尚未接入；下一步需要把该服务调用接入练习答对路径。
- 错题专项练习入口仍属于 Step 7.4，尚未实现。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/mistakes/mistakes.ts` | 过滤没有任何错误类型的错题记录，避免运行时展示已掌握空卡片。 | 阶段 7 / Step 7.3 自动移出边界修正 |
| `miniprogram/pages/mistakes/mistakesViewModel.ts` | 让测试用错题展示模型同样跳过空弱项记录。 | 阶段 7 / Step 7.3 自动移出边界修正 |
| `tests/mistakesPage.test.ts` | 增加空 `typeStats` 被视为已移出并显示空状态的回归测试。 | 阶段 7 / Step 7.3 自动移出边界修正 |
## 48. 阶段 7 / Step 7.3 答对后错题掌握进度更新

Listen + Spell 现在会在真实答题成功路径中调用错题服务的掌握进度更新能力。此前 `recordMistakeCorrectAnswer()` 只在 service 测试中验证，本次将其接入运行时页面：点对物品对应 `click` 弱项，拼写答对对应 `spelling` 弱项。该接入不新增错题数据结构，也不新增错题夹 Practice 入口。

当前职责：
- `miniprogram/pages/scene/scene.ts` 在 `onListeningWritingHotspotTap` 的点对目标物品分支调用 `recordMistakeCorrectAnswer(targetWordId, "click")`。
- `miniprogram/pages/scene/scene.ts` 在 `onSubmitListeningWritingSpelling` 的拼写答对分支调用 `recordMistakeCorrectAnswer(targetWord.id, "spelling")`。
- `miniprogram/services/mistakeService.ts` 继续承担掌握进度规则：答对 1 次为 50%，连续答对 2 次后移除该错误类型，所有错误类型完成后移除整词。
- `tests/listeningWritingStart.test.ts` 约束 Listen + Spell 答对路径必须接入 `recordMistakeCorrectAnswer()`，防止后续只记录错误而不推进错题消除。

运行时注意事项：
- 当前用户需要在 Listen + Spell 普通练习中重新遇到错题词并答对，才能推进 `click` / `spelling` 错题掌握进度。
- 错题夹内直接进入专项练习的入口尚未实现，仍属于 Step 7.4。
- `speaking` 错题类型的掌握进度更新需等待 Listen + Speak 真实练习流程完成后再接入。

文件变更记录补充：
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | 在 Listen + Spell 点对物品和拼写答对路径中调用 `recordMistakeCorrectAnswer`，推进错题掌握进度。 | 阶段 7 / Step 7.3 |
| `tests/listeningWritingStart.test.ts` | 增加 Listen + Spell 答对后更新错题掌握进度的回归测试。 | 阶段 7 / Step 7.3 |

## 49. Phase 7 / Step 7.4 Mistake practice entry

The Mistakes page now owns one top-level practice entry instead of rendering a separate practice button for each word or mistake type. The page lets the user choose `Object` or `Spelling`, stores that choice as a short-lived pending request, and hands control to the Scene page. The Scene page consumes the request on show, creates a mistake-focused round, and returns directly to the Mistakes page when the round is finished.

Current responsibilities:
- `miniprogram/services/mistakePracticeService.ts` stores and consumes `PendingMistakePracticeRequest` in local settings storage. The request contains `sceneId`, `mistakeType`, and `createdAt`; it does not pin a single `wordId`, so the resulting round can cover all current mistakes of the selected type.
- `miniprogram/pages/mistakes/mistakes.ts` checks whether the current mistake list has `click` or `spelling` items, opens the `Object` / `Spelling` action sheet, saves the selected request, and switches to the Scene tab.
- `miniprogram/pages/mistakes/mistakes.wxml` renders the simplified card structure: one card-level last mistake date, per-type labels and right-aligned counts, progress bars without visible percentage text, a top `Practice` control, and a compact centered `Remove` control.
- `miniprogram/pages/mistakes/mistakes.wxss` keeps the practice and remove controls badge-like and content-sized, avoiding native button stretching and avoiding fixed full-width controls inside mistake cards.
- `miniprogram/pages/scene/scene.ts` consumes pending mistake practice requests, starts Object mistake practice through the object-selection path, starts Spelling mistake practice through the Listen + Spell path, and navigates back to `/pages/mistakes/mistakes` after the final `Finish` action.
- `miniprogram/pages/scene/sceneViewModel.ts` carries `listeningWritingPracticeMistakeType` so the inline Listen + Spell state can distinguish normal rounds from mistake-focused rounds.

Runtime notes:
- `Object` practice maps to the existing `click` mistake type and completes each question after the correct object is selected; it skips the spelling input step.
- `Spelling` practice maps to the existing `spelling` mistake type and uses the existing Listen + Spell spelling flow.
- `speaking` mistake practice remains out of scope until Listen + Speak is implemented.
- After mistake practice finishes, the user returns directly to the Mistakes page instead of landing on the normal Listen + Spell completion screen.

Test coverage:
- `tests/mistakePracticeService.test.ts` covers saving, consuming, and clearing pending mistake practice requests.
- `tests/mistakesPage.test.ts` covers the top-level practice action sheet, type availability checks, compact control markup/styles, and the simplified mistake card UI.
- `tests/listeningWritingStart.test.ts` covers consuming pending mistake practice requests and returning to the Mistakes page after focused practice finishes.
- `tests/sceneInlineMode.test.ts` keeps normal scene entry navigation behavior covered while allowing the new mistake-practice return navigation.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/mistakePracticeService.ts` | Stores and consumes pending mistake practice requests between the Mistakes page and Scene page. | Phase 7 / Step 7.4 |
| `miniprogram/pages/mistakes/mistakes.ts` | Adds the top-level mistake practice picker and request handoff. | Phase 7 / Step 7.4 |
| `miniprogram/pages/mistakes/mistakes.wxml` | Simplifies Mistakes card markup and removes per-card practice controls, per-type time labels, and visible percentage labels. | Phase 7 / Step 7.4 |
| `miniprogram/pages/mistakes/mistakes.wxss` | Adds compact badge-style `Practice` and `Remove` controls and revised mistake type rows. | Phase 7 / Step 7.4 |
| `miniprogram/pages/scene/scene.ts` | Consumes pending mistake practice requests, starts focused practice rounds, and returns to Mistakes after completion. | Phase 7 / Step 7.4 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Tracks the active mistake practice type in the Listen + Spell page state. | Phase 7 / Step 7.4 |
| `tests/mistakePracticeService.test.ts` | Covers the pending request service. | Phase 7 / Step 7.4 |
| `tests/mistakesPage.test.ts` | Covers the Mistakes page practice picker and simplified UI constraints. | Phase 7 / Step 7.4 |
| `tests/listeningWritingStart.test.ts` | Covers pending request consumption and post-practice return behavior. | Phase 7 / Step 7.4 |
| `tests/sceneInlineMode.test.ts` | Keeps scene entry behavior covered with the new mistake-practice navigation path. | Phase 7 / Step 7.4 |

## 50. Phase 8 / Step 8.1 Listen + Speak start state

Listen + Speak now has an inline start flow inside the Learn tab. This step only covers the pre-recording flow: create the question queue, play the target word audio, let the user find the matching object, and enter a record-ready state after the correct object is found.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` defines `SceneListeningSpeakingState`, `SceneListeningSpeakingQuestion`, `createEmptyListeningSpeakingState()`, and `createListeningSpeakingStartState()`. These mirror the Listen + Spell start-state shape but only expose the question id, word id, audio url, and progress label needed by the UI.
- `miniprogram/pages/scene/scene.ts` creates normal Listen + Speak rounds with the shared inline quiz queue helper using `mode: "listeningSpeaking"`.
- `miniprogram/pages/scene/scene.ts` owns a separate Listen + Speak audio context so playback can be stopped or released without disturbing Memory or Listen + Spell audio state.
- `miniprogram/pages/scene/scene.ts` enables object selection only after the target audio ends, records the first wrong object tap as a `click` mistake, updates `click` mastery when the correct object is selected, and switches to `listeningSpeakingPhase: "recordReady"`.
- `miniprogram/pages/scene/scene.wxml` renders the Listen + Speak progress row, playback button, Classroom hotspot layer, object feedback, and `Ready to speak` placeholder.
- `miniprogram/pages/scene/scene.wxss` adds stable Listen + Speak panel, hotspot, feedback, playback, and record-ready styles.

Runtime notes:
- The target English word is not shown during the object-finding step.
- Tapping an object before the target audio finishes shows `Listen to the word first` and does not record a mistake.
- Tapping blank image space shows `Tap an object in the picture` and does not record a mistake.
- `Ready to speak` is intentionally only a placeholder in this step; Step 8.2 will add recording controls and microphone flow.
- Speaking mistake practice remains unavailable until the full Listen + Speak loop exists.

Test coverage:
- `tests/listeningSpeakingStart.test.ts` covers Learn-tab entry, view-model state, WXML bindings, audio-ended selection gating, click mistake recording, record-ready transition, and stable styles.
- `tests/sceneViewModel.test.ts` covers `createListeningSpeakingStartState()` with a deterministic 5-question round.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Adds Listen + Speak round creation, audio playback, object-selection gating, click mistake recording, and record-ready transition. | Phase 8 / Step 8.1 |
| `miniprogram/pages/scene/scene.wxml` | Renders the Listen + Speak inline practice start panel and hotspot layer. | Phase 8 / Step 8.1 |
| `miniprogram/pages/scene/scene.wxss` | Adds stable styles for the Listen + Speak start panel, hotspots, feedback, play button, and record-ready state. | Phase 8 / Step 8.1 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds Listen + Speak question and page state models. | Phase 8 / Step 8.1 |
| `tests/listeningSpeakingStart.test.ts` | Covers the Listen + Speak start-state page behavior. | Phase 8 / Step 8.1 |
| `tests/sceneViewModel.test.ts` | Adds coverage for Listen + Speak start-state model creation. | Phase 8 / Step 8.1 |

## 51. Phase 8 / Step 8.2 Listen + Speak recording interaction

Listen + Speak now supports the recording interaction after the user finds the correct object. This step stops at capturing and saving a local recording result; it does not call mock ASR, record speaking mistakes, or advance to the next question.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` tracks `SceneListeningSpeakingRecordingStatus`, the saved recording path, duration, and recording feedback text.
- `miniprogram/pages/scene/scene.ts` owns a shared WeChat `RecorderManager`, binds stop/error callbacks to the active Scene page, and exposes start, stop, cancel, permission-denied, short-recording, saved, and error handling paths.
- `miniprogram/pages/scene/scene.ts` cancels any active Listen + Speak recording when leaving the inline mode, hiding the page, unloading the page, or starting a different practice context.
- `miniprogram/pages/scene/scene.wxml` renders recording controls inside the `recordReady` state. Saved recordings show a green `Saved` status and a secondary `Record Again` action in a two-column row.
- `miniprogram/pages/scene/scene.wxss` styles the recording panel, retry feedback, saved state, and recording action row with explicit equal-width saved/re-record controls.

Runtime notes:
- `Start Recording` asks for `scope.record` permission before starting the recorder.
- `Stop` saves the recording only when the duration meets the minimum recording threshold.
- Short recordings show `Recording was too short. Please try again.` and keep the user on the same record-ready step.
- `Cancel` stops recording and clears the recording file path without advancing.
- Permission denial shows `Microphone permission is needed to practice speaking.` and keeps the user able to retry.
- Saved recordings currently only show `Saved`; Step 8.3 will handle recognition feedback and continuation.

Test coverage:
- `tests/listeningSpeakingRecording.test.ts` covers recording view-model fields, WXML controls, `RecorderManager` usage without recognition calls, microphone denial, short-recording feedback, and recording UI styles.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Adds Listen + Speak recording manager wiring, permission handling, stop/cancel behavior, short-recording validation, saved recording state, and cleanup. | Phase 8 / Step 8.2 |
| `miniprogram/pages/scene/scene.wxml` | Renders Listen + Speak recording controls, saved status, retry text, and re-record action. | Phase 8 / Step 8.2 |
| `miniprogram/pages/scene/scene.wxss` | Styles the recording panel, saved state, and equal-width saved/re-record row. | Phase 8 / Step 8.2 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds recording status, file path, duration, and feedback fields to the Scene view model. | Phase 8 / Step 8.2 |
| `tests/listeningSpeakingRecording.test.ts` | Covers the Listen + Speak recording interaction and guards against calling recognition before Step 8.3. | Phase 8 / Step 8.2 |

## 52. Phase 8 / Step 8.3 Listen + Speak mock recognition

Listen + Speak now sends a valid saved recording to the mock speech service and displays recognition feedback in the record-ready panel. This step only covers recognition feedback; it does not yet record `speaking` mistakes, handle second-failure reveal behavior, or advance through the round.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` tracks `SceneListeningSpeakingRecognitionStatus` with `idle`, `recognizing`, `passed`, `notRecognized`, and `failed`, plus the transcript and user-facing feedback text.
- `miniprogram/pages/scene/scene.ts` creates recognition data from `SpeechRecognitionResult`, resets recognition state when recording is restarted or cancelled, and calls `speechService.recognizeWord(recordingPath, targetWord.en)` after a valid saved recording.
- `miniprogram/pages/scene/scene.ts` uses a request id guard so stale recognition results cannot overwrite the current UI if the user records again before an older recognition promise resolves.
- `miniprogram/pages/scene/scene.wxml` renders the recognition feedback card, hides redundant `Recording saved.` copy once recognition feedback exists, and hides the saved/re-record action row while checking or after a passed result.
- `miniprogram/pages/scene/scene.wxss` styles the recognition card as a prominent one-row status/feedback surface with aligned left and right labels.
- `miniprogram/services/speechService.ts` now defaults to an `auto` mock scenario. It still supports explicit `success`, `failure`, and `empty` scenarios for deterministic tests and local demos.

Runtime notes:
- A valid recording immediately enters `recognizing` with a checking message so the user does not get stuck at a saved-only state.
- Passed recognition shows `Passed` and `Great pronunciation.` as the primary feedback.
- Low-confidence or empty recognition shows retry feedback without mentioning mock ASR.
- Recognition service failures show retryable error feedback.
- User-facing UI does not expose the word `mock`.
- Step 8.4 remains responsible for recording `speaking` mistakes, first/second failure behavior, continuation, and round completion.

Test coverage:
- `tests/listeningSpeakingRecording.test.ts` covers the remaining recording-only states after recognition was introduced.
- `tests/listeningSpeakingRecognition.test.ts` covers recognition state fields, service calls, feedback mapping, WXML copy, primary feedback rendering, hidden saved/actions after feedback, one-row alignment styles, and the Step 8.4 boundary.
- `tests/listeningSpeakingRecognitionRuntime.test.ts` runs the Scene page with mocked `Page`, `wx`, and services to verify that a valid recording calls speech recognition, sets saved plus recognizing state together, and renders passed feedback.
- `tests/speechService.test.ts` covers the auto mock scenario, injected deterministic random values, and explicit success/failure/empty scenarios.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Calls mock recognition after valid Listen + Speak recordings, maps recognition outcomes to feedback state, and guards stale async results. | Phase 8 / Step 8.3 |
| `miniprogram/pages/scene/scene.wxml` | Renders recognition feedback and removes redundant saved/action UI once feedback is available. | Phase 8 / Step 8.3 |
| `miniprogram/pages/scene/scene.wxss` | Styles the recognition feedback card and one-row aligned status/feedback layout. | Phase 8 / Step 8.3 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds Listen + Speak recognition status, transcript, and feedback fields. | Phase 8 / Step 8.3 |
| `miniprogram/services/speechService.ts` | Adds auto mock recognition behavior with deterministic override support. | Phase 8 / Step 8.3 |
| `tests/listeningSpeakingRecording.test.ts` | Updates recording coverage after recognition is now part of the saved-recording path. | Phase 8 / Step 8.3 |
| `tests/listeningSpeakingRecognition.test.ts` | Adds static coverage for recognition behavior, copy, UI visibility, alignment, and Step 8.4 boundaries. | Phase 8 / Step 8.3 |
| `tests/listeningSpeakingRecognitionRuntime.test.ts` | Adds runtime-style Scene page coverage for saved recording to recognition feedback. | Phase 8 / Step 8.3 |
| `tests/speechService.test.ts` | Covers auto mock recognition and deterministic scenario behavior. | Phase 8 / Step 8.3 |

## 53. Phase 8 / Step 8.4 Listen + Speak speaking mistakes and completion

Listen + Speak now has the full MVP loop after mock recognition: speaking mistake recording, first-failure retry, second-failure answer reveal, user-controlled continuation, and a 5-question completion state. The flow continues to use the existing local mistake service and the existing mock speech service; no real ASR or new dependency was introduced.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` tracks the Listen + Speak recognition attempt count, answer reveal text, pending continuation state, completion flag, and completion summary counts.
- `miniprogram/pages/scene/scene.ts` records `speaking` mistakes through `recordMistake(...)` when recognition fails, updates `speaking` mastery through `recordMistakeCorrectAnswer(...)` when recognition passes, and counts per-round correct, mistake, and new mistake totals for the completion page.
- `miniprogram/pages/scene/scene.ts` keeps the first failed recognition on the same question with a retry path, while the second failed recognition reveals the target word and waits for `Continue` or `Finish`.
- `miniprogram/pages/scene/scene.ts` advances Listen + Speak questions only from `onContinueListeningSpeakingQuestion()`, so recognition feedback remains visible until the user chooses to move on.
- `miniprogram/pages/scene/scene.wxml` renders the correct-pronunciation reveal card, the continuation button, and the Listen + Speak completion state with correct, mistake, and new-mistake stats.
- `miniprogram/pages/scene/scene.wxss` styles the answer reveal, continuation button, and completion summary stats.

Runtime notes:
- A passed speaking answer shows `Passed` / `Great pronunciation.` and then `Continue` or `Finish`; the saved/re-record controls are hidden in that state.
- The first failed speaking answer shows retry feedback and keeps `Record Again` available.
- The second failed speaking answer reveals the correct spoken word and requires the user to continue manually.
- `New 5-word set` starts a fresh Listen + Speak round, preferring words outside the just-finished round where possible.
- `End practice` returns to the normal scene home state.
- Speaking mistakes created in this flow use the existing `speaking` mistake type and are visible to the Mistakes page through its existing model.

Test coverage:
- `tests/listeningSpeakingCompletion.test.ts` covers Step 8.4 state fields, speaking mistake/mastery service calls, continuation controls, answer reveal, and completion UI requirements.
- `tests/listeningSpeakingRecognitionRuntime.test.ts` covers runtime-style passed recognition, first failed recognition, second failed recognition, and completion stat preservation.
- `tests/listeningSpeakingRecognition.test.ts` was updated so recognition feedback coverage remains aligned with the new continuation boundary.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Adds Listen + Speak speaking mistake recording, speaking mastery updates, first/second failure behavior, question continuation, completion stats, and restart/end actions. | Phase 8 / Step 8.4 |
| `miniprogram/pages/scene/scene.wxml` | Renders correct-pronunciation reveal, continuation, and Listen + Speak completion summary UI. | Phase 8 / Step 8.4 |
| `miniprogram/pages/scene/scene.wxss` | Styles Listen + Speak answer reveal, continuation, and completion stats. | Phase 8 / Step 8.4 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds Listen + Speak attempt, reveal, continuation, completion, and summary-count state fields. | Phase 8 / Step 8.4 |
| `tests/listeningSpeakingCompletion.test.ts` | Covers Step 8.4 completion and speaking-mistake requirements. | Phase 8 / Step 8.4 |
| `tests/listeningSpeakingRecognitionRuntime.test.ts` | Adds runtime-style coverage for passed, retry, reveal, and completion stat behavior. | Phase 8 / Step 8.4 |
| `tests/listeningSpeakingRecognition.test.ts` | Keeps recognition feedback expectations aligned with the new continuation flow. | Phase 8 / Step 8.4 |

## 54. Phase 9 / Step 9.1 Resource failure feedback

The Scene page now handles critical resource failures without leaving the user on a blank or confusing surface. The implementation covers the shared Classroom scene image and all word-audio playback paths used by Memory, Listen + Spell, and Listen + Speak.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` tracks `SceneImageLoadStatus` and initializes `sceneImageLoadStatus` to `idle` for every Scene page view model.
- `miniprogram/pages/scene/scene.ts` owns `onSceneImageLoad()`, `onSceneImageError()`, and `onRetrySceneImage()` for image load state transitions.
- `miniprogram/pages/scene/scene.ts` centralizes word-audio playback failures through `showAudioPlaybackErrorToast()` and `AUDIO_PLAYBACK_ERROR_MESSAGE`, so Memory, Listen + Spell, and Listen + Speak show the same lightweight prompt when playback fails.
- `miniprogram/pages/scene/scene.wxml` binds every scene image to `bindload` and `binderror`, and renders a retry fallback when `sceneImageLoadStatus === "failed"`.
- `miniprogram/pages/scene/scene.wxss` styles the image failure fallback as an overlay that preserves the preview dimensions and keeps the page layout stable.

Runtime notes:
- A failed scene image shows `Scene image could not load.` and a `Retry` button instead of a blank image region.
- Retry resets the image failure state so the image component can render again; if the path is still invalid, the error handler returns the user to the fallback.
- The retry button uses `catchtap` to avoid also triggering Memory, Listen + Spell, or Listen + Speak blank-area handlers.
- Word-audio playback failures show `音频暂时无法播放` through a toast and do not block the current learning flow.

Test coverage:
- `tests/resourceFailureFeedback.test.ts` covers scene image failure state, WXML load/error bindings, retry fallback markup/styles, and unified audio failure prompt wiring.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Adds scene image load/error/retry handlers and centralizes word-audio playback failure toast handling. | Phase 9 / Step 9.1 |
| `miniprogram/pages/scene/scene.wxml` | Adds scene image load/error bindings and retry fallback markup for every scene preview. | Phase 9 / Step 9.1 |
| `miniprogram/pages/scene/scene.wxss` | Styles the image failure fallback overlay and retry action. | Phase 9 / Step 9.1 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds scene image load status to the Scene page view model. | Phase 9 / Step 9.1 |
| `tests/resourceFailureFeedback.test.ts` | Covers resource failure feedback requirements for image and audio paths. | Phase 9 / Step 9.1 |

## 55. Phase 9 / Step 9.2 Mid-practice exit persistence

The Scene page now treats a page hide during Listen + Spell or Listen + Speak as an interrupted practice session. Completed answer work remains persisted because mistake and mastery services are called at the moment the user answers; the page no longer keeps a half-finished round in memory after the user leaves and returns.

Current responsibilities:
- `miniprogram/pages/scene/scene.ts` owns `createEmptyListeningWritingModeData()` for resetting the Listen + Spell state consistently.
- `miniprogram/pages/scene/scene.ts` owns `createSceneHomeModeResetData()` for returning the Scene page to the normal Classroom entry state.
- `miniprogram/pages/scene/scene.ts` owns `resetInterruptedPracticeState()`, which only resets interrupted `listeningWriting` and `listeningSpeaking` modes.
- `miniprogram/pages/scene/scene.ts` calls `resetInterruptedPracticeState()` from `onHide()` after stopping audio and cancelling any active recording.

Runtime notes:
- Leaving the page during Listen + Spell clears `listeningWritingRound`, the current question state, spelling state, pending continuation state, and mistake-practice mode state.
- Leaving the page during Listen + Speak clears `listeningSpeakingRound`, the current question state, recording state, recognition state, attempt count, answer reveal, pending continuation state, and completion counters.
- Memory mode is not treated as an interrupted quiz by this helper.
- Because the interrupted round is cleared, the next mode entry tap creates a fresh round through the existing practice-round creation path.

Test coverage:
- `tests/practiceExitPersistence.test.ts` imports the Scene page with mocked `Page`, `wx`, and services, then verifies that `onHide()` drops interrupted Listen + Spell and Listen + Speak queues.
- The same test confirms that exit cleanup does not call `recordMistake(...)` or `recordMistakeCorrectAnswer(...)`; persistence still belongs to the normal answer handlers.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Adds shared practice reset helpers and clears interrupted Listen + Spell / Listen + Speak rounds on page hide. | Phase 9 / Step 9.2 |
| `tests/practiceExitPersistence.test.ts` | Covers mid-practice exit cleanup for Listen + Spell and Listen + Speak without extra mistake writes. | Phase 9 / Step 9.2 |

## 56. Phase 9 / Step 9.3 User-facing feedback copy

The app now has a lightweight shared feedback-copy module for the common prompts that appear across learning, review, recording, and resource-failure flows. This keeps the MVP wording consistent and prevents internal implementation details such as mock recognition from appearing in normal user-facing UI.

Current responsibilities:
- `miniprogram/utils/feedbackCopy.ts` exports `feedbackCopy`, the shared copy object for core feedback strings and a small helper for mistake-type empty practice prompts.
- `miniprogram/pages/scene/scene.ts` uses `feedbackCopy` for audio unavailable, coming-soon/unavailable practice, listen-first, object/spelling feedback, recording, microphone permission, and speech recognition feedback.
- `miniprogram/pages/scene/scene.wxml` uses the updated image fallback wording (`Image unavailable.` / `Try again`) for every scene image fallback.
- `miniprogram/pages/index/indexViewModel.ts`, `miniprogram/pages/favorites/favorites.ts`, `miniprogram/pages/mistakes/mistakes.ts`, `miniprogram/pages/me/me.ts`, and `miniprogram/pages/me/meViewModel.ts` use shared copy for user-facing status or feedback text.

Runtime notes:
- Me no longer displays `Mock ASR enabled`; it shows `Speech practice ready.`
- Speech recognition failure and recording failure text is phrased as retryable product feedback, not a technical error.
- Scene image failure uses shorter fallback wording and the retry action now reads `Try again`.
- Mock recognition remains an implementation detail inside `speechService`; normal user-facing copy should not mention mock/ASR internals.

Test coverage:
- `tests/feedbackCopy.test.ts` covers the shared copy module, page imports, and absence of mock/technical wording in the main user-facing sources.
- Existing Scene, Favorites, Me, resource failure, recording, and recognition tests were updated to expect the shared copy wiring.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/utils/feedbackCopy.ts` | Centralizes core user-facing feedback text for resource, practice, recording, recognition, status, and review prompts. | Phase 9 / Step 9.3 |
| `miniprogram/pages/scene/scene.ts` | Uses shared copy for practice feedback, recording feedback, permission copy, recognition feedback, and audio/coming-soon prompts. | Phase 9 / Step 9.3 |
| `miniprogram/pages/scene/scene.wxml` | Updates scene image failure fallback wording and retry action copy. | Phase 9 / Step 9.3 |
| `miniprogram/pages/index/indexViewModel.ts` | Uses shared coming-soon copy for unavailable scenes. | Phase 9 / Step 9.3 |
| `miniprogram/pages/favorites/favorites.ts` | Uses shared audio-unavailable copy for favorite word playback failures. | Phase 9 / Step 9.3 |
| `miniprogram/pages/mistakes/mistakes.ts` | Uses shared no-mistakes-for-type copy in the practice picker. | Phase 9 / Step 9.3 |
| `miniprogram/pages/me/me.ts` | Uses shared speech status copy instead of exposing mock ASR wording. | Phase 9 / Step 9.3 |
| `miniprogram/pages/me/meViewModel.ts` | Uses shared speech status copy for the Me page view model. | Phase 9 / Step 9.3 |
| `tests/feedbackCopy.test.ts` | Covers shared feedback copy and guards against mock/technical wording in main user-facing sources. | Phase 9 / Step 9.3 |
| Existing feedback-related tests | Updated to assert shared copy references and revised user-facing wording. | Phase 9 / Step 9.3 |

## 57. Phase 9 / Step 9.4 Mobile visual adaptation and copy cleanup

The current UI has been adapted for narrow phone screens and cleaned of developer-facing explanatory copy. This step stays within the MVP feature set and focuses on making the existing pages feel less like implementation scaffolding.

Current responsibilities:
- `miniprogram/app.json` configures native tabBar items with local PNG icons for Home, Learn, Review, and Me. PNG is required because WeChat tabBar icons do not accept SVG.
- `miniprogram/assets/icons/tab-*.png` stores inactive and active tab icons for the four native tabBar items.
- `miniprogram/pages/scene/scene.ts` owns the custom scene feedback toast timer and clears it on hide/unload.
- `miniprogram/pages/scene/scene.wxml` renders the custom blank-scene tap hint and no longer renders the saved recording status in Listen + Speak retry states.
- `miniprogram/pages/scene/scene.wxss` contains the small-screen Scene page adaptations, including safe-area bottom padding, responsive feedback toast, wrapping recognition card, smaller record actions, and compact completion layouts.
- `miniprogram/pages/me/me.wxss` keeps the three stat cards side by side on small screens with reduced gaps, padding, and label sizes.
- Home, Favorites, Mistakes, Review, Memory, and placeholder learning pages no longer render unnecessary subtitle, description, or placeholder explanation copy.

Runtime notes:
- Blank taps in scene practice show `Tap an object in the picture.` in a custom fixed hint above the tabBar, avoiding native toast wrapping on small devices.
- Bottom navigation now uses icon + label layout, which avoids pure-text native tabBar vertical drift on affected devices.
- Listen + Speak failure feedback shows retry guidance and `Record Again`; it no longer shows a meaningless `Saved` pill.
- User-facing pages should avoid `subtitle` / `description` fields unless the text is necessary for completing an action.

Test coverage:
- `tests/mobileVisualAdaptation.test.ts` covers safe-area padding, card wrapping, compact Me stats, recognition wrapping, and the custom scene hint.
- `tests/navigation.test.ts` covers tabBar registration, local PNG icon paths, and PNG file headers.
- `tests/userFacingCopyCleanup.test.ts` guards against developer-facing copy such as subtitle/description placeholders and global-entry explanation text.
- Existing page view-model tests were updated so removed subtitles and descriptions cannot silently return.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/app.json` | Adds PNG iconPath and selectedIconPath values for the four native tabBar items. | Phase 9 / Step 9.4 |
| `miniprogram/assets/icons/tab-*.png` | Stores local inactive/active tabBar icons for Home, Learn, Review, and Me. | Phase 9 / Step 9.4 |
| `miniprogram/pages/scene/scene.ts` | Adds custom scene feedback toast state handling and removes native blank-tap toast usage. | Phase 9 / Step 9.4 |
| `miniprogram/pages/scene/scene.wxml` | Renders the custom blank-scene hint and removes redundant Listen + Speak saved status UI. | Phase 9 / Step 9.4 |
| `miniprogram/pages/scene/scene.wxss` | Adds small-screen Scene layout rules and responsive custom hint styling. | Phase 9 / Step 9.4 |
| `miniprogram/pages/me/me.wxss` | Keeps Me stats in three compact columns on narrow screens. | Phase 9 / Step 9.4 |
| `miniprogram/pages/index/`, `favorites/`, `mistakes/`, `review/`, `memory/`, `listening-writing/`, `listening-speaking/`, `shared/` | Removes nonessential user-facing subtitle, description, and placeholder explanation copy. | Phase 9 / Step 9.4 |
| `tests/mobileVisualAdaptation.test.ts` | Covers the mobile visual adaptation requirements. | Phase 9 / Step 9.4 |
| `tests/navigation.test.ts` | Covers native tabBar PNG icon requirements. | Phase 9 / Step 9.4 |
| `tests/userFacingCopyCleanup.test.ts` | Guards against developer-facing explanatory copy returning to user pages. | Phase 9 / Step 9.4 |

## 58. Phase 9 / Step 9.5 Me profile and learning dashboard

The Me page now acts as a compact learner profile and local learning dashboard instead of a placeholder stats/status screen. This remains local-first and stays within the MVP scope: no cloud account, login system, social profile, or real ASR status panel was added.

Current responsibilities:
- `miniprogram/services/profileService.ts` owns local profile defaults, normalization, and persistence for nickname, signature, avatar initials, and avatar URL.
- `miniprogram/services/learningActivityService.ts` owns daily learned-word activity reads, writes, and chart model generation for week/month views.
- `miniprogram/services/progressService.ts` records learning activity only when a word is newly added to the learned set, preventing activity double-counting on repeated word-card opens.
- `miniprogram/pages/me/meViewModel.ts` builds the Me page model from local progress, favorites, mistakes, profile, quick entries, chart tabs, and chart bars.
- `miniprogram/pages/me/me.ts` coordinates profile editing, WeChat native avatar selection, chart range switching, and quick-entry navigation.
- `miniprogram/pages/me/me.wxml` renders the profile card, editor, three stats, learning chart, and quick entries.
- `miniprogram/pages/me/me.wxss` keeps the profile, stats, chart, and quick-entry layouts compact on narrow screens.

Runtime notes:
- Avatar selection uses the native WeChat `open-type="chooseAvatar"` flow because the MVP prioritizes the expected WeChat-avatar experience.
- Canceling native avatar selection can print `chooseAvatar:fail cancel` in WeChat DevTools; this is treated as a development-console message from the native component, not an app data failure.
- The profile editor currently supports nickname and signature edits. Avatar changes happen by tapping the avatar itself.
- Quick entries route to the existing Learn tab, Favorites page, and Mistakes page.
- The learning chart can show week or month data and uses local storage only.

Test coverage:
- `tests/profileService.test.ts` covers default and saved profile behavior.
- `tests/learningActivityService.test.ts` covers daily activity recording and chart model generation.
- `tests/meViewModel.test.ts` covers Me dashboard model output.
- `tests/meDashboard.test.ts` covers Me page structure, native avatar picker wiring, small-screen layout hooks, and removal of the old speech status card.
- `tests/progressService.test.ts` covers learned-word activity recording without repeated double-counting.
- `tests/feedbackCopy.test.ts` remains aligned with the removal of the old Me speech status card.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/profileService.ts` | Stores and normalizes the local learner profile for the Me page. | Phase 9 / Step 9.5 |
| `miniprogram/services/learningActivityService.ts` | Records learned-word daily activity and generates week/month chart data. | Phase 9 / Step 9.5 |
| `miniprogram/services/progressService.ts` | Records daily activity when a word becomes newly learned. | Phase 9 / Step 9.5 |
| `miniprogram/types/index.ts` | Adds profile and learning-activity storage/data types. | Phase 9 / Step 9.5 |
| `miniprogram/pages/me/meViewModel.ts` | Builds profile, stats, chart, and quick-entry view data for the Me page. | Phase 9 / Step 9.5 |
| `miniprogram/pages/me/me.ts` | Handles profile editing, native avatar selection, chart tabs, and quick-entry navigation. | Phase 9 / Step 9.5 |
| `miniprogram/pages/me/me.wxml` | Renders the profile card/editor, stats, learning chart, and quick entries. | Phase 9 / Step 9.5 |
| `miniprogram/pages/me/me.wxss` | Styles the Me dashboard and narrow-screen layout. | Phase 9 / Step 9.5 |
| `tests/profileService.test.ts` | Covers local profile defaults and persistence. | Phase 9 / Step 9.5 |
| `tests/learningActivityService.test.ts` | Covers local activity recording and chart generation. | Phase 9 / Step 9.5 |
| `tests/meViewModel.test.ts` | Covers Me dashboard view model output. | Phase 9 / Step 9.5 |
| `tests/meDashboard.test.ts` | Covers Me page structure, avatar picker wiring, and compact layout guards. | Phase 9 / Step 9.5 |
| `tests/progressService.test.ts` | Covers activity recording from newly learned words. | Phase 9 / Step 9.5 |

## 59. Lecture Hall scene content and hotspot calibration

Lecture Hall is now a selectable learnable scene using a local artwork, local audio, and local TypeScript vocabulary data. This preserves the existing local-first architecture while allowing the Home scene selection flow to choose which available scene the Learn tab should load.

Current responsibilities:
- `miniprogram/services/currentSceneService.ts` stores the selected learnable scene ID in local settings storage.
- `miniprogram/pages/index/index.ts` saves the selected available scene before switching to the Learn tab.
- `miniprogram/pages/scene/scene.ts` loads the selected scene from storage when the Learn tab is shown and reloads if the selected scene changes.
- `miniprogram/pages/scene/scene.wxml` renders the current scene name dynamically and disables default hover feedback on transparent hotspots.
- `miniprogram/pages/scene/scene.wxss` keeps memory, listening-writing, and listening-speaking hotspots visually transparent during taps.
- `miniprogram/data/scenes.ts` stores the approved Lecture Hall scene metadata, 20-word vocabulary, repeated-object `positions`, and calibrated hotspot coordinates.
- `miniprogram/services/wordService.ts` resolves words by globally unique IDs so repeated English labels such as podium and clock can coexist across scenes.
- `miniprogram/assets/picture/lecture-hall.png` stores the approved Lecture Hall artwork.
- `miniprogram/assets/audio/lecture-hall/` stores local MP3 pronunciation assets for all 20 Lecture Hall words.

Runtime notes:
- Lecture Hall and Classroom are both available scenes. Dormitory and Cafeteria remain coming soon.
- Vocabulary IDs remain globally unique even when English labels repeat across scenes; Lecture Hall uses `lecture-hall-podium` and `lecture-hall-clock` for the repeated labels.
- Lecture Hall useful-expression Chinese copy starts folded in the word card and appears only after the user expands it.
- Transparent scene hotspots use `hover-class="none"` so tapping a hotspot does not show a temporary white flash.
- Right-side acoustic panel and exit-sign hotspots are intentionally separated so the acoustic panel does not cover the exit sign.

Test coverage:
- `tests/currentSceneService.test.ts` covers local selected-scene persistence.
- `tests/sceneSelection.test.ts` covers Home-to-Learn scene selection and dynamic scene name rendering.
- `tests/scenes.test.ts` covers the 20-word Lecture Hall dataset, image dimensions, repeated labels, readable Chinese copy, audio paths, and calibrated hotspots.
- `tests/assets.test.ts` covers required Lecture Hall image and audio assets.
- `tests/sceneMemoryHotspots.test.ts` covers transparent hotspot tap behavior.
- `tests/sceneMemoryWordCard.test.ts` covers folded useful-expression translation behavior.
- Existing scene and word service tests cover multi-scene loading and globally unique word lookup.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/currentSceneService.ts` | Stores and reads the selected learnable scene ID. | Lecture Hall scene content |
| `miniprogram/pages/index/index.ts` | Saves selected available scene before tab navigation. | Lecture Hall scene content |
| `miniprogram/pages/index/indexViewModel.ts` | Returns the selected scene ID with available-scene navigation actions. | Lecture Hall scene content |
| `miniprogram/pages/scene/scene.ts` | Loads the selected scene from storage and updates scene-specific state. | Lecture Hall scene content |
| `miniprogram/pages/scene/scene.wxml` | Renders dynamic scene names and disables transparent hotspot hover feedback. | Lecture Hall scene content |
| `miniprogram/pages/scene/scene.wxss` | Removes active-state visual flashes from transparent hotspots. | Lecture Hall scene content |
| `miniprogram/pages/scene/sceneViewModel.ts` | Keeps useful-expression Chinese copy folded by default. | Lecture Hall scene content |
| `miniprogram/data/scenes.ts` | Adds the approved Lecture Hall scene, 20 words, and calibrated hotspots. | Lecture Hall scene content |
| `miniprogram/services/wordService.ts` | Supports unique word lookup across repeated scene labels. | Lecture Hall scene content |
| `miniprogram/types/index.ts` | Adds multi-position hotspot support. | Lecture Hall scene content |
| `miniprogram/assets/picture/lecture-hall.png` | Stores the approved Lecture Hall artwork. | Lecture Hall scene content |
| `miniprogram/assets/audio/lecture-hall/` | Stores local pronunciation audio for the 20 Lecture Hall words. | Lecture Hall scene content |
| `tests/currentSceneService.test.ts` | Covers selected-scene storage. | Lecture Hall scene content |
| `tests/sceneSelection.test.ts` | Covers scene selection and dynamic Learn tab loading. | Lecture Hall scene content |
| `tests/scenes.test.ts` | Covers Lecture Hall data, assets, and hotspot calibration. | Lecture Hall scene content |
| `tests/assets.test.ts` | Covers Lecture Hall image and audio asset availability. | Lecture Hall scene content |
| `tests/sceneMemoryHotspots.test.ts` | Covers transparent hotspot tap behavior. | Lecture Hall scene content |

## 60. v2 Scene Tutor / Step 1.1 Scene Tutor domain types

Scene Tutor now has shared TypeScript contracts for the upcoming RAG-based AI assistant flow. This step establishes the data boundary only; it does not add runtime UI, cloud calls, API keys, model configuration, or prompt execution.

Current responsibilities:
- `miniprogram/types/index.ts` defines Scene Tutor task kinds for Ask AI and Make Sentences modes.
- `miniprogram/types/index.ts` defines matched-word RAG metadata so later services can pass the relevant scene vocabulary with match reasons and scores.
- `miniprogram/types/index.ts` defines local learning signals for favorites, mistake words, mastered words, and recently viewed words.
- `miniprogram/types/index.ts` defines the Scene Tutor context and cloud request payload that will later be sent to the CloudBase function.
- `miniprogram/types/index.ts` defines structured response types for Ask AI and Make Sentences.
- `miniprogram/types/index.ts` defines stable error codes for unavailable service, invalid request, out-of-scope request, model timeout, and invalid model response.

Runtime notes:
- The default model selection and API credentials remain outside the mini-program codebase and will be configured through CloudBase environment variables during the later integration step.
- The mini-program will continue to build context from local scene and learning data; this type layer prepares that boundary without changing existing learning flows.
- Quiz generation, real ASR, cloud sync, and generic chatbot behavior remain outside the current v2 implementation scope.

Test coverage:
- `tests/sceneTutorContextService.test.ts` currently covers the shared type imports and expected request/response contract shape. It will expand in Step 1.2 when the local context service is implemented.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/types/index.ts` | Adds Scene Tutor task, RAG context, request, response, learning-signal, and error-code contracts. | v2 Scene Tutor / Step 1.1 |
| `tests/sceneTutorContextService.test.ts` | Starts the Scene Tutor TDD coverage with type-contract checks. | v2 Scene Tutor / Step 1.1 |

## 61. v2 Scene Tutor / Step 1.2 Scene Tutor context service

Scene Tutor now has a local context service that gathers the learner and scene signals needed before retrieval and cloud generation. This remains local-only and does not call CloudBase, the LLM provider, or any external API.

Current responsibilities:
- `miniprogram/services/sceneTutorContextService.ts` checks that the requested scene exists and is available.
- `miniprogram/services/sceneTutorContextService.ts` reads the current scene word list through `wordService`.
- `miniprogram/services/sceneTutorContextService.ts` reads favorites, mistakes, and progress through the existing service layer.
- `miniprogram/services/sceneTutorContextService.ts` builds `SceneTutorLearningSignals` with scene-scoped favorite word IDs, mistake word IDs, learned word IDs, learned count, and total word count.
- `miniprogram/services/sceneTutorContextService.ts` builds a base `SceneTutorContext` containing scene metadata, task, query, selected word IDs, empty `matchedWords`, and learning signals.
- `miniprogram/types/index.ts` defines result types for Scene Tutor learning-signal and base-context builders.

Runtime notes:
- Unknown, unavailable, or coming-soon scenes return a structured `unavailable` result so later page code can show a controlled fallback.
- Favorites, mistakes, learned words, and selected word IDs are filtered against the requested scene's real word list before entering the AI context.
- Retrieval ranking is intentionally deferred to the next step; `matchedWords` is empty in the base context until the local retrieval service populates it.

Test coverage:
- `tests/sceneTutorContextService.test.ts` covers Classroom and Lecture Hall context signals.
- `tests/sceneTutorContextService.test.ts` covers empty local data.
- `tests/sceneTutorContextService.test.ts` covers cross-scene scoping for favorites, mistakes, and learned words.
- `tests/sceneTutorContextService.test.ts` covers base context creation and unknown scene handling.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/sceneTutorContextService.ts` | Builds local Scene Tutor learning signals and base context for later RAG retrieval. | v2 Scene Tutor / Step 1.2 |
| `miniprogram/types/index.ts` | Adds structured result/input types for context-service functions. | v2 Scene Tutor / Step 1.2 |
| `tests/sceneTutorContextService.test.ts` | Covers the local Scene Tutor context-service behavior. | v2 Scene Tutor / Step 1.2 |

## 62. v2 Scene Tutor / Step 1.3 Lightweight RAG retrieval service

Scene Tutor now has a local retrieval service that converts the user's current scene, query, selected words, and learning signals into a compact `matchedWords` list. This is the mini-program side of the lightweight RAG flow; it remains local-only and does not call CloudBase or an external model.

Current responsibilities:
- `miniprogram/services/sceneTutorRetrievalService.ts` retrieves words only from the requested available scene.
- `miniprogram/services/sceneTutorRetrievalService.ts` matches against English word text, Chinese meaning, useful-expression English, and useful-expression Chinese.
- `miniprogram/services/sceneTutorRetrievalService.ts` ranks selected words first when they are provided.
- `miniprogram/services/sceneTutorRetrievalService.ts` applies small ranking boosts for mistake words, favorite words, and learned words.
- `miniprogram/services/sceneTutorRetrievalService.ts` returns current-scene fallback words when there is no direct text or selected-word match.
- `miniprogram/services/sceneTutorRetrievalService.ts` caps `matchedWords` at 5 items to keep the future cloud payload compact.
- `miniprogram/types/index.ts` defines input/result types for retrieval.

Runtime notes:
- The service returns structured `unavailable` results for unknown or unavailable scenes.
- Ranking is intentionally lightweight and explainable; it is not semantic embedding search.
- The fallback path still respects current scene boundaries and learning signals.
- `SceneTutorMatchedWord` includes favorite, mistake-type, and learned flags so prompt construction can reference the learner's current state without sending raw local-storage records.

Test coverage:
- `tests/sceneTutorRetrievalService.test.ts` covers Classroom `projector` matching.
- `tests/sceneTutorRetrievalService.test.ts` covers Lecture Hall `stage` retrieval without Classroom contamination.
- `tests/sceneTutorRetrievalService.test.ts` covers mistake/favorite ranking boosts.
- `tests/sceneTutorRetrievalService.test.ts` covers selected-word priority.
- `tests/sceneTutorRetrievalService.test.ts` covers current-scene fallback words.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/sceneTutorRetrievalService.ts` | Retrieves and ranks compact Scene Tutor matched words from the current scene. | v2 Scene Tutor / Step 1.3 |
| `miniprogram/types/index.ts` | Adds Scene Tutor retrieval input/result types. | v2 Scene Tutor / Step 1.3 |
| `tests/sceneTutorRetrievalService.test.ts` | Covers local retrieval behavior and scene scoping. | v2 Scene Tutor / Step 1.3 |

## 63. v2 Scene Tutor / Step 1.4 Scene Tutor payload builder

Scene Tutor now has a mini-program payload builder that combines the local context and retrieval layers into the minimal request shape needed by the future CloudBase function. This step still does not call CloudBase or any external model.

Current responsibilities:
- `miniprogram/services/sceneTutorPromptService.ts` receives the Scene Tutor task, scene ID, query, and optional selected word IDs from future UI/service callers.
- `miniprogram/services/sceneTutorPromptService.ts` calls `sceneTutorContextService` to build scene metadata and learning signals.
- `miniprogram/services/sceneTutorPromptService.ts` calls `sceneTutorRetrievalService` to populate compact `matchedWords`.
- `miniprogram/services/sceneTutorPromptService.ts` returns a `SceneTutorRequestPayload` containing only `task` and `context`.
- `miniprogram/types/index.ts` defines the Scene Tutor payload input/result contracts.

Runtime notes:
- The payload intentionally excludes API keys, provider credentials, raw local-storage keys, storage adapter methods, and full cross-scene vocabulary data.
- Unavailable-scene results are propagated as structured `unavailable` errors.
- Ask AI and Make Sentences share the same payload boundary; task-specific generation behavior belongs to the CloudBase function and prompt layer.

Test coverage:
- `tests/sceneTutorPromptService.test.ts` covers Ask AI payload shape.
- `tests/sceneTutorPromptService.test.ts` covers Make Sentences selected-word preservation.
- `tests/sceneTutorPromptService.test.ts` checks that secret-like fields and raw storage structures are absent from the payload.
- `tests/sceneTutorPromptService.test.ts` covers structured unavailable-scene handling.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/sceneTutorPromptService.ts` | Builds minimal Scene Tutor cloud-function payloads from local context and retrieval results. | v2 Scene Tutor / Step 1.4 |
| `miniprogram/types/index.ts` | Adds Scene Tutor payload input/result contracts. | v2 Scene Tutor / Step 1.4 |
| `tests/sceneTutorPromptService.test.ts` | Covers payload shape, selected-word preservation, and secret/raw-storage exclusions. | v2 Scene Tutor / Step 1.4 |

## 64. v2 Scene Tutor / Step 2.1 CloudBase function skeleton

Scene Tutor now has a CloudBase cloud function directory with a local-testable core handler. The skeleton prepares the server-side boundary for future prompt building, response parsing, and LLM provider integration without storing API credentials in the repository.

Current responsibilities:
- `cloudfunctions/sceneTutor/package.json` defines the cloud function package as a private CommonJS module.
- `cloudfunctions/sceneTutor/index.js` exports `main` for CloudBase and `handleSceneTutorRequest` for local unit tests.
- `cloudfunctions/sceneTutor/guardrails.js` defines the supported v2 task set and initial request validation.
- `cloudfunctions/sceneTutor/promptBuilder.js` reserves the prompt builder module for the next server-side implementation steps.
- `cloudfunctions/sceneTutor/responseParser.js` reserves the model response parser module for later structured parsing.
- `tests/cloudSceneTutorFunction.test.ts` imports the CommonJS handler through Node's `createRequire` so Vitest can exercise the cloud function core.

Runtime notes:
- No API key, provider key, base URL, or model secret is stored in the cloud function directory.
- `handleSceneTutorRequest` currently returns a minimal success object after guardrail validation; model invocation is intentionally deferred.
- The initial guardrails validate supported task values and query length. Fuller matched-word, selected-word, scene, and secret-field validation belongs to Step 2.2.

Test coverage:
- `tests/cloudSceneTutorFunction.test.ts` covers a supported Scene Tutor task.
- `tests/cloudSceneTutorFunction.test.ts` covers unsupported task handling with `invalid_request`.
- `tests/cloudSceneTutorFunction.test.ts` covers query length over 500 characters.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/package.json` | Defines the CloudBase function package metadata. | v2 Scene Tutor / Step 2.1 |
| `cloudfunctions/sceneTutor/index.js` | Exposes the CloudBase `main` entry and local-testable handler. | v2 Scene Tutor / Step 2.1 |
| `cloudfunctions/sceneTutor/guardrails.js` | Provides initial task and query-length validation. | v2 Scene Tutor / Step 2.1 |
| `cloudfunctions/sceneTutor/promptBuilder.js` | Reserves the server-side prompt builder module. | v2 Scene Tutor / Step 2.1 |
| `cloudfunctions/sceneTutor/responseParser.js` | Reserves the server-side response parser module. | v2 Scene Tutor / Step 2.1 |
| `tests/cloudSceneTutorFunction.test.ts` | Covers the cloud function skeleton through the local handler. | v2 Scene Tutor / Step 2.1 |

## 65. v2 Scene Tutor / Step 2.2 Cloud function guardrails

The Scene Tutor cloud function now validates the request more fully before any prompt building or model call can occur. This keeps the server-side boundary narrow and prevents obvious malformed or secret-bearing requests from moving deeper into the AI pipeline.

Current responsibilities:
- `cloudfunctions/sceneTutor/guardrails.js` validates that `task` belongs to the supported v2 task set.
- `cloudfunctions/sceneTutor/guardrails.js` validates that `context.scene.id` exists.
- `cloudfunctions/sceneTutor/guardrails.js` validates that `context.query` exists and is at most 500 characters.
- `cloudfunctions/sceneTutor/guardrails.js` validates that `matchedWords` is an array with at most 5 items.
- `cloudfunctions/sceneTutor/guardrails.js` validates that Make Sentences selected words do not exceed 5 items.
- `cloudfunctions/sceneTutor/guardrails.js` recursively rejects secret-like request fields such as `apiKey`, `LLM_API_KEY`, `providerKey`, `token`, and `secret`.

Runtime notes:
- Guardrails return structured `invalid_request` results and do not throw for expected malformed requests.
- Out-of-scope semantic handling remains outside this guardrail layer; later prompt instructions and model response handling constrain that behavior.
- API keys remain environment-only and are not accepted from client payloads.

Test coverage:
- `tests/cloudSceneTutorFunction.test.ts` covers valid tasks, unsupported tasks, query length, missing scene ID, excessive matched words, excessive selected words, and secret-like fields.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/guardrails.js` | Adds fuller server-side request validation before prompt/model work. | v2 Scene Tutor / Step 2.2 |
| `tests/cloudSceneTutorFunction.test.ts` | Expands guardrail coverage for malformed or unsafe cloud requests. | v2 Scene Tutor / Step 2.2 |

## 66. v2 Scene Tutor / Step 2.3 Prompt builder

The Scene Tutor cloud function can now build stable prompt messages for the two v2 task families. Prompt construction stays server-side and uses only the minimal context supplied by the mini-program payload.

Current responsibilities:
- `cloudfunctions/sceneTutor/promptBuilder.js` returns separate `system` and `user` prompt messages.
- `cloudfunctions/sceneTutor/promptBuilder.js` instructs the model to act as Scene Tutor, stay within the current scene, prioritize matched words, and return JSON only.
- `cloudfunctions/sceneTutor/promptBuilder.js` includes current scene metadata, user query, selected words, matched word summaries, and learning signals.
- `cloudfunctions/sceneTutor/promptBuilder.js` defines Ask AI output fields: `answer`, `example`, `relatedWords`, and `basedOn`.
- `cloudfunctions/sceneTutor/promptBuilder.js` defines Make Sentences output fields: `generatedText`, `keyWordsUsed`, `chineseHelp`, and `trySaying`.

Runtime notes:
- Prompt building does not read provider environment variables and does not include API key values.
- Prompt output is still plain message text; actual provider invocation and response parsing are handled by later steps.
- The prompt uses compact matched-word summaries rather than raw local-storage records or full cross-scene data.

Test coverage:
- `tests/cloudSceneTutorPromptBuilder.test.ts` covers Ask AI prompt content.
- `tests/cloudSceneTutorPromptBuilder.test.ts` covers Make Sentences prompt content.
- `tests/cloudSceneTutorPromptBuilder.test.ts` verifies environment API key values are not included in prompt output.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/promptBuilder.js` | Builds server-side Scene Tutor prompt messages for Ask AI and Make Sentences tasks. | v2 Scene Tutor / Step 2.3 |
| `tests/cloudSceneTutorPromptBuilder.test.ts` | Covers prompt content and secret-value exclusion. | v2 Scene Tutor / Step 2.3 |

## 67. v2 Scene Tutor / Step 2.4 OpenAI-compatible provider abstraction

Scene Tutor now has a replaceable LLM provider layer for OpenAI-compatible chat completions. The provider is configured exclusively through environment variables and can be tested locally through an injected request function.

Current responsibilities:
- `cloudfunctions/sceneTutor/providers/llmProvider.js` exposes `callLlmProvider` as the cloud function's provider entry point.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` builds OpenAI-compatible `/chat/completions` requests.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` reads `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` from the provided environment object or `process.env`.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` defaults `LLM_MODEL` to `deepseek-v4-flash` when the model variable is absent.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` returns model text from the first chat completion choice.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` returns structured provider errors without exposing API key values.

Runtime notes:
- `LLM_BASE_URL` is not hardcoded; it must be configured in CloudBase environment variables during real integration.
- The provider layer does not parse model JSON; it only returns raw model text for `responseParser.js`.
- Unit tests inject a fake request function, so this step does not depend on network access or a real API key.

Test coverage:
- `tests/cloudSceneTutorProvider.test.ts` covers missing provider configuration.
- `tests/cloudSceneTutorProvider.test.ts` covers successful OpenAI-compatible request shape and model text extraction.
- `tests/cloudSceneTutorProvider.test.ts` covers the default `deepseek-v4-flash` model.
- `tests/cloudSceneTutorProvider.test.ts` covers provider failure without API key leakage.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/providers/llmProvider.js` | Exposes the replaceable Scene Tutor LLM provider entry. | v2 Scene Tutor / Step 2.4 |
| `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` | Implements OpenAI-compatible chat completions provider behavior. | v2 Scene Tutor / Step 2.4 |
| `tests/cloudSceneTutorProvider.test.ts` | Covers provider configuration, request shape, default model, and safe errors. | v2 Scene Tutor / Step 2.4 |

## 68. v2 Scene Tutor / Step 2.5 Response parser and fallback

Scene Tutor now has a response parser that converts raw model text into structured cloud function results. The parser protects the mini-program from malformed or incomplete model output by normalizing known response shapes and returning structured errors for unusable content.

Current responsibilities:
- `cloudfunctions/sceneTutor/responseParser.js` parses JSON model output when the response appears JSON-like.
- `cloudfunctions/sceneTutor/responseParser.js` normalizes Ask AI fields: `answer`, `example`, `relatedWords`, and `basedOn`.
- `cloudfunctions/sceneTutor/responseParser.js` normalizes Make Sentences fields: `generatedText`, `keyWordsUsed`, `chineseHelp`, and `trySaying`.
- `cloudfunctions/sceneTutor/responseParser.js` converts plain text into a structured fallback response.
- `cloudfunctions/sceneTutor/responseParser.js` returns `model_response_invalid` for empty text or malformed JSON-like output.

Runtime notes:
- Missing optional arrays become empty arrays; missing optional strings become empty strings.
- The parser does not call the provider or inspect prompts; it only handles raw text plus task type.
- The mini-program can later distinguish successful parsed responses from structured parser errors without crashing.

Test coverage:
- `tests/cloudSceneTutorResponseParser.test.ts` covers valid Ask AI JSON.
- `tests/cloudSceneTutorResponseParser.test.ts` covers valid Make Sentences JSON.
- `tests/cloudSceneTutorResponseParser.test.ts` covers plain-text fallback.
- `tests/cloudSceneTutorResponseParser.test.ts` covers malformed JSON-like output and empty text.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/responseParser.js` | Parses raw model text into structured Scene Tutor responses or structured errors. | v2 Scene Tutor / Step 2.5 |
| `tests/cloudSceneTutorResponseParser.test.ts` | Covers model response parsing, fallback, and invalid-output behavior. | v2 Scene Tutor / Step 2.5 |

## 69. v2 Scene Tutor / Step 2.6 Local cloud function end-to-end test

The Scene Tutor cloud function core now runs as a complete local pipeline in unit tests. This closes the server-side loop from validated request to prompt creation, provider invocation, response parsing, and structured output without requiring a real API key or network call.

Current responsibilities:
- `cloudfunctions/sceneTutor/index.js` calls `validateSceneTutorRequest` before any AI processing.
- `cloudfunctions/sceneTutor/index.js` builds prompt messages through `buildSceneTutorPrompt`.
- `cloudfunctions/sceneTutor/index.js` calls an injected provider in tests or `callLlmProvider` by default.
- `cloudfunctions/sceneTutor/index.js` parses provider text through `parseSceneTutorResponse`.
- `cloudfunctions/sceneTutor/index.js` returns parsed Scene Tutor responses with provider model metadata when available.
- `tests/cloudSceneTutorFunction.test.ts` injects fake providers to exercise the full local pipeline.

Runtime notes:
- Without CloudBase provider environment variables, valid requests return the structured `provider_not_configured` result.
- Local tests do not use real API keys, do not call the network, and do not depend on the selected production provider.
- Guardrail failures still return before prompt building or provider invocation.

Test coverage:
- `tests/cloudSceneTutorFunction.test.ts` covers invalid request guardrails.
- `tests/cloudSceneTutorFunction.test.ts` covers provider-not-configured behavior.
- `tests/cloudSceneTutorFunction.test.ts` covers local end-to-end Ask AI success with fake provider output.
- `tests/cloudSceneTutorFunction.test.ts` covers local end-to-end Make Sentences success with fake provider output.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `cloudfunctions/sceneTutor/index.js` | Connects guardrails, prompt builder, provider, and parser into the cloud function core pipeline. | v2 Scene Tutor / Step 2.6 |
| `tests/cloudSceneTutorFunction.test.ts` | Covers the local end-to-end cloud function pipeline with fake providers. | v2 Scene Tutor / Step 2.6 |

## 70. v2 Scene Tutor / Step 3.1 Mini-program cloud capability initialization

The mini-program app now initializes WeChat cloud capability on launch without hardcoding a CloudBase environment ID or any model/provider credentials. This prepares the client for the later `sceneTutor` cloud function call while keeping app startup safe when cloud capability is unavailable.

Current responsibilities:
- `miniprogram/services/cloudInitService.ts` wraps `wx.cloud.init({ traceUser: true })`.
- `miniprogram/services/cloudInitService.ts` returns a structured unavailable result if `wx.cloud` is missing or cloud initialization throws.
- `miniprogram/app.ts` calls the cloud initialization wrapper in `onLaunch`.
- `miniprogram/app.ts` stores the result in `globalData.isCloudAvailable` for later service/page checks.
- `miniprogram/typings/index.d.ts` defines the new app global data shape.

Runtime notes:
- No CloudBase environment ID is hardcoded in source.
- No API key, provider key, base URL, or model configuration is stored in the mini-program.
- Cloud initialization failure does not block the existing learning flows; later Scene Tutor cloud calls can show controlled unavailable feedback.
- The local test command had to invoke Vitest through the project-local Node binary because the Windows `.cmd` shim returned `Access is denied` in the current environment.

Test coverage:
- `tests/cloudInitService.test.ts` covers successful cloud initialization.
- `tests/cloudInitService.test.ts` covers missing `wx.cloud`.
- `tests/cloudInitService.test.ts` covers initialization exceptions.
- `tests/cloudInitService.test.ts` covers `app.ts` launch wiring.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/cloudInitService.ts` | Safely initializes WeChat cloud capability for Scene Tutor cloud-function calls. | v2 Scene Tutor / Step 3.1 |
| `miniprogram/app.ts` | Calls cloud initialization on launch and stores cloud availability in global data. | v2 Scene Tutor / Step 3.1 |
| `miniprogram/typings/index.d.ts` | Adds `isCloudAvailable` to the app global data contract. | v2 Scene Tutor / Step 3.1 |
| `tests/cloudInitService.test.ts` | Covers cloud initialization behavior and app launch wiring. | v2 Scene Tutor / Step 3.1 |

## 71. v2 Scene Tutor / Step 3.2 Scene Tutor cloud function call service

The mini-program now has a client-side service boundary for calling the `sceneTutor` CloudBase function. Page code should use this service later instead of calling `wx.cloud.callFunction` directly.

Current responsibilities:
- `miniprogram/services/sceneTutorCloudService.ts` exposes `requestSceneTutor(payload)`.
- `miniprogram/services/sceneTutorCloudService.ts` calls the `sceneTutor` cloud function with the prepared payload.
- `miniprogram/services/sceneTutorCloudService.ts` validates successful Ask AI and Make Sentences response shapes before returning them to page code.
- `miniprogram/services/sceneTutorCloudService.ts` maps rejected calls, timeouts, and invalid result shapes to a structured `unavailable` result.
- `miniprogram/services/sceneTutorCloudService.ts` strips secret-like fields before data leaves the mini-program.

Runtime notes:
- The service does not store, read, or send model API keys.
- The timeout fallback prevents Scene Tutor UI from waiting forever when the cloud function or network stalls.
- Error details, stacks, provider names, status codes, and internal exception messages are not returned to user-facing page code.
- Tests inject a fake cloud-call function; no real CloudBase environment is required for local verification.

Test coverage:
- `tests/sceneTutorCloudService.test.ts` covers successful Ask AI responses.
- `tests/sceneTutorCloudService.test.ts` covers successful Make Sentences responses.
- `tests/sceneTutorCloudService.test.ts` covers rejected cloud calls.
- `tests/sceneTutorCloudService.test.ts` covers invalid cloud result shapes.
- `tests/sceneTutorCloudService.test.ts` covers timeout fallback.
- `tests/sceneTutorCloudService.test.ts` covers secret-like field stripping.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/services/sceneTutorCloudService.ts` | Wraps the mini-program Scene Tutor CloudBase function call and normalizes cloud results. | v2 Scene Tutor / Step 3.2 |
| `tests/sceneTutorCloudService.test.ts` | Covers Scene Tutor cloud-call success, failure, timeout, malformed result, and secret stripping. | v2 Scene Tutor / Step 3.2 |

## 72. v2 Scene Tutor / Step 3.3 Scene Tutor copy utility

Scene Tutor now has a centralized mini-program copy utility for user-facing strings. This keeps the upcoming Scene Tutor entry, Ask AI panel, Make Sentences panel, and error/empty/loading states consistent while avoiding visible implementation terminology.

Current responsibilities:
- `miniprogram/utils/sceneTutorCopy.ts` stores Scene Tutor title and entry copy.
- `miniprogram/utils/sceneTutorCopy.ts` stores Ask AI recommended questions.
- `miniprogram/utils/sceneTutorCopy.ts` stores Make Sentences generation labels and selection actions.
- `miniprogram/utils/sceneTutorCopy.ts` stores loading, unavailable, out-of-scope, and empty-state copy.
- `miniprogram/services/sceneTutorCloudService.ts` reuses `sceneTutorCopy.errorUnavailable` for cloud-call fallback results.

Runtime notes:
- User-facing Scene Tutor copy avoids internal terms such as prompt, RAG, token, API, provider, mock, stack, and key.
- Generation type values still use internal task ids in data objects for routing; labels remain user-facing text.
- Page rendering for the Scene Tutor entry and panels is handled by later Phase 4+ steps.

Test coverage:
- `tests/sceneTutorCopy.test.ts` covers the centralized copy structure.
- `tests/sceneTutorCopy.test.ts` scans Scene Tutor visible copy for forbidden technical wording.
- `tests/sceneTutorCloudService.test.ts` continues to cover unavailable cloud-call fallback using the centralized copy.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/utils/sceneTutorCopy.ts` | Centralizes Scene Tutor user-facing copy for entry, Ask AI, Make Sentences, loading, errors, empty, and out-of-scope states. | v2 Scene Tutor / Step 3.3 |
| `miniprogram/services/sceneTutorCloudService.ts` | Reuses Scene Tutor copy for cloud-call unavailable fallback. | v2 Scene Tutor / Step 3.3 |
| `tests/sceneTutorCopy.test.ts` | Covers Scene Tutor copy structure and technical-wording exclusions. | v2 Scene Tutor / Step 3.3 |

## 73. v2 Scene Tutor / Step 4.1 Scene Tutor scene entry

The scene learning page now exposes a Scene Tutor entry for scenes that are already available to learn. This is still an entry-only integration; the in-page Scene Tutor mode shell and task panels are handled by later Step 4.x work.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` builds `sceneTutorEntry` for available scenes and returns `null` for coming-soon scenes.
- `miniprogram/pages/scene/scene.wxml` renders the Scene Tutor entry after the existing learning mode entries.
- `miniprogram/pages/scene/scene.wxss` styles the Scene Tutor entry as a compact scene-level tool card.
- `miniprogram/utils/sceneTutorCopy.ts` remains the source for visible Scene Tutor entry copy.

Runtime notes:
- Classroom and Lecture Hall both receive the Scene Tutor entry because their scene status is `available`.
- Dormitory and Cafeteria do not receive the available Scene Tutor entry because their scene status is `comingSoon`.
- The existing Memory, Listen + Spell, and Listen + Speak mode entries remain unchanged.
- The entry uses `supportingText` in page-facing view-model data to avoid reintroducing the previously banned `description` field name in user-facing page sources.

Test coverage:
- `tests/sceneTutorPage.test.ts` covers Scene Tutor entry visibility for Classroom and Lecture Hall.
- `tests/sceneTutorPage.test.ts` covers Scene Tutor entry exclusion for Dormitory and Cafeteria.
- `tests/sceneTutorPage.test.ts` covers WXML rendering from view-model data while preserving existing mode rendering.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds the Scene Tutor entry data for available scenes. | v2 Scene Tutor / Step 4.1 |
| `miniprogram/pages/scene/scene.wxml` | Renders the Scene Tutor entry on the scene learning page. | v2 Scene Tutor / Step 4.1 |
| `miniprogram/pages/scene/scene.wxss` | Styles the Scene Tutor entry. | v2 Scene Tutor / Step 4.1 |
| `tests/sceneTutorPage.test.ts` | Covers Scene Tutor scene-entry visibility and WXML rendering. | v2 Scene Tutor / Step 4.1 |

## 74. v2 Scene Tutor / Step 4.2 Scene Tutor in-page mode shell

The Scene Tutor entry now opens an in-page Scene Tutor mode shell inside the Learn tab. This keeps Scene Tutor aligned with the existing Memory, Listen + Spell, and Listen + Speak mode-switching model instead of introducing a separate page route.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` includes `sceneTutor` in the scene entry id union.
- `miniprogram/pages/scene/sceneViewModel.ts` exposes `sceneTutorPanel` with the empty-state copy and task entry titles.
- `miniprogram/pages/scene/scene.ts` maps Scene Tutor entry taps to `activeMode: "sceneTutor"`.
- `miniprogram/pages/scene/scene.wxml` binds the Scene Tutor entry to `onEntryTap` and renders the Scene Tutor mode shell.
- `miniprogram/pages/scene/scene.wxss` styles the Scene Tutor mode shell.

Runtime notes:
- Scene Tutor mode uses the same topbar back behavior as the existing learning modes.
- The mode shell only exposes task entry titles and an empty state; Ask AI and Make Sentences task panels are handled by later steps.
- Existing practice cleanup remains scoped to Listen + Spell and Listen + Speak interruptions.

Test coverage:
- `tests/sceneTutorPage.test.ts` covers the Scene Tutor entry id, in-tab action mapping, panel model, and WXML mode shell.
- `tests/sceneInlineMode.test.ts` continues to ensure in-tab learning mode navigation does not use `wx.navigateTo`.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds `sceneTutor` as an in-page mode id and exposes Scene Tutor panel shell data. | v2 Scene Tutor / Step 4.2 |
| `miniprogram/pages/scene/scene.ts` | Routes Scene Tutor entry taps into the Learn-tab mode state. | v2 Scene Tutor / Step 4.2 |
| `miniprogram/pages/scene/scene.wxml` | Binds the Scene Tutor entry to `onEntryTap` and renders the Scene Tutor mode shell. | v2 Scene Tutor / Step 4.2 |
| `miniprogram/pages/scene/scene.wxss` | Styles the Scene Tutor mode shell. | v2 Scene Tutor / Step 4.2 |
| `tests/sceneTutorPage.test.ts` | Covers Scene Tutor mode switching and shell rendering. | v2 Scene Tutor / Step 4.2 |

## 75. v2 Scene Tutor / Step 4.3 and Step 5.1 Scene Tutor home and Ask AI input

The Scene Tutor page shell now renders a usable home view and the first Ask AI input state inside the existing Learn-tab scene page.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` exposes Scene Tutor home actions for Ask AI and Make Sentences.
- `miniprogram/pages/scene/sceneViewModel.ts` exposes Ask AI panel copy, recommended questions, input state, and submit eligibility state.
- `miniprogram/pages/scene/scene.ts` switches from the Scene Tutor home state into the Ask AI input state when the Ask AI card is tapped.
- `miniprogram/pages/scene/scene.ts` keeps Ask AI input and submit-enabled state in page data.
- `miniprogram/pages/scene/scene.ts` fills the Ask AI input when a recommended question chip is tapped.
- `miniprogram/pages/scene/scene.wxml` renders the Scene Tutor home task cards and Ask AI input panel.
- `miniprogram/pages/scene/scene.wxss` styles the Scene Tutor home cards, Ask AI textarea, recommended question chips, and disabled submit state.

Runtime notes:
- Ask AI recommended question chips only fill the input in Step 5.1; they do not submit automatically.
- Empty and whitespace-only Ask AI input disables the submit button.
- Step 5.1 does not call the cloud function yet; payload creation and `sceneTutorCloudService` integration are Step 5.2.
- Make Sentences panel controls are intentionally not rendered yet.

Test coverage:
- `tests/sceneTutorPage.test.ts` covers Scene Tutor home card structure and full-width card styling.
- `tests/sceneTutorPage.test.ts` covers Ask AI input, recommended question chip structure, submit disabled binding, and the absence of Make Sentences controls at this step.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds Scene Tutor home action data and Ask AI panel state/copy. | v2 Scene Tutor / Step 4.3 and Step 5.1 |
| `miniprogram/pages/scene/scene.ts` | Adds Scene Tutor Ask AI task switching and input state handlers. | v2 Scene Tutor / Step 5.1 |
| `miniprogram/pages/scene/scene.wxml` | Renders Scene Tutor home cards and Ask AI input panel. | v2 Scene Tutor / Step 4.3 and Step 5.1 |
| `miniprogram/pages/scene/scene.wxss` | Styles Scene Tutor home cards and Ask AI input controls. | v2 Scene Tutor / Step 4.3 and Step 5.1 |
| `tests/sceneTutorPage.test.ts` | Covers Scene Tutor home rendering and Ask AI input setup. | v2 Scene Tutor / Step 4.3 and Step 5.1 |

## 76. Memory mode hint button removal and hotspot rendering cleanup

Memory mode no longer exposes the `提示一下` hint button. The feature was removed after repeated intermittent white-block repaint artifacts in WeChat DevTools when activating hints. The current Memory assist area only keeps the scene word list toggle.

Current responsibilities:
- `miniprogram/pages/scene/scene.wxml` renders only the `单词清单` assist button in Memory mode.
- `miniprogram/pages/scene/scene.wxml` no longer binds `onShowMemoryHint` or reads hint-button state.
- `miniprogram/pages/scene/sceneViewModel.ts` no longer exposes `memoryHintWordId`, `memoryHintButtonLabel`, or `memoryHintButtonDisabled`.
- `miniprogram/pages/scene/scene.ts` no longer owns the Memory hint cycling handler or hint-button state refresh.
- `miniprogram/pages/scene/scene.wxss` no longer keeps `.memory-hint*` styles.
- `miniprogram/pages/scene/scene.wxss` keeps `.memory-hotspot--hinted` for the one-time onboarding guide highlight.
- `miniprogram/pages/scene/scene.wxml` renders the Memory scene image as a normal view background, while Listen + Spell and Listen + Speak continue to use the existing scene image markup.
- `tests/sceneMemoryHotspots.test.ts` protects the removal by asserting the hint button state, handler, and styles are absent.

Runtime notes:
- The scene word list remains available from Memory mode and the scene home view.
- Whole clickable hotspot overlays remain in place for object taps.
- Default hotspot overlays are visually transparent, with visible highlight only for onboarding and practice target states.
- Full typecheck, lint, format check, and full test suite are intentionally left for the user to run unless explicitly requested.

Test coverage:
- `tests/sceneMemoryHotspots.test.ts` covers removal of the Memory hint button and related page/view-model state.
- `tests/sceneMemoryHotspots.test.ts` covers Memory scene background rendering and hotspot transparency.
- `tests/sceneMemoryHotspots.test.ts` covers the retained whole-hotspot onboarding highlight style.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Removes Memory hint-button state and handler while keeping scene word list refresh. | Memory hint removal |
| `miniprogram/pages/scene/sceneViewModel.ts` | Removes Memory hint-button fields from the page view model. | Memory hint removal |
| `miniprogram/pages/scene/scene.wxml` | Removes the Memory hint button and renders Memory scene art as a view background. | Memory hint removal |
| `miniprogram/pages/scene/scene.wxss` | Removes `.memory-hint*` styles and keeps hotspot highlight styles for onboarding/practice states. | Memory hint removal |
| `tests/sceneMemoryHotspots.test.ts` | Covers absence of the hint button feature and current hotspot rendering structure. | Memory hint removal |

## 77. v2 Scene Tutor active-plan documentation alignment

The project documentation now treats `memory-bank/implementation-plan-v2-scene-tutor.md` as the active implementation plan. The old `memory-bank/implementation-plan.md` remains in the repository as historical v1/MVP background, but it should not drive next-step decisions unless the user explicitly asks to return to that baseline.

Current documentation responsibilities:
- `AGENTS.md` defines v2 Scene Tutor as the current development track and records the latest execution rules.
- `memory-bank/progress.md` exposes a `Current Active Track` block near the top so the next step can be found quickly.
- `memory-bank/architecture.md` exposes a current baseline note before older historical architecture prose.
- `memory-bank/tech-stack.md` keeps the native mini-program stack while adding the CloudBase-only v2 Scene Tutor backend boundary.
- `memory-bank/design-document.md` is marked as the v1/MVP baseline document.
- `memory-bank/ui-notes.md` now points to the v2 plan and includes Scene Tutor UI refinement scope.
- `memory-bank/implementation-plan.md` is marked as historical.
- `memory-bank/implementation-plan-v2-scene-tutor.md` is marked as the active plan and records the user-run full-check rule.

Runtime notes:
- Available learning scenes are `Classroom` and `Lecture Hall`.
- `Dormitory` and `Cafeteria` remain coming soon.
- v2 Scene Tutor first release remains limited to `Ask AI` and `Make Sentences`.
- Full typecheck, lint, format check, and full test suite are run by the user unless explicitly requested; focused task-specific checks remain acceptable.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `AGENTS.md` | Aligns agent instructions with v2 Scene Tutor as the current active implementation track. | v2 active-plan documentation alignment |
| `memory-bank/implementation-plan.md` | Marks the old v1/MVP plan as historical background. | v2 active-plan documentation alignment |
| `memory-bank/implementation-plan-v2-scene-tutor.md` | Marks the v2 Scene Tutor plan as active and records the user-run full-check rule. | v2 active-plan documentation alignment |
| `memory-bank/progress.md` | Adds current active track and records this documentation alignment. | v2 active-plan documentation alignment |
| `memory-bank/architecture.md` | Adds current active development baseline and this architecture record. | v2 active-plan documentation alignment |
| `memory-bank/tech-stack.md` | Adds v2 CloudBase Scene Tutor technical addendum. | v2 active-plan documentation alignment |
| `memory-bank/design-document.md` | Marks the design document as v1/MVP baseline. | v2 active-plan documentation alignment |
| `memory-bank/ui-notes.md` | Points UI work to the v2 plan and adds Scene Tutor refinement scope. | v2 active-plan documentation alignment |

## 78. v2 Scene Tutor / Step 5.2 Ask AI submit cloud call

Ask AI now has a working mini-program submission path from the in-page Scene Tutor Ask panel to the CloudBase service boundary. The page still renders only a compact answer preview; the fuller structured result card is handled by Step 5.3.

Current responsibilities:
- `miniprogram/pages/scene/scene.ts` trims Ask AI input and blocks empty, unavailable, or already-loading submissions.
- `miniprogram/pages/scene/scene.ts` builds the Ask AI payload through `buildSceneTutorRequestPayload`.
- `miniprogram/pages/scene/scene.ts` sends the payload through `requestSceneTutor` instead of calling `wx.cloud.callFunction` directly.
- `miniprogram/pages/scene/scene.ts` stores Ask AI loading, success, and error state in page data.
- `miniprogram/pages/scene/scene.ts` verifies the cloud response is an Ask AI response before storing it for display.
- `miniprogram/pages/scene/scene.wxml` renders the Ask AI loading state, retryable error state, and current compact answer preview.
- `miniprogram/pages/scene/scene.wxml` keeps the user's question in the textarea after failure so retry does not require retyping.
- `miniprogram/pages/scene/scene.wxss` styles the loading, error, retry, and answer preview states.
- `miniprogram/utils/sceneTutorCopy.ts` now includes the Ask AI retry label.
- `miniprogram/pages/scene/sceneViewModel.ts` exposes the retry label through the Scene Tutor panel model.

Runtime notes:
- The mini-program still does not store, hardcode, or transmit model API keys.
- Cloud call failures, invalid cloud results, and timeouts are normalized by `sceneTutorCloudService`.
- The retry button reuses the same submit handler, so retry behavior remains guarded by the same non-empty input and loading checks.
- Make Sentences controls remain intentionally absent at this step.
- Full typecheck, lint, format check, and full test suite are intentionally left for the user to run unless explicitly requested.

Test coverage:
- `tests/sceneTutorPromptService.test.ts` covers payload construction and secret-field exclusions.
- `tests/sceneTutorCloudService.test.ts` covers successful Ask AI / Make Sentences cloud results, rejected calls, invalid results, timeout fallback, and secret stripping.
- `tests/sceneTutorPage.test.ts` covers Ask AI submit wiring, loading state, error state, retry copy rendering, and compact result preview rendering.
- `tests/sceneTutorCopy.test.ts` covers centralized retry copy and forbidden technical wording exclusions.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Wires Ask AI submit to payload construction, cloud service request, and loading / success / error page state. | v2 Scene Tutor / Step 5.2 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds Ask AI retry copy to the Scene Tutor panel model. | v2 Scene Tutor / Step 5.2 |
| `miniprogram/pages/scene/scene.wxml` | Renders Ask AI loading, retryable error, and compact success preview states. | v2 Scene Tutor / Step 5.2 |
| `miniprogram/pages/scene/scene.wxss` | Styles Ask AI response states and retry action. | v2 Scene Tutor / Step 5.2 |
| `miniprogram/utils/sceneTutorCopy.ts` | Adds centralized Ask AI retry copy. | v2 Scene Tutor / Step 5.2 |
| `tests/sceneTutorPage.test.ts` | Covers Ask AI submit wiring and response-state rendering. | v2 Scene Tutor / Step 5.2 |
| `tests/sceneTutorCopy.test.ts` | Covers Ask AI retry copy. | v2 Scene Tutor / Step 5.2 |

## 79. v2 Scene Tutor / Step 5.3 Ask AI structured result card and CloudBase runtime fix

Ask AI now renders a structured success card after the `sceneTutor` cloud function returns a valid Ask AI response. The CloudBase project configuration and provider request path were also adjusted after deployment validation exposed WeChat DevTools and Node 16 runtime requirements.

Current responsibilities:
- `miniprogram/pages/scene/sceneViewModel.ts` defines `SceneTutorAskResultCard` and `createSceneTutorAskResultCard`.
- `miniprogram/pages/scene/sceneViewModel.ts` normalizes Ask AI related word labels and source labels for display.
- `miniprogram/pages/scene/scene.ts` stores both the raw Ask AI cloud response and the display-ready `sceneTutorAskResultCard`.
- `miniprogram/pages/scene/scene.ts` clears stale result cards when the user changes tools, edits input, retries, or hits an error state.
- `miniprogram/pages/scene/scene.wxml` renders the Ask AI result card with `Answer`, `Useful example`, `Related words`, and `Based on`.
- `miniprogram/pages/scene/scene.wxss` styles the structured result card, section labels, example text, and related/source chips.
- `project.config.json` declares `cloudfunctionRoot: "cloudfunctions/"` so WeChat DevTools recognizes the cloud function root.
- `cloudfunctions/sceneTutor/providers/llmProvider.js` uses a Node 16-compatible `node:https` request helper as the default provider request path.
- `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` logs sanitized request diagnostics on provider request exceptions without leaking `LLM_API_KEY`.

Runtime notes:
- The mini-program still never stores or transmits the provider API key; only the cloud function reads `LLM_API_KEY` from CloudBase environment variables.
- CloudBase environment variables required for real AI output are `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
- For OpenAI-compatible providers, `LLM_BASE_URL` should be the API base URL that can be safely followed by `/chat/completions`.
- The deployed CloudBase Node 16 runtime does not provide global `fetch`, so the cloud function must not rely on it for the default request path.
- Provider diagnostics record only error code, sanitized message, base URL host, and model name.
- Full typecheck, lint, format check, and full test suite are intentionally left for the user to run unless explicitly requested.

Test coverage:
- `tests/sceneTutorPage.test.ts` covers structured Ask AI result card rendering and result-card source mapping.
- `tests/cloudSceneTutorProvider.test.ts` covers the Node 16 default request path, OpenAI-compatible request shape, default model selection, provider failure normalization, and sanitized diagnostics.
- `tests/cloudSceneTutorFunction.test.ts` covers cloud function request handling around provider integration.
- `tests/cloudSceneTutorResponseParser.test.ts` covers parsing provider text into supported Scene Tutor response shapes.

File change record:
| File path | Purpose | Created / updated phase |
|---|---|---|
| `miniprogram/pages/scene/scene.ts` | Builds and stores structured Ask AI result-card data after successful cloud responses. | v2 Scene Tutor / Step 5.3 |
| `miniprogram/pages/scene/sceneViewModel.ts` | Adds `SceneTutorAskResultCard` and result-card normalization helper. | v2 Scene Tutor / Step 5.3 |
| `miniprogram/pages/scene/scene.wxml` | Renders the structured Ask AI success card. | v2 Scene Tutor / Step 5.3 |
| `miniprogram/pages/scene/scene.wxss` | Styles Ask AI result-card sections and chips. | v2 Scene Tutor / Step 5.3 |
| `cloudfunctions/sceneTutor/providers/llmProvider.js` | Replaces default global `fetch` usage with a Node 16-compatible HTTPS request helper. | CloudBase runtime fix |
| `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` | Adds sanitized provider request diagnostics. | CloudBase runtime fix |
| `project.config.json` | Declares `cloudfunctions/` as the WeChat DevTools cloud function root. | CloudBase deployment configuration |
| `tests/sceneTutorPage.test.ts` | Covers structured result-card rendering and source mapping. | v2 Scene Tutor / Step 5.3 |
| `tests/cloudSceneTutorProvider.test.ts` | Covers provider request behavior, Node 16 compatibility, and sanitized diagnostics. | CloudBase runtime fix |
