'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Statistic,
  Tag,
  Typography,
  Space,
  message,
  Divider,
  Timeline,
} from 'antd';
import {
  PlusOutlined,
  RiseOutlined,
  TrophyOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface Promotion {
  id: string;
  date: string;
  previousLevel: string | null;
  newLevel: string | null;
  companyName: string;
  reason: string | null;
  summary: string | null;
  createdAt: string;
}

interface SalaryChange {
  id: string;
  date: string;
  amount: number;
  changeType: string;
  companyName: string;
  notes: string | null;
  createdAt: string;
}

interface PromotionFormData {
  date: Dayjs;
  previousLevel: string;
  newLevel: string;
  companyName: string;
  reason: string;
  summary: string;
}

interface SalaryChangeFormData {
  date: Dayjs;
  amount: number;
  changeType: string;
  companyName: string;
  notes: string;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const CHANGE_TYPE_OPTIONS = [
  { label: '晋升调薪', value: '晋升调薪' },
  { label: '年度调薪', value: '年度调薪' },
  { label: '跳槽', value: '跳槽' },
  { label: '其他', value: '其他' },
];

const CHANGE_TYPE_COLOR: Record<string, string> = {
  晋升调薪: 'green',
  年度调薪: '#8b7cf0',
  跳槽: 'purple',
  其他: 'default',
};

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    date: '2026-03-01',
    previousLevel: 'P6 高级工程师',
    newLevel: 'P7 技术专家',
    companyName: '字节跳动',
    reason: '主导完成核心系统架构升级，带领5人团队交付关键项目',
    summary: '从执行者转型为技术负责人，开始承担团队管理职责',
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'promo-2',
    date: '2025-01-15',
    previousLevel: 'P5 中级工程师',
    newLevel: 'P6 高级工程师',
    companyName: '字节跳动',
    reason: '连续两个季度绩效优秀，独立负责多条业务线前端架构',
    summary: '技术深度和广度都有显著提升，开始指导初级工程师',
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'promo-3',
    date: '2023-07-01',
    previousLevel: 'P4 初级工程师',
    newLevel: 'P5 中级工程师',
    companyName: '美团',
    reason: '入职一年表现突出，独立完成商家端核心模块重构',
    summary: '从应届生成长为独立模块负责人，技术栈全面拓展',
    createdAt: '2023-07-01T08:00:00.000Z',
  },
  {
    id: 'promo-4',
    date: '2022-07-01',
    previousLevel: '校招入职',
    newLevel: 'P4 初级工程师',
    companyName: '美团',
    reason: '校招转正，试用期表现优异',
    summary: '正式开启职业生涯，快速融入团队并产出成果',
    createdAt: '2022-07-01T08:00:00.000Z',
  },
];

const MOCK_SALARY_CHANGES: SalaryChange[] = [
  {
    id: 'sal-1',
    date: '2026-03-15',
    amount: 50000,
    changeType: '晋升调薪',
    companyName: '字节跳动',
    notes: '晋升 P7 后薪资调整，月薪从 42K 涨至 50K',
    createdAt: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'sal-2',
    date: '2025-04-01',
    amount: 42000,
    changeType: '年度调薪',
    companyName: '字节跳动',
    notes: '年度绩效调薪，涨幅约 12%',
    createdAt: '2025-04-01T08:00:00.000Z',
  },
  {
    id: 'sal-3',
    date: '2025-01-15',
    amount: 37500,
    changeType: '晋升调薪',
    companyName: '字节跳动',
    notes: '晋升 P6 后薪资调整',
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'sal-4',
    date: '2024-04-01',
    amount: 32000,
    changeType: '年度调薪',
    companyName: '字节跳动',
    notes: '年度绩效调薪，涨幅约 10%',
    createdAt: '2024-04-01T08:00:00.000Z',
  },
  {
    id: 'sal-5',
    date: '2023-09-01',
    amount: 29000,
    changeType: '跳槽',
    companyName: '字节跳动',
    notes: '从美团跳槽至字节跳动，涨幅约 45%',
    createdAt: '2023-09-01T08:00:00.000Z',
  },
  {
    id: 'sal-6',
    date: '2022-07-01',
    amount: 20000,
    changeType: '其他',
    companyName: '美团',
    notes: '校招入职薪资',
    createdAt: '2022-07-01T08:00:00.000Z',
  },
];

// ────────────────────────────────────────────
// Sub-component: Salary Trend Chart (CSS-based)
// ────────────────────────────────────────────

function SalaryTrendChart({ salaryChanges }: { salaryChanges: SalaryChange[] }) {
  const sorted = useMemo(
    () =>
      [...salaryChanges].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      ),
    [salaryChanges]
  );

  const maxAmount = useMemo(
    () => Math.max(...sorted.map((s) => s.amount), 1),
    [sorted]
  );

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
        <Text type="secondary">暂无薪资数据</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Y-axis label + chart area */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {/* Y-axis */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 200,
            paddingBottom: 32,
            minWidth: 48,
            textAlign: 'right',
          }}
        >
          {[100, 75, 50, 25, 0].map((pct) => (
            <Text
              key={pct}
              type="secondary"
              style={{ fontSize: 11, lineHeight: 1 }}
            >
              {((maxAmount * pct) / 100 / 1000).toFixed(0)}K
            </Text>
          ))}
        </div>

        {/* Bars */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            height: 200,
            paddingBottom: 32,
            position: 'relative',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          {/* Horizontal grid lines */}
          {[25, 50, 75, 100].map((pct) => (
            <div
              key={pct}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${32 + (pct / 100) * 168}px`,
                borderBottom: '1px dashed #f0f0f0',
              }}
            />
          ))}

          {sorted.map((item, idx) => {
            const heightPct = (item.amount / maxAmount) * 100;
            const barHeight = (heightPct / 100) * 168;
            const colors: Record<string, string> = {
              晋升调薪: '#52c41a',
              年度调薪: '#8b7cf0',
              跳槽: '#722ed1',
              其他: '#fa8c16',
            };
            const color = colors[item.changeType] || '#8b7cf0';

            return (
              <div
                key={item.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Amount label above bar */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {(item.amount / 1000).toFixed(0)}K
                </Text>
                {/* Bar */}
                <div
                  style={{
                    width: '70%',
                    maxWidth: 56,
                    height: barHeight,
                    backgroundColor: color,
                    borderRadius: '6px 6px 0 0',
                    opacity: 0.85,
                    transition: 'height 0.4s ease',
                    cursor: 'pointer',
                  }}
                  title={`${dayjs(item.date).format('YYYY-MM')} - ${item.amount.toLocaleString()}元 (${item.changeType})`}
                />
                {/* Date label below */}
                <Text
                  type="secondary"
                  style={{
                    fontSize: 10,
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    bottom: -28,
                  }}
                >
                  {dayjs(item.date).format('YY/MM')}
                </Text>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries({
          晋升调薪: '#52c41a',
          年度调薪: '#8b7cf0',
          跳槽: '#722ed1',
          其他: '#fa8c16',
        }).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: color,
                opacity: 0.85,
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {label}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function SalaryGrowthPage() {
  const { data: promotions, loading: promoLoading, create: promoCreate } = useApiList<Promotion>({ endpoint: '/api/promotions', mockData: MOCK_PROMOTIONS });
  const { data: salaryChanges, loading: salaryLoading, create: salaryCreate } = useApiList<SalaryChange>({ endpoint: '/api/salary-changes', mockData: MOCK_SALARY_CHANGES });
  const loading = promoLoading || salaryLoading;

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [promoForm] = Form.useForm<PromotionFormData>();
  const [salaryForm] = Form.useForm<SalaryChangeFormData>();

  // ── Statistics ──

  const stats = useMemo(() => {
    const currentSalary =
      salaryChanges.length > 0
        ? Math.max(...salaryChanges.map((s) => s.amount))
        : 0;

    const totalRaises = salaryChanges.length;
    const totalPromotions = promotions.length;

    // Calculate average raise percentage
    let avgRaisePct = 0;
    if (salaryChanges.length >= 2) {
      const sorted = [...salaryChanges].sort(
        (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
      );
      let totalPct = 0;
      let count = 0;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1].amount > 0) {
          const pct =
            ((sorted[i].amount - sorted[i - 1].amount) / sorted[i - 1].amount) * 100;
          totalPct += pct;
          count++;
        }
      }
      avgRaisePct = count > 0 ? totalPct / count : 0;
    }

    return { currentSalary, totalRaises, totalPromotions, avgRaisePct };
  }, [promotions, salaryChanges]);

  // ── Modal handlers ──

  const handlePromoSubmit = async () => {
    try {
      const values = await promoForm.validateFields();
      setModalLoading(true);
      const payload = { date: values.date.toISOString(), previousLevel: values.previousLevel, newLevel: values.newLevel, companyName: values.companyName, reason: values.reason, summary: values.summary };
      await promoCreate(payload as any);
      message.success('晋升记录已添加');
      setPromoModalOpen(false);
      promoForm.resetFields();
    } catch { /* validation */ }
    finally { setModalLoading(false); }
  };

  const handleSalarySubmit = async () => {
    try {
      const values = await salaryForm.validateFields();
      setModalLoading(true);
      const payload = { date: values.date.toISOString(), amount: values.amount, changeType: values.changeType, companyName: values.companyName, notes: values.notes };
      await salaryCreate(payload as any);
      message.success('涨薪记录已添加');
      setSalaryModalOpen(false);
      salaryForm.resetFields();
    } catch { /* validation */ }
    finally { setModalLoading(false); }
  };

  // ── Table columns ──

  const promotionColumns: ColumnsType<Promotion> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: '原职级',
      dataIndex: 'previousLevel',
      key: 'previousLevel',
      width: 140,
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '新职级',
      dataIndex: 'newLevel',
      key: 'newLevel',
      width: 140,
      render: (val: string | null) =>
        val ? (
          <Tag color="green" style={{ fontSize: 13, borderRadius: 8 }}>
            {val}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 120,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '晋升原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (val: string | null) => val ?? '-',
    },
    {
      title: '总结',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (val: string | null) => val ?? '-',
    },
  ];

  const salaryColumns: ColumnsType<SalaryChange> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: '薪资（月薪）',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} 元
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '调薪类型',
      dataIndex: 'changeType',
      key: 'changeType',
      width: 110,
      render: (type: string) => (
        <Tag color={CHANGE_TYPE_COLOR[type] || 'default'} style={{ borderRadius: 8 }}>{type}</Tag>
      ),
      filters: CHANGE_TYPE_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.changeType === value,
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 120,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (val: string | null) => val ?? '-',
    },
  ];

  // ── Render ──

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          薪酬与晋升
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
          追踪薪资变化趋势，记录每一次晋升与涨薪
        </Paragraph>
      </div>

      {/* ── Section 1: Statistics Summary ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 8, borderTop: '3px solid #52c41a', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Statistic
              title="当前月薪"
              value={stats.currentSalary}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 8, borderTop: '3px solid #8b7cf0', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Statistic
              title="涨薪次数"
              value={stats.totalRaises}
              prefix={<RiseOutlined style={{ color: '#8b7cf0' }} />}
              suffix="次"
              valueStyle={{ color: '#8b7cf0', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 8, borderTop: '3px solid #722ed1', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Statistic
              title="晋升次数"
              value={stats.totalPromotions}
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              suffix="次"
              valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{ borderRadius: 8, borderTop: '3px solid #fa8c16', boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Statistic
              title="平均涨幅"
              value={stats.avgRaisePct}
              precision={1}
              prefix={<RiseOutlined style={{ color: '#fa8c16' }} />}
              suffix="%"
              valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Section 2: Salary Trend Chart ── */}
      <Card
        title={
          <Space>
            <RiseOutlined />
            <span>薪资趋势图</span>
          </Space>
        }
        style={{ borderRadius: 8, marginBottom: 24, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <SalaryTrendChart salaryChanges={salaryChanges} />
      </Card>

      {/* ── Section 3: Promotion Records ── */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>晋升记录</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() => {
              promoForm.resetFields();
              setPromoModalOpen(true);
            }}
          >
            新增晋升记录
          </Button>
        }
        style={{ borderRadius: 8, marginBottom: 24, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<Promotion>
          columns={promotionColumns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          size="middle"
        />
      </Card>

      {/* ── Section 4: Salary Change Records ── */}
      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>涨薪记录</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 8 }}
            onClick={() => {
              salaryForm.resetFields();
              salaryForm.setFieldsValue({ changeType: '年度调薪' });
              setSalaryModalOpen(true);
            }}
          >
            记录涨薪
          </Button>
        }
        style={{ borderRadius: 8, marginBottom: 24, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<SalaryChange>
          columns={salaryColumns}
          dataSource={salaryChanges}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          size="middle"
        />
      </Card>

      {/* ── Section 5: Career Timeline ── */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>职业轨迹</span>
          </Space>
        }
        style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Timeline
          items={[...promotions]
            .sort(
              (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
            )
            .map((promo) => ({
              color: 'green',
              children: (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong>{promo.newLevel}</Text>
                    <Tag color="purple" style={{ borderRadius: 8 }}>{promo.companyName}</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(promo.date).format('YYYY-MM-DD')}
                    {promo.previousLevel && ` | 从 ${promo.previousLevel} 晋升`}
                  </Text>
                  {promo.summary && (
                    <Paragraph
                      type="secondary"
                      style={{ fontSize: 13, marginTop: 4, marginBottom: 0 }}
                    >
                      {promo.summary}
                    </Paragraph>
                  )}
                </div>
              ),
            }))}
        />
      </Card>

      {/* ── Promotion Modal ── */}
      <Modal
        title={
          <Space>
            <TrophyOutlined />
            <span>新增晋升记录</span>
          </Space>
        }
        open={promoModalOpen}
        onOk={handlePromoSubmit}
        onCancel={() => setPromoModalOpen(false)}
        confirmLoading={modalLoading}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form
          form={promoForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item<PromotionFormData>
            name="date"
            label="晋升日期"
            rules={[{ required: true, message: '请选择晋升日期' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: 8 }} placeholder="选择日期" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<PromotionFormData>
                name="previousLevel"
                label="原职级"
                rules={[{ required: true, message: '请输入原职级' }]}
              >
                <Input placeholder="如：P6 高级工程师" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<PromotionFormData>
                name="newLevel"
                label="新职级"
                rules={[{ required: true, message: '请输入新职级' }]}
              >
                <Input placeholder="如：P7 技术专家" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item<PromotionFormData>
            name="companyName"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item<PromotionFormData>
            name="reason"
            label="晋升原因"
          >
            <TextArea
              rows={2}
              placeholder="描述晋升的原因和背景..."
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item<PromotionFormData>
            name="summary"
            label="总结"
          >
            <TextArea
              rows={2}
              placeholder="对这次晋升的总结与感悟..."
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Salary Change Modal ── */}
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <span>记录涨薪</span>
          </Space>
        }
        open={salaryModalOpen}
        onOk={handleSalarySubmit}
        onCancel={() => setSalaryModalOpen(false)}
        confirmLoading={modalLoading}
        okText="保存"
        cancelText="取消"
        width={560}
        destroyOnClose
      >
        <Form
          form={salaryForm}
          layout="vertical"
          initialValues={{ changeType: '年度调薪' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item<SalaryChangeFormData>
            name="date"
            label="生效日期"
            rules={[{ required: true, message: '请选择生效日期' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: 8 }} placeholder="选择日期" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<SalaryChangeFormData>
                name="amount"
                label="新薪资（月薪）"
                rules={[{ required: true, message: '请输入新薪资' }]}
              >
                <InputNumber
                  placeholder="月薪金额"
                  min={0}
                  style={{ width: '100%', borderRadius: 8 }}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<SalaryChangeFormData>
                name="changeType"
                label="调薪类型"
                rules={[{ required: true, message: '请选择调薪类型' }]}
              >
                <Select options={CHANGE_TYPE_OPTIONS} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item<SalaryChangeFormData>
            name="companyName"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item<SalaryChangeFormData>
            name="notes"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="记录调薪细节、前后薪资对比或其他备注..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
