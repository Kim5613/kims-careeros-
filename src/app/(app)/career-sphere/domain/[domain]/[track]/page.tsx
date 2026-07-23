'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Result, Button } from 'antd';
import { DOMAIN_REGISTRY } from '@/data/domain-tracks';
import type { SkillCategory, SkillLevel, Skill } from '@/data/domain-tracks';
import { navigateWithTransition } from '@/lib/view-transition';

const { Title, Text, Paragraph } = Typography;

const CATEGORY_META: Record<SkillCategory, { label: string; color: string }> = {
  hard: { label: '硬技能', color: '#8b7cf0' },
  soft: { label: '软技能', color: '#52c41a' },
  domain: { label: '业务领域', color: '#fa8c16' },
  tool: { label: '工具', color: '#13c2c2' },
};

const LEVEL_LABELS: Record<SkillLevel, { label: string; color: string }> = {
  1: { label: '了解', color: '#888' },
  2: { label: '能做', color: '#8b7cf0' },
  3: { label: '精通', color: '#fa8c16' },
  4: { label: '专家', color: '#ff4d4f' },
};

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainSlug = params.domain as string;
  const trackSlug = params.track as string;

  const domain = DOMAIN_REGISTRY[domainSlug];
  const track = domain?.tracks.find((t) => t.id === trackSlug) || null;

  if (!domain || !track) {
    return (
      <div style={{ padding: '80px 32px', background: '#0d0d0d', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
        <Result
          status="info"
          title={<span style={{ color: '#e0dcd5' }}>未找到该岗位</span>}
          subTitle={<span style={{ color: '#888' }}>请检查链接是否正确</span>}
          extra={<Button type="primary" style={{ borderRadius: 20 }} href={`/career-sphere/domain/${domainSlug}`}>返回{domain?.label || '上一级'}</Button>}
        />
      </div>
    );
  }

  const groupedSkills = useMemo(() => {
    const groups: Record<SkillCategory, Skill[]> = { hard: [], soft: [], domain: [], tool: [] };
    track.skills.forEach((s) => groups[s.category].push(s));
    return Object.entries(groups).filter(([_, skills]) => skills.length > 0) as [SkillCategory, Skill[]][];
  }, [track.skills]);

  const avgLevel = track.skills.length > 0
    ? (track.skills.reduce((s, sk) => s + sk.currentLevel, 0) / track.skills.length).toFixed(1)
    : '0';

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span
            onClick={() => navigateWithTransition(() => router.push('/career-sphere'))}
            style={{ color: '#888', fontSize: 14, textDecoration: 'none', letterSpacing: 1, cursor: 'pointer', transition: 'color 0.25s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
          >
            职业宇宙
          </span>
          <Text style={{ color: '#444', fontSize: 14 }}>-</Text>
          <span
            onClick={() => navigateWithTransition(() => router.push(`/career-sphere/domain/${domainSlug}`))}
            style={{ color: '#888', fontSize: 14, textDecoration: 'none', letterSpacing: 1, cursor: 'pointer', transition: 'color 0.25s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ccc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
          >
            {domain.label}
          </span>
          <Text style={{ color: '#444', fontSize: 14 }}>-</Text>
          <Text style={{ color: '#bbb', fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>{track.name}</Text>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, marginBottom: 40 }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <Title level={1} style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#e0dcd5', letterSpacing: -0.5 }}>
                {track.name}
              </Title>
              {track.subtitle && (
                <Text style={{ fontSize: 15, color: '#777' }}>{track.subtitle} · {domain.label}</Text>
              )}
            </div>
            <Paragraph style={{ color: '#888', fontSize: 15, lineHeight: 1.8, marginTop: 12, maxWidth: 600 }}>
              {track.description}
            </Paragraph>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 32, marginBottom: 40, padding: '20px 28px',
          borderRadius: 20, background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: track.color }}>{track.skills.length}</div>
            <Text style={{ fontSize: 12, color: '#666' }}>项能力</Text>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#e0dcd5' }}>{avgLevel}</div>
            <Text style={{ fontSize: 12, color: '#666' }}>均分 / 4</Text>
          </div>
        </div>

        {/* Skills by category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {groupedSkills.map(([cat, skills]) => {
            const catMeta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: catMeta.color, boxShadow: `0 0 8px ${catMeta.color}40` }} />
                  <Text strong style={{ fontSize: 15, color: '#bbb', letterSpacing: 1 }}>{catMeta.label}</Text>
                  <Text style={{ fontSize: 12, color: '#555' }}>{skills.length} 项</Text>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {skills.map((skill) => {
                    const levelMeta = LEVEL_LABELS[skill.currentLevel];
                    return (
                      <div
                        key={skill.id}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = `${catMeta.color}30`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: skill.description ? 6 : 0 }}>
                          <Text strong style={{ fontSize: 14, color: '#c5bfb5' }}>{skill.name}</Text>
                          <span style={{
                            padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                            color: levelMeta.color,
                            background: `${levelMeta.color}15`,
                            border: `1px solid ${levelMeta.color}25`,
                          }}>
                            {levelMeta.label}
                          </span>
                        </div>
                        {skill.description && (
                          <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{skill.description}</Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
