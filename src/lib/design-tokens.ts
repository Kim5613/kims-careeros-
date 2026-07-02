/**
 * Kim's CareerOS — 统一设计令牌
 * 所有页面共用，确保视觉一致
 */

// ======== 圆角刻度 ========
export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

// ======== 阴影层级 ========
export const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.04)',
  float: '0 4px 16px rgba(0,0,0,0.06)',
  glow: (color = '#8b7cf0') => `0 0 0 2px ${color}, 0 4px 16px ${color}1a`,
} as const;

// ======== 间距刻度 ========
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// ======== 颜色 ========
// 基础色板
export const colors = {
  // 页面底色
  bg: '#faf8f6',
  // 卡片白
  surface: '#fff',
  // 悬浮高亮
  highlight: '#f6f3ff',
  // 今日高亮
  todayBg: '#f3f0ff',

  // 品牌主色（与主题联动）
  primary: '#8b7cf0',
  primaryLight: '#f3f0ff',

  // 语义色
  success: '#52c41a',
  warning: '#fa8c16',
  danger: '#ff4d4f',
  info: '#1890ff',

  // 中性色
  text: '#333',
  textSecondary: '#777',
  textMuted: '#bbb',
  border: '#f0ece8',
};

// ======== 排版 ========
export const type = {
  pageTitle: { fontSize: 20, fontWeight: 600, color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#444' },
  body: { fontSize: 14, color: '#555' },
  caption: { fontSize: 12, color: '#999' },
} as const;

// ======== 通用样式片段 ========
export const mixins = {
  /** 内容卡片 */
  card: {
    borderRadius: radius.lg,
    background: colors.surface,
    boxShadow: shadow.card,
  } as React.CSSProperties,

  /** 统计卡片 */
  statCard: (accentColor?: string) => ({
    borderRadius: radius.md,
    background: colors.surface,
    boxShadow: shadow.card,
    borderTop: accentColor ? `3px solid ${accentColor}` : undefined,
  }) as React.CSSProperties,

  /** 页面外层容器 */
  pageWrap: {
    padding: `20px ${space.xl}px 12px`,
    background: colors.bg,
    minHeight: '100vh',
  } as React.CSSProperties,

  /** 药丸按钮 */
  pillButton: {
    borderRadius: radius.full,
  } as React.CSSProperties,

  /** 圆润输入框 */
  roundedInput: {
    borderRadius: radius.md,
  } as React.CSSProperties,
};
