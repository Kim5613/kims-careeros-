'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Statistic, Tag, List, Skeleton, Empty } from 'antd';
import {
  FundOutlined, TeamOutlined, GlobalOutlined, BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ActivityItem {
  id: string; type: string; title: string; subtitle: string; date: string; link: string;
}

export default function WorkbenchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ companies: 0, contacts: 0, insights: 0, applications: 0 });
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/companies').then(r => r.json()).catch(() => []),
      fetch('/api/contacts').then(r => r.json()).catch(() => []),
      fetch('/api/market-insights').then(r => r.json()).catch(() => []),
      fetch('/api/applications').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/activity?limit=8').then(r => r.json()).catch(() => ({ activities: [] })),
    ]).then(([companies, contacts, insights, applications, activityData]) => {
      const comps = Array.isArray(companies) ? companies : [];
      const conts = Array.isArray(contacts) ? contacts : [];
      const insts = Array.isArray(insights) ? insights : [];
      const apps = Array.isArray(applications) ? applications : [];
      setStats({
        companies: comps.length,
        contacts: conts.length,
        insights: insts.length,
        applications: apps.length,
      });
      setRecentCompanies(comps.slice(0, 5));
      setRecentContacts(conts.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const statCards = [
    { title: '公司', value: stats.companies, icon: <FundOutlined />, color: '#8b7cf0', link: '/companies' },
    { title: '人脉', value: stats.contacts, icon: <TeamOutlined />, color: '#52c41a', link: '/contacts' },
    { title: '市场洞察', value: stats.insights, icon: <GlobalOutlined />, color: '#1890ff', link: '/market' },
    { title: '投递记录', value: stats.applications, icon: <BookOutlined />, color: '#fa8c16', link: '/job-seeking/applications' },
  ];

  return (
    <div style={{ padding: '24px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600, letterSpacing: 1 }}>HR工作台</Title>
        <Text style={{ fontSize: 13, color: '#bbb' }}>{dayjs().format('YYYY年M月D日 dddd')}</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {statCards.map((s) => (
          <Col xs={12} sm={6} key={s.title}>
            <Card hoverable onClick={() => router.push(s.link)}
              style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer' }}
              bodyStyle={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 600, fontSize: 30 }} />
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 18 }}>{s.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 左栏：大师智囊团 + 最近公司 */}
        <Col xs={24} md={8}>
          <Card hoverable onClick={() => router.push('/hr-roundtable')}
            style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer',
              borderLeft: '3px solid #8b7cf0', marginBottom: 16 }}
            bodyStyle={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0edff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛️</div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15 }}>大师智囊团</Text>
                <br /><Text type="secondary" style={{ fontSize: 12 }}>6 位 HR 大师 · 三轮追问 · CHO 最终结论</Text>
              </div>
              <TrophyOutlined style={{ color: '#8b7cf0', fontSize: 16 }} />
            </div>
          </Card>

          {/* 最近公司 */}
          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '18px 22px' }}>
            <Title level={5} style={{ margin: '0 0 10px', fontWeight: 600 }}>最近公司</Title>
            {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : recentCompanies.length > 0 ? (
              recentCompanies.map((c: any) => (
                <div key={c.id} onClick={() => router.push('/companies')}
                  style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #f5f3f0' }}>
                  <Text style={{ fontSize: 13 }}>{c.name}</Text>
                  {c.industry && <Tag style={{ marginLeft: 8, borderRadius: 8, fontSize: 11 }}>{c.industry}</Tag>}
                </div>
              ))
            ) : <Text type="secondary" style={{ fontSize: 13 }}>暂无公司</Text>}
          </Card>
        </Col>

        {/* 右栏：最近人脉 */}
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '18px 22px' }}>
            <Title level={5} style={{ margin: '0 0 14px', fontWeight: 600 }}>最近人脉</Title>
            {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : recentContacts.length > 0 ? (
              <List dataSource={recentContacts} split={false}
                renderItem={(c: any) => (
                  <List.Item style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #f5f3f0' }}
                    onClick={() => router.push('/contacts')}>
                    <List.Item.Meta
                      avatar={<Tag color={c.relationType === '猎头' ? 'blue' : c.relationType === 'HR同行' ? 'purple' : c.relationType === '前同事' ? 'green' : 'default'} style={{ borderRadius: 10, padding: '0 8px', fontSize: 12 }}>{c.relationType || '人脉'}</Tag>}
                      title={<Text style={{ fontSize: 14 }}>{c.name}</Text>}
                      description={<Text type="secondary" style={{ fontSize: 12 }}>{[c.company?.name, c.position, c.lastInteractionDate ? dayjs(c.lastInteractionDate).format('MM-DD') : ''].filter(Boolean).join(' · ')}</Text>}
                    />
                  </List.Item>
                )} />
            ) : <Empty description="暂无人脉" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
