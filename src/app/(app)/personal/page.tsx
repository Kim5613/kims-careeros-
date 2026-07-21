'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Typography, Statistic, Tag, List, Skeleton, Empty, Input, Button } from 'antd';
import {
  SearchOutlined, IdcardOutlined, TrophyOutlined, SendOutlined,
  ExperimentOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
const nowShanghai = () => dayjs().tz('Asia/Shanghai');

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ActivityItem {
  id: string; type: string; title: string; subtitle: string; date: string; link: string;
}

interface ChatMessage { role: 'user' | 'assistant'; content: string; id: string; }

const MASTERS = [
  { emoji: '🎖️', name: '拉姆·查兰', tag: '组织设计派' },
  { emoji: '📚', name: '戴维·尤里奇', tag: '人才管理派' },
  { emoji: '🔍', name: '埃德加·沙因', tag: '组织行为派' },
  { emoji: '⚔️', name: '鸿鹄老师', tag: '实战派' },
  { emoji: '🚀', name: '丹尼尔·平克', tag: '正向激励派' },
  { emoji: '💜', name: '谢丽尔·桑德伯格', tag: '包容视角派' },
];

const QUICK_PROMPTS = [
  '取消绩效奖金后，HRBP怎么转型？',
  '怎么设计不靠奖金的激励机制？',
  '组织变革中HR最该做什么？',
  '如何判断一个管理者是否胜任？',
];

export default function PersonalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0, resumes: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [focusText, setFocusText] = useState('');

  // 大师智囊团 chat state
  const [showMasters, setShowMasters] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/activity?limit=8').then(r => r.json()).catch(() => ({ activities: [] })),
      fetch('/api/applications').then(r => r.json()).catch(() => []),
      fetch('/api/resumes').then(r => r.json()).catch(() => []),
      fetch('/api/weekly-focus').then(r => r.json()).catch(() => null),
    ]).then(([activityData, applications, resumes, focus]) => {
      const apps = Array.isArray(applications) ? applications : [];
      const rms = Array.isArray(resumes) ? resumes : [];
      setStats({
        applications: apps.filter((a: any) => a.currentStage === '已投递').length,
        interviews: apps.filter((a: any) => a.currentStage === '面试').length,
        offers: apps.filter((a: any) => a.currentStage === 'offer').length,
        resumes: rms.length,
      });
      const acts = (activityData.activities || activityData.data || []).slice(0, 6).map((a: any) => ({
        id: a.id || Math.random().toString(36),
        type: a.type || a.entityType || 'other',
        title: a.title || a.name || a.positionName || '',
        subtitle: a.subtitle || a.company || a.description || '',
        date: a.date || a.createdAt || a.appliedDate || '',
        link: a.link || '',
      }));
      setRecentActivity(acts);
      if (focus) {
        const weekStart = nowShanghai().startOf('isoWeek').format('YYYY-MM-DD');
        const f = Array.isArray(focus) ? focus.find((w: any) => w.weekStart === weekStart) : focus;
        setFocusText(f?.workContent || f?.personalContent || '');
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), id: Date.now().toString() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/hr-roundtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const aiId = (Date.now() + 1).toString();
      setChatMessages(prev => [...prev, { role: 'assistant', content: '', id: aiId }]);

      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = line.slice(2).trim().replace(/^"|"$/g, '');
            setChatMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + text } : m));
          }
        }
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ 出错了：${e.message || '请稍后重试'}`, id: (Date.now() + 1).toString() }]);
    } finally {
      setStreaming(false);
    }
  };

  const statCards = [
    { title: '已投递', value: stats.applications, icon: <SendOutlined />, color: '#8b7cf0', link: '/job-seeking/applications' },
    { title: '面试中', value: stats.interviews, icon: <SearchOutlined />, color: '#fa8c16', link: '/job-seeking' },
    { title: 'Offer', value: stats.offers, icon: <TrophyOutlined />, color: '#f5222d', link: '/job-seeking' },
    { title: '简历', value: stats.resumes, icon: <IdcardOutlined />, color: '#52c41a', link: '/resumes' },
  ];

  const typeLabel: Record<string, string> = {
    application: '投递', interview: '面试', resume: '简历',
    promotion: '晋升', salary: '薪酬', milestone: '里程碑', focus: '周重点',
    todo: '日程', achievement: '成就',
  };

  return (
    <div style={{ padding: '24px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600, letterSpacing: 1 }}>个人</Title>
        <Text style={{ fontSize: 13, color: '#bbb' }}>{nowShanghai().format('YYYY年M月D日 dddd')}</Text>
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
        {/* 左栏 */}
        <Col xs={24} md={8}>
          {/* 本周重点 */}
          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 16 }}
            bodyStyle={{ padding: '18px 22px' }}>
            <Title level={5} style={{ margin: '0 0 10px', fontWeight: 600 }}>本周重点</Title>
            {focusText ? (
              <Text style={{ color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 13 }}>{focusText}</Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>暂无，去首页日视图设置 →</Text>
            )}
          </Card>

          {/* 岗位诊断 */}
          <Card hoverable onClick={() => router.push('/job-seeking/diagnosis')}
            style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer',
              borderLeft: '3px solid #8b7cf0', marginBottom: 16 }}
            bodyStyle={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0edff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔮</div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 15 }}>岗位诊断</Text>
                <br /><Text type="secondary" style={{ fontSize: 12 }}>JD + 简历 → AI 联网调研 → 红黄绿灯报告</Text>
              </div>
              <ExperimentOutlined style={{ color: '#8b7cf0', fontSize: 16 }} />
            </div>
          </Card>

          {/* 大师智囊团 — 展开/收起 */}
          <Card
            onClick={() => !showMasters && setShowMasters(true)}
            style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: showMasters ? 'default' : 'pointer',
              borderLeft: '3px solid #fa8c16' }}
            bodyStyle={{ padding: showMasters ? '0' : '18px 22px' }}>
            {!showMasters ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff7e6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 15 }}>大师智囊团</Text>
                  <br /><Text type="secondary" style={{ fontSize: 12 }}>6 位 HR 大师会诊你的困惑</Text>
                </div>
                <TrophyOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
                {/* Chat header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 18px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🏛️</span>
                    <Text strong style={{ fontSize: 14 }}>大师智囊团</Text>
                  </div>
                  <Button type="text" size="small" onClick={(e) => { e.stopPropagation(); setShowMasters(false); }}
                    style={{ color: '#bbb', fontSize: 12 }}>收起</Button>
                </div>
                {/* Messages */}
                <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 20 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
                        {MASTERS.map(m => <Tag key={m.emoji} style={{ borderRadius: 8, fontSize: 11, padding: '0 6px' }}>{m.emoji} {m.name}</Tag>)}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>提出 HR 困惑，六位大师轮番追问</Text>
                      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                        {QUICK_PROMPTS.map(p => (
                          <Tag key={p} style={{ cursor: 'pointer', borderRadius: 10, padding: '2px 10px', fontSize: 11 }}
                            onClick={(e) => { e.stopPropagation(); setChatInput(p); }}>{p}</Tag>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chatMessages.map(m => (
                      <div key={m.id} style={{ marginBottom: 12 }}>
                        {m.role === 'user' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ maxWidth: '85%', background: '#8b7cf0', color: '#fff',
                              borderRadius: '14px 4px 14px 14px', padding: '8px 14px', fontSize: 13, lineHeight: 1.6 }}>{m.content}</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>🏛️</span>
                            <div style={{ maxWidth: '90%', background: '#fff', borderRadius: '4px 14px 14px 14px',
                              padding: '10px 14px', fontSize: 12, lineHeight: 1.7, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                              {m.content ? (
                                <ReactMarkdown components={{
                                  p: ({ children }) => <Text style={{ fontSize: 12, lineHeight: 1.7 }}>{children}</Text>,
                                  h1: ({ children }) => <Title level={5} style={{ margin: '4px 0', fontSize: 14 }}>{children}</Title>,
                                  h2: ({ children }) => <Text strong style={{ fontSize: 13 }}>{children}</Text>,
                                  li: ({ children }) => <li style={{ fontSize: 12, lineHeight: 1.7 }}>{children}</li>,
                                }}>{m.content}</ReactMarkdown>
                              ) : (
                                <Text type="secondary"><LoadingOutlined /> 大师讨论中...</Text>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Input */}
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 16px', display: 'flex', gap: 8 }}>
                  <TextArea value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                    placeholder="描述你的 HR 困惑……" autoSize={{ minRows: 1, maxRows: 3 }}
                    disabled={streaming} style={{ borderRadius: 12, fontSize: 13 }} />
                  <Button type="primary" icon={<SendOutlined />} onClick={handleChatSend}
                    loading={streaming} disabled={!chatInput.trim() || streaming}
                    style={{ borderRadius: 12, background: '#fa8c16', borderColor: '#fa8c16', minWidth: 36, height: 36 }} />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* 右栏：最近动态 */}
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '18px 22px' }}>
            <Title level={5} style={{ margin: '0 0 14px', fontWeight: 600 }}>最近动态</Title>
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : recentActivity.length > 0 ? (
              <List dataSource={recentActivity} split={false}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0', cursor: item.link ? 'pointer' : 'default', borderBottom: '1px solid #f5f3f0' }}
                    onClick={() => item.link && router.push(item.link)}>
                    <List.Item.Meta
                      avatar={<Tag style={{ borderRadius: 10, padding: '0 8px', fontSize: 12 }}>{typeLabel[item.type] || item.type}</Tag>}
                      title={<Text style={{ fontSize: 14 }}>{item.title || '(无标题)'}</Text>}
                      description={<Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}{item.subtitle && item.date ? ' · ' : ''}{item.date ? dayjs(item.date).format('MM-DD HH:mm') : ''}</Text>}
                    />
                  </List.Item>
                )} />
            ) : (
              <Empty description="暂无动态" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
