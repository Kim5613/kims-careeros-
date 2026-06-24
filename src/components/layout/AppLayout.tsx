'use client';

import React, { useState } from 'react';
import { Layout } from 'antd';
import SidebarContent from './Sidebar';

const { Sider } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
          height: '100vh',
          zIndex: 10,
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </Sider>
      <main
        style={{
          flex: 1,
          marginLeft: collapsed ? 80 : 240,
          background: '#f5f5f5',
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: 24 }}>{children}</div>
      </main>
    </div>
  );
}
