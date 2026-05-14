# SceneEnglish 技术栈建议

> 目标：简单但健壮，优先支持 MVP 快速落地，同时为后续云端化、真实 ASR、更多场景扩展预留空间。  
> 依据：`memory-bank/design-document.md` 当前产品设计。

---

## 1. 总体结论

SceneEnglish 第一版推荐使用：

```text
微信小程序原生框架 + TypeScript + 本地 TypeScript 数据模块 + wx 本地缓存 + 服务层封装
```

第一版不建议使用 Taro、uni-app、复杂状态管理库或自建后端。原因是 MVP 的核心风险不在跨端能力，而在场景交互、热区点击、内容质量、听写流程和口语体验验证。原生小程序技术栈最贴近微信能力，能降低录音、音频、本地缓存、权限等环节的不确定性。

---

## 2. 推荐技术栈

| 层级 | 推荐方案 | 说明 |
|---|---|---|
| 小程序框架 | 微信小程序原生开发 | 使用 WXML、WXSS、TypeScript/JavaScript，减少跨端框架复杂度 |
| 语言 | TypeScript | 为词表、热区、练习状态、错题结构提供类型约束 |
| 页面层 | 原生 Page + Component | 页面负责展示和交互，复杂逻辑下沉到 services/utils |
| UI | 原生组件 + 少量自定义组件 | 不引入重型 UI 库，优先保证小程序包体和稳定性 |
| 数据源 | 本地 TypeScript 数据模块 | MVP 词表、场景、热区、实用表达都放在 `miniprogram/data/scenes.ts`，便于类型校验 |
| 用户数据 | wx 本地缓存 | 收藏、错题、学习进度先保存在本地 |
| 音频播放 | `wx.createInnerAudioContext` | 播放单词 mp3 音频 |
| 录音 | `wx.getRecorderManager` | 口语模式录音入口 |
| 口语识别 | 本地 mock ASR service | 第一版模拟识别结果，后续替换真实 ASR |
| 后端 | MVP 不接后端 | 后续迁移到微信云开发 / CloudBase |
| 测试 | Vitest 测 services/utils | 优先测试热区换算、抽题、拼写判断、错题更新 |
| 代码质量 | ESLint + Prettier | 轻量保证格式和基础质量 |

---

## 3. 为什么不推荐更复杂方案

### 3.1 不优先使用 Taro / uni-app

SceneEnglish 第一版只面向微信小程序，不需要 H5、App 或多端同步。跨端框架会额外引入构建链、适配层和调试成本，而项目核心能力高度依赖微信原生能力：音频、录音、本地缓存、权限、页面生命周期。

### 3.2 不优先接入云开发

MVP 目标是验证“场景学习 + 听写说闭环”是否成立。第一版用户数据量小，收藏、错题、进度都可以本地保存。直接上云会引入登录、权限、数据库规则、云函数、部署环境等额外变量。

### 3.3 不优先接真实 ASR

口语模式第一版要验证的是用户是否愿意开口，以及“识别成功/失败反馈”是否有学习价值。真实 ASR 会带来接口选型、费用、识别准确率、网络延迟、音频格式和隐私合规问题，建议先通过 mock ASR 跑通体验。

---

## 4. 推荐目录结构

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
      classroom-cover.png
      classroom.png
    audio/
      blackboard.mp3
      whiteboard.mp3
      projector.mp3
      ...

tests/
  hotspot.test.ts
  quizService.test.ts
  normalize.test.ts
  mistakeService.test.ts
```

开发阶段使用微信开发者工具的测试号 / 测试 AppID；根目录保留 `memory-bank/`、`AGENTS.md`、测试配置和项目配置。

---

## 5. 核心模块设计

### 5.1 页面层

页面只负责：

- 获取页面参数；
- 调用 service；
- 维护当前页面 UI 状态；
- 响应点击、输入、播放、录音等交互；
- 展示反馈。

页面不直接写缓存，不直接拼接业务数据，不直接实现抽题算法。

### 5.2 Service 层

| Service | 职责 |
|---|---|
| `sceneService` | 获取场景列表、Coming soon 场景、当前场景配置 |
| `wordService` | 获取词表、根据 wordId 查词、根据场景查词 |
| `progressService` | 记录 learned、完成次数、学习进度 |
| `favoriteService` | 添加、取消、查询收藏 |
| `mistakeService` | 记录错题、按错误类型更新错误次数和掌握进度 |
| `quizService` | 生成 5 题队列、处理答题状态 |
| `speechService` | MVP mock ASR，后续替换真实 ASR |
| `audioService` | 统一播放、停止、错误处理 |

### 5.3 Utils 层

| Utils | 职责 |
|---|---|
| `hotspot` | 热区坐标换算、命中判断、百分比坐标生成 |
| `normalize` | 拼写标准化、大小写处理、空格处理 |
| `storage` | 封装 wx storage key、读写、默认值、异常兜底 |
| `time` | 时间戳、最近错误时间展示 |

---

## 6. 数据设计建议

### 6.1 场景数据

```ts
type Scene = {
  id: string;
  nameCn: string;
  nameEn: string;
  coverImage: string;
  sceneImage: string;
  baseWidth: number;
  baseHeight: number;
  wordCount: number;
  status: "available" | "comingSoon";
};
```

### 6.2 单词数据

```ts
type Word = {
  id: string;
  sceneId: string;
  cn: string;
  en: string;
  phonetic: string;
  exampleEn: string;
  exampleCn: string;
  expressionEn: string;
  expressionCn: string;
  audioUrl: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
```

### 6.3 本地缓存 key

```text
sceneenglish:favorites
sceneenglish:mistakes
sceneenglish:progress
sceneenglish:settings
sceneenglish:onboarding
```

缓存内容建议都带版本号，便于后续数据结构升级：

```ts
type LocalStore<T> = {
  version: 1;
  updatedAt: string;
  data: T;
};
```

---

## 7. 热区实现建议

MVP 推荐使用“图片 + 透明热区 view 覆盖”的方式，而不是 canvas。

原因：

- 20 个矩形热区足够简单；
- 透明 view 更容易绑定点击事件；
- 样式和调试更直观；
- 不需要处理 canvas 绘制生命周期。

实现方式：

1. 所有热区按原始画布坐标保存。
2. 页面根据图片展示尺寸转换为百分比定位。
3. 每个物品生成一个绝对定位的透明 view。
4. 点击热区时直接拿到对应 `wordId`。

后续如果热区变成复杂多边形，再考虑 canvas 或自定义 hit-test。

---

## 8. 音频与录音

### 8.1 单词音频

MVP 推荐预置 20 个 mp3 文件：

```text
assets/audio/projector.mp3
assets/audio/socket.mp3
...
```

播放统一走 `audioService`：

- 避免多个页面重复创建 audio context；
- 统一处理播放失败；
- 进入新题时自动停止上一条音频；
- 页面卸载时释放资源。

### 8.2 口语录音

录音统一走 `speechService`：

- 页面只关心“开始录音、停止录音、识别结果”；
- MVP 内部返回 mock transcript；
- 后续真实 ASR 只替换 service，不改页面流程。

推荐接口：

```ts
type SpeechResult = {
  transcript: string;
  passed: boolean;
  provider: "mock" | "asr";
  confidence?: number;
};

async function recognizeWord(audioFilePath: string, targetWord: string): Promise<SpeechResult>;
```

---

## 9. 后续云端迁移方案

MVP 不接后端，但从第一天就按可迁移结构组织代码。

### 9.1 迁移到 CloudBase 时的映射

| 当前本地模块 | 后续云端模块 |
|---|---|
| `data/scenes.ts` 中的场景数据 | 云数据库 `scenes` collection |
| `data/scenes.ts` 中的单词数据 | 云数据库 `words` collection |
| `assets/images` | 云存储 |
| `assets/audio` | 云存储 |
| `favoriteService` | 云数据库 `favorites` collection |
| `mistakeService` | 云数据库 `mistakes` collection |
| `progressService` | 云数据库 `progress` collection |
| `speechService` mock | 云函数调用真实 ASR |

### 9.2 什么时候迁移

满足以下条件后再迁移云端：

- 至少完成 1 轮用户测试；
- 用户确实会使用收藏、错题和复习；
- 需要跨设备同步；
- 准备接入真实 ASR 或更多场景内容；
- 需要收集更完整的行为数据。

---

## 10. 测试策略

第一版不需要复杂 E2E，但需要测试核心纯逻辑。

推荐使用 Vitest 测：

- 热区坐标换算；
- 点击命中判断；
- 拼写标准化；
- 5 题抽题算法；
- 错题记录和按错误类型计算掌握进度；
- 收藏去重逻辑；
- speechService mock 结果匹配。

优先测试 `services` 和 `utils`，页面交互先通过微信开发者工具手动验证。

---

## 11. 开发工具与脚本建议

### 11.1 工具

| 工具 | 用途 |
|---|---|
| 微信开发者工具 | 小程序开发、预览、真机调试 |
| Node.js LTS | 安装开发依赖、运行测试和格式化 |
| TypeScript | 类型检查 |
| ESLint | 基础代码检查 |
| Prettier | 格式化 |
| Vitest | services/utils 单元测试 |

### 11.2 推荐脚本

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint miniprogram --ext .ts,.js",
    "format": "prettier --write \"miniprogram/**/*.{ts,js,json,wxml,wxss,md}\" \"tests/**/*.ts\"",
    "test": "vitest run"
  }
}
```

微信小程序本身仍通过微信开发者工具运行和预览。

---

## 12. 不建议第一版引入的内容

| 不建议项 | 原因 |
|---|---|
| Redux / MobX 等状态库 | 页面状态简单，service + storage 足够 |
| Taro / uni-app | 第一版不需要跨端 |
| 自建 Node 后端 | MVP 没有必要维护服务器 |
| 真实 ASR | 第一版先验证口语流程 |
| 复杂 UI 组件库 | 包体和样式控制成本上升 |
| Canvas 热区系统 | 20 个矩形热区用 view 覆盖更简单 |
| 完整埋点平台 | 先用本地或简单日志验证核心体验 |

---

## 13. 推荐实施顺序

1. 初始化协作文档、`.gitignore` 和微信小程序原生 TypeScript 项目。
2. 建立 `types`、`data`、`services`、`utils` 基础结构。
3. 实现场景选择页和 Coming soon 场景卡。
4. 实现场景图展示和透明热区点击。
5. 实现单词卡，包括例句和实用表达的中文折叠展开。
6. 实现收藏、学习进度和本地缓存。
7. 实现每组 5 题的听力 + 默写模式。
8. 实现错题夹和按错误类型修复的错题专项练习。
9. 实现口语模式录音流程和 mock ASR。
10. 补充 Vitest 单元测试。
11. 用微信开发者工具进行真机测试。

---

## 14. 参考资料

- [微信小程序框架官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信小程序本地缓存 wx.setStorage 官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorage.html)
- [微信小程序录音 wx.getRecorderManager 官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/media/recorder/wx.getRecorderManager.html)
- [微信小程序音频 InnerAudioContext 官方文档](https://developers.weixin.qq.com/miniprogram/dev/api/media/audio/InnerAudioContext.html)
- [miniprogram-api-typings](https://www.npmjs.com/package/miniprogram-api-typings)
- [CloudBase 小程序快速开始](https://docs.cloudbase.net/quick-start/mini-program/introduce)
- [CloudBase 产品能力说明](https://docs.cloudbase.net/)
