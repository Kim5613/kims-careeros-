'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Typography, Popover, Select, Input, Button, message } from 'antd';
import {
  ThunderboltOutlined, TeamOutlined, AimOutlined, ToolOutlined,
  PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined,
  WarningFilled, RiseOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Track, Skill, SkillCategory, SkillLevel } from '@/data/domain-tracks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Constants ──

const CATEGORY_META: Record<SkillCategory, { label: string; color: string; icon: React.ReactNode }> = {
  hard: { label: '硬技能', color: '#8b7cf0', icon: <ThunderboltOutlined /> },
  soft: { label: '软技能', color: '#52c41a', icon: <TeamOutlined /> },
  domain: { label: '业务领域', color: '#fa8c16', icon: <AimOutlined /> },
  tool: { label: '工具', color: '#13c2c2', icon: <ToolOutlined /> },
};

const LEVEL_OPTIONS = [
  { label: '⭐ 了解', value: 1 },
  { label: '⭐⭐ 能做', value: 2 },
  { label: '⭐⭐⭐ 精通', value: 3 },
  { label: '⭐⭐⭐⭐ 专家', value: 4 },
];

const CATEGORY_OPTIONS = [
  { label: '硬技能', value: 'hard' },
  { label: '软技能', value: 'soft' },
  { label: '业务领域', value: 'domain' },
  { label: '工具', value: 'tool' },
];

const CAREER_LEVELS = [
  { level: 1, title: '助理', color: '#bbb', bg: '#f5f5f5' },
  { level: 2, title: '专员', color: '#8b7cf0', bg: '#f3f0ff' },
  { level: 3, title: '经理', color: '#fa8c16', bg: '#fff7e6' },
  { level: 4, title: '总监', color: '#ff4d4f', bg: '#fff1f0' },
];

function getCareerLevel(avg: number) {
  const lvl = Math.round(avg);
  return CAREER_LEVELS[Math.min(Math.max(lvl - 1, 0), 3)];
}

// ── MiniRadar ──

function MiniRadar({ skills, size = 130 }: { skills: Skill[]; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 22;
  const catKeys: SkillCategory[] = ['hard', 'soft', 'domain', 'tool'];

  const categoryScores = useMemo(() =>
    catKeys.map((cat) => {
      const cs = skills.filter((s) => s.category === cat);
      if (cs.length === 0) return 0;
      return cs.reduce((sum, s) => sum + s.currentLevel, 0) / cs.length / 4;
    }), [skills]);

  const angles = catKeys.map((_, i) => (Math.PI * 2 * i) / catKeys.length - Math.PI / 2);
  const getPoint = (angle: number, r: number) => ({ x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) });

  const gridPolygons = Array.from({ length: 4 }, (_, lvl) => {
    const r = ((lvl + 1) / 4) * radius;
    return angles.map((a) => getPoint(a, r));
  });

  const dataPoints = angles.map((a, i) => getPoint(a, categoryScores[i] * radius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {gridPolygons.map((pts, lvl) => (
        <polygon key={lvl} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e8e3dd" strokeWidth={1} />
      ))}
      {angles.map((a, i) => {
        const outer = getPoint(a, radius);
        return <line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#e8e3dd" strokeWidth={1} />;
      })}
      <polygon points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')} fill="#8b7cf0" fillOpacity={0.12} stroke="#8b7cf0" strokeWidth={1.5} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#8b7cf0" stroke="#fff" strokeWidth={1} />
      ))}
      {angles.map((a, i) => {
        const lp = getPoint(a, radius + 18);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fill={CATEGORY_META[catKeys[i]].color} fontSize={10} fontWeight={600} fontFamily="system-ui, sans-serif">
            {CATEGORY_META[catKeys[i]].label}
          </text>
        );
      })}
    </svg>
  );
}

// ── SkillChip ──

function SkillChip({ skill, onUpdate, onDelete }: {
  skill: Skill;
  onUpdate: (id: string, field: string, value: any) => void;
  onDelete: (id: string) => void;
}) {
  const catMeta = CATEGORY_META[skill.category];
  const levelMeta = { 1: { color: '#bbb' }, 2: { color: '#8b7cf0' }, 3: { color: '#fa8c16' }, 4: { color: '#ff4d4f' } }[skill.currentLevel];
  const hasGap = skill.targetLevel !== undefined && skill.currentLevel < skill.targetLevel;

  const popoverContent = (
    <div style={{ width: 240 }}>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>掌握程度</Text>
        <Select value={skill.currentLevel} onChange={(v) => onUpdate(skill.id, 'currentLevel', v)} options={LEVEL_OPTIONS} style={{ width: '100%' }} size="small" />
      </div>
      {skill.targetLevel !== undefined && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>目标程度</Text>
          <Select value={skill.targetLevel} onChange={(v) => onUpdate(skill.id, 'targetLevel', v)} options={LEVEL_OPTIONS} style={{ width: '100%' }} size="small" />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>说明</Text>
        <TextArea value={skill.description || ''} onChange={(e) => onUpdate(skill.id, 'description', e.target.value)} rows={2} maxLength={100} size="small" style={{ fontSize: 12 }} />
      </div>
      <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onDelete(skill.id)} style={{ borderRadius: 12 }} block>删除</Button>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click" placement="bottom" title={skill.name}>
      <div
        className="skill-tag"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
          borderRadius: 14, background: '#f8f7f5', border: '1px solid #eeece8',
          fontSize: 12, fontWeight: 500, color: '#666', whiteSpace: 'nowrap',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${catMeta.color}10`;
          e.currentTarget.style.borderColor = `${catMeta.color}40`;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${catMeta.color}12`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f8f7f5';
          e.currentTarget.style.borderColor = '#eeece8';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: catMeta.color, flexShrink: 0 }} />
        {skill.name}
        {hasGap && <WarningFilled style={{ color: '#ff4d4f', fontSize: 10, marginLeft: 2 }} />}
      </div>
    </Popover>
  );
}

// ── DetailPanel ──

function DetailPanel({ track, onUpdateSkill, onDeleteSkill, onBack }: {
  track: Track;
  onUpdateSkill: (id: string, field: string, value: any) => void;
  onDeleteSkill: (id: string) => void;
  onBack: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<SkillCategory>('hard');
  const [newLevel, setNewLevel] = useState<SkillLevel>(2);

  const catAvgs = useMemo(() => {
    const cats: SkillCategory[] = ['hard', 'soft', 'domain', 'tool'];
    return cats.map((cat) => {
      const catSkills = track.skills.filter((s) => s.category === cat);
      if (catSkills.length === 0) return { cat, avg: 0, count: 0 };
      return { cat, avg: Math.round((catSkills.reduce((s, sk) => s + sk.currentLevel, 0) / catSkills.length) * 10) / 10, count: catSkills.length };
    });
  }, [track.skills]);

  const totalAvg = track.skills.length > 0
    ? Math.round((track.skills.reduce((s, sk) => s + sk.currentLevel, 0) / track.skills.length) * 10) / 10 : 0;

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 14, border: '1px solid #f0ece8', background: '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#777', flexShrink: 0, marginTop: 4, transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b7cf0'; e.currentTarget.style.color = '#8b7cf0'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0ece8'; e.currentTarget.style.color = '#777'; }}
        ><LeftOutlined /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 36 }}>{track.emoji}</span>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{track.name}</Title>
              <Text type="secondary" style={{ fontSize: 14 }}>{track.subtitle}</Text>
            </div>
          </div>
          <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 14, maxWidth: 520 }}>{track.description}</Paragraph>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong style={{ fontSize: 15 }}>技能明细 <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>{track.skills.length} 项 · 均分 {totalAvg}/4</Text></Text>
            <Button size="small" icon={<PlusOutlined />} style={{ borderRadius: 14 }} onClick={() => setShowAdd(!showAdd)}>加技能</Button>
          </div>
          {showAdd && (
            <div style={{ padding: '12px 14px', background: '#faf8f6', borderRadius: 16, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Input placeholder="技能名称" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: 130, borderRadius: 12 }} size="small" autoFocus />
              <Select value={newCat} onChange={(v) => setNewCat(v)} options={CATEGORY_OPTIONS} size="small" style={{ width: 90, borderRadius: 12 }} />
              <Select value={newLevel} onChange={(v) => setNewLevel(v)} options={LEVEL_OPTIONS} size="small" style={{ width: 110, borderRadius: 12 }} />
              <Button size="small" type="primary" style={{ borderRadius: 12 }} onClick={() => {
                if (!newName.trim()) return;
                onUpdateSkill(`new-${Date.now()}`, '__create__', { name: newName.trim(), category: newCat, currentLevel: newLevel });
                setShowAdd(false); setNewName('');
              }}>添加</Button>
              <Button size="small" style={{ borderRadius: 12 }} onClick={() => { setShowAdd(false); setNewName(''); }}>取消</Button>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {track.skills.map((s) => (
              <SkillChip key={s.id} skill={s} onUpdate={onUpdateSkill} onDelete={onDeleteSkill} />
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ background: '#faf8f6', borderRadius: 24, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 220 }}>
            <Text type="secondary" style={{ fontSize: 11, marginBottom: 8 }}>能力雷达 · {track.skills.length} 项技能</Text>
            <MiniRadar skills={track.skills} size={140} />
            <div style={{ marginTop: 16, width: '100%' }}>
              {catAvgs.map(({ cat, avg, count }) => {
                if (count === 0) return null;
                const meta = CATEGORY_META[cat];
                return (
                  <div key={cat} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 11, color: meta.color }}>{meta.icon} {meta.label}</Text>
                      <Text strong style={{ fontSize: 11, color: meta.color }}>{avg}/4</Text>
                    </div>
                    <div style={{ height: 4, background: '#e8e3dd', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(avg / 4) * 100}%`, background: meta.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ── CardStack ──

function CardStack({ tracks, activeIndex, setActiveIndex, onCardClick }: {
  tracks: Track[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  onCardClick: (i: number) => void;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [cardHovered, setCardHovered] = useState(false);
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);
  const draggingRef = useRef(false);
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  const goNext = useCallback(() => setActiveIndex((p) => (p + 1) % tracks.length), [tracks.length, setActiveIndex]);
  const goPrev = useCallback(() => setActiveIndex((p) => (p - 1 + tracks.length) % tracks.length), [tracks.length, setActiveIndex]);

  const resetDrag = useCallback(() => { draggingRef.current = false; hasMovedRef.current = false; setDragOffset(0); }, []);

  const handlePDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    draggingRef.current = true; hasMovedRef.current = false;
    startXRef.current = e.clientX; setDragOffset(0);
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  }, []);

  const handlePMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) hasMovedRef.current = true;
    if (hasMovedRef.current) setDragOffset(dx * 0.85);
  }, []);

  const handlePUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    draggingRef.current = false;
    const dx = e.clientX - startXRef.current;
    if (hasMovedRef.current && Math.abs(dx) > 80) { dx > 0 ? goPrev() : goNext(); }
    else if (!hasMovedRef.current) onCardClick(activeRef.current);
    setDragOffset(0); hasMovedRef.current = false;
  }, [goNext, goPrev, onCardClick]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') goPrev(); if (e.key === 'ArrowRight') goNext(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  const getStyle = (i: number): React.CSSProperties => {
    const pos = (i - activeIndex + tracks.length) % tracks.length;
    const t = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease';
    if (pos === 0) {
      const hs = cardHovered && dragOffset === 0 ? 1.008 : 1;
      return { transform: `translateX(${dragOffset}px) scale(${hs})`, opacity: 1, zIndex: 3, pointerEvents: 'auto' as const, transition: dragOffset !== 0 ? 'none' : t };
    }
    if (pos === 1) return { transform: 'translateY(16px) scale(0.97)', opacity: 0.5, zIndex: 2, pointerEvents: 'none' as const, transition: t };
    if (pos === 2) return { transform: 'translateY(32px) scale(0.94)', opacity: 0.2, zIndex: 1, pointerEvents: 'none' as const, transition: t };
    return { transform: 'translateY(40px) scale(0.91)', opacity: 0, zIndex: 0, pointerEvents: 'none' as const, transition: t };
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 170px)', minHeight: 500, perspective: 1200, touchAction: 'none', userSelect: 'none', cursor: dragOffset !== 0 ? 'grabbing' : 'grab' }}
        onMouseEnter={() => setCardHovered(true)} onMouseLeave={() => setCardHovered(false)}
        onPointerDown={handlePDown} onPointerMove={handlePMove} onPointerUp={handlePUp} onPointerCancel={resetDrag}
      >
        {tracks.map((t, i) => {
          const style = getStyle(i);
          const isActive = (i - activeIndex + tracks.length) % tracks.length === 0;
          const levelCounts = CAREER_LEVELS.map((cl) => ({ ...cl, count: t.skills.filter((s) => s.currentLevel === cl.level).length }));
          const avgSkill = t.skills.length > 0 ? t.skills.reduce((s, sk) => s + sk.currentLevel, 0) / t.skills.length : 0;
          const careerLevel = getCareerLevel(avgSkill);
          const maxCount = Math.max(...levelCounts.map((l) => l.count), 1);

          return (
            <div key={t.id} style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'linear-gradient(160deg, #fffdfb 0%, #faf8f6 100%)', border: isActive ? '1.5px solid #e8e3dd' : '1.5px solid #f0ece8', boxShadow: isActive ? '0 12px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', overflow: 'hidden', willChange: 'transform, opacity', ...style }}
              onClick={() => { if (!hasMovedRef.current) onCardClick(i); }}
            >
              <div style={{ position: 'absolute', left: 0, top: 24, bottom: 24, width: 4, borderRadius: '0 3px 3px 0', background: t.color, opacity: isActive ? 1 : 0.4, transition: 'opacity 0.4s ease' }} />
              <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', padding: '32px 0 28px 40px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <Text strong style={{ fontSize: 20, letterSpacing: -0.3, color: '#333' }}>{t.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{t.subtitle}</Text>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <Text style={{ fontSize: 28, fontWeight: 700, color: t.color, lineHeight: 1 }}>{t.skills.length}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>项技能</Text>
                  </div>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 14 }} ellipsis={{ rows: 1 }}>{t.description}</Paragraph>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start', overflow: 'hidden' }}>
                  {t.skills.map((s) => {
                    const catColor = CATEGORY_META[s.category].color;
                    return (
                      <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 14, background: '#f8f7f5', border: '1px solid #eeece8', fontSize: 12, fontWeight: 500, color: '#666', whiteSpace: 'nowrap', cursor: 'default', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${catColor}10`; (e.currentTarget as HTMLElement).style.borderColor = `${catColor}40`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px ${catColor}12`; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8f7f5'; (e.currentTarget as HTMLElement).style.borderColor = '#eeece8'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor, flexShrink: 0 }} />{s.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* 职级对标 */}
              <div style={{ flex: '0 0 260px', background: '#faf8f6', borderLeft: '1px solid #f0ece8', padding: '32px 28px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text strong style={{ fontSize: 13, marginBottom: 18, display: 'block', color: '#555' }}>职级对标</Text>
                {levelCounts.map((cl) => (
                  <div key={cl.level} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ fontSize: 12, color: cl.count > 0 ? '#555' : '#ccc' }}>{cl.title}</Text>
                      <Text style={{ fontSize: 12, color: cl.count > 0 ? cl.color : '#ddd', fontWeight: 600 }}>{cl.count}</Text>
                    </div>
                    <div style={{ height: 4, background: '#ede9e4', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${maxCount > 0 ? (cl.count / maxCount) * 100 : 0}%`, background: cl.count > 0 ? `linear-gradient(90deg, ${cl.color}dd, ${cl.color})` : 'transparent', borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${careerLevel.color}20`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: careerLevel.color, boxShadow: `0 0 0 3px ${careerLevel.color}18` }} />
                  <div><Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: 1.3 }}>综合对标</Text><Text strong style={{ fontSize: 15, color: careerLevel.color }}>{careerLevel.title}级</Text></div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}><Text type="secondary" style={{ fontSize: 10, display: 'block', lineHeight: 1.3 }}>均分</Text><Text strong style={{ fontSize: 15, color: '#333' }}>{avgSkill.toFixed(1)}</Text></div>
                </div>
              </div>
              {/* Footer dots */}
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Text type="secondary" style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{activeIndex + 1}/{tracks.length}</Text>
                <div style={{ display: 'flex', gap: 5 }}>
                  {tracks.map((_, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                      style={{ width: idx === activeIndex ? 18 : 6, height: 6, borderRadius: 3, border: 'none', background: idx === activeIndex ? '#8b7cf0' : '#d9d4cc', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', padding: 0 }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {/* Arrows */}
        {[{ dir: -1, icon: <LeftOutlined />, style: { left: -26 } }, { dir: 1, icon: <RightOutlined />, style: { right: -26 } }].map((btn, bi) => (
          <button key={bi} onClick={(e) => { e.stopPropagation(); btn.dir < 0 ? goPrev() : goNext(); }}
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', border: '1px solid #e8e3dd', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: 18, color: '#999', padding: 0, ...btn.style }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b7cf0'; e.currentTarget.style.color = '#8b7cf0'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,124,240,0.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e8e3dd'; e.currentTarget.style.color = '#999'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
          >{btn.icon}</button>
        ))}
      </div>
    </div>
  );
}

// ── Export ──

export default function DomainSkillMap({ domainLabel, tracks, backHref }: {
  domainLabel: string;
  tracks: Track[];
  backHref: string;
}) {
  const [tracksData, setTracksData] = useState<Track[]>(tracks);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailTrack = detailId ? tracksData.find((t) => t.id === detailId) || null : null;

  const handleUpdateSkill = (skillId: string, field: string, value: any) => {
    if (field === '__create__') {
      const s = value as Skill;
      setTracksData((prev) => prev.map((t) => t.id === detailId ? { ...t, skills: [...t.skills, { ...s, id: skillId }] } : t));
      message.success('技能已添加');
      return;
    }
    setTracksData((prev) => prev.map((t) => t.id === detailId ? { ...t, skills: t.skills.map((s) => s.id === skillId ? { ...s, [field]: value } : s) } : t));
    message.success('已更新');
  };

  const handleDeleteSkill = (skillId: string) => {
    setTracksData((prev) => prev.map((t) => t.id === detailId ? { ...t, skills: t.skills.filter((s) => s.id !== skillId) } : t));
    message.success('已删除');
  };

  return (
    <div style={{ padding: '20px 32px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>🗺️ {domainLabel} 能力地图</Title>
        <Paragraph type="secondary" style={{ marginTop: 2, marginBottom: 0, fontSize: 13 }}>
          <a href={backHref} style={{ color: '#8b7cf0', marginRight: 6, textDecoration: 'none' }}>← 职业宇宙</a>
          {domainLabel} 赛道 · 左右切换 · 点击卡片看详情
        </Paragraph>
      </div>
      {detailTrack ? (
        <DetailPanel track={detailTrack} onUpdateSkill={handleUpdateSkill} onDeleteSkill={handleDeleteSkill} onBack={() => setDetailId(null)} />
      ) : (
        <CardStack tracks={tracksData} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onCardClick={(i) => setDetailId(tracksData[i].id)} />
      )}
    </div>
  );
}
