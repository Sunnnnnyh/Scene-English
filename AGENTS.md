# SceneEnglish Agent 使用说明

## 项目概览

SceneEnglish 是一个场景化英语单词学习微信小程序项目。MVP 聚焦教室场景，用户可以点击真实生活场景中的物品，学习对应英文单词、听发音、练习拼写，并体验基于 mock ASR 的口语识别流程。

当前项目仍处于产品规划和设计整理阶段，尚未初始化微信小程序代码工程。

## 当前目录结构

```text
D:\SceneEnglish
  AGENTS.md
  memory-bank/
    design-document.md
    tech-stack.md
    implementation-plan.md
    ui-notes.md
    progress.md
    architecture.md
  .superpowers/
```

## 核心信息来源

在进行任何产品修改或开发实现前，优先阅读以下文件：

1. `memory-bank/design-document.md`
   - 产品定位、MVP 范围、核心流程、页面设计、数据模型和验收标准。

2. `memory-bank/tech-stack.md`
   - 推荐技术栈、项目结构、服务层边界和测试策略。

3. `memory-bank/implementation-plan.md`
   - 面向 AI 开发者的分步实施计划。
   - 每一步都包含验证要求。

4. `memory-bank/ui-notes.md`
   - 当前 Figma 方向、UI 原则、已知 UI 问题和后续视觉精修清单。

5. `memory-bank/progress.md`
   - 预留文件，用于记录后续已完成的实施步骤。

6. `memory-bank/architecture.md`
   - 架构记录文件，用于说明预计目录结构、模块职责、数据流和后续每个文件的作用。

原始 PRD 文件已经删除。不要再引用 `PRD_SceneEnglish_v2.md`。

## 产品范围约束

- MVP 只有一个可学习场景：`Classroom`。
- Coming soon 场景可以展示，但不可进入：
  - `Lecture Hall`
  - `Dormitory`
  - `Cafeteria`
- 教室场景包含 20 个可点击物品和 20 个单词。
- 学习模式包括：
  - Memory
  - Listen + Spell
  - Listen + Speak
- 口语模式在 MVP 阶段使用 mock ASR。
- 真实 ASR、云端同步、多场景学习、图片上传识别、教师端、会员、排行榜、复杂间隔重复等功能不属于 MVP 范围。
- 实用表达只展示在单词卡中，不进入 MVP 阶段的练习流程。

## 技术方向

遵循 `memory-bank/tech-stack.md` 中推荐的简单但健壮的技术栈：

- 微信小程序原生框架。
- TypeScript。
- 本地 TypeScript 数据模块存储场景和单词数据。
- 使用微信本地缓存保存收藏、错题、新手引导状态和学习进度。
- 使用 service 层承载业务逻辑。
- 使用 utils 层处理热区计算、拼写标准化、本地缓存和时间工具。
- MVP 阶段使用 mock `speechService` 实现口语识别流程。
- 使用 Vitest 测试 service 和 utils。

不要引入：

- Taro 或 uni-app。
- Redux、MobX 或其他重型状态管理库。
- 自建后端。
- MVP 阶段的真实 ASR。
- 复杂 UI 组件库。
- Canvas 热区实现，除非矩形透明 view 方案无法满足需求。

## 已确认开发决策

- 小程序源码放在 `miniprogram/` 目录。
- 测试文件放在根目录 `tests/`。
- 静态资源放在 `miniprogram/assets/`，并按 `images/`、`audio/`、`icons/` 分目录。
- 场景和单词数据放在 `miniprogram/data/scenes.ts`。
- 类型定义集中放在 `miniprogram/types/index.ts`。
- 本地缓存 key 统一使用 `sceneenglish:` 前缀。
- 练习每组默认 5 题。
- 错题掌握进度按错误类型分别计算，答对 1 次为 50%，连续答对 2 次完成该类型。
- 开发阶段使用基础 UI 跑通功能，最终视觉精修后置。

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

> 先使用基础 UI 完成功能 MVP，最终视觉精修后置。

已知 UI 问题和后续精修事项见 `memory-bank/ui-notes.md`。

## 实施规则

- 除非用户明确改变方向，否则按 `memory-bank/implementation-plan.md` 顺序实施。
- 每一步都要小而具体，并且可以验证。
- 每个实施步骤完成后，必须先完成验证，再进入下一步。
- 创建代码后，需要在 `memory-bank/progress.md` 中记录已完成步骤。
- 新增文件或模块后，需要在 `memory-bank/architecture.md` 中记录其作用。
- 每完成一个 Step 后，必须提醒用户先完成验证；用户确认通过后，再更新 `progress.md` 和必要的 `architecture.md`。
- 用户验证通过并完成记录后，建议进行本地 Git commit。
- 每完成一个阶段或可演示节点后，建议 push 到 GitHub。
- 不要在用户尚未验证通过时主动进入下一步、提交或推送。
- 未经用户确认，不要扩大 MVP 范围。
- 未经用户要求，不要移动 `memory-bank` 中的核心文档。

## 文档规则

- 产品文档保持中性、专业。
- 不要在面向产品的正式文档中直接写“面试”“AIPM”“作品集”“求职”等目的性表述。
- 可以记录产品判断、AI 能力边界、MVP 取舍和内容审核流程。
- 如果项目路径发生变化，需要同步更新所有 Markdown 文件中的相关引用。

## 当前状态

已完成：

- 产品设计文档已创建。
- 技术栈建议已创建。
- 实施计划已创建。
- UI 记录文档已创建。
- 核心文档已迁移到 `memory-bank/`。
- 旧的单数协作说明文件已替换为 `AGENTS.md`。

尚未开始：

- 微信小程序项目初始化。
- TypeScript 代码工程。
- 图片和音频资源。
- services 和 utils。
- 页面和组件。
- 测试。

## 下一步建议

从 `memory-bank/implementation-plan.md` 的 Step 0.1 开始：

> 初始化微信小程序 TypeScript 项目。

每完成一个步骤后，在 `memory-bank/progress.md` 中记录进度。

## Git 工作流

- 当前 GitHub remote：`https://github.com/Sunnnnnyh/Scene-English.git`
- 当前默认分支：`main`
- 推荐节奏：每完成一个 Step 并通过用户验证后本地 commit；每完成一个阶段或可演示节点后 push 到 GitHub。
- commit 前应先检查工作区状态，确认只包含本次 Step 相关改动。
- push 前应确认本地分支已与 `origin/main` 同步，避免覆盖远端已有内容。

## 重要提示

写任何代码前必须完整阅读 `memory-bank/architecture.md`。

写任何代码前必须完整阅读 `memory-bank/design-document.md`。

每完成一个重大功能或里程碑后，必须更新 `memory-bank/architecture.md`。
