'use client';

import React, { useState, useEffect } from 'react';
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

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: <Link href="/">首页</Link>,
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'personal',
    icon: <UserOutlined />,
    label: '个人',
    children: [
      {
        key: '/job-seeking',
        icon: <SearchOutlined />,
        label: <Link href="/job-seeking">求职</Link>,
      },
      {
        key: '/salary-growth',
        icon: <RiseOutlined />,
        label: <Link href="/salary-growth">薪酬</Link>,
      },
      {
        key: '/resumes',
        icon: <IdcardOutlined />,
        label: <Link href="/resumes">简历</Link>,
      },
      {
        key: '/growth',
        icon: <TrophyOutlined />,
        label: <Link href="/growth">档案</Link>,
      },
    ],
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'workbench',
    icon: <TeamOutlined />,
    label: 'HR工作台',
    children: [
      {
        key: '/companies',
        icon: <FundOutlined />,
        label: <Link href="/companies">公司库</Link>,
      },
      {
        key: '/contacts',
        icon: <TeamOutlined />,
        label: <Link href="/contacts">人脉库</Link>,
      },
      {
        key: '/market',
        icon: <GlobalOutlined />,
        label: <Link href="/market">市场洞察</Link>,
      },
    ],
  },
  {
    type: 'divider' as const,
  },
  {
    key: '/knowledge',
    icon: <BookOutlined />,
    label: <Link href="/knowledge">知识库</Link>,
  },
  {
    type: 'divider' as const,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link href="/settings">设置</Link>,
  },
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

  const getSelectedKeys = () => {
    if (pathname === '/') return ['/'];
    const segments = pathname.split('/').filter(Boolean);
    return ['/' + segments[0]];
  };

  const getOpenKeys = () => {
    if (pathname === '/') return [];
    const segments = pathname.split('/').filter(Boolean);
    const route = '/' + segments[0];

    if (['/job-seeking', '/salary-growth', '/growth', '/resumes'].includes(route)) {
      return ['personal'];
    }
    if (['/companies', '/contacts', '/market', '/candidates'].includes(route)) {
      return ['workbench'];
    }
    return [];
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: collapsed ? '16px 8px' : '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          gap: 8,
        }}
      >
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
          <div
            onClick={handleRandomTheme}
            title="换一个主题"
            style={{
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <ReloadOutlined style={{ fontSize: 11 }} />
            {theme.name}
          </div>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          padding: '0 16px',
        }}
      >
        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.65)',
            fontSize: 14,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogoutOutlined />
          {!collapsed && <span>退出登录</span>}
        </div>
      </div>
    </>
  );
}
