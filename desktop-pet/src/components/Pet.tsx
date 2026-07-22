/**
 * 桌宠角色 — 芝士像素精灵
 *
 * 精灵图 /cheese-sprite_sm.png（1024×1024，原始 2048 压缩）
 * 每帧 128×128，8列×8行
 */

import React, { useState, useEffect } from 'react';

export type PetState = 'idle' | 'listening' | 'thinking' | 'talking' | 'sleeping' | 'walking' | 'happy' | 'eating' | 'surprised';

interface PetProps {
  state: PetState;
  onClick: () => void;
  notification?: string | null;
  onNotificationDismiss?: () => void;
  spriteUrl?: string;
}

// 精灵图配置（使用压缩后的 1024×1024 图片，每帧 128px）
const F = 128;         // 帧宽高
const COLS = 8;        // 列数（1024/128）
const ROWS = 8;        // 行数
const DISPLAY = 128;   // 显示尺寸（1:1）
const FPS = 8;

// 动画行映射（按素材实际布局调整）
const ROW: Record<string, number> = {
  idle: 0, walking: 1, talking: 2, thinking: 3,
  sleeping: 4, happy: 5, eating: 6, surprised: 7,
  listening: 1,
};

const SPRITE_PATH = '/cheese-sprite_sm.png';

export default function Pet({ state, onClick, notification, onNotificationDismiss, spriteUrl }: PetProps) {
  const [frame, setFrame] = useState(0);
  const src = spriteUrl || SPRITE_PATH;

  // 动画帧循环
  useEffect(() => {
    const fps = state === 'sleeping' ? 2 : state === 'idle' ? 4 : FPS;
    const count = ['sleeping', 'surprised'].includes(state) ? 4 : COLS;
    const timer = setInterval(() => setFrame((f) => (f + 1) % count), 1000 / fps);
    return () => clearInterval(timer);
  }, [state]);

  const row = ROW[state] ?? 0;
  const petCls = `pet-${state}`;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
      {/* 通知气泡 */}
      {notification && (
        <div
          onClick={(e) => { e.stopPropagation(); onNotificationDismiss?.(); }}
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(30,30,30,0.92)', color: '#fff', borderRadius: 14,
            padding: '8px 14px', fontSize: 13, maxWidth: 240, whiteSpace: 'pre-wrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'bubblePop 0.3s ease-out', zIndex: 100, cursor: 'pointer', lineHeight: 1.5,
          }}
        >
          {notification}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(30,30,30,0.92)',
          }} />
        </div>
      )}

      {/* 精灵帧 */}
      <div
        onClick={onClick}
        className={petCls}
        style={{
          width: DISPLAY, height: DISPLAY,
          backgroundImage: `url(${src})`,
          backgroundSize: `${COLS * DISPLAY}px ${ROWS * DISPLAY}px`,
          backgroundPosition: `-${frame * DISPLAY}px -${row * DISPLAY}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
