# Kim's CareerOS

## 一句话定位
HR 从业者个人职业管理平台，涵盖「我的职业发展」和「HR 工作台」两大板块。

## 当前状态
**v1.0 开发中 — 2026-06-25**

今日完成：
- 首页日历+待办面板定稿：周/月/年三视图，左右等高对称，法定节假日，日详情24h弹窗，莫兰迪色系日程
- 求职管理看板重写：四列看板（已投递/面试/offer/已结束），级联节点，可折叠面试记录表单（轮次+日期时间+结果选择），面试可编辑
- 侧边栏结构定稿：首页/个人/HR工作台/知识库/设置
- 设置页：密码修改+主题可视化选择（18套）
- 新增 Todo 模型 + 面试记录编辑 API

待完成：
- 阿里云 RDS + 服务器部署 + HTTPS + 数据迁移
- 分享链接功能
- 候选人+人脉页面合并
- 薪酬/档案页面 API 迁移

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
| 首页看板 | ✅ v1.0 | 动态聚合 + 待办日历 |
| 求职管理 | ✅ v1.0 | API 驱动，投递/面试/谈判 |
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
| API 路由 | ✅ v1.0 | 34 个路由含 15 [id] |
| 登录认证 | ✅ v1.0 | 密码登录 + JWT + middleware |
| Logo 主题 | ✅ v1.0 | 18 套 SVG + 随机切换 |
| 域名 | ✅ v1.0 | kimstar.cn 已购买 |
| 云 RDS | 📋 v1.0 | 待购买 |
| 服务器部署 | 📋 v1.0 | 待部署 |
| 分享链接 | 📋 v1.0 | 待开发 |
| AI 功能 | ⏳ v1.1 | 简历分析、面试评估等 |

## 决策记录

**2026-06-24 | [技术选型] 本地 PostgreSQL 17，生产上阿里云**
开发和生产保持同一数据库类型。本地通过 winget 安装，密码认证用 scram-sha-256。生产环境 deploy.sh 已有完整 PostgreSQL 配置。

**2026-06-24 | [架构] 创建共享 useApiList hook 统一 API 调用模式**
7 个页面原本各有各的 fetch + local fallback 实现，抽取为一个通用 hook（`src/lib/hooks/useApi.ts`），统一 API-first + Mock 降级逻辑。减少重复代码，后续新页面直接复用。

**2026-06-24 | [产品] v1.0 定位为"全部上云 + 正式可用"**
域名 kimstar.cn，阿里云 RDS PostgreSQL，部署到已有轻量服务器。先上云再补 AI 功能。

**2026-06-24 | [设计] 18 套 SVG 矢量主题系统**
Logo 从 PNG 升级为 SVG，天然透明无白底。每套主题映射 sidebarBg + accentColor。随机选择存 localStorage。

**2026-06-24 | [交互] 登录页极简设计**
Logo 居中 1/3 屏宽，下方"访客浏览"按钮。点击 Logo 才弹出密码框。未登录不展示侧边栏。

**2026-06-24 | [功能] 文件解析确认入库流程**
上传→自动解析→弹窗编辑确认→点"确认入库"才写入数据库。中间态不落库，用户有机会修正 OCR 错误。

**2026-06-24 | [架构] 15 个 [id] 动态路由采用统一模板**
PATCH/DELETE 路由遵循相同结构：try/catch → prisma 操作 → NextResponse。公司关联用 findFirst + create（name 非唯一字段，不能用 upsert）。

## 技术坑点

_（暂无，待后续填充）_

## 待办与优先级

1. 验证项目可构建运行（`npm run dev`）
2. 接入真实数据库，替换 Mock 数据
3. AI 功能集成
4. 部署上线
