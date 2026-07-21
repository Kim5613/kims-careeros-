'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined, SearchOutlined, AimOutlined, TeamOutlined,
  BookOutlined, SettingOutlined, LogoutOutlined, ReloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Theme, getStoredTheme, getRandomTheme, themes } from '@/lib/themes';

const ROUTE_KEYS = new Set(['/', '/personal', '/growth/career-sphere', '/workbench', '/knowledge', '/settings']);

function navItem(key: string, icon: React.ReactNode, label: string, router: ReturnType<typeof useRouter>): any {
  return { key, icon, label, onClick: () => { if (ROUTE_KEYS.has(key)) router.push(key); } };
}

function buildMenuItems(router: ReturnType<typeof useRouter>) {
  return [
    navItem('/', <DashboardOutlined />, '首页', router),
    navItem('/personal', <SearchOutlined />, '求职', router),
    navItem('/growth/career-sphere', <AimOutlined />, '职业宇宙', router),
    navItem('/workbench', <TeamOutlined />, 'HR工作台', router),
    navItem('/knowledge', <BookOutlined />, '知识库', router),
    navItem('/settings', <SettingOutlined />, '设置', router),
  ];
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const isDark = pathname.startsWith('/growth/growth/career-sphere') || pathname.startsWith('/growth/domain/');
  const textColor = isDark ? '#888' : '#aaa';
  const textHoverColor = isDark ? '#bbb' : '#777';
  const logoutColor = isDark ? '#666' : '#999';
  const logoutHoverBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3f1ee';

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

  const menuItems = useMemo(() => buildMenuItems(router), [router]);

  const getSelectedKeys = () => {
    if (pathname === '/') return ['/'];
    if (pathname === '/personal') return ['/personal'];
    if (pathname === '/growth/career-sphere' || pathname.startsWith('/growth/')) return ['/growth/career-sphere'];
    if (pathname === '/workbench' || pathname.startsWith('/companies') || pathname.startsWith('/contacts') || pathname.startsWith('/market')) return ['/workbench'];
    if (pathname === '/knowledge') return ['/knowledge'];
    if (pathname === '/settings') return ['/settings'];
    return [];
  };

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  useEffect(() => { setOpenKeys([]); }, [pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: collapsed ? '20px 0 10px' : '20px 14px 10px',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          {collapsed ? (
            <span style={{
              fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#222',
              width: 32, height: 32, borderRadius: 8,
              background: isDark ? 'rgba(255,255,255,0.1)' : '#f0edf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>K</span>
          ) : (
            <span style={{
              fontSize: 17, fontWeight: 500, color: isDark ? '#fff' : '#222',
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>
              {"Kim's CareerOS"}
            </span>
          )}
        </Link>
        {!collapsed && (
          <div onClick={handleRandomTheme} title="换主题"
            style={{
              cursor: 'pointer', color: textColor, fontSize: 11, display: 'flex',
              alignItems: 'center', gap: 3, marginTop: 6, transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textHoverColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textColor; }}
          >
            <ReloadOutlined style={{ fontSize: 10 }} />
            {theme.name}
          </div>
        )}
      </div>

      {/* Menu */}
      {collapsed ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0' }}>
          {[
            { key: '/', icon: <DashboardOutlined />, label: '首页' },
            { key: '/personal', icon: <SearchOutlined />, label: '求职' },
            { key: '/growth/career-sphere', icon: <AimOutlined />, label: '职业宇宙' },
            { key: '/workbench', icon: <TeamOutlined />, label: '工作台' },
          ].map(item => {
            const isActive = getSelectedKeys().includes(item.key);
            return (
              <div key={item.key}
                onClick={() => router.push(item.key)}
                title={item.label}
                style={{
                  width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', fontSize: 16,
                  color: isActive ? (isDark ? '#fff' : '#7c6ff0') : (isDark ? '#777' : '#bbb'),
                  background: isActive ? (isDark ? 'rgba(255,255,255,0.1)' : '#f0edf8') : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) { e.currentTarget.style.color = isDark ? '#bbb' : '#888'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f5f3f0'; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) { e.currentTarget.style.color = isDark ? '#777' : '#bbb'; e.currentTarget.style.background = 'transparent'; }
                }}
              >
                {item.icon}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            style={{
              borderRight: 0, background: 'transparent',
              padding: '0 6px', fontSize: 13,
              color: isDark ? '#ccc' : undefined,
            }}
          />
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '8px 10px 14px', flexShrink: 0 }}>
        {collapsed ? (
          <div onClick={handleLogout}
            style={{
              width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: logoutColor, fontSize: 14,
              transition: 'all 0.15s', margin: '0 auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = textHoverColor;
              e.currentTarget.style.background = logoutHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = logoutColor;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogoutOutlined />
          </div>
        ) : (
          <div onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 10,
              cursor: 'pointer', color: logoutColor, fontSize: 13,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = textHoverColor;
              e.currentTarget.style.background = logoutHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = logoutColor;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        )}
      </div>
    </div>
  );
}