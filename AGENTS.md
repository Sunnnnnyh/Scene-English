# SceneEnglish Agent 使用说明

## 项目概览

SceneEnglish 是一个场景化英语单词学习微信小程序项目。v1/MVP 已完成以真实场景词汇学习为核心的基础闭环；当前开发主线已经切换到 v2 Scene Tutor，为已开放场景增加基于 CloudBase 云函数、真实 LLM API 和轻量 RAG context 的场景 AI 助教能力。

## 核心信息来源

在进行任何产品修改或开发实现前，优先阅读以下文件：

1. `memory-bank/design-document.md`
   - v1/MVP 产品定位、基础学习流程、页面设计、数据模型和历史验收标准。

2. `memory-bank/prd-v2-scene-tutor.md`
   - 当前 v2 Scene Tutor 的产品范围、用户流程、能力边界和验收标准。

3. `memory-bank/implementation-plan-v2-scene-tutor.md`
   - 当前正在执行的 v2 Scene Tutor 分步实施计划。
   - 后续“下一步”默认按该文件和 `progress.md` 最新 Remaining 记录判断。

4. `memory-bank/tech-stack.md`
   - 推荐技术栈、项目结构、服务层边界、CloudBase v2 补充和测试策略。

5. `memory-bank/ui-notes.md`
   - 当前 Figma 方向、UI 原则、已知 UI 问题和后续视觉精修清单。

6. `memory-bank/progress.md`
   - 记录已完成步骤、验证结果、遗留问题和当前下一步。

7. `memory-bank/architecture.md`
   - 架构记录文件，用于说明目录结构、模块职责、数据流和后续每个文件的作用。

8. `memory-bank/implementation-plan.md`
   - 历史 v1/MVP 实施计划，仅作为旧版本背景资料。
   - 除非用户明确要求回到 v1/MVP 基线，否则不要再按该文件决定下一步。

原始 PRD 文件已经删除。不要再引用 `PRD_SceneEnglish_v2.md`。

## 产品范围约束

- 当前已开放可学习场景：
  - `Classroom`
  - `Lecture Hall`
- Coming soon 场景可以展示，但不可进入：
  - `Dormitory`
  - `Cafeteria`
- `Classroom` 和 `Lecture Hall` 均应拥有各自独立的 20 个可点击物品和 20 个单词；不要把教室词表复用到阶梯教室。
- 学习模式包括：
  - Memory
  - Listen + Spell
  - Listen + Speak
- v2 Scene Tutor 作为新增学习能力存在，不替代 Memory、Listen + Spell、Listen + Speak、Favorites、Mistakes 或 Me。
- v2 Scene Tutor 首期只实现：
  - Ask AI
  - Make Sentences
- v2 Scene Tutor 首期不实现：
  - Quiz Me
  - AI 复习计划
  - AI 生成跟读
- v2 不接真实 ASR，不改变现有 mock 口语识别闭环。
- 真实 ASR、云端同步、图片上传识别、教师端、会员、排行榜、复杂间隔重复等功能不属于当前 v2 首期范围。
- 实用表达只展示在单词卡和 Scene Tutor 上下文中，不进入现有练习流程。
- 小程序端不得保存、硬编码或传递模型 API key；模型密钥只能放在 CloudBase 云函数环境变量或云端配置中。

## 技术方向

遵循 `memory-bank/tech-stack.md` 中推荐的简单但健壮的技术栈：

- 微信小程序原生框架。
- TypeScript。
- 本地 TypeScript 数据模块存储场景和单词数据。
- 使用微信本地缓存保存收藏、错题、新手引导状态和学习进度。
- 使用 service 层承载业务逻辑。
- 使用 utils 层处理热区计算、拼写标准化、本地缓存、时间工具和 Scene Tutor 可见文案。
- MVP 阶段使用 mock `speechService` 实现口语识别流程。
- v2 Scene Tutor 使用 `cloudfunctions/sceneTutor/` 作为 CloudBase 云函数边界，通过 OpenAI-compatible provider 抽象调用真实 LLM。
- v2 Scene Tutor 的 RAG 为轻量关键词检索和学习状态加权，不引入向量数据库。
- 使用 Vitest 测试 service、utils 和可本地测试的云函数核心逻辑。

不要引入：

- Taro 或 uni-app。
- Redux、MobX 或其他重型状态管理库。
- 自建后端。v2 只允许使用已确认的 CloudBase 云函数链路。
- 当前阶段的真实 ASR。
- 复杂 UI 组件库。
- Canvas 热区实现，除非矩形透明 view 方案无法满足需求。

## 已确认开发决策

- 小程序源码放在 `miniprogram/` 目录。
- 云函数源码放在 `cloudfunctions/` 目录。
- 测试文件放在根目录 `tests/`。
- 静态资源放在 `miniprogram/assets/`，并按 `images/`、`audio/`、`icons/` 分目录。
- 场景和单词数据放在 `miniprogram/data/scenes.ts`。
- 类型定义集中放在 `miniprogram/types/index.ts`。
- 本地缓存 key 统一使用 `sceneenglish:` 前缀。
- 练习每组默认 5 题。
- 错题掌握进度按错误类型分别计算，答对 1 次为 50%，连续答对 2 次完成该类型。
- 开发阶段使用基础 UI 跑通功能，最终视觉精修后置。
- Memory 模式的“提示一下”按钮已经移除；保留“单词清单”和一次性新手引导整块热区高亮。

## UI 方向

当前 UI 参考文件位于 Figma：

`https://www.figma.com/design/8eCBr0DDerWNaN8dhoTbNS/SceneEnglish`

使用页面：

`SceneEnglish Low-fi Wireframes`

不要使用已删除的 `SceneEnglish UI Concept` 页面。

UI 方向：

- 浅色系。
- 清晨蓝调氛围。
- 柔和日出橙 / 珊瑚色点缀。
- 雾白背景。
- 圆润卡片。
- 轻微深海军蓝描边。
- 整体轻快友好，但不要幼稚。

开发阶段 UI 原则：

> 先使用基础 UI 完成功能 MVP / v2 首期闭环，最终视觉精修后置。

已知 UI 问题和后续精修事项见 `memory-bank/ui-notes.md`。

## 实施规则

- 除非用户明确改变方向，否则当前开发按 `memory-bank/implementation-plan-v2-scene-tutor.md` 顺序实施。
- 判断下一步时，先读 `memory-bank/progress.md` 最新记录，再对照 `memory-bank/implementation-plan-v2-scene-tutor.md`。
- `memory-bank/implementation-plan.md` 是历史 v1/MVP 计划，不再作为当前“下一步”的来源。
- 每一步都要小而具体，并且可以验证。
- 每个实施步骤完成后，必须先完成验证，再进入下一步。
- 创建代码后，需要在 `memory-bank/progress.md` 中记录已完成步骤。
- 新增文件或模块后，需要在 `memory-bank/architecture.md` 中记录其作用。
- 每完成一个 Step 后，必须提醒用户先完成验证；用户确认通过后，再更新 `progress.md` 和必要的 `architecture.md`。
- 用户说“通过”后，先补齐 `progress.md` 和必要的 `architecture.md`，再建议或执行 commit。
- 用户验证通过并完成记录后，建议进行本地 Git commit。
- 每完成一个阶段或可演示节点后，建议 push 到 GitHub。
- 不要在用户尚未验证通过时主动进入下一步、提交或推送。
- 未经用户确认，不要扩大当前 v2 首期范围。
- 未经用户要求，不要移动 `memory-bank` 中的核心文档。
- 不要删除、跳过或削弱测试。
- 除非用户明确要求，不要主动运行完整类型检查、lint、格式检查和全量测试；这些完整检查由用户自行执行，有报错时再处理。可以运行与当前问题直接相关的最小化专项测试或检查。
- 未经批准，不要添加新依赖。
- 不要修改无关文件。
- 不确定时先询问，不要猜测。
- 使用项目已配置的包管理和脚本；不要未经批准新增依赖或运行 install 类命令。
- 不要为了小任务而进行大范围重构。
- 不要用临时兜底替代根因修复；对用户数据读取、平台异常等可预期失败可以做明确容错。
- 保持代码库干净，没有临时文件，没有死代码，没有死文件，始终保持组织化，没有不必要的文件夹、子文件夹、文件。

## 文档规则

- 产品文档保持中性、专业。
- 不要在面向产品的正式文档中直接写“面试”“AIPM”“作品集”“求职”等目的性表述。
- 可以记录产品判断、AI 能力边界、MVP / v2 取舍和内容审核流程。
- 如果项目路径发生变化，需要同步更新所有 Markdown 文件中的相关引用。

## Git 工作流

- 当前 GitHub remote：`https://github.com/Sunnnnnyh/Scene-English.git`
- 当前默认分支：`main`
- 推荐节奏：每完成一个 Step 并通过用户验证后本地 commit；每完成一个阶段或可演示节点后 push 到 GitHub。
- commit 前应先检查工作区状态，确认只包含本次 Step 相关改动。
- push 前应确认本地分支已与 `origin/main` 同步，避免覆盖远端已有内容。

## 重要提示

写任何代码前必须完整阅读 `memory-bank/architecture.md`。

写任何代码前必须完整阅读 `memory-bank/design-document.md`。

写 v2 Scene Tutor 相关代码前必须阅读 `memory-bank/prd-v2-scene-tutor.md` 和 `memory-bank/implementation-plan-v2-scene-tutor.md`。

每完成一个重大功能或里程碑后，必须更新 `memory-bank/architecture.md`。
