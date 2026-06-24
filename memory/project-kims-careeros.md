# Kim's CareerOS

## 一句话定位
HR 从业者个人职业管理平台，涵盖「我的职业发展」和「HR 工作台」两大板块。

## 当前状态
**MVP 阶段 — 数据库已接入，核心闭环可运行。**

2026-06-24：完成 MVP 核心工作：
- PostgreSQL 17 本地数据库已建表（21 张表）
- 15 个 `[id]` 动态 API 路由（PATCH/DELETE）已补全
- 7 个核心页面从 Mock 迁移到 API 驱动（candidates/resumes/job-seeking/companies/contacts/knowledge/market）
- 首页动态聚合 API 已创建，跨模块活动实时可见
- 文件上传 + OCR 解析链路完整
- 待完成：salary-growth 和 growth 页面 API 迁移（仍用 Mock，不影响核心闭环）
- 未部署，未加认证

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
| 首页看板 | ✅ MVP | 动态聚合 + 待办日历 |
| 求职管理 | ✅ MVP | API 驱动，投递/面试/谈判 |
| 薪酬与晋升 | ⚠️ 骨架 | Mock 数据，待 API 迁移 |
| 成长档案 | ⚠️ 骨架 | Mock 数据，待 API 迁移 |
| 简历与求职信 | ✅ MVP | API 驱动 + 文件上传解析 |
| 候选人库 | ✅ MVP | API 驱动 + 简历导入/OCR |
| 招聘知识库 | ✅ MVP | API 驱动 |
| 市场洞察 | ✅ MVP | API 驱动 |
| 公司库 | ✅ MVP | API 驱动 |
| 人脉库 | ✅ MVP | API 驱动 |
| 文档解析引擎 | ✅ 完成 | PDF/图片OCR/Markdown |
| 数据库 | ✅ 完成 | PostgreSQL 17，21 张表 |
| 动态 API 路由 | ✅ 完成 | 15 个 [id] 路由 (PATCH/DELETE) |
| 用户认证 | ⏳ 待开发 | 部署前加 |
| AI 功能 | ⏳ 待开发 | 简历分析、面试评估等 |
| 部署上线 | ⏳ 待开发 | 有 deploy.sh，未执行 |

## 决策记录

**2026-06-24 | [技术选型] 本地 PostgreSQL 17，生产上阿里云**
开发和生产保持同一数据库类型。本地通过 winget 安装，密码认证用 scram-sha-256。生产环境 deploy.sh 已有完整 PostgreSQL 配置。

**2026-06-24 | [架构] 创建共享 useApiList hook 统一 API 调用模式**
7 个页面原本各有各的 fetch + local fallback 实现，抽取为一个通用 hook（`src/lib/hooks/useApi.ts`），统一 API-first + Mock 降级逻辑。减少重复代码，后续新页面直接复用。

**2026-06-24 | [架构] 15 个 [id] 动态路由采用统一模板**
PATCH/DELETE 路由遵循相同结构：try/catch → prisma 操作 → NextResponse。公司关联用 findFirst + create（name 非唯一字段，不能用 upsert）。

## 技术坑点

_（暂无，待后续填充）_

## 待办与优先级

1. 验证项目可构建运行（`npm run dev`）
2. 接入真实数据库，替换 Mock 数据
3. AI 功能集成
4. 部署上线
