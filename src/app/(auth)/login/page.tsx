'use client';

import React, { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { Theme, getStoredTheme, themes } from '@/lib/themes';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const router = useRouter();

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

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
        background: '#fff',
        gap: 24,
      }}
    >
      {/* Logo — 占屏幕 1/3 宽度 */}
      <img
        src={theme.logo}
        alt="Kim's CareerOS"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          width: '33vw',
          maxWidth: 400,
          minWidth: 200,
          objectFit: 'contain',
          cursor: 'pointer',
          transition: 'transform 0.3s',
          transform: showPassword ? 'scale(0.8)' : 'scale(1)',
        }}
        title="点击进入管理后台"
      />

      {/* 访客按钮 — 密码未显示时 */}
      {!showPassword && (
        <button
          onClick={handleGuest}
          style={{
            padding: '10px 40px',
            borderRadius: 24,
            border: '1.5px solid #d9d9d9',
            background: '#fff',
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
            style={{ width: 280 }}
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
