# Kim's CareerOS v1.2 — AI 集成 + UX 重构 PRD

> 创建日期：2026-07-13 | 状态：✅ v1.2.2 封版
> 最后更新：2026-07-24 | 当前版本：v1.2.2

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

## 七、启动与部署

### 本地开发

```bash
cd D:\AI\项目\kims-careeros
npm run dev
# → http://localhost:3456
```

### 线上部署（⚠️ 先开 VPN！）

国内服务器访问 GitHub 不稳，**每次部署前必须开 VPN**。

```powershell
# 本机 PowerShell，两步：
cd D:\AI\项目\kims-careeros && git push origin main
ssh root@139.196.159.68 -t "cd /opt/hr-platform && ./server-deploy.sh"
```

部署脚本自动完成：git pull → 种子数据 → 依赖安装 → 数据库同步 → 构建 → PM2 重启 → Nginx 刷新。

不用再手动 SSH 进去一条条贴命令。

### 部署后验收

```bash
# AI skill 是否正常（应看到流式文字）
curl -N -X POST http://127.0.0.1:3000/api/ai/hr-roundtable \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'

# 电影台词是否正常（不应返回默认的"阿甘正传"）
curl "http://127.0.0.1:3000/api/movie-quote?date=$(date +%F)"
```

---

## 八、线上 AI Skill 运维清单（2026-07-22，静默失败事故后补）

### 架构说明：不需要独立的 agent 服务

线上 skill **不是**由独立 agent 承接的——它们就是 Next.js 里的 API 路由
（`/api/ai/hr-roundtable`、`/api/ai/job-diagnosis`、`/api/chat`），
跟随主应用由 PM2 一起跑。所谓"agent 能力"= ai SDK 的**多步工具循环**
（`stopWhen: isStepCount(N)`），模型自己在循环里决定"搜索→读结果→生成"，
无需额外进程、无需 worker、无需队列。

线上 skill 能跑起来的**三个前提**：

| 前提 | 在哪配置 | 缺失后果 |
|------|---------|---------|
| ① `DEEPSEEK_API_KEY` | 服务器 `/opt/hr-platform/.env` | 接口 200 但空响应（错误被流静默吞掉） |
| ② 路由显式 `stopWhen` | 代码（已修，勿回退） | 模型调一次搜索就停，永远不说话 |
| ③ 可用的搜索源 | 服务器 `.env` 配 `TAVILY_API_KEY` | 联网调研静默无结果（DDG 国内被墙） |

### 每次上线 AI 相关改动后的验收动作

```bash
# 部署后必跑：应看到流式文字输出，而不是空响应
curl -N -X POST http://127.0.0.1:3000/api/ai/hr-roundtable \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'

# 还是空 → pm2 logs hr-platform（onError 已会把真实错误打进日志）
```

### 历史事故

2026-07-22 线上 AI 全哑：4 因叠加（服务器 env 缺 key / 路由缺 stopWhen /
report 路由 JSON↔流式协议错配 / 桌宠文件未 git add 致 `/api/chat` 404）。
修复 commit `002a630`，根因与教训详见 `memory/project-kims-careeros.md` 技术坑点。

---

## 九、v1.2 二轮迭代（2026-07-22，commit b60bb4f）

| # | 改动 | 说明 |
|---|------|------|
| 1 | AI 接口鉴权 | `/api/ai/` 移出免登录白名单；`/api/chat` 加 `PET_TOKEN` 请求头校验（桌宠客户端已带头） |
| 2 | focus 生效 | 诊断页"关注点"拼入 prompt（此前被丢弃） |
| 3 | 桌宠设置持久化 | 存储移出代码目录至 `/data/careeros-uploads/`（`src/lib/pet-settings.ts`），pet GET 路由加 `force-dynamic` |
| 4 | 诊断等待体验 | 文案说明 10-20s 调研耗时；拦截未登录 307 的登录页 HTML |
| 5 | 深度版属实 | depth=deep 多搜竞对/舆情/薪酬三组 query |
| 6 | 大师团历史 | localStorage 持久化 50 条 + 请求截断 20 条 + 清空按钮 |

### 新增 env（服务器上线时配置）

```bash
PET_TOKEN=长随机串   # 配了之后桌面桌宠设置里也要填同一个串，否则桌宠聊天 401
```

### 技术盲点文档

新增功能前必读 **`docs/TECH-PITFALLS.md`**——12 条踩过的坑 + 上线验收清单，
涵盖 AI 流式协议、middleware 鉴权、Next 缓存、存储位置、env 同步五类。

---

## 十、桌宠（芝士）拆分为独立板块（2026-07-22 决策）

**定位**：芝士是独立 agent，不是本仓库的一个版本功能。它有自己的仓库、版本和迭代节奏。

- **仓库位置**：`kims-careeros\桌宠-芝士\`（Tauri 2 + React 19，v0.1.0）——物理嵌套在网页项目内，**逻辑是嵌套独立 git 仓库**（本仓库 .gitignore 已排除），有自己的 PRD（`桌宠-芝士/docs/PRD.md`）和 memory
- **本仓库保留**：桌宠的服务端 API——`/api/chat`（对话+14 个数据工具）、`/api/pet/*`（提醒/召唤/设置/数据版本）
- **交互契约**：桌宠通过 HTTP + `PET_TOKEN` 请求头调本仓库 API；网页通过轮询 `/api/pet/data-version` 感知桌宠写操作自动刷新
- **目标架构**（用户已确认）：芝士大脑最终搬上客户端（客户端直连 DeepSeek），
  本地的手（OB 知识库、本地文件）+ 远程的手（网页 API）并存。
  OB 只能在客户端做——库在用户 D 盘，服务器够不着。**OB 暂为占位符**（`cheese-pet/src/tools/ob.ts`）
- **共享代码**：`src/lib/ai/search.ts` 同时服务 AI skill 和桌宠聊天，改动时注意两侧影响
- 遗留：`src/components/FloatingPet.tsx`、`PetSummon.tsx` 目前无页面引用（221b9e5 已摘下），保留待网页嵌入版启用时复用

---

## 十一、v1.2.1 — AI 线上修复 + 日视图 Bug 修复（2026-07-22）

### 11.1 AI Skill 线上静默失败修复（commit `002a630`）

**问题**：v1.2 上线后所有 AI 功能不可用——大师团不回复、岗位诊断报告为空、`/api/chat` 404，且全部返回 200 无报错。

**根因（4 因叠加）**：

| # | 根因 | 影响 |
|---|------|------|
| 1 | 服务器 `.env` 缺 `DEEPSEEK_API_KEY` | key 缺失时 ai-sdk 在流内才抛错 → 被静默吞 → 200 空响应 |
| 2 | `streamText` 默认 `stopWhen: stepCountIs(1)` | 挂了搜索工具但第一步调工具后循环即终止 → 永远不走生成第二步 |
| 3 | report 路由返回 JSON，前端按流式 getReader 读 | 整串 JSON 被当 markdown 渲染；非流式长生成撞 Nginx 60s 超时 |
| 4 | 桌宠 API/组件未 git add | `/api/chat` 线上 404 |

**修复**：

| 文件 | 改动 |
|------|------|
| `hr-roundtable/route.ts` | + `stopWhen: isStepCount(8)` + `onError` 日志 |
| `job-diagnosis/route.ts` | + `stopWhen: isStepCount(6)` + `onError` 日志 |
| `job-diagnosis/report/route.ts` | JSON→`toTextStreamResponse()` 流式纯文本 + `onError` |
| `chat/route.ts` | + `onError` 日志（与其它路由对齐，commit `5e140fb`） |
| `search.ts` | DDG 超时 8s→5s（国内服务器必超时，快速失败） |
| `server-deploy.sh` | 强制校验 `DEEPSEEK_API_KEY`/`JWT_SECRET`；`TAVILY_API_KEY` 缺失给警告 |
| `.env.example` | 补 `JWT_SECRET`/`TAVILY_API_KEY`/`PET_TOKEN` 及说明 |
| `desktop-pet/` | 补交全部未追踪的桌宠文件 |
| `diagnosis/page.tsx` | 流结束空内容兜底报错 + 未登录 307→HTML 拦截 |

### 11.2 安全加固 + 体验修复（commit `b60bb4f`）

| # | 改动 | 说明 |
|---|------|------|
| 1 | middleware 鉴权 | `/api/ai/` 移出免登录白名单（此前陌生人可裸调刷 DeepSeek 额度） |
| 2 | PET_TOKEN | `/api/chat` 路由内校验 `x-pet-token` 请求头；FloatingPet/desktop-pet 已带头 |
| 3 | 桌宠设置持久化 | 存储移出 `src/data/`（每次部署 git clean 会重置）→ `/data/careeros-uploads/` |
| 4 | pet 路由 `force-dynamic` | 三个 GET 路由禁止静态缓存 |
| 5 | 诊断 focus 生效 | "关注点"拼入 prompt（此前被丢弃）；深度版多搜竞对/舆情/薪酬三组 query |
| 6 | 诊断等待体验 | 文案说明 10-20s 调研耗时；拦截未登录 307 的登录页 HTML 当报告渲染 |
| 7 | 大师团历史 | localStorage 持久化 50 条 + 请求截断 20 条防 token 膨胀 + 清空按钮 |

### 11.3 日视图重叠事件修复（commit `5e140fb`）

**问题**：日程表中时间段重合的日程卡片出现视觉重叠——传递重叠链（A 重叠 C、C 重叠 B，但 A 与 B 不直接重叠）时，分组算法只匹配第一组就 break，导致跨组事件被拆到不同列。

**修复**：重叠分组改为收集所有匹配组 → 合并 → 再统一分配列宽。

### 11.4 v1.2.1 完整变更清单

| 影响范围 | 文件 | 类型 |
|----------|------|:--:|
| AI 对话路由 | `hr-roundtable/route.ts`、`job-diagnosis/route.ts`、`report/route.ts`、`chat/route.ts` | fix |
| 搜索 | `src/lib/ai/search.ts` | fix |
| 鉴权 | `middleware.ts`、`chat/route.ts`、`FloatingPet.tsx`、`desktop-pet/useChat.ts` | feat |
| 桌宠持久化 | `pet-settings.ts`（新）、`pet/settings/route.ts`、`pet/notifications/route.ts`、`pet/data-version/route.ts` | fix |
| 前端兜底 | `diagnosis/page.tsx`、`AISkillPanel.tsx` | fix |
| 部署脚本 | `server-deploy.sh`、`.env.example` | feat |
| 日视图 | `src/app/(app)/page.tsx` | fix |
| 文档 | `PRD-v1.2.md`、`TECH-PITFALLS.md`、`project-kims-careeros.md` | docs |

### 11.5 服务器上线必做

```bash
# 1. 服务器 /opt/hr-platform/.env 必须包含（缺一不可）
DEEPSEEK_API_KEY=sk-xxx       # ← 线上 AI 全哑的最直接原因
JWT_SECRET=随机长字符串
TAVILY_API_KEY=tvly-xxx       # 建议配，DDG 国内被墙
PET_TOKEN=随机字符串           # 建议配，防刷 DeepSeek 额度

# 2. 部署后验收
curl -N -X POST http://127.0.0.1:3000/api/ai/hr-roundtable \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
# 应看到流式文字输出，不是空响应
```

---

## 十二、v1.2.2 — 大师团增强 + 报告修复 + 部署健壮性（2026-07-22 ~ 07-23）

### 12.1 种子数据自动化（commit `9f0dd1b`）

**问题**：服务器数据库 `movie_quotes` 表为空时，首页电影台词永远不更新。

**修复**：`server-deploy.sh` 新增步骤 4.5——每次部署自动跑 `scripts/seed-quotes.js`（幂等，`INSERT ON CONFLICT` 自动跳过已有数据），失败不阻塞部署仅警告。

### 12.2 岗位诊断报告截断修复（commit `7cc39b4` + `1cc5cc7`）

**问题**：v1.2.1 修复了 `hr-roundtable` 和 `job-diagnosis` 路由的 `stopWhen`，但 **`report` 路由遗漏了**。ai-sdk v7 默认 `stepCountIs(1)`——调一次搜索后就停止，报告生成到一半被截断。

**修复**：
- `report/route.ts`：补 `stopWhen: isStepCount(3)`（与 07-22 AI 全哑同一根因）
- 曾临时加 `maxTokens: 4096`，但随即发现 **ai-sdk v7 不支持 `maxTokens` 参数**，已撤销（`1cc5cc7`）

| 文件 | 改动 |
|------|------|
| `report/route.ts` | + `stopWhen: isStepCount(3)`；导入 `isStepCount` |

### 12.3 大师智囊团用户身份注入（commit `7cc39b4`）

**问题**：大师智囊团不知道在跟谁对话——系统上下文只有公司库/人脉/市场洞察，没有用户自身信息。

**修复**：`hr-roundtable/route.ts` 上下文注入新增两项查询：

| 注入数据 | 来源 | 说明 |
|---------|------|------|
| 用户身份 | `Resume`（`isDefault: true`） | 默认简历标题 + 目标岗位 |
| 求职状态 | `JobApplication`（活跃，≤5条） | 当前投递：公司+岗位+阶段 |

大师现在知道对话对象是 HR 从业者、在投哪些岗位、处于什么阶段。

### 12.4 大师智囊团对话历史存档（commit `7cc39b4`）

`AISkillPanel.tsx` 新增完整对话会话管理：

| 功能 | 实现 |
|------|------|
| 会话存档 | `ChatSession` 结构（id/title/date/messages），localStorage `hr-roundtable-sessions` key |
| 自动存档 | 清空当前对话时自动将当前消息存档为会话 |
| 历史面板 | 点击「历史(N)」切换面板视图，卡片列表展示所有存档会话 |
| 加载历史 | 点击任意会话卡片恢复该对话的全部消息 |
| 容量限制 | 最多保留 20 个会话，超限自动丢弃最早 |
| 入口提示 | 空对话状态显示「📜 查看历史对话 (N)」引导 |

### 12.5 v1.2.1 部署上线（2026-07-23，commit `90a98a6`）

#### 部署卡点：.next 残缺 + PM2 崩溃循环

**真凶**：中断的构建留下残缺的 `.next`（无 `BUILD_ID`）→ `next start` 启动即崩 → PM2 无限重启（↺2445 次）→ CPU 200% 吃满 → 新构建抢不到资源"卡死" → 被迫重启服务器 → PM2 开机自启又拉起崩溃进程，死循环。

**连锁教训**：
1. **构建五段必须走完**：Compiled → Linting → Collecting page data → Generating static pages → Finalizing。脚本输出"构建成功"也可能骗人（本次 npm run build 表面成功但 BUILD_ID 缺失，疑似后期阶段被 OOM 杀）
2. **根治：加 swap**：`fallocate -l 2G /swapfile` + 写入 fstab。1.6G 内存的机器构建 Next.js 必须有 swap
3. **部署脚本早退陷阱**：代码已在 HEAD 但 `.next` 残缺时，脚本判断"代码已是最新"跳过构建。线上异常时先 `cat .next/BUILD_ID` 确认产物完整
4. **chmod 权限**：`chmod +x` 之后若 `git reset --hard`，执行权限被抹掉，需重新 chmod
5. **崩溃识别**：`pm2 logs` 的 ↺ 计数暴涨 + 同一错误刷屏 = 崩溃循环，先 `pm2 stop` 止血再查因

#### 线上验收结果

| 验收项 | 结果 | 备注 |
|--------|:--:|------|
| 报告截断修复 | ✅ | report API 200，完整报告 10KB、19 章节到附录 |
| 大师团身份注入 | ⚠️ | 代码正常，但数据库无默认简历+无活跃投递，无身份可注入 |
| 对话历史存档 | ⏳ | 待浏览器端验证 |

### 12.6 遗留待办（2026-07-23）

| # | 问题 | 说明 |
|---|------|------|
| 1 | report 路由 `focus` 参数类型 | 前端传数组时 `focus?.trim()` 抛 500，需加类型兼容 |
| 2 | 报告内容「目标公司名称缺失」 | 已传公司名但模型按通用画像写，疑似联网搜索被墙致上下文太弱，待观察 |
| 3 | 大师团身份注入复验 | 需 Kim 在数据库补默认简历 + 活跃投递后重新验证 |

---

## 十三、v1.2.2 — 内部战役模块（2026-07-24）

### 13.1 定位

**内部战役**是项目经历的**结构化记录池**，存储 Kim 在各个公司做过的项目成果。最终目标是成为**简历板块的数据源**（一键生成简历工作经历），并与**职业宇宙**联动（项目实践 → 点亮能力标签）。

当前阶段（P1）完成了项目 CRUD 和表单 UI，P2 职业宇宙联动、P3 简历 AI 生成待后续迭代。

### 13.2 数据模型

两层结构——公司层关联现有 `companies` 表，项目层挂载在公司下：

| 表 | 关键字段 |
|----|---------|
| `Company` | + `background` 字段（公司阶段/核心问题/加入原因） |
| `BattleProject` | companyId(FK)、projectName、role、startDate/endDate、origin、goal、reportTo、teamSize、departments、duration、phase1/2/3、results、shortcomings |
| `BattleProjectSkill` | skillName、category(hard/soft/domain/tool)、level(1-4)、description、targetLevel |

项目表单为公司信息 + 项目内容 + 能力沉淀三区块，公司下拉选择后自动带出行业/规模/背景（可手动修改）。

### 13.3 富文本编辑器

长文本输入框（缘由/目标/过程三段/结果/不足/公司背景）使用自研 contentEditable 富文本编辑器，支持：
- **加粗** / **下划线**
- **有序列表**（回车自动编号）/ **无序列表**
- **字号**（12/13/14/16/18/20px）
- **文字颜色**（8 色） / **高亮背景色**（7 色 + 清除）
- **全屏编辑模式**：点击 ⛶ 按钮放大到近全屏，写完收起回写

详情面板自动渲染 HTML，列表缩进紧凑（1.2em padding-left）。

### 13.4 交互

- 统一总览网格（无分类 tab），项目卡片显示项目名 + 公司 + 岗位 + 时间 + 目标摘要
- 点击卡片 → 居中浮窗展开详情（1100px × 95vh，缩放动画）
- 详情面板分区展示：公司背景 → 缘由 → 目标（绿底） → 角色与团队（网格） → 过程（三段分色） → 结果（绿底大字号） → 不足（黄底） → 能力沉淀

### 13.5 页面入口

侧边栏 实战沙盘 → 内部战役（`/battle/internal`）

### 13.6 API

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/battle-projects` | GET/POST | 列表 + 创建（同步写入公司行业/规模/背景） |
| `/api/battle-projects/[id]` | GET/PATCH/DELETE | 单条 + 更新 + 技能批量替换 |

### 13.7 待后续（P2/P3）

- P2：手动打标 + AI 推荐 → 职业宇宙联动（`/growth/career-sphere`）
- P3：简历编辑器内勾选项目 → AI 生成工作经历段落

