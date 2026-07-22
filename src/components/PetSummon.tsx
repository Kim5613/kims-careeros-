'use client';

import React, { useState, useCallback } from 'react';

const EMPTY = '/pet/bowl-empty_sm.png';
const HALF = '/pet/bowl-half_sm.png';
const FULL = '/pet/bowl-full_sm.png';

export default function PetSummon() {
  const [phase, setPhase] = useState<'idle' | 'drop' | 'done'>('idle');

  const summon = useCallback(async () => {
    if (phase !== 'idle') return;
    setPhase('drop');
    // 1 秒后变满碗，召唤桌宠
    setTimeout(async () => {
      setPhase('done');
      try { await fetch('/api/pet/summon', { method: 'POST' }); } catch {}
      setTimeout(() => setPhase('idle'), 2000);
    }, 1000);
  }, [phase]);

  const bowl = phase === 'idle' ? EMPTY : phase === 'drop' ? HALF : FULL;

  return (
    <div
      onClick={phase === 'idle' ? summon : undefined}
      title="召唤芝士（桌面桌宠）"
      style={{
        // 左下角，避开右下角的大师智囊团悬浮按钮
        position: 'fixed', bottom: 16, left: 16, zIndex: 100,
        width: 72, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: phase === 'idle' ? 'pointer' : 'default',
        background: 'transparent', border: 'none', outline: 'none',
      }}
    >
      {/* 碗 */}
      <img
        src={bowl}
        alt="召唤芝士"
        style={{
          width: 56, height: 56,
          imageRendering: 'pixelated',
          border: 'none', outline: 'none',
          background: 'transparent',
          transition: 'transform 0.2s ease',
          transform: phase === 'done' ? 'scale(1.1)' : 'scale(1)',
        }}
        draggable={false}
      />
    </div>
  );
}
