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
