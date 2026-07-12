'use client';

import React, { useState } from 'react';
import { Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { FONT_STYLES, getStoredFontIdx } from '@/lib/font-styles';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fontIdx, setFontIdx] = useState(() => getStoredFontIdx());
  const cycleFont = () => {
    const next = (fontIdx + 1) % FONT_STYLES.length;
    setFontIdx(next);
    localStorage.setItem('careeros-font', String(next));
  };
  const router = useRouter();
  const fontStyle = FONT_STYLES[fontIdx];

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        message.error('密码错误');
      }
    } catch {
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    // 访客模式：直接进入但不登录（后续分享链接用）
    message.info('访客模式开发中，请先登录');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      {/* Logo — 点击出密码框+换字体 */}
      <div
        onClick={() => { setShowPassword(true); cycleFont(); }}
        style={{
          fontSize: 'clamp(36px, 7vw, 64px)',
          fontFamily: fontStyle.family,
          fontWeight: fontStyle.weight,
          fontStyle: fontStyle.style,
          color: fontStyle.color,
          textTransform: fontStyle.transform,
          cursor: 'pointer',
          transition: 'all 0.3s',
          transform: showPassword ? 'scale(0.9)' : 'scale(1)',
          letterSpacing: fontStyle.transform === 'uppercase' ? '0.12em' : '0.04em',
          userSelect: 'none',
        }}
        title={`${fontStyle.name} — 点击登录`}
      >
        Kim&apos;s CareerOS
      </div>

      {/* 访客按钮 — 密码未显示时 */}
      {!showPassword && (
        <button
          onClick={handleGuest}
          style={{
            padding: '10px 40px',
            borderRadius: 24,
            border: '1.5px solid #d9d9d9',
            color: '#666',
            fontSize: 15,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#999';
            e.currentTarget.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d9d9d9';
            e.currentTarget.style.color = '#666';
          }}
        >
          访客浏览
        </button>
      )}

      {/* 密码框 — 点击 Logo 后出现 */}
      {showPassword && (
        <div
          style={{
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <Input.Password
            placeholder="请输入访问密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            disabled={loading}
            autoFocus
            style={{ width: 200, height: 32, fontSize: 14 }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
