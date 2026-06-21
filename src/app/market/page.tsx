'use client';

import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, Select, Tag, Typography,
  Space, message, Empty, Collapse, Divider, Badge
} from 'antd';
import {
  PlusOutlined, SearchOutlined, GlobalOutlined, FundOutlined,
  DollarOutlined, TeamOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ===================== Types =====================
interface MarketInsight {
  id: string;
  title: string;
  content: string;
  category: string;
  industry: string;
  position: string;
  dataPoints: string;
  source: string;
  createdAt: string;
}

// ===================== Config =====================
const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  '薪酬对标': { color: 'green', icon: <DollarOutlined /> },
  '人才趋势': { color: 'blue', icon: <FundOutlined /> },
  '行业动态': { color: 'orange', icon: <GlobalOutlined /> },
};

const categoryOptions = Object.keys(categoryConfig);
const industryOptions = ['互联网', '金融', '制造', '医疗', '教育', '零售', '新能源'];

// ===================== Mock Data =====================
const mockInsights: MarketInsight[] = [
  {
    id: 'm1',
    title: '2024年互联网行业算法工程师薪酬报告',
    content: '根据最新市场调研数据，2024年互联网行业算法工程师薪酬呈现明显分化趋势。初级算法工程师（1-3年经验）年薪中位数约25-35万，中级（3-5年）约40-60万，高级（5年+）约60-100万。大模型方向（LLM/AIGC）人才薪资溢价明显，较传统NLP/CV方向高出30-50%。头部公司（字节、阿里、腾讯）的P7级算法岗总包普遍在80-150万区间。值得注意的是，二线城市算法岗薪资增速快于一线，成都、杭州等城市差距正在缩小。',
    category: '薪酬对标', industry: '互联网', position: '算法工程师',
    dataPoints: '{"初级_年薪_中位":30,"中级_年薪_中位":50,"高级_年薪_中位":80,"大模型溢价":"30-50%"}',
    source: '猎聘大数据 & 脉脉调研', createdAt: '2024-03-18'
  },
  {
    id: 'm2',
    title: 'AIGC时代人才需求结构性变化分析',
    content: '随着大语言模型技术的爆发式发展，2024年人才市场出现显著的结构性变化：1) AIGC相关岗位需求同比增长280%，涵盖Prompt工程师、大模型微调专家、AI产品经理等新兴职位；2) 传统初级开发岗位需求下降约15%，企业更倾向于招聘能用AI工具提效的复合型人才；3) AI安全与合规方向人才缺口巨大，供需比达1:8；4) 跨领域AI应用人才（如AI+医疗、AI+金融）成为各企业争抢对象。建议HR重点关注具备AI素养的复合型人才储备。',
    category: '人才趋势', industry: '互联网', position: 'AI相关岗位',
    dataPoints: '{"AIGC岗位增长":"280%","传统开发下降":"15%","AI安全供需比":"1:8"}',
    source: 'LinkedIn经济图谱 & Boss直聘研究院', createdAt: '2024-03-15'
  },
  {
    id: 'm3',
    title: '新能源行业招聘市场持续火热',
    content: '2024年Q1新能源行业招聘数据显示：电池技术研发人才需求同比增长65%，储能方向人才缺口超过10万。智能驾驶算法人才薪资持续走高，年薪50万以上职位数量同比增长40%。光伏、风电领域的项目管理人才供不应求，有经验的项目总监年薪可达60-80万。从地域看，长三角和珠三角是新能源人才需求最集中的区域，合肥、常州、深圳成为热门城市。行业整体薪资水平较互联网行业仍有10-20%的差距，但增速明显更快。',
    category: '行业动态', industry: '新能源', position: '全岗位',
    dataPoints: '{"电池人才需求增长":"65%","储能缺口":"10万+","智驾薪资增长":"40%"}',
    source: '智联招聘行业报告', createdAt: '2024-03-10'
  },
  {
    id: 'm4',
    title: '金融行业数字化转型人才需求洞察',
    content: '金融科技持续推动传统金融机构的人才结构转型。2024年数据显示：量化研究员/策略开发人才年薪中位数80-120万，Top人才可达200万+；风控模型工程师需求稳定增长，银行系与互联网金融薪资差异缩小；合规科技（RegTech）方向人才成为新蓝海，熟悉反洗钱和数据合规的人才溢价40%。从技能要求看，Python已成为金融技术岗的标配，Rust在量化交易领域需求快速增长。传统金融分析师向"金融+技术"复合型转型成为明显趋势。',
    category: '薪酬对标', industry: '金融', position: '量化/风控',
    dataPoints: '{"量化年薪中位":"80-120万","合规科技溢价":"40%","Python要求占比":"85%"}',
    source: 'Michael Page金融薪酬调研', createdAt: '2024-03-05'
  },
  {
    id: 'm5',
    title: '远程办公对人才市场的影响持续深化',
    content: '后疫情时代，远程/混合办公模式对招聘市场产生深远影响。调研显示：提供远程选项的职位收到的申请数量平均多出47%；约68%的技术人才将灵活办公列为选择雇主的前三重要因素；全球远程团队管理人才（分布式团队Leader）需求增长120%；支持远程办公的企业在人才竞争中平均招聘周期缩短23%。值得注意的是，纯远程岗位的薪资较混合办公平均低5-10%，但员工满意度和留存率更高。建议企业在招聘策略中充分考虑办公模式的差异化竞争力。',
    category: '人才趋势', industry: '互联网', position: '全岗位',
    dataPoints: '{"远程职位申请量增加":"47%","灵活办公重要性":"68%","招聘周期缩短":"23%"}',
    source: 'Buffer远程工作报告 & Gartner HR调研', createdAt: '2024-02-28'
  },
  {
    id: 'm6',
    title: '医疗健康行业人才供需分析',
    content: '2024年医疗健康行业呈现强劲增长态势：AI医疗方向人才需求同比增长150%，尤其是医学影像AI和药物研发AI两个细分领域；临床试验管理人才（CRA/CPM）持续紧缺，有经验者薪资涨幅达25%；医疗器械研发工程师在国产替代趋势下需求旺盛，尤其是影像设备和体外诊断方向；生物医药领域海外归国人才增多，企业纷纷提高海外人才引进预算。行业整体薪资竞争力在提升，但头部人才仍倾向外企或创业。',
    category: '行业动态', industry: '医疗', position: '全岗位',
    dataPoints: '{"AI医疗需求增长":"150%","CRA薪资涨幅":"25%","国产替代增速":"持续上升"}',
    source: '丁香人才 & 医药魔方', createdAt: '2024-02-20'
  },
];

// ===================== Component =====================
export default function MarketInsightsPage() {
  const [insights, setInsights] = useState<MarketInsight[]>(mockInsights);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [industryFilter, setIndustryFilter] = useState<string | undefined>(undefined);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  // ===================== Filtered =====================
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (categoryFilter && insight.category !== categoryFilter) return false;
      if (industryFilter && insight.industry !== industryFilter) return false;
      if (searchText) {
        const s = searchText.toLowerCase();
        return insight.title.toLowerCase().includes(s) || insight.content.toLowerCase().includes(s);
      }
      return true;
    });
  }, [insights, searchText, categoryFilter, industryFilter]);

  // ===================== Handlers =====================
  const handleAdd = (values: any) => {
    const newInsight: MarketInsight = {
      id: `m${Date.now()}`,
      title: values.title,
      content: values.content,
      category: values.category,
      industry: values.industry || '',
      position: values.position || '',
      dataPoints: values.dataPoints || '',
      source: values.source || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInsights([newInsight, ...insights]);
    setAddModalVisible(false);
    form.resetFields();
    message.success('洞察已添加');
  };

  // ===================== Render =====================
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>市场洞察</Title>

      {/* Filter Bar */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="搜索洞察标题或内容"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            placeholder="按分类筛选"
            value={categoryFilter}
            onChange={v => setCategoryFilter(v)}
            allowClear
            style={{ width: 150 }}
            options={categoryOptions.map(c => ({ label: c, value: c }))}
          />
          <Select
            placeholder="按行业筛选"
            value={industryFilter}
            onChange={v => setIndustryFilter(v)}
            allowClear
            style={{ width: 150 }}
            options={industryOptions.map(i => ({ label: i, value: i }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            新增洞察
          </Button>
        </Space>
      </Card>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card><Empty description="暂无洞察数据" /></Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredInsights.map(insight => {
            const config = categoryConfig[insight.category] || { color: 'default', icon: <FileTextOutlined /> };
            const isExpanded = expandedKey === insight.id;
            return (
              <Col xs={24} sm={24} md={12} lg={8} key={insight.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  onClick={() => setExpandedKey(isExpanded ? null : insight.id)}
                  actions={[
                    <Button type="link" size="small" onClick={e => e.stopPropagation()}>
                      {isExpanded ? '收起' : '展开详情'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<span style={{ fontSize: 28, color: config.color === 'green' ? '#52c41a' : config.color === 'blue' ? '#1890ff' : '#fa8c16' }}>{config.icon}</span>}
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 15 }}>{insight.title}</Text>
                        <Space size={4} style={{ marginTop: 4 }}>
                          <Tag color={config.color}>{insight.category}</Tag>
                          {insight.industry && <Tag>{insight.industry}</Tag>}
                        </Space>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={!isExpanded ? { rows: 3 } : false}
                          style={{ marginBottom: 8 }}
                        >
                          {insight.content}
                        </Paragraph>
                        <Divider style={{ margin: '8px 0' }} />
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          {insight.position && <Text type="secondary" style={{ fontSize: 12 }}>岗位：{insight.position}</Text>}
                          {insight.source && <Text type="secondary" style={{ fontSize: 12 }}>来源：{insight.source}</Text>}
                          <Text type="secondary" style={{ fontSize: 12 }}>日期：{insight.createdAt}</Text>
                        </Space>
                        {isExpanded && insight.dataPoints && (
                          <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              数据点：{insight.dataPoints}
                            </Text>
                          </>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Add Insight Modal */}
      <Modal
        title="新增市场洞察"
        open={addModalVisible}
        onCancel={() => { setAddModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="洞察标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={6} placeholder="洞察详细内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder="请选择" options={categoryOptions.map(c => ({ label: c, value: c }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="industry" label="行业">
                <Select placeholder="请选择" allowClear options={industryOptions.map(i => ({ label: i, value: i }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="position" label="岗位">
                <Input placeholder="相关岗位" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="source" label="数据来源">
            <Input placeholder="数据或信息的来源" />
          </Form.Item>
          <Form.Item name="dataPoints" label="数据点 (JSON格式)">
            <TextArea rows={3} placeholder='{"key1":"value1","key2":"value2"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
