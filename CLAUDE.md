# Kim's CareerOS — 项目入口

## ⚠️ 必读（2026-07-15 部署教训后新增）

**每次会话、每次回复、每条命令都必须遵守。**

### 1. 命令必须标注环境
```
【本地-Windows】在 Windows 终端/PowerShell 执行
【本地-Bash】   在 Git Bash 执行
【服务器】      阿里云 Workbench (admin@iZuf...)
```
**绝不混在一起、不用 && 跨环境连接、不让用户猜。**

### 2. 交付前反查（提交/部署前逐条过）
- [ ] `dayjs()` / `new Date()` — 服务器 UTC，必须用 `nowShanghai()` 或 `.tz('Asia/Shanghai')`
- [ ] `git status` — 所有新文件都 add 了？
- [ ] `npm run build` — 本地构建通过？
- [ ] 新功能在本地浏览器验证过？

### 3. 环境差异（牢记）
| | 本地 | 服务器 |
|---|---|---|
| 时区 | UTC+8 | **UTC** |
| 用户 | Kim | admin |
| Git | HTTPS | **SSH** (git@github.com) |
| 部署 | — | `git pull origin main && npm run build && pm2 restart hr-platform` |

### 5. Skill 强制调用规则（2026-07-21 新增）

以下场景**必须先调 skill 再动手**，不准凭直觉直接写代码：

| 场景 | 必须调用的 Skill |
|------|-----------------|
| 设计新功能、写 PRD、规划模块 | `pm-spec-writing` + `jtbd-framing` |
| 改 UI 布局、配色、排版、组件样式 | `ui-design-review` |
| 设计交互流程、hover/点击/弹窗等交互链 | `cognitive-walkthrough` |
| 重新设计信息架构、页面结构 | `ux-audit-rethink` |
| 验证功能设计是否符合用户实际行为 | `discovery-research-synthesis` |

**触发词检测**：只要用户说「设计」「排版」「交互」「流程」「方案」「规划」「重新设计」，自动检查上表。

### 6. 先查文档再动手
- 修 bug / 做功能前 → 读 `memory/project-kims-careeros.md` 技术坑点
- 部署问题 → 读 `memory/project-kims-careeros.md` 部署相关坑点

---

## AI OS Framework 核心约束

来自 ai-os-framework v1.10.0，每会话自动生效。全文见 `.claude/skills/ai-os-framework/SKILL.md`。

### 行为准则
1. 先检索 memory/ 再回答，不凭记忆推测
2. 不确定就标"待确认"（确认/待确认/推测 三级置信度）
3. 会话启动时主动读 MEMORY.md 和项目文档，反馈待办
4. **修 bug / 做新功能之前，先读 `memory/project-kims-careeros.md` 的技术坑点和交互约束，避免重蹈覆辙**

### 做即记
以下事件发生时当场写入项目文档，不堆积：
- 做出决策 → 决策记录（日期 + [分类标签] + 决策 + 为什么）
- 踩坑解决 → 技术坑点（问题→根因→解法）
- 模块完成 → 更新模块清单状态（不确定是否算完成时主动问用户确认）
- 新需求 → 待办与优先级

### 节奏锚点
每完成一个独立任务（写完一个功能、修完一个 bug、给出一组建议），自检一次：刚才有没有需要写入项目文档的事？有就记，没有就过。不在会话结束时才检查，在每个任务节点都触发。

### 日志回查
会话启动时检查最近 3 天日志，搜索与本项目相关的判断偏差和交接笔记。
