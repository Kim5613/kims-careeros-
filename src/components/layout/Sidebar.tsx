'use client';

import React, { useState, useEffect } from 'react';
import {
  DashboardOutlined, IdcardOutlined, ThunderboltOutlined, ExperimentOutlined,
  AccountBookOutlined, AimOutlined, TeamOutlined, BankOutlined,
  SettingOutlined, LogoutOutlined, ReloadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Theme, getStoredTheme, getRandomTheme, themes } from '@/lib/themes';

// ════════════════════════════════════════════
// 层级定义
// 一级 = 分组 (个人经验 / 工作资产)
// 二级 = 模块 (身份铭牌 / 实战沙盘 / ...)
// 三级 = 子项 (求职战役 / 内部战役 / ...)
// ════════════════════════════════════════════

interface ChildItem {
  key: string; label: string; route: string;
}

interface ModuleItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  route: string;
  children?: ChildItem[];
}

interface GroupDef {
  key: string;
  label: string;
  route: string;
  modules: ModuleItem[];
}

// ── 个人经验 ──
const PERSONAL_MODULES: ModuleItem[] = [
  {
    key: '/identity', icon: <IdcardOutlined />, label: '身份铭牌', route: '/identity',
    children: [
      { key: '/identity', label: '我的简历', route: '/identity' },
    ],
  },
  {
    key: '/battle', icon: <ThunderboltOutlined />, label: '实战沙盘', route: '/battle',
    children: [
      { key: '/battle/job-seeking', label: '求职战役', route: '/battle/job-seeking' },
      { key: '/battle/internal', label: '内部战役', route: '/battle/internal' },
    ],
  },
  {
    key: '/cognition', icon: <ExperimentOutlined />, label: '认知实验室', route: '/cognition',
    children: [
      { key: '/cognition/input', label: '输入资料', route: '/cognition/input' },
      { key: '/cognition/skills', label: '技能学习', route: '/cognition/skills' },
      { key: '/cognition/hobbies', label: '生活兴趣', route: '/cognition/hobbies' },
    ],
  },
  {
    key: '/value', icon: <AccountBookOutlined />, label: '身价账本', route: '/value',
    children: [
      { key: '/value/timeline', label: '职业履历', route: '/value/timeline' },
      { key: '/value/salary', label: '薪资涨幅', route: '/value/salary' },
      { key: '/value/review', label: '身价复盘', route: '/value/review' },
    ],
  },
  {
    key: '/career-sphere', icon: <AimOutlined />, label: '职业宇宙', route: '/career-sphere',
  },
];

// ── 工作资产 ──
const WORK_MODULES: ModuleItem[] = [
  {
    key: '/talent', icon: <TeamOutlined />, label: '人才弹药库', route: '/talent',
    children: [
      { key: '/talent/contacts', label: '人才档案', route: '/talent/contacts' },
      { key: '/talent/categories', label: '人才分类', route: '/talent/categories' },
      { key: '/talent/operations', label: '人才运营', route: '/talent/operations' },
    ],
  },
  {
    key: '/companies-group', icon: <BankOutlined />, label: '公司瞭望台', route: '/companies',
    children: [
      { key: '/companies', label: '公司档案', route: '/companies' },
      { key: '/companies/talent-map', label: '人才分布', route: '/companies/talent-map' },
      { key: '/companies/operations', label: '公司运营', route: '/companies/operations' },
    ],
  },
];

/** 所有模块平铺 */
const ALL_MODULES = [...PERSONAL_MODULES, ...WORK_MODULES];

/** 一级分组定义 */
const GROUPS: GroupDef[] = [
  { key: '/personal-experience', label: '个人经验', route: '/personal-experience', modules: PERSONAL_MODULES },
  { key: '/work-assets', label: '工作资产', route: '/work-assets', modules: WORK_MODULES },
];

/** 判断一个路径属于哪个一级分组 */
function findActiveGroup(pathname: string): GroupDef | null {
  if (pathname === '/' || pathname === '/settings') return null;

  // 检查是否直接命中分组首页
  for (const g of GROUPS) {
    if (pathname === g.route) return g;
  }

  // 检查模块前缀
  for (const g of GROUPS) {
    for (const mod of g.modules) {
      if (pathname === mod.key || pathname.startsWith(mod.key + '/')) return g;
    }
  }

  // 兼容旧路由
  if (pathname === '/personal') return GROUPS[0]; // 个人经验
  if (pathname.startsWith('/growth/') || pathname === '/growth') return GROUPS[0];
  if (pathname === '/workbench' || pathname === '/contacts' || pathname === '/candidates' || pathname === '/market') return GROUPS[1]; // 工作资产
  if (pathname === '/knowledge') return GROUPS[0];
  if (pathname === '/salary-growth') return GROUPS[0];

  return null;
}

/** 判断当前路径属于哪个模块 */
function findActiveModule(pathname: string): ModuleItem | null {
  for (const mod of ALL_MODULES) {
    if (pathname === mod.key || pathname.startsWith(mod.key + '/')) return mod;
  }
  // 兼容旧路由
  if (pathname === '/personal') return ALL_MODULES.find(m => m.key === '/battle') || null;
  if (pathname.startsWith('/growth/') || pathname === '/growth') return ALL_MODULES.find(m => m.key === '/career-sphere') || null;
  if (pathname === '/workbench' || pathname === '/contacts' || pathname === '/candidates' || pathname === '/market') return ALL_MODULES.find(m => m.key === '/talent') || null;
  if (pathname === '/knowledge') return ALL_MODULES.find(m => m.key === '/cognition') || null;
  if (pathname === '/salary-growth') return ALL_MODULES.find(m => m.key === '/value') || null;
  return null;
}

/** 路径 → 选中 key */
function resolveSelectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname === '/settings') return '/settings';

  for (const mod of ALL_MODULES) {
    if (mod.children) {
      for (const ch of mod.children) {
        if (pathname === ch.route || pathname.startsWith(ch.route + '/')) return ch.key;
      }
    }
  }
  for (const mod of ALL_MODULES) {
    if (pathname.startsWith(mod.key + '/') || pathname === mod.key) return mod.key;
  }
  // 兼容旧路由
  if (pathname === '/personal') return '/battle/job-seeking';
  if (pathname.startsWith('/growth/') || pathname === '/growth') return '/career-sphere';
  if (pathname.startsWith('/career-sphere')) return '/career-sphere';
  if (pathname === '/workbench' || pathname === '/contacts' || pathname === '/candidates' || pathname === '/market') return '/talent';
  if (pathname === '/knowledge') return '/cognition/input';
  if (pathname === '/salary-growth') return '/value/salary';
  return '';
}

// ════════════════════════════════════════════
// Component
// ════════════════════════════════════════════
export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const isDark = pathname.startsWith('/career-sphere') || pathname.startsWith('/growth/career-sphere') || pathname.startsWith('/growth/domain/');
  const textColor = isDark ? '#888' : '#aaa';
  const textHoverColor = isDark ? '#bbb' : '#777';
  const logoutColor = isDark ? '#666' : '#999';
  const logoutHoverBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3f1ee';

  const activeGroup = findActiveGroup(pathname);
  const activeModule = findActiveModule(pathname);
  const selectedKey = resolveSelectedKey(pathname);

  useEffect(() => { setTheme(getStoredTheme()); }, []);

  const handleRandomTheme = () => {
    const newTheme = getRandomTheme();
    localStorage.setItem('careeros-theme', newTheme.id);
    setTheme(newTheme);
  };
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  const goHome = () => router.push('/');
  const goSettings = () => router.push('/settings');

  // ── 渲染展开后的完整列表 ──
  const renderExpandedList = () => (
    <div style={{ flex: 1, overflow: 'auto', padding: '0 6px' }}>
      {/* 首页 */}
      <HomeButton isActive={selectedKey === '/'} onClick={goHome} isDark={isDark} />

      {GROUPS.map((group) => {
        const isGroupActive = activeGroup?.key === group.key;
        const isOnGroupHome = pathname === group.route;

        return (
          <div key={group.key} style={{ marginTop: 6 }}>
            {/* 一级标题：分组名 + icon */}
            <div onClick={() => router.push(group.route)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: isOnGroupHome ? 600 : 500,
                color: isOnGroupHome
                  ? (isDark ? '#fff' : '#7c6ff0')
                  : (isDark ? '#aaa' : '#666'),
                background: isOnGroupHome
                  ? (isDark ? 'rgba(255,255,255,0.06)' : '#f0edf8')
                  : 'transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isOnGroupHome) {
                  e.currentTarget.style.color = isDark ? '#ddd' : '#444';
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f5f3f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOnGroupHome) {
                  e.currentTarget.style.color = isDark ? '#aaa' : '#666';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{group.label === '个人经验' ? '🧭' : '💼'}</span>
              <span>{group.label}</span>
            </div>

            {/* 二级标题：仅当前激活的分组展开 */}
            {isGroupActive && (
              <div style={{ paddingLeft: 14, marginTop: 2 }}>
                {group.modules.map((mod) => {
                  const isModActive = activeModule?.key === mod.key;
                  const isModHome = pathname === mod.key;

                  return (
                    <div key={mod.key}>
                      {/* 二级标题：模块名 */}
                      <div onClick={() => router.push(mod.route)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 8px', borderRadius: 8, cursor: 'pointer',
                          fontSize: 13, fontWeight: isModHome ? 500 : 400,
                          color: isModActive
                            ? (isDark ? '#fff' : '#555')
                            : (isDark ? '#888' : '#999'),
                          background: isModActive
                            ? (isDark ? 'rgba(255,255,255,0.05)' : '#f9f7f4')
                            : 'transparent',
                          transition: 'all 0.15s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          if (!isModActive) {
                            e.currentTarget.style.color = isDark ? '#bbb' : '#666';
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#f5f3f0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isModActive) {
                            e.currentTarget.style.color = isDark ? '#888' : '#999';
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{mod.icon}</span>
                        <span>{mod.label}</span>
                      </div>

                      {/* 三级标题：仅当前模块展开 */}
                      {isModActive && mod.children && (
                        <div style={{ paddingLeft: 26, marginBottom: 2 }}>
                          {mod.children.map((ch) => {
                            const isChildActive = selectedKey === ch.key;
                            return (
                              <div key={ch.key} onClick={() => router.push(ch.route)}
                                style={{
                                  padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                                  fontSize: 12, fontWeight: isChildActive ? 500 : 400,
                                  color: isChildActive
                                    ? (isDark ? '#fff' : '#7c6ff0')
                                    : (isDark ? '#777' : '#aaa'),
                                  background: isChildActive
                                    ? (isDark ? 'rgba(255,255,255,0.08)' : '#f0edf8')
                                    : 'transparent',
                                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isChildActive) {
                                    e.currentTarget.style.color = isDark ? '#aaa' : '#777';
                                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f5f3f0';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isChildActive) {
                                    e.currentTarget.style.color = isDark ? '#777' : '#aaa';
                                    e.currentTarget.style.background = 'transparent';
                                  }
                                }}
                              >
                                {ch.label}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* 设置 */}
      <div style={{ marginTop: 12 }}>
        <HomeButton icon={<SettingOutlined />} label="设置" isActive={selectedKey === '/settings'}
          onClick={goSettings} isDark={isDark} />
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════
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
            }}>{"Kim's CareerOS"}</span>
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

      {/* Collapsed mode */}
      {collapsed ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0', overflow: 'auto' }}>
          <CollapsedIcon icon={<DashboardOutlined />} label="首页" isActive={selectedKey === '/'}
            onClick={goHome} isDark={isDark} />
          <div style={{ width: 20, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', margin: '2px 0' }} />

          {/* 一级标题：个人经验 */}
          <CollapsedIcon icon={<span style={{fontSize:13}}>🧭</span>} label="个人经验"
            isActive={activeGroup?.key === '/personal-experience'}
            onClick={() => router.push('/personal-experience')} isDark={isDark} />

          {/* 二级标题：仅当前分组激活时显示 */}
          {activeGroup?.key === '/personal-experience' && PERSONAL_MODULES.map((mod) => {
            const active = activeModule?.key === mod.key;
            return (
              <CollapsedIcon key={mod.key} icon={mod.icon} label={mod.label}
                isActive={active} onClick={() => router.push(mod.route)} isDark={isDark} />
            );
          })}

          <div style={{ width: 20, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', margin: '2px 0' }} />

          {/* 一级标题：工作资产 */}
          <CollapsedIcon icon={<span style={{fontSize:13}}>💼</span>} label="工作资产"
            isActive={activeGroup?.key === '/work-assets'}
            onClick={() => router.push('/work-assets')} isDark={isDark} />

          {/* 二级标题：仅当前分组激活时显示 */}
          {activeGroup?.key === '/work-assets' && WORK_MODULES.map((mod) => {
            const active = activeModule?.key === mod.key;
            return (
              <CollapsedIcon key={mod.key} icon={mod.icon} label={mod.label}
                isActive={active} onClick={() => router.push(mod.route)} isDark={isDark} />
            );
          })}

          <div style={{ flex: 1 }} />
          <CollapsedIcon icon={<SettingOutlined />} label="设置" isActive={selectedKey === '/settings'}
            onClick={goSettings} isDark={isDark} />
        </div>
      ) : (
        renderExpandedList()
      )}

      {/* Logout */}
      <div style={{ padding: '8px 10px 14px', flexShrink: 0 }}>
        {collapsed ? (
          <div onClick={handleLogout} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: logoutColor, fontSize: 14, transition: 'all 0.15s', margin: '0 auto' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textHoverColor; e.currentTarget.style.background = logoutHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = logoutColor; e.currentTarget.style.background = 'transparent'; }}>
            <LogoutOutlined />
          </div>
        ) : (
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, cursor: 'pointer', color: logoutColor, fontSize: 13, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textHoverColor; e.currentTarget.style.background = logoutHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = logoutColor; e.currentTarget.style.background = 'transparent'; }}>
            <LogoutOutlined /><span>退出登录</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// 小部件
// ════════════════════════════════════════════

function CollapsedIcon({ icon, label, isActive, onClick, isDark }: {
  icon: React.ReactNode; label: string; isActive: boolean;
  onClick: () => void; isDark: boolean;
}) {
  return (
    <div onClick={onClick} title={label}
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
      {icon}
    </div>
  );
}

function HomeButton({ icon, label, isActive, onClick, isDark }: {
  icon?: React.ReactNode; label?: string; isActive: boolean;
  onClick: () => void; isDark: boolean;
}) {
  const displayIcon = icon || <DashboardOutlined />;
  const displayLabel = label || '首页';
  return (
    <div onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
        fontSize: 13, fontWeight: isActive ? 500 : 400,
        color: isActive ? (isDark ? '#fff' : '#7c6ff0') : (isDark ? '#aaa' : '#777'),
        background: isActive ? (isDark ? 'rgba(255,255,255,0.08)' : '#f0edf8') : 'transparent',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = isDark ? '#ccc' : '#555';
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f5f3f0';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = isDark ? '#aaa' : '#777';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{displayIcon}</span>
      <span>{displayLabel}</span>
    </div>
  );
}
