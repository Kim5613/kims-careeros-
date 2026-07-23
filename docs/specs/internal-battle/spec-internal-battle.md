# 内部战役 · Feature Spec

> 版本：v1.0 | 2026-07-23 | 状态：📋 待确认

---

## PROBLEM

当前 CareerOS 能管理求职流程（向外投递），但 Kim 在组织内部的实际工作成果——项目经历、关键产出、能力证据——散落在本地文件、聊天记录和记忆里。更新简历或准备晋升答辩时，需要花半天翻资料拼凑记忆，而不是直接调取有结构、有数据支撑的项目记录。

## USERS

Kim（唯一用户）。HR 从业者，日常以项目制运作多个内部战役（BP 项目、晋升答辩、PIP 改进等），需要将项目成果转化为简历素材和职业宇宙的能力证明。

## PROPOSAL

在 `/battle/internal` 建设「内部战役」模块，作为项目经历的结构化记录池。每个项目记录公司、时间、岗位、缘起、伙伴、过程、结果七个维度。项目自动成为简历板块的素材源（一键 AI 生成简历草稿），并关联职业宇宙的能力标签（手动打标 + AI 推荐互补）。

---

## USER STORIES

### P1 — 项目 CRUD

- As Kim, I want to **create a project record** with company, timeline, role, origin, partners, process, and results, so that I have a structured archive of my internal work.
- As Kim, I want to **browse all my projects** grouped by category (BP项目/晋升答辩/PIP改进/其他), so that I can quickly find a specific project.
- As Kim, I want to **edit and update** a project as it progresses, so that the record stays current.

### P2 — 职业宇宙联动

- As Kim, I want to **tag projects with skills** from the domain-tracks system, so that my Career Sphere reflects real project experience.
- As Kim, I want the system to **auto-suggest skills after I save a project** with process/results content, so that I don't need to remember to manually trigger it.
- As Kim, I want to **manually adjust** auto-suggested tags (confirm/remove/add), so that I stay in control of what gets associated.

### P3 — 简历一键生成

- As Kim, I want to **select projects** from my internal battle pool and have AI generate a resume work-experience section, so that I can update my resume in minutes instead of hours.
- As Kim, I want each resume section to **optionally link back** to the source project, so that I know where the data came from.

---

## ACCEPTANCE CRITERIA

### P1

- [ ] Given empty state, when I land on `/battle/internal`, I see the four category tabs and an empty prompt guiding me to create my first project.
- [ ] Given "new project" form, when I fill company / timeline / role / origin / partners / process / results and submit, the project appears in the correct category card grid.
- [ ] Given a project card, when I click it, the right-side detail panel slides out showing all seven fields + associated skills.
- [ ] Given a project in category A, when I drag it (or use a dropdown) to category B, it moves to that category.
- [ ] Given the project list, when I switch category tabs, only projects of that category are shown with a count badge.

### P2

- [ ] Given a project detail panel, when I click "关联能力", a skill picker opens showing all domain-tracks skills grouped by track, with multi-select + search.
- [ ] Given I save a project that has process + results filled in, the system **automatically** calls AI suggest-skills and shows up to 8 recommended tags as dismissible chips below the skill section (no manual click needed).
- [ ] Given AI suggested tags appear, I can click each to confirm (turns solid), dismiss (removes), or manually add more via "+ 关联能力".
- [ ] Given a project is tagged with skill X at level Y, when I visit `/growth/career-sphere`, that skill's visual representation reflects the project association (e.g. highlighted node, tooltip showing project name).

### P3

- [ ] Given the resume editor, when I click "AI 生成工作经历", a project picker modal opens showing all internal battle projects with checkboxes.
- [ ] Given I've selected 2-5 projects and clicked "生成", within 30 seconds I see AI-generated resume bullet points with quantified results.
- [ ] Given the generated content, I can edit/delete individual bullet points before inserting into the resume.
- [ ] Given a resume section generated from project X, the section stores a reference to project X (for traceability).

---

## DATA MODEL

```typescript
interface Partner {
  name: string;             // 姓名
  title: string;            // 职位/角色，如"技术总监""产品经理"
}

interface BattleProject {
  id: string;
  category: 'bp' | 'promotion' | 'pip' | 'other';  // 四大分类
  company: string;          // 公司名称
  startDate: string;        // 开始时间
  endDate: string | null;   // 结束时间（进行中则为空）
  role: string;             // 项目岗位
  origin: string;           // 项目缘起 — 为什么启动
  partners: Partner[];      // 合作伙伴 — 姓名 + 职位
  process: string;          // 项目过程 — 我做了什么
  results: string;          // 结果 — 拿到什么成果
  skillTags: SkillTag[];    // 关联能力标签
  createdAt: string;
  updatedAt: string;
}

interface SkillTag {
  skillId: string;          // 对应 domain-tracks.ts 里的 skill.id
  skillName: string;
  trackId: string;          // 所属 track
  level: number;            // 项目中体现的能力等级 1-4
  source: 'manual' | 'ai';  // 手动打标 or AI推荐
}
```

### 新增数据库表

| 表 | 对应 |
|----|------|
| `battle_projects` | BattleProject（七个字段 + 分类） |
| `battle_project_skills` | SkillTag（多对多关联到 domain-tracks skills） |

> 注意：domain-tracks 的 skill ID 当前是静态数据（`src/data/domain-tracks.ts`），SkillTag 存储 skillId 引用即可，不需要外键。

---

## UI STRUCTURE

继承 `/battle/job-seeking` 的交互模式：

```
┌──────────────────────────────────────────────────┐
│  ⚔️ 内部战役                        2026.07.23    │
│                                                  │
│  ┌──────┬──────┬──────┬──────┐                   │
│  │ BP项目 │ 晋升  │ PIP  │ 其他 │  ← 分类 tab     │
│  │  (3)  │ (1)  │ (0)  │ (2)  │                   │
│  └──────┴──────┴──────┴──────┘                   │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │ 项目A    │ │ 项目B    │ │ 项目C    │ ← 卡片网格  │
│  │ 字节跳动  │ │ 内部     │ │ ...     │             │
│  │ 2025.3-9 │ │ 2026.1-4 │ │         │             │
│  │ 4 能力   │ │ 2 能力   │ │         │             │
│  └─────────┘ └─────────┘ └─────────┘             │
│                                                  │
│                    [+ 新增项目]                    │
└──────────────────────────────────────────────────┘
```

点击卡片 → 右侧滑出详情面板（与求职战役一致的面板交互）：

```
┌─────────────── 详情面板 ───────────────┐
│  ×                                      │
│  字节跳动 · 高级前端工程师                │
│  2025.03 — 2025.09    BP项目            │
│                                         │
│  📌 缘起                                 │
│  业务线扩张，需要统一前端架构              │
│                                         │
│  👥 伙伴                                 │
│  @李技术(技术总监) · @张产品(产品经理)     │
│                                         │
│  📝 过程                                 │
│  - 主导微前端架构设计                     │
│  - 推动 3 条业务线迁移                    │
│  - 制定团队编码规范                       │
│                                         │
│  🎯 结果                                 │
│  首屏加载提升 40% · 团队效率 +30%         │
│                                         │
│  🏷️ 关联能力                             │
│  [前端架构 L4] [性能优化 L3] [团队管理 L3]  │
│  💡 AI 建议：[协作沟通 L2] [项目管理 L3]    │
│  → 点击确认或移除                          │
│  [+ 关联能力]                             │
│                                         │
│  [编辑] [删除]                           │
└─────────────────────────────────────────┘
```

---

## INTERACTION DESIGN

### 与简历板块的联动（P3）

```
简历编辑页 → 点击「🤖 AI 生成工作经历」
  → 弹出项目选择器（勾选内部战役项目）
    → 点击「生成」
      → API: POST /api/ai/generate-resume-section
        → 输入：选中的项目 JSON
        → 输出：Markdown 工作经历描述
      → 用户编辑确认
        → 插入简历 content 字段
        → 简历段落存储 sourceProjectIds
```

### 与职业宇宙的联动（P2）

**自动打标（保存即触发）**：
```
项目保存成功（process + results 非空）
  → 自动调用 POST /api/ai/suggest-skills
    → 输入：项目 process + results + role 文本
    → 输出：最多 8 个推荐 { skillId, skillName, trackId, level, reason }
  → 详情面板能力区域显示「💡 AI 建议」标签行（虚线边框，待确认态）
    → 点击标签 = 确认（变实线，入 skillTags）
    → 点击 × = 移除（不保存）
    → 可继续手动添加
```

**手动打标**：
```
项目详情面板 → 点击「+ 关联能力」
  → 弹出 skill picker（按 track 分组，搜索筛选）
    → 勾选 + 设定 level → 保存入 skillTags
```

---

## OUT OF SCOPE

- 多人协作 / 分享项目记录
- 项目附件上传（暂用文本描述）
- 项目时间线甘特图
- 自动从 OB 笔记同步项目（后续可考虑）
- 项目与公司库、人脉库的自动关联

---

## DEPENDENCIES

- **职业宇宙**：`src/data/domain-tracks.ts` 的 skill 体系作为能力标签的枚举源
- **简历板块**：`/resumes` 页面的简历编辑器需要新增「AI 生成」按钮和项目选择器
- **AI API**：P3 需要新增 `/api/ai/generate-resume-section` 路由（DeepSeek，结构化 prompt）
- **AI API**：P2 AI 推荐能力需要新增 `/api/ai/suggest-skills` 路由

---

## SUCCESS METRIC

> 更新一份简历的工作经历部分，从"翻资料→回忆→手写→反复改"（2-4 小时）降为"勾选项目→AI 生成→微调"（10-15 分钟）。

---

## PRIORITY

P1 项目 CRUD → **P0（先有数据池）**
P2 职业宇宙联动 → P1（池子有了再关联）
P3 简历 AI 生成 → P2（联动有了再生成）
