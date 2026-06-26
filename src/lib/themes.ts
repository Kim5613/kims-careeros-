export interface Theme {
  id: string;
  logo: string;
  name: string;
  primaryColor: string;
  sidebarBg: string;
  accentColor: string;
}

export const themes: Theme[] = [
  {
    id: '01',
    logo: '/logos/logo_01_奢华金.svg',
    name: '奢华金',
    primaryColor: '#d4a017',
    sidebarBg: '#1a1408',
    accentColor: '#d4a017',
  },
  {
    id: '03',
    logo: '/logos/logo_03_3D立体.svg',
    name: '3D 立体',
    primaryColor: '#1677ff',
    sidebarBg: '#141428',
    accentColor: '#1677ff',
  },
  {
    id: '04',
    logo: '/logos/logo_04_玫瑰金.svg',
    name: '玫瑰金',
    primaryColor: '#c48b6d',
    sidebarBg: '#2d1f1a',
    accentColor: '#c48b6d',
  },
  {
    id: '05',
    logo: '/logos/logo_05_彩虹活力.svg',
    name: '彩虹活力',
    primaryColor: '#ff3b3b',
    sidebarBg: '#1a0a0a',
    accentColor: '#ff6b35',
  },
  {
    id: '06',
    logo: '/logos/logo_06_双色描边.svg',
    name: '双色描边',
    primaryColor: '#2a3a80',
    sidebarBg: '#0a0e1a',
    accentColor: '#2a3a80',
  },
  {
    id: '07',
    logo: '/logos/logo_07_镂空线条.svg',
    name: '镂空线条',
    primaryColor: '#1a1a1a',
    sidebarBg: '#0d0d0d',
    accentColor: '#333',
  },
  {
    id: '08',
    logo: '/logos/logo_08_深邃蓝.svg',
    name: '深邃蓝',
    primaryColor: '#1a3a6e',
    sidebarBg: '#0a1628',
    accentColor: '#1a3a6e',
  },
  {
    id: '09',
    logo: '/logos/logo_09_能量橙.svg',
    name: '能量橙',
    primaryColor: '#ff6b35',
    sidebarBg: '#1c0f08',
    accentColor: '#ff6b35',
  },
  {
    id: '10',
    logo: '/logos/logo_10_潮流错位.svg',
    name: '潮流错位',
    primaryColor: '#ff2850',
    sidebarBg: '#140010',
    accentColor: '#2890ff',
  },
  {
    id: 'B',
    logo: '/logos/logo_B_3D立体_透明底.svg',
    name: '3D 透',
    primaryColor: '#202035',
    sidebarBg: '#121220',
    accentColor: '#404060',
  },
  {
    id: 'C',
    logo: '/logos/logo_C_玫瑰金_透明底.svg',
    name: '玫瑰金透',
    primaryColor: '#d4a574',
    sidebarBg: '#1c1410',
    accentColor: '#d4a574',
  },
  {
    id: 'D',
    logo: '/logos/logo_D_镂空线条_透明底.svg',
    name: '镂空透',
    primaryColor: '#1a1a1a',
    sidebarBg: '#fff',
    accentColor: '#1a1a1a',
  },
  {
    id: 'E',
    logo: '/logos/logo_E_深邃蓝_透明底.svg',
    name: '深邃蓝透',
    primaryColor: '#1a3a6e',
    sidebarBg: '#0a1628',
    accentColor: '#1a3a6e',
  },
  {
    id: 'F',
    logo: '/logos/logo_F_水墨书法.svg',
    name: '水墨书法',
    primaryColor: '#1a1410',
    sidebarBg: '#f5f0eb',
    accentColor: '#1a1410',
  },
  {
    id: 'G',
    logo: '/logos/logo_G_液态金属.svg',
    name: '液态金属',
    primaryColor: '#7b8c9e',
    sidebarBg: '#1a1d21',
    accentColor: '#7b8c9e',
  },
  {
    id: 'H',
    logo: '/logos/logo_H_涂鸦喷漆.svg',
    name: '涂鸦喷漆',
    primaryColor: '#ffe028',
    sidebarBg: '#1c1808',
    accentColor: '#ffe028',
  },
  {
    id: 'I',
    logo: '/logos/logo_I_水彩晕染.svg',
    name: '水彩晕染',
    primaryColor: '#2a2040',
    sidebarBg: '#f0edf5',
    accentColor: '#2a2040',
  },
  {
    id: 'J',
    logo: '/logos/logo_J_极简线条.svg',
    name: '极简线条',
    primaryColor: '#151520',
    sidebarBg: '#fff',
    accentColor: '#151520',
  },
];

export function getRandomTheme(): Theme {
  return themes[Math.floor(Math.random() * themes.length)];
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return themes[0];
  const stored = localStorage.getItem('careeros-theme');
  if (stored) {
    const found = themes.find((t) => t.id === stored);
    if (found) return found;
  }
  const random = getRandomTheme();
  localStorage.setItem('careeros-theme', random.id);
  return random;
}
