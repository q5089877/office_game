/**
 * 統一的顏色主題系統
 * 為「摸魚辦公室」遊戲定義一致的顏色規範
 */

export const themeColors = {
  // 主色調
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // 主要品牌色
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // 次要色調
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // 成功/綠色
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // 警告/橙色
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // 錯誤/紅色
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // 遊戲特定顏色
  game: {
    player: '#4f46e5', // 玩家顏色
    colleague: '#10b981', // 同事顏色
    boss: '#ef4444', // 老闆顏色
    plant: '#22c55e', // 植物顏色
    cardPrank: '#ef4444', // 惡作劇卡片
    cardSlacking: '#3b82f6', // 摸魚卡片
    cardEscape: '#8b5cf6', // 逃避卡片
    cardGossip: '#ec4899', // 八卦卡片
  },
};

/**
 * 文字顏色主題
 */
export const textColors = {
  primary: themeColors.secondary[900], // 主要文字
  secondary: themeColors.secondary[600], // 次要文字
  muted: themeColors.secondary[400], // 弱化文字
  onDark: '#f8fafc', // 深色背景上的文字
  success: themeColors.success[600],
  warning: themeColors.warning[600],
  error: themeColors.error[600],
};

/**
 * 背景顏色主題
 */
export const backgroundColors = {
  light: '#ffffff',
  dark: themeColors.secondary[900],
  sidebar: themeColors.secondary[50],
  card: themeColors.secondary[800],
  notification: themeColors.secondary[950] || '#030712',
};

/**
 * 邊框顏色主題
 */
export const borderColors = {
  light: themeColors.secondary[200],
  medium: themeColors.secondary[300],
  dark: themeColors.secondary[700],
  focus: themeColors.primary[500],
};

/**
 * 陰影顏色主題
 */
export const shadowColors = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  primary: `0 0 15px ${themeColors.primary[500]}20`,
  success: `0 0 15px ${themeColors.success[500]}20`,
  error: `0 0 15px ${themeColors.error[500]}20`,
};

/**
 * 獲取Tailwind CSS類名對應
 */
export const tailwindClasses = {
  text: {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-400',
    onDark: 'text-slate-50',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-rose-600',
  },

  bg: {
    light: 'bg-white',
    dark: 'bg-slate-900',
    sidebar: 'bg-slate-50',
    card: 'bg-slate-800',
    notification: 'bg-slate-950',
  },

  border: {
    light: 'border-slate-200',
    medium: 'border-slate-300',
    dark: 'border-slate-700',
    focus: 'border-indigo-500',
  },
};

export default {
  themeColors,
  textColors,
  backgroundColors,
  borderColors,
  shadowColors,
  tailwindClasses,
};
