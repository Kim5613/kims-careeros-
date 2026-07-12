'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiList } from '@/lib/hooks/useApi';
import {
  Card,
  Row,
  Col,
  Timeline,
  Progress,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Typography,
  Space,
  message,
  Empty,
  Collapse,
  Badge,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  TrophyOutlined,
  FlagOutlined,
  StarOutlined,
  AimOutlined,
  CalendarOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string;
  project: string | null;
  impact: string | null;
  createdAt: string;
}

interface GoalOKR {
  id: string;
  objective: string;
  keyResults: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  createdAt: string;
}

interface AnnualReview {
  id: string;
  year: number;
  highlights: string | null;
  improvements: string | null;
  goals: string | null;
  nextYearPlan: string | null;
  createdAt: string;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const OKR_STATUS_OPTIONS = [
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已放弃', value: '已放弃' },
];

const OKR_STATUS_COLOR: Record<string, string> = {
  进行中: 'processing',
  已完成: 'success',
  已放弃: 'default',
};

const MILESTONE_COLORS = [
  '#8b7cf0',
  '#52c41a',
  '#722ed1',
  '#fa8c16',
  '#13c2c2',
  '#eb2f96',
];

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    date: '2026-03-01',
    title: '晋升为 P7 技术专家',
    description:
      '正式晋升为 P7 级别，开始承担更大的技术方向和团队管理职责。负责核心业务架构设计，带领 5 人技术团队。',
    tags: ['晋升', '技术管理', '架构'],
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'ms-2',
    date: '2025-08-15',
    title: '主导完成微服务架构迁移',
    description:
      '成功将单体应用迁移至微服务架构，系统可用性从 99.5% 提升至 99.99%，服务响应时间降低 40%。',
    tags: ['架构', '微服务', '技术攻坚'],
    createdAt: '2025-08-15T08:00:00.000Z',
  },
  {
    id: 'ms-3',
    date: '2024-06-01',
    title: '获得年度最佳技术创新奖',
    description:
      '因在低代码平台建设方面的突出贡献，获得公司年度技术创新奖。平台帮助业务团队效率提升 300%。',
    tags: ['获奖', '创新', '低代码'],
    createdAt: '2024-06-01T08:00:00.000Z',
  },
  {
    id: 'ms-4',
    date: '2023-09-01',
    title: '加入字节跳动',
    description:
      '从美团跳槽至字节跳动，薪资涨幅 45%，开启新的职业阶段。负责抖音电商前端基础设施建设。',
    tags: ['跳槽', '新起点', '字节跳动'],
    createdAt: '2023-09-01T08:00:00.000Z',
  },
  {
    id: 'ms-5',
    date: '2022-07-01',
    title: '校招入职美团',
    description:
      '通过校招加入美团，担任前端开发工程师。负责商家端核心业务模块开发，快速成长为独立模块负责人。',
    tags: ['校招', '入职', '职业起点'],
    createdAt: '2022-07-01T08:00:00.000Z',
  },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: '核心系统性能优化',
    description:
      '通过代码分割、懒加载和 CDN 优化策略，将首屏加载时间从 4.2s 降至 1.1s，用户转化率提升 23%。',
    date: '2025-11-20',
    project: '电商首页性能优化',
    impact: '首屏加载提速 74%，转化率提升 23%',
    createdAt: '2025-11-20T08:00:00.000Z',
  },
  {
    id: 'ach-2',
    title: '低代码平台从 0 到 1',
    description:
      '主导设计并实现企业级低代码平台，支持拖拽式页面搭建。上线后业务团队页面交付周期从 2 周缩短至 2 天。',
    date: '2024-05-15',
    project: '低代码搭建平台',
    impact: '页面交付效率提升 300%，节省 15 人/月开发资源',
    createdAt: '2024-05-15T08:00:00.000Z',
  },
  {
    id: 'ach-3',
    title: '团队技术分享体系建设',
    description:
      '建立团队每周技术分享机制，组织 30+ 场技术分享会。团队整体技术能力评估提升 40%，3 名成员获得晋升。',
    date: '2025-06-01',
    project: '技术团队建设',
    impact: '团队技术评估提升 40%，3 人成功晋升',
    createdAt: '2025-06-01T08:00:00.000Z',
  },
  {
    id: 'ach-4',
    title: '开源项目获 3K+ Star',
    description:
      '开源的 React 表单校验库获得社区广泛认可，GitHub Star 超过 3000，npm 月下载量突破 50K。',
    date: '2024-12-01',
    project: 'react-form-validator',
    impact: 'GitHub 3K+ Star，npm 月下载 50K+',
    createdAt: '2024-12-01T08:00:00.000Z',
  },
];

const MOCK_GOALS: GoalOKR[] = [
  {
    id: 'okr-1',
    objective: '成为技术架构师，具备大型系统设计能力',
    keyResults:
      '1. 完成 3 个核心系统的架构设计文档\n2. 通过 AWS Solutions Architect 认证\n3. 主导完成微服务拆分项目',
    status: '进行中',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    progress: 60,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'okr-2',
    objective: '提升团队管理能力，带领团队拿到业务结果',
    keyResults:
      '1. 团队规模从 5 人扩展到 8 人\n2. 团队 OKR 完成率 > 85%\n3. 培养 2 名技术骨干具备独当一面能力',
    status: '进行中',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    progress: 35,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'okr-3',
    objective: '开源影响力建设，回馈技术社区',
    keyResults:
      '1. 开源项目 Star 达到 5000\n2. 发表 5 篇高质量技术博客\n3. 在技术大会做 1 次分享',
    status: '进行中',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    progress: 45,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

const MOCK_ANNUAL_REVIEWS: AnnualReview[] = [
  {
    id: 'review-1',
    year: 2025,
    highlights:
      '成功晋升 P7，主导微服务架构迁移，系统可用性达到 99.99%。建立团队技术分享体系，3 名成员获得晋升。低代码平台用户突破 200。',
    improvements:
      '技术视野需要进一步拓宽，多关注行业趋势。时间管理有待提升，需要更好地平衡技术深度和管理工作。英文技术文档写作能力需要加强。',
    goals: '架构设计能力、团队管理能力、技术影响力',
    nextYearPlan:
      '1. 完成 AWS 架构师认证\n2. 主导 2 个核心系统的架构升级\n3. 团队规模扩展到 10 人\n4. 开源项目 Star 达到 5000',
    createdAt: '2025-12-28T08:00:00.000Z',
  },
  {
    id: 'review-2',
    year: 2024,
    highlights:
      '获得年度最佳技术创新奖，低代码平台从 0 到 1 成功上线。开源项目获得社区认可，Star 突破 3000。完成从 P5 到 P6 的晋升。',
    improvements:
      '项目管理能力需要加强，多个并行项目时优先级管理不够清晰。需要更多地与业务方沟通，理解业务本质。代码审查效率有提升空间。',
    goals: '技术创新、开源贡献、架构能力',
    nextYearPlan:
      '1. 晋升 P7\n2. 主导微服务架构迁移\n3. 建立团队技术分享文化\n4. 低代码平台用户达到 200',
    createdAt: '2024-12-30T08:00:00.000Z',
  },
];

// ────────────────────────────────────────────
// Sub-component: OKR Progress Card
// ────────────────────────────────────────────

function OKRCard({ goal }: { goal: GoalOKR }) {
  const progressColor =
    goal.status === '已完成'
      ? '#52c41a'
      : goal.status === '已放弃'
        ? '#d9d9d9'
        : goal.progress >= 70
          ? '#8b7cf0'
          : goal.progress >= 40
            ? '#fa8c16'
            : '#ff4d4f';

  return (
    <Card
      style={{ borderRadius: 20, height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <Text strong style={{ fontSize: 15, flex: 1, marginRight: 8 }}>
          {goal.objective}
        </Text>
        <Badge status={OKR_STATUS_COLOR[goal.status] as 'processing' | 'success' | 'default'} text={goal.status} />
      </div>

      {goal.keyResults && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            关键结果 (Key Results)
          </Text>
          <Paragraph
            style={{
              fontSize: 13,
              margin: 0,
              whiteSpace: 'pre-line',
              color: '#666',
            }}
          >
            {goal.keyResults}
          </Paragraph>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            完成进度
          </Text>
          <Text strong style={{ fontSize: 12, color: progressColor }}>
            {goal.progress}%
          </Text>
        </div>
        <Progress
          percent={goal.progress}
          showInfo={false}
          strokeColor={progressColor}
          size="small"
        />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {goal.startDate && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(goal.startDate).format('YYYY-MM-DD')}
          </Text>
        )}
        {goal.endDate && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            至 {dayjs(goal.endDate).format('YYYY-MM-DD')}
          </Text>
        )}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────
// Sub-component: Achievement Card
// ────────────────────────────────────────────

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card
      hoverable
      style={{ borderRadius: 20, height: '100%', borderTop: '3px solid #fa8c16', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space size={8} align="center">
            <TrophyOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            <Text strong style={{ fontSize: 15 }}>
              {achievement.title}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {dayjs(achievement.date).format('YYYY-MM')}
          </Text>
        </div>

        {achievement.description && (
          <Paragraph
            type="secondary"
            style={{ fontSize: 13, margin: 0 }}
            ellipsis={{ rows: 3 }}
          >
            {achievement.description}
          </Paragraph>
        )}

        {achievement.project && (
          <div>
            <Tag color="blue" style={{ borderRadius: 14 }}>{achievement.project}</Tag>
          </div>
        )}

        {achievement.impact && (
          <div
            style={{
              backgroundColor: '#fff7e6',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            <Text style={{ fontSize: 12, color: '#fa8c16' }}>
              <StarOutlined style={{ marginRight: 6 }} />
              影响力：{achievement.impact}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
}

// ────────────────────────────────────────────
// Sub-component: Annual Review Card
// ────────────────────────────────────────────

function AnnualReviewCard({ review }: { review: AnnualReview }) {
  return (
    <Collapse
      style={{ borderRadius: 12, marginBottom: 16 }}
      items={[
        {
          key: review.year.toString(),
          label: (
            <Space>
              <CalendarOutlined style={{ color: '#722ed1' }} />
              <Text strong style={{ fontSize: 15 }}>
                {review.year} 年度复盘
              </Text>
            </Space>
          ),
          children: (
            <div>
              {review.highlights && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{ fontSize: 13, color: '#52c41a', display: 'block', marginBottom: 6 }}
                  >
                    <StarOutlined style={{ marginRight: 6 }} />
                    年度亮点
                  </Text>
                  <Paragraph style={{ fontSize: 13, margin: 0, color: '#666' }}>
                    {review.highlights}
                  </Paragraph>
                </div>
              )}
              {review.improvements && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{ fontSize: 13, color: '#fa8c16', display: 'block', marginBottom: 6 }}
                  >
                    <AimOutlined style={{ marginRight: 6 }} />
                    改进方向
                  </Text>
                  <Paragraph style={{ fontSize: 13, margin: 0, color: '#666' }}>
                    {review.improvements}
                  </Paragraph>
                </div>
              )}
              {review.goals && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{ fontSize: 13, color: '#8b7cf0', display: 'block', marginBottom: 6 }}
                  >
                    <FlagOutlined style={{ marginRight: 6 }} />
                    核心目标
                  </Text>
                  <Paragraph style={{ fontSize: 13, margin: 0, color: '#666' }}>
                    {review.goals}
                  </Paragraph>
                </div>
              )}
              {review.nextYearPlan && (
                <div>
                  <Text
                    strong
                    style={{ fontSize: 13, color: '#722ed1', display: 'block', marginBottom: 6 }}
                  >
                    <RocketOutlined style={{ marginRight: 6 }} />
                    下年计划
                  </Text>
                  <Paragraph
                    style={{
                      fontSize: 13,
                      margin: 0,
                      color: '#666',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {review.nextYearPlan}
                  </Paragraph>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function GrowthPage() {
  const router = useRouter();
  const { data: milestones, loading: msLoading, create: msCreate } = useApiList<Milestone>({ endpoint: '/api/milestones', mockData: MOCK_MILESTONES });
  const { data: achievements, loading: achLoading, create: achCreate } = useApiList<Achievement>({ endpoint: '/api/achievements', mockData: MOCK_ACHIEVEMENTS });
  const { data: goals, loading: goalLoading, create: goalCreate } = useApiList<GoalOKR>({ endpoint: '/api/goals', mockData: MOCK_GOALS });
  const [annualReviews, setAnnualReviews] = useState<AnnualReview[]>(MOCK_ANNUAL_REVIEWS);
  const loading = msLoading || achLoading || goalLoading;

  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [milestoneForm] = Form.useForm();
  const [achievementForm] = Form.useForm();
  const [goalForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  // ── Modal submit handlers ──

  const handleMilestoneSubmit = async () => {
    try {
      const values = await milestoneForm.validateFields();
      setModalLoading(true);

      const payload = {
        date: values.date.toISOString(),
        title: values.title,
        description: values.description,
        tags: values.tags
          ? values.tags
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
      };

      try {
        const res = await fetch('/api/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          message.success('里程碑新增成功');
          setMilestoneModalOpen(false);
          milestoneForm.resetFields();
          // API handled by useApiList
          return;
        }
      } catch {
        // API unavailable
      }

      // Local fallback
      const newMilestone: Milestone = {
        id: `local-ms-${Date.now()}`,
        date: payload.date,
        title: payload.title,
        description: payload.description,
        tags: payload.tags,
        createdAt: new Date().toISOString(),
      };
      msCreate(payload as any);
      message.success('里程碑已添加');
      setMilestoneModalOpen(false);
      milestoneForm.resetFields();
    } catch {
      // Form validation failed
    } finally {
      setModalLoading(false);
    }
  };

  const handleAchievementSubmit = async () => {
    try {
      const values = await achievementForm.validateFields();
      setModalLoading(true);

      const payload = {
        title: values.title,
        description: values.description,
        date: values.date.toISOString(),
        project: values.project,
        impact: values.impact,
      };

      try {
        const res = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          message.success('成就新增成功');
          setAchievementModalOpen(false);
          achievementForm.resetFields();
          // API handled by useApiList
          return;
        }
      } catch {
        // API unavailable
      }

      // Local fallback
      const newAchievement: Achievement = {
        id: `local-ach-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        date: payload.date,
        project: payload.project,
        impact: payload.impact,
        createdAt: new Date().toISOString(),
      };
      achCreate(payload as any);
      message.success('成就已添加');
      setAchievementModalOpen(false);
      achievementForm.resetFields();
    } catch {
      // Form validation failed
    } finally {
      setModalLoading(false);
    }
  };

  const handleGoalSubmit = async () => {
    try {
      const values = await goalForm.validateFields();
      setModalLoading(true);

      const payload = {
        objective: values.objective,
        keyResults: values.keyResults,
        status: values.status || '进行中',
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        progress: values.progress || 0,
      };

      try {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          message.success('OKR 新增成功');
          setGoalModalOpen(false);
          goalForm.resetFields();
          // API handled by useApiList
          return;
        }
      } catch {
        // API unavailable
      }

      // Local fallback
      const newGoal: GoalOKR = {
        id: `local-okr-${Date.now()}`,
        objective: payload.objective,
        keyResults: payload.keyResults,
        status: payload.status,
        startDate: payload.startDate,
        endDate: payload.endDate,
        progress: payload.progress,
        createdAt: new Date().toISOString(),
      };
      goalCreate(payload as any);
      message.success('OKR 已添加');
      setGoalModalOpen(false);
      goalForm.resetFields();
    } catch {
      // Form validation failed
    } finally {
      setModalLoading(false);
    }
  };

  const handleReviewSubmit = () => {
    // Annual reviews are managed locally for now
    const values = reviewForm.getFieldsValue();
    const newReview: AnnualReview = {
      id: `local-review-${Date.now()}`,
      year: values.year,
      highlights: values.highlights,
      improvements: values.improvements,
      goals: values.goals,
      nextYearPlan: values.nextYearPlan,
      createdAt: new Date().toISOString(),
    };
    setAnnualReviews((prev) =>
      [newReview, ...prev].sort((a, b) => b.year - a.year)
    );
    message.success('年度复盘新增成功（本地）');
    setReviewModalOpen(false);
    reviewForm.resetFields();
  };

  // ── Render ──

  return (
    <div style={{ padding: '20px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            成长档案
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
            记录职业里程碑、成就亮点、OKR 目标与年度复盘
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            style={{ borderRadius: 20 }}
            onClick={() => router.push('/growth/career-sphere')}
          >
            🌐 职业宇宙
          </Button>
          <Button
            icon={<AimOutlined />}
            style={{ borderRadius: 20 }}
            onClick={() => router.push('/growth/skill-map')}
          >
            能力地图
          </Button>
        </div>
      </div>

      {/* ── Section 1: Career Milestones Timeline ── */}
      <Card
        title={
          <Space>
            <FlagOutlined />
            <span>成长里程碑</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 20 }}
            onClick={() => {
              milestoneForm.resetFields();
              setMilestoneModalOpen(true);
            }}
          >
            新增里程碑
          </Button>
        }
        style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {milestones.length === 0 ? (
          <Empty description="暂无里程碑记录" />
        ) : (
          <Timeline
            items={milestones
              .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
              .map((ms, idx) => ({
                color: MILESTONE_COLORS[idx % MILESTONE_COLORS.length],
                children: (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 4,
                      }}
                    >
                      <Text strong style={{ fontSize: 15 }}>
                        {ms.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(ms.date).format('YYYY-MM-DD')}
                      </Text>
                    </div>
                    {ms.description && (
                      <Paragraph
                        type="secondary"
                        style={{ fontSize: 13, margin: '4px 0', maxWidth: 600 }}
                      >
                        {ms.description}
                      </Paragraph>
                    )}
                    {ms.tags && ms.tags.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {ms.tags.map((tag) => (
                          <Tag
                            key={tag}
                            color={MILESTONE_COLORS[idx % MILESTONE_COLORS.length]}
                            style={{ fontSize: 11, borderRadius: 14 }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              }))}
          />
        )}
      </Card>

      {/* ── Section 2: Achievements ── */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>成就亮点库</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 20 }}
            onClick={() => {
              achievementForm.resetFields();
              setAchievementModalOpen(true);
            }}
          >
            新增成就
          </Button>
        }
        style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {achievements.length === 0 ? (
          <Empty description="暂无成就记录" />
        ) : (
          <Row gutter={[16, 16]}>
            {achievements.map((ach) => (
              <Col xs={24} sm={12} lg={8} key={ach.id}>
                <AchievementCard achievement={ach} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* ── Section 3: OKR Goals ── */}
      <Card
        title={
          <Space>
            <AimOutlined />
            <span>目标 OKR 追踪</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 20 }}
            onClick={() => {
              goalForm.resetFields();
              goalForm.setFieldsValue({ status: '进行中', progress: 0 });
              setGoalModalOpen(true);
            }}
          >
            新增 OKR
          </Button>
        }
        style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {goals.length === 0 ? (
          <Empty description="暂无 OKR 目标" />
        ) : (
          <Row gutter={[16, 16]}>
            {goals.map((goal) => (
              <Col xs={24} sm={12} lg={8} key={goal.id}>
                <OKRCard goal={goal} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* ── Section 4: Annual Reviews ── */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>年度复盘</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 20 }}
            onClick={() => {
              reviewForm.resetFields();
              setReviewModalOpen(true);
            }}
          >
            新增复盘
          </Button>
        }
        style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        {annualReviews.length === 0 ? (
          <Empty description="暂无年度复盘" />
        ) : (
          annualReviews
            .sort((a, b) => b.year - a.year)
            .map((review) => <AnnualReviewCard key={review.id} review={review} />)
        )}
      </Card>

      {/* ── Milestone Modal ── */}
      <Modal
        title={
          <Space>
            <FlagOutlined />
            <span>新增里程碑</span>
          </Space>
        }
        open={milestoneModalOpen}
        onOk={handleMilestoneSubmit}
        onCancel={() => setMilestoneModalOpen(false)}
        confirmLoading={modalLoading}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form form={milestoneForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: 14 }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="如：晋升为 P7 技术专家" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea
              rows={3}
              placeholder="详细描述这个里程碑..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="如：晋升, 技术管理, 架构" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Achievement Modal ── */}
      <Modal
        title={
          <Space>
            <TrophyOutlined />
            <span>新增成就</span>
          </Space>
        }
        open={achievementModalOpen}
        onOk={handleAchievementSubmit}
        onCancel={() => setAchievementModalOpen(false)}
        confirmLoading={modalLoading}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form form={achievementForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="成就标题"
            rules={[{ required: true, message: '请输入成就标题' }]}
          >
            <Input placeholder="如：核心系统性能优化" />
          </Form.Item>
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: 14 }} placeholder="选择日期" />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <TextArea
              rows={3}
              placeholder="描述你的成就..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="project" label="所属项目">
                <Input placeholder="如：电商首页优化" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="impact" label="影响力">
                <Input placeholder="如：转化率提升 23%" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Goal OKR Modal ── */}
      <Modal
        title={
          <Space>
            <AimOutlined />
            <span>新增 OKR 目标</span>
          </Space>
        }
        open={goalModalOpen}
        onOk={handleGoalSubmit}
        onCancel={() => setGoalModalOpen(false)}
        confirmLoading={modalLoading}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form
          form={goalForm}
          layout="vertical"
          initialValues={{ status: '进行中', progress: 0 }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="objective"
            label="目标 (Objective)"
            rules={[{ required: true, message: '请输入目标' }]}
          >
            <Input placeholder="如：成为技术架构师" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="keyResults" label="关键结果 (Key Results)">
            <TextArea
              rows={3}
              placeholder="列出关键结果，每行一条..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select options={OKR_STATUS_OPTIONS} style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="progress" label="进度 (%)">
                <Input type="number" min={0} max={100} placeholder="0" style={{ borderRadius: 14 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="endDate" label="截止日期">
                <DatePicker style={{ width: '100%', borderRadius: 14 }} placeholder="选择" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="startDate" label="开始日期">
            <DatePicker style={{ width: '100%', borderRadius: 14 }} placeholder="选择开始日期" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Annual Review Modal ── */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>新增年度复盘</span>
          </Space>
        }
        open={reviewModalOpen}
        onOk={handleReviewSubmit}
        onCancel={() => setReviewModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={reviewForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="year"
            label="年份"
            rules={[{ required: true, message: '请输入年份' }]}
          >
            <Input type="number" placeholder="如：2025" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="highlights" label="年度亮点">
            <TextArea
              rows={3}
              placeholder="今年最大的成就和亮点..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item name="improvements" label="改进方向">
            <TextArea
              rows={3}
              placeholder="需要改进的地方..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item name="goals" label="核心目标回顾">
            <TextArea
              rows={2}
              placeholder="今年设定的核心目标..."
              maxLength={300}
              showCount
            />
          </Form.Item>
          <Form.Item name="nextYearPlan" label="下年计划">
            <TextArea
              rows={3}
              placeholder="明年的计划和目标..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
