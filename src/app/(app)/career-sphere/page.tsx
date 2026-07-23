'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { ALL_DOMAINS } from '@/data/domain-tracks';
import { navigateWithTransition } from '@/lib/view-transition';

interface DomainNode { id: string; label: string; href?: string; }
interface Vec3 { x: number; y: number; z: number; }

const DOMAINS: DomainNode[] = ALL_DOMAINS.map(function(d) {
  return { id: d.id, label: d.label, href: d.available ? '/career-sphere/domain/' + d.id : undefined };
});
while (DOMAINS.length < 5) {
  DOMAINS.push({ id: 'placeholder-' + DOMAINS.length, label: '' });
}

const R = 250;
const PARTICLES = 380;

function fibSphere(n: number, r: number): Vec3[] {
  const pts: Vec3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push({ x: Math.cos(theta) * rY * r, y: y * r, z: Math.sin(theta) * rY * r });
  }
  return pts;
}

function rot(p: Vec3, rx: number, ry: number): Vec3 {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const y1 = p.y * cx - p.z * sx;
  const z1 = p.y * sx + p.z * cx;
  return { x: p.x * cy + z1 * sy, y: y1, z: -p.x * sy + z1 * cy };
}

export default function CareerSpherePage() {
  const DEFAULT_RX = 0.35;
  const DEFAULT_RY = 0;

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rxRef = useRef(DEFAULT_RX);
  const ryRef = useRef(DEFAULT_RY);
  const autoRef = useRef(true);
  const draggingRef = useRef(false);
  const returningRef = useRef(false);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);

  const particles = useMemo(() => fibSphere(PARTICLES, R), []);
  const nodeBase = useMemo(() => fibSphere(DOMAINS.length, R), []);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (returningRef.current) {
        const speed = 3.0;
        rxRef.current += (DEFAULT_RX - rxRef.current) * Math.min(speed * dt, 1);
        const ryTarget = DEFAULT_RY + Math.round(ryRef.current / (Math.PI * 2)) * Math.PI * 2;
        const ryClosest = Math.abs(ryRef.current - ryTarget) < Math.abs(ryRef.current - (ryTarget + Math.PI * 2)) ? ryTarget : ryTarget + Math.PI * 2;
        ryRef.current += (ryClosest - ryRef.current) * Math.min(speed * dt, 1);
        if (Math.abs(rxRef.current - DEFAULT_RX) < 0.002 && Math.abs((ryRef.current % (Math.PI * 2)) - DEFAULT_RY) < 0.01) {
          rxRef.current = DEFAULT_RX;
          ryRef.current = Math.round(ryRef.current / (Math.PI * 2)) * Math.PI * 2;
          returningRef.current = false;
          autoRef.current = true;
        }
      } else if (autoRef.current && !draggingRef.current) {
        ryRef.current += 0.12 * dt;
      }
      const rx = rxRef.current, ry = ryRef.current;

      if (sphereRef.current) sphereRef.current.style.transform = `rotateX(${rx}rad) rotateY(${ry}rad)`;

      const c = containerRef.current;
      if (c) {
        const rect = c.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const h = hoveredRef.current;

        nodeBase.forEach((bp, i) => {
          const el = labelRefs.current[i];
          if (!el) return;
          const wp = rot(bp, rx, ry);
          const sx = cx + wp.x, sy = cy + wp.y;
          const depth = (wp.z + R) / (2 * R);
          const op = 0.05 + depth * 0.95;
          const avail = !!DOMAINS[i].href;
          const scale = 0.4 + depth * 0.75;
          const fs = 10 + depth * 16;

          el.style.left = `${sx}px`;
          el.style.top = `${sy}px`;
          el.style.fontSize = `${fs}px`;
          el.style.transform = `translate(-50%, -50%) scale(${scale})`;
          el.style.pointerEvents = depth > 0.5 ? 'auto' : 'none';
          el.style.fontWeight = '400';
          el.style.border = 'none';
          el.style.background = 'none';

          if (h && DOMAINS[i].id === h) {
            el.style.opacity = '1';
            el.style.transform = `translate(-50%, -50%) scale(${scale * 1.3})`;
            el.style.color = '#ddd';
            el.style.filter = 'drop-shadow(0 0 16px rgba(255,255,255,0.35))';
          } else if (h && DOMAINS[i].id !== h) {
            el.style.opacity = String(op * 0.25);
            el.style.color = `rgba(140,140,150,${op * 0.25})`;
            el.style.filter = 'none';
          } else {
            el.style.opacity = String(op);
            el.style.color = `rgba(180,180,190,${op})`;
            el.style.filter = avail && depth > 0.55 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.12))' : 'none';
          }
        });
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [nodeBase]);

  const handleDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    autoRef.current = false;
    returningRef.current = false;
    if (returnTimerRef.current) { clearTimeout(returnTimerRef.current); returnTimerRef.current = null; }
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  }, []);

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x, dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    ryRef.current += dx * 0.004;
    rxRef.current = Math.max(-1.3, Math.min(1.3, rxRef.current + dy * 0.004));
  }, []);

  const handleUp = useCallback(() => {
    draggingRef.current = false;
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    returnTimerRef.current = setTimeout(() => {
      returningRef.current = true;
      returnTimerRef.current = null;
    }, 3000);
  }, []);

  const handleClick = useCallback((d: DomainNode) => {
    if (d.href) navigateWithTransition(() => router.push('/career-sphere/domain/' + d.id));
    else message.info(d.label + ' 板块即将开放');
  }, [router]);

  labelRefs.current = Array.from({ length: DOMAINS.length }, (_, i) => labelRefs.current[i] || null);

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '24px 0 24px 32px' }}>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 4, letterSpacing: 2 }}>职业宇宙</div>

        <div ref={containerRef} style={{ position: 'relative', flex: 1, cursor: 'grab', touchAction: 'none', userSelect: 'none', overflow: 'hidden' }}
          onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: R * 2.8, height: R * 2.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: R * 2.2, height: R * 2.2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 50%, transparent 75%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: R * 1.4, height: R * 1.4, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 50%)', pointerEvents: 'none' }} />

          <div ref={sphereRef} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, transformStyle: 'preserve-3d', perspective: 1500 }}>
            {particles.map((p, i) => {
              const depth = (p.z + R) / (2 * R);
              const edge = 1 - Math.abs(p.z) / R;
              const op = 0.04 + depth * 0.45 + edge * 0.08;
              const sz = 0.7 + depth * 1.4;
              return <div key={`p-${i}`} style={{ position: 'absolute', transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`, width: sz, height: sz, borderRadius: '50%', background: `rgba(255,255,255,${op})`, pointerEvents: 'none' }} />;
            })}
            {[0, 1.5708, -1.5708].map((a, idx) => (
              <div key={`r-${idx}`} style={{ position: 'absolute', transform: `rotateX(${a}rad)`, width: R * 2, height: R * 2, marginLeft: -R, marginTop: -R, borderRadius: '50%', border: `1px solid rgba(255,255,255,${idx === 0 ? 0.1 : 0.06})`, pointerEvents: 'none' }} />
            ))}
          </div>

          {DOMAINS.map((d, i) => (
            <button key={d.id} ref={(el) => { labelRefs.current[i] = el; }}
              onClick={(e) => { e.stopPropagation(); handleClick(d); }}
              style={{ position: 'absolute', cursor: d.href ? 'pointer' : 'default', padding: '5px 12px', outline: 'none', fontSize: 15, letterSpacing: d.href ? 1 : 0.5, whiteSpace: 'nowrap', transition: 'none', fontWeight: 400, color: '#888', background: 'none', border: 'none' }}
            >{d.label}</button>
          ))}
        </div>
      </div>

      <div style={{ width: 120, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, padding: '0 40px 0 0' }}>
        {DOMAINS.map((d) => (
          <button key={d.id} onClick={() => handleClick(d)}
            style={{ display: 'block', padding: '7px 0', border: 'none', background: 'none', cursor: d.href ? 'pointer' : 'default', color: '#666', fontSize: 15, fontWeight: 400, letterSpacing: 2, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease, letter-spacing 0.3s ease', textAlign: 'left' as const, outline: 'none', transform: 'translateX(0)' }}
            onMouseEnter={(e) => {
              hoveredRef.current = d.id;
              e.currentTarget.style.color = '#aaa';
              e.currentTarget.style.transform = 'translateX(12px)';
              e.currentTarget.style.letterSpacing = '4px';
            }}
            onMouseLeave={(e) => {
              hoveredRef.current = null;
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.letterSpacing = '2px';
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
