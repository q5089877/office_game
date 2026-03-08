/**
 * 色彩統一性工具函數
 * 提供一致化的色彩使用方式，確保整個應用程式的視覺一致性
 */

import { themeColors, textColors, backgroundColors, borderColors, shadowColors, tailwindClasses } from './colors';

/**
 * 色彩使用指南：
 * 1. 優先使用主題顏色常數，避免硬編碼顏色值
 * 2. 使用層級系統：50(最淺) ~ 900(最深)
 * 3. 遵循語義化命名：primary, secondary, success, warning, error
 * 4. 遊戲特定顏色使用 game 物件
 */

/**
 * 獲取主題顏色
 */
export const getThemeColor = {
  // 主色調
  primary: (level: number = 500) => themeColors.primary[level as keyof typeof themeColors.primary],
  secondary: (level: number = 500) => themeColors.secondary[level as keyof typeof themeColors.secondary],
  success: (level: number = 500) => themeColors.success[level as keyof typeof themeColors.success],
  warning: (level: number = 500) => themeColors.warning[level as keyof typeof themeColors.warning],
  error: (level: number = 500) => themeColors.error[level as keyof typeof themeColors.error],

  // 遊戲特定顏色
  game: {
    player: () => themeColors.game.player,
    colleague: () => themeColors.game.colleague,
    boss: () => themeColors.game.boss,
    plant: () => themeColors.game.plant,
    cardPrank: () => themeColors.game.cardPrank,
    cardSlacking: () => themeColors.game.cardSlacking,
    cardEscape: () => themeColors.game.cardEscape,
    cardGossip: () => themeColors.game.cardGossip,
  },

  // 文字顏色
  text: {
    primary: () => textColors.primary,
    secondary: () => textColors.secondary,
    muted: () => textColors.muted,
    onDark: () => textColors.onDark,
    success: () => textColors.success,
    warning: () => textColors.warning,
    error: () => textColors.error,
  },

  // 背景顏色
  background: {
    light: () => backgroundColors.light,
    dark: () => backgroundColors.dark,
    sidebar: () => backgroundColors.sidebar,
    card: () => backgroundColors.card,
    notification: () => backgroundColors.notification,
    canvas: () => backgroundColors.canvas,
    surface: () => backgroundColors.surface,
  },

  // 邊框顏色
  border: {
    light: () => borderColors.light,
    medium: () => borderColors.medium,
    dark: () => borderColors.dark,
    focus: () => borderColors.focus,
  },

  // 陰影顏色
  shadow: {
    sm: () => shadowColors.sm,
    md: () => shadowColors.md,
    lg: () => shadowColors.lg,
    xl: () => shadowColors.xl,
    primary: () => shadowColors.primary,
    success: () => shadowColors.success,
    error: () => shadowColors.error,
  },
};

/**
 * 獲取Tailwind CSS類名
 * 用於在JSX中直接使用
 */
export const tw = tailwindClasses;

/**
 * 根據卡片類型獲取對應顏色
 */
export const getCardColor = (cardType: string) => {
  switch (cardType) {
    case 'PRANK':
      return {
        bg: themeColors.error[100],
        text: themeColors.error[700],
        border: themeColors.error[300],
        shadow: shadowColors.error,
        tailwind: {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-300',
        }
      };
    case 'SLACKING':
      return {
        bg: themeColors.primary[100],
        text: themeColors.primary[700],
        border: themeColors.primary[300],
        shadow: shadowColors.primary,
        tailwind: {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-300',
        }
      };
    case 'ESCAPE':
      return {
        bg: (themeColors as any).purple[50],
        text: (themeColors as any).purple[700],
        border: (themeColors as any).purple[300],
        shadow: `0 0 15px ${(themeColors as any).purple[500]}20`,
        tailwind: {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-300',
        }
      };
    case 'GOSSIP':
      return {
        bg: (themeColors as any).pink[50],
        text: (themeColors as any).pink[700],
        border: (themeColors as any).pink[300],
        shadow: `0 0 15px ${(themeColors as any).pink[500]}20`,
        tailwind: {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-300',
        }
      };
    default:
      return {
        bg: themeColors.secondary[100],
        text: themeColors.secondary[700],
        border: themeColors.secondary[300],
        shadow: shadowColors.md,
        tailwind: {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-300',
        }
      };
  }
};

/**
 * 根據壓力等級獲取顏色
 */
export const getStressColor = (stressLevel: number) => {
  if (stressLevel <= 30) return themeColors.success[500];
  if (stressLevel <= 60) return themeColors.warning[500];
  if (stressLevel <= 80) return themeColors.warning[700];
  return themeColors.error[600];
};

/**
 * 根據壓力等級獲取Tailwind類名
 */
export const getStressColorClass = (stressLevel: number) => {
  if (stressLevel <= 30) return 'text-emerald-500';
  if (stressLevel <= 60) return 'text-amber-500';
  if (stressLevel <= 80) return 'text-amber-700';
  return 'text-rose-600';
};

/**
 * 根據混亂度獲取顏色
 */
export const getChaosColor = (chaosLevel: number) => {
  if (chaosLevel <= 30) return themeColors.success[400];
  if (chaosLevel <= 60) return themeColors.warning[400];
  return themeColors.error[500];
};

/**
 * 根據混亂度獲取Tailwind類名
 */
export const getChaosColorClass = (chaosLevel: number) => {
  if (chaosLevel <= 30) return 'text-emerald-400';
  if (chaosLevel <= 60) return 'text-amber-400';
  return 'text-rose-500';
};

/**
 * 生成CSS變數字串
 */
export const generateCSSVariables = () => {
  const variables: Record<string, string> = {};

  // 主色調 - 處理物件類型的顏色
  Object.entries(themeColors).forEach(([category, shades]) => {
    if (typeof shades === 'object' && shades !== null && !Array.isArray(shades)) {
      Object.entries(shades).forEach(([level, color]) => {
        if (typeof color === 'string') {
          variables[`--color-${category}-${level}`] = color;
        }
      });
    }
  });

  // 文字顏色
  Object.entries(textColors).forEach(([name, color]) => {
    variables[`--text-${name}`] = color;
  });

  // 背景顏色
  Object.entries(backgroundColors).forEach(([name, color]) => {
    variables[`--bg-${name}`] = color;
  });

  // 邊框顏色
  Object.entries(borderColors).forEach(([name, color]) => {
    variables[`--border-${name}`] = color;
  });

  return variables;
};

/**
 * 將CSS變數應用於元素
 */
export const applyCSSVariables = (element: HTMLElement) => {
  const variables = generateCSSVariables();
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
};

/**
 * 獲取通知類型對應的顏色 - Light主題版本
 */
export const getNotificationColor = (notification: string) => {
  if (notification.includes("❌") || notification.includes("⚠️")) {
    return {
      text: 'text-rose-700',
      bg: 'bg-rose-100',
      border: 'border-rose-300',
    };
  }
  if (notification.includes("💰")) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
    };
  }
  return {
    text: 'text-indigo-700',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
  };
};

export default {
  getThemeColor,
  tw,
  getCardColor,
  getStressColor,
  getStressColorClass,
  getChaosColor,
  getChaosColorClass,
  getNotificationColor,
  generateCSSVariables,
  applyCSSVariables,
};
