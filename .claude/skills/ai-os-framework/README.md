# 快速启动 — 先做后补

不要先读完所有文档再开始。先建文件，边做边学。

---

## 安装（执行一次）

1. 将本目录下所有文件复制到项目的 `.claude/skills/ai-os-framework/`
2. 在项目中调用一次 `/ai-os-framework`（Skill 会自动将核心约束写入 CLAUDE.md）
3. 此后每次新会话自动生效，无需再手动调用

## 三步启动（5 分钟）

1. 复制 [project-example.md](project-example.md) 到 `memory/project-你的项目名.md`
2. 把里面的项目名、技术栈、模块改成你自己的
3. 在 `MEMORY.md` 加一行索引：`[项目名] 描述 | 技术栈 | 状态 → memory/project-xxx.md`

开始干活。

## 什么时候补全

做出第一个决策、踩到第一个坑、完成第一个模块时，回到项目文档对应章节填写。知识库是长出来的，不是填表填出来的。

## 需要更多细节时

- 两条底线（日常遵守的最小规则集）→ [onboarding.md](onboarding.md) Step 3
- 完整操作手册（协议、模板、自动化）→ [project-knowledge-base.md](project-knowledge-base.md)
- 核心思想（三个差距、输出质量公式）→ [SKILL.md](SKILL.md) 第一节

## 升级框架

框架文件（升级时覆盖）：SKILL.md、onboarding.md、project-knowledge-base.md、project-example.md、README.md

项目数据（永远不覆盖）：MEMORY.md、memory/ 下所有文件、项目自己的 Skill 文件

升级后调一次 `/ai-os-framework`，Skill 会自动更新 CLAUDE.md 中的版本号。
