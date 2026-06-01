# SceneEnglish v2 Scene Tutor 实施计划

> 面向对象：AI 开发者  
> 输入依据：`memory-bank/prd-v2-scene-tutor.md`、`memory-bank/design-document.md`、`memory-bank/tech-stack.md`、`memory-bank/architecture.md`、`memory-bank/progress.md`  
> 目标：实现基于 CloudBase 云函数、真实 LLM API 和轻量 RAG context 的 Scene Tutor 场景 AI 助教。  
> 约束：每一步都小而具体；每一步完成后必须验证；用户验证通过后再记录进度并建议 commit。

---

## 0. 总体原则

1. 严格保留现有微信小程序原生框架和 TypeScript 技术栈。
2. Scene Tutor 是 v2 新增能力，不替代现有 Memory、Listen + Spell、Listen + Speak、Favorites、Mistakes 和 Me 流程。
3. v2 首期只实现 `Ask AI` 和 `Make Sentences`，不实现 `Quiz Me`。
4. v2 不接真实 ASR，不改动现有 mock 口语识别闭环。
5. Scene Tutor 覆盖所有已开放场景：Classroom 和 Lecture Hall。
6. Dormitory 和 Cafeteria 仍为 coming soon，不提供可用 Scene Tutor 入口。
7. 不做泛聊天机器人；回答必须围绕当前场景词汇、Useful expression 和本地学习记录。
8. 小程序端不得保存、硬编码或传递模型 API key。
9. 模型 API key 只能通过 CloudBase 云函数环境变量或云端配置保存。
10. v2 首期默认使用 `deepseek-v4-flash`，但代码仍通过 OpenAI-compatible provider 抽象保留后续切换空间。
11. RAG v2 使用轻量关键词检索和学习状态加权，不引入向量数据库。
12. 每个 Step 先完成自动化验证和必要的微信开发者工具人工验证，再进入下一步。
13. 每完成一个 Step 并经用户验证后，更新 `memory-bank/progress.md`。
14. 新增关键模块或文件后，更新 `memory-bank/architecture.md`。
15. 不未经批准新增依赖或运行 install 类命令。
16. 不扩大 v2 范围，不顺手实现 Quiz Me、真实 ASR、上传识别或账号体系。

## 0.1 已确认实施决策

- CloudBase：v2 现在就按真实 CloudBase 云函数链路开发。
- LLM：首期使用 `deepseek-v4-flash`。
- Provider：使用 OpenAI-compatible provider 抽象，避免把具体模型厂商写死在页面层。
- 页面形态：Scene Tutor 放在现有 `miniprogram/pages/scene/` 内联模式中，和 Memory / Listen + Spell / Listen + Speak 一样在 Learn tab 内切换。
- RAG 数据流：小程序端基于当前场景、本地词表、收藏、错题和已学进度构建轻量 RAG context，再传给云函数。
- 云函数：允许新增顶层 `cloudfunctions/sceneTutor/` 目录。
- 密钥配置：`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` 只在 CloudBase 环境变量中配置，不进入 Git。
- 联调顺序：`LLM_BASE_URL` 和真实 API key 不阻塞主体功能开发；它们只影响最后真实模型联调。

---

## 1. 预计文件结构

### 1.1 小程序端新增或更新文件

| 文件路径 | 作用 |
|---|---|
| `miniprogram/types/index.ts` | 补充 Scene Tutor 任务、请求、响应、RAG context 和本地状态类型 |
| `miniprogram/services/sceneTutorContextService.ts` | 从当前场景词表、收藏、错题和进度中构建 Scene Tutor 学习摘要 |
| `miniprogram/services/sceneTutorRetrievalService.ts` | 轻量关键词检索与学习状态加权，返回 matched words |
| `miniprogram/services/sceneTutorPromptService.ts` | 生成云函数所需的任务 payload 和前端兜底提示信息 |
| `miniprogram/services/sceneTutorCloudService.ts` | 封装 `wx.cloud.callFunction`，调用 CloudBase `sceneTutor` 云函数 |
| `miniprogram/utils/sceneTutorCopy.ts` | Scene Tutor 用户可见文案、错误提示和推荐问题 |
| `miniprogram/pages/scene/scene.ts` | 增加 Scene Tutor 模式状态、入口处理、Ask AI 和 Make Sentences 交互 |
| `miniprogram/pages/scene/scene.wxml` | 渲染 Scene Tutor 入口、Ask AI 面板、Make Sentences 面板和结果卡片 |
| `miniprogram/pages/scene/scene.wxss` | Scene Tutor 入口、表单、结果卡片、loading/error 状态样式 |
| `miniprogram/pages/scene/sceneViewModel.ts` | 场景页模型补充 Scene Tutor 入口和场景可用状态 |

### 1.2 云函数新增文件

| 文件路径 | 作用 |
|---|---|
| `cloudfunctions/sceneTutor/package.json` | CloudBase 云函数包配置 |
| `cloudfunctions/sceneTutor/index.js` | 云函数入口，校验请求、构建 prompt、调用 provider、返回结构化结果 |
| `cloudfunctions/sceneTutor/promptBuilder.js` | 根据 task 和 RAG context 构建模型 prompt |
| `cloudfunctions/sceneTutor/providers/llmProvider.js` | LLM provider 抽象和默认 provider 选择 |
| `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js` | OpenAI-compatible HTTP API 适配器，支持后续替换模型厂商 |
| `cloudfunctions/sceneTutor/responseParser.js` | 解析和校验模型 JSON 输出，失败时返回安全兜底结构 |
| `cloudfunctions/sceneTutor/guardrails.js` | 输入长度、任务类型、场景边界和偏离场景的基础校验 |

### 1.3 测试文件

| 文件路径 | 作用 |
|---|---|
| `tests/sceneTutorContextService.test.ts` | 验证场景上下文和学习摘要构建 |
| `tests/sceneTutorRetrievalService.test.ts` | 验证关键词检索、当前场景过滤和学习状态加权 |
| `tests/sceneTutorPromptService.test.ts` | 验证前端传给云函数的 payload 不包含 API key 和多余原始缓存 |
| `tests/sceneTutorCloudService.test.ts` | 验证云函数调用封装、成功返回和失败兜底 |
| `tests/sceneTutorPage.test.ts` | 验证 Scene Tutor 入口、Ask AI、Make Sentences 的页面结构和状态 |
| `tests/cloudSceneTutorFunction.test.ts` | 使用 Node 单元测试覆盖云函数 guardrails、prompt builder 和 response parser |

### 1.4 文档更新

| 文件路径 | 作用 |
|---|---|
| `memory-bank/progress.md` | 每个 Step 用户验证通过后追加进度 |
| `memory-bank/architecture.md` | 新增 Scene Tutor 架构、文件职责、云函数和 RAG 数据流 |
| `memory-bank/ui-notes.md` | 记录 Scene Tutor 后续 UI 精修项 |

---

## 2. 阶段 0：实施前确认与环境准备

### Step 0.1 确认 CloudBase 和模型 API 前置条件

任务：

- 确认微信开发者工具当前项目已启用或可启用云开发。
- 确认用户可以创建 CloudBase 环境，并愿意在 v2 阶段使用真实云函数链路。
- 确认首期真实模型为 `deepseek-v4-flash`。
- 确认小程序端只依赖统一云函数，不直接绑定模型 API。
- 确认云函数环境变量命名：
  - `LLM_API_KEY`
  - `LLM_BASE_URL`
  - `LLM_MODEL`
- 确认 `LLM_MODEL` 在 CloudBase 环境变量中配置为 `deepseek-v4-flash`。
- 确认 `LLM_BASE_URL` 在真实联调阶段由用户根据所使用平台复制到 CloudBase 环境变量中；主体开发阶段不需要真实 base URL。
- 确认开发阶段不把真实 API key 写入任何 Git 跟踪文件。

验证：

- 在微信开发者工具中确认云开发入口可用。
- 人工确认 `.gitignore` 不会提交任何本地密钥文件。
- 人工确认 v2 PRD 和本计划均明确首期模型为 `deepseek-v4-flash`，同时保留 provider 可替换性。

完成标准：

- 可以开始编写不含密钥的云函数和小程序调用逻辑；真实 `LLM_API_KEY` 和 `LLM_BASE_URL` 留到 CloudBase 联调阶段配置。

### Step 0.2 检查当前工作区和质量命令

任务：

- 检查 Git 工作区状态，确认当前改动只包含 v2 PRD 和即将新增的实施计划。
- 运行现有自动化检查，确认开始前项目是绿色状态。

验证命令：

```powershell
.\.tools\node-v24.11.1-win-x64\npm.cmd run typecheck
.\.tools\node-v24.11.1-win-x64\npm.cmd run lint
.\.tools\node-v24.11.1-win-x64\npm.cmd run format:check
.\.tools\node-v24.11.1-win-x64\npm.cmd test
```

完成标准：

- 自动化检查通过。
- 如存在与 v2 无关的未提交改动，先向用户说明，不擅自回滚。

---

## 3. 阶段 1：Scene Tutor 类型和本地 RAG 基础

### Step 1.1 定义 Scene Tutor 领域类型

任务：

- 在 `miniprogram/types/index.ts` 中新增 Scene Tutor 类型。
- 覆盖以下概念：
  - task：`ask`、`generate_sentence`、`generate_paragraph`、`generate_dialogue`
  - matched word
  - learning signals
  - RAG context
  - 云函数请求 payload
  - Ask AI 响应
  - Make Sentences 响应
  - 错误状态
- 不把页面 UI 状态和业务请求类型混在一起。

建议类型命名：

```ts
export type SceneTutorTask =
  | "ask"
  | "generate_sentence"
  | "generate_paragraph"
  | "generate_dialogue";

export type SceneTutorMatchedWord = {
  id: string;
  sceneId: string;
  en: string;
  cn: string;
  phonetic: string;
  expressionEn: string;
  expressionCn: string;
  isFavorite: boolean;
  mistakeTypes: MistakeType[];
  isLearned: boolean;
};

export type SceneTutorLearningSignals = {
  favoriteWordIds: string[];
  mistakeWordIds: string[];
  learnedWordIds: string[];
  learnedCount: number;
  totalWordCount: number;
};

export type SceneTutorContext = {
  scene: Pick<Scene, "id" | "nameEn" | "nameCn" | "wordCount">;
  task: SceneTutorTask;
  query: string;
  selectedWordIds: string[];
  matchedWords: SceneTutorMatchedWord[];
  learningSignals: SceneTutorLearningSignals;
};
```

验证：

- 新增 `tests/sceneTutorContextService.test.ts` 中的类型导入 smoke case。
- 运行类型检查。

完成标准：

- Scene Tutor 后续服务可复用这些类型。

### Step 1.2 实现场景学习摘要构建服务

任务：

- 新增 `miniprogram/services/sceneTutorContextService.ts`。
- 从现有服务读取：
  - 当前场景详情；
  - 当前场景词表；
  - 收藏词；
  - 错题词和错误类型；
  - 当前场景学习进度。
- 输出 `SceneTutorLearningSignals`。
- 对未知 sceneId 返回明确不可用结果，不抛出页面不可控异常。

验证：

- 新增 `tests/sceneTutorContextService.test.ts`。
- 覆盖 Classroom 和 Lecture Hall。
- 覆盖收藏、错题、已学词都为空的情况。
- 覆盖收藏和错题存在时能正确进入 signals。

完成标准：

- 可以为当前可学习场景生成轻量学习摘要。

### Step 1.3 实现轻量 RAG 检索服务

任务：

- 新增 `miniprogram/services/sceneTutorRetrievalService.ts`。
- 支持按以下字段匹配：
  - 英文单词；
  - 中文释义；
  - Useful expression 英文；
  - Useful expression 中文。
- 检索只在当前 sceneId 的词表内进行。
- 收藏词、错题词、已学词获得轻量加权。
- 无命中时返回当前场景中 3-5 个推荐词作为兜底上下文。
- 每次最多返回 5 个 matched words，控制 token 大小。

验证：

- 新增 `tests/sceneTutorRetrievalService.test.ts`。
- 验证 `projector` 能命中 Classroom 的 projector。
- 验证 Lecture Hall 的 `stage` 不会命中 Classroom 词。
- 验证收藏或错题词在同等匹配下排序更靠前。
- 验证无命中时返回当前场景兜底词。

完成标准：

- RAG context 可以稳定生成 matched words，且不跨场景污染。

### Step 1.4 实现 Scene Tutor payload 构建服务

任务：

- 新增 `miniprogram/services/sceneTutorPromptService.ts`。
- 接收 task、sceneId、query、selectedWordIds。
- 调用 context service 和 retrieval service。
- 输出云函数请求 payload。
- payload 中不得包含：
  - API key；
  - 完整本地缓存原始结构；
  - 无关用户隐私字段；
  - 全量跨场景词库。

验证：

- 新增 `tests/sceneTutorPromptService.test.ts`。
- 验证 Ask AI payload 包含 task、scene、query、matchedWords、learningSignals。
- 验证 Make Sentences payload 包含 selectedWordIds。
- 验证 payload 不包含 `apiKey`、`LLM_API_KEY`、`providerKey` 等字段。

完成标准：

- 小程序端可以安全构建调用云函数所需的最小上下文。

---

## 4. 阶段 2：CloudBase 云函数和 LLM Provider

### Step 2.1 创建云函数基础结构

任务：

- 新增 `cloudfunctions/sceneTutor/`。
- 新增 `package.json`、`index.js`、`guardrails.js`、`promptBuilder.js`、`responseParser.js`。
- 暂不写入真实 API key。
- `index.js` 先支持本地单元测试导入核心处理函数。

验证：

- 新增 `tests/cloudSceneTutorFunction.test.ts`。
- 验证云函数能识别合法 task。
- 验证非法 task 返回结构化错误。
- 验证 query 过长时返回结构化错误。

完成标准：

- 云函数目录存在，核心逻辑可被本地测试覆盖。

### Step 2.2 实现云函数 guardrails

任务：

- 在 `guardrails.js` 中实现请求校验。
- 校验内容：
  - `task` 必须属于 v2 支持范围；
  - `scene.id` 必须存在；
  - `query` 长度不超过 500 字符；
  - `matchedWords` 最多 5 个；
  - Make Sentences 的 selected words 最多 5 个；
  - 请求体不得包含疑似 API key 字段。
- 对偏离场景的请求不在 guardrails 层直接调用模型，可返回 `out_of_scope` 状态或让 prompt 限制回答。

验证：

- `tests/cloudSceneTutorFunction.test.ts` 覆盖合法输入、非法 task、过长 query、过多 matched words。

完成标准：

- 云函数可以在调用模型前过滤明显不合规请求。

### Step 2.3 实现 prompt builder

任务：

- 在 `promptBuilder.js` 中按任务类型构建 prompt。
- Ask AI prompt 要求：
  - 只围绕当前场景；
  - 优先使用 matched words；
  - 输出 JSON；
  - 简洁解释；
  - 包含 example、relatedWords、basedOn。
- Make Sentences prompt 要求：
  - 根据生成类型输出句子、短段落或小对话；
  - 优先使用 selected words；
  - 输出 JSON；
  - 包含 generatedText、keyWordsUsed、chineseHelp、trySaying。

验证：

- 单元测试确认 ask prompt 包含 scene name、matched words 和 JSON 输出要求。
- 单元测试确认 generate prompt 包含 generation task、selected words 和输出字段要求。
- 单元测试确认 prompt 不包含 API key 环境变量值。

完成标准：

- 云函数可为两类 v2 核心任务生成稳定 prompt。

### Step 2.4 实现 OpenAI-compatible provider 抽象

任务：

- 新增 `cloudfunctions/sceneTutor/providers/llmProvider.js`。
- 新增 `cloudfunctions/sceneTutor/providers/openaiCompatibleProvider.js`。
- 使用环境变量读取：
  - `LLM_API_KEY`
  - `LLM_BASE_URL`
  - `LLM_MODEL`
- 默认期望 `LLM_MODEL=deepseek-v4-flash`。
- `LLM_BASE_URL` 不在代码中写死，由用户在 CloudBase 环境变量中按实际 API 平台配置。
- 使用 OpenAI-compatible chat completions 格式，便于接入不同厂商的兼容接口。
- 网络失败、401、429、5xx 都返回结构化 provider error。

验证：

- 单元测试使用 mock fetch 或注入 request 函数，不真实调用外网。
- 验证缺少环境变量时返回 `provider_not_configured`。
- 验证 provider 成功时返回模型文本。
- 验证 provider 失败时不泄露 API key。

完成标准：

- 云函数具备可替换的 LLM provider 层。

### Step 2.5 实现 response parser 和兜底

任务：

- 在 `responseParser.js` 中解析模型返回。
- 优先解析 JSON。
- 如果模型返回普通文本，转为可展示的结构化 fallback。
- 如果字段缺失，补齐为空数组或空字符串，不让前端崩溃。
- 如果内容不可用，返回 `model_response_invalid`。

验证：

- 单元测试覆盖合法 Ask AI JSON。
- 单元测试覆盖合法 Make Sentences JSON。
- 单元测试覆盖普通文本 fallback。
- 单元测试覆盖坏 JSON。

完成标准：

- 前端始终收到可判断的结构化结果或结构化错误。

### Step 2.6 云函数端到端本地测试

任务：

- 在 `tests/cloudSceneTutorFunction.test.ts` 中模拟完整请求。
- 注入 fake provider 返回固定 JSON。
- 验证云函数 handler 返回 Ask AI 和 Make Sentences 结果。

验证：

- 运行 Vitest，云函数测试通过。
- 不依赖真实 API key。

完成标准：

- 云函数核心逻辑在本地测试中闭环。

---

## 5. 阶段 3：小程序端云函数调用服务

### Step 3.1 初始化小程序云能力

任务：

- 检查 `miniprogram/app.ts` 是否已初始化 `wx.cloud`。
- 如未初始化，按微信小程序云开发要求添加 `wx.cloud.init`。
- 初始化配置不写死生产环境敏感信息。
- 如果需要 env id，由用户提供并只写入安全的项目配置方式；不在公开文档中记录真实密钥。

验证：

- 微信开发者工具编译通过。
- TypeScript 检查通过。
- 云能力不可用时页面不会启动崩溃。

完成标准：

- 小程序具备调用 CloudBase 云函数的基础能力。

### Step 3.2 实现 Scene Tutor 云函数调用服务

任务：

- 新增 `miniprogram/services/sceneTutorCloudService.ts`。
- 封装 `wx.cloud.callFunction({ name: "sceneTutor", data })`。
- 提供 `requestSceneTutor(payload)`。
- 处理成功、失败、超时和返回格式异常。
- 将云函数错误转换为用户侧可处理状态。

验证：

- 新增 `tests/sceneTutorCloudService.test.ts`。
- mock `wx.cloud.callFunction` 成功返回 Ask AI。
- mock `wx.cloud.callFunction` 成功返回 Make Sentences。
- mock 调用失败，确认返回 `unavailable` 类错误。
- 验证 service 不接收或不传递 API key 字段。

完成标准：

- 页面层不直接调用 `wx.cloud.callFunction`，统一通过 service。

### Step 3.3 实现 Scene Tutor 文案工具

任务：

- 新增 `miniprogram/utils/sceneTutorCopy.ts`。
- 集中维护：
  - Scene Tutor 标题；
  - Ask AI 推荐问题；
  - Make Sentences 类型文案；
  - loading 文案；
  - error 文案；
  - out-of-scope 文案；
  - empty state 文案。
- 用户可见文案不出现 prompt、RAG、API、token、provider、key 等技术词。

验证：

- 新增或扩展 `tests/sceneTutorPage.test.ts` / `tests/feedbackCopy.test.ts`。
- 检查用户可见页面源码不出现敏感技术文案。

完成标准：

- Scene Tutor 用户反馈文案集中管理。

---

## 6. 阶段 4：Scene Tutor 页面入口和模式状态

### Step 4.1 在场景页加入 Scene Tutor 入口

任务：

- 修改 `miniprogram/pages/scene/sceneViewModel.ts`。
- 让 available 场景返回 Scene Tutor 可用状态。
- 修改 `scene.wxml`，在场景学习页加入 `AI 助教 / Scene Tutor` 入口。
- 入口包含 `Ask AI` 和 `Make Sentences` 两个能力提示。
- Dormitory / Cafeteria 不展示可用入口。

验证：

- 新增 `tests/sceneTutorPage.test.ts`。
- 验证 Classroom 和 Lecture Hall 可见入口。
- 验证 coming soon 场景不可见可用入口。
- 微信开发者工具中手动查看入口不遮挡现有模式入口。

完成标准：

- 用户可以从当前已开放场景进入 Scene Tutor。

### Step 4.2 扩展 Scene 页面模式状态

任务：

- 修改 `miniprogram/pages/scene/scene.ts`。
- 在现有内部模式切换基础上新增 Scene Tutor 模式。
- 支持从场景首页进入：
  - `sceneTutorHome`
  - `sceneTutorAsk`
  - `sceneTutorMake`
- 支持返回场景首页。
- 进入其他学习模式时清理 Scene Tutor 临时输入和 loading 状态。

验证：

- 页面状态测试覆盖进入和退出 Scene Tutor。
- 手动验证不会影响 Memory、Listen + Spell、Listen + Speak 原有入口。

完成标准：

- Scene Tutor 作为 Learn tab 内部模式稳定运行，不破坏底部 tabBar。

### Step 4.3 渲染 Scene Tutor 首页

任务：

- 修改 `scene.wxml` 和 `scene.wxss`。
- 渲染当前场景名称、Scene Tutor 标题、两个能力卡片。
- 卡片文案简洁，不使用开发说明。
- 样式沿用浅色、圆角、蓝橙点缀方向。

验证：

- `tests/sceneTutorPage.test.ts` 检查结构。
- 微信开发者工具切换 Classroom 和 Lecture Hall 查看场景名正确。

完成标准：

- Scene Tutor 首页可用，视觉上属于现有场景学习页的一部分。

---

## 7. 阶段 5：Ask AI 功能

### Step 5.1 实现 Ask AI 输入和推荐问题

任务：

- 在 `scene.ts` 中新增 Ask AI 输入状态。
- 在 `scene.wxml` 中渲染输入框、推荐问题 chips 和提交按钮。
- 推荐问题从 `sceneTutorCopy.ts` 获取。
- 输入为空时禁用提交。
- 点击推荐问题后填入输入框或直接提交，具体选择保持一致：建议点击后填入输入框，用户可再编辑。

验证：

- 页面测试覆盖推荐问题渲染。
- 页面测试覆盖空输入禁用提交。
- 手动验证输入框在移动端不被按钮遮挡。

完成标准：

- 用户可以自然提出 Ask AI 问题。

### Step 5.2 接入 Ask AI payload 构建和云函数调用

任务：

- Ask AI 提交时调用 `sceneTutorPromptService` 构建 payload。
- 再调用 `sceneTutorCloudService.requestSceneTutor`。
- 展示 loading 状态。
- 成功后保存 Ask AI 结果到页面状态。
- 失败后展示可重试错误。

验证：

- 单元测试 mock prompt service 和 cloud service。
- 验证提交后进入 loading。
- 验证成功后渲染 answer。
- 验证失败后保留用户输入并允许重试。

完成标准：

- Ask AI 完成从输入到云函数结果展示的链路。

### Step 5.3 渲染 Ask AI 结果卡片

任务：

- 渲染结构：
  - Answer；
  - Useful example；
  - Related words；
  - Based on。
- Related words 和 Based on 只展示可读词，不展示内部 id 作为主文本。
- 如果 basedOn 为空，显示当前场景作为来源。

验证：

- 页面测试覆盖完整 Ask AI 结果。
- 页面测试覆盖 relatedWords 为空时的展示。
- 手动验证长英文不溢出。

完成标准：

- Ask AI 结果清晰可读，且体现基于场景词汇的来源感。

---

## 8. 阶段 6：Make Sentences 功能

### Step 6.1 实现生成类型选择

任务：

- 在 Make Sentences 页面渲染三种类型：
  - Single sentence
  - Short paragraph
  - Mini dialogue
- 默认选择 Single sentence。
- 类型切换只改变 task，不清空已选词。

验证：

- 页面测试覆盖三种类型渲染。
- 页面测试覆盖切换类型后 task 更新。

完成标准：

- 用户可以明确选择想生成的内容类型。

### Step 6.2 实现场景词选择

任务：

- 展示当前场景词表中的词 chip。
- 用户最多选择 5 个词。
- 已选择词有明确选中状态。
- 超过 5 个时给轻提示，不继续追加。
- 支持清空选择。

验证：

- 页面测试覆盖 Classroom 和 Lecture Hall 词 chip 来自当前场景。
- 页面测试覆盖最多选择 5 个。
- 手动验证 chip 在移动端可换行且不挤压。

完成标准：

- 用户可以基于当前场景选择词生成表达。

### Step 6.3 实现未选择词时的自动场景生成

任务：

- 用户未选择词时允许点击 Generate。
- payload 中 selectedWordIds 为空。
- retrieval service 根据当前场景和学习状态选择 3-5 个词。
- 生成按钮文案可使用 `Generate with this scene`。

验证：

- 单元测试覆盖 selectedWordIds 为空时仍能构建 payload。
- 手动验证不选词也能发起生成。

完成标准：

- Make Sentences 支持基于整个当前场景生成描述。

### Step 6.4 接入 Make Sentences 云函数调用

任务：

- 提交时根据生成类型映射 task：
  - Single sentence -> `generate_sentence`
  - Short paragraph -> `generate_paragraph`
  - Mini dialogue -> `generate_dialogue`
- 调用 payload service 和 cloud service。
- 展示 loading、成功和失败状态。

验证：

- 测试覆盖三种生成类型的 task 映射。
- 测试覆盖成功返回 generatedText。
- 测试覆盖失败后保留已选词和生成类型。

完成标准：

- Make Sentences 完成从选择词到生成结果展示的链路。

### Step 6.5 渲染 Make Sentences 结果卡片

任务：

- 渲染：
  - Generated text；
  - Key words used；
  - Chinese help；
  - Try saying。
- 小对话文本需要保留换行。
- 不提供“写入正式词库”操作。

验证：

- 页面测试覆盖单句结果。
- 页面测试覆盖小对话换行。
- 页面测试确认没有自动入库按钮或文案。

完成标准：

- 生成结果可读、可练习，并和正式词库保持边界。

---

## 9. 阶段 7：异常处理、安全边界和体验兜底

### Step 7.1 前端输入限制

任务：

- Ask AI 输入限制 500 字符。
- 自由输入词限制 100 字符。
- Make Sentences 最多选择 5 个词。
- 输入超限时显示轻提示。

验证：

- 页面测试覆盖超长输入。
- 手动验证提示不遮挡主操作。

完成标准：

- 用户侧不会轻易提交过大请求。

### Step 7.2 偏离场景问题处理

任务：

- 对明显空泛问题或无关问题，前端仍可提交给云函数，但云函数 guardrails/prompt 应返回场景边界提醒。
- 页面渲染 out-of-scope 状态时，引导用户问当前场景物品、词义区别或造句需求。

验证：

- 云函数测试覆盖 out-of-scope 响应。
- 页面测试覆盖 out-of-scope 展示。

完成标准：

- Scene Tutor 不退化为泛聊天入口。

### Step 7.3 云函数失败和超时兜底

任务：

- 前端展示统一错误：
  - AI Tutor is temporarily unavailable.
  - Please try again.
- 保留用户输入或已选词。
- 提供重试按钮。
- 不展示云函数错误堆栈、provider 名称、状态码细节或 API 信息。

验证：

- `sceneTutorCloudService.test.ts` 覆盖 reject。
- 页面测试覆盖失败展示和 retry。

完成标准：

- AI 服务不可用时不影响用户继续使用原有学习功能。

### Step 7.4 用户可见技术词扫描

任务：

- 检查 Scene Tutor 相关 WXML、TS 文案和 copy util。
- 确保用户可见文案不包含：
  - RAG
  - prompt
  - token
  - API key
  - provider
  - mock
  - stack

验证：

- 新增测试或脚本式断言扫描主要用户可见文件。
- 人工走查 Scene Tutor 页面。

完成标准：

- 用户看到的是正式产品能力，而不是技术调试界面。

---

## 10. 阶段 8：CloudBase 部署和真实 API 联调

### Step 8.1 配置 CloudBase 环境变量

任务：

- 在 CloudBase 控制台配置：
  - `LLM_API_KEY`
  - `LLM_BASE_URL`
  - `LLM_MODEL=deepseek-v4-flash`
- `LLM_BASE_URL` 由用户从实际 API 平台复制粘贴到 CloudBase 环境变量；该值不影响主体功能开发，只影响真实模型联调。
- 不在 Git 文件中记录真实值。
- 在本地文档中只记录变量名和用途。

验证：

- 用户在 CloudBase 控制台确认变量存在。
- 云函数日志中不打印 API key。

完成标准：

- 云函数具备真实模型调用配置。

### Step 8.2 部署 sceneTutor 云函数

任务：

- 使用微信开发者工具或 CloudBase 工具部署 `cloudfunctions/sceneTutor`。
- 如果当前项目未配置 CLI，不新增全局依赖；优先使用微信开发者工具云函数上传能力。
- 部署后在云函数测试面板发起一条 Ask AI 请求。

验证：

- CloudBase 云函数测试面板返回结构化结果。
- 失败时记录错误类型，不记录密钥。

完成标准：

- 云函数在云端可运行。

### Step 8.3 小程序端真实联调

任务：

- 在微信开发者工具中进入 Classroom 的 Scene Tutor。
- 提交 Ask AI 问题。
- 进入 Lecture Hall 的 Scene Tutor。
- 提交 Make Sentences 请求。
- 验证返回结果展示正常。

验证：

- Classroom Ask AI 成功。
- Lecture Hall Make Sentences 成功。
- 断网或关闭云函数时错误兜底正常。

完成标准：

- v2 核心 AI 链路在微信开发者工具中可演示。

---

## 11. 阶段 9：测试、文档和记录

### Step 9.1 运行完整自动化检查

任务：

- 运行现有质量命令。

验证命令：

```powershell
.\.tools\node-v24.11.1-win-x64\npm.cmd run typecheck
.\.tools\node-v24.11.1-win-x64\npm.cmd run lint
.\.tools\node-v24.11.1-win-x64\npm.cmd run format:check
.\.tools\node-v24.11.1-win-x64\npm.cmd test
```

完成标准：

- 全部通过。

### Step 9.2 微信开发者工具手动验收

任务：

- Classroom：
  - 进入 Scene Tutor；
  - 使用 Ask AI；
  - 使用 Make Sentences；
  - 返回 Memory / Listen + Spell / Listen + Speak，确认原有路径不受影响。
- Lecture Hall：
  - 进入 Scene Tutor；
  - 使用 Ask AI；
  - 使用 Make Sentences。
- Coming soon 场景：
  - Dormitory 和 Cafeteria 不出现可用 Scene Tutor 入口。
- 异常：
  - 模拟云函数失败，确认前端显示可重试错误。

完成标准：

- 用户验证通过后，才能记录进度并建议 commit。

### Step 9.3 更新 progress.md

任务：

- 在 `memory-bank/progress.md` 追加 v2 Scene Tutor 对应 Step 的完成记录。
- 记录：
  - 完成内容；
  - 自动化验证结果；
  - 微信开发者工具人工验证结果；
  - 遗留问题。

完成标准：

- 进度记录可供后续开发者接续。

### Step 9.4 更新 architecture.md

任务：

- 在 `memory-bank/architecture.md` 更新：
  - 当前阶段摘要；
  - Scene Tutor 模块职责；
  - 云函数职责；
  - RAG 数据流；
  - 新增文件变更记录。
- 同步修正顶部当前阶段滞后问题。

完成标准：

- 架构文档和 v2 实际实现保持一致。

### Step 9.5 更新 ui-notes.md

任务：

- 在 `memory-bank/ui-notes.md` 追加 Scene Tutor UI 精修事项：
  - AI 助教入口层级；
  - Ask AI 输入与结果卡片；
  - Make Sentences 词 chip 和生成结果；
  - loading/error 状态；
  - 移动端长英文换行。

完成标准：

- 后续统一 UI 优化时能覆盖 Scene Tutor。

---

## 12. 阶段 10：提交建议和后续路线

### Step 10.1 建议本地 commit

任务：

- 用户验证通过后，检查 Git 工作区。
- 确认只包含 v2 Scene Tutor 相关改动。
- 建议本地 commit。

建议 commit 信息：

```text
feat: add scene tutor rag assistant
```

完成标准：

- 本地提交不混入无关文件。

### Step 10.2 后续迭代记录

任务：

- 将以下内容记录为后续阶段，不在 v2 首期实现：
  - Quiz Me；
  - AI 复习计划；
  - AI 生成句子跟读；
  - 真实 ASR；
  - 调用限流；
  - 结果缓存；
  - 用户反馈按钮。

完成标准：

- v2 范围保持清晰，不因为 AI 能力扩展而失控。

---

## 13. 最终验收清单

- Classroom 和 Lecture Hall 都可进入 Scene Tutor。
- Dormitory 和 Cafeteria 不提供可用 Scene Tutor 入口。
- Ask AI 可提交问题并返回结构化回答。
- Make Sentences 可生成单句、短段落和小对话。
- RAG context 来自当前场景词表和本地学习摘要。
- 检索不跨场景污染。
- 小程序端不包含模型 API key。
- 云函数通过环境变量读取模型配置。
- 模型失败、云函数失败和网络失败都有用户可理解的兜底。
- 用户看不到 prompt、RAG、API key、provider、stack 等内部实现文案。
- 现有 Memory、Listen + Spell、Listen + Speak、Favorites、Mistakes 和 Me 路径不受影响。
- 自动化检查通过。
- 微信开发者工具人工验证通过。
- `progress.md` 和 `architecture.md` 已更新。
