---
name: project-overview
description: Kim's CareerOS 项目概览 — 技术栈、架构、已知坑点
metadata:
  type: project
---

# Kim's CareerOS — 项目概览

## 项目定位

HR 个人职业管理平台，包含「我的职业发展」和「HR 工作台」两大板块。

## 技术栈

- **前端：** Next.js 14 + React 18 + Ant Design 5 + Tailwind CSS 3
- **后端：** Next.js API Routes (App Router)
- **数据库：** PostgreSQL + Prisma ORM
- **文件解析：** pdfjs-dist, mammoth (Word), xlsx (Excel), tesseract.js (OCR)
- **认证：** jose (JWT)

## 模块

- 数据看板（首页）
- 求职管理（job-seeking）
- 薪酬与晋升（salary-growth）
- 成长档案（growth）
- 简历与求职信（resumes）
- 候选人库（candidates）
- 招聘知识库（knowledge）
- 市场洞察（market）
- 公司库（companies）
- 人脉库（contacts）

## 技术坑点

### T1: 服务器重启后 PM2 进程丢失【2026-07-13】
- **现象：** 服务器重启后 Nginx 返回 502，PM2 进程列表为空
- **根因：** `pm2 save` 只在 PM2 daemon 内持久化，系统重启后 daemon 不会自动恢复保存的进程。需要配 `pm2 startup`（生成 systemd 服务）
- **解法：** 服务器重启后手动 `pm2 resurrect`，或提前配好 `pm2 startup` + `pm2 save`
- **参考：** [T3] 也有进程丢失风险

### T2: git pull 冲突被忽略导致部署了旧版本【2026-07-13】
- **现象：** 服务器上跑全套部署命令（git pull → npm install → prisma push → build → pm2 restart），所有步骤都返回成功，但 v1.1 功能不显示
- **根因：** git pull 因本地文件冲突（手动改过 `route.ts`，有未跟踪的 `todos-data.sql`）而 abort，输出夹在大量日志中未被察觉。后续命令用的是旧代码，全部"成功"但毫无意义
- **解法：**
  1. 部署脚本加 `set -e`（遇错即停）
  2. `git pull` 后单独跑 `git log -1 --oneline` 确认 SHA 正确
  3. 服务器上不要手动改文件，所有改动走 Git
- **教训：** 绝对不能依赖命令"看起来都成功了"来判断部署成功，必须验证 git HEAD 是否指向目标 commit

### T3: Prisma schema 新增字段后 db push 时机错误【2026-07-13】
- **现象：** build 时报 `The column job_applications.location does not exist`
- **根因：** v1.1 新增了 `JobApplication.location` 等字段，但 `prisma db push` 是在旧代码目录下跑的（T2 导致），此时 Prisma schema 还是旧的。之后 git pull 新代码，build 时 Prisma client 期望新字段但数据库没有
- **解法：** 严格确保 `git pull` 成功后再 `prisma db push`，两者不可颠倒或脱节

### T4: Certbot 自动配置破坏了 HTTP→HTTPS 重定向【2026-07-13】
- **现象：** HTTP 80 端口返回 404 而非 301 重定向
- **根因：** Certbot 在续期/安装时自动修改 Nginx config，将 HTTP 80 的 `return 301 https://...` 替换为了 `return 404`
- **解法：** 手动修复 Nginx 配置，将 HTTP server block 的 `return 404` 改回 `return 301 https://$host$request_uri;`

## 交互约束

_待补充。_
