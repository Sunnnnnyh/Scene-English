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
