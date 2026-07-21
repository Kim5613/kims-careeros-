'use client';

import React, { useState, useMemo } from 'react';
import { useApiList } from '@/lib/hooks/useApi';
import {
  Card, Row, Col, Button, Modal, Form, Input, Select, InputNumber, Tag, Typography,
  Space, message, Empty, Collapse, Badge, Divider, Tooltip
} from 'antd';
import {
  PlusOutlined, SearchOutlined, BookOutlined, EditOutlined, DeleteOutlined,
  CodeOutlined, ShoppingOutlined, DollarOutlined, TeamOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ===================== Types =====================
interface KnowledgeEntry {
  id: string;
  positionCategory: string;
  company: string;
  terminology: string;
  jdTemplate: string;
  evaluationCriteria: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  marketInfo: string;
  notes: string;
  updatedAt: string;
}

// ===================== Category Config =====================
const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  '算法': { icon: <CodeOutlined />, color: '#8b7cf0' },
  '产品': { icon: <ShoppingOutlined />, color: '#722ed1' },
  '技术': { icon: <CodeOutlined />, color: '#13c2c2' },
  '财务': { icon: <DollarOutlined />, color: '#52c41a' },
  '销售': { icon: <TeamOutlined />, color: '#fa8c16' },
  '运营': { icon: <TeamOutlined />, color: '#eb2f96' },
  '设计': { icon: <BookOutlined />, color: '#fa541c' },
  'HR': { icon: <TeamOutlined />, color: '#8b7cf0' },
};

const categoryOptions = Object.keys(categoryConfig);

// ===================== Mock Data =====================
const mockKnowledge: KnowledgeEntry[] = [
  {
    id: 'k1', positionCategory: '算法', company: '通用',
    terminology: '深度学习、NLP、推荐系统、计算机视觉、强化学习等方向。常见框架包括TensorFlow、PyTorch、JAX。业务场景涉及搜索排序、广告推荐、内容理解等。',
    jdTemplate: '1. 负责核心算法研发与优化\n2. 构建高效特征工程体系\n3. 推动算法模型线上部署与效果跟踪\n4. 关注前沿技术研究与应用落地\n要求：硕士及以上，3年+相关经验',
    evaluationCriteria: '1. 算法基础（数据结构、机器学习原理）\n2. 编程能力（Python/C++）\n3. 实际项目经验与效果\n4. 论文发表情况\n5. 系统设计思维',
    salaryRangeMin: 35, salaryRangeMax: 80,
    marketInfo: '算法岗位供需比1:3，头部公司竞争激烈。大模型方向薪资涨幅30%+。',
    notes: '大模型方向人才稀缺，可适当放宽经验要求', updatedAt: '2024-03-15'
  },
  {
    id: 'k2', positionCategory: '产品', company: '通用',
    terminology: 'B端/C端产品、SaaS、PMF、用户增长、数据驱动决策。常用工具：Axure、Figma、JIRA、神策数据。',
    jdTemplate: '1. 负责产品规划与路线图制定\n2. 深度用户研究与需求分析\n3. 协调研发、设计、运营团队推进产品迭代\n4. 数据驱动决策，持续优化产品指标\n要求：本科及以上，3年+产品经验',
    evaluationCriteria: '1. 产品思维与商业敏感度\n2. 需求分析与优先级管理\n3. 跨团队沟通协调能力\n4. 数据分析能力\n5. 项目推动与执行力',
    salaryRangeMin: 25, salaryRangeMax: 60,
    marketInfo: 'B端产品人才需求旺盛，有行业经验的候选人溢价明显。',
    notes: '优先考察行业认知和实际项目产出', updatedAt: '2024-03-10'
  },
  {
    id: 'k3', positionCategory: '技术', company: '通用',
    terminology: '微服务架构、容器化(K8s/Docker)、CI/CD、高并发、分布式系统。技术栈：Java/Go/Python、Spring Boot、gRPC、Kafka。',
    jdTemplate: '1. 负责系统架构设计与技术选型\n2. 核心模块开发与性能优化\n3. 保障系统高可用与稳定性\n4. 技术团队指导与代码评审\n要求：本科及以上，5年+开发经验',
    evaluationCriteria: '1. 系统架构设计能力\n2. 编码规范与代码质量\n3. 性能优化与问题排查\n4. 技术深度与广度\n5. 团队协作与技术分享',
    salaryRangeMin: 30, salaryRangeMax: 70,
    marketInfo: '高级技术人才市场需求稳定，云原生方向持续增长。',
    notes: '注重实际项目复杂度和技术决策能力', updatedAt: '2024-03-08'
  },
  {
    id: 'k4', positionCategory: '财务', company: '通用',
    terminology: 'CPA、CFA、财务分析、预算管理、内控审计、税务筹划。熟悉SAP、金蝶、用友等财务系统。',
    jdTemplate: '1. 负责公司财务管理与分析\n2. 编制预算并监控执行\n3. 税务筹划与合规管理\n4. 财务报表编制与审核\n要求：本科及以上，CPA优先，5年+财务经验',
    evaluationCriteria: '1. 专业知识（会计准则、税法）\n2. 数据分析与报告能力\n3. 风险识别与防控意识\n4. 系统操作能力\n5. 沟通与协调能力',
    salaryRangeMin: 20, salaryRangeMax: 50,
    marketInfo: 'CPA持证人才溢价20-30%，CFO级别岗位竞争加剧。',
    notes: '上市公司经验加分，关注合规意识', updatedAt: '2024-02-28'
  },
  {
    id: 'k5', positionCategory: '销售', company: '通用',
    terminology: 'B2B/B2C销售、大客户管理、销售漏斗、CRM系统、解决方案销售。常用方法论：SPIN、Challenger Sale。',
    jdTemplate: '1. 负责目标客户开拓与商机挖掘\n2. 制定销售策略与执行计划\n3. 管理销售全流程直至签约\n4. 维护大客户关系，推动续约与增购\n要求：本科，3年+B2B销售经验',
    evaluationCriteria: '1. 业绩达成记录\n2. 客户资源与行业人脉\n3. 商务谈判与方案呈现\n4. 抗压能力与目标导向\n5. 团队协作与信息共享',
    salaryRangeMin: 15, salaryRangeMax: 50,
    marketInfo: '优秀销售人才流动率高，底薪+提成结构差异大。Top sales市场溢价明显。',
    notes: '重点考察历史业绩数据和大客户管理经验', updatedAt: '2024-03-01'
  },
  {
    id: 'k6', positionCategory: '运营', company: '通用',
    terminology: '增长运营、内容运营、用户运营、社群运营、数据运营。核心指标：DAU、留存率、转化率、LTV。',
    jdTemplate: '1. 制定运营策略与增长计划\n2. 搭建用户增长与留存体系\n3. 策划线上线下运营活动\n4. 数据驱动优化运营效果\n要求：本科，3年+运营经验',
    evaluationCriteria: '1. 策略制定与执行能力\n2. 数据分析与效果评估\n3. 创意策划与内容产出\n4. 用户洞察与同理心\n5. 资源整合与项目管理',
    salaryRangeMin: 18, salaryRangeMax: 45,
    marketInfo: '增长方向人才需求旺盛，有成功项目经验者溢价30%+。',
    notes: '关注候选人主导过的项目规模和可量化成果', updatedAt: '2024-03-05'
  },
  {
    id: 'k7', positionCategory: '设计', company: '通用',
    terminology: 'UI设计、UX设计、交互设计、设计系统、品牌设计。工具：Figma、Sketch、Adobe Creative Suite、Principle。',
    jdTemplate: '1. 负责产品界面与交互设计\n2. 参与设计系统建设与维护\n3. 配合产品与开发完成设计交付\n4. 关注用户体验与数据反馈\n要求：本科，3年+设计经验，附作品集',
    evaluationCriteria: '1. 作品集质量与设计审美\n2. 交互设计与用户体验思维\n3. 设计系统构建能力\n4. 工具熟练度与效率\n5. 沟通与协作能力',
    salaryRangeMin: 20, salaryRangeMax: 55,
    marketInfo: '设计人才市场供给充足，但高级交互设计师仍然稀缺。',
    notes: '面试必须看作品集，关注设计思维过程而非仅成品', updatedAt: '2024-02-20'
  },
  {
    id: 'k8', positionCategory: 'HR', company: '通用',
    terminology: '招聘全流程管理、人才评估、薪酬福利、HRBP、OD/TD、OKR/KPI。熟悉各大招聘平台与ATS系统。',
    jdTemplate: '1. 负责招聘需求分析与渠道管理\n2. 简历筛选与面试组织\n3. 薪酬方案设计与offer谈判\n4. 入职流程管理与试用期跟踪\n要求：本科，3年+招聘经验',
    evaluationCriteria: '1. 招聘专业知识与流程管理\n2. 人才识别与评估能力\n3. 沟通与影响力\n4. 数据分析与报告\n5. 行业理解与人脉',
    salaryRangeMin: 15, salaryRangeMax: 40,
    marketInfo: 'HRBP需求持续增长，有互联网行业经验者更受欢迎。',
    notes: '重点考察候选人在人才寻访和评估方面的实战能力', updatedAt: '2024-03-12'
  },
];

// ===================== Component =====================
export default function KnowledgePage() {
  const {
    data: knowledge,
    create: apiCreate,
    update: apiUpdate,
    remove: apiRemove,
  } = useApiList<KnowledgeEntry>({ endpoint: '/api/knowledge', mockData: mockKnowledge });
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<KnowledgeEntry | null>(null);
  const [form] = Form.useForm();

  // ===================== Computed =====================
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; lastUpdated: string }> = {};
    knowledge.forEach(entry => {
      if (!stats[entry.positionCategory]) {
        stats[entry.positionCategory] = { count: 0, lastUpdated: '' };
      }
      stats[entry.positionCategory].count += 1;
      if (entry.updatedAt > stats[entry.positionCategory].lastUpdated) {
        stats[entry.positionCategory].lastUpdated = entry.updatedAt;
      }
    });
    return stats;
  }, [knowledge]);

  const filteredEntries = useMemo(() => {
    return knowledge.filter(entry => {
      if (selectedCategory && entry.positionCategory !== selectedCategory) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          entry.terminology.toLowerCase().includes(search) ||
          entry.jdTemplate.toLowerCase().includes(search) ||
          entry.positionCategory.toLowerCase().includes(search) ||
          entry.marketInfo.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [knowledge, selectedCategory, searchText]);

  // ===================== Handlers =====================
  const handleSubmit = async (values: any) => {
    const entry = {
      companyId: values.companyId,
      positionCategory: values.positionCategory,
      terminology: values.terminology,
      jdTemplate: values.jdTemplate,
      evaluationCriteria: values.evaluationCriteria,
      salaryRangeMin: values.salaryRangeMin,
      salaryRangeMax: values.salaryRangeMax,
      marketInfo: values.marketInfo,
      notes: values.notes,
    };
    if (editEntry) {
      await apiUpdate(editEntry.id, entry as any);
      message.success('知识条目已更新');
    } else {
      await apiCreate(entry as any);
      message.success('知识条目已创建');
    }
    setAddModalVisible(false);
    setEditEntry(null);
    form.resetFields();
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditEntry(entry);
    form.setFieldsValue(entry);
    setAddModalVisible(true);
  };

  const handleDelete = (id: string) => {
    apiRemove(id);
    message.success('知识条目已删除');
  };

  // ===================== Render =====================
  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      <Title level={2}>招聘知识库</Title>

      {/* Search */}
      <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        <Space wrap>
          <Input
            placeholder="搜索知识内容..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button
            type={selectedCategory === null ? 'primary' : 'default'}
            onClick={() => setSelectedCategory(null)}
          >
            全部分类
          </Button>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }} onClick={() => { setEditEntry(null); form.resetFields(); setAddModalVisible(true); }}>
            新增知识
          </Button>
        </Space>
      </Card>

      {/* Category Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {categoryOptions.map(cat => {
          const config = categoryConfig[cat];
          const stat = categoryStats[cat] || { count: 0, lastUpdated: '-' };
          const isSelected = selectedCategory === cat;
          return (
            <Col xs={12} sm={8} md={6} lg={3} key={cat}>
              <Card
                hoverable
                size="small"
                style={{
                  borderColor: isSelected ? config.color : undefined,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: 8,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                }}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
              >
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <span style={{ fontSize: 24, color: config.color }}>{config.icon}</span>
                  <Text strong>{cat}</Text>
                  <Badge count={stat.count} style={{ backgroundColor: config.color }} />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {stat.lastUpdated || '暂无数据'}
                  </Text>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Knowledge Entries */}
      {filteredEntries.length === 0 ? (
        <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}><Empty description="暂无知识条目" /></Card>
      ) : (
        <Collapse
          items={filteredEntries.map(entry => ({
            key: entry.id,
            label: (
              <Space>
                <Tag color={categoryConfig[entry.positionCategory]?.color} style={{ borderRadius: 8 }}>{entry.positionCategory}</Tag>
                <Text strong>{entry.company !== '通用' ? `[${entry.company}] ` : ''}{entry.positionCategory}岗位知识</Text>
                <Text type="secondary">薪资范围：{entry.salaryRangeMin}K-{entry.salaryRangeMax}K</Text>
                <Tag style={{ borderRadius: 8 }}>{entry.updatedAt}</Tag>
              </Space>
            ),
            extra: (
              <Space onClick={e => e.stopPropagation()}>
                <Tooltip title="编辑">
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(entry)} />
                </Tooltip>
                <Tooltip title="删除">
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} />
                </Tooltip>
              </Space>
            ),
            children: (
              <div>
                {entry.terminology && (
                  <>
                    <Title level={5}>技术术语 & 业务背景</Title>
                    <Paragraph>{entry.terminology}</Paragraph>
                  </>
                )}
                {entry.jdTemplate && (
                  <>
                    <Divider />
                    <Title level={5}>JD 模板</Title>
                    <Paragraph style={{ whiteSpace: 'pre-line' }}>{entry.jdTemplate}</Paragraph>
                  </>
                )}
                {entry.evaluationCriteria && (
                  <>
                    <Divider />
                    <Title level={5}>评估标准</Title>
                    <Paragraph style={{ whiteSpace: 'pre-line' }}>{entry.evaluationCriteria}</Paragraph>
                  </>
                )}
                {entry.marketInfo && (
                  <>
                    <Divider />
                    <Title level={5}>市场行情</Title>
                    <Paragraph>{entry.marketInfo}</Paragraph>
                  </>
                )}
                <Divider />
                <Row>
                  <Col span={12}>
                    <Text strong>薪资范围：</Text>
                    <Tag color="green" style={{ borderRadius: 8 }}>{entry.salaryRangeMin}K - {entry.salaryRangeMax}K</Tag>
                  </Col>
                  <Col span={12}>
                    <Text strong>更新时间：</Text>
                    <Text>{entry.updatedAt}</Text>
                  </Col>
                </Row>
                {entry.notes && (
                  <>
                    <Divider />
                    <Text strong>备注：</Text>
                    <Paragraph type="secondary">{entry.notes}</Paragraph>
                  </>
                )}
              </div>
            ),
          }))}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editEntry ? '编辑知识条目' : '新增知识条目'}
        open={addModalVisible}
        onCancel={() => { setAddModalVisible(false); setEditEntry(null); form.resetFields(); }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="positionCategory" label="岗位分类" rules={[{ required: true, message: '请选择岗位分类' }]}>
                <Select placeholder="请选择" style={{ borderRadius: 8 }} options={categoryOptions.map(c => ({ label: c, value: c }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="公司（可选）">
                <Input placeholder="特定公司或留空表示通用" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="terminology" label="技术术语 & 业务背景">
            <TextArea rows={3} placeholder="该岗位相关的技术术语、业务背景知识" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="jdTemplate" label="JD 模板">
            <TextArea rows={4} placeholder="职位描述模板" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="evaluationCriteria" label="评估标准">
            <TextArea rows={4} placeholder="面试评估标准和考察要点" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salaryRangeMin" label="薪资下限(K)">
                <InputNumber min={0} max={200} style={{ width: '100%', borderRadius: 8 }} placeholder="最低薪资" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salaryRangeMax" label="薪资上限(K)">
                <InputNumber min={0} max={200} style={{ width: '100%', borderRadius: 8 }} placeholder="最高薪资" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="marketInfo" label="市场行情参考">
            <TextArea rows={2} placeholder="市场行情、供需情况等" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={2} placeholder="其他备注" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
