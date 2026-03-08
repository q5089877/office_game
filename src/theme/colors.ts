/**
 * 統一的顏色主題系統
 * 為「摸魚辦公室」遊戲定義一致的顏色規範
 */

export const themeColors = {
  // 主色調 - 溫暖的藍紫色調，更柔和協調
  primary: {
    50: '#f5f7ff',
    100: '#e8edff',
    200: '#d0d8ff',
    300: '#a8b6ff',
    400: '#7d8ef9',
    500: '#6366f1', // 主要品牌色保持不變
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#2a2678',
  },

  // 次要色調 - 溫暖的灰色，減少黑白對比
  secondary: {
    50: '#f9fafb',
    100: '#f1f3f5',
    200: '#e4e7eb',
    300: '#cfd4da',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // 成功/綠色 - 稍微調整為更柔和的綠色
  success: {
    50: '#f0fdf6',
    100: '#dcfce9',
    200: '#bbf7d3',
    300: '#86efad',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // 警告/橙色 - 調整為更溫暖的琥珀色
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // 錯誤/紅色 - 調整為更柔和的紅色
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

  // 紫色 - 用於 ESCAPE 卡片
  purple: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // 粉色 - 用於 GOSSIP 卡片
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // 遊戲特定顏色 - 調整為更協調的色調
  game: {
    player: '#4f46e5', // 玩家顏色保持不變
    colleague: '#10b981', // 同事顏色保持不變
    boss: '#dc2626', // 老闆顏色調整為更柔和的紅色
    plant: '#16a34a', // 植物顏色調整為更深的綠色
    cardPrank: '#dc2626', // 惡作劇卡片調整為更柔和的紅色
    cardSlacking: '#3b82f6', // 摸魚卡片保持不變
    cardEscape: '#8b5cf6', // 逃避卡片保持不變
    cardGossip: '#ec4899', // 八卦卡片保持不變
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
 * 使用更溫暖、更協調的中性色，減少純黑純白對比
 */
export const backgroundColors = {
  light: '#f9fafb', // 從純白改為溫暖的淺灰色
  dark: '#111827', // 使用secondary[900]但更一致
  sidebar: themeColors.secondary[50],
  card: themeColors.secondary[800],
  notification: '#1f2937', // 使用secondary[800]作為通知背景
  canvas: '#f1f3f5', // 畫布背景色
  surface: '#ffffff', // 表面元素仍可使用純白
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
 * 更新以匹配新的色彩系統
 */
export const tailwindClasses = {
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    onDark: 'text-gray-50',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
  },

  bg: {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    sidebar: 'bg-gray-50',
    card: 'bg-gray-800',
    notification: 'bg-gray-800',
    canvas: 'bg-gray-100',
    surface: 'bg-white',
  },

  border: {
    light: 'border-gray-200',
    medium: 'border-gray-300',
    dark: 'border-gray-700',
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
