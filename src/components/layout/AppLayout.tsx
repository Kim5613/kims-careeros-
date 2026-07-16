'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SidebarContent from './Sidebar';
import FloatingPet from '@/components/FloatingPet';

const DARK_ROUTES = ['/growth/career-sphere', '/growth/domain/'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const isDark = DARK_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* 触发带 — 左侧边缘细线 */}
        <div
          onMouseEnter={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            zIndex: 15,
            cursor: 'pointer',
          }}
        />

        {/* 毛玻璃菜单 */}
        <aside
          onMouseLeave={() => setCollapsed(true)}
          className={!collapsed ? 'sidebar-open' : ''}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: collapsed ? 0 : 260,
            overflow: 'hidden',
            height: '100vh',
            zIndex: 10,
            background: isDark
              ? 'rgba(13,13,13,0.85)'
              : 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderRight: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.06)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!collapsed && (
            <div className="sidebar-stage">
              <SidebarContent collapsed={false} />
            </div>
          )}
        </aside>

        {/* 主内容 */}
        <main
          style={{
            flex: 1,
            marginLeft: collapsed ? 0 : 260,
            transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '100vh',
          }}
        >
          {children}
        </main>
      </div>

      {/* 芝士 — body 层级，不受页面布局影响 */}
      <FloatingPet />
    </>
  );
}
