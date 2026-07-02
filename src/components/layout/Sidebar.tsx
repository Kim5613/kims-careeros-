'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  RiseOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
  IdcardOutlined,
  FundOutlined,
  GlobalOutlined,
  SettingOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Theme, getStoredTheme, getRandomTheme, themes } from '@/lib/themes';

// 路由路径集合（用于判断点击时是否需要导航）
const ROUTE_KEYS = new Set(['/', '/job-seeking', '/salary-growth', '/resumes', '/growth', '/companies', '/contacts', '/market', '/knowledge', '/settings']);

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '首页' },
  {
    key: 'personal', icon: <UserOutlined />, label: '个人',
    children: [
      { key: '/job-seeking', icon: <SearchOutlined />, label: '求职' },
      { key: '/salary-growth', icon: <RiseOutlined />, label: '薪酬' },
      { key: '/resumes', icon: <IdcardOutlined />, label: '简历' },
      { key: '/growth', icon: <TrophyOutlined />, label: '档案' },
    ],
  },
  {
    key: 'workbench', icon: <TeamOutlined />, label: 'HR工作台',
    children: [
      { key: '/companies', icon: <FundOutlined />, label: '公司库' },
      { key: '/contacts', icon: <TeamOutlined />, label: '人脉库' },
      { key: '/market', icon: <GlobalOutlined />, label: '市场洞察' },
    ],
  },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const handleRandomTheme = () => {
    const newTheme = getRandomTheme();
    localStorage.setItem('careeros-theme', newTheme.id);
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleMenuClick = useCallback((e: { key: string }) => {
    if (ROUTE_KEYS.has(e.key)) {
      router.push(e.key);
    }
  }, [router]);

  const getSelectedKeys = () => {
    if (pathname === '/') return ['/'];
    const segments = pathname.split('/').filter(Boolean);
    return ['/' + segments[0]];
  };

  const getOpenKeys = () => {
    if (pathname === '/') return [];
    const route = '/' + (pathname.split('/').filter(Boolean)[0] || '');
    if (['/job-seeking', '/salary-growth', '/growth', '/resumes'].includes(route)) return ['personal'];
    if (['/companies', '/contacts', '/market', '/candidates'].includes(route)) return ['workbench'];
    return [];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: collapsed ? '20px 8px' : '20px 16px 14px',
      }}>
        <Link href="/" style={{ textDecoration: 'none', lineHeight: 0 }}>
          <img
            src={theme.logo}
            alt="CareerOS"
            style={{
              height: collapsed ? 28 : 36,
              maxWidth: collapsed ? 28 : 140,
              objectFit: 'contain',
            }}
          />
        </Link>
        {!collapsed && (
          <div onClick={handleRandomTheme} title="换主题"
            style={{
              cursor: 'pointer', color: '#bbb', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 8, transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#888'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#bbb'; }}
          >
            <ReloadOutlined style={{ fontSize: 11 }} />
            {theme.name}
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: 'transparent',
          padding: '0 8px',
          fontSize: 14,
        }}
      />

      {/* Logout */}
      <div style={{ marginTop: 'auto', padding: '8px 12px 16px' }}>
        <div onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            cursor: 'pointer', color: '#999', fontSize: 14,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.background = '#f3f1ee';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#999';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogoutOutlined />
          {!collapsed && <span>退出登录</span>}
        </div>
      </div>
    </div>
  );
}
