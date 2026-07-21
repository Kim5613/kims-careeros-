'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  SendOutlined,
  AimOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Theme, getStoredTheme, getRandomTheme, themes } from '@/lib/themes';
import { FONT_STYLES, getStoredFontIdx } from '@/lib/font-styles';

// 所有可导航的叶子路由
const ROUTE_KEYS = new Set(['/', '/personal', '/workbench', '/job-seeking', '/job-seeking/applications', '/job-seeking/diagnosis', '/salary-growth', '/resumes', '/growth', '/growth/skill-map', '/growth/career-sphere', '/companies', '/contacts', '/market', '/knowledge', '/settings']);

// tool: 给菜单项注入 onClick，不再依赖 Antd Menu 的全局 onClick（三层嵌套时不可靠）
function navItem(key: string, icon: React.ReactNode, label: string, router: ReturnType<typeof useRouter>, children?: any[]): any {
  return { key, icon, label, onClick: children ? undefined : () => { if (ROUTE_KEYS.has(key)) router.push(key); }, children };
}

function buildMenuItems(router: ReturnType<typeof useRouter>) {
  const groupLabel = (text: string, path: string) => (
    <span onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push(path); }}>{text}</span>
  );

  return [
    navItem('/', <DashboardOutlined />, '首页', router),
    {
      key: 'personal', icon: <UserOutlined />, label: groupLabel('个人', '/personal'),
      children: [
        { key: '/job-seeking', icon: <SearchOutlined />, label: '求职',
          children: [
            navItem('/job-seeking', <DashboardOutlined />, '概览', router),
            navItem('/job-seeking/applications', <SendOutlined />, '投递', router),
            navItem('/job-seeking/diagnosis', <SearchOutlined />, '岗位诊断', router),
          ],
        },
        navItem('/salary-growth', <RiseOutlined />, '薪酬', router),
        navItem('/resumes', <IdcardOutlined />, '简历', router),
        { key: '/growth', icon: <TrophyOutlined />, label: '档案',
          children: [
            navItem('/growth', <TrophyOutlined />, '成长档案', router),
            navItem('/growth/career-sphere', <AimOutlined />, '职业宇宙', router),
          ],
        },
      ],
    },
    {
      key: 'workbench', icon: <TeamOutlined />, label: groupLabel('HR工作台', '/workbench'),
      children: [
        navItem('/companies', <FundOutlined />, '公司库', router),
        navItem('/contacts', <TeamOutlined />, '人脉库', router),
        navItem('/market', <GlobalOutlined />, '市场洞察', router),
      ],
    },
    navItem('/knowledge', <BookOutlined />, '知识库', router),
    navItem('/settings', <SettingOutlined />, '设置', router),
  ];
}

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const [fontIdx, setFontIdx] = useState(0);
  const fontStyle = FONT_STYLES[fontIdx];

  useEffect(() => {
    setFontIdx(getStoredFontIdx());
    const onStorage = () => setFontIdx(getStoredFontIdx());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 职业宇宙体系 → 深色背景
  const isDark = pathname.startsWith('/growth/career-sphere') || pathname.startsWith('/growth/domain/');
  const textColor = isDark ? '#999' : '#bbb';
  const textHoverColor = isDark ? '#ccc' : '#888';
  const logoutColor = isDark ? '#777' : '#999';
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
    if (pathname === '/personal') return ['personal'];
    if (pathname === '/workbench') return ['workbench'];
    // For nested routes like /job-seeking/applications, match the full sub-path
    if (pathname.startsWith('/job-seeking/')) {
      const sub = pathname.replace(/^\/job-seeking\//, '');
      if (sub === 'applications') return ['/job-seeking/applications'];
      if (sub === 'diagnosis') return ['/job-seeking/diagnosis'];
      return ['/job-seeking'];
    }
    if (pathname === '/growth/skill-map') return ['/growth/skill-map'];
    if (pathname === '/growth/career-sphere') return ['/growth/career-sphere'];
    if (pathname.startsWith('/growth/domain/')) return ['/growth/career-sphere']; // 赛道详情页高亮职业宇宙
    const segments = pathname.split('/').filter(Boolean);
    return ['/' + segments[0]];
  };

  const getOpenKeys = () => {
    if (pathname === '/') return [];
    if (pathname === '/personal') return ['personal'];
    if (pathname === '/workbench') return ['workbench'];
    // Open both 'personal' and 'job-seeking' sub-menu when on job-seeking sub-pages
    if (pathname.startsWith('/job-seeking/')) return ['personal', '/job-seeking'];
    if (pathname === '/growth/skill-map' || pathname === '/growth/career-sphere') return ['personal', '/growth'];
    const route = '/' + (pathname.split('/').filter(Boolean)[0] || '');
    if (['/job-seeking', '/salary-growth', '/growth', '/resumes'].includes(route)) return ['personal'];
    if (['/companies', '/contacts', '/market', '/candidates'].includes(route)) return ['workbench'];
    return [];
  };

  // 受控 openKeys：路由变化时自动展开，点击箭头手动切换
  const [openKeys, setOpenKeys] = useState<string[]>(getOpenKeys());
  useEffect(() => { setOpenKeys(getOpenKeys()); }, [pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo — 纯文字 */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: collapsed ? '20px 8px' : '20px 16px 14px',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: collapsed ? 14 : 20,
            fontFamily: fontStyle.family,
            fontWeight: fontStyle.weight,
            fontStyle: fontStyle.style,
            color: isDark ? '#fff' : fontStyle.color,
            textTransform: fontStyle.transform,
            letterSpacing: fontStyle.transform === 'uppercase' ? '0.08em' : '0.02em',
            whiteSpace: 'nowrap',
          }}>
            {collapsed ? 'CO' : "Kim's CareerOS"}
          </span>
        </Link>
        {!collapsed && (
          <div onClick={handleRandomTheme} title="换主题"
            style={{
              cursor: 'pointer', color: textColor, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 8, transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textHoverColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textColor; }}
          >
            <ReloadOutlined style={{ fontSize: 11 }} />
            {theme.name}
          </div>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            padding: '0 8px',
            fontSize: 14,
            color: isDark ? '#ccc' : undefined,
          }}
        />
      </div>

      {/* Logout */}
      <div style={{ padding: '8px 12px 16px', flexShrink: 0 }}>
        <div onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            cursor: 'pointer', color: logoutColor, fontSize: 14,
            transition: 'all 0.2s',
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
          {!collapsed && <span>退出登录</span>}
        </div>
      </div>
    </div>
  );
}
