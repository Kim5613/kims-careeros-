---
name: design-spec-v1.2
description: CareerOS v1.2 设计规范：原则、令牌、组件约定、skill 调用规则 (2026-07-21)
metadata:
  type: project
---

## 设计原则
- **简单高级**：少即是多，留白代替分割线，字体驱动层次
- **克制配色**：大面积中性色 + 点缀品牌色
- **柔和阴影**：若有若无，仅提供深度暗示
- **流畅过渡**：所有交互 0.15-0.25s ease

## 设计令牌

| 类别 | 值 |
|------|-----|
| 页面底色 | `#faf8f6` |
| 卡片白 | `#fff` |
| 品牌主色 | `#8b7cf0` |
| 语义绿 | `#4cb840` |
| 语义橙 | `#e08830` |
| 语义红 | `#e05858` |
| 文字 | `#333` / `#888` / `#bbb` |
| 边框 | `#eeeae5` |

| 令牌 | 值 |
|------|-----|
| 卡片阴影 | `0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)` |
| 浮起阴影 | `0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)` |
| 卡片圆角 | 14px |
| 按钮圆角 | 8px |
| 页面 padding | `40px 48px 24px` |
| 最小字号 | 12px |

## 页面模板
LABEL *(12px uppercase #bbb)* + 标题 *(26px w500 #1a1a1a)* + 日期 + 内容区

## 组件约定
- 按钮 borderRadius:8, 无阴影
- 卡片白色底+统一阴影, hover升级浮起阴影
- Tag borderRadius:8, 无边框
- 阶段标签 hover显示底部色条
- 弹窗 fade-in 0.15s / 面板 fixed+遮罩+滑入
- 空状态统一 #bbb

## Skill 调用规则
改 UI/产品前必须先调：
- `pm-spec-writing` + `jtbd-framing` → 新功能/PRD
- `ui-design-review` → UI 改动
- `cognitive-walkthrough` → 交互设计
- `ux-audit-rethink` → 信息架构
- `discovery-research-synthesis` → 验证设计

技术实现: `CLAUDE.md` §5 + `.claude/settings.local.json` PreToolUse hook

## 源文件
- 令牌: `src/lib/design-tokens.ts`
- 全局样式: `src/app/globals.css`
- AntD主题: `src/components/AntdConfigProvider.tsx`

[[project-kims-careeros]]
