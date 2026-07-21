'use client';

import React, { useState, useEffect } from 'react';
import { Typography, List, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Text } = Typography;

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
    ]).then(([companies, contacts, insights, applications]) => {
      const comps = Array.isArray(companies) ? companies : [];
      const conts = Array.isArray(contacts) ? contacts : [];
      const insts = Array.isArray(insights) ? insights : [];
      const apps = Array.isArray(applications) ? applications : [];
      setStats({ companies: comps.length, contacts: conts.length, insights: insts.length, applications: apps.length });
      setRecentCompanies(comps.slice(0, 6));
      setRecentContacts(conts.slice(0, 6));
      setLoading(false);
    });
  }, []);

  const metrics = [
    { label: '公司', value: stats.companies, link: '/companies' },
    { label: '人脉', value: stats.contacts, link: '/contacts' },
    { label: '市场洞察', value: stats.insights, link: '/market' },
    { label: '投递记录', value: stats.applications, link: '/job-seeking/applications' },
  ];

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <Text style={{ fontSize: 11, fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workbench</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 500, color: '#1a1a1a', letterSpacing: '-0.02em' }}>HR 工作台</h1>
          <Text style={{ fontSize: 13, color: '#bbb' }}>{dayjs().format('M月D日 dddd')}</Text>
        </div>
      </div>

      {/* 核心指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            onClick={() => router.push(m.link)}
            style={{
              cursor: 'pointer',
              padding: '20px 22px',
              borderRadius: 14,
              background: '#fff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'; }}
          >
            <div style={{ fontSize: 40, fontWeight: 300, color: '#1a1a1a', lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 13, color: '#999' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* 最近公司 + 最近人脉 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 最近公司 */}
        <div style={{
          padding: '22px 26px', borderRadius: 14, background: '#fff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            最近公司
          </div>
          {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : recentCompanies.length > 0 ? (
            recentCompanies.map((c: any) => (
              <div key={c.id} onClick={() => router.push('/companies')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #f5f3f0' }}>
                <Text style={{ fontSize: 13 }}>{c.name}</Text>
                {c.industry && <Text style={{ fontSize: 12, color: '#bbb' }}>{c.industry}</Text>}
              </div>
            ))
          ) : <Text style={{ color: '#ccc', fontSize: 13 }}>暂无公司</Text>}
        </div>

        {/* 最近人脉 */}
        <div style={{
          padding: '22px 26px', borderRadius: 14, background: '#fff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            最近人脉
          </div>
          {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : recentContacts.length > 0 ? (
            recentContacts.map((c: any) => (
              <div key={c.id} onClick={() => router.push('/contacts')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #f5f3f0' }}>
                <div>
                  <Text style={{ fontSize: 13 }}>{c.name}</Text>
                  {c.position && <Text style={{ fontSize: 12, color: '#bbb', marginLeft: 8 }}>{c.position}</Text>}
                </div>
                {c.relationType && <Text style={{ fontSize: 12, color: '#999' }}>{c.relationType}</Text>}
              </div>
            ))
          ) : <Text style={{ color: '#ccc', fontSize: 13 }}>暂无人脉</Text>}
        </div>
      </div>
    </div>
  );
}