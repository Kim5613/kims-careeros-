// Auto-generated from OB project reviews. DO NOT EDIT MANUALLY.
// Run: node scripts/sync-ob-tracks.js
// Generated: 2026-07-16T06:16:12.494Z

export type SkillCategory = "hard" | "soft" | "domain" | "tool";
export type SkillLevel = 1 | 2 | 3 | 4;

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  currentLevel: SkillLevel;
  targetLevel?: SkillLevel;
  description?: string;
}

export interface Track {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  description: string;
  skills: Skill[];
}

export interface DomainData {
  id: string;
  label: string;
  description: string;
  tracks: Track[];
}

// ── HR ──
const hrTracks: Track[] = [
  {
    id: "ta",
    name: "TA",
    subtitle: "",
    emoji: "",
    color: "#8b7cf0",
    description: "能从业务需求拆解到具体人才画像，输出标准化评估维度",
    skills: [
    { id: "ta1", name: "岗位画像", category: "hard", currentLevel: 4, description: "能从业务需求拆解到具体人才画像，输出标准化评估维度" },
    { id: "ta2", name: "面试评估", category: "hard", currentLevel: 4, description: "独立设计结构化面试流程，引入行为事件访谈法" },
    { id: "ta3", name: "ATS 系统", category: "tool", currentLevel: 3, description: "Moka 深度配置，含自动化筛选规则和流程审批" },
    { id: "ta4", name: "渠道运营", category: "domain", currentLevel: 3, description: "猎头/内推/直投三渠道 ROI 对比分析和组合策略" },
    { id: "ta5", name: "雇主品牌", category: "hard", currentLevel: 2, targetLevel: 3, description: "独立策划并执行校招全流程，含宣讲和线上线下物料" },
    { id: "ta6", name: "活动策划", category: "soft", currentLevel: 3, description: "统筹多部门协作，时间线和资源管理" },
    { id: "ta7", name: "高管寻访", category: "hard", currentLevel: 2, targetLevel: 3, description: "VP 级别寻访全流程实操，含人才地图和薪酬对标" },
    { id: "ta8", name: "薪酬谈判", category: "soft", currentLevel: 3, description: "独立完成 VP 级别 offer 沟通，含股权激励方案说明" },
    { id: "ta9", name: "沟通影响力", category: "soft", currentLevel: 3, description: "与 CEO/CTO 紧密协作，推动决策闭环" }
    ],
  },
  {
    id: "一、表达指导",
    name: "一、表达指导",
    subtitle: "",
    emoji: "",
    color: "#597ef7",
    description: "一、表达指导",
    skills: [

    ],
  },
  {
    id: "二、大师讨论",
    name: "二、大师讨论",
    subtitle: "",
    emoji: "",
    color: "#13c2c2",
    description: "二、大师讨论",
    skills: [

    ],
  },
  {
    id: "三、总结",
    name: "三、总结",
    subtitle: "",
    emoji: "",
    color: "#52c41a",
    description: "三、总结",
    skills: [

    ],
  },
  {
    id: "四、能力对标建议",
    name: "四、能力对标建议",
    subtitle: "",
    emoji: "",
    color: "#fa8c16",
    description: "四、能力对标建议",
    skills: [

    ],
  },
  {
    id: "五、面试话术",
    name: "五、面试话术",
    subtitle: "",
    emoji: "",
    color: "#eb2f96",
    description: "五、面试话术",
    skills: [

    ],
  }
];

export const DOMAIN_REGISTRY: Record<string, DomainData> = {
  "hr": { id: "hr", label: "HR", description: "", tracks: hrTracks },
};

export const ALL_DOMAINS = [
  { id: "hr", label: "HR", color: "#8b7cf0", available: true },
  { id: "admin", label: "行政", color: "#597ef7", available: false },
  { id: "product", label: "产品", color: "#13c2c2", available: false },
  { id: "dev", label: "开发", color: "#52c41a", available: false },
  { id: "design", label: "设计", color: "#fa8c16", available: false },
  { id: "marketing", label: "市场", color: "#eb2f96", available: false },
  { id: "sales", label: "销售", color: "#ff6b6b", available: false },
  { id: "finance", label: "财务", color: "#722ed1", available: false },
  { id: "legal", label: "法务", color: "#2f54eb", available: false },
  { id: "ops", label: "运营", color: "#faad14", available: false },
];
