# Kim's CareerOS v1.2 — AI 桌宠助手"芝士" PRD

> 创建日期：2026-07-13 | 状态：✅ v1.2 核心功能交付，桌宠已在桌面运行
> 最后更新：2026-07-14

---

## 一、产品定位

**一个悬浮在 Windows 桌面上的 AI 伙伴，名字叫"芝士"**。芝士 = 知识，是 Kim CareerOS 里所有数据的化身。像搜狗输入法图标一样永远在最上层，点击展开聊天面板，可以直接对话。AI 自动检索 CareerOS 数据库 + 实时联网搜索，能查数据、管日程、给建议、提供情绪价值。奶糕、奶棍、奶球是 Kim 的真实猫猫，芝士是 Kim 的电子猫猫。

---

## 二、功能清单

### Phase 1 — MVP（已完成代码，待环境配置）

| 功能 | 描述 | 状态 |
|------|------|:--:|
| 桌面悬浮 | frameless + always-on-top + 透明窗口 + 可拖拽 | ✅ |
| 精灵动画 | CSS 逐帧动画（idle/listening/thinking/talking/sleeping） | ✅ |
| AI 对话 | Claude 驱动，流式输出，打字机效果 | ✅ |
| 日程查询 | "今天有什么安排" → 自动查数据库 | ✅ |
| 创建待办 | "帮我加一个明天下午3点的面试" → 自动入库 | ✅ |
| 完成待办 | "标记完成" → 自动更新状态 | ✅ |
| 本周概览 | "本周情况" → 按天统计 | ✅ |
| 查公司库 | "有哪些互联网公司" → 关键词搜索 | ✅ |
| 查人脉库 | "认识哪些猎头" → 关键词搜索 | ✅ |
| 查投递 | "投了哪些公司" / "还在面哪些" → 按状态筛选 | ✅ |
| 查面试 | "接下来有什么面试" → 即将面试列表 | ✅ |
| 查知识库 | "字节HRBP面经" → 关键词搜索 | ✅ |
| 查市场洞察 | "HRBP薪资行情" → 关键词搜索 | ✅ |
| 上下文感知 | 自动注入今日日程、面试、投递状态 | ✅ |
| 语音输入 | Web Speech API，长按触发 | ✅ |
| 多变人格 | 专业/温暖/毒舌三模式自动切换 | ✅ |

### Phase 2 — 联网搜索（✅ 已完成）

| 功能 | 描述 | 状态 |
|------|------|:--:|
| 快速搜索 | 单轮搜索，几秒返回结果（DuckDuckGo/Tavily） | ✅ |
| 页面抓取 | 抓取指定网页全文，用于深度分析 | ✅ |
| 深度研究 | 模型自主编排：搜索→挑链接→抓取→交叉验证→带引用报告 | ✅ |
| 搜索工具 | searchWeb + fetchPage 两个工具注册到 /api/chat | ✅ |

### Phase 3 — 主动提醒 + 调参面板（待开发）

| 功能 | 触发条件 |
|------|---------|
| 日程提醒 | 面试/会议前 30 分钟弹气泡 |
| 待办积压 | 连续 3 天未清理待办 |
| 每日早安 | 当天第一次互动 |
| 每周复盘 | 周日晚自动生成周报 |
| 数据变化 | 投递状态变更（如收到面试邀请） |
| 情绪感知 | 检测到 Kim 话风变丧时切换温暖模式 |
| 调参面板 | 所有主动提醒开关，实时生效 |

---

## 三、技术架构

```
Windows 桌面
├─ 🐱 桌宠（Tauri 2.0 独立应用）
│   ├─ Rust 后端：窗口管理、系统托盘、全局快捷键
│   ├─ React 19 前端：精灵动画、聊天面板、语音输入
│   └─ 通过 HTTP 调用 CareerOS API（localhost:3000）
│
└─ 🌐 CareerOS（Next.js 14 Web 应用）
    ├─ POST /api/chat    ← AI 对话接口（Vercel AI SDK + Claude）
    ├─ 10 个工具函数      ← 日程 CRUD + 数据查询（Prisma → PostgreSQL）
    ├─ 系统提示词          ← 三模式人格 + 主动搭话规则
    └─ 上下文构建器        ← 每次对话自动注入实时数据
```

### 技术选型

| 层 | 选型 | 理由 |
|----|------|------|
| 桌面框架 | Tauri 2.0 | 5MB 安装包，30MB 内存，比 Electron 轻 95% |
| 前端 | React 19 + TypeScript + Vite 6 | 与 CareerOS 同生态 |
| AI SDK | Vercel AI SDK v7 | 流式输出，原生支持 tool calling |
| AI 模型 | Claude Sonnet 4 | 工具调用能力强，中文流畅 |
| 通信 | HTTP → CareerOS API | 桌宠是瘦客户端，智能逻辑全在 API |
| 窗口 | frameless + always-on-top + transparent | 悬浮桌面不遮挡 |

### 关键文件

```
kims-careeros/
├── src/app/api/chat/route.ts          # AI 对话主接口
├── src/lib/ai/system-prompt.ts        # 系统提示词（人格定义）
├── src/lib/ai/context.ts              # 上下文构建器
├── desktop-pet/                       # Tauri 桌宠应用
│   ├── src/App.tsx                    # 主应用（收起/展开双模式）
│   ├── src/components/Pet.tsx         # 精灵动画组件
│   ├── src/components/ChatPanel.tsx   # 聊天面板
│   ├── src/hooks/useChat.ts           # AI 对话 hook
│   ├── src/hooks/useDrag.ts           # 窗口拖拽 hook
│   └── src-tauri/                     # Rust 后端
│       ├── tauri.conf.json            # 窗口配置
│       ├── src/lib.rs                 # 窗口管理逻辑
│       └── src/main.rs                # 入口
```

---

## 四、待定事项

| 事项 | 状态 |
|------|------|
| 桌宠名字 | ✅ **芝士** （谐音"知识"，奶制品家族第四位成员） |
| 桌宠形象 | 待 Kim 提供参考图 → AI 生成 8×3 精灵图 |
| Anthropic API Key | 待填入 `.env` |
| Rust 环境 | 待安装（rustup + VS C++ Build Tools） |
| 应用图标 | 待生成（32x32 / 128x128 / ico） |

---

## 五、启动命令

```bash
# 终端 1：启动 CareerOS
cd D:\AI\项目\kims-careeros
npm run dev

# 终端 2：启动桌宠（需要 Rust 环境）
cd D:\AI\项目\kims-careeros\desktop-pet
npm run tauri dev
```

---

## 六、交互示例

```
用户："我今天有什么安排？"
桌宠：💬 "你今天有 3 件事：
  1. 💼 上午10点 跟字节HR面试
  2. 🐱 下午3点 更新简历
  3. 📝 买猫粮
  需要我帮你准备面试吗？"

用户："帮我查一下投了哪些还在等反馈的"
桌宠：🔄 查询中...
  💬 "正在进行中的投递有 5 条：
  1. 字节跳动 HRBP [已投递]
  2. 阿里 组织发展 [面试-一面已过]
  3. ..."

用户："烦死了，今天什么都不想干"
桌宠：💬 "今天不太顺？没关系，你已经做得很好了。
  要不今天就只做一件事——把'更新简历'那个待办清了？
  其他的我帮你记着，明天再说。"
```

---

## 七、参考项目

| 项目 | 借鉴点 |
|------|--------|
| DebugDuck (Tauri 2 + React 19) | frameless 透明窗口、140帧动画、AI 对话架构 |
| CodeWalkers (Tauri 2 + React) | 60fps 精灵动画、点击穿透方案 |
| WindowPet (Tauri + React) | 45+ 宠物参考、自启动机制 |
| CareerOS by Samir-Sahiti (Next.js + Claude) | Vercel AI SDK + Claude + Zod 结构化输出模式 |
