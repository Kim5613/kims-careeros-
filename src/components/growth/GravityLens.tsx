'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from 'antd';
import type { Track } from '@/data/domain-tracks';
import { navigateWithTransition } from '@/lib/view-transition';

const { Title, Text, Paragraph } = Typography;

function sr(seed: number): number { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

interface Cluster { id: string; name: string; color: string; description: string; trackIds: string[]; }
function buildClusters(tracks: Track[]): Cluster[] {
  return [
    { id: 'coe', name: 'COE', color: '#8b7cf0', description: '专家中心 — 制定战略框架、政策体系和专业标准。', trackIds: ['ta', 'cnb', 'lnd', 'od', 'eb'] },
    { id: 'hrbp', name: 'HRBP', color: '#ff6b6b', description: '业务伙伴 — 深入业务一线，将HR策略转化为业务解决方案。', trackIds: ['hrbp', 'er', 'tm'] },
    { id: 'ssc', name: 'SSC', color: '#4ecdc4', description: '共享服务中心 — 标准化、自动化的HR服务平台。', trackIds: ['ssc', 'hris', 'dei'] },
  ].filter(c => c.trackIds.some(tid => tracks.some(t => t.id === tid)));
}

export default function GravityLens({ domainId, domainLabel, tracks, backHref }: { domainId: string; domainLabel: string; tracks: Track[]; backHref: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(tracks[0]?.id || '');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelAnim, setPanelAnim] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  const clusters = useMemo(() => buildClusters(tracks), [tracks]);
  const showChildren = activeCluster !== null;
  const currentCluster = clusters.find(c => c.id === activeCluster);
  const childTracks = currentCluster ? tracks.filter(t => currentCluster.trackIds.includes(t.id)) : [];
  const selectedTrack = tracks.find(t => t.id === selectedId) || tracks[0] || null;
  const hoveredCluster = !showChildren ? clusters.find(c => c.id === hoveredId) : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const coreRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // Refs for rAF
  const selectedIdRef = useRef(selectedId); selectedIdRef.current = selectedId;
  const hoveredIdRef = useRef(hoveredId); hoveredIdRef.current = hoveredId;
  const showChildrenRef = useRef(showChildren); showChildrenRef.current = showChildren;
  const mouseRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const MAX_R = 380;

  // Position stores
  const clusterPos = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());
  const childPos = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());
  const posInited = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Init positions
  useEffect(() => {
    // Clusters
    const cm = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    clusters.forEach((c, i) => {
      const a = (i / clusters.length) * Math.PI * 2 - Math.PI / 2;
      const r = 80 + sr(i * 37) * 60;
      cm.set(c.id, { x: Math.cos(a) * r, y: Math.sin(a) * r, vx: (sr(i * 53) - 0.5) * 0.08, vy: (sr(i * 67) - 0.5) * 0.08 });
    });
    clusterPos.current = cm;

    // Children
    if (currentCluster) {
      const pm = new Map<string, { x: number; y: number; vx: number; vy: number }>();
      const ids = currentCluster.trackIds.filter(tid => tracks.some(t => t.id === tid));
      ids.forEach((tid, i) => {
        const a = (i / ids.length) * Math.PI * 2;
        const r = 80 + sr(i * 53) * 150;
        pm.set(tid, { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7, vx: (sr(i * 37) - 0.5) * 0.12, vy: (sr(i * 43) - 0.5) * 0.12 });
      });
      childPos.current = pm;
    }
    posInited.current = true;
  }, [clusters, currentCluster, tracks]);

  // Single rAF loop
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = now * 0.001;
      if (!posInited.current) { raf = requestAnimationFrame(tick); return; }

      const isChild = showChildrenRef.current;
      const positions = isChild ? childPos.current : clusterPos.current;
      const curSel = selectedIdRef.current;
      const curHov = hoveredIdRef.current;

      if (coreRef.current) coreRef.current.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(t * 0.6) * 0.04})`;

      let idx = 0;
      for (const [id, pos] of positions) {
        if (draggingRef.current !== id) {
          pos.vx += (sr(idx * 37 + Math.floor(t * 0.6)) - 0.5) * 0.006;
          pos.vy += (sr(idx * 43 + Math.floor(t * 0.6)) - 0.5) * 0.006;
          pos.vx *= 0.997; pos.vy *= 0.997;
          pos.x += pos.vx; pos.y += pos.vy;
          const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2);
          const limit = isChild ? MAX_R : 320;
          if (dist > limit) { const nx = pos.x / dist, ny = pos.y / dist; pos.vx -= nx * 0.015; pos.vy -= ny * 0.015; }
          if (dist < (isChild ? 50 : 40)) { const nx = pos.x / dist, ny = pos.y / dist; pos.vx += nx * 0.015; pos.vy += ny * 0.015; }
        }
        const el = nodeRefs.current.get(id);
        if (!el) continue;
        const isSel = id === curSel;
        const isHov = id === curHov;
        const isDim = curSel && id !== curSel;
        const isCluster = clusters.some(c => c.id === id);
        const mx = mouseRef.current.x, my = mouseRef.current.y;
        const md = Math.sqrt((pos.x - mx) ** 2 + (pos.y - my) ** 2);
        const near = md < 100;
        const scale = isSel ? 1.4 : isHov ? 1.2 : near ? 1.08 : isDim ? 0.55 : isCluster ? 1.0 : 0.95;
        const opacity = isSel ? 1 : isHov ? 0.95 : near ? 0.85 : isDim ? 0.25 : 0.7;
        el.style.left = `${pos.x}px`; el.style.top = `${pos.y}px`;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = String(opacity);
        idx++;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clusters]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const w = (e: WheelEvent) => { if ((e.target as HTMLElement).closest('[data-nebula]')) { e.preventDefault(); setZoom(z => Math.min(2.5, Math.max(0.4, z - e.deltaY * 0.001))); } };
    el.addEventListener('wheel', w, { passive: false }); return () => el.removeEventListener('wheel', w);
  }, []);

  const onNebulaMove = useCallback((e: React.PointerEvent) => {
    const c = containerRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    mouseRef.current = { x: (e.clientX - r.left - r.width / 2) / zoom, y: (e.clientY - r.top - r.height / 2) / zoom };
  }, [zoom]);

  const onNodeDown = useCallback((e: React.PointerEvent, id: string) => {
    e.stopPropagation(); if (!showChildrenRef.current) return;
    draggingRef.current = id; dragStartRef.current = { x: e.clientX, y: e.clientY };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* */ }
  }, []);

  const onNodeMove = useCallback((e: React.PointerEvent, id: string) => {
    if (draggingRef.current !== id) return;
    const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    const pos = childPos.current.get(id);
    if (pos) { const nx = pos.x + dx / zoom, ny = pos.y + dy / zoom; if (Math.sqrt(nx ** 2 + ny ** 2) <= MAX_R) { pos.x = nx; pos.y = ny; } pos.vx = 0; pos.vy = 0; }
  }, [zoom]);

  const onNodeUp = useCallback((_e: React.PointerEvent, id: string) => { if (draggingRef.current === id) draggingRef.current = null; }, []);

  const selectNode = useCallback((id: string) => {
    if (draggingRef.current) return;
    if (clusters.some(c => c.id === id)) { setActiveCluster(id); return; }
    setPanelAnim(false); requestAnimationFrame(() => { setSelectedId(id); setPanelAnim(true); });
  }, [clusters]);

  const visibleNodes = useMemo(() => {
    if (!showChildren) return clusters.map(c => ({ id: c.id, name: c.name, color: c.color, isCluster: true }));
    return childTracks.map(t => ({ id: t.id, name: t.name, color: t.color, isCluster: false }));
  }, [showChildren, clusters, childTracks]);

  const previewSkills = useMemo(() => {
    if (!selectedTrack) return [];
    const w = selectedTrack.skills.filter(s => s.description);
    return [...w, ...selectedTrack.skills.filter(s => !s.description)].slice(0, 8);
  }, [selectedTrack]);

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', padding: '32px 0 32px 48px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <span onClick={() => navigateWithTransition(() => router.push(backHref))} style={{ color: '#888', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ccc')} onMouseLeave={e => (e.currentTarget.style.color = '#888')}>职业宇宙</span>
          <Text style={{ color: '#444', fontSize: 13 }}>/</Text>
          <span onClick={() => setActiveCluster(null)} style={{ color: !showChildren ? '#bbb' : '#888', fontSize: 13, fontWeight: !showChildren ? 600 : 400, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ccc')} onMouseLeave={e => (e.currentTarget.style.color = !showChildren ? '#bbb' : '#888')}>{domainLabel}</span>
          {currentCluster && <><Text style={{ color: '#444', fontSize: 13 }}>/</Text><span style={{ color: currentCluster.color, fontSize: 13, fontWeight: 600 }}>{currentCluster.name}</span></>}
        </div>

        {!showChildren ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 380 }}>
            <Title level={2} style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#e0dcd5' }}>HR 三大支柱</Title>
            <Paragraph style={{ color: '#888', fontSize: 14, lineHeight: 1.8, marginTop: 12, marginBottom: 32 }}>现代人力资源管理以三支柱模型为核心：专家中心制定战略、业务伙伴深入前线、共享服务高效交付。</Paragraph>
            {hoveredCluster ? (
              <div style={{ animation: 'pf 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: hoveredCluster.color, boxShadow: `0 0 12px ${hoveredCluster.color}60` }} />
                  <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600, color: hoveredCluster.color }}>{hoveredCluster.name}</Title>
                </div>
                <Paragraph style={{ color: '#999', fontSize: 14, lineHeight: 1.9 }}>{hoveredCluster.description}</Paragraph>
                <Text style={{ fontSize: 12, color: '#555' }}>含 {hoveredCluster.trackIds.filter(id => tracks.some(t => t.id === id)).length} 个子岗位 · 点击星团进入</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {clusters.map(c => (
                  <div key={c.id} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={e => { setHoveredId(c.id); e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${c.color}40`; }}
                    onMouseLeave={e => { setHoveredId(null); e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                    onClick={() => setActiveCluster(c.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, boxShadow: `0 0 8px ${c.color}40` }} />
                      <Text strong style={{ fontSize: 15, color: '#ccc' }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>{c.trackIds.filter(id => tracks.some(t => t.id === id)).length} 岗位</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : selectedTrack ? (
          <div key={selectedTrack.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 380, animation: panelAnim ? 'pf 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}>
            <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#e0dcd5' }}>{selectedTrack.name}</Title>
            {selectedTrack.subtitle && <Text style={{ fontSize: 14, color: '#777' }}>{selectedTrack.subtitle}</Text>}
            <Paragraph style={{ color: '#888', fontSize: 14, lineHeight: 1.8, marginBottom: 28, marginTop: 8 }}>{selectedTrack.description}</Paragraph>
            <Text style={{ fontSize: 11, color: '#555', letterSpacing: 2, marginBottom: 12, display: 'block', textTransform: 'uppercase' }}>关键能力</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {previewSkills.map(s => (
                <div key={s.id} style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <Text strong style={{ fontSize: 13, color: '#c5bfb5' }}>{s.name}</Text>
                  {s.description && <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{s.description}</Text>}
                </div>
              ))}
            </div>
            <Text style={{ fontSize: 12, color: '#555', marginBottom: 20 }}>{selectedTrack.skills.length} 项能力</Text>
            <button onClick={() => navigateWithTransition(() => router.push(`/growth/domain/${domainId}/${selectedTrack.id}`))} style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 24, border: `1px solid ${selectedTrack.color}40`, background: `${selectedTrack.color}10`, color: selectedTrack.color, fontSize: 14, fontWeight: 500, cursor: 'pointer', letterSpacing: 1, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${selectedTrack.color}25`; e.currentTarget.style.borderColor = selectedTrack.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${selectedTrack.color}10`; e.currentTarget.style.borderColor = `${selectedTrack.color}40`; e.currentTarget.style.transform = 'translateX(0)'; }}>查看完整能力 →</button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#555' }}>点击节点选择岗位</Text></div>
        )}

        {showChildren && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 24, maxWidth: 380 }}>
            {childTracks.map(t => (
              <button key={t.id} onClick={() => selectNode(t.id)} onMouseEnter={() => setHoveredId(t.id)} onMouseLeave={() => setHoveredId(null)}
                style={{ padding: '6px 14px', borderRadius: 16, border: selectedId === t.id ? `1px solid ${t.color}60` : '1px solid rgba(255,255,255,0.06)', background: selectedId === t.id ? `${t.color}15` : 'transparent', color: selectedId === t.id ? t.color : '#888', fontSize: 12, fontWeight: selectedId === t.id ? 600 : 400, cursor: 'pointer', letterSpacing: 0.5, whiteSpace: 'nowrap', transition: 'all 0.3s' }}>{t.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Nebula */}
      <div ref={containerRef} data-nebula onPointerMove={onNebulaMove}
        style={{ flex: 1, position: 'relative', cursor: 'grab', overflow: 'hidden' }}
        onClick={() => { if (showChildren && !draggingRef.current) setActiveCluster(null); }}>
        <div ref={nebulaRef} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${zoom})`, width: 1, height: 1 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(160,140,255,0.08) 0%, rgba(120,160,255,0.04) 30%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 45%)' }} />
            <div ref={coreRef} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(220,200,255,0.5) 35%, transparent 70%)', boxShadow: '0 0 50px rgba(200,180,255,0.25), 0 0 100px rgba(200,180,255,0.08)', transition: 'transform 0.2s ease-out' }} />
          </div>
          {mounted && [...Array(80)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: (sr(i * 13) - 0.5) * 600, top: (sr(i * 21) - 0.5) * 600, width: sr(i * 31) * 2.5 + 0.5, height: sr(i * 31) * 2.5 + 0.5, borderRadius: '50%', background: `hsl(${sr(i * 41) * 60 + 240}, 60%, ${70 + sr(i * 51) * 30}%)`, opacity: sr(i * 61) * 0.35 + 0.06, pointerEvents: 'none' }} />
          ))}
          {visibleNodes.map(node => {
            const isCluster = node.isCluster;
            const isHov = node.id === hoveredId;
            return (
              <div key={node.id} data-node ref={el => { if (el) nodeRefs.current.set(node.id, el); }}
                onClick={e => { e.stopPropagation(); selectNode(node.id); }}
                onPointerDown={e => onNodeDown(e, node.id)}
                onPointerMove={e => onNodeMove(e, node.id)}
                onPointerUp={e => onNodeUp(e, node.id)}
                onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)}
                style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: isCluster ? 'pointer' : 'grab', touchAction: 'none' }}>
                <div style={{
                  width: isCluster ? (isHov ? 52 : 44) : 10, height: isCluster ? (isHov ? 52 : 44) : 10, borderRadius: '50%',
                  background: isCluster ? `radial-gradient(circle, ${node.color}cc 0%, ${node.color}60 40%, transparent 80%)` : `radial-gradient(circle, ${node.color} 0%, ${node.color}88 35%, transparent 80%)`,
                  boxShadow: isCluster ? `0 0 50px ${node.color}50, 0 0 100px ${node.color}25` : `0 0 10px ${node.color}15`,
                  transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
                }} />
                <span style={{ fontSize: isCluster ? (isHov ? 18 : 16) : 12, fontWeight: isCluster ? 700 : 400, color: isCluster ? '#fff' : '#bbb', whiteSpace: 'nowrap' }}>{node.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: '#666', fontSize: 12, pointerEvents: 'none' }}>
          {showChildren ? '拖拽节点 · 滚轮缩放 · 点击空白返回' : '悬停星团看详情 · 点击深入子星系'}
        </div>
      </div>
      <style>{`@keyframes pf { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
