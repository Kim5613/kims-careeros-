# Changelog

Kim's CareerOS 版本记录。每个版本对应一个 Git tag，GitHub 上可浏览该版本完整代码。

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
