# SceneEnglish 进度记录

> 作用：记录每个实施阶段的完成情况、验证结果和遗留问题。每完成一个实施步骤或重要文档修订后，都应追加记录。

---

## 记录格式

```text
### YYYY-MM-DD｜阶段 / 步骤名称

- 完成内容：
  - ...
- 验证结果：
  - ...
- 遗留问题：
  - ...
```

---

## 当前进度

### Current Active Track - 2026-06-02

- Active plan:
  - `memory-bank/implementation-plan-v2-scene-tutor.md` is the current implementation source of truth.
  - `memory-bank/implementation-plan.md` is historical v1/MVP background and should not be used to decide the next step unless the user explicitly asks.
- Current product baseline:
  - Available learning scenes are `Classroom` and `Lecture Hall`.
  - `Dormitory` and `Cafeteria` remain coming soon.
  - Scene Tutor v2 covers available scenes and is limited to `Ask AI` and `Make Sentences` for the first release.
- Latest validated work:
  - v2 Scene Tutor Step 5.3 Ask AI structured result card with Answer, Useful example, Related words, and Based on source information.
  - CloudBase `sceneTutor` deployment path and Node 16 HTTPS provider request fix.
  - Memory mode hint button removal and hotspot rendering cleanup.
- Next planned work:
  - v2 Scene Tutor Step 6.1: Make Sentences panel input and word-selection shell.
- Verification rule:
  - Full typecheck, lint, format check, and full test suite are run by the user unless explicitly requested.
  - Codex may run focused checks that directly cover the current change.

### 2026-05-14｜GitHub 连接与提交策略记录

- 完成内容：
  - 本地仓库已连接 GitHub remote：`https://github.com/Sunnnnnyh/Scene-English.git`。
  - 当前默认分支为 `main`。
  - 已将当前文档版本推送到 GitHub。
  - 确认后续 Git 节奏：每完成一个 Step 并通过用户验证后本地 commit；每完成一个阶段或可演示节点后 push 到 GitHub。
- 验证结果：
  - 已完成远端推送，`main` 与 `origin/main` 保持一致。
- 遗留问题：
  - 后续每次提交前需要检查工作区状态，避免混入无关文件。

### 2026-05-14｜阶段 0 / Step 0.0 初始化协作文档和忽略规则

- 完成内容：
  - 完整阅读 `memory-bank/` 下所有项目文档。
  - 确认 `memory-bank/architecture.md` 已初始化并可作为后续架构记录。
  - 确认 `memory-bank/progress.md` 已初始化并可记录后续实施进度。
  - 新增 `.gitignore`，覆盖依赖、构建产物、微信小程序生成目录、日志、本地环境文件、编辑器配置和临时文件。
  - 确认项目协作说明统一使用 `AGENTS.md`，没有把旧的单数文件名作为当前协作文件引用。
- 验证结果：
  - 用户已确认 Step 0.0 验证通过。
  - 本地检查确认 `memory-bank/architecture.md`、`memory-bank/progress.md` 和 `.gitignore` 均存在。
  - `.gitignore` 已覆盖 `node_modules/`、`dist/`、`miniprogram/miniprogram_npm/`、`*.log`、`.idea/` 和 `.vscode/`。
- 遗留问题：
  - 尚未开始 Step 0.1。
  - 后续进入 Step 0.1 时，需要初始化 `miniprogram/` 微信小程序 TypeScript 工程。

### 2026-05-14｜需求澄清与实施计划补强

- 完成内容：
  - 确认小程序源码放在 `miniprogram/`，测试放在根目录 `tests/`。
  - 确认项目协作说明统一使用 `AGENTS.md`。
  - 确认开发阶段先使用基础 UI 和低保真 / 占位资源跑通功能，视觉精修后置。
  - 确认练习每组默认 5 题。
  - 确认错题按错误类型分别记录掌握进度，答对 1 次为 50%，连续答对 2 次完成该类型。
  - 更新 `memory-bank/implementation-plan.md`、`memory-bank/design-document.md`、`memory-bank/tech-stack.md`、`memory-bank/architecture.md` 和 `AGENTS.md` 的关键一致性内容。
- 验证结果：
  - 已完成文档层面的规则同步。
  - 尚未开始代码工程初始化，因此未运行代码级测试。
- 遗留问题：
  - 后续进入开发前，需要按 `implementation-plan.md` Step 0.0 创建或更新 `.gitignore`。
  - 后续创建代码文件后，需要持续更新 `memory-bank/architecture.md` 的文件变更记录。

### 2026-05-15｜阶段 0 / Step 0.1 初始化微信小程序 TypeScript 工程

- 完成内容：
  - 创建 `project.config.json`，将微信小程序工程根目录配置为 `miniprogram/`。
  - 创建 `miniprogram/` 下的最小小程序入口文件：`app.json`、`app.ts`、`app.wxss` 和 `sitemap.json`。
  - 创建首页占位页面 `miniprogram/pages/index/`，包含 `index.json`、`index.ts`、`index.wxml` 和 `index.wxss`。
  - 创建 `miniprogram/tsconfig.json` 和最小类型声明 `miniprogram/typings/index.d.ts`，为后续 TypeScript 开发预留类型检查基础。
  - 更新 `.gitignore`，忽略微信开发者工具本地私有配置 `project.private.config.json`。
- 验证结果：
  - 本地 JSON 配置解析通过。
  - 本地结构检查确认 `project.config.json` 指向 `miniprogram/`，且 `app.json` 中配置的首页文件存在。
  - 用户已使用微信开发者工具导入 `D:\SceneEnglish`，选择不使用云服务，并成功编译运行首页。
  - 首页已显示 `SceneEnglish`、`按真实场景学习英语单词`、`Step 0.1` 和 `微信小程序 TypeScript 工程已初始化`。
  - 使用调试基础库 `3.14.3` 后，控制台无红色启动错误；仅存在自动热重载、SharedArrayBuffer 和 getSystemInfo API 等工具提示级 warning。
- 遗留问题：
  - 调试基础库 `3.15.2` 在当前微信开发者工具版本中会出现疑似工具内部 `WAServiceMainContext` timeout，开发阶段暂用 `3.14.3` 保持控制台干净。
  - 当前环境缺少全局 `npm`、`npx` 和 `tsc`，因此终端 TypeScript 编译验证将在 Step 0.3 配置开发质量工具时补齐。
  - 尚未开始 Step 0.2；在用户确认前不进入基础目录结构扩展。

### 2026-05-15｜阶段 0 / Step 0.2 建立基础目录结构

- 完成内容：
  - 在 `miniprogram/` 下创建 `components`、`data`、`services`、`utils`、`types`、`assets` 等基础目录。
  - 在 `miniprogram/assets/` 下创建 `images`、`audio`、`icons` 资源目录。
  - 在根目录创建 `tests/` 目录。
  - 创建并注册后续规划页面目录和最小占位页面：`scene`、`memory`、`listening-writing`、`listening-speaking`、`favorites`、`mistakes`、`review`、`me`。
  - 更新 `miniprogram/app.json`，使所有规划页面都能被小程序路由识别。
  - 将仓库配置 `project.config.json` 中的 AppID 改回 `touristappid`，避免 GitHub secret scanning 继续把测试号 AppID 标记为 secret；测试号 AppID 仅保留在被 Git 忽略的 `project.private.config.json` 中。
- 验证结果：
  - 本地 JSON 配置解析通过。
  - 本地结构检查确认所有注册页面均存在 `.json`、`.ts`、`.wxml`、`.wxss` 四件套。
  - 本地结构检查确认基础目录、资源目录和 `tests/` 均存在。
  - 用户已在微信开发者工具中逐一访问所有页面路径，确认占位页都能打开。
  - 用户确认重新编译通过。
- 遗留问题：
  - 当前仅创建页面占位和基础目录，尚未实现真实页面内容、导航、数据、服务层或测试环境。
  - GitHub 已对历史提交中的测试号 AppID 发出 secret scanning 提示；后续需要在修复提交 push 后到 GitHub alert 页面将该提示标记为已处理。
  - 尚未开始 Step 0.3。

### 2026-05-15｜阶段 0 / Step 0.3 配置基础开发质量工具

- 完成内容：
  - 新增 `package.json` 和 `package-lock.json`，配置 `typecheck`、`lint`、`format`、`format:check`、`test` 脚本。
  - 新增 TypeScript 配置：根 `tsconfig.json`、小程序源码专用 `tsconfig.miniprogram.json`、测试和 Node 配置专用 `tsconfig.test.json`。
  - 更新 `miniprogram/tsconfig.json`，让微信开发者工具识别 `miniprogram-api-typings` 中的 `Page`、`App`、`wx` 等全局类型。
  - 新增 ESLint 配置 `eslint.config.js`。
  - 新增 Prettier 配置 `.prettierrc.json` 和 `.prettierignore`。
  - 新增 Vitest 配置 `vitest.config.ts` 和占位测试 `tests/smoke.test.ts`。
  - 新增项目本地 Node.js 工具链目录 `.tools/`，并在 `.gitignore` 中忽略 `.tools/`、`node_modules/` 等本地依赖产物。
- 验证结果：
  - 用户已在 PowerShell 中设置临时 `PATH` 指向 `.tools/node-v24.11.1-win-x64`。
  - `npm run typecheck` 通过。
  - `npm run lint` 通过。
  - `npm run format:check` 通过。
  - `npm test` 通过，Vitest 显示 `1 passed`。
  - 微信开发者工具重新加载后，页面 TypeScript 文件中的 `Page` 红线消失；编译后无红色启动错误。
- 遗留问题：
  - 当前使用项目本地 `.tools/` 中的 Node.js，不依赖系统全局 npm；后续运行 npm 脚本前需要先把该目录临时加入当前 PowerShell 的 `PATH`。
  - 当前仅有占位 smoke test；后续进入服务层和工具函数开发后，需要补充真实单元测试。
  - 尚未开始阶段 1。

### 2026-05-15 — 阶段 1 / Step 1.1 定义核心 TypeScript 类型

- 完成内容：
  - 新增 `miniprogram/types/index.ts`，作为小程序源码的集中类型出口。
  - 定义场景、单词、学习进度、收藏、错题、练习题、练习轮次、答题结果、语音识别结果、本地存储包装和新手引导状态等核心业务类型。
  - 覆盖 `expressionEn`、`expressionCn`、热区坐标、场景状态、`sceneenglish:` 本地缓存 key 结构，以及 `click` / `spelling` / `speaking` 错题类型。
  - 将错题掌握进度建模为 `0 | 50 | 100`，对应答对 1 次为 50%、连续答对 2 次完成该弱项类型的产品规则。
  - 删除 `miniprogram/types/.gitkeep`，因为 `types/` 目录已经有真实源码文件。
- 验证结果：
  - 用户已人工确认类型文件中包含预期的 `Mistake` 结构。
  - 用户运行 `npm run typecheck`，通过。
  - 用户运行 `npm run lint`，通过。
  - 用户运行 `npm run format:check`，通过，并显示所有匹配文件符合 Prettier 格式。
  - 用户运行 `npm test`，Vitest 显示 `1 passed`。
- 遗留问题：
  - 尚未开始 Step 1.2。
  - Step 0.3 本地提交曾因 GitHub 网络连接重置未能立即 push，后续已在 Step 1.1 提交时一并推送成功。

### 2026-05-15 — 阶段 1 / Step 1.2 创建场景数据

- 完成内容：
  - 新增 `miniprogram/data/scenes.ts`，包含 4 个 MVP 场景记录。
  - 将 `classroom` / `Classroom` 标记为唯一可进入场景，`wordCount` 为 `20`。
  - 将 `lecture-hall`、`dormitory`、`cafeteria` 标记为 `comingSoon`，`wordCount` 为 `0`。
  - 导出 `scenes`、`availableScenes` 和 `comingSoonScenes`，供后续页面和 service 层复用。
  - 新增 `tests/scenes.test.ts`，验证全部场景可读取，并且只有 Classroom 为可进入状态。
  - 删除 `miniprogram/data/.gitkeep`，因为 `data/` 目录已经有真实数据源码文件。
- 验证结果：
  - 用户已人工确认场景数据结构和状态规则。
  - 用户运行 `npm test`，Vitest 显示 2 个测试文件通过、4 个测试用例通过。
  - 本地也已验证 `npm run typecheck`、`npm run lint`、`npm run format:check` 和 `npm test` 均通过。
- 遗留问题：
  - 尚未开始 Step 1.3。
  - 场景图片路径目前指向后续计划中的占位资源，实际图片文件将在后续资源准备步骤中处理。

### 2026-05-15 — 阶段 1 / Step 1.3 创建教室单词数据

- 完成内容：
  - 在 `miniprogram/data/scenes.ts` 中新增 `classroomWords`，包含 20 个 Classroom 单词。
  - 每个单词均包含中文、英文、美式音标、英文例句、中文翻译、实用表达、实用表达中文翻译、音频路径和临时热区坐标。
  - 词表覆盖 `blackboard`、`whiteboard`、`projector`、`podium`、`desk`、`chair`、`backpack`、`textbook`、`notebook`、`pencil`、`pen`、`eraser`、`chalk`、`ruler`、`window`、`curtain`、`door`、`clock`、`socket`、`trash-can`。
  - 更新 `tests/scenes.test.ts`，验证教室词表数量、id 唯一性、所属场景、必填字段、音频路径、热区坐标和 Classroom `wordCount` 对齐。
- 验证结果：
  - 新增测试先在 `classroomWords` 尚不存在时失败，随后补充数据后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 2 个测试文件、6 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 热区坐标为临时合理值，后续需要在正式或占位场景图确定后重新校准。
  - 音频路径已与数据文件保持一致，但实际音频资源将在 Step 1.4 准备。
  - 尚未开始 Step 1.4。

### 2026-05-15 — 阶段 1 / Step 1.4 准备占位图片和音频资源

- 完成内容：
  - 新增 `miniprogram/assets/images/classroom-cover.png` 和 `miniprogram/assets/images/classroom.png` 作为低保真教室占位图。
  - 新增 20 个 `miniprogram/assets/audio/*.mp3` 占位音频文件，文件名与 `classroomWords` 中的 `audioUrl` 保持一致。
  - 新增 `miniprogram/assets/audio/README.md`，说明当前音频为临时静音占位资源，后续用户测试前需要替换为真实发音。
  - 新增 `tests/assets.test.ts`，验证 Classroom 图片资源存在、PNG 文件头正确，以及 20 个单词音频资源存在且非空。
  - 更新 `tsconfig.test.json`，将测试配置的 `moduleResolution` 调整为 `Node` 并启用 `skipLibCheck`，避免微信开发者工具内置 TypeScript 服务误报测试配置和 `vitest` 模块解析问题。
- 验证结果：
  - 新增资源测试先在图片和音频不存在时失败，随后补充资源后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 3 个测试文件、8 个测试用例通过。
  - 用户已在微信开发者工具中重新编译并确认通过。
- 遗留问题：
  - 当前图片为低保真占位图，后续视觉精修阶段需要替换为正式教室插画并重新校准热区。
  - 当前音频为静音占位 mp3，后续用户测试前需要替换为真实单词发音。
  - 本地 `main` 分支仍有提交未能推送到 GitHub，原因是当前环境连接 `github.com:443` 超时；网络恢复后需要执行 `git push origin main`。
  - 尚未开始 Step 2.1。

### 2026-05-15 — 阶段 2 / Step 2.1 实现本地缓存工具

- 完成内容：
  - 新增 `miniprogram/utils/storage.ts`，封装小程序本地缓存读写。
  - 实现 `getStorageKey`，统一生成 `sceneenglish:` 前缀的缓存 key。
  - 实现 `createLocalStore`，为数据写入添加 `version`、`updatedAt` 和 `data` 包装。
  - 实现 `readStorage`、`writeStorage` 和 `removeStorage`，支持默认值、读取失败兜底、异常兜底和可注入 storage adapter。
  - 新增 `tests/storage.test.ts`，覆盖 key 前缀、元数据包装、空数据默认值、写入后读取、坏数据兜底、wx storage 异常兜底和删除数据。
  - 删除 `miniprogram/utils/.gitkeep`，因为 `utils/` 目录已经包含真实工具模块。
- 验证结果：
  - 新增测试先在 `miniprogram/utils/storage.ts` 不存在时失败，随后实现工具后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 4 个测试文件、15 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成 storage 工具层，尚未接入 progress、favorite、mistake 等 service。
  - 尚未开始 Step 2.2。

### 2026-05-15 — 阶段 2 / Step 2.2 实现字符串标准化工具

- 完成内容：
  - 新增 `miniprogram/utils/normalize.ts`，实现拼写判断用的标准化工具。
  - 实现 `normalizeSpelling`，只做首尾空格去除和小写转换。
  - 实现 `isNormalizedSpellingMatch`，用于比较标准化后的用户输入和目标单词。
  - 新增 `tests/normalize.test.ts`，覆盖大小写忽略、首尾空格忽略、不同拼写不匹配，以及 MVP 阶段不折叠单词内部空格的规则。
- 验证结果：
  - 新增测试先在 `miniprogram/utils/normalize.ts` 不存在时失败，随后实现工具后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 5 个测试文件、21 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成纯标准化工具，尚未接入 Listen + Spell 页面或 quiz service。
  - 尚未开始 Step 2.3。

### 2026-05-16 — 阶段 2 / Step 2.3 实现热区计算工具

- 完成内容：
  - 新增 `miniprogram/utils/hotspot.ts`，实现热区坐标和点击判断相关工具函数。
  - 实现 `convertHotspotToPercent`，将原始画布坐标转换为百分比定位值。
  - 实现 `createHotspotStyle`，生成透明热区 `view` 可直接使用的内联样式字符串。
  - 实现 `isPointInHotspot`，判断指定点是否落在热区范围内，并将边界视为可点击。
  - 新增 `tests/hotspot.test.ts`，覆盖百分比转换、缩放比例一致性、样式字符串生成、热区内点击、边界点击和热区外点击。
- 验证结果：
  - 新增测试先在 `miniprogram/utils/hotspot.ts` 不存在时失败，随后实现工具后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 6 个测试文件、27 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成热区计算工具，尚未接入场景页面或记忆模式页面。
  - 热区坐标仍依赖 Step 1.3 的临时数据，后续正式视觉资源确定后需要重新校准。
  - 尚未开始 Step 2.4。

### 2026-05-16 — 阶段 2 / Step 2.4 实现场景服务

- 完成内容：
  - 新增 `miniprogram/services/sceneService.ts`，封装场景数据读取能力。
  - 实现 `getScenes`，返回全部 MVP 场景并保持展示顺序。
  - 实现 `getAvailableScenes`，返回可学习场景，目前只有 Classroom。
  - 实现 `getComingSoonScenes`，返回 Lecture Hall、Dormitory、Cafeteria 三个 Coming soon 场景。
  - 实现 `getSceneById`，支持按 scene id 查询场景详情，未知 id 返回 `undefined`。
  - 新增 `tests/sceneService.test.ts`，覆盖全部场景、可学习场景、Coming soon 场景、按 id 查询和未知 id 兜底。
- 验证结果：
  - 新增测试先在 `miniprogram/services/sceneService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 6 个测试文件、36 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成场景 service，尚未接入场景选择页。
  - 尚未开始 Step 2.5。

### 2026-05-16 — 阶段 2 / Step 2.5 实现单词服务

- 完成内容：
  - 新增 `miniprogram/services/wordService.ts`，封装 Classroom 单词数据读取能力。
  - 实现 `getWordsBySceneId`，支持按场景 id 获取单词列表；未知场景返回空数组。
  - 实现 `getWordById`，支持按 word id 获取单词详情；未知单词返回 `undefined`。
  - 新增 `tests/wordService.test.ts`，覆盖 Classroom 20 个单词、`projector` 完整学习字段、按 id 查询和未知输入兜底。
- 验证结果：
  - 新增测试先在 `miniprogram/services/wordService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 7 个测试文件、41 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成单词 service，尚未接入单词卡、记忆模式或练习页面。
  - 尚未开始 Step 2.6。

### 2026-05-16 — 阶段 2 / Step 2.6 实现收藏服务

- 完成内容：
  - 新增 `miniprogram/services/favoriteService.ts`，封装收藏数据的读取、添加、取消和状态查询。
  - 实现 `getFavorites`，从本地缓存读取收藏列表，空数据时返回空数组。
  - 实现 `addFavorite`，添加收藏并立即写入 `sceneenglish:favorites` 本地缓存。
  - 实现 `removeFavorite`，取消收藏并立即同步本地缓存。
  - 实现 `isFavorite`，按 word id 查询收藏状态。
  - 新增 `tests/favoriteService.test.ts`，覆盖空列表、添加收藏、立即写入缓存、重复收藏去重、收藏状态查询和取消收藏同步。
- 验证结果：
  - 新增测试先在 `miniprogram/services/favoriteService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 8 个测试文件、46 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成收藏 service，尚未接入单词卡或收藏夹页面。
  - 尚未开始 Step 2.7。

### 2026-05-16 — 阶段 2 / Step 2.7 实现学习进度服务

- 完成内容：
  - 新增 `miniprogram/services/progressService.ts`，封装场景学习进度读取和写入能力。
  - 实现 `getSceneProgress`，支持按场景 id 获取学习进度，空数据时返回默认进度。
  - 实现 `recordLearnedWord`，进入单词卡时可记录 learned word，并避免同一单词重复计数。
  - 实现 `recordModeCompletion`，支持记录 Memory、Listen + Spell、Listen + Speak 三类模式完成次数。
  - 新增 `tests/progressService.test.ts`，覆盖初始进度、记录已学单词、重复 learned 去重、三种完成次数累加和多场景进度隔离。
- 验证结果：
  - 新增测试先在 `miniprogram/services/progressService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 9 个测试文件、51 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成学习进度 service，尚未接入单词卡、记忆模式或场景学习首页。
  - 尚未开始 Step 2.8。

### 2026-05-16 — 阶段 2 / Step 2.8 实现错题服务

- 完成内容：
  - 新增 `miniprogram/services/mistakeService.ts`，封装错题列表读取、错误记录、答对后掌握进度更新和手动移出能力。
  - 实现 `getMistakes`，从本地缓存读取错题列表，空数据时返回空数组。
  - 实现 `recordMistake`，支持记录 `click`、`spelling`、`speaking` 三类错误，并按单词和错误类型累计错误次数。
  - 实现 `recordMistakeCorrectAnswer`，支持同一错误类型答对 1 次后进度为 50%，连续答对 2 次后移除该弱项。
  - 实现 `removeMistake`，支持手动移出整个错题单词。
  - 新增 `tests/mistakeService.test.ts`，覆盖空列表、记录错误、重复错误计数、不同错误类型并存、掌握进度更新、弱项自动移除、单词自动移出和手动移出。
- 验证结果：
  - 新增测试先在 `miniprogram/services/mistakeService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 10 个测试文件、59 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成错题 service，尚未接入听写、口语、错题夹或错题专项练习页面。
  - 尚未开始 Step 2.9。

### 2026-05-16 — 阶段 2 / Step 2.9 实现抽题服务

- 完成内容：
  - 新增 `miniprogram/services/quizService.ts`，封装普通练习和错题专项练习的抽题逻辑。
  - 实现 `DEFAULT_QUIZ_QUESTION_COUNT`，将默认题量统一为 5 题。
  - 实现 `createPracticeQuizRound`，普通练习优先从已学词中抽题，已学词不足时从未学词补足；词量不足 5 个时按实际数量生成。
  - 实现 `createMistakePracticeQuizRound`，错题专项练习按低掌握进度、高错误次数、最近错误时间和词表顺序生成题目。
  - 支持按单一错误类型生成错题专项练习题目，例如只练 `click`、`spelling` 或 `speaking`。
  - 新增 `tests/quizService.test.ts`，覆盖普通练习优先级、未学词补足、一轮内去重、少量词兜底、错题弱项优先和指定错误类型抽题。
- 验证结果：
  - 新增测试先在 `miniprogram/services/quizService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 11 个测试文件、65 个测试用例通过。
  - 用户已运行验证并确认通过。
- 遗留问题：
  - 当前只完成抽题 service，尚未接入听写、口语或错题专项练习页面。
  - 尚未开始 Step 2.10。

### 2026-05-16 — 阶段 2 / Step 2.10 实现音频服务

- 完成内容：
  - 新增 `miniprogram/services/audioService.ts`，封装单词音频播放、停止、重播和释放能力。
  - 实现 `createAudioService`，支持注入音频上下文工厂，便于 Vitest 使用 fake audio context，也保留微信小程序运行时默认 `wx.createInnerAudioContext`。
  - 实现默认导出的 `audioService`，供后续单词卡、收藏夹、听写和口语页面统一播放单词音频。
  - 播放新音频前会停止并释放当前音频上下文，避免多音频重叠。
  - 播放失败支持通过 `onError` 回调传给页面，由页面展示轻提示。
  - 新增 `tests/audioService.test.ts`，覆盖播放、切换音频、重播、播放错误回调、同步播放异常和页面离开时释放音频上下文。
- 验证结果：
  - 新增测试先在 `miniprogram/services/audioService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 12 个测试文件、71 个测试用例通过。
  - 用户已确认 Step 2.10 验证通过。
- 遗留问题：
  - 当前只完成音频 service，尚未接入单词卡、收藏夹、听写或口语页面。
  - 当前音频资源仍为静音占位 mp3，后续用户测试前需要替换为真实单词发音。
  - 尚未开始 Step 2.11。

### 2026-05-16 — 阶段 2 / Step 2.11 实现口语识别服务 mock

- 完成内容：
  - 新增 `miniprogram/services/speechService.ts`，封装 MVP 阶段的 mock 口语识别接口。
  - 实现 `createSpeechService`，支持创建可配置默认识别场景的口语识别服务实例。
  - 实现默认导出的 `speechService`，供后续 Listen + Speak 页面调用。
  - 支持 `success`、`failure`、`empty` 三种 mock 识别场景，便于开发阶段稳定演示成功、失败和空结果流程。
  - 支持调用时传入指定 `transcript`，用于模拟目标词匹配或识别为其他词的结果。
  - 识别结果统一返回 `SpeechResult`，`provider` 固定为 `mock`，匹配判断复用拼写标准化工具以忽略大小写和首尾空格。
  - 新增 `tests/speechService.test.ts`，覆盖目标词匹配通过、空结果失败、识别为其他词失败、固定成功 / 失败场景和默认服务实例。
- 验证结果：
  - 新增测试先在 `miniprogram/services/speechService.ts` 不存在时失败，随后实现服务后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 13 个测试文件、77 个测试用例通过。
  - 用户已确认 Step 2.11 验证通过。
- 遗留问题：
  - 当前只完成 mock ASR service，尚未接入 Listen + Speak 页面、录音流程或 Me 页面状态说明。
  - 阶段 2 的工具函数与服务层已完成，下一步进入阶段 3 基础页面与导航。

### 2026-05-16 — 阶段 3 / Step 3.1 实现场景选择页

- 完成内容：
  - 将首页从 Step 0.1 占位状态改为真实场景选择页。
  - 首页通过 `sceneService` 读取场景数据，并展示 SceneEnglish 标识、页面标题、Classroom 主场景卡和 3 个 Coming soon 场景卡。
  - 新增 `miniprogram/pages/index/indexViewModel.ts`，将首页展示数据和点击行为整理为可测试的 view model。
  - Classroom 场景卡点击后跳转到 `/pages/scene/scene?sceneId=classroom`。
  - Lecture Hall、Dormitory、Cafeteria 点击后只显示 `Coming soon` 轻提示，不发生页面跳转。
  - 新增 `tests/indexViewModel.test.ts`，覆盖首页场景卡生成、Classroom 可跳转和 Coming soon 不可进入规则。
- 验证结果：
  - 新增测试先在 `miniprogram/pages/index/indexViewModel.ts` 不存在时失败，随后实现 view model 和页面接入后通过。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 通过，显示 14 个测试文件、79 个测试用例通过。
  - 用户已在微信开发者工具中重新编译首页，确认首页显示 Classroom 和 3 个 Coming soon 卡片。
  - 用户已确认点击 Classroom 可进入场景学习首页占位页。
  - 用户已确认点击 Coming soon 场景只显示提示且不跳转。
- 遗留问题：
  - 当前场景学习首页仍为占位页，尚未展示 Classroom 名称、场景预览、已学习进度和模式入口。
  - 尚未实现底部导航和基础页面间返回规则。
  - 尚未开始 Step 3.2。

### 2026-05-17 — 阶段 3 / Step 3.2 实现场景学习首页

- 完成内容：
  - 将 `miniprogram/pages/scene/` 从占位页改为 Classroom 场景学习首页。
  - 页面通过 `sceneService` 获取场景详情，通过 `progressService` 获取 `Learned x / 20` 学习进度。
  - 新增 `miniprogram/pages/scene/sceneViewModel.ts`，封装场景首页展示数据、学习模式入口和入口跳转规则。
  - 场景首页展示 Classroom 标题、场景预览图、学习进度条和三个学习模式入口：单词记忆、听力 + 默写、听力 + 口语。
  - 单词记忆入口保留推荐视觉状态，但三种学习模式卡片尺寸保持一致。
  - 根据用户验证反馈，移除场景首页中的收藏夹和错题夹入口；收藏夹和错题夹作为跨场景复习资产，后续应放到首页、Review 或 Me 等全局入口中处理。
  - 新增 `tests/sceneViewModel.test.ts`，覆盖场景首页 view model、学习进度计算、三个学习模式入口路由，并验证场景页不再包含收藏夹 / 错题夹入口。
- 验证结果：
  - 新增测试先在 `miniprogram/pages/scene/sceneViewModel.ts` 不存在时失败，随后实现 view model 和页面接入后通过。
  - 根据用户反馈完成两轮 UI 调整：移除收藏夹 / 错题夹后重新平衡学习模式区域；随后统一三个学习模式卡片尺寸。
  - 本地已验证 TypeScript 小程序配置检查通过。
  - 本地已验证 TypeScript 测试配置检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 项目脚本范围检查通过。
  - 本地已验证 Vitest 目标测试通过，`tests/sceneViewModel.test.ts` 显示 3 个测试用例通过。
  - 用户已在微信开发者工具中验证功能通过，并确认当前学习模式卡片尺寸问题已修复。
- 遗留问题：
  - 收藏夹和错题夹入口位置需要在后续全局导航、Review 或 Me 页面步骤中重新确定。
  - 当前场景首页仍使用低保真占位场景图；后续视觉精修阶段需要替换正式插画并重新校准热区。
  - 尚未开始 Step 3.3。

### 2026-05-17 — 阶段 3 / Step 3.3 实现页面间返回和基础导航

- 完成内容：
  - 在 `miniprogram/app.json` 中新增 Home / Learn / Review / Me 底部导航。
  - 明确 Home 与 Learn 的信息架构边界：Home 用于选择学习场景；Learn 是当前学习场景的学习首页。MVP 阶段只有 Classroom，因此直接点击 Learn 时默认进入 Classroom 学习首页。
  - 将首页 Classroom 场景卡行为调整为切换到 Learn tab，避免对 tabBar 页面使用 `navigateTo`。
  - 为单词记忆、听力 + 默写、听力 + 口语三个学习占位页补充返回 Classroom 的入口。
  - 在 Review 页预留收藏夹和错题夹两个全局复习入口，不再从具体场景学习首页进入。
  - 将 Me 页从占位页调整为轻量个人页，展示昵称占位、已学单词数、收藏数、错题数和 `Mock ASR enabled` 状态。
  - 修复微信开发者工具中 Review 页运行时报 `reviewViewModel.js is not defined` 的问题：页面运行时不再依赖新建 helper 模块，避免小程序 require 找不到未编译的辅助模块。
  - 新增底部导航、学习占位页返回、Review 入口和 Me 页统计相关 Vitest 测试。
- 验证结果：
  - 新增测试先在 tabBar、学习页返回入口、Review view model 和 Me view model 不存在或行为不匹配时失败，随后实现后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 19 个测试文件、88 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 3.3 通过。
- 遗留问题：
  - 当前 Learn tab 在 MVP 阶段固定展示 Classroom；后续多场景开放后，可升级为读取最近学习场景或提示用户从 Home 选择场景。
  - 收藏夹和错题夹页面仍为占位页，后续将在阶段 5 和阶段 7 分别实现真实列表能力。
  - 三个学习模式页面仍为占位页，尚未进入记忆模式、听写或口语练习真实流程。
  - 尚未开始 Step 4.1。

### 2026-05-17 — Learn 页底部导航适配修复

- 完成内容：
  - 根据用户反馈修复 Learn tab 中底部导航遮挡“听力 + 口语”入口的问题。
  - 调整 `miniprogram/pages/scene/scene.wxss`：保留当前 Learn 页尽量一屏展示的布局目标，同时将页面容器改为 `overflow-y: auto`，允许小屏或特殊机型轻微滚动。
  - 保留用户确认的尺寸调整：场景图高度为 `380rpx`，三个学习模式卡片最小高度为 `142rpx`。
  - 新增 `tests/sceneLayout.test.ts`，约束 Learn 页外层容器允许纵向滚动、保留底部安全区，并防止后续误改回锁死滚动。
- 验证结果：
  - `tests/sceneLayout.test.ts` 目标测试通过。
  - `npm run format:check` 通过。
  - 用户已在微信开发者工具中验证通过。
- 遗留问题：
  - 该调整只处理 Learn 页在底部 tabBar 下的布局适配；后续阶段 9.4 仍需要在更多机型和真机上做完整移动端视觉适配。

### 2026-05-17 — 阶段 4 / Step 4.1 实现场景图展示

- 完成内容：
  - 将 `miniprogram/pages/memory/` 从学习模式占位页调整为单词记忆模式的场景图展示页。
  - 页面读取 Classroom 场景数据，展示 `教室 Classroom`、`单词记忆`、说明文案和 Classroom 场景图。
  - 使用稳定的 16:9 场景图容器和 `aspectFit` 图片模式，避免当前占位图在常见手机宽度下变形。
  - 保留底部 `返回 Classroom` 主按钮，移除右上角重复返回按钮。
  - 新增 `miniprogram/pages/memory/memoryViewModel.ts`，仅供 Vitest 约束 Step 4.1 的页面展示模型；小程序运行时 `memory.ts` 不依赖该 helper，避免微信开发者工具运行时报 `memoryViewModel.js is not defined`。
  - 新增 `tests/memoryLayout.test.ts`、`tests/memoryRuntime.test.ts` 和 `tests/memoryViewModel.test.ts`，覆盖场景图布局、运行时依赖边界和页面展示模型。
- 验证结果：
  - 新增测试先在页面仍为占位结构、`memoryViewModel` 不存在、以及 `memory.ts` 依赖新增 helper 时失败，随后实现和运行时修复后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 23 个测试文件、93 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 4.1 通过。
- 遗留问题：
  - 当前只展示场景图，尚未实现透明热区覆盖、点击识别、单词卡、首次引导、音频播放、收藏或已学记录。
  - 当前仍使用低保真占位场景图；后续替换正式图片后，需要重新校准热区和必要的局部布局。
  - 尚未开始 Step 4.2。

### 2026-05-17 — Learn tab 学习模式内联切换体验修复

- 完成内容：
  - 根据用户反馈修复点击学习模式卡片时底部 tabBar 先消失、再进入普通页面造成的交互不顺畅问题。
  - 将 `miniprogram/pages/scene/scene.ts` 中的学习模式入口行为从 `wx.navigateTo` 改为当前 Learn tab 内部状态切换。
  - 点击单词记忆、听力 + 默写、听力 + 口语后，当前页面设置 `activeMode` 并展示对应模式的基础视图，底部 Home / Learn / Review / Me tabBar 保持可见。
  - 新增页面内 `返回 Classroom` 按钮，用于从当前模式视图切回 Classroom 学习首页。
  - 暂时保留 `pages/memory`、`pages/listening-writing` 和 `pages/listening-speaking` 三个独立页面文件，不在本次最小修复中删除或大范围重构。
  - 新增 `tests/sceneInlineMode.test.ts`，约束 Learn tab 学习模式入口不再使用 `wx.navigateTo`。
- 验证结果：
  - 新增测试先在 `scene.ts` 仍使用 `wx.navigateTo`、`sceneViewModel` 仍返回 `navigate` 动作时失败，随后改为 tab 内 `selectMode` 行为后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 24 个测试文件、94 个测试用例通过。
  - 用户已在微信开发者工具中验证该体验修复通过。
- 遗留问题：
  - 当前三种模式的 tab 内视图仍是基础占位状态；后续 Step 4.2 起会优先在 Learn tab 内继续补真实 Memory Mode 交互。
  - 独立学习模式页面后续可按实际架构需要逐步清理或复用，但本次最小修复不处理。
  - 尚未开始 Step 4.2。

### 2026-05-17 — 阶段 4 / Step 4.2 实现透明热区覆盖

- 完成内容：
  - 将 Memory Mode 的透明热区接入 Learn tab 内联单词记忆视图，保持底部 Home / Learn / Review / Me tabBar 可见。
  - 在 `miniprogram/pages/scene/sceneViewModel.ts` 中根据 Classroom 场景尺寸和 20 个单词热区坐标生成百分比定位的 `memoryHotspots`。
  - 在 `miniprogram/pages/scene/scene.wxml` 中为 Memory 模式场景图覆盖透明 `view` 热区，并使用 `catchtap` 防止热区点击冒泡成空白点击。
  - 在 `miniprogram/pages/scene/scene.ts` 中新增热区点击和空白点击处理：点击热区显示识别到的英文单词，点击空白区域只给轻提示。
  - 在 `miniprogram/pages/scene/scene.wxss` 中为透明热区补充绝对定位和按下态调试反馈样式。
  - 新增 `tests/sceneMemoryHotspots.test.ts`，约束 Classroom 20 个热区数据、百分比样式、热区绑定和空白点击绑定。
- 验证结果：
  - 新增测试先在 `memoryHotspots` 和 Memory 模式热区覆盖层不存在时失败，随后实现后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 25 个测试文件、96 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 4.2 通过。
- 遗留问题：
  - 当前热区坐标仍基于低保真占位图，后续替换正式教室图片后需要重新校准 20 个物品热区。
  - 当前点击热区只显示识别结果，尚未弹出完整单词卡。
  - 尚未开始 Step 4.3。

### 2026-05-17 — 阶段 4 / Step 4.3 实现首次轻引导

- 完成内容：
  - 新增 `miniprogram/services/onboardingService.ts`，通过 `sceneenglish:onboarding` 本地缓存记录 Memory Mode 首次引导完成状态。
  - 在 Learn tab 内联 Memory 视图中接入首次轻引导：首次进入单词记忆模式时显示提示，并高亮 `projector` 热区。
  - 用户点击任意热区或点击“我知道了”后，会写入 `memoryGuideCompleted: true`，后续再次进入单词记忆模式不再重复展示。
  - 在 `miniprogram/pages/scene/sceneViewModel.ts` 中补充 Memory 引导默认展示字段和 `projector` 引导目标。
  - 在 `miniprogram/pages/scene/scene.wxml` 和 `scene.wxss` 中补充引导浮层、关闭按钮和引导热区高亮样式。
  - 新增 `tests/onboardingService.test.ts` 和 `tests/sceneMemoryGuide.test.ts`，覆盖引导缓存状态、首次展示规则、引导 UI 绑定和完成状态写入入口。
- 验证结果：
  - 新增测试先在 `onboardingService` 不存在、页面无引导字段和 WXML 无引导层时失败，随后实现后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 27 个测试文件、101 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 4.3 通过。
- 遗留问题：
  - 当前点击热区后仍只显示识别结果，完整单词卡尚未接入。
  - Step 4.3 的引导点击完成后暂不弹出完整单词卡；单词卡将在 Step 4.4 实现。
  - 尚未开始 Step 4.4。

### 2026-05-18 — 阶段 4 / Step 4.4 实现单词卡

- 完成内容：
  - 在 Learn tab 内联 Memory 视图中接入单词卡，点击热区后展示对应单词的英文、中文、美式音标和 1 条 Useful expression。
  - 根据用户验证反馈调整 Step 4.4 范围：Memory 单词卡不再展示例句区块，只保留 Useful expression，避免内容重复和阅读负担。
  - Useful expression 默认只展示英文，点击英文句子后展开或收起中文翻译。
  - 新增表达翻译一次性轻引导状态 `memoryTranslationGuideCompleted`，首次打开支持翻译展开的单词卡时提示“点英文句子可以展开中文”，使用后写入 `sceneenglish:onboarding`。
  - 将 20 个 Classroom 单词的 Useful expression 调整为更自然、稍复杂且不全是问句的课堂/校园表达。
  - 将单词卡关闭入口调整为右上角小圆形叉号。
  - 删除 Memory 视图中用于占位的“已打开 xxx / 已识别 xxx”提示块，并清理对应的 `selectedMemoryWordLabel` 页面状态。
  - 将单词卡从底部固定浮层调整为场景图下方的页面流卡片，展开中文时上边界保持稳定、下边界向下延伸。
  - 新增 `tests/sceneMemoryWordCard.test.ts`，约束单词卡字段、WXML 结构、翻译展开绑定、关闭按钮、占位提示移除和页面流展开样式。
- 验证结果：
  - 新增测试先在“已打开”占位仍存在、单词卡仍为底部 fixed 浮层时失败，随后实现调整后通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm test` 通过，显示 28 个测试文件、109 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 4.4 通过。
- 遗留问题：
  - 当前单词卡尚未接入音频播放、收藏状态和已学记录；后续 Step 4.5 和 Step 4.6 继续实现。
  - 当前热区坐标仍基于低保真占位图，后续替换正式教室图片后需要重新校准 20 个物品热区。
  - 尚未开始 Step 4.5。

### 2026-05-18 — 阶段 4 / Step 4.5 实现单词卡音频播放

- 完成内容：
  - 在 Learn tab 内联 Memory 单词卡的音标旁新增圆形播放按钮。
  - `SceneMemoryWordCard` 新增 `audioUrl`，由 `createMemoryWordCard(word)` 从单词数据中带出。
  - 点击播放按钮时，页面使用 `wx.createInnerAudioContext()` 播放当前单词音频路径。
  - 播放新单词前会释放旧音频上下文；关闭单词卡、返回 Classroom、页面隐藏和页面卸载时会停止或释放当前音频。
  - 播放失败时显示轻提示“音频暂时无法播放”，不阻塞用户继续查看单词卡。
  - 根据微信开发者工具运行时报错，移除了 scene 页面对 `../../services/audioService` 的运行时 import，改为在 `scene.ts` 内部管理当前音频上下文，避免页面脚本因 helper module 缺失而中断注册。
  - 补充 `tests/sceneMemoryWordCard.test.ts`，约束音频按钮、`audioUrl` 展示状态、播放方法、停止/释放方法和运行时依赖边界。
- 验证结果：
  - 本地已验证 `npm test -- tests/sceneMemoryWordCard.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm test` 通过，显示 28 个测试文件、109 个测试用例通过。
  - 用户已在微信开发者工具中验证：页面不再报 `services/audioService` 模块缺失错误，音频按钮交互通过。
- 遗留问题：
  - 当前 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频，因此点击播放按钮没有可听声音是预期现象；后续用户测试前需要替换为真实单词发音文件。
  - Step 4.5 不接入收藏状态和已学记录；收藏、已学进度将在 Step 4.6 继续实现。

### 2026-05-18 — 阶段 4 / Step 4.6 实现单词卡收藏和已学记录

- 完成内容：
  - 在 Learn tab 内联 Memory 单词卡中新增小星标收藏按钮，支持收藏和取消收藏当前单词。
  - `SceneMemoryWordCard` 新增 `isFavorite` 展示状态，打开单词卡时会从 `favoriteService` 读取当前单词是否已收藏。
  - 点击星标时通过已有 `addFavorite` / `removeFavorite` 写入 `sceneenglish:favorites` 本地缓存，并即时更新卡片显示状态。
  - 点击 Memory 热区打开单词卡时，通过已有 `recordLearnedWord` 将该词记录为已学；重复打开同一个词不会重复增加已学数量。
  - 打开单词卡后即时刷新 Learn tab 场景首页进度字段，使返回 Classroom 时可看到最新 `Learned x / 20` 和进度条。
  - 补充 `tests/sceneMemoryWordCard.test.ts`，约束收藏状态、收藏按钮绑定、已学记录调用、进度刷新和收藏样式。
- 验证结果：
  - 本地已验证 `npm test -- tests/sceneMemoryWordCard.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm test` 通过，显示 28 个测试文件、109 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 4.6 通过。
- 遗留问题：
  - 收藏夹列表页面仍为占位页；当前仅完成单词卡层面的收藏写入和状态显示，后续阶段 5 再实现收藏夹真实列表。
  - 当前热区坐标仍基于低保真占位图，后续替换正式教室图片后需要重新校准 20 个物品热区。

### 2026-05-20 — 阶段 5 / Step 5.1 实现收藏夹列表

- 完成内容：
  - 将 Favorites 页面从占位页调整为真实收藏列表，页面从 `favoriteService` 读取本地收藏记录。
  - 每个收藏项展示英文、中文和所属场景，空列表时展示基础空状态。
  - 收藏项支持点击展开单词详情，展示音标和 1 条 Useful expression；不展示 Example / 例句区块。
  - 多个收藏卡片可以同时保持展开，再次点击同一收藏项会收起该项。
  - 新增 `favoritesViewModel` 作为测试用展示模型，页面运行时仍在 `favorites.ts` 内部构建数据，避免小程序运行时 helper module 缺失风险。
  - 新增 `tests/favoritesPage.test.ts`，约束收藏列表展示、空状态、Useful expression 展开、多项同时展开和运行时依赖边界。
- 验证结果：
  - 本地已验证 `npm test -- tests/favoritesPage.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm test` 通过，显示 29 个测试文件、114 个测试用例通过。
  - 用户已在微信开发者工具中验证 Favorites 展开详情、Useful expression 展示和多卡片同时展开通过。
- 遗留问题：
  - 当前 Step 5.1 只实现收藏夹查看列表和详情展开，不实现收藏夹内音频播放或取消收藏。
  - 收藏夹播放和取消收藏留到 Step 5.2 实现。

### 2026-05-20 — Memory 单词记忆界面进度条补充

- 完成内容：
  - 根据用户反馈，在 Learn tab 内联 Memory 单词记忆界面中补充单词进度展示。
  - 新增 `单词进度` 标签、`Learned x / 20` 进度文字和进度条，复用现有 `progressLabel` / `progressPercent` 页面状态。
  - 点击 Memory 热区打开单词卡后，已有 `recordLearnedWord` 和 `refreshSceneProgress` 会继续同步更新该进度条。
  - 该调整只影响 Memory 视图，不改变 Classroom 学习首页、听力默写或听力口语模式。
- 验证结果：
  - 新增测试先在 Memory 视图缺少进度条时失败，随后补充 WXML 和样式后通过。
  - 本地已验证 `npm test -- tests/sceneMemoryWordCard.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 29 个测试文件、116 个测试用例通过。
  - 用户已在微信开发者工具中验证 Memory 单词记忆界面进度条通过。
- 遗留问题：
  - 当前进度条仍使用基础 UI，后续统一视觉精修阶段可再微调间距和样式。

### 2026-05-20 — 阶段 5 / Step 5.2 实现收藏夹播放和取消收藏

- 完成内容：
  - Favorites 收藏项展开详情中新增 `Play` 播放按钮和 `Remove` 取消收藏按钮。
  - Favorites 列表项展示模型补充 `audioUrl`，用于从收藏夹直接播放对应单词音频。
  - 点击 `Play` 时，页面使用 `wx.createInnerAudioContext()` 播放当前单词音频路径；播放新音频前会释放旧音频上下文。
  - 播放失败时显示轻提示“音频暂时无法播放”，不阻塞用户继续复习收藏词。
  - 点击 `Remove` 时通过 `favoriteService.removeFavorite()` 写入 `sceneenglish:favorites`，并立即刷新收藏列表。
  - 取消收藏后会同步移除该词的展开状态，避免列表刷新后保留无效选中项。
  - 页面隐藏时停止当前收藏夹音频，页面卸载时释放音频上下文。
  - 补充 `tests/favoritesPage.test.ts`，约束收藏夹音频路径、播放按钮、取消收藏按钮、运行时方法和样式。
- 验证结果：
  - 新增测试先在收藏夹缺少播放和取消收藏能力时失败，随后实现后通过。
  - 本地已验证 `npm test -- tests/favoritesPage.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 29 个测试文件、117 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 5.2 通过。
- 遗留问题：
  - 当前 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频，因此收藏夹点击播放没有可听声音是预期现象；后续用户测试前需要替换为真实单词发音文件。
  - 阶段 5 收藏夹基础能力已完成；下一步应按实施计划进入阶段 6 / Step 6.1，在用户确认后开始听力 + 默写模式。

### 2026-05-20 — 阶段 6 / Step 6.1 创建练习开始状态

- 完成内容：
  - 在 Learn tab 内联“听力 + 默写”模式中接入练习开始状态。
  - 点击“听力 + 默写”后生成 5 题练习轮次，并展示当前题号 `1 / 5`。
  - 当前题状态携带目标单词音频路径，页面提供“播放单词音频”按钮用于手动播放。
  - 页面不展示目标英文答案，避免听写模式开始时泄露答案。
  - 为听写开始状态补充页面内音频上下文管理：播放新音频前释放旧上下文，返回 Classroom、页面隐藏和页面卸载时停止或释放音频。
  - 修复微信开发者工具运行时报 `services/quizService.js is not defined` 的问题：`scene.ts` 不再运行时 import `../../services/quizService`，而是在页面内保留 Step 6.1 所需的轻量 5 题生成函数，避免新增 service helper module 在小程序运行时缺失。
  - 新增 `tests/listeningWritingStart.test.ts`，约束 5 题开始状态、题号展示、播放按钮、音频运行时方法、样式和运行时依赖边界。
  - 补充 `tests/sceneViewModel.test.ts`，验证听写开始状态从首题生成 `1 / 5` 和目标音频路径。
- 验证结果：
  - 新增测试先在听写开始状态和运行时依赖边界缺失时失败，随后实现和修复后通过。
  - 本地已验证 `npm test -- tests/listeningWritingStart.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 30 个测试文件、124 个测试用例通过。
  - 用户已在微信开发者工具中验证 Step 6.1 通过。
- 遗留问题：
  - 当前 Step 6.1 只实现听写模式一轮开始状态、题号展示和目标音频播放入口，尚未实现听音找物点击判断、拼写输入或结束页。
  - 当前 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频，因此听写模式点击播放没有可听声音是预期现象。
  - 按更新后的实施计划，下一步应先进入 Step 6.1.5：替换正式 Classroom 图片、20 个真实单词音频并重新校准热区，然后再开始 Step 6.2。

### 2026-05-21 — 阶段 6 / Step 6.1.5 正式 Classroom 图片接入

- 完成内容：
  - 新增 `miniprogram/assets/picture/classroom.png`，作为当前 Classroom 正式场景图资源。
  - 将 Classroom 的 `coverImage` 和 `sceneImage` 从旧占位图路径切换为 `/assets/picture/classroom.png`。
  - 删除旧的低保真占位图片 `miniprogram/assets/images/classroom-cover.png` 和 `miniprogram/assets/images/classroom.png`。
  - 同步更新图片资源测试和相关 view model 测试中的 Classroom 图片路径预期。
- 验证结果：
  - 本地已验证 `npm test -- tests/assets.test.ts tests/memoryViewModel.test.ts tests/sceneViewModel.test.ts` 通过。
  - 本地已验证 `npm run typecheck` 通过。
  - 本地已验证 `npm run lint` 通过。
  - 本地已验证 `npm run format:check` 通过。
  - 本地已验证 `npm test` 通过，显示 30 个测试文件、124 个测试用例通过。
  - 用户已在微信开发者工具中验证正式 Classroom 图片展示通过。
- 遗留问题：
  - 当前只完成 Step 6.1.5 的图片接入与旧占位图清理，尚未替换 20 个真实单词音频。
  - 当前 20 个单词热区坐标仍基于旧占位图，需要按新 Classroom 图片重新校准后再进入 Step 6.2。

### 2026-05-21 — 文档口径与实用表达维护

- 完成内容：
  - 根据用户反馈清理产品设计文档中的旧内容口径，明确当前 MVP 用户界面不展示 Example / 例句区块。
  - 将 `memory-bank/design-document.md` 的教室词表改为只列 MVP 展示内容：中文、英文、音标和 1 条实用表达。
  - 将设计文档中的 20 条 Useful expression 同步为当前 implementation 使用的自然课堂 / 校园表达，并补充“不能全部写成问句”的内容原则。
  - 更新设计文档中的 Classroom 图片路径示例为 `/assets/picture/classroom.png`，避免旧占位图路径继续误导实现。
  - 在 `memory-bank/tech-stack.md` 和 `memory-bank/architecture.md` 中补充说明 `exampleEn` / `exampleCn` 仅作为底层保留字段，当前 MVP 展示以 `expressionEn` / `expressionCn` 为准。
  - 将 chalk 的 Useful expression 中容易造成歧义的英文 `example on the board` 改为 `note on the board`，并同步更新中文翻译。
- 验证结果：
  - 本地已验证数据相关测试通过：`tests/scenes.test.ts`、`tests/wordService.test.ts`、`tests/sceneMemoryWordCard.test.ts`，共 21 个测试用例通过。
  - 本地已验证 TypeScript 小程序与测试配置类型检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 范围检查通过。
  - 本地已验证全量 Vitest 通过，显示 30 个测试文件、124 个测试用例通过。
- 遗留问题：
  - 当前 `exampleEn` / `exampleCn` 仍保留在底层数据结构中，用于数据完整性、测试兼容和后续可能的学习形态；MVP 用户界面不展示。

### 2026-05-21 — 阶段 6 / Step 6.1.5 正式 Classroom 热区校准

- 完成内容：
  - 将 Classroom 场景的 `baseWidth` / `baseHeight` 从旧占位图尺寸更新为正式图片实际尺寸 `1672 x 941`。
  - 根据正式 Classroom 图片重新标定 20 个单词的 `position` 热区坐标。
  - 对小物件热区做可点击性调整，尤其是 chalk 使用稍大的点击区域覆盖黑板托盘上的单根粉笔，避免手机端难以点中。
  - 同步更新 `memory-bank/design-document.md` 中 Classroom 数据样例的图片基准尺寸。
  - 新增 `tests/scenes.test.ts` 热区校准约束，锁定正式图尺寸和 20 个热区坐标。
  - 更新 `tests/sceneMemoryHotspots.test.ts` 和 `tests/memoryViewModel.test.ts` 中的新图比例 / 百分比坐标预期。
- 验证结果：
  - 新增测试先在旧尺寸和旧热区坐标下失败，随后更新数据后通过。
  - 本地已验证 `tests/scenes.test.ts`、`tests/sceneMemoryHotspots.test.ts`、`tests/hotspot.test.ts` 通过，共 20 个测试用例通过。
  - 本地已验证 TypeScript 小程序与测试配置类型检查通过。
  - 本地已验证 ESLint 通过。
  - 本地已验证 Prettier 范围检查通过。
  - 本地已验证全量 Vitest 通过，显示 30 个测试文件、126 个测试用例通过。
  - 用户已在微信开发者工具中验证 20 个正式 Classroom 热区点击通过。
- 遗留问题：
  - 当前只完成正式图片和热区校准，20 个 `miniprogram/assets/audio/*.mp3` 仍是静音占位音频；后续需要替换为真实单词发音文件。

### 2026-05-21 — 阶段 6 / Step 6.1.5 正式单词音频资源替换

- 完成内容：
  - 将 `miniprogram/assets/audio/` 下 20 个 Classroom 单词音频从静音 / 临时占位资源替换为可听的短 MP3 单词发音文件。
  - 保持全部音频文件名与 `miniprogram/data/scenes.ts` 中的 `audioUrl` 一致，不改动词表数量、词表内容、热区规则或练习规则。
  - 更新 `tests/assets.test.ts`，校验每个 Classroom 单词音频文件存在、大小符合短单词 MP3 资源预期，并且文件头为 MP3 格式。
- 验证结果：
  - 本地验证 `tests/assets.test.ts` 通过。
  - 本地全量 Vitest 通过：30 个测试文件、126 个测试用例通过。
  - 本地 TypeScript、ESLint 和 Prettier 检查通过。
  - 已使用 ffprobe 抽查 20 个音频文件，时长约 0.77s 到 1.20s，符合单词发音资源形态。
  - 用户已在微信开发者工具中听感验证，并确认“音频可以”。
- 遗留问题：
  - 当前音频可用于 MVP 演示，但不是品牌级定制音色；后续如果上线或扩展多场景，可以再接入更稳定的 TTS 生产流程或替换为人工审核后的专业录音。
  - 无。

### 2026-05-21 — Memory 单词卡自动播放体验优化

- 完成内容：
  - 点击 Memory 热区打开单词卡时，页面会自动播放当前单词音频一次。
  - 保留单词卡上的播放按钮，用户可根据自身需要再次点击复听。
  - 自动播放复用现有 `playMemoryWordAudio` 逻辑，打开新单词前会释放旧音频上下文，避免快速切换单词时多音频重叠。
  - 自动播放失败时继续使用轻提示“音频暂时无法播放”，不影响用户查看单词卡。
  - 根据用户反馈将 `eraser.mp3` 短暂试换后恢复到原音色版本，保持 20 个单词音频整体听感一致。
- 验证结果：
  - 新增测试先在缺少自动播放调用时失败，随后实现后通过。
  - 本地验证 `tests/assets.test.ts` 和 `tests/sceneMemoryWordCard.test.ts` 通过。
  - 本地全量 Vitest 通过：30 个测试文件、127 个测试用例通过。
  - 本地 TypeScript、ESLint 和 Prettier 检查通过。
  - 用户已在微信开发者工具中验证自动播放和音频整体体验通过。
- 遗留问题：
  - 暂无；下一步可继续按 `implementation-plan.md` 进入 Step 6.2 听音找物点击判断。

### 2026-05-21 — 阶段 6 / Step 6.2 听音找物点击判断

- 完成内容：
  - 在 Listen + Spell 模式中复用正式 Classroom 图片和 20 个已校准热区，实现听音找物点击判断。
  - 当前题音频未播放或尚未播放结束时，点击物品只提示先听音频，不进入对错判定，也不记录错题。
  - 当前题音频播放结束后允许点击物品；点对后高亮目标并进入拼写准备状态。
  - 首次点错会记录 `click` 类型错题并允许重试；第二次点错会提示正确物品并进入拼写准备状态。
  - 点对进入拼写准备状态后，继续点击其他物品不会再次触发错误反馈。
  - 点击图片空白区域只给轻提示，不记录错题。
  - 整理 `progress.md` 和 `architecture.md` 中此前错位的记录位置，并补充 Step 6.2 架构说明。
- 验证结果：
  - 新增回归测试先在缺少音频结束门禁和答对后点击保护时失败，随后实现后通过。
  - 本地验证 TypeScript 小程序配置通过。
  - 本地验证 TypeScript 测试配置通过。
  - 本地全量 Vitest 通过：30 个测试文件、131 个测试用例通过。
  - 本地 ESLint 通过。
  - 本地 Prettier 范围检查通过。
  - 本地 `git diff --check` 通过，仅保留 Windows CRLF 提示。
  - 用户已在微信开发者工具中验证 Step 6.2 行为通过。
- 遗留问题：
  - 当前只完成 Listen + Spell 的“听音找物”点击判断；下一步应继续实现拼写输入与拼写答案校验。

### 2026-05-22 — 阶段 6 / Step 6.3-6.4 Listen + Spell 拼写闭环与界面返修

- 完成内容：
  - 在 Listen + Spell 中补齐拼写输入状态：用户点对物品后进入 `spellingReady`，输入框展示在当前练习面板内。
  - 拼写判断复用 `normalize` 工具，忽略大小写和首尾空格。
  - 第一次拼写错误记录 `spelling` 类型错题并允许重试；第二次拼写错误展示正确拼写并等待用户继续。
  - 答对或完成当前题后不再立即跳题，而是显示 `Continue`，由用户手动进入下一题或结束本轮。
  - 完成 5 题后展示 `Round complete` 状态，并提供并排的 `New 5-word set` 和 `End practice` 按钮。
  - 为正确和错误反馈补充短 WAV 音效资源；错误音效保留但更柔和，并在运行时降低播放音量。
  - 根据用户反馈精简练习面板：去掉拼写阶段重复的上方提示框；拼写阶段隐藏顶部大播放按钮，将 `Play audio` 和 `Submit` 放在输入框下方并排。
  - 将正确物品高亮从深色框改为柔和珊瑚色高亮，降低视觉突兀感。
- 验证结果：
  - 本地验证 `tests/listeningWritingStart.test.ts` 通过。
  - 本地验证 TypeScript 小程序与测试配置类型检查通过。
  - 本地验证 ESLint 通过。
  - 本地验证 Prettier 范围检查通过。
  - 本地全量 Vitest 通过：30 个测试文件、144 个测试用例通过。
  - 用户已在微信开发者工具中验证当前 Listen + Spell 拼写界面、完成页按钮和错误音效调整通过。
- 遗留问题：
  - 当前 Listen + Spell 已形成基础拼写闭环；后续仍可在整轮统计、错题专项和视觉精修阶段继续增强。
### 2026-05-22 - 阶段 6 / Step 6.5 验证抽题优先级

- 完成内容：
  - 补强 `quizService` 普通练习抽题逻辑：先在已学词池内随机抽取，不足 5 题时再从未学词池随机补足。
  - 为 `createPracticeQuizRound` 增加可注入随机函数，保证随机抽题逻辑可以用确定性单元测试验证。
  - 同步更新 `scene.ts` 内联 Listen + Spell 抽题实现，保持小程序运行时与 service 层抽题规则一致。
  - 保留新一组 Listen + Spell 优先排除上一轮词的逻辑，降低连续两轮重复。
  - 保留错题专项抽题按弱项优先的 service 层规则，并通过现有测试覆盖低掌握度、高错误次数、最近错误时间和指定错误类型筛选。
- 验证结果：
  - 新增/调整测试先在旧的固定顺序抽题实现下失败，随后实现随机优先级后通过。
  - 本地验证 `npm run typecheck` 通过。
  - 本地验证 `npm run lint` 通过。
  - 本地验证 `npm run format:check` 通过。
  - 本地验证 `npm test` 通过，显示 30 个测试文件、144 个测试用例通过。
  - 本地验证 `git diff --check` 通过，仅保留 Windows CRLF 提示。
  - 用户已确认 Step 6.5 验证通过。
- 遗留问题：
  - 错题专项页面入口尚未进入实现阶段，手动进入错题专项练习需要后续 Step 7.4 完成入口后再做端到端验证；当前先由 service 层单元测试保证弱项优先规则。
  - 用户反馈错误音效仍不好听，已进入后续小修处理，保留错误音效但替换为更普通柔和的短提示音。

### 2026-05-23 - Listen + Spell 错误反馈音效小修

- 完成内容：
  - 保留错误音效反馈，但将 `miniprogram/assets/audio/feedback-wrong.wav` 调整回用户认可的短促提示音方向。
  - 将错误音效播放音量调整为比正确音效更低，避免错误反馈过于突兀。
  - 补充 `tests/assets.test.ts` 对反馈 WAV 的非静音校验，防止再次出现“文件格式合法但没有声音”的资源问题。
- 验证结果：
  - 本地验证 `tests/assets.test.ts` 与 `tests/listeningWritingStart.test.ts` 通过。
  - 用户已确认当前错误音效版本通过；后续在最终 UI / 体验精修阶段再统一处理声音细节。
- 遗留问题：
  - 错误音效当前作为可接受版本保留，最终听感可在 UI 精修阶段再做一轮整体音效处理。

### 2026-05-23 - 阶段 7 / Step 7.1 实现错题列表

- 完成内容：
  - 将 `miniprogram/pages/mistakes/` 从占位页面更新为真实错题夹列表页面。
  - 新增 `miniprogram/pages/mistakes/mistakesViewModel.ts`，用于将本地错题记录转换为页面列表模型。
  - 错题夹现在展示单词英文、中文、所属场景、总错误次数、最近错误日期、错误类型、各类型错误次数和掌握进度条。
  - 错题夹支持空状态展示。
  - 错题列表按总错误次数递减排序，错误越多的单词越靠前。
  - 新增 `tests/mistakesPage.test.ts`，覆盖错题列表模型、空状态、页面渲染结构、页面刷新逻辑和样式约束。
- 验证结果：
  - 新增测试先在缺少错题列表实现时失败，随后实现后通过。
  - 已验证 `npm run typecheck` 通过。
  - 已验证 `npm run lint` 通过。
  - 已验证 `npm run format:check` 通过。
  - 已验证 `npm test` 通过，显示 31 个测试文件、150 个测试用例通过。
- 遗留问题：
  - 当前 Step 7.2 只实现手动移出错题；掌握进度自动移出仍属于 Step 7.3。
  - 错题专项练习入口仍属于 Step 7.4，尚未进入实现。
### 2026-05-23 - 阶段 7 / Step 7.3 自动移出边界修正

- 完成内容：
  - 在错题夹展示模型中补充边界处理：如果某条错题记录的 `typeStats` 已经为空，页面会把它视为已掌握并从列表中过滤，不再显示 0 错误的空卡片。
  - 同步更新运行时页面内联聚合逻辑和测试用 `mistakesViewModel`，保持微信小程序运行时与单元测试模型一致。
  - 补充 `tests/mistakesPage.test.ts` 回归测试，覆盖“所有弱项已移除后，错题夹显示空状态”的页面层行为。
- 验证结果：
  - 用户已确认当前边界修正通过并要求提交。
  - 已验证 `npm run typecheck` 通过。
  - 已验证 `npm run lint` 通过。
  - 已验证 `npm run format:check` 通过。
  - 已验证 `npm test` 通过，显示 31 个测试文件、151 个测试用例通过。
- 遗留问题：
  - `mistakeService.recordMistakeCorrectAnswer()` 目前仍只在服务层测试中验证，尚未接入真实练习流程。
  - 下一步需要把“答对后更新错题掌握进度 / 连续答对后消除弱项”的调用接入实际练习，确保用户可以真实通过练习消除错题记录。
  - Step 7.4 错题专项练习入口尚未实现。
### 2026-05-24 - 阶段 7 / Step 7.3 接入答对后错题掌握进度更新

- 完成内容：
  - 在 Listen + Spell 真实练习流程中接入 `mistakeService.recordMistakeCorrectAnswer()`。
  - 用户听音后点对目标物品时，会更新该词 `click` 错题类型的连续答对次数和掌握进度。
  - 用户拼写答对目标单词时，会更新该词 `spelling` 错题类型的连续答对次数和掌握进度。
  - 继续复用既有错题服务规则：同一错误类型答对 1 次进度为 50%，连续答对 2 次后移除该错误类型；所有错误类型移除后该词从错题夹移除。
  - 补充 `tests/listeningWritingStart.test.ts` 回归测试，约束 Listen + Spell 的点对和拼写答对路径会调用错题掌握进度更新服务。
- 验证结果：
  - 用户已在微信开发者工具中验证当前流程通过。
  - 已验证 `npm run typecheck` 通过。
  - 已验证 `npm run lint` 通过。
  - 已验证 `npm run format:check` 通过。
  - 已验证 `npm test` 通过，显示 31 个测试文件、152 个测试用例通过。
- 遗留问题：
  - 当前错题消除需要回到 Listen + Spell 普通练习中重新遇到该词并答对；错题夹内的 `Practice` 专项入口仍属于 Step 7.4，尚未实现。
  - 当前只接入 Listen + Spell 的 `click` 和 `spelling` 掌握进度更新；`speaking` 类型需要在 Listen + Speak 流程实现后接入。

### 2026-05-24 - Phase 7 / Step 7.4 Mistake practice entry

- Completed:
  - Added one top-level `Practice` entry on the Mistakes page instead of per-word practice buttons.
  - Tapping `Practice` opens a choice between `Object` and `Spelling`; `Object` maps to `click` mistakes and `Spelling` maps to `spelling` mistakes.
  - Added a pending mistake practice request service so the Mistakes page can hand the selected practice type to the Scene page.
  - Scene page now consumes the pending request, starts the matching mistake-focused round, and returns directly to the Mistakes page after the practice round finishes.
  - Object mistake practice now stops after the object-selection answer; Spelling mistake practice continues through the Listen + Spell spelling flow.
  - Simplified the Mistakes card UI: removed per-type timestamps, removed visible progress percentages, kept one card-level last mistake date, right-aligned `1x`, and made `Practice` / `Remove` compact badge-style controls.
- Verification:
  - User validated the updated Mistakes UI and the post-practice return behavior in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 32 test files, 157 tests.
- Remaining:
  - `speaking` mistake practice remains out of scope until the Listen + Speak flow is implemented.
  - Further visual polish can continue in the later UI refinement phase.

### 2026-05-26 - Phase 8 / Step 8.1 Listen + Speak start state

- Completed:
  - Added Listen + Speak inline start state in the Learn tab.
  - Entering Listen + Speak now creates a 5-question round and shows the current question label, starting from `1 / 5`.
  - Added target word audio playback for Listen + Speak, with object selection enabled only after the audio finishes.
  - Reused the calibrated Classroom image and existing hotspot data for the Listen + Speak object-finding step.
  - First wrong object tap records a `click` mistake and shows retry feedback.
  - Correct object tap updates `click` mastery progress and enters the `Ready to speak` placeholder state.
  - Kept recording controls, microphone permissions, short-recording handling, mock ASR, speaking mistakes, and completion flow out of this step.
- Verification:
  - User validated Step 8.1 in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 33 test files, 164 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 8.2 still needs to implement the actual recording interaction.
  - Listen + Speak does not yet advance through the full round after the record-ready state.

### 2026-05-26 - Phase 8 / Step 8.2 Listen + Speak recording interaction

- Completed:
  - Added Listen + Speak recording state to the Scene page view model.
  - Added WeChat `RecorderManager` wiring for starting, stopping, and cancelling recordings after the correct object is selected.
  - Added microphone permission handling with a clear retryable prompt when permission is denied.
  - Added short-recording validation; recordings shorter than the minimum threshold show retry feedback and do not save a file path.
  - Normal saved recordings now show a clear `Saved` state and a secondary `Record Again` action instead of leaving the primary button as `Start Recording`.
  - Kept mock ASR recognition, speaking mistake recording, and round advancement out of this step.
- Verification:
  - User validated the recording UI behavior and final saved/re-record layout in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 34 test files, 169 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 8.3 still needs to pass the saved recording to mock ASR and display recognition feedback.
  - Listen + Speak still does not advance through the full round after a saved recording.

### 2026-05-27 - Phase 8 / Step 8.3 Listen + Speak mock recognition

- Completed:
  - Connected saved Listen + Speak recordings to `speechService.recognizeWord(...)`.
  - Added recognition state fields for `idle`, `recognizing`, `passed`, `notRecognized`, and `failed`.
  - Shows checking, passed, or retry feedback without exposing mock/ASR internals to the user.
  - Sets saved-recording and recognizing feedback in the same state update so the UI cannot stall on `Saved`.
  - Updated the mock speech service default from unconditional success to an automatic demo scenario with success, failure, and empty-result paths while preserving deterministic overrides for tests.
  - Refined the recognition feedback UI: hidden redundant `Recording saved.` and saved/re-record controls after result feedback, made the feedback card more prominent, and aligned the one-row status/feedback layout.
  - Kept speaking mistake recording, second-failure behavior, and round advancement out of this step.
- Verification:
  - User validated the final recognition feedback behavior and UI in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 36 test files, 183 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 8.4 still needs to record speaking mistakes, handle first/second failure behavior, advance questions, and complete the Listen + Speak round.
  - Mock recognition remains a demo simulation; real ASR is out of MVP scope.

### 2026-05-27 - Phase 8 / Step 8.4 Listen + Speak speaking mistakes and completion

- Completed:
  - Listen + Speak now records `speaking` mistakes when mock recognition does not pass.
  - A first speaking recognition failure records the mistake and lets the user record again.
  - A second speaking recognition failure reveals the correct pronunciation and waits for the user to continue.
  - Passed recognition updates `speaking` mastery progress through `recordMistakeCorrectAnswer(...)` and waits for `Continue` or `Finish`.
  - The Listen + Speak round now advances through all 5 questions and shows a completion state after the final question.
  - The completion state shows correct count, mistake count, and new mistake count, plus `New 5-word set` and `End practice` actions.
  - Speaking mistakes now appear in the Mistakes page data through the existing mistake service.
- Verification:
  - User validated Step 8.4 in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 37 test files, 192 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Speaking-specific mistake practice from the Mistakes page can be considered in a later step now that the Listen + Speak round exists.
  - Mock recognition remains a demo simulation; real ASR is still out of MVP scope.

### 2026-05-27 - Phase 9 / Step 9.1 Resource failure feedback

- Completed:
  - Added Scene page state for scene image load failures.
  - Bound every Classroom scene image instance to load/error handlers.
  - Scene image failures now render a fallback panel with `Scene image could not load.` and a compact `Retry` action instead of leaving a blank image area.
  - `Retry` resets the image failure state and uses `catchtap` so it does not trigger the practice blank-area tap handlers.
  - Unified Memory, Listen + Spell, and Listen + Speak word-audio playback failures through one lightweight toast helper.
  - Normal page navigation, hotspots, and practice controls remain available when resource errors occur.
- Verification:
  - User validated Step 9.1 in WeChat DevTools.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run format:check` passed.
  - `npm test` passed: 38 test files, 195 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 9.2 still needs to cover mid-practice exit/save behavior.

### 2026-05-27 - Phase 9 / Step 9.2 Mid-practice exit persistence

- Completed:
  - Added a shared Scene page reset helper for returning practice modes to the normal Classroom entry state.
  - Listen + Spell and Listen + Speak now clear interrupted in-memory rounds when the Scene page is hidden.
  - Re-entering a practice mode starts from a fresh round instead of restoring a half-finished question queue.
  - Existing mistake and mastery records are still preserved through the immediate service writes that happen during answer handling; the exit cleanup does not write extra mistake changes.
  - Added runtime-style coverage for interrupted Listen + Spell and Listen + Speak exits.
- Verification:
  - User validated Step 9.2 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 39 test files, 197 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 9.3 still needs to unify user-facing feedback copy.

### 2026-05-27 - Phase 9 / Step 9.3 User-facing feedback copy

- Completed:
  - Added `miniprogram/utils/feedbackCopy.ts` as a shared source for core user-facing feedback text.
  - Replaced scattered Scene, Home, Favorites, Mistakes, and Me feedback strings with shared copy where they affect user feedback.
  - Removed the visible `Mock ASR enabled` status from Me and replaced it with `Speech practice ready.`
  - Refined image failure, audio failure, recording, microphone permission, recognition failure, retry, and coming-soon wording so users do not see mock or technical implementation language.
  - Added regression coverage to ensure key user-facing pages use shared feedback copy and do not expose mock or technical wording.
- Verification:
  - User validated Step 9.3 copy behavior in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 40 test files, 200 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 9.4 still needs mobile visual adaptation.

### 2026-05-27 - Phase 9 / Step 9.4 Mobile visual adaptation and copy cleanup

- Completed:
  - Tightened small-screen spacing on Home, Scene, Favorites, Mistakes, Review, and Me pages.
  - Added safe-area bottom padding for tab pages so native navigation does not overlap content on narrow or notched devices.
  - Replaced the native blank-scene tap toast with a custom responsive in-page hint so `Tap an object in the picture.` does not wrap awkwardly on small devices.
  - Removed the redundant `Saved` state from the Listen + Speak failed-recognition UI.
  - Kept the Me page three statistic cards side by side on small screens by shrinking card gaps, padding, and label sizes.
  - Added local PNG tabBar icons for Home, Learn, Review, and Me so native tab labels do not drift into the icon slot on some devices.
  - Removed developer-facing explanatory copy from user pages, including unnecessary `subtitle`, `description`, placeholder, and global-entry explanation text.
  - Added regression tests for small-screen visual rules, tab icon file format, and removal of developer-facing user copy.
- Verification:
  - User validated the mobile visual changes and copy cleanup in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 42 test files, 209 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Me page can now move into a fuller profile and learning-dashboard polish step.

### 2026-05-29 - Phase 9 / Step 9.5 Me profile and learning dashboard

- Completed:
  - Replaced the lightweight Me placeholder with an editable local profile card.
  - Added nickname and signature editing, plus WeChat native avatar selection through `open-type="chooseAvatar"`.
  - Kept the avatar picker layout-neutral by placing a transparent native button inside a fixed avatar shell, avoiding the earlier large-button layout shift.
  - Added local profile persistence through `profileService`.
  - Added a weekly/monthly learning progress chart backed by local daily activity records.
  - Updated progress writes so newly learned words contribute to the activity chart without double-counting already learned words.
  - Added compact three-column stats and quick entries for continuing learning, favorites, and mistakes.
  - Removed the old Me-page speech recognition status card.
  - Added regression tests for profile persistence, learning activity chart data, Me view model output, Me page avatar controls, and progress activity recording.
- Verification:
  - User validated the Me profile/dashboard changes in WeChat DevTools.
  - User accepted the WeChat avatar picker behavior, including the DevTools-only `chooseAvatar:fail cancel` message when canceling native avatar selection.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 45 test files, 218 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Continue with the next verified MVP polish step only after user approval.

### 2026-06-01 - Lecture Hall scene content and hotspot calibration

- Completed:
  - Enabled Lecture Hall as a selectable learnable scene from Home while preserving Dormitory and Cafeteria as coming soon.
  - Added a local selected-scene service so the Learn tab can load the scene chosen from Home.
  - Replaced the Lecture Hall artwork with the approved image asset.
  - Rebuilt the Lecture Hall vocabulary to exactly 20 clickable words: auditorium seat, aisle, stair, handrail, stage, presentation screen, spotlight, speaker array, control booth, monitor, acoustic panel, ventilation grille, wall light, exit sign, camera, tripod, floor cable cover, podium, microphone stand, and clock.
  - Added Lecture Hall audio assets, including unique IDs for repeated vocabulary names shared with Classroom.
  - Calibrated Lecture Hall hotspots for seats, stage objects, wall objects, lights, acoustic panels, and the exit sign.
  - Removed the tap-time white flash from transparent memory/listening/speaking hotspots.
  - Restored word-card translation flow so useful-expression Chinese copy starts folded and appears only after user action.
  - Added regression coverage for Lecture Hall scene data, assets, scene selection, hotspot behavior, word lookup, and word-card display.
- Verification:
  - User validated the Lecture Hall image, word list, hotspot adjustments, Chinese copy behavior, and final exit-sign adjustment in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 47 test files, 242 tests.
- Remaining:
  - Continue with the next verified step only after user approval.

### 2026-06-01 - v2 Scene Tutor / Step 1.1 Scene Tutor domain types

- Completed:
  - Added the initial Scene Tutor type contracts for task kinds, matched RAG words, local learning signals, request context, cloud request payloads, successful responses, and structured error codes.
  - Added a focused RED test for the upcoming `sceneTutorContextService` contract before implementing the service itself.
  - Confirmed this step only defines shared domain contracts; it does not add runtime AI UI, cloud calls, API keys, or model provider configuration.
- Verification:
  - User validated Step 1.1.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 48 test files, 244 tests.
- Remaining:
  - Step 1.2 needs `sceneTutorContextService` to build local RAG context from the selected scene, local word list, favorites, mistakes, and progress.

### 2026-06-01 - v2 Scene Tutor / Step 1.2 Scene Tutor context service

- Completed:
  - Added `sceneTutorContextService` to build local Scene Tutor learning signals from the selected scene, scene word list, favorites, mistakes, and progress.
  - Added a base Scene Tutor context builder that prepares scene metadata, task, query, selected word IDs, empty retrieval results, and learning signals for later RAG retrieval.
  - Added unavailable-scene handling that returns a structured result instead of throwing a page-level exception.
  - Expanded Scene Tutor tests to cover Classroom, Lecture Hall, empty local data, cross-scene scoping for favorites/mistakes/learned words, base context creation, and unknown scene IDs.
- Verification:
  - User validated Step 1.2.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 48 test files, 249 tests.
- Remaining:
  - Step 1.3 needs lightweight local word retrieval so selected words and user queries can populate `matchedWords`.

### 2026-06-01 - v2 Scene Tutor / Step 1.3 Lightweight RAG retrieval service

- Completed:
  - Added `sceneTutorRetrievalService` to retrieve Scene Tutor matched words from the current scene's local word list.
  - Supported matching by English word, Chinese meaning, useful-expression English, and useful-expression Chinese.
  - Kept retrieval scoped to the requested scene so Classroom and Lecture Hall vocabulary do not cross-contaminate.
  - Added lightweight ranking boosts for selected words, mistake words, favorite words, and learned words.
  - Added current-scene fallback matched words when the query has no direct hit.
  - Limited matched words to at most 5 items for prompt-size control.
  - Added regression coverage for projector matching, Lecture Hall stage scoping, favorite/mistake ranking, selected-word priority, and fallback words.
- Verification:
  - User validated Step 1.3.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 49 test files, 254 tests.
- Remaining:
  - Step 1.4 needs `sceneTutorPromptService` to combine base context and retrieval results into the minimal cloud-function payload.

### 2026-06-01 - v2 Scene Tutor / Step 1.4 Scene Tutor payload builder

- Completed:
  - Added `sceneTutorPromptService` to build the minimal cloud-function request payload from task, scene ID, query, and selected word IDs.
  - Combined `sceneTutorContextService` and `sceneTutorRetrievalService` so payloads include scene metadata, query, selected words, matched words, and learning signals.
  - Added safeguards through tests to confirm the mini-program payload does not include API key fields, raw storage keys, or storage adapter methods.
  - Added structured unavailable-scene propagation from the lower-level context/retrieval services.
- Verification:
  - User validated Step 1.4.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 50 test files, 258 tests.
- Remaining:
  - Phase 2 / Step 2.1 needs the CloudBase `sceneTutor` cloud function skeleton and local unit-testable handler.

### 2026-06-01 - v2 Scene Tutor / Step 2.1 CloudBase function skeleton

- Completed:
  - Added the `cloudfunctions/sceneTutor/` cloud function directory.
  - Added `package.json`, `index.js`, `guardrails.js`, `promptBuilder.js`, and `responseParser.js`.
  - Kept API credentials out of the repository and out of the cloud function skeleton.
  - Exposed `handleSceneTutorRequest` from `index.js` so the cloud function core can be covered by local unit tests.
  - Added initial guardrail behavior for supported tasks, unsupported tasks, and query length over 500 characters.
- Verification:
  - User validated Step 2.1.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 51 test files, 261 tests.
- Remaining:
  - Step 2.2 needs fuller cloud function guardrails for scene ID, matched word count, selected word count, and secret-like request fields.

### 2026-06-01 - v2 Scene Tutor / Step 2.2 Cloud function guardrails

- Completed:
  - Expanded `guardrails.js` request validation before any model call.
  - Added validation for required `context.scene.id`.
  - Added validation that `matchedWords` is an array with at most 5 items.
  - Added validation that Make Sentences selected words do not exceed 5 items.
  - Added recursive rejection of secret-like request fields such as `apiKey`, `LLM_API_KEY`, `providerKey`, `token`, and `secret`.
  - Expanded cloud function tests for scene ID, matched word count, selected word count, and secret-like fields.
- Verification:
  - User validated Step 2.2.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 51 test files, 265 tests.
- Remaining:
  - Step 2.3 needs server-side prompt builder output for Ask AI and Make Sentences tasks.

### 2026-06-01 - v2 Scene Tutor / Step 2.3 Prompt builder

- Completed:
  - Implemented `promptBuilder.js` to return stable `system` and `user` prompt messages for Scene Tutor.
  - Added Ask AI prompt instructions to stay within the current scene, prioritize matched words, return JSON only, and include `answer`, `example`, `relatedWords`, and `basedOn`.
  - Added Make Sentences prompt instructions to use selected words and return JSON fields `generatedText`, `keyWordsUsed`, `chineseHelp`, and `trySaying`.
  - Kept prompt construction limited to payload context and verified it does not include `LLM_API_KEY` values.
- Verification:
  - User validated Step 2.3.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 52 test files, 268 tests.
- Remaining:
  - Step 2.4 needs the OpenAI-compatible LLM provider abstraction with injected request testing and environment-only credentials.

### 2026-06-01 - v2 Scene Tutor / Step 2.4 OpenAI-compatible provider abstraction

- Completed:
  - Added `providers/llmProvider.js` as the cloud function's replaceable LLM provider entry.
  - Added `providers/openaiCompatibleProvider.js` for OpenAI-compatible chat completions requests.
  - Read `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL` from environment-only configuration.
  - Kept `LLM_BASE_URL` out of source code defaults and used `deepseek-v4-flash` when `LLM_MODEL` is not set.
  - Added request-function injection so provider behavior can be unit-tested without real network calls or real API keys.
  - Added structured `provider_not_configured` and `provider_error` results that do not leak API key values.
- Verification:
  - User validated Step 2.4.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 53 test files, 272 tests.
- Remaining:
  - Step 2.5 needs response parsing and safe fallback behavior for model output.

### 2026-06-01 - v2 Scene Tutor / Step 2.5 Response parser and fallback

- Completed:
  - Implemented `responseParser.js` to parse model JSON before returning data to the caller.
  - Added Ask AI response normalization with missing `relatedWords` and `basedOn` filled as empty arrays.
  - Added Make Sentences response normalization with missing `chineseHelp` and `trySaying` filled as empty strings.
  - Added plain-text fallback conversion into structured displayable responses.
  - Added `model_response_invalid` errors for empty text and malformed JSON-like output.
- Verification:
  - User validated Step 2.5.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 54 test files, 277 tests.
- Remaining:
  - Step 2.6 needs local end-to-end cloud function tests that inject a fake provider and return parsed Ask AI / Make Sentences results.

### 2026-06-01 - v2 Scene Tutor / Step 2.6 Local cloud function end-to-end test

- Completed:
  - Connected the cloud function handler pipeline across guardrails, prompt builder, provider, and response parser.
  - Updated `handleSceneTutorRequest` to support dependency injection for local fake-provider tests.
  - Added local end-to-end tests for Ask AI and Make Sentences successful responses using fake provider output.
  - Kept tests independent from real API keys and network access.
  - Preserved structured provider configuration errors when the handler runs without provider environment variables.
- Verification:
  - User validated Step 2.6.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 54 test files, 279 tests.
- Remaining:
  - Phase 3 / Step 3.1 needs mini-program cloud capability initialization and safe unavailable handling.

### 2026-06-01 - v2 Scene Tutor / Step 3.1 Mini-program cloud capability initialization

- Completed:
  - Added `cloudInitService` to safely initialize mini-program cloud capability through `wx.cloud.init({ traceUser: true })`.
  - Wired cloud initialization into `miniprogram/app.ts` during `onLaunch`.
  - Added `isCloudAvailable` to app global data so later page/service code can read cloud availability without calling cloud initialization again.
  - Kept CloudBase environment IDs, API keys, provider keys, base URLs, and model configuration out of mini-program source code.
  - Added fallback behavior so missing `wx.cloud` or initialization exceptions return `cloud_unavailable` instead of crashing app startup.
- Verification:
  - User validated Step 3.1 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 55 test files, 283 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 3.2 needs `sceneTutorCloudService` to wrap `wx.cloud.callFunction`, normalize success/failure responses, and keep API key fields out of the mini-program request path.

### 2026-06-01 - v2 Scene Tutor / Step 3.2 Scene Tutor cloud function call service

- Completed:
  - Added `sceneTutorCloudService` to wrap the mini-program `wx.cloud.callFunction` boundary for the `sceneTutor` cloud function.
  - Added `requestSceneTutor(payload)` so later page code can call one service instead of touching `wx.cloud.callFunction` directly.
  - Normalized successful Ask AI and Make Sentences cloud function responses into typed client-side results.
  - Converted cloud call rejection, timeout, and invalid result shapes into the user-safe `unavailable` result with `AI Tutor is temporarily unavailable. Please try again.`
  - Added recursive secret-like field stripping before sending payload data to CloudBase, covering fields such as `apiKey`, `LLM_API_KEY`, `providerKey`, `token`, and `secret`.
- Verification:
  - User validated Step 3.2 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 56 test files, 289 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 3.3 needs centralized Scene Tutor user-facing copy for titles, recommended questions, generation labels, loading, errors, empty states, and out-of-scope feedback.

### 2026-06-01 - v2 Scene Tutor / Step 3.3 Scene Tutor copy utility

- Completed:
  - Added `sceneTutorCopy` as the centralized source for Scene Tutor user-facing copy.
  - Added copy for Scene Tutor title, entry title, entry description, Ask AI recommended questions, Make Sentences generation type labels, loading, unavailable, out-of-scope, empty state, and selection actions.
  - Updated `sceneTutorCloudService` to reuse `sceneTutorCopy.errorUnavailable` instead of keeping a separate error string.
  - Added user-facing copy regression coverage to keep technical implementation words out of Scene Tutor visible copy.
- Verification:
  - User validated Step 3.3 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 57 test files, 291 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Phase 4 / Step 4.1 needs the Scene Tutor entry on the scene learning page for available scenes only.

### 2026-06-01 - v2 Scene Tutor / Step 4.1 Scene Tutor scene entry

- Completed:
  - Added a Scene Tutor entry model to the scene learning page view model.
  - Showed the `AI 助教 / Scene Tutor` entry for available scenes: Classroom and Lecture Hall.
  - Kept the Scene Tutor entry unavailable for coming-soon scenes: Dormitory and Cafeteria.
  - Rendered Ask AI and Make Sentences capability hints without replacing the existing Memory, Listen + Spell, and Listen + Speak mode entries.
  - Added focused regression coverage for available-scene visibility, coming-soon exclusion, and WXML rendering.
- Verification:
  - User validated Step 4.1 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 58 test files, 294 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 4.2 needs the Scene Tutor entry to switch into an in-page Scene Tutor mode shell without disrupting existing learning modes.

### 2026-06-01 - v2 Scene Tutor / Step 4.2 Scene Tutor in-page mode shell

- Completed:
  - Extended the scene learning page mode id union with `sceneTutor`.
  - Wired the Scene Tutor entry into the existing in-tab `onEntryTap` flow.
  - Added a Scene Tutor mode shell that shows the empty state and the two task entry titles.
  - Kept Scene Tutor navigation inside the Learn tab with the same topbar back behavior used by existing modes.
  - Preserved Memory, Listen + Spell, and Listen + Speak mode entry behavior.
- Verification:
  - User validated Step 4.2 in WeChat DevTools.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 58 test files, 295 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 4.3 needs the Ask AI panel shell inside Scene Tutor.
  - Step 4.4 needs the Make Sentences panel shell inside Scene Tutor.

### 2026-06-01 - v2 Scene Tutor / Step 4.3 Scene Tutor home rendering

- Completed:
  - Rendered the Scene Tutor home panel with the current scene name, Scene Tutor title, empty-state text, and two task cards.
  - Reworked the task cards into full-width stacked cards for Ask AI and Make Sentences.
  - Added page-model action data for the task cards instead of hardcoding the two card titles in WXML.
  - Kept Step 4.3 scoped to the Scene Tutor home view without adding task input panels.
- Verification:
  - User moved past Step 4.3 and requested the next Scene Tutor implementation step.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 58 test files, 302 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 5.1 needs the Ask AI input area, recommended question chips, and empty-input submit guarding.

### 2026-06-01 - v2 Scene Tutor / Step 5.1 Ask AI input and recommended questions

- Completed:
  - Added Scene Tutor internal task state for the Ask AI panel.
  - Added Ask AI textarea input, 500-character limit, recommended question chips, and an Ask submit button.
  - Disabled the Ask submit button for empty or whitespace-only input.
  - Made recommended question chips fill the input instead of submitting immediately, so users can edit before asking.
  - Kept this step scoped to input setup only; no cloud function request is sent in Step 5.1.
- Verification:
  - User validated Step 5.1 and requested the next step.
  - TypeScript miniprogram config passed.
  - TypeScript test config passed.
  - ESLint passed.
  - Prettier check passed.
  - Vitest passed: 58 test files, 304 tests.
  - `git diff --check` passed with only Windows CRLF warnings.
- Remaining:
  - Step 5.2 needs Ask AI submit to build a Scene Tutor payload, call `sceneTutorCloudService`, and expose loading / success / failure state on the page.

### 2026-06-02 - Memory mode hint button removal and hotspot rendering cleanup

- Completed:
  - Removed the Memory mode `提示一下` hint button after repeated WeChat DevTools repaint flicker during hint activation.
  - Removed the related page state and handler: `memoryHintWordId`, `memoryHintButtonLabel`, `memoryHintButtonDisabled`, and `onShowMemoryHint`.
  - Kept the `单词清单` button as the only Memory assist control.
  - Kept the whole clickable hotspot highlight style for the one-time Memory onboarding guide.
  - Kept ordinary Memory, Listen + Spell, and Listen + Speak hotspot overlays visually transparent by default.
  - Rendered the Memory scene image as a normal view background to avoid native image repaint flicker in the Memory hotspot layer.
  - Added regression coverage so the hint button feature and its dead state do not return.
- Verification:
  - User validated the removal and requested commit.
  - Focused Vitest passed: `tests/sceneMemoryHotspots.test.ts` with 10 tests.
  - Full typecheck, lint, format check, and full test suite were not run by Codex per the updated project rule; the user will run those checks separately.
- Remaining:
  - Continue with v2 Scene Tutor Step 5.2 when the user requests the next implementation step.

### 2026-06-02 - v2 Scene Tutor active-plan documentation alignment

- Completed:
  - Updated `AGENTS.md` so the current implementation source of truth is `memory-bank/implementation-plan-v2-scene-tutor.md`, not the historical v1/MVP `implementation-plan.md`.
  - Clarified that current available learning scenes are `Classroom` and `Lecture Hall`, while `Dormitory` and `Cafeteria` remain coming soon.
  - Added current-track notes to `progress.md`, `architecture.md`, `tech-stack.md`, `design-document.md`, `ui-notes.md`, `implementation-plan.md`, and `implementation-plan-v2-scene-tutor.md`.
  - Recorded that full typecheck, lint, format check, and full test suite are run by the user unless explicitly requested; Codex may run focused checks for current changes.
  - Marked `memory-bank/implementation-plan.md` as a historical v1/MVP baseline so it no longer drives “next step” decisions.
- Verification:
  - Documentation-only update; no code checks were run.
- Remaining:
  - Continue with v2 Scene Tutor Step 5.2 when the user requests implementation work.

### 2026-06-02 - v2 Scene Tutor / Step 5.2 Ask AI submit cloud call

- Completed:
  - Wired Ask AI submit to `buildSceneTutorRequestPayload` with task `ask`, current `sceneId`, trimmed query, and no selected words.
  - Called `sceneTutorCloudService.requestSceneTutor` from the Scene Tutor Ask AI page state.
  - Added page states for loading, successful Ask AI result, and retryable failure.
  - Preserved the user's Ask AI input after cloud function failure so the same question can be retried.
  - Added a visible `Try again` action in the Ask AI error state, reusing the same submit handler.
  - Kept Make Sentences controls out of this step.
- Verification:
  - User validated Step 5.2 in WeChat DevTools.
  - Focused Vitest passed: `tests/sceneTutorPromptService.test.ts`, `tests/sceneTutorCloudService.test.ts`, `tests/sceneTutorPage.test.ts`, and `tests/sceneTutorCopy.test.ts`.
  - Focused Vitest result: 4 test files, 20 tests passed.
  - Full typecheck, lint, format check, and full test suite were not run by Codex per the updated project rule; the user will run those checks separately.
- Remaining:
  - Step 5.3 needs the Ask AI result card to render Answer, Useful example, Related words, and Based on source information.

### 2026-06-02 - v2 Scene Tutor / Step 5.3 Ask AI structured result card and CloudBase runtime fix

- Completed:
  - Replaced the compact Ask AI success preview with a structured result card.
  - Rendered Ask AI result sections for `Answer`, `Useful example`, `Related words`, and `Based on`.
  - Added `createSceneTutorAskResultCard` to normalize related words and source labels for display.
  - Mapped source word ids / English labels back to user-facing word labels when possible.
  - Added a fallback source label using the current scene name when the provider returns no `basedOn` values.
  - Added `cloudfunctionRoot: "cloudfunctions/"` to the project configuration so WeChat DevTools recognizes the CloudBase cloud function root.
  - Replaced the cloud function provider default request path from global `fetch` to a Node 16-compatible `node:https` request helper.
  - Added sanitized provider diagnostics for request failures without logging the model API key.
  - Guided CloudBase deployment and environment variable setup for `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
- Verification:
  - User validated the successful Ask AI card in WeChat DevTools after deploying `sceneTutor` and setting provider environment variables.
  - Focused Vitest passed for Step 5.3 UI coverage: `tests/sceneTutorPage.test.ts`, `tests/sceneTutorCopy.test.ts`, `tests/sceneTutorPromptService.test.ts`, and `tests/sceneTutorCloudService.test.ts`.
  - Focused Vitest result for Step 5.3 UI coverage: 4 test files, 22 tests passed.
  - Focused Vitest passed for CloudBase provider/runtime coverage: `tests/cloudSceneTutorProvider.test.ts`, `tests/cloudSceneTutorFunction.test.ts`, and `tests/cloudSceneTutorResponseParser.test.ts`.
  - Focused Vitest result for CloudBase provider/runtime coverage: 3 test files, 19 tests passed before diagnostics, then 2 test files, 15 tests passed after sanitized diagnostics.
  - Full typecheck, lint, format check, and full test suite were not run by Codex per the updated project rule; the user will run those checks separately.
- Remaining:
  - Step 6.1 needs the Make Sentences panel input and word-selection shell.
