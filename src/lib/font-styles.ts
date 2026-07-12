export const FONT_STYLES = [
  { name: '经典衬线', family: 'Georgia, "Times New Roman", serif', color: '#2c3e50', weight: 400, style: 'normal' as const, transform: 'none' },
  { name: '优雅斜体', family: '"Palatino Linotype", "Book Antiqua", Palatino, serif', color: '#8b6f47', weight: 400, style: 'italic' as const, transform: 'none' },
  { name: '花体手写', family: '"Brush Script MT", "Lucida Handwriting", "Segoe Script", cursive', color: '#c0392b', weight: 400, style: 'normal' as const, transform: 'none' },
  { name: '等宽极简', family: '"Courier New", "Consolas", monospace', color: '#1a1a1a', weight: 300, style: 'normal' as const, transform: 'uppercase' },
  { name: '现代无衬线', family: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#3498db', weight: 700, style: 'normal' as const, transform: 'none' },
  { name: '粗体冲击', family: '"Arial Black", "Impact", sans-serif', color: '#e74c3c', weight: 900, style: 'normal' as const, transform: 'uppercase' },
  { name: '复古打字机', family: '"Courier New", Courier, monospace', color: '#5d4e37', weight: 400, style: 'italic' as const, transform: 'none' },
  { name: '轻盈细体', family: '"Segoe UI", "Helvetica Neue", sans-serif', color: '#95a5a6', weight: 100, style: 'normal' as const, transform: 'none' },
  { name: '紫色梦幻', family: '"Trebuchet MS", "Lucida Sans", sans-serif', color: '#8e44ad', weight: 600, style: 'italic' as const, transform: 'none' },
  { name: '金色奢华', family: 'Georgia, "Times New Roman", serif', color: '#d4a017', weight: 700, style: 'normal' as const, transform: 'none' },
  { name: '玫瑰粉金', family: '"Garamond", "Palatino", serif', color: '#c48b6d', weight: 400, style: 'italic' as const, transform: 'none' },
  { name: '深蓝学院', family: '"Book Antiqua", Palatino, serif', color: '#1a3a6e', weight: 600, style: 'normal' as const, transform: 'none' },
  { name: '涂鸦艺术', family: '"Comic Sans MS", "Segoe Print", cursive', color: '#ff6b35', weight: 700, style: 'normal' as const, transform: 'none' },
  { name: '水墨丹青', family: '"Microsoft YaHei", "SimHei", sans-serif', color: '#1a1410', weight: 300, style: 'normal' as const, transform: 'none' },
  { name: '翡翠绿意', family: '"Lucida Sans", "Trebuchet MS", sans-serif', color: '#16a085', weight: 500, style: 'italic' as const, transform: 'none' },
  { name: '钻石银灰', family: '"Segoe UI Light", "Helvetica Neue", sans-serif', color: '#7f8c8d', weight: 200, style: 'normal' as const, transform: 'uppercase' },
];

export type FontStyle = typeof FONT_STYLES[number];

export function getStoredFontIdx(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('careeros-font');
  return stored ? parseInt(stored) : Math.floor(Math.random() * FONT_STYLES.length);
}
