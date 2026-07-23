'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SidebarContent from './Sidebar';
import AISkillPanel from '@/components/AISkillPanel';

const DARK_ROUTES = ['/career-sphere', '/growth/career-sphere', '/growth/domain/'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const isDark = DARK_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* 侧边栏 — 收起显示图标列 (60px)，hover 展开 (240px) */}
        <aside
          onMouseEnter={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: collapsed ? 60 : 240,
            overflowX: 'hidden',
            overflowY: 'auto',
            height: '100vh',
            zIndex: 10,
            background: isDark
              ? 'rgba(13,13,13,0.92)'
              : '#faf8f6',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRight: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.05)',
            transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SidebarContent collapsed={collapsed} />
        </aside>

        {/* 主内容 */}
        <main
          style={{
            flex: 1,
            marginLeft: collapsed ? 60 : 240,
            transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '100vh',
          }}
        >
          {children}
        </main>
      </div>

      <AISkillPanel />
    </>
  );
}