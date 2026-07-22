# Kim's CareerOS

## 一句话定位
HR 从业者个人职业管理平台，涵盖「我的职业发展」和「HR 工作台」两大板块。

## 当前状态
**v1.2.1 — 2026-07-22**

| 交付项 | 状态 |
|--------|------|
| 服务器 | 阿里云轻量 139.196.159.68（Ubuntu 24.04） |
| 访问地址 | https://www.kimstar.cn（密码 111） |
| 数据库 | 服务器本地 PostgreSQL + 每日 2:00 自动备份 |
| AI 模型 | DeepSeek（`deepseek-chat`），Vercel AI SDK v7 |
| 搜索 | DuckDuckGo 免费搜索（Tavily 可选升级） |

## 版本历史

| 版本 | 日期 | 内容 |
|------|------|------|
| **v1.2.1** | 2026-07-22 | AI 上线修复：stopWhen/流式协议/env校验/鉴权加固/桌宠持久化/日视图重叠事件分组修复/onError 全路由覆盖 | AI 集成 + UX 重构：求职流水线五阶段、岗位诊断API、面试追踪表单、全站设计统一、侧边栏平级6入口、42项UI修复、设计规范+skill规则 |
| **v1.1.0** | 2026-07-16 | 职业宇宙(3D粒子球)+引力透镜(rAF动画)+能力地图(SVG雷达图)、求职看板、侧边栏毛玻璃+翻转动画、隐私模式⭐、电影台词系统(204句)、周报导出、LOGO主题(18套)+字体(16种) |
| **v1.0.0** | 2026-07-11 | 上线交付：首页三栏日历(日/周/月/年)+拖拽+顺延待办、10个CRUD页面、密码登录+JWT、PostgreSQL 17(21表)、文件解析(7格式)、服务器部署+域名备案+HTTPS |

### 2026-07-21 交付
| 交付项 | 内容 |
|--------|------|
| 求职流水线 | `/personal` 五阶段全流程（投前诊断→已投递→面试追踪→Offer对比→入职准备），hover弹窗+卡片网格+右侧滑出面板+阶段流转按钮 |
| 岗位诊断 | 表单内嵌诊断：简历选择→JD粘贴→调用 `/api/ai/job-diagnosis/report`（服务端搜索+DeepSeek）→ 保存并追踪 |
| 卡片重构 | 职位·公司同行排列，能力标签全流程展示，流转按钮统一右下角 |
| 面试追踪 | 详情面板新增「+ 新增轮次」表单（面试官/角色/能力标签/问题/感受/复盘） |
| 诊断报告 | API返回完整报告(5000+字)，详情面板点击「查看完整报告」→新标签页HTML |
| 侧边栏 | 平级6入口，收起4图标，logo锁定系统字体 |
| 页面标题 | 「我的求职」替换「Job Seeking/求职控制台」 |
| UI 升级 | 设计令牌统一、语义色降饱和、全局阴影/圆角/字号统一、页面切换动画、弹窗fade-in |
| 设计规范 | PRD §5-6 + `memory/design-spec-v1.2.md` + CLAUDE.md §5 skill调用规则 |
| Skill 强制 | CLAUDE.md §5 + `.claude/settings.local.json` PreToolUse hook |
| 已知问题 | 诊断API curl测试正常(4470字)，浏览器端有缓存/端口冲突待明天排查 |

## 交互约束（2026-07-01）

### 数据同步铁律
首页日/周/月/年视图共享同一批 `todos` 数据。任何交互（添加、编辑、完成、删除）都必须确保所有视图看到的数据一致。

**关键规则：**
1. 数据拉取覆盖前/当/后三个月（`prev + curr + next`），确保周视图跨月不丢数据
2. 切换视图时重新拉取（依赖 `[view, currentDate]`），但范围一致保证数据相同
3. 改动后同时更新 API + 本地 state，不依赖 refetch 来反映变更

### 顺延待办逻辑
- 所有过去日期未完成 + 无时间的项 → 今天日视图"顺延"区域显示（持续顺延直到确认完成）
- 仅今天视图显示顺延区域，查看过去/未来日期时不显示
- 有时间的项是固定日程，不顺延
- 勾选完成顺延待办时，日期自动改为今天，记录留在完成当天

### 编辑弹窗
- 待办模式：仅显示 分类/颜色/事项/日期
- 日程模式：额外显示 时间/地点/描述/提醒/重复
- 入口决定模式：待办列/快速添加"待办"→待办；时间槽/快速添加"日程"→日程

### 快速添加栏
- 默认"待办"模式（isTodo=true）
- 添加时不带时间，自动归入待办列

## 架构概览
技术栈：Next.js 14 (App Router) + Ant Design 5 + Prisma + PostgreSQL + Tailwind CSS

关键目录：
- `src/app/` — 页面路由（10 个页面 + 5 个 API 模块）
- `src/components/` — 共享组件（FileUpload, AttachmentList, layout）
- `src/lib/` — 工具函数（prisma 客户端, parsers 解析引擎）
- `prisma/schema.prisma` — 数据模型（14 个 Model）
- `src/app/api/` — REST API（按实体模块组织）

## 模块清单

| 模块 | 状态 | 关键说明 |
|---|---|---|
| 首页看板 | ✅ v1.0 | 三栏日视图 + 拖拽 + 顺延 + 四视图 + 分类标签 + 周报导出 |
| 能力地图 | ✅ v2.1 | 引力透镜 GravityLens（轨道星系+rAF动画+深度排序+左侧能力面板）+ 三级能力详情页。共享组件 GravityLens.tsx，嵌套动态路由 `/growth/domain/[domain]` + `/[track]` |
| 职业宇宙 | ✅ v1.1 | 3D 粒子球体(380粒子)纯黑底 + 自转/手转 + 右侧钢琴键 + 球面标签。侧边栏深色自适应（AppLayout 路由检测） |
| 行政赛道 | ✅ v1.1 | 5 个行政职能赛道，数据在 domain-tracks.ts，引力透镜展示 |
| 产品赛道 | ✅ v1.1 | 5 个产品职能赛道，数据在 domain-tracks.ts，引力透镜展示 |
| OB 同步管线 | ✅ v1.0 | `scripts/sync-ob-tracks.js` 自动解析 OB 笔记 → 生成 `domain-tracks.ts`，pre-commit hook 自动触发。当前数据为 Mock，需 OB 复盘沉淀后同步覆盖 |
| 求职管理 | ✅ v1.1 | 概览看板 + 投递子页面（四列卡片 + 意向池 + 状态流转） |
| 投递管理 | ✅ v1.1 | 四列卡片网格 + 意向池/已投递/已结束 + 弹窗详情 + 状态流转 |
| 面试管理 | 📋 v1.1 | 待开发：按公司分组面试进度 |
| Offer管理 | 📋 v1.1 | 待开发：Offer对比 + 决策 |
| 薪酬与晋升 | ⚠️ 骨架 | Mock，待 v1.1 |
| 成长档案 | ⚠️ 骨架 | Mock，待 v1.1 |
| 简历与求职信 | ✅ v1.0 | API 驱动 + 文件上传解析确认 |
| 候选人库 | ✅ v1.0 | API 驱动 + 简历导入/解析确认 |
| 招聘知识库 | ✅ v1.0 | API 驱动 |
| 市场洞察 | ✅ v1.0 | API 驱动 |
| 公司库 | ✅ v1.0 | API 驱动 |
| 人脉库 | ✅ v1.0 | API 驱动 |
| 文档解析 | ✅ v1.0 | PDF/Word/Excel/图片/MD/HTML (7种) |
| 数据库 | ✅ v1.0 | PostgreSQL 17，21 张表 |
| API 路由 | ✅ v1.2 | 34+ REST + 5 AI 路由（chat / job-diagnosis / report / hr-roundtable / parse-resume） |
| 登录认证 | ✅ v1.0 | 密码登录 + JWT + middleware |
| Logo 主题 | ✅ v1.0 | 18 套 SVG + 随机切换 |
| 域名 | ✅ v1.0 | www.kimstar.cn，ICP 备案 2026-07-11 通过 |
| 服务器部署 | ✅ v1.0 | 139.196.159.68，本地 PostgreSQL |
| DNS + HTTPS | ✅ v1.1 | Let's Encrypt 证书 + Nginx，自动续期 |
| 数据同步 | ✅ v1.0 | pg_dump + SQL 导入，21条待办已同步 |
| 分享链接 | 📋 v1.0 | 待开发 |
| 个人总览 | ✅ v1.2 | `/personal`：统计卡片 + 本周重点 + 最近动态 + AI 工具入口 |
| HR工作台总览 | ✅ v1.2 | `/workbench`：统计卡片 + 最近公司 + 最近人脉 |
| 岗位诊断 | ✅ v1.2 | `/job-seeking/diagnosis`：结构化表单 + 文件上传简历 + 一键生成红黄绿灯报告 |
| 大师智囊团 | ✅ v1.2 | 嵌入 `/personal`：6 大师圆桌 + 三轮追问 + CHO 结论 |
| AI 基础设施 | ✅ v1.2 | DeepSeek + Vercel AI SDK v7 + DuckDuckGo 搜索 + 简历解析 |
| AI 桌宠助手 | ⏸️ 暂停 | 2026-07-16 暂停。代码保留在 `desktop-pet/`，详见 `docs/PRD-v1.2.md` |
| 面试管理 | 📋 v1.1 | 待开发 |
| Offer管理 | 📋 v1.1 | 待开发 |

**2026-07-11 | [UI] 侧边栏毛玻璃+卡片翻转，Logo纯文字化**
- 四个方案试过后，Kim 选了方案三（毛玻璃）+ 方案四（翻转动画）混搭
- Logo 从 SVG 图片改为纯文字，Kim 说"不要白底，只要字幕"
- 登录页背景去色、字体调大 2 倍、不加粗；侧边栏字体经多次调整定在 14/20

**2026-07-11 | [功能] 隐私模式 ⭐ + 本周重点便签**
- Kim 的隐私需求：同事可能看到屏幕，个人求职信息需隐藏
- 方案：⭐ 切换按钮放在待办标题右侧，一键隐藏所有个人内容
- 周重点弹窗分工作/个人两个输入区，自动保存
- 日视图排版：周重点在上 → 待办在下（分隔线在待办上方），顺延任务去掉"顺延"标签

**2026-07-11 | [内容] 电影台词系统：数据库 204 句，日抛不重样**
- Kim："电影台词还是太少，可以收录全世界不管哪种语言"
- 改为数据库存储（`movie_quotes` 表），每天随机取一句未使用的，用完自动重置
- 204 句覆盖 10+ 语言：华语、英、日、韩、印地、泰、波斯、土耳其语等
- 非中文台词翻译独立一行显示在原文下方
- Kim："用一句删一句，这样数据库也不会有太大压力"

**2026-07-11 | [UI] 登录页 16 种字体风格系统**
- Kim："kims英文字母字体也扩充多一些，不同颜色不同字体，花体斜体至少10种"
- 16 种风格：衬线/斜体/手写/等宽/粗体/打字机/细体等，每点一次换一种同时出密码框
- 字体选择存 localStorage，侧边栏 "Kim's CareerOS" 同步显示
- Kim："点击任何地方都能跳转到输入密码界面" → 点击文字 = 出密码框 + 换字体

**2026-07-11 | [里程碑] ICP 备案通过**
域名 www.kimstar.cn 备案已通过。下一步：阿里云 DNS 添加 A 记录 → Nginx 更新 server_name → certbot 申请 HTTPS 证书 → 恢复 Cookie Secure。

**2026-07-02 | [部署] v1.0 上线，服务器本地 PostgreSQL 替代云 RDS**
个人工具没必要花钱买云 RDS，服务器上直接跑 PostgreSQL 即可。后续有需要再迁。

**2026-07-02 | [Bug修复] standalone 模式 + Cookie Secure 导致部署后登录失败**
- standalone 模式导致 `next start` 静态资源加载失败，改用标准模式
- Cookie `Secure` 标志在 HTTP 下导致浏览器拒绝保存 cookie，登录失败。临时改为 `false`，HTTPS 配好后恢复

## 决策记录

**2026-07-10 | [架构] 职业宇宙二级页面 — 引力透镜设计（完整交付）**
- 职业宇宙 → 领域 → 赛道 三层导航架构落地：
  - L1：职业宇宙（3D 球体，不变）
  - L2：引力透镜 `GravityLens` 组件（右轨道星系 + 左能力面板），替换旧的 DomainSkillMap 卡片堆叠
  - L3：赛道能力详情 `/growth/domain/[domain]/[track]`，技能按分类分组展示
- 设计语言：延续职业宇宙的深空主题（`#0d0d0d` 背景、粒子、rAF 动画），从"宇宙全景"→"星系探索"→"星球着陆"叙事一致
- URL 结构：嵌套动态路由 `domain/[domain]` + `domain/[domain]/[track]`，面包屑统一格式 `职业宇宙 - HR - TA`
- 数据：补全 HR 8 赛道 / 行政 5 赛道 / 产品 5 赛道共 18 条赛道 + 110+ 项技能（当前 Mock，等待 OB 复盘沉淀后同步覆盖）
- 交互：rAF 轨道旋转 + 拖拽转向 + 点击选中放大 + 左侧面板动画滑入 + 节点深度排序（前景/背景）
- 二级不展示职级对标和打分，仅展示关键能力(8项)和描述；三级不展示雷达图
- 侧边栏深色自适应：职业宇宙体系页面自动切换侧边栏背景为 `#0d0d0d`（AppLayout 路由检测，原生 `<aside>` 绕过 Antd CSS 覆盖）
- 全部页面去除 emoji，纯文字标题
- 用户原话："右侧轮盘+左侧能力，有创意的形式" / "背景和母页面一致" / "图表拿掉" / "emoji 去掉"

**2026-07-09 | [架构] 职业宇宙 + 能力地图 v2.0 完整交付**
全程反复迭代至 Kim 满意的版本，核心产出：

**职业宇宙（`/growth/career-sphere`）**
- 3D 球体用 CSS `preserve-3d` + rAF 直接 DOM 操作，避免 React 重渲染
- 球面 380 白色粒子 + 3 层参考环 + 辉光，纯黑背景 `#0d0d0d`
- 球体标签 2D 覆盖层：rAF 投影 3D→2D 坐标，字体始终正向，深度缩放 + 透明度渐变
- 右侧纯文字钢琴键列表：hover 滑出 + 字间距展开 + 球面联动高亮
- 点击已开通赛道（HR/行政/产品）进入细分能力地图，其余提示"即将开放"

**能力地图重构**
- 提取共享组件 `DomainSkillMap.tsx`：CardStack + SkillChip + MiniRadar + DetailPanel + 职级对标
- 创建 `src/data/domain-tracks.ts`：HR 8 赛道 / 行政 5 赛道 / 产品 5 赛道，每赛道 6-8 技能
- 动态路由 `/growth/domain/[slug]` 自动匹配数据
- 卡片堆叠交互：左右大箭头 + 拖拽滑动 + 点击展开详情
- 职级对标面板：助理/专员/经理/总监 四级技能计数条 + 综合评定

**侧边栏**：能力地图 → 职业宇宙（直连 `/growth/career-sphere`）

**2026-07-09 | [架构] OB 知识库 ↔ CareerOS 数据同步管线**
- 数据源唯一真相：`D:\ob\个人\项目复盘\原始复盘\` 下的项目复盘笔记
- 同步脚本 `scripts/sync-ob-tracks.js`：扫描 OB 笔记 → 解析 domain/track/skill → 自动生成 `src/data/domain-tracks.ts`
- Git pre-commit hook：每次 commit 自动跑 `npm run sync`，确保提交的代码与 OB 数据一致
- 目录结构：`原始复盘/` = 输入区（用户写），`HR/行政/产品/...` = 归档区（脚本按赛道分类后移入）
- 服务器兼容：脚本检测 OB 目录不存在时自动跳过（服务器仅消费 git 仓库中的 `domain-tracks.ts`）
- 球体页面的 10 个赛道列表由 `ALL_DOMAINS` 动态生成，有 OB 数据可点击、无数据灰色
- 命令：`npm run sync`（本地手动）或自动（git commit 触发）

### 归档批注规则（2026-07-09）

每次将 OB 笔记从 `原始复盘/` 归档到赛道文件夹时，在文件末尾添加两段批注：

**① 表达建议**：指出原文中表达不够书面化/不够精准的地方，给出修改建议
**② 项目总结**：对这个项目的整体分析——做对了什么、可以改进什么、对标行业最佳实践

格式：
```md
---

## 📝 批注

### 表达建议
- 原文「xxx」→ 建议改为「xxx」，原因：xxx

### 项目总结
xxx（100-200 字）
```

目的：既帮助 Kim 提升书面表达能力，也提供外部视角的项目复盘深度。

**2026-07-09 | [设计] 能力地图 v2.0 — 卡片堆叠 + 职能赛道 + 职级对标**
- 交互式卡片堆叠：左右大按钮 + 拖拽滑动切换，点击进入详情面板
- 岗位改为 8 个 HR 职能赛道（TA/HRBP/C&B/SSC/L&D/ER/雇主品牌/OD）
- 卡片两栏布局：左侧技能气泡 + 描述，右侧「职级对标」面板
- 职级对标：按 助理/专员/经理/总监 四级统计技能数量 + 均分 + 综合对标等级
- 保留 Popover 技能编辑和 SVG 雷达图

**2026-07-08 | [产品] 能力地图 Demo 上线 + v1.2 人生设计集成方向确认**
- 能力地图作为成长档案子页面（`/growth/skill-map`），四分类+四级掌握程度+SVG雷达图
- Kim 分享了个人人生设计蓝图，正北方向确认为"持续创造、被看见、不需要批准"
- CareerOS 从"职业管理工具"升级为"人生设计导航仪"——记录的不只是工作，是所有的创造和生长
- v1.2 五个落地方向：能量日记、创作项目类型、奥德赛路径标签、"第一次"里程碑、首页能量组件
- 详见 `docs/PRODUCT.md` 第八、九章

**2026-07-08 | [Bug修复] 顺延待办持续顺延直到确认，仅今天视图显示**
- 问题：顺延只查 `t.date === yesterdayStr`，两天前未完成待办不会出现在今天顺延区
- 修复：改为 `t.date < todayStr`（所有过去日期），且用 `isTodayDetail` 守卫仅今天视图渲染
- 用户原话："不是只顺延到后一天，是一直顺延直到确认，但是今天没过完之前在其他天数不显示"

**2026-07-06 | [设计] 投递卡片定版：四列网格 + 弹窗详情**
- 4 列卡片网格，每张卡片精简：公司/岗位/行业Tag/薪酬/状态Tag（右上角）
- 点击弹出居中 Modal 展示完整信息（公司/规模/行业/岗位/Base/城市/薪酬/JD/备注）
- 右下角显示投递日期（具体日期），不是相对天数
- 状态 Tag 右上角，色系：紫=意向池 橙=已投递 灰=已结束
- 编辑表单分三区：公司信息/岗位信息/JD与备注
- 卡片模板后续面试/Offer 页面复用

**2026-07-06 | [架构] 求职拆分为二级导航：概览 + 投递**
求职不再是扁平单页，而是概览看板（原四列）+ 投递三栏看板（未投递/已投递/已结束）。后续加 面试、Offer 子页面。Schema 扩了 jdLink/jdText/resumeVersion/endReason 四个字段，currentStage 新增"未投递"值。

**2026-07-06 | [设计] 投递三栏看板交互**
- 未投递 = 意向池，快速录入（公司+职位+链接，30秒完成），点"已投递"按钮弹出确认框补全渠道/日期/简历版本
- 已投递 = 等待反馈，显示投递天数和渠道
- 已结束 = 归档，必须选结束原因（简历挂/面试挂/Ghost/自己放弃/已入职）
- 结束原因填了才能归档，防止随便丢进去

**2026-06-24 | [技术选型] 本地 PostgreSQL 17，生产上阿里云**
开发和生产保持同一数据库类型。本地通过 winget 安装，密码认证用 scram-sha-256。生产环境 deploy.sh 已有完整 PostgreSQL 配置。

**2026-06-24 | [架构] 创建共享 useApiList hook 统一 API 调用模式**
7 个页面原本各有各的 fetch + local fallback 实现，抽取为一个通用 hook（`src/lib/hooks/useApi.ts`），统一 API-first + Mock 降级逻辑。减少重复代码，后续新页面直接复用。

**2026-06-24 | [产品] v1.0 定位为"全部上云 + 正式可用"**
域名 www.kimstar.cn，阿里云 RDS PostgreSQL，部署到已有轻量服务器。先上云再补 AI 功能。

**2026-06-24 | [设计] 18 套 SVG 矢量主题系统**
Logo 从 PNG 升级为 SVG，天然透明无白底。每套主题映射 sidebarBg + accentColor。随机选择存 localStorage。

**2026-06-24 | [交互] 登录页极简设计**
Logo 居中 1/3 屏宽，下方"访客浏览"按钮。点击 Logo 才弹出密码框。未登录不展示侧边栏。

**2026-06-24 | [功能] 文件解析确认入库流程**
上传→自动解析→弹窗编辑确认→点"确认入库"才写入数据库。中间态不落库，用户有机会修正 OCR 错误。

**2026-07-01 | [Bug修复] 顺延待办 + 侧边栏跳转 + 视图同步 + 编辑弹窗精简 + sticky header 透明**
- 6 个 bug 修复，详见技术坑点
- 新增交互约束规则（数据同步铁律、顺延逻辑、编辑弹窗模式区分）
- 移除逾期功能

**2026-07-01 | [设计] 日视图三栏布局 + 交互完善**
- 日视图改为三栏并排：上午(00-12) | 下午(12-24) | 待办，比例 1:1:0.5，独立滚动
- 日程支持拖拽到任意时间段（HTML5 drag & drop）
- 删除按钮直接删除，去掉确认弹窗
- 待办勾选后自动下沉到已完成区
- 待办顺延机制：前一天未完成的待办顺延到次日展示（持续顺延直到确认完成）
- 电影台词移到标题同一行右侧
- 生产构建比 dev 稳定，频繁改文件后建议 build+start

**2026-06-30 | [设计] 全系统 UI 统一：圆润 · 简单 · 大气**
- 新建 `src/lib/design-tokens.ts`：统一圆角(10/14/20/28)、阴影(3级)、间距(4/8/16/24/32)、色板
- `AntdConfigProvider` 接入主题 primaryColor，ConfigProvider 包裹全局，Ant Design 组件自动继承
- 11 个页面全部统一：暖米白底色 `#faf8f6`、主色 `#8b7cf0`、圆角 14-20、柔和阴影、药丸按钮
- 新建共享组件：PageWrap/PageCard/StatBar
- globals.css 清理死代码，只保留基础重置 + 自定义滚动条

**2026-06-30 | [功能] 任务分类标签 + 周报一键导出**
- Todo 模型新增 `category` 字段（work/personal/null）
- 快速添加栏和编辑弹窗均支持工作/个人分类切换
- 日视图时间线、周/月日历格子均用标签或 emoji 展示分类
- 周视图导航栏新增「导出周报」按钮，点击生成 Markdown 格式周报（按天分组、完成状态、分类标记、完成率统计），可一键复制

**2026-06-30 | [设计] 首页仪表盘改版：日视图 + 待办日历二合一**
- 新增「日」视图（周/月/年/日四 tab）
- 日视图 = 统一枢纽：顶部快速添加栏（标题+时间chips+选色+日程/待办切换→回车即添加）+ 无时间待办置顶 + 24h 时间线 + 当前时刻高亮
- 周/月/年视图去掉右侧待办面板，日历全宽铺满
- 去掉两个"新建"按钮，点击日期格子切换到日视图
- 点击已有日程弹出编辑弹窗（完整字段含地点/描述/提醒/重复）
- 点击空闲小时→时间标签自动选中+输入框聚焦

**2026-06-24 | [架构] 15 个 [id] 动态路由采用统一模板**
PATCH/DELETE 路由遵循相同结构：try/catch → prisma 操作 → NextResponse。公司关联用 findFirst + create（name 非唯一字段，不能用 upsert）。

**2026-07-21 | [架构] v1.2 AI 集成：Web AI 工具替代独立桌宠路线**
- 决策：AI 能力集成到 CareerOS Web 应用内，而非独立桌面应用
- 两个 AI 工具落地：岗位诊断（结构化表单+一键报告）和大师智囊团（六大师圆桌+内嵌聊天）
- AI 基础设施复用：DeepSeek + Vercel AI SDK v7 + DuckDuckGo 搜索（零外部依赖）
- 桌宠 Phase 1 代码保留在 `desktop-pet/`，但暂停推进
- 用户原话："这两个对话我是希望做成独立入口，但是不突兀，同时还能和其他板块的内容做串联"

**2026-07-21 | [架构] 侧边栏重构：个人/HR工作台升级为一级可导航页面**
- 决策：侧边栏分组标签"个人""HR工作台"改为可点击的一级页面，集成下属模块信息
- label 内嵌 `<span onClick={e.stopPropagation}>` 实现点文字导航 + 点箭头展开，互不干扰
- Menu 从 `defaultOpenKeys` 改为受控 `openKeys` + `useEffect` 监听 pathname 同步展开状态
- `/personal` 聚合：统计卡片（投递/面试/Offer/简历）+ 本周重点 + 最近动态 + AI 工具入口
- `/workbench` 聚合：统计卡片（公司/人脉/市场洞察/投递）+ 最近公司 + 最近人脉
- 大师智囊团直接嵌入 `/personal` 页面而非独立二级页，点击橙色卡片原地展开，可收起

**2026-07-21 | [功能] 岗位诊断：从对话改为结构化表单**
- 决策：岗位诊断不应该是自由聊天，而是引导用户填写结构化信息再一键出报告
- 五个输入卡片：目标公司、岗位 JD（粘贴）、简历（文件上传自动解析+粘贴兜底）、关注重点（8 个可多选 Tag）、深度档位（标准/深度）
- 简历文件上传 → `/api/parse/resume` 临时解析返回文本，不落地数据库
- 隐私提醒 Alert 卡片顶部常驻（分析走云端模型需脱敏）
- 一键生成调用 `/api/ai/job-diagnosis/report`，流式输出完整 Markdown 报告

## 技术坑点

**2026-07-22 | [架构决策] 芝士桌宠拆分为独立仓库**
- 决策：桌宠是独立 agent 板块，不随 web 版本合并。desktop-pet/ 移出至 `kims-careeros\桌宠-芝士\`（物理嵌套 + 逻辑独立的嵌套 git 仓库，v0.1.0，有自己的 PRD 和 memory）
- 本仓库只保留服务端 API（/api/chat、/api/pet/*）；契约 = HTTP + PET_TOKEN 头
- 目标架构：大脑搬上客户端（直连 DeepSeek），OB 知识库只能客户端做（D 盘本地文件，服务器够不着）；OB 暂为占位符
- 同步改动：API_BASE 硬编码 localhost:3000 → ⚙️ 设置面板可配置（默认线上）
- 详见 `docs/PRD-v1.2.md` 第十章

**2026-07-22 | [迭代] v1.2 二轮修复（commit b60bb4f）— 鉴权/存储/缓存三类暗坑**
- ① middleware 免登录白名单里有 `/api/ai/` → 陌生人可裸调 AI 接口刷 DeepSeek 额度（用 curl 未登录实测证实）。**教训：花钱的 API 永远不要进白名单**；无登录态的客户端（桌宠）走路由内 token 校验（PET_TOKEN），不靠 middleware
- ② 用户可写数据放代码目录 `src/data/pet-settings.json` → server-deploy.sh 的 `git checkout -- . && git clean -fd` 每次部署重置。**教训：用户数据只能写 /data/ 或数据库，代码目录是只读的**
- ③ pet 的 GET 路由没加 `force-dynamic` → build 成 ○ 静态预渲染，设置改了读到旧值。与 2026-07-21 电影台词坑同源：**凡 GET API 先问"会被缓存吗"**
- ④ middleware 未登录返回 307 → fetch 自动跟随拿到 200 登录页 HTML，前端当内容渲染。**教训：加鉴权后前端必须查 content-type 拦 text/html**
- ⑤ 顺手修：诊断 focus 参数此前被丢弃、深度版只改标签不多搜、大师团历史不持久+全量重发 token 膨胀
- 📌 以上教训已沉淀为 **`docs/TECH-PITFALLS.md`**（12 条盲点 + 上线验收清单），新增功能前必读

**2026-07-22 | [AI 上线] 大师智囊团/岗位诊断线上全部静默失败（200 空响应）**
- 问题：v1.2 上线后 AI skill 全部不可用——大师团不回复、岗位诊断报告为空、`/api/chat` 404，且无任何报错提示
- 根因（4 个叠加）：
  1. 服务器 `.env` 缺 `DEEPSEEK_API_KEY`（.env 在 .gitignore，首次部署手工创建时还没有 AI 功能；`server-deploy.sh` 只检查文件存在不检查内容）。key 缺失时 `@ai-sdk/deepseek` 在请求时才抛错 → 错误进流被吞 → 200 空响应
  2. ai SDK v7 `streamText` 默认 `stopWhen: stepCountIs(1)`：挂了 searchWeb/fetchPage 工具但不设 `stopWhen`，模型第一步调工具后循环即终止，永远走不到生成文字的第二步 → 空响应
  3. `job-diagnosis/report` 路由返回一次性 JSON `{report}`，但前端按流式 getReader 逐段渲染 → 会把整串 JSON 当 markdown 显示；且非流式长生成会撞 Nginx 60s proxy_read_timeout
  4. `/api/chat` + `/api/pet` + FloatingPet 等桌宠文件从未 `git add`（未追踪），线上 404
  5. 附带：DuckDuckGo 在国内服务器被墙，联网搜索默认每次白等 8s 超时
- 解法：
  1. 服务器 `.env` 补 `DEEPSEEK_API_KEY`（+ 建议 `TAVILY_API_KEY`），`pm2 restart hr-platform`
  2. 两个 skill 路由加 `stopWhen: isStepCount(8/6)` + `onError` 日志（参考 `api/chat/route.ts` 已有正确写法）
  3. report 路由改回 `toTextStreamResponse()` 流式纯文本；前端加空内容兜底报错
  4. 桌宠相关文件全部 `git add` 提交
  5. DDG 超时 8s→5s 快速失败；`server-deploy.sh` 部署时强制校验 `DEEPSEEK_API_KEY`/`JWT_SECRET` 存在
- **教训**：① ai SDK v7 挂工具必须显式 `stopWhen`，否则多步循环一步就死；② `textStream`/`toTextStreamResponse` 会静默吞掉 error 分片——AI 接口"200 空响应"第一反应查服务器 env 和模型 key，别查前端；③ 前后端流式协议必须成对验证（一边 JSON 一边 stream 不报错但内容全错）；④ 上线前反查 `git status` 未追踪文件（delivery-checklist 再现）

**2026-07-21 | [缓存] 电影台词 API 被 Next.js 静态缓存，上线后不更新**
- 问题：已上线版本电影台词永远显示同一句，不随日期变化
- 根因：Next.js App Router `GET` 路由默认 `dynamic = 'auto'`，无动态函数调用时被静态缓存，handler 内的 prisma 查询和 `used` 标记只执行一次。客户端 `todayStr` 在 render 时计算一次，`useEffect` 依赖 `[todayStr]` 无跨天刷新机制。
- 解法：
  1. API 路由加 `export const dynamic = 'force-dynamic'` + 响应头 `Cache-Control: no-store, max-age=0`
  2. 客户端 effect 内部计算日期，用 `useRef` 防同天重复请求，`setInterval` 每分钟检查跨天自动刷新
- **教训**：Next.js 生产环境中任何需要动态数据的 GET API 路由都必须显式声明 `force-dynamic`，否则会被缓存。不要依赖"query param 不同 URL 不同"的假设——缓存发生在路由级别。

**2026-07-01 | [顺延待办] 月初跨月数据缺失**
- 问题：7月1日看顺延待办，前一天(6/30)数据在上个月，API只查当月
- 根因：数据拉取 `fetch(/api/todos?month=YYYY-MM)` 只覆盖单月
- 解法：拉取前/当/后三个月，Promise.all 合并，按 id 去重

**2026-07-01 | [侧边栏] Antd Menu 内嵌 Link 跳转失效**
- 问题：侧边栏菜单点击不跳转
- 根因：Antd Menu 组件内部拦截 click 事件，label 里的 `<Link>` 不触发
- 解法：去掉 label 中的 Link，改用 Menu onClick + router.push 导航

**2026-07-01 | [快速添加] 默认创建为"日程"而非"待办"**
- 问题：快速添加栏 `qaIsTodo` 默认 false，用户回车添加的全部变成日程
- 解法：默认改为 true（待办模式）

**2026-07-01 | [顺延待办] 过滤条件用错字段**
- 问题：顺延过滤用 `isTodo` 字段，但用户创建时默认是日程(isTodo=false)，导致漏掉
- 根因：**日程可以是待办，待办不可以是日程** → 有无时间才是区分标准
- 解法：改为 `!t.time && !t.completed`，没时间的未完成项都是待办，都顺延

**2026-07-09 | [顺延待办] 未完成待办在过往日期和今天同时出现**
- 问题：未完成待办既出现在原日期的待办列表，又出现在今天的顺延区域，重复显示
- 根因：顺延只处理了"今天显示什么"（carriedTodos），没处理"过往不显示什么"（sortedIncompleteTodos 未排除过往日期的未完成项）
- 解法：过往日期（`dayDateStr < todayStr`）的 `sortedIncompleteTodos` 返回空数组，未完成待办仅通过今天视图的顺延区域露出

**2026-07-01 | [编辑弹窗] 待办编辑字段过多**
- 解法：待办弹窗精简为 分类/颜色/事项/日期 四字段；日程弹窗保留全部字段

**2026-07-01 | [UI] 待办列表滚动时内容透出 sticky header**
- 问题：待办列 sticky header 背景为 transparent，滚动内容可见
- 解法：改为 `#faf8f6`（与页面底色一致）

**2026-06-29 | [性能] Ant Design 开发模式加载很慢，不是数据问题**
- 问题：本地 `npm run dev` 页面加载很慢，以为是数据/渲染太多
- 根因：Ant Design 的 `@ant-design/cssinjs` 在开发模式下每次渲染都在浏览器里实时计算 CSS，加上 Next.js dev 的 JIT 编译，导致首次加载慢。TTFB 仅 9ms 证明服务端不慢
- 解法：
  1. 用 `npm run build && npm run start` 验证生产速度（CSS 构建时提取好，329 kB gzipped 后很小）
  2. 去掉 `(app)/layout.tsx` 里不必要的 `dynamic(() => import(...), {ssr: false})` 包装——AppLayout 本身已经是 `'use client'`，再包一层 `ssr: false` 只是多了一个 Loading 闪烁
- **以后遇到速度问题先跑生产构建对比，不要直接在 dev 模式下优化**

**2026-07-02 | [部署] GitHub 私有仓库导致克隆失败**
- 问题：`git clone` 弹用户名密码
- 解法：仓库改为公开（个人工具没必要私有）

**2026-07-02 | [部署] Workbench 终端 heredoc 频繁卡死**
- 问题：`cat > file << 'EOF'` 粘贴后无反应
- 根因：Workbench 浏览器终端对多行 heredoc 支持有 bug，长命令还会被换行截断
- 解法：用 `nano` 编辑器或 `echo` 逐行写入替代；base64 编码可避免截断但要注意换行

**2026-07-22/23 | [待办] v1.2.1 遗留问题 — 交给 K3 明天继续**

以下代码已写好、已推送 GitHub（commit `1cc5cc7`），但**线上构建验证未完成**：

| 修复 | 文件 | 说明 |
|------|------|------|
| 岗位诊断报告截断 | `report/route.ts` | + `stopWhen: isStepCount(3)`（根因：v7 默认 stepCountIs(1)，report 路由之前没设 stopWhen，与 07-22 AI 全哑同一根因） |
| 大师对话用户身份 | `hr-roundtable/route.ts` | 注入简历目标岗位 + 活跃投递到系统上下文，大师现在知道在跟谁对话 |
| 对话历史回溯 | `AISkillPanel.tsx` | 新增会话存档（ChatSession 结构）+ 历史面板 UI + 清空自动存档 + 点击加载历史 |

**本地已验证**：report API 用 `curl` + cookie 测试通过，流式输出完整报告（美团 HRBP 岗位）。

**部署卡点**：
1. `server-deploy.sh` git pull 后权限丢失（`Permission denied`），需手动 `chmod +x`
2. 阿里云 Workbench 多行 heredoc 卡死，导致服务器端 curl 验证未完成
3. `maxTokens` 参数在 ai-sdk v7 中不存在，已删除（`1cc5cc7`）

**线上验证步骤**（明天 SSH 进去跑）：
```bash
ssh root@139.196.159.68
cd /opt/hr-platform && git pull origin main
chmod +x server-deploy.sh && ./server-deploy.sh
# 部署后浏览器 https://www.kimstar.cn 验证：
# 1. 岗位诊断 → 生成报告 → 确认完整不截断
# 2. 大师智囊团 → 对话 → 确认知道用户身份
# 3. 大师智囊团 → 点"历史" → 确认能看到存档对话
```

**2026-07-02 | [部署] Next.js standalone 模式导致静态资源 404**
- 问题：Logo 不显示、页面异常
- 根因：`output: 'standalone'` + `next start` 找不到 `.next/static` 和 `public/`
- 解法：去掉 standalone，改用标准模式

**2026-07-02 | [部署] Cookie Secure 标志导致 HTTP 登录失败**
- 问题：输入正确密码后无法登录
- 根因：`secure: NODE_ENV === 'production'` 在 HTTP 下浏览器拒绝保存 cookie
- 解法：临时改为 `secure: false`，HTTPS 配好后恢复

**2026-07-02 | [部署] Nginx 80 端口被占用**
- 问题：`nginx -t` 报 `Address already in use`
- 解法：`fuser -k 80/tcp` 释放端口后重启

**2026-07-02 | [部署] 本地 GitHub 连接不稳定**
- 问题：`git push` 偶尔超时
- 解法：服务器能连 GitHub，文件通过服务器 `git pull` 同步；服务器修改文件后先 `git checkout` 再 pull 避免冲突
- **注意：本地 push 前需先告诉 Kim，Kim 需要开代理才能连 GitHub**

**2026-07-15 | [日视图] 15分钟时间块 + 重叠并列 + 必须参加 + 拖拽调整**
- 完整功能交付，见 CHANGELOG v1.1.1
- 日程卡片渲染偏差：~~生产构建存在固定 1 行偏移，通过 +1 行补偿（top 和 height）解决~~ → **2026-07-16 发现此补偿是 Bug 根因**：+1 行让每个卡片覆盖多一行网格单元格，阻碍空白格点击；拖拽 handler 中配套的 -15 分钟修正也随之移除。正确做法是去掉 +1 补偿 + 去掉 overlay 包装层（pointerEvents:none 在生产构建可能不生效），卡片直接放在网格列内。
- 拖拽零卡顿方案：DOM 直控（`cardEl.style.top/height`），松手后读 DOM → setTodos → API 保存。不可在 mousemove 中 setTodos，否则全量重渲染导致闪烁
- 时区：服务器 UTC，dayjs() 取到的时间比北京慢 8h。统一用 `dayjs().tz('Asia/Shanghai')` 或 `nowShanghai()` helper
- ~~事件层 `bottom:0` 在生产构建中行为不一致，改用显式 `height: totalH`~~ → **2026-07-16 移除 overlay 包装层**：卡片直接放在 grid-col 内作为 absolute 子元素，不再需要 overlay 中间层。生产构建中 pointerEvents:none 可能不可靠，去掉中间层彻底消除点击穿透问题。

**2026-07-15 | [部署] 阿里云→GitHub HTTPS TLS 被墙 + PM2 用户隔离**
- 问题：服务器 `git pull https://github.com/...` 报 `GnuTLS recv error (-110)`，反复重试无效；切 SSH 后需配 SSH key 才能拉；部署时发现 `pm2 restart hr-platform` 报 not found
- 根因：
  1. 阿里云到 GitHub HTTPS 443 端口被 GFW 间歇性阻断，HTTP 代理、SSL 跳过均无效
  2. 之前部署用 root 跑 PM2，现在用 admin 登录，两个用户的 PM2 进程列表不互通
- 解法：
  1. 生成 `~/.ssh/id_ed25519`，公钥加到 GitHub Settings → SSH Keys，`git remote set-url origin git@github.com:Kim5613/kims-careeros-.git`
  2. 固定用 admin 部署，不再混用 root
  3. SSH 协议不受 HTTPS 墙影响，以后一劳永逸
- **教训**：以后阿里云部署遇到 GitHub 连不上，直接切 SSH 协议，不要反复试 HTTPS 变通

**2026-07-09 | [3D球体] React setState 在 rAF 中导致性能崩溃**
- 问题：requestAnimationFrame 中用 setState 更新旋转角度，每帧触发 React 重渲染 350+ 粒子 → 卡死
- 解法：用 useRef 存旋转值，rAF 直接操作 `sphereRef.current.style.transform`，React 渲染一次后不再参与动画。粒子/标签全部走 DOM ref 直接操作

**2026-07-09 | [3D球体] 指针捕获导致标签点击失效**
- 问题：球体容器 `setPointerCapture` 捕获所有 pointer 事件，标签 button 的 onClick 不触发
- 解法：`handleDown` 中检查 `e.target.tagName === 'BUTTON'`，是标签则 return 不捕获

**2026-07-09 | [3D球体] 标签初始 font-size 为 0 导致无法点击**
- 问题：标签 font-size 交给 rAF 动态设置，首帧之前元素尺寸为 0 → 无法点击
- 解法：inline style 保留初始 `fontSize: 15`，rAF 覆盖动态值

**2026-07-09 | [构建] Next.js chunk 缓存导致模块找不到**
- 问题：`Error: Cannot find module './1682.js'` — `.next` 缓存与源码不同步
- 解法：`rm -rf .next && npm run build` 清缓存重建

**2026-07-09 | [动态路由] useParams 页面为动态渲染（ƒ）**
- `/growth/domain/[slug]` 使用 `useParams()` 的页面标记为 Dynamic（ƒ），不能静态预渲染（○）
- 这是 Next.js App Router 的预期行为，不影响功能

**2026-07-13 | [架构] v1.2 AI 桌宠助手 — 完整方案确认 + Phase 1 代码完成**
- 定位：独立桌面应用（Tauri 2.0），悬浮在所有窗口之上
- 桌宠 = Claude + CareerOS 数据库 + 实时联网 + 随时可聊
- 多变人格：专业秘书 / 温暖伙伴 / 毒舌损友，根据场景自动切换
- Phase 1 代码已完成：CareerOS `/api/chat`（10 个工具）+ Tauri 桌宠（19 个文件）
- 待 Kim 准备：Rust 环境安装、Anthropic API Key、桌宠精灵图、桌宠名字
- 完整 PRD：`docs/PRD-v1.2.md`
- 用户原话："我希望它就像你一样，可以跟我进行对话，可以给我情绪价值，可以给我答案，同步检索我的数据库和实时互联网分析"
- 用户原话："全都要哈哈哈，风格可以多变" / "B要主动的" / "就像是搜狗输入法的图标一样，永远悬浮在桌面"

## v1.2 规划 — AI 桌宠助手（2026-07-13 启动）

### 核心定位
桌宠 = Claude 思考能力 + CareerOS 全部数据 + 实时联网 + 随时可聊。独立桌面应用（Tauri 2.0），悬浮在所有窗口之上。

### 功能清单
- **对话能力**：自然语言聊天，流式输出，Claude 驱动
- **数据检索**：查公司/人脉/投递/面试/知识库/简历/日程
- **日程操作**：创建/修改/查询待办和日程
- **联网搜索**：快速搜索 + 深度研究（多轮搜索→交叉验证→带引用报告）
- **主动提醒**：日程提醒、待办积压检测、每日早安、每周复盘、数据变化通知、情绪感知
- **语音输入**：长按空格 → Web Speech API 录音
- **调参面板**：所有主动提醒开关，实时生效
- **多变人格**：专业/温暖/毒舌 三种模式，随场景切换

### 技术架构
- **桌宠**：Tauri 2.0 + React 19 + TypeScript + Vite
- **AI 后端**：CareerOS `/api/chat` — Vercel AI SDK + Claude + 工具调用
- **通信**：桌宠 → HTTP → CareerOS API (localhost:3000)
- **窗口**：frameless + always-on-top + 透明 + 可拖拽
- **动画**：CSS 精灵图逐帧动画（8×3 帧 PNG）

### 参考项目
- DebugDuck (Tauri 2 + React 19 + AI)
- CodeWalkers (Tauri 2 + 精灵动画 + 点击穿透)
- WindowPet (Tauri + React + 45+ 宠物)
- CareerOS by Samir-Sahiti (Next.js + Claude + Vercel AI SDK)

### 待定
- 桌宠名字（Kim 的猫叫 奶糕/奶棍/奶球）
- 角色形象（Kim 提供参考图 → AI 生成精灵图）
- Rust 环境安装（需 rustup + VS C++ Build Tools）

**2026-07-16 | [决策] v1.2 AI 桌宠暂停，重新理思路**
- Phase 1 代码（Tauri 桌宠 + /api/chat + FloatingPet）已完成但保留在本地，未上线
- 桌宠相关文件暂不提交到 main 分支，待思路清晰后再启动
- 用户原话："桌宠的项目先缓缓吧，我要重新理理思路"

## v1.1 规划

### 成长档案 — 职业宇宙 + 能力地图（2026-07-09 已完成）

```
个人
  ├─ 成长档案
  │   ├─ 🌐 职业宇宙    ← ✅ 已完成：3D 粒子球体 + 10 赛道 + 手转/自转
  │   ├─ 能力地图        ← ✅ 已完成：卡片堆叠 + 职级对标 + 共享组件
  │   └─ OB 同步管线    ← ✅ 已完成：笔记→数据自动转换 + pre-commit hook
```

### 求职模块架构（2026-07-06 确认）

```
个人
  ├─ 求职
  │   ├─ 概览    ← 精选看板，每阶段挑重点展示
  │   ├─ 投递    ← ✅ 已完成：四列卡片 + 意向池 + 状态流转
  │   ├─ 面试    ← 待开发：按公司分组进度
  │   └─ Offer   ← 待开发：Offer 对比表
```

核心原则：
- 每条求职记录只属于一个阶段（单向流动：未投递→已投递→面试→Offer→已结束）
- 概览 = 精选视图，不是全量
- 卡片模板统一，后续页面复用

### Bug 修复（已完成）

| # | Bug | 状态 |
|---|-----|------|
| 1 | 快速添加栏分类图标有"空"态 | ✅ 已修 2026-07-06：`setQaCategory(null)` → `'work'`，默认 💼 |
| 2 | 有日程的时间段点击无效 | ✅ 已修 2026-07-06：去掉 `todos.length === 0` 条件，任何时候都能点 |
| 3 | 顺延待办只顺延前一天，两天前的漏掉 | ✅ 已修 2026-07-08：`t.date === yesterdayStr` → `t.date < todayStr`，且仅今天视图显示 |
| 4 | 未完成待办在过往日期和今天同时出现 | ✅ 已修 2026-07-09：过往日期 `sortedIncompleteTodos` 返回空，仅顺延区域露出 |
| 5 | 电影台词单行截断看不完整，电影名挤同行 | ✅ 已修 2026-07-09：去掉 nowrap+ellipsis，台词完整展示第一行，电影名第二行 |

### 待办与优先级

1. ~~域名备案通过 → 配置 HTTPS~~ **备案已通过 2026-07-11**
2. DNS 解析 + Nginx 更新 server_name + certbot HTTPS
3. 数据库定时备份（pg_dump + cron）
4. JWT_SECRET 改为强随机值
5. v1.1 需求确认（26 条 AI 建议逐条筛选）
6. AI 功能集成
7. **其他赛道数据填充**：开发/设计/市场/销售/财务/法务/运营 7 个赛道的细分岗位 + 技能 Mock 数据
8. **能力地图接数据库**：Skill 表 + API + 关联成就多选
9. **人生设计集成**：能量日记、创作项目、路径标签、"第一次"里程碑（详见 `docs/PRODUCT.md` 第九章）
