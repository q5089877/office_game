/**
 * 色彩一致性驗證工具
 * 用於檢查和驗證應用程式中的色彩使用是否一致
 */

import { themeColors, textColors, backgroundColors, borderColors } from './colors';
import { getThemeColor, getStressColor, getChaosColor, getCardColor } from './colorUtils';

/**
 * 色彩驗證結果介面
 */
interface ColorValidationResult {
  component: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

/**
 * 色彩對比度檢查結果
 */
interface ContrastRatioResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

/**
 * 驗證整個應用程式的色彩一致性
 */
export const validateColorConsistency = (): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];

  // 檢查硬編碼顏色值
  results.push(...checkHardcodedColors());

  // 檢查色彩對比度
  results.push(...checkContrastRatios());

  // 檢查語義化色彩使用
  results.push(...checkSemanticColorUsage());

  // 檢查層級系統使用
  results.push(...checkColorLevelUsage());

  return results;
};

/**
 * 檢查是否有硬編碼的顏色值
 */
const checkHardcodedColors = (): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];

  // 常見的硬編碼顏色模式
  const hardcodedPatterns = [
    { pattern: /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g, description: '十六進位顏色值' },
    { pattern: /rgb\(/g, description: 'RGB顏色值' },
    { pattern: /rgba\(/g, description: 'RGBA顏色值' },
    { pattern: /hsl\(/g, description: 'HSL顏色值' },
  ];

  // 這裡可以擴展為實際掃描檔案
  // 目前僅提供範例檢查

  return results;
};

/**
 * 檢查色彩對比度
 */
const checkContrastRatios = (): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];

  // 檢查主要文字對比度
  const primaryTextContrast = calculateContrastRatio(textColors.primary, backgroundColors.light);
  if (!primaryTextContrast.passesAA) {
    results.push({
      component: '全域文字',
      issue: `主要文字對比度不足 (${primaryTextContrast.ratio.toFixed(2)}:1)`,
      severity: 'high',
      recommendation: '考慮使用更深的主要文字顏色或更淺的背景顏色'
    });
  }

  // 檢查次要文字對比度
  const secondaryTextContrast = calculateContrastRatio(textColors.secondary, backgroundColors.light);
  if (!secondaryTextContrast.passesAA) {
    results.push({
      component: '全域文字',
      issue: `次要文字對比度不足 (${secondaryTextContrast.ratio.toFixed(2)}:1)`,
      severity: 'medium',
      recommendation: '考慮調整次要文字顏色以改善可讀性'
    });
  }

  // 檢查深色模式文字對比度
  const darkTextContrast = calculateContrastRatio(textColors.onDark, backgroundColors.dark);
  if (!darkTextContrast.passesAA) {
    results.push({
      component: '深色模式文字',
      issue: `深色模式文字對比度不足 (${darkTextContrast.ratio.toFixed(2)}:1)`,
      severity: 'high',
      recommendation: '調整深色模式文字顏色以確保可讀性'
    });
  }

  // 檢查畫布背景對比度
  const canvasTextContrast = calculateContrastRatio(textColors.primary, backgroundColors.canvas);
  if (!canvasTextContrast.passesAA) {
    results.push({
      component: '畫布區域文字',
      issue: `畫布文字對比度不足 (${canvasTextContrast.ratio.toFixed(2)}:1)`,
      severity: 'medium',
      recommendation: '調整畫布背景或文字顏色以改善可讀性'
    });
  }

  return results;
};

/**
 * 檢查語義化色彩使用
 */
const checkSemanticColorUsage = (): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];

  // 檢查壓力顏色函數
  const stressColors = [
    { level: 10, expected: themeColors.success[500] },
    { level: 50, expected: themeColors.warning[500] },
    { level: 70, expected: themeColors.warning[700] },
    { level: 90, expected: themeColors.error[600] },
  ];

  stressColors.forEach(({ level, expected }) => {
    const actual = getStressColor(level);
    if (actual !== expected) {
      results.push({
        component: '壓力顏色函數',
        issue: `壓力等級 ${level} 的顏色不符合預期`,
        severity: 'medium',
        recommendation: '檢查 getStressColor 函數的實作'
      });
    }
  });

  return results;
};

/**
 * 檢查層級系統使用
 */
const checkColorLevelUsage = (): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];

  // 檢查所有顏色層級是否都存在
  const colorCategories = ['primary', 'secondary', 'success', 'warning', 'error'] as const;

  colorCategories.forEach(category => {
    const shades = themeColors[category];
    const requiredLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

    requiredLevels.forEach(level => {
      if (!shades[level as keyof typeof shades]) {
        results.push({
          component: '色彩系統',
          issue: `${category} 顏色缺少層級 ${level}`,
          severity: 'low',
          recommendation: '補齊所有顏色層級以確保一致性'
        });
      }
    });
  });

  return results;
};

/**
 * 計算兩個顏色的對比度比率
 * 使用WCAG 2.1對比度計算公式
 */
export const calculateContrastRatio = (foreground: string, background: string): ContrastRatioResult => {
  // 簡化的對比度計算（實際應使用完整的相對亮度計算）
  // 這裡使用近似值進行示範

  // 將十六進位顏色轉換為RGB
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return {
      foreground,
      background,
      ratio: 1,
      passesAA: false,
      passesAAA: false,
    };
  }

  // 計算相對亮度
  const fgLuminance = calculateRelativeLuminance(fg);
  const bgLuminance = calculateRelativeLuminance(bg);

  // 計算對比度比率
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG標準
  const passesAA = ratio >= 4.5; // 正常文字
  const passesAAA = ratio >= 7; // 高標準文字

  return {
    foreground,
    background,
    ratio,
    passesAA,
    passesAAA,
  };
};

/**
 * 將十六進位顏色轉換為RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // 移除#前綴
  const cleanHex = hex.replace('#', '');

  // 處理3位或6位十六進位
  let r: number, g: number, b: number;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return null;
  }

  return { r, g, b };
};

/**
 * 計算相對亮度（WCAG 2.1公式）
 */
const calculateRelativeLuminance = (rgb: { r: number; g: number; b: number }): number => {
  const { r, g, b } = rgb;

  // 將sRGB轉換為線性RGB
  const RsRGB = r / 255;
  const GsRGB = g / 255;
  const BsRGB = b / 255;

  const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
  const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
  const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);

  // 計算相對亮度
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * 生成色彩使用報告
 */
export const generateColorReport = () => {
  const validationResults = validateColorConsistency();

  console.log('=== 色彩一致性驗證報告 ===');
  console.log(`檢查時間: ${new Date().toLocaleString()}`);
  console.log(`總檢查項目: ${validationResults.length}`);

  const highIssues = validationResults.filter(r => r.severity === 'high');
  const mediumIssues = validationResults.filter(r => r.severity === 'medium');
  const lowIssues = validationResults.filter(r => r.severity === 'low');

  console.log(`\n嚴重問題: ${highIssues.length}`);
  highIssues.forEach(issue => {
    console.log(`  [高] ${issue.component}: ${issue.issue}`);
    console.log(`      建議: ${issue.recommendation}`);
  });

  console.log(`\n中等問題: ${mediumIssues.length}`);
  mediumIssues.forEach(issue => {
    console.log(`  [中] ${issue.component}: ${issue.issue}`);
    console.log(`      建議: ${issue.recommendation}`);
  });

  console.log(`\n輕微問題: ${lowIssues.length}`);
  lowIssues.forEach(issue => {
    console.log(`  [低] ${issue.component}: ${issue.issue}`);
    console.log(`      建議: ${issue.recommendation}`);
  });

  // 對比度檢查
  console.log('\n=== 對比度檢查 ===');

  const contrastChecks = [
    { name: '主要文字/淺色背景', fg: textColors.primary, bg: backgroundColors.light },
    { name: '次要文字/淺色背景', fg: textColors.secondary, bg: backgroundColors.light },
    { name: '深色模式文字/深色背景', fg: textColors.onDark, bg: backgroundColors.dark },
    { name: '成功文字/淺色背景', fg: textColors.success, bg: backgroundColors.light },
    { name: '錯誤文字/淺色背景', fg: textColors.error, bg: backgroundColors.light },
  ];

  contrastChecks.forEach(check => {
    const result = calculateContrastRatio(check.fg, check.bg);
    console.log(`${check.name}: ${result.ratio.toFixed(2)}:1 (AA: ${result.passesAA ? '✓' : '✗'}, AAA: ${result.passesAAA ? '✓' : '✗'})`);
  });

  return {
    totalIssues: validationResults.length,
    highIssues: highIssues.length,
    mediumIssues: mediumIssues.length,
    lowIssues: lowIssues.length,
    validationResults,
  };
};

/**
 * 檢查特定元件的色彩使用
 */
export const checkComponentColors = (componentName: string, colorUsage: Record<string, string>) => {
  const results: ColorValidationResult[] = [];

  Object.entries(colorUsage).forEach(([element, color]) => {
    // 檢查是否使用主題顏色
    const isThemeColor = Object.values(themeColors).some(shades =>
      typeof shades === 'object' && Object.values(shades).includes(color)
    ) || Object.values(textColors).includes(color)
      || Object.values(backgroundColors).includes(color)
      || Object.values(borderColors).includes(color);

    if (!isThemeColor && color.startsWith('#')) {
      results.push({
        component: componentName,
        issue: `${element} 使用硬編碼顏色: ${color}`,
        severity: 'medium',
        recommendation: '改用主題顏色系統中的顏色'
      });
    }
  });

  return results;
};

// 匯出預設驗證函數
export default {
  validateColorConsistency,
  calculateContrastRatio,
  generateColorReport,
  checkComponentColors,
};
