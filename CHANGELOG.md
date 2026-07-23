# Changelog

Kim's CareerOS 版本记录。每个版本对应一个 Git tag，GitHub 上可浏览该版本完整代码。

---

## v1.2.2 — 内部战役 + 大师团增强 + 部署健壮性（2026-07-23 ~ 07-24）

**定位**：建设项目经历结构化记录池，补完大师团体验，修复线上部署问题

### 内部战役（/battle/internal）— 07-24 新增
- **项目 CRUD**：两层数据模型，公司层关联 `companies` 表（+background 字段），项目层 19 字段覆盖完整项目生命周期
- **三区块表单**：公司信息（选择公司自动带出行业/规模/背景，可编辑）+ 项目内容（缘由/目标/角色团队/过程三段/结果/不足）+ 能力沉淀（技能名/分类/等级/描述/目标等级，可无限新增）
- **自研富文本编辑器**：B/U/有序列表/无序列表/字号/文字颜色/高亮色，全屏编辑模式
- **设计统一**：总览卡片网格 + 居中浮窗详情面板（分区展示，过程三段分色，结果绿底，不足黄底）
- **数据模型**：`battle_projects` + `battle_project_skills` 两张新表
- **待后续**：P2 职业宇宙联动、P3 简历 AI 生成

### 大师团增强（07-22 ~ 07-23）
- 大师团用户身份注入：hr-roundtable 自动注入默认简历目标岗位 + 活跃投递
- 大师团对话历史存档：ChatSession + localStorage + 历史面板 UI + 清空自动存档
- deploy 脚本种子数据步骤（幂等，防空 movie_quotes 表）

### 修复
- report 路由补 `stopWhen: isStepCount(3)`（v1.2.1 遗漏，与 AI 全哑同根因）
- 移除不存在的 `maxTokens` 参数（ai-sdk v7 不支持）

### 部署
- 线上验收：报告 ✅ / 身份注入 ⚠️（待补数据）/ 历史存档 ⏳
- .next 残缺 → PM2 崩溃循环 ↺2445 根因定位 + swap 根治

---

## v1.2.1 — AI 上线修复 + 安全加固（2026-07-22）

**定位**：修复 v1.2 上线后 AI 全哑，补全大师智囊团用户体验

### AI 静默失败修复（07-22）
- **根因（4 因叠加）**：服务器缺 `DEEPSEEK_API_KEY` → ai-sdk 流内抛错被静默吞；`streamText` 默认 `stopWhen: stepCountIs(1)` → 调一次搜索就停；report 路由返回 JSON 但前端按流式读；桌宠 API 未 git add 致 404
- **修复**：三个 AI 路由加 `stopWhen`（hr-roundtable 8 步 / job-diagnosis 6 步 / report 3 步）+ `onError` 日志；report 改为 `toTextStreamResponse()` 流式纯文本；搜索 DDG 超时 8s→5s
- **部署脚本增强**：强制校验 `DEEPSEEK_API_KEY`/`JWT_SECRET`；`TAVILY_API_KEY` 缺失警告；新增种子数据步骤（`scripts/seed-quotes.js` 幂等插入）

### 安全加固
- `/api/ai/` 移出免登录白名单（此前陌生人可裸调刷 DeepSeek 额度）
- `/api/chat` 加 `PET_TOKEN` 请求头校验
- 桌宠设置持久化移出 `src/data/` → `/data/careeros-uploads/`（防部署 git clean 重置）

### 大师智囊团增强（07-22 ~ 07-23）
- **用户身份注入**：大师对话自动注入默认简历目标岗位 + 活跃投递状态，知道在跟谁对话
- **对话历史存档**：`ChatSession` 结构 + localStorage 持久化，清空自动存档，历史面板浏览，最多 20 个会话
- 诊断 `focus` 参数生效（此前被丢弃）；深度版多搜竞对/舆情/薪酬
- 诊断等待体验：文案说明 10-20s 调研耗时；拦截未登录 307→HTML 误渲染

### 日视图修复
- 重叠事件分组算法修复：传递重叠链（A 重叠 C、C 重叠 B）时收集所有匹配组再合并分配列宽

### v1.2.1 部署上线（07-23）
- **部署卡点**：中断构建 → `.next` 残缺（无 BUILD_ID）→ PM2 崩溃循环 ↺2445 → CPU 200%
- **根治**：加 2G swap + 构建五段验证 + 部署脚本早退陷阱识别
- **验收**：报告截断修复 ✅；身份注入代码正常 ⚠️（待补数据复验）；历史存档待浏览器验证

### 技术坑点
- `maxTokens` 参数在 ai-sdk v7 中不存在，会导致运行时错误
- report 路由 `focus` 传数组会 500（`focus?.trim()`），待加类型兼容

---

## v1.2 — AI 集成 + UX 重构（2026-07-21）

**定位**：AI 深度集成到求职工作流，全站设计统一

### Web AI 工具
- **岗位诊断**：JD + 简历 + 公司名 → AI 联网调研 → 红黄绿灯报告。结构化输入 + 文件解析 + 流式 Markdown 报告
- **大师智囊团**：6 位 HR 大师虚拟顾问团（查兰/尤里奇/沙因/鸿鹄/平克/桑德伯格），三轮追问 → 观点交锋 → CHO 小七综合结论。数据串联：自动注入公司库/人脉库/市场洞察
- **AI 基础设施**：Vercel AI SDK v7 + DeepSeek (`deepseek-chat`) + DuckDuckGo/Tavily 搜索

### UX 重构
- **求职流水线**：`/personal` 五阶段（投前诊断→已投递→面试追踪→Offer 对比→入职准备），hover 弹窗 + 点击展开 + 右侧滑出面板 + 阶段流转按钮
- **侧边栏重构**：精简为平级 6 入口（首页/求职/职业宇宙/HR工作台/知识库/设置），收起显示 4 图标
- **设计统一**：暖米白底 + 品牌紫 #8b7cf0 + 柔和阴影 + 0.15-0.25s 过渡 + 统一页面模板
- **设计令牌**：`src/lib/design-tokens.ts` + AntD ConfigProvider 全局主题

### 桌宠（芝士）
- Tauri 2.0 桌面悬浮窗口 AI 伙伴，Phase 1 代码完成（14 tools + 语音 + 多变人格）
- v1.2.1 拆分为独立嵌套仓库 `桌宠-芝士/`，HTTP + PET_TOKEN 与本仓库 API 通信

---

## v1.1.1 — 日视图精准化（2026-07-15）

**定位**：日视图从"小时级"升级到"15分钟级"，支持时间跨度 + 必须参加 + 拖拽调整

### 日视图重构
- **15 分钟时间块**：每小时拆为 4 块，每块 16px，48 行/栏，整点实线分隔
- **时间跨度**：新增 `endTime` 字段，日程可跨越多个时间块（如 13:45-14:30 占 3 块）
- **重叠并列**：同时段多个日程自动并排显示（贪心列分配算法），等分日历宽度
- **必须本人参加**：新增 `mustAttend` 字段，🔴 标识 + 加粗边框 + 饱和底色，优先占左侧列
- **当前时间红线**：红色横线 + 左侧圆点，z-index 最高，浮在所有日程上方
- **拖拽调整时间**：上/下边缘拖动调开始/结束时间，中间拖动整体平移，DOM 直控零卡顿
- **时区修正**：dayjs 统一使用 `Asia/Shanghai`，解决服务器 UTC 导致的时间错位

### Schema 扩展
- `Todo` 新增：`endTime String?`、`mustAttend Boolean @default(false)`

### 修复
- 时间对齐：纯 div + box-sizing:border-box + +1 行渲染补偿
- 去除 15 分钟块间虚线，保持界面干净
- 事件层 `bottom:0` 改为显式 `height`，消除跨浏览器渲染偏差
- **电影台词不更新**（2026-07-21）：API 路由缺少 `dynamic = 'force-dynamic'` 导致 Next.js 静态缓存响应 + 客户端 `todayStr` 不跨天刷新。加 `force-dynamic` + `Cache-Control: no-store` + `setInterval` 每分钟检查跨天。

---

## v1.1 — 求职深化 + 职业宇宙（2026-07-12）

**定位**：求职全链路管理 + 职业能力可视化

### 新增模块
- **职业宇宙** (`/growth/career-sphere`)：3D 白色粒子球体（380粒子），CSS preserve-3d + rAF 零 React 重渲染，10 赛道（3 赛道可用）
- **引力透镜** (`/growth/domain/[domain]`)：轨道星系 rAF 动画 + 拖拽旋转 + 深度排序 + 左侧能力面板
- **能力详情** (`/growth/domain/[domain]/[track]`)：技能按分类分组 + 均分统计
- **投递管理** (`/job-seeking/applications`)：四列卡片网格 + 意向池 + 状态流转
- **OB 同步管线**：`npm run sync` + pre-commit hook 自动触发

### UI 升级
- 侧边栏毛玻璃 + 卡片翻转动画（收起仅 10px 隐形触发带）
- Logo 从 SVG 图片改为纯文字 "Kim's CareerOS"
- 隐私模式 ⭐：一键隐藏个人内容
- 本周重点便签：日/周视图 + 工作/个人分区
- 电影台词系统：数据库 204 句，日抛不重样，覆盖 10+ 语言
- 登录页 16 种字体风格系统

### Schema 扩展
- `JobApplication` 新增：`jdLink`、`jdText`、`resumeVersion`、`endReason`、`location`
- 新增 `SalaryNegotiation`、`MovieQuote`、`WeeklyFocus` 表
- 数据文件 `src/data/domain-tracks.ts`（18 赛道，110+ 技能，当前 Mock）

### 待完成（v1.1 后续）
- 面试管理、Offer 管理子页面
- 分享链接
- AI 功能集成

---

## v1.0 — 正式上线（2026-07-11）

**定位**：上云 + 可日常用

### 基础设施
- 部署到阿里云轻量服务器 139.196.159.68
- PostgreSQL 17（服务器本地 Docker）
- 域名 www.kimstar.cn + ICP 备案 + HTTPS（Let's Encrypt）
- 管理员登录（密码认证 + JWT 7 天 + middleware 路由保护）
- 登录页极简白底 + "访客浏览"按钮

### 首页日历系统
- 日/周/月/年四视图，默认日视图
- 三栏布局：上午(00-12) | 下午(12-24) | 待办（1:1:0.5）
- 拖拽日程 + 快速添加栏（色轮 + 分类标签 💼🐱）
- 待办完成自动下沉 + 顺延机制（持续顺延直到确认）
- 周报一键导出（Markdown 按天分组）
- 法定节假日自动显示

### UI 统一
- 全系统 11 页统一：暖米白底 `#faf8f6`、主色 `#8b7cf0`、圆角 14-20
- 18 套 SVG 矢量主题系统 + 随机切换
- 设计令牌 `src/lib/design-tokens.ts` + Ant Design ConfigProvider 全局主题

### 文件解析
- 支持 7 种格式：PDF / Word(.docx/.doc) / Excel(.xlsx/.xls) / 图片(OCR) / Markdown / HTML
- 确认入库流程：上传→解析→编辑确认→入库

### 数据库
- 21 张表，34 个 API 路由（含 15 个 [id] 动态路由）
- 首页动态聚合 API：从 8 个业务表拉取最近记录

---

## v0.2 — MVP（2026-06-24）

**定位**：真实可用，数据不丢

### 后端
- PostgreSQL 17 + Prisma 接入
- 15 个 [id] 动态路由（PATCH/DELETE 全覆盖）
- 首页动态聚合 API

### 前端
- 7 个页面 Mock → API 驱动迁移
- 共享 `useApiList` hook（统一 API-first + Mock 降级）
- 候选人库合并到人脉库

---

## v0.1 — 可交互原型（2026-06-21）

**定位**：能看到样子，数据全 Mock

### 产出
- 10 个页面全部有 UI
- 14 个 Prisma 数据模型
- 19 个 API 路由（仅 GET + POST）
- 文档解析引擎（PDF + 图片 OCR + Markdown）
- FileUpload + AttachmentList 共享组件
- 阿里云部署脚本

### 局限
- 页面数据全为 Mock，刷新即丢失
- 页面间数据不互通
- 缺 PATCH/DELETE 路由
