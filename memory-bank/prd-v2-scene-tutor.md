# SceneEnglish v2 PRD：Scene Tutor 场景 AI 助教

> 产品名称：SceneEnglish  
> 版本范围：v2 MVP  
> 文档目标：定义 Scene Tutor 场景 AI 助教的产品目标、功能范围、用户流程、数据与技术边界、验收标准和后续迭代方向  
> 日期：2026-06-01

---

## 1. 背景与目标

SceneEnglish v1 已完成以真实场景为入口的英语词汇学习闭环。当前已开放场景包括 Classroom 和 Lecture Hall，用户可以在场景图中点击物品学习单词，完成 Memory、Listen + Spell、Listen + Speak 三种学习模式，并通过收藏夹、错题夹和 Me 页面形成基础复习与本地学习记录。

v2 的目标是在现有场景学习闭环上加入 Scene Tutor 场景 AI 助教，让用户不仅能“认识场景中的单词”，还可以围绕当前场景继续理解、比较和使用这些词汇。Scene Tutor 不做泛聊天机器人，而是基于当前场景词库、实用表达和用户本地学习记录提供有边界的英语学习支持。

v2 MVP 聚焦两个核心任务：

1. **Ask AI**：用户围绕当前场景中的单词提问，获得词义、区别、用法和场景表达解释。
2. **Make Sentences**：用户选择或输入当前场景词汇，由 AI 生成单句、短段落或小对话，帮助用户把词汇放回真实语境中使用。

---

## 2. 用户问题

v1 已经帮助用户建立“看见物品 -> 知道英文 -> 听写说练习”的基础连接，但仍存在以下学习断点：

| 问题 | 表现 |
|---|---|
| 会认单词，但不理解细微区别 | 用户知道 `desk`、`table`、`seat` 等词，但不知道真实场景中如何区分使用 |
| 会背单词，但不会放进句子 | 用户能点击记住 `projector`，但不知道如何自然表达“调一下投影仪” |
| 实用表达数量有限 | 每个词当前只展示 1 条 Useful expression，无法覆盖用户临时产生的问题 |
| 复习资产没有转化为解释能力 | 收藏、错题和已学进度已经存在，但尚未用于生成个性化学习反馈 |
| 场景词汇之间缺少连接 | 用户按单个物品学习，较少看到多个场景词如何组合成描述或对话 |

Scene Tutor 通过受控 RAG 和结构化生成，补上“理解”和“使用”两层能力。

---

## 3. 产品定位

Scene Tutor 是 SceneEnglish 内的场景英语 AI 助教。

它的定位是：

- 基于当前场景回答英语学习问题；
- 帮助用户理解场景词汇的含义、区别和常见用法；
- 根据当前场景词汇生成可直接学习的句子、段落和小对话；
- 使用用户本地学习记录作为上下文，提供更贴近当前学习状态的反馈；
- 保持学习边界，不展开无关闲聊。

它不承担：

- 全领域英语聊天；
- 专业语法批改；
- 真实发音评分；
- 图片上传识别；
- 替代现有 Memory / Listen + Spell / Listen + Speak 练习流程；
- 自动生成未经审核的新场景学习内容并直接进入正式词库。

---

## 4. v2 MVP 范围

### 4.1 包含

- Scene Tutor 入口。
- 覆盖所有已开放场景：
  - Classroom
  - Lecture Hall
- Ask AI：
  - 回答词义、区别、用法、场景常见表达问题；
  - 回答必须优先基于当前场景词库和 Useful expression。
- Make Sentences：
  - 支持生成单句；
  - 支持生成短段落；
  - 支持生成小对话；
  - 支持用户指定当前场景内的若干单词。
- 轻量 RAG：
  - 当前场景词表；
  - 单词中文、英文、音标；
  - Useful expression；
  - 收藏记录；
  - 错题记录；
  - 已学进度摘要。
- CloudBase 云函数调用真实 LLM API：
  - API key 仅存放在云函数侧；
  - 小程序端不直接保存或传递模型 API key。
- 基础异常处理：
  - 网络失败；
  - 模型超时；
  - 无相关场景内容；
  - 内容生成失败。
- 基础安全边界：
  - 不回答明显脱离当前学习场景的问题；
  - 不展示内部 prompt、API key、技术错误堆栈。

### 4.2 不包含

- Quiz Me / AI 考考我。
- 真实 ASR 替换。
- 云端账号体系。
- 跨设备学习记录同步。
- 用户上传图片识别。
- 自动内容入库。
- 后台内容审核系统。
- 多轮开放域聊天机器人。
- 复杂向量数据库。

### 4.3 后续可扩展

- Quiz Me：基于场景词、收藏和错题生成练习题。
- AI 复习计划：根据错题类型生成复习建议。
- AI 表达跟读：围绕生成句子做听读练习。
- 内容生产工作流：辅助生成新场景候选词表和表达，并进入人工审核。
- 真 ASR 接入后，把口语识别结果交给 Scene Tutor 生成练习建议。

---

## 5. 核心用户场景

### 5.1 Ask AI：询问词义和用法

用户在 Classroom 学习时看到 `projector`，想知道它和 `screen` 的关系，于是进入 AI 助教并提问：

```text
projector 和 screen 有什么区别？
```

Scene Tutor 检索当前场景词库，找到相关词和表达，生成简洁解释：

- `projector` 是投影设备；
- `screen` 是显示投影内容的屏幕；
- 给出一个课堂场景中的自然表达；
- 如果当前场景没有 `screen`，需要说明回答基于场景语境，并避免编造词库中不存在的学习项。

### 5.2 Ask AI：询问常用词

用户在 Lecture Hall 中提问：

```text
这个场景里哪些词最常用？
```

Scene Tutor 根据当前场景词表和使用语境，给出 3-5 个高价值词，并说明为什么值得优先掌握。

### 5.3 Make Sentences：指定词造句

用户选择或输入：

```text
projector, blackboard, desk
```

Scene Tutor 生成：

- 1 个自然单句；
- 1 个短段落；
- 可选 2 人小对话。

输出应使用当前场景词汇，并保持英文为主、中文辅助解释。

### 5.4 Make Sentences：根据当前场景生成描述

用户不指定词，只点击 `Generate with this scene`。

Scene Tutor 根据当前场景词库选择 3-5 个词，生成一段简单场景描述，帮助用户把分散单词连接成完整表达。

---

## 6. 功能设计

### 6.1 Scene Tutor 入口

入口位置：

- 放在场景学习页中，与 Memory、Listen + Spell、Listen + Speak 同层或略低层级。
- 入口文案建议：
  - 中文：`AI 助教`
  - 英文能力名：`Scene Tutor`

入口展示信息：

- 当前场景名称；
- 一句功能说明，例如：`Ask about words or make sentences from this scene.`
- 两个能力入口：
  - `Ask AI`
  - `Make Sentences`

交互规则：

- 入口只在 available 场景展示。
- Dormitory、Cafeteria 等 coming soon 场景不展示可用 AI 助教入口。
- 如果云函数不可用，入口仍可展示，但进入后给出清晰不可用反馈。

### 6.2 Ask AI

目标：帮助用户围绕当前场景词汇提出自然问题，并获得简洁、可学习的回答。

输入：

- 用户自由输入问题；
- 当前 sceneId；
- 当前场景词表；
- 用户学习记录摘要。

推荐提示问题：

- `What is the difference between two words?`
- `Which words are most useful in this scene?`
- `How do I use this word in a real sentence?`
- `Can you explain this word simply?`

输出结构：

```text
Answer
Useful example
Related words
Based on
```

输出规则：

- 回答优先使用当前场景内的词。
- 如果用户问到当前场景没有的词，可以简短回答，但要提示它不在当前场景词库中。
- 不生成长篇语法课。
- 不给出不确定或无法核验的内容作为事实。
- 默认英文内容配中文辅助解释，保持学习场景友好。

### 6.3 Make Sentences

目标：帮助用户把当前场景词汇组合成可使用的句子、短段落或小对话。

输入方式：

- 用户手动输入 1-5 个当前场景词；
- 用户从当前场景词表中选择词；
- 用户不指定词，由系统根据当前场景和学习状态选择。

生成类型：

| 类型 | 输出 |
|---|---|
| Single sentence | 1-3 个自然英文句子 |
| Short paragraph | 1 段 3-5 句英文描述 |
| Mini dialogue | 2 人短对话，每人 2-3 轮 |

输出结构：

```text
Generated text
Key words used
Chinese help
Try saying
```

输出规则：

- 优先使用当前场景词汇。
- 用户指定的词必须尽量全部使用；无法自然使用时说明原因。
- 英文表达应自然、简洁、适合学习者朗读。
- 中文解释只作为辅助，不喧宾夺主。
- 不把生成内容自动写入正式词库。

---

## 7. RAG 设计

### 7.1 数据源

Scene Tutor 的上下文来自现有本地数据和用户学习记录。

| 数据源 | 用途 |
|---|---|
| 当前场景元数据 | 确定回答边界和场景名称 |
| 当前场景词表 | 作为主要检索知识库 |
| `expressionEn` / `expressionCn` | 提供真实场景表达示例 |
| 用户已学词 | 判断用户已接触内容 |
| 收藏词 | 提升用户主动关注内容的优先级 |
| 错题记录 | 提供薄弱词和错误类型上下文 |

### 7.2 检索策略

v2 MVP 使用轻量检索，不引入复杂向量数据库。

检索方式：

1. 关键词匹配：
   - 匹配英文单词；
   - 匹配中文释义；
   - 匹配 Useful expression。
2. 当前场景过滤：
   - 优先只检索当前 sceneId 下的词。
3. 学习状态加权：
   - 收藏词优先；
   - 错题词优先；
   - 已学词优先于未学词。
4. 兜底上下文：
   - 如果问题没有命中具体词，提供当前场景的高价值词摘要。

### 7.3 上下文构建

云函数调用模型前，应构建受控 context：

```json
{
  "scene": {
    "id": "classroom",
    "nameEn": "Classroom",
    "nameCn": "教室"
  },
  "task": "ask",
  "matchedWords": [
    {
      "id": "projector",
      "en": "projector",
      "cn": "投影仪",
      "phonetic": "/prəˈdʒektər/",
      "expressionEn": "The projector needs to be adjusted before everyone can see the slide clearly.",
      "expressionCn": "投影仪需要先调一下，大家才能看清幻灯片。"
    }
  ],
  "learningSignals": {
    "favorites": ["projector"],
    "mistakes": [
      {
        "wordId": "projector",
        "types": ["spelling"]
      }
    ],
    "learnedCount": 8
  }
}
```

上下文原则：

- 只传必要字段。
- 不传完整本地缓存原始结构。
- 不传用户隐私信息。
- 不传 API key 到前端。
- 控制 token 大小，避免每次传完整大段内容。

---

## 8. Agent 行为设计

Scene Tutor 是一个轻量学习 Agent，而不是单次 prompt 调用。

### 8.1 任务路由

根据用户选择的入口和输入内容，系统将任务路由为：

| 任务类型 | 触发方式 | 处理方式 |
|---|---|---|
| `ask` | Ask AI 中提交问题 | 检索相关词，生成解释 |
| `generate_sentence` | Make Sentences 选择单句 | 检索/选择词，生成句子 |
| `generate_paragraph` | Make Sentences 选择短段落 | 选择 3-5 个词，生成段落 |
| `generate_dialogue` | Make Sentences 选择小对话 | 选择 3-5 个词，生成对话 |

### 8.2 工具能力

v2 MVP 中的 Agent 工具是项目内已有数据能力的组合：

- `getSceneWords(sceneId)`：获取当前场景词表；
- `getFavoriteWords()`：获取收藏词摘要；
- `getMistakeSummary()`：获取错题词和错误类型摘要；
- `getProgressSummary(sceneId)`：获取当前场景已学进度；
- `retrieveRelevantWords(query, sceneWords, learningSignals)`：检索相关词；
- `callLLM(prompt, context)`：通过云函数调用模型。

### 8.3 输出格式

云函数应尽量返回结构化 JSON，前端负责渲染。

Ask AI 输出：

```json
{
  "type": "ask",
  "answer": "string",
  "example": "string",
  "relatedWords": ["projector", "screen"],
  "basedOn": ["projector"]
}
```

Make Sentences 输出：

```json
{
  "type": "generate_sentence",
  "generatedText": "string",
  "keyWordsUsed": ["projector", "blackboard"],
  "chineseHelp": "string",
  "trySaying": "string"
}
```

如果模型返回格式异常，云函数应做基础修正或返回可展示的失败状态。

---

## 9. 技术方案

### 9.1 总体架构

```text
小程序端
  ↓ wx.cloud.callFunction
CloudBase 云函数 sceneTutor
  ↓ 构建 RAG context
  ↓ 调用 LLM Provider
大模型 API
  ↓ 返回结构化结果
CloudBase 云函数
  ↓ 清洗与兜底
小程序端展示
```

### 9.2 小程序端职责

- 展示 Scene Tutor 入口；
- 收集用户输入；
- 读取当前场景 id；
- 读取必要的本地学习摘要；
- 调用 CloudBase 云函数；
- 展示 loading、success、empty、error 状态；
- 渲染结构化 AI 结果；
- 不保存或暴露模型 API key。

### 9.3 云函数职责

- 接收 task、sceneId、query、selectedWords、learningSignals；
- 校验输入；
- 获取或接收当前场景 RAG context；
- 构建模型 prompt；
- 调用模型 API；
- 对返回内容做结构化校验；
- 处理超时、失败、格式异常；
- 返回前端可渲染的数据结构。

### 9.4 LLM Provider 抽象

v2 不绑定具体模型供应商。云函数中应保留 provider 抽象，便于后续切换。

建议接口：

```ts
type LlmProvider = {
  generateSceneTutorResponse(input: SceneTutorPromptInput): Promise<SceneTutorModelResponse>;
};
```

模型配置应通过云函数环境变量或云端配置管理，不写入小程序代码。

### 9.5 安全与成本控制

- API key 只存放在云函数环境中。
- 小程序端不直接请求模型 API。
- 单次请求限制输入长度。
- 单次请求限制检索词数量。
- 云函数设置超时时间。
- 模型失败时返回可读兜底文案。
- 后续可加入每日调用次数限制。
- 后续可加入结果缓存，减少重复问题调用成本。

---

## 10. 页面与交互

### 10.1 Scene Tutor 首页

展示内容：

- 当前场景名称；
- Scene Tutor 标题；
- 两个能力卡片：
  - Ask AI
  - Make Sentences
- 最近一次 AI 结果可选保留在页面会话内。

状态：

- 默认状态；
- 加载状态；
- 云函数不可用状态；
- 网络失败状态。

### 10.2 Ask AI 页面或面板

元素：

- 输入框；
- 推荐问题 chips；
- Submit 按钮；
- 结果卡片；
- Related words；
- Based on 来源词。

交互：

- 点击推荐问题可直接填入输入框或直接提交；
- 输入为空时不可提交；
- 提交后显示 loading；
- 返回结果后显示结构化回答；
- 失败时显示轻量错误并允许重试。

### 10.3 Make Sentences 页面或面板

元素：

- 生成类型选择：
  - Single sentence
  - Short paragraph
  - Mini dialogue
- 当前场景词选择；
- 可选自由输入词；
- Generate 按钮；
- 生成结果卡片；
- Key words used；
- Chinese help；
- Try saying。

交互：

- 用户最多选择 5 个词；
- 未选择词时，由系统根据当前场景和学习记录选择；
- 生成失败时保留用户选择，允许重试；
- 不自动写入收藏、错题或进度。

---

## 11. 内容与文案规则

### 11.1 语气

- 轻量、清楚、鼓励；
- 不使用技术术语解释内部实现；
- 不向用户暴露 prompt、RAG、API、token、mock 等概念；
- 英文学习内容为主，中文解释辅助理解。

### 11.2 回答边界

Scene Tutor 应优先围绕当前场景回答。

当用户问题明显偏离学习场景时，建议回复：

```text
I can help with words and expressions from this scene. Try asking about an object, a word difference, or a sentence you want to make.
```

### 11.3 内容可靠性

- 回答应尽量引用当前场景词。
- 不确定时给出保守表达。
- 不将 AI 生成内容直接视为已审核学习内容。
- 不生成攻击性、歧视性、成人、违法或高风险内容。

---

## 12. 数据记录

v2 MVP 可以先不保存完整 AI 对话历史。

建议记录轻量本地状态：

- 最近一次 Scene Tutor task；
- 最近一次结果展示状态；
- 用户是否首次打开 Scene Tutor；
- 用户是否使用过 Ask AI；
- 用户是否使用过 Make Sentences。

后续可扩展：

- AI 使用次数；
- 常见提问类型；
- 生成结果收藏；
- AI 生成句子的跟读练习；
- 用户对回答是否有帮助的反馈。

---

## 13. 异常与边界状态

| 场景 | 处理 |
|---|---|
| 云函数调用失败 | 展示 `AI Tutor is temporarily unavailable. Please try again.` |
| 模型超时 | 展示重试入口，不清空用户输入 |
| API 返回格式异常 | 云函数尝试转为普通文本结果；仍失败则返回错误状态 |
| 当前场景无词表 | 不允许发起请求，提示当前场景暂不支持 |
| 用户输入为空 | 禁用提交按钮 |
| 用户输入过长 | 提示缩短问题 |
| 用户问题偏离场景 | 引导用户询问当前场景词汇 |
| 没有命中相关词 | 使用当前场景高价值词做兜底回答 |
| 网络较慢 | 显示明确 loading 状态 |

---

## 14. 验收标准

### 14.1 场景覆盖

- Classroom 场景可进入 Scene Tutor。
- Lecture Hall 场景可进入 Scene Tutor。
- Dormitory 和 Cafeteria 不展示可用 Scene Tutor 入口。
- Scene Tutor 能正确识别当前 sceneId。

### 14.2 Ask AI

- 用户可以输入问题并提交。
- 推荐问题可用。
- 回答基于当前场景词库。
- 回答包含解释和至少 1 个场景例句或表达。
- 结果展示 related words 或 based on 来源信息。
- 偏离场景的问题不会进入无限制泛聊天。

### 14.3 Make Sentences

- 用户可以选择生成类型。
- 用户可以选择或输入当前场景词。
- 未选择词时可自动基于当前场景生成。
- 输出包含英文生成内容、关键词和中文辅助解释。
- 生成内容不自动写入正式词库。

### 14.4 RAG 与 Agent 行为

- 云函数收到请求后能构建当前场景上下文。
- 检索结果优先来自当前场景。
- 收藏、错题和已学摘要可以参与上下文构建。
- Ask AI 与 Make Sentences 使用不同任务路由。
- 前端不保存模型 API key。

### 14.5 异常处理

- 云函数失败时页面不崩溃。
- 模型超时时允许重试。
- 输入为空、过长或偏离场景时有明确反馈。
- 用户看不到内部技术错误。

---

## 15. 成功指标

v2 MVP 可通过以下指标判断 Scene Tutor 是否有价值：

| 指标 | 说明 |
|---|---|
| Scene Tutor 入口点击率 | 用户是否愿意尝试 AI 助教 |
| Ask AI 提交率 | 用户是否真的提出学习问题 |
| Make Sentences 生成率 | 用户是否愿意把词汇用于表达 |
| 结果阅读完成率 | 用户是否停留查看 AI 结果 |
| 生成后继续学习率 | 用户是否回到 Memory / Listen + Spell / Listen + Speak |
| 收藏词提问占比 | 收藏资产是否转化为进一步学习 |
| 错题词提问占比 | 错题资产是否转化为解释需求 |
| 用户主观反馈 | 用户是否认为更理解或更会使用场景词 |

第一轮可用性测试建议观察：

- 用户是否理解 Scene Tutor 的用途；
- 用户是否会问与场景有关的问题；
- 生成结果是否对学习有帮助；
- AI 入口是否干扰原有学习路径；
- 回答是否过长或过泛。

---

## 16. 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| AI 回答偏离场景 | 削弱场景学习定位 | 用当前 sceneId 和词表约束 prompt 与检索 |
| AI 编造不存在的词 | 学习内容不可靠 | 展示 based on 来源词，限制正式学习内容入库 |
| API key 泄露 | 带来安全和费用风险 | API key 只放 CloudBase 云函数 |
| 调用成本不可控 | 增加运营成本 | 限制输入长度、上下文长度和调用频率 |
| 模型响应慢 | 影响体验 | loading 状态、超时兜底、可重试 |
| 用户把它当泛聊天 | 偏离学习目标 | 入口文案和偏离场景回复保持边界 |
| 输出太难 | 学习负担增加 | prompt 要求简洁、适合学习者、中文辅助解释 |
| 云函数配置复杂 | 开发成本上升 | 先做最小可用云函数，再补限流和日志 |

---

## 17. 版本规划

### v2.0 Scene Tutor MVP

- 支持 Classroom 和 Lecture Hall。
- 支持 Ask AI。
- 支持 Make Sentences。
- 接入 CloudBase 云函数和真实 LLM API。
- 使用轻量 RAG context。
- 完成基础异常处理和 UI 展示。

### v2.1 AI Practice

- 增加 Quiz Me。
- 根据错题和收藏生成个性化练习。
- 探索 AI 生成题与现有错题系统的连接方式。

### v2.2 AI Learning Review

- 增加 AI 复习建议。
- 基于错题类型解释薄弱点。
- 支持生成短期复习计划。

### v3.0 Speech Intelligence

- 评估真实 ASR 接入。
- 将真实口语识别结果与 Scene Tutor 结合。
- 为口语失败提供更具体的练习建议。

---

## 18. 一句话总结

SceneEnglish v2 通过 Scene Tutor 场景 AI 助教，把现有场景词汇学习从“认识单词”扩展到“理解单词并在场景中使用单词”。它基于当前场景词库和本地学习记录构建轻量 RAG 上下文，并通过 CloudBase 云函数安全调用大模型，为用户提供有边界、可解释、贴近学习路径的 AI 学习反馈。
