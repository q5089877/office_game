/**
 * 文字縮放管理器
 * 根據裝置尺寸和佈局模式動態調整文字大小
 * 提供一致的文字縮放系統
 */

import { BREAKPOINTS, LayoutMode } from './responsiveConfig';

// 文字類型
export type TextType =
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
  | 'bodyLarge' | 'body' | 'bodySmall' | 'caption' | 'overline'
  | 'buttonLarge' | 'button' | 'buttonSmall'
  | 'inputLarge' | 'input' | 'inputSmall'
  | 'label' | 'helper'
  | 'gameTitle' | 'gameSubtitle' | 'gameBody' | 'gameCaption';

// 文字配置
export interface TextConfig {
  baseSize: number; // 基礎字體大小（像素）
  lineHeight: number; // 行高（倍數）
  letterSpacing: number; // 字間距（像素）
  fontWeight: number | string; // 字重
  fontFamily: string; // 字體家族
  responsive: boolean; // 是否響應式
  minSize: number; // 最小字體大小
  maxSize: number; // 最大字體大小
}

// 文字縮放比例
export interface TextScaleRatios {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
  ultraWide: number;
}

// 預設文字配置
const DEFAULT_TEXT_CONFIGS: Record<TextType, TextConfig> = {
  // 標題
  heading1: {
    baseSize: 48,
    lineHeight: 1.2,
    letterSpacing: -0.5,
    fontWeight: 700,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 32,
    maxSize: 64
  },
  heading2: {
    baseSize: 36,
    lineHeight: 1.3,
    letterSpacing: -0.25,
    fontWeight: 700,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 28,
    maxSize: 48
  },
  heading3: {
    baseSize: 30,
    lineHeight: 1.3,
    letterSpacing: 0,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 24,
    maxSize: 36
  },
  heading4: {
    baseSize: 24,
    lineHeight: 1.4,
    letterSpacing: 0,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 20,
    maxSize: 28
  },
  heading5: {
    baseSize: 20,
    lineHeight: 1.4,
    letterSpacing: 0,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 18,
    maxSize: 24
  },
  heading6: {
    baseSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 14,
    maxSize: 18
  },

  // 正文
  bodyLarge: {
    baseSize: 18,
    lineHeight: 1.6,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 16,
    maxSize: 20
  },
  body: {
    baseSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 14,
    maxSize: 18
  },
  bodySmall: {
    baseSize: 14,
    lineHeight: 1.6,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 12,
    maxSize: 16
  },
  caption: {
    baseSize: 12,
    lineHeight: 1.5,
    letterSpacing: 0.25,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 10,
    maxSize: 14
  },
  overline: {
    baseSize: 10,
    lineHeight: 1.5,
    letterSpacing: 0.5,
    fontWeight: 500,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 8,
    maxSize: 12
  },

  // 按鈕
  buttonLarge: {
    baseSize: 18,
    lineHeight: 1.2,
    letterSpacing: 0.5,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 16,
    maxSize: 20
  },
  button: {
    baseSize: 16,
    lineHeight: 1.2,
    letterSpacing: 0.25,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 14,
    maxSize: 18
  },
  buttonSmall: {
    baseSize: 14,
    lineHeight: 1.2,
    letterSpacing: 0.1,
    fontWeight: 600,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 12,
    maxSize: 16
  },

  // 輸入框
  inputLarge: {
    baseSize: 18,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 16,
    maxSize: 20
  },
  input: {
    baseSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 14,
    maxSize: 18
  },
  inputSmall: {
    baseSize: 14,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 12,
    maxSize: 16
  },

  // 標籤和輔助文字
  label: {
    baseSize: 14,
    lineHeight: 1.4,
    letterSpacing: 0.1,
    fontWeight: 500,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 12,
    maxSize: 16
  },
  helper: {
    baseSize: 12,
    lineHeight: 1.4,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 10,
    maxSize: 14
  },

  // 遊戲特定文字
  gameTitle: {
    baseSize: 40,
    lineHeight: 1.2,
    letterSpacing: -0.5,
    fontWeight: 800,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 28,
    maxSize: 56
  },
  gameSubtitle: {
    baseSize: 24,
    lineHeight: 1.3,
    letterSpacing: -0.25,
    fontWeight: 700,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 20,
    maxSize: 32
  },
  gameBody: {
    baseSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 400,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 14,
    maxSize: 18
  },
  gameCaption: {
    baseSize: 12,
    lineHeight: 1.4,
    letterSpacing: 0.1,
    fontWeight: 500,
    fontFamily: 'inherit',
    responsive: true,
    minSize: 10,
    maxSize: 14
  }
};

// 預設縮放比例
const DEFAULT_SCALE_RATIOS: TextScaleRatios = {
  mobile: 0.85,   // 手機上文字較小
  tablet: 0.95,   // 平板上稍大
  desktop: 1.0,   // 桌面標準
  wide: 1.05,     // 寬螢幕稍大
  ultraWide: 1.1  // 超寬螢幕最大
};

/**
 * 文字縮放管理器
 * 根據裝置尺寸和佈局模式動態調整文字大小
 */
export class TextScaleManager {
  private scaleRatios: TextScaleRatios;
  private customConfigs: Map<TextType, Partial<TextConfig>>;
  private currentLayoutMode: LayoutMode;
  private rootFontSize: number;

  constructor(
    scaleRatios: Partial<TextScaleRatios> = {},
    initialLayoutMode: LayoutMode = 'desktop'
  ) {
    this.scaleRatios = { ...DEFAULT_SCALE_RATIOS, ...scaleRatios };
    this.customConfigs = new Map();
    this.currentLayoutMode = initialLayoutMode;
    this.rootFontSize = this.getRootFontSize();
  }

  /**
   * 獲取根元素字體大小
   */
  private getRootFontSize(): number {
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);
    const fontSize = parseFloat(computedStyle.fontSize);
    return isNaN(fontSize) ? 16 : fontSize;
  }

  /**
   * 設置佈局模式
   */
  public setLayoutMode(layoutMode: LayoutMode): void {
    this.currentLayoutMode = layoutMode;
    this.rootFontSize = this.getRootFontSize();
  }

  /**
   * 設置縮放比例
   */
  public setScaleRatios(ratios: Partial<TextScaleRatios>): void {
    this.scaleRatios = { ...this.scaleRatios, ...ratios };
  }

  /**
   * 註冊自定義文字配置
   */
  public registerCustomConfig(
    type: TextType,
    config: Partial<TextConfig>
  ): void {
    this.customConfigs.set(type, config);
  }

  /**
   * 獲取文字配置
   */
  public getTextConfig(type: TextType): TextConfig {
    const baseConfig = DEFAULT_TEXT_CONFIGS[type];
    const customConfig = this.customConfigs.get(type);

    return {
      ...baseConfig,
      ...customConfig
    };
  }

  /**
   * 計算文字大小
   */
  public calculateFontSize(type: TextType): number {
    const config = this.getTextConfig(type);

    if (!config.responsive) {
      return config.baseSize;
    }

    // 獲取當前縮放比例
    const scaleRatio = this.scaleRatios[this.currentLayoutMode];

    // 計算縮放後的大小
    let scaledSize = config.baseSize * scaleRatio;

    // 應用限制
    scaledSize = Math.max(config.minSize, Math.min(config.maxSize, scaledSize));

    // 根據根字體大小調整（如果使用rem）
    if (this.rootFontSize !== 16) {
      scaledSize = scaledSize * (this.rootFontSize / 16);
    }

    return Math.round(scaledSize * 10) / 10; // 保留一位小數
  }

  /**
   * 計算行高
   */
  public calculateLineHeight(type: TextType, fontSize?: number): number {
    const config = this.getTextConfig(type);
    const actualFontSize = fontSize || this.calculateFontSize(type);

    return Math.round(config.lineHeight * actualFontSize * 10) / 10;
  }

  /**
   * 計算字間距
   */
  public calculateLetterSpacing(type: TextType): number {
    const config = this.getTextConfig(type);
    return config.letterSpacing;
  }

  /**
   * 生成CSS樣式對象
   */
  public generateStyle(type: TextType): React.CSSProperties {
    const fontSize = this.calculateFontSize(type);
    const config = this.getTextConfig(type);

    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${config.lineHeight}`,
      letterSpacing: `${config.letterSpacing}px`,
      fontWeight: config.fontWeight,
      fontFamily: config.fontFamily === 'inherit' ? 'inherit' : config.fontFamily
    };
  }

  /**
   * 生成CSS類別字符串
   */
  public generateClass(type: TextType): string {
    const style = this.generateStyle(type);
    return Object.entries(style)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
  }

  /**
   * 應用文字樣式到元素
   */
  public applyToElement(element: HTMLElement, type: TextType): void {
    const style = this.generateStyle(type);

    Object.entries(style).forEach(([key, value]) => {
      (element.style as any)[key] = value;
    });

    // 添加資料屬性以便追蹤
    element.dataset.textType = type;
    element.dataset.textScaled = 'true';
  }

  /**
   * 批量應用文字樣式
   */
  public applyToElements(elements: HTMLElement[], type: TextType): void {
    elements.forEach(element => this.applyToElement(element, type));
  }

  /**
   * 通過選擇器應用文字樣式
   */
  public applyBySelector(selector: string, type: TextType): void {
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    this.applyToElements(elements, type);
  }

  /**
   * 更新所有已應用樣式的元素
   */
  public updateAllAppliedElements(): void {
    const elements = document.querySelectorAll('[data-text-scaled="true"]') as NodeListOf<HTMLElement>;

    elements.forEach(element => {
      const type = element.dataset.textType as TextType;
      if (type && DEFAULT_TEXT_CONFIGS[type]) {
        this.applyToElement(element, type);
      }
    });
  }

  /**
   * 生成響應式文字CSS變數
   */
  public generateCSSVariables(): string {
    const variables: string[] = [];

    Object.entries(DEFAULT_TEXT_CONFIGS).forEach(([type, config]) => {
      const fontSize = this.calculateFontSize(type as TextType);
      const lineHeight = this.calculateLineHeight(type as TextType, fontSize);

      variables.push(`--text-${type}-size: ${fontSize}px;`);
      variables.push(`--text-${type}-line-height: ${lineHeight}px;`);
      variables.push(`--text-${type}-letter-spacing: ${config.letterSpacing}px;`);
      variables.push(`--text-${type}-weight: ${config.fontWeight};`);
    });

    return `:root {\n  ${variables.join('\n  ')}\n}`;
  }

  /**
   * 將CSS變數應用到文檔
   */
  public applyCSSVariables(): void {
    const styleId = 'text-scale-variables';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = this.generateCSSVariables();
  }

  /**
   * 驗證文字可讀性
   */
  public validateReadability(type: TextType, context: 'mobile' | 'tablet' | 'desktop' = 'desktop'): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const fontSize = this.calculateFontSize(type);
    const config = this.getTextConfig(type);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // WCAG標準檢查
    const minSizeForContext = {
      mobile: 16,   // 手機上最小16px
      tablet: 14,   // 平板上最小14px
      desktop: 12   // 桌面上最小12px
    };

    if (fontSize < minSizeForContext[context]) {
      issues.push(`字體大小過小：${fontSize}px < ${minSizeForContext[context]}px`);
      recommendations.push(`增加字體大小至至少 ${minSizeForContext[context]}px`);
    }

    // 行高檢查（WCAG建議1.5倍）
    if (config.lineHeight < 1.4) {
      issues.push(`行高過小：${config.lineHeight} < 1.4`);
      recommendations.push(`增加行高至至少 1.4`);
    }

    // 字重檢查（對於小文字，字重不應太細）
    if (fontSize < 14 && (config.fontWeight === 300 || config.fontWeight === 'light')) {
      issues.push('小文字使用過細的字重');
      recommendations.push('對於小文字，使用常規或中等字重');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * 生成文字縮放報告
   */
  public generateReport() {
    const scaleRatio = this.scaleRatios[this.currentLayoutMode];
    const textTypes = Object.keys(DEFAULT_TEXT_CONFIGS).map(type => {
      const textType = type as TextType;
      const baseSize = DEFAULT_TEXT_CONFIGS[textType].baseSize;
      const scaledSize = this.calculateFontSize(textType);
      const readability = this.validateReadability(textType, this.currentLayoutMode as any);

      return {
        type: textType,
        baseSize,
        scaledSize,
        readability
      };
    });

    return {
      currentLayoutMode: this.currentLayoutMode,
      scaleRatio,
      textTypes
    };
  }

  /**
   * 靜態方法：創建適合裝置的文字縮放管理器
   */
  static createForDevice(layoutMode: LayoutMode): TextScaleManager {
    const scaleRatios: Partial<TextScaleRatios> = {};

    // 根據佈局模式設置所有模式的縮放比例
    Object.keys(DEFAULT_SCALE_RATIOS).forEach(key => {
      const mode = key as keyof TextScaleRatios;
      if (mode === layoutMode) {
        scaleRatios[mode] = DEFAULT_SCALE_RATIOS[mode];
      } else {
        // 其他模式使用預設值
        scaleRatios[mode] = DEFAULT_SCALE_RATIOS[mode];
      }
    });

    return new TextScaleManager(scaleRatios, layoutMode);
  }

  /**
   * 靜態方法：獲取建議的文字配置
   */
  static getRecommendedConfig(deviceType: 'phone' | 'tablet' | 'desktop'): Partial<TextScaleRatios> {
    switch (deviceType) {
      case 'phone':
        return {
          mobile: 0.9,   // 手機上文字稍大
          tablet: 1.0,
          desktop: 1.1,
          wide: 1.15,
          ultraWide: 1.2
        };
      case 'tablet':
        return {
          mobile: 0.85,
          tablet: 0.95,  // 平板上文字適中
          desktop: 1.05,
          wide: 1.1,
          ultraWide: 1.15
        };
      case 'desktop':
        return {
          mobile: 0.8,
          tablet: 0.9,
          desktop: 1.0,  // 桌面標準
          wide: 1.05,
          ultraWide: 1.1
        };
      default:
        return {};
    }
  }

  /**
   * 靜態方法：快速應用文字樣式
   */
  static applyQuickStyle(element: HTMLElement, type: TextType, layoutMode: LayoutMode = 'desktop'): void {
    const manager = new TextScaleManager({}, layoutMode);
    manager.applyToElement(element, type);
  }

  /**
   * 靜態方法：生成全域CSS變數
   */
  static generateGlobalCSSVariables(layoutMode: LayoutMode = 'desktop'): string {
    const manager = new TextScaleManager({}, layoutMode);
    return manager.generateCSSVariables();
  }
}
