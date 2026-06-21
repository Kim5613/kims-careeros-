'use client';

import React, { useState } from 'react';
import { Menu, Layout } from 'antd';
import {
  DashboardOutlined,
  SearchOutlined,
  RiseOutlined,
  FileTextOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
  UserOutlined,
  TrophyOutlined,
  IdcardOutlined,
  FundOutlined,
  GlobalOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: <Link href="/">数据看板</Link>,
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'personal',
    icon: <UserOutlined />,
    label: '我的职业发展',
    children: [
      {
        key: '/job-seeking',
        icon: <SearchOutlined />,
        label: <Link href="/job-seeking">求职管理</Link>,
      },
      {
        key: '/salary-growth',
        icon: <RiseOutlined />,
        label: <Link href="/salary-growth">薪酬与晋升</Link>,
      },
      {
        key: '/growth',
        icon: <TrophyOutlined />,
        label: <Link href="/growth">成长档案</Link>,
      },
      {
        key: '/resumes',
        icon: <IdcardOutlined />,
        label: <Link href="/resumes">简历与求职信</Link>,
      },
    ],
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'workbench',
    icon: <TeamOutlined />,
    label: 'HR 工作台',
    children: [
      {
        key: '/candidates',
        icon: <TeamOutlined />,
        label: <Link href="/candidates">候选人库</Link>,
      },
      {
        key: '/knowledge',
        icon: <BookOutlined />,
        label: <Link href="/knowledge">招聘知识库</Link>,
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
    key: 'foundation',
    icon: <DatabaseOutlined />,
    label: '基础数据',
    children: [
      {
        key: '/companies',
        icon: <FundOutlined />,
        label: <Link href="/companies">公司库</Link>,
      },
      {
        key: '/contacts',
        icon: <UserOutlined />,
        label: <Link href="/contacts">人脉库</Link>,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
    if (['/candidates', '/knowledge', '/market'].includes(route)) {
      return ['workbench'];
    }
    if (['/companies', '/contacts'].includes(route)) {
      return ['foundation'];
    }
    return [];
  };

  return (
    <Sider
      width={240}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'auto',
        height: '100vh',
      }}
    >
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 16px',
      }}>
        {!collapsed ? (
          <h1 style={{ color: '#fff', fontSize: 15, margin: 0, fontWeight: 600, whiteSpace: 'nowrap' }}>
            Kim&apos;s CareerOS
          </h1>
        ) : (
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>K</span>
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
    </Sider>
  );
}
