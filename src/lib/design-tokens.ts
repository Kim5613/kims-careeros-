/**
 * Kim's CareerOS — 统一设计令牌
 * 所有页面共用，确保视觉一致
 * 「简单高级」v2 — 更柔和的阴影、更大的留白、更克制的颜色
 */

// ======== 圆角刻度 ========
export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

// ======== 阴影层级 ========
export const shadow = {
  /** 默认卡片 — 极淡，接近无边框 */
  card: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
  /** 浮起卡片 — 悬停/弹出层 */
  raised: '0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
  /** 品牌发光 — 今日/选中 */
  glow: (color = '#8b7cf0') => `0 0 0 1px ${color}20, 0 2px 12px ${color}12`,
} as const;

// ======== 间距刻度 ========
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ======== 颜色 ========
export const colors = {
  // 页面底色
  bg: '#faf8f6',
  // 暖调底色
  bgWarm: '#f9f7f4',
  // 卡片白
  surface: '#fff',
  // 悬浮高亮
  highlight: '#f7f5ff',
  // 今日高亮
  todayBg: '#f5f2ff',

  // 品牌主色（柔和紫）
  primary: '#8b7cf0',
  primaryLight: '#f5f3ff',

  // 语义色
  success: '#4cb840',
  warning: '#e08830',
  danger: '#e05858',
  info: '#5088e0',

  // 中性色
  text: '#333',
  textSecondary: '#888',
  textMuted: '#bbb',
  border: '#eeeae5',
};

// ======== 排版 ========
export const type = {
  pageTitle: { fontSize: 22, fontWeight: 500, color: '#222', letterSpacing: '-0.01em' } as const,
  sectionTitle: { fontSize: 15, fontWeight: 500, color: '#444' } as const,
  sectionLabel: { fontSize: 11, fontWeight: 500, color: '#bbb', textTransform: 'uppercase' as const, letterSpacing: '0.05em' as const } as const,
  body: { fontSize: 14, color: '#555' } as const,
  caption: { fontSize: 12, color: '#aaa' } as const,
};

// ======== 通用样式片段 ========
export const mixins = {
  /** 内容卡片 */
  card: {
    borderRadius: radius.md,
    background: colors.surface,
    boxShadow: shadow.card,
  } as React.CSSProperties,

  /** 统计卡片 */
  statCard: {
    borderRadius: radius.md,
    background: colors.surface,
    boxShadow: shadow.card,
  } as React.CSSProperties,

  /** 页面外层容器 */
  pageWrap: {
    padding: `32px ${space.xxl}px 24px`,
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
