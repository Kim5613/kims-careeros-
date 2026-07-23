'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Row, Col } from 'antd';

const { Title, Text } = Typography;

const ITEMS = [
  { key: 'identity', icon: '🪪', title: '身份铭牌', desc: '简历管理 · 个人品牌', route: '/identity' },
  { key: 'battle', icon: '⚔️', title: '实战沙盘', desc: '求职战役 · 内部战役', route: '/battle' },
  { key: 'cognition', icon: '🧪', title: '认知实验室', desc: '输入资料 · 技能学习 · 生活兴趣', route: '/cognition' },
  { key: 'value', icon: '📊', title: '身价账本', desc: '职业履历 · 薪资涨幅 · 身价复盘', route: '/value' },
  { key: 'career-sphere', icon: '🌐', title: '职业宇宙', desc: '3D 能力星图 · 领域探索', route: '/career-sphere' },
];

export default function PersonalExperiencePage() {
  const router = useRouter();
  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>🧭 个人经验</Title>
        <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
          个人职业生涯管理系统 — 从身份定位到能力成长的全链路
        </Text>
      </div>
      <Row gutter={[16, 16]}>
        {ITEMS.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.key}>
            <div
              onClick={() => router.push(item.route)}
              style={{
                cursor: 'pointer', padding: '28px 24px', borderRadius: 14, background: '#fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
                transition: 'box-shadow 0.15s', display: 'flex', alignItems: 'center', gap: 16,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';
              }}
            >
              <span style={{ fontSize: 32 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#999' }}>{item.desc}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
