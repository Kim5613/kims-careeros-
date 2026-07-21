# Kim's CareerOS v1.2 — AI 集成 + UX 重构 PRD

> 创建日期：2026-07-13 | 状态：🚧 进行中
> 最后更新：2026-07-21

---

## 一、v1.2 定位

**将 AI 能力深度集成到 CareerOS 工作流中，同时完成全站 UI/UX 升级。** 不再是外挂一个聊天窗口，而是让 AI 直接参与求职诊断、HR 决策等核心场景；设计语言统一为「简单高级」。

### 三条线

| 线 | 内容 | 状态 |
|----|------|:--:|
| 🌐 Web AI 工具 | 岗位诊断 + 大师智囊团 | ✅ |
| 🎨 UX 重构 | 求职流水线 + 侧边栏 + 全站设计 + 诊断API + 面试追踪 | 🚧 框架完成，诊断API待调试 |
| 🐱 桌面桌宠 | Tauri 悬浮窗口 AI 伙伴 "芝士" | ⏸️ 暂停 |

---

## 二、Web AI 工具（✅ 已交付 2026-07-21）

### 2.1 岗位诊断 (`/job-seeking/diagnosis`)

**定位**：求职适配度一键诊断。JD + 简历 + 公司名 → AI 联网调研 → 红黄绿灯报告。

| 功能 | 描述 |
|------|------|
| 结构化输入 | 公司名 / JD 粘贴 / 简历上传解析 / 关注重点 / 深度档位 |
| 简历文件解析 | 拖拽上传 PDF/Word/图片/MD/TXT，自动 OCR/提取文字 |
| 一键生成报告 | 联网搜索 + JD 四分类 + 五维人岗匹配 + 真实招聘意图 + CEO 独白 + 反向逼问 |
| 流式输出 | 报告实时渲染 Markdown，支持表格、引用、代码块 |

**入口**：侧边栏 个人 → 求职 → 岗位诊断；个人总览页卡片

### 2.2 大师智囊团（嵌入 `/personal`）

**定位**：6 位 HR 大师虚拟顾问团。三轮追问 → 共识与分歧 → CHO 佳宇最终结论。

| 功能 | 描述 |
|------|------|
| 六位大师 | 查兰（战略）/ 尤里奇（人才）/ 沙因（文化）/ 鸿鹄（实战）/ 平克（激励）/ 桑德伯格（包容） |
| 三轮追问 | 背景收集 → 痛点深挖 → 期望目标 |
| 观点交锋 | 大师之间必须呈现分歧和不同立场 |
| CHO 结论 | 佳宇综合大师观点给出最终行动建议 |
| 数据串联 | 自动注入公司库、人脉库、市场洞察数据作为上下文 |

**入口**：个人总览页（`/personal`）橙色卡片，点击原地展开聊天，可收起

### 2.3 AI 基础设施

| 组件 | 路径 | 说明 |
|------|------|------|
| 岗位诊断对话 | `/api/ai/job-diagnosis` | 流式对话接口 |
| 一键报告生成 | `/api/ai/job-diagnosis/report` | 结构化输入 → 流式报告 |
| 大师智囊团对话 | `/api/ai/hr-roundtable` | 流式对话接口 |
| 简历解析 | `/api/parse/resume` | 文件上传 → 解析 → 返回文本 |
| 搜索模块 | `src/lib/ai/search.ts` | DuckDuckGo（免费）+ Tavily（可选） |
| AI 模型 | DeepSeek (`deepseek-chat`) | 通过 Vercel AI SDK v7 |

### 2.4 页面架构（2026-07-21 重构）

侧边栏精简为平级 6 入口，收起显示 4 个图标：

```
🏠 首页            ← 日历/待办（布局不动）
🔍 求职 /personal  ← 五阶段流水线（唯一求职页面）
🎯 职业宇宙         ← /growth/career-sphere（不动）
👥 HR工作台         ← 统计仪表盘
📚 知识库           ← HR 知识管理
⚙️ 设置            ← 主题/密码
```

### 2.5 求职流水线（2026-07-21 交付）

`/personal` 五阶段全流程，hover 弹窗 + 点击展开 + 右侧滑出面板：

| 阶段 | 核心功能 | AI Skill |
|------|---------|----------|
| 投前诊断 | 粘贴JD→AI提取能力标签→匹配简历→🟢🟡🔴 | `job-fit-diagnosis` + `deep-research` + `wechat-fetcher` + `xiaohongshu-fetcher` |
| 已投递 | 记录日期/渠道→自动计天数→超5天黄色预警 | — |
| 面试追踪 | 多轮记录(面试官/角色/能力标签/问题/感受/复盘)+能力覆盖图 | `hr-masters-roundtable` |
| Offer 对比 | 月薪/年终/期权→自动算总包→多Offer对比 | `hr-masters-roundtable` |
| 入职准备 | 日期+倒计时+可勾选材料清单+进度条 | — |

交互：默认显示统计+快捷入口 → hover阶段标签弹窗预览 → 点击展开卡片网格 → 点卡片右侧滑出详情 → 阶段流转按钮(投了!/收到面试/收到Offer/接受)

**2026-07-21 新增**：
- 岗位诊断：简历版本选择 + JD 粘贴 + 调用 `/api/ai/job-diagnosis/report`（服务端搜索 + DeepSeek 生成完整报告）→ 一键保存并开始追踪
- 卡片重构：职位·公司 同行紧凑排列，能力标签全流程展示，流转按钮统一右下角
- 面试追踪：详情面板新增「+ 新增轮次」表单（轮次/日期/形式/面试官/角色/能力标签/关键问题/感受/复盘）
- 完整诊断报告：点击详情面板「查看完整报告」→ 新标签页打开 AI 生成的完整 HTML 报告
- 页面标题改为「我的求职」——去掉企业化表述
- 侧边栏 logo 锁定系统字体（去除 288 种随机组合）

### 2.6 数据串联设计

AI 工具不只是独立对话，而是能实时读取 CareerOS 数据库：

| 工具 | 串联数据 |
|------|---------|
| 岗位诊断 | 简历库（默认简历自动注入）、公司库（已有记录自动关联）、投递记录（避免重复投递） |
| 大师智囊团 | 公司库、人脉库、市场洞察（自动注入为对话上下文） |

---

## 三、桌面桌宠（⏸️ 暂停 2026-07-16）

Phase 1 代码已完成但保留在本地，未上线。待 Kim 重新理清思路后启动。

### 已完成的代码

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
| 联网搜索 | DuckDuckGo/Tavily 搜索 + 页面抓取 | ✅ |

### 待定事项

| 事项 | 状态 |
|------|------|
| 桌宠名字 | ✅ **芝士** |
| 桌宠形象 | 待 Kim 提供参考图 |
| Anthropic API Key | 待填入 `.env` |
| Rust 环境 | 待安装 |
| 主动提醒系统 | 待开发 |
| 调参面板 | 待开发 |

---

## 四、技术架构（更新）

```
🌐 CareerOS Web（Next.js 14）
  ├─ /api/chat                  ← AI 桌宠对话（DeepSeek + 14 tools）
  ├─ /api/ai/job-diagnosis      ← 岗位诊断对话
  ├─ /api/ai/job-diagnosis/report ← 一键报告生成
  ├─ /api/ai/hr-roundtable      ← 大师智囊团对话
  ├─ /api/parse/resume          ← 简历文件上传解析
  ├─ src/lib/ai/search.ts       ← 搜索模块（DuckDuckGo/Tavily）
  ├─ src/lib/ai/system-prompt.ts ← 系统提示词
  └─ src/lib/ai/context.ts      ← 上下文构建器

🐱 桌宠（Tauri 2.0 — 暂停）
  └─ desktop-pet/               ← Phase 1 代码保留
```

### 技术选型

| 层 | 选型 |
|----|------|
| Web 框架 | Next.js 14 (App Router) |
| AI SDK | Vercel AI SDK v7 |
| AI 模型 | DeepSeek (`deepseek-chat`) |
| 搜索 | DuckDuckGo（免费）+ Tavily（可选） |
| 文件解析 | pdfjs + mammoth + tesseract.js + sharp |
| 桌面框架 | Tauri 2.0（暂停） |

---

#
---

## 五、设计规范（2026-07-21 确立）

### 设计原则
- **简单高级**：少即是多，用留白代替分割线，字体驱动层次
- **克制配色**：大面积中性色 + 点缀品牌色
- **柔和阴影**：若有若无，仅提供深度暗示
- **流畅过渡**：所有交互 0.15-0.25s ease

### 设计令牌

| 类别 | 值 |
|------|-----|
| 页面底色 | `#faf8f6` |
| 卡片白 | `#fff` |
| 品牌主色 | `#8b7cf0` |
| 语义绿/橙/红 | `#4cb840` / `#e08830` / `#e05858` |
| 文字色 | `#333` / `#888` / `#bbb` |
| 边框 | `#eeeae5` |
| 卡片阴影 | `0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)` |
| 浮起阴影 | `0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)` |
| 卡片圆角 | 14px |
| 按钮圆角 | 8px |
| 页面 padding | `40px 48px 24px` |
| 最小字号 | 12px |

### 页面模板
所有页面统一：LABEL *(12px uppercase)* + 标题 *(26px, w500)* + 日期 + 内容区

### 组件约定
- 按钮 borderRadius:8, 无阴影
- 卡片 白色底+统一阴影, hover升级浮起阴影
- Tag borderRadius:8, 无边框
- 阶段标签 hover显示底部色条指示线
- 弹窗 fade-in 0.15s / 面板 fixed+遮罩+滑入
- 空状态 统一灰色 #bbb

### 源文件
- 令牌 `src/lib/design-tokens.ts`
- 全局样式 `src/app/globals.css`
- AntD主题 `src/components/AntdConfigProvider.tsx`

---

## 六、Skill 调用规范（2026-07-21）

| 场景 | 必须调用的 Skill |
|------|-----------------|
| 设计新功能/PRD/规划 | `pm-spec-writing` + `jtbd-framing` |
| 改 UI 布局/配色/排版 | `ui-design-review` |
| 设计交互流程 | `cognitive-walkthrough` |
| 重设计信息架构 | `ux-audit-rethink` |
| 验证功能设计 | `discovery-research-synthesis` |

技术实现: `CLAUDE.md` §5 + `.claude/settings.local.json` PreToolUse hook

---

## 七、启动命令

```bash
# Web 应用
cd D:\AI\项目\kims-careeros
npm run dev
# → http://localhost:3456

# 访问 AI 工具
# 岗位诊断: http://localhost:3456/job-seeking/diagnosis
# 大师智囊团: http://localhost:3456/personal（页面内展开）
# 个人总览: http://localhost:3456/personal
# HR工作台: http://localhost:3456/workbench
```

