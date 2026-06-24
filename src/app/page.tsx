'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Timeline,
  Typography,
  Space,
  Tag,
  Modal,
  Button,
  Input,
  Badge,
  Calendar,
} from 'antd';
import type { Dayjs } from 'dayjs';
import {
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  PlusOutlined,
  UserAddOutlined,
  EditOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  ArrowRightOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface ActivityItem {
  time: string;
  content: string;
  tag: string;
  tagColor: string;
  dotColor: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface ModuleLink {
  name: string;
  href: string;
  description: string;
}

interface TodoItem {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
}

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const recentActivities: ActivityItem[] = [
  {
    time: '今天 14:30',
    content: '张三 通过了「高级前端工程师」终面',
    tag: '面试',
    tagColor: 'green',
    dotColor: 'green',
  },
  {
    time: '今天 11:00',
    content: '新增求职记录 — 字节跳动·高级后端工程师',
    tag: '求职',
    tagColor: 'blue',
    dotColor: 'blue',
  },
  {
    time: '今天 09:15',
    content: '候选人 李四 更新简历，已同步至人才库',
    tag: '候选人',
    tagColor: 'purple',
    dotColor: 'purple',
  },
  {
    time: '昨天 18:45',
    content: '完成工作复盘：Q2 OKR 阶段性回顾',
    tag: '复盘',
    tagColor: 'orange',
    dotColor: 'orange',
  },
  {
    time: '昨天 16:20',
    content: '记录涨薪：基础薪资上调 15%',
    tag: '薪酬',
    tagColor: 'gold',
    dotColor: 'gold',
  },
  {
    time: '昨天 10:00',
    content: '新增招聘知识条目：技术面试评分标准 v2',
    tag: '知识库',
    tagColor: 'cyan',
    dotColor: 'cyan',
  },
  {
    time: '3天前',
    content: '王五 的候选人状态变更为「已发 Offer」',
    tag: '候选人',
    tagColor: 'purple',
    dotColor: 'purple',
  },
  {
    time: '3天前',
    content: '市场洞察报告更新：2026年H1技术岗薪酬趋势',
    tag: '洞察',
    tagColor: 'magenta',
    dotColor: 'magenta',
  },
];

const quickActions: QuickAction[] = [
  {
    title: '新增求职记录',
    description: '记录一次新的求职投递',
    icon: <PlusOutlined style={{ fontSize: 24 }} />,
    href: '/job-seeking/new',
    color: '#1677ff',
  },
  {
    title: '添加候选人',
    description: '将新候选人录入人才库',
    icon: <UserAddOutlined style={{ fontSize: 24 }} />,
    href: '/candidates/new',
    color: '#722ed1',
  },
  {
    title: '写工作复盘',
    description: '记录阶段性工作反思',
    icon: <EditOutlined style={{ fontSize: 24 }} />,
    href: '/growth/review/new',
    color: '#fa8c16',
  },
  {
    title: '记录涨薪',
    description: '更新薪酬变动信息',
    icon: <RiseOutlined style={{ fontSize: 24 }} />,
    href: '/salary-growth/new',
    color: '#52c41a',
  },
];

const myCareerModules: ModuleLink[] = [
  {
    name: '求职管理',
    href: '/job-seeking',
    description: '追踪求职进度与投递记录',
  },
  {
    name: '薪酬晋升',
    href: '/salary-growth',
    description: '管理薪资变化与晋升路径',
  },
  {
    name: '成长档案',
    href: '/growth',
    description: '工作复盘与能力成长记录',
  },
  {
    name: '简历管理',
    href: '/resumes',
    description: '维护与导出个人简历',
  },
];

const hrModules: ModuleLink[] = [
  {
    name: '候选人库',
    href: '/candidates',
    description: '管理所有候选人信息与状态',
  },
  {
    name: '招聘知识库',
    href: '/knowledge',
    description: '面试标准与招聘流程沉淀',
  },
  {
    name: '市场洞察',
    href: '/market',
    description: '行业薪酬与人才市场趋势',
  },
];

// ────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Link href={action.href} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          height: '100%',
          borderTop: `3px solid ${action.color}`,
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Space direction="vertical" size={8}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: `${action.color}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: action.color,
            }}
          >
            {action.icon}
          </div>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block' }}>
              {action.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {action.description}
            </Text>
          </div>
        </Space>
      </Card>
    </Link>
  );
}

function ModuleCard({ mod }: { mod: ModuleLink }) {
  return (
    <Link href={mod.href} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        size="small"
        style={{ borderRadius: 10 }}
        styles={{ body: { padding: '14px 18px' } }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 14 }}>
              {mod.name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {mod.description}
            </Text>
          </div>
          <ArrowRightOutlined
            style={{ color: '#bbb', fontSize: 14, flexShrink: 0 }}
          />
        </div>
      </Card>
    </Link>
  );
}

function ModuleSection({
  title,
  modules,
  accentColor,
}: {
  title: string;
  modules: ModuleLink[];
  accentColor: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 4,
            height: 20,
            borderRadius: 2,
            backgroundColor: accentColor,
          }}
        />
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
      </div>
      <Row gutter={[12, 12]}>
        {modules.map((mod) => (
          <Col xs={24} sm={12} key={mod.name}>
            <ModuleCard mod={mod} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(recentActivities);
  const [actions] = useState<QuickAction[]>(quickActions);

  useEffect(() => {
    fetch('/api/dashboard/activity')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActivities(data);
        }
      })
      .catch(() => {
        // keep mock data
      });
  }, []);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [todoText, setTodoText] = useState('');

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
    setTodoText('');
    setTodoModalOpen(true);
  };

  const handleAddTodo = () => {
    if (!todoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      date: selectedDate,
      content: todoText.trim(),
    };
    setTodos((prev) => [...prev, newTodo]);
    setTodoModalOpen(false);
    setTodoText('');
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const getTodosForDate = (date: Dayjs) => {
    const key = date.format('YYYY-MM-DD');
    return todos.filter((t) => t.date === key);
  };

  const dateCellRender = (date: Dayjs) => {
    const dayTodos = getTodosForDate(date);
    if (dayTodos.length === 0) return null;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTodos.map((t) => (
          <li key={t.id}>
            <Badge
              status="processing"
              text={
                <Text
                  style={{ fontSize: 11, maxWidth: 80 }}
                  ellipsis={{ tooltip: t.content }}
                >
                  {t.content}
                </Text>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // ── Render ──
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <Space align="center" size={10}>
          <HomeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>
            首页
          </Title>
        </Space>
        <Paragraph type="secondary" style={{ marginTop: 6, marginBottom: 0 }}>
          欢迎回来 Kim，这里是你的职业发展与 HR 工作台全局概览。
        </Paragraph>
      </div>

      {/* ── Section 1: Quick Actions (replaces old stat cards) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        {actions.map((action) => (
          <Col xs={24} sm={12} lg={6} key={action.title}>
            <QuickActionCard action={action} />
          </Col>
        ))}
      </Row>

      {/* ── Section 2: Activity Timeline & Calendar ── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        {/* Recent Activity */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>最近动态</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '20px 24px 8px' } }}
          >
            <Timeline
              items={activities.map((item) => ({
                color: item.dotColor,
                children: (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{item.content}</Text>
                      <Tag color={item.tagColor} style={{ margin: 0 }}>
                        {item.tag}
                      </Tag>
                    </div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, marginTop: 2, display: 'block' }}
                    >
                      {item.time}
                    </Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>待办日历</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: '12px 16px' } }}
          >
            <Calendar
              fullscreen={false}
              onSelect={handleDateSelect}
              cellRender={dateCellRender}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Section 3: Module Overview (left/right split) ── */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>模块概览</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: '24px 24px 8px' } }}
      >
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={12}>
            <ModuleSection
              title="个人板块"
              modules={myCareerModules}
              accentColor="#1677ff"
            />
          </Col>
          <Col xs={24} lg={12}>
            <ModuleSection
              title="HR工作台板块"
              modules={hrModules}
              accentColor="#722ed1"
            />
          </Col>
        </Row>
      </Card>

      {/* ── Todo Creation Modal ── */}
      <Modal
        title={`添加待办 — ${selectedDate}`}
        open={todoModalOpen}
        onOk={handleAddTodo}
        onCancel={() => setTodoModalOpen(false)}
        okText="添加"
        cancelText="取消"
        okButtonProps={{ disabled: !todoText.trim() }}
      >
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">日期：{selectedDate}</Text>
        </div>
        <TextArea
          placeholder="输入待办事项..."
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          rows={3}
          autoFocus
        />
        {/* Existing todos for this date */}
        {selectedDate && getTodosForDate(dayjs(selectedDate)).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              已有待办：
            </Text>
            {getTodosForDate(dayjs(selectedDate)).map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <Text style={{ fontSize: 13 }}>{t.content}</Text>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => handleDeleteTodo(t.id)}
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
