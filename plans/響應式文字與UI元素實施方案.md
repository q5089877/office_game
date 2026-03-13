# 響應式文字與UI元素實施方案

## 概述
本方案旨在實現完全響應式的文字系統和UI元素，確保在不同裝置和螢幕尺寸上都能提供最佳的可讀性和視覺體驗。

## 設計原則

### 1. 可讀性優先 (Readability First)
- 確保文字在所有裝置上清晰可讀
- 適當的行高和字間距
- 足夠的色彩對比度

### 2. 比例縮放 (Proportional Scaling)
- 文字大小與螢幕尺寸成比例
- 間距和邊距隨文字大小調整
- 保持視覺層級結構

### 3. 裝置適配 (Device Adaptation)
- 針對不同裝置優化文字大小
- 考慮觀看距離（手機近，桌面遠）
- 適應不同的像素密度

## 實施方案

### 1. 響應式文字系統

#### 文字配置管理器 (`src/utils/TextScaleManager.ts`)
```typescript
export class TextScaleManager {
  // 基礎文字大小配置（單位：rem）
  private static readonly BASE_CONFIG = {
    MOBILE: {
      base: 0.875,    // 14px (假設根元素16px)
      scaleFactor: 1.0,
      lineHeight: 1.5,
      letterSpacing: 'normal'
    },
    TABLET: {
      base: 0.9375,   // 15px
      scaleFactor: 1.1,
      lineHeight: 1.5,
      letterSpacing: 'normal'
    },
    DESKTOP: {
      base: 1.0,      // 16px
      scaleFactor: 1.2,
      lineHeight: 1.6,
      letterSpacing: 'normal'
    },
    WIDE: {
      base: 1.0625,   // 17px
      scaleFactor: 1.3,
      lineHeight: 1.6,
      letterSpacing: '-0.01em'
    },
    ULTRA_WIDE: {
      base: 1.125,    // 18px
      scaleFactor: 1.4,
      lineHeight: 1.7,
      letterSpacing: '-0.01em'
    }
  };

  // 文字層級配置
  private static readonly TEXT_LEVELS = {
    display: { mobile: 3.0, tablet: 3.25, desktop: 3.5, wide: 3.75, ultraWide: 4.0 },
    h1: { mobile: 2.25, tablet: 2.5, desktop: 2.75, wide: 3.0, ultraWide: 3.25 },
    h2: { mobile: 1.875, tablet: 2.0, desktop: 2.25, wide: 2.5, ultraWide: 2.75 },
    h3: { mobile: 1.5, tablet: 1.625, desktop: 1.75, wide: 2.0, ultraWide: 2.25 },
    h4: { mobile: 1.25, tablet: 1.375, desktop: 1.5, wide: 1.625, ultraWide: 1.75 },
    h5: { mobile: 1.125, tablet: 1.25, desktop: 1.375, wide: 1.5, ultraWide: 1.625 },
    h6: { mobile: 1.0, tablet: 1.125, desktop: 1.25, wide: 1.375, ultraWide: 1.5 },
    body: { mobile: 1.0, tablet: 1.0, desktop: 1.0, wide: 1.0, ultraWide: 1.0 },
    small: { mobile: 0.875, tablet: 0.875, desktop: 0.875, wide: 0.875, ultraWide: 0.875 },
    caption: { mobile: 0.75, tablet: 0.75, desktop: 0.75, wide: 0.75, ultraWide: 0.75 }
  };

  // 字體家族配置
  private static readonly FONT_FAMILIES = {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    serif: '"Cormorant Garamond", serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'
  };

  // 字重配置
  private static readonly FONT_WEIGHTS = {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  };

  /**
   * 獲取文字樣式
   */
  static getTextStyle(
    level: keyof typeof this.TEXT_LEVELS,
    layoutMode: LayoutMode,
    options: TextStyleOptions = {}
  ): TextStyle {
    const config = this.BASE_CONFIG[layoutMode.toUpperCase() as keyof typeof this.BASE_CONFIG];
    const levelConfig = this.TEXT_LEVELS[level];
    const scale = levelConfig[layoutMode.toLowerCase() as keyof typeof levelConfig.mobile];

    // 計算實際字體大小
    const fontSize = config.base * scale;

    return {
      fontSize: `${fontSize}rem`,
      lineHeight: config.lineHeight,
      letterSpacing: config.letterSpacing,
      fontFamily: options.fontFamily || this.FONT_FAMILIES.sans,
      fontWeight: options.fontWeight || this.FONT_WEIGHTS.normal,
      fontStyle: options.fontStyle || 'normal',
      textTransform: options.textTransform || 'none',
      color: options.color || 'inherit'
    };
  }

  /**
   * 應用響應式文字樣式到元素
   */
  static applyTextStyle(
    element: HTMLElement,
    level: keyof typeof this.TEXT_LEVELS,
    layoutMode: LayoutMode,
    options: TextStyleOptions = {}
  ): void {
    const style = this.getTextStyle(level, layoutMode, options);

    Object.entries(style).forEach(([property, value]) => {
      if (value !== undefined) {
        element.style[property as any] = value;
      }
    });

    // 添加CSS類別以便於樣式覆蓋
    element.classList.add(`text-${level}`);
    element.classList.add(`text-responsive`);
  }

  /**
   * 批量更新文字樣式
   */
  static updateAllTextStyles(layoutMode: LayoutMode): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-text-level]');

    elements.forEach(element => {
      const level = element.getAttribute('data-text-level') as keyof typeof this.TEXT_LEVELS;
      const options: TextStyleOptions = {};

      // 從data屬性讀取選項
      const fontFamily = element.getAttribute('data-font-family');
      const fontWeight = element.getAttribute('data-font-weight');

      if (fontFamily) options.fontFamily = fontFamily;
      if (fontWeight) options.fontWeight = parseInt(fontWeight) as any;

      this.applyTextStyle(element, level, layoutMode, options);
    });
  }

  /**
   * 創建響應式文字組件
   */
  static createResponsiveText(
    text: string,
    level: keyof typeof this.TEXT_LEVELS,
    layoutMode: LayoutMode,
    options: TextStyleOptions & { tag?: keyof HTMLElementTagNameMap } = {}
  ): HTMLElement {
    const tag = options.tag || this.getDefaultTag(level);
    const element = document.createElement(tag);
    element.textContent = text;

    // 設置data屬性
    element.setAttribute('data-text-level', level);
    if (options.fontFamily) element.setAttribute('data-font-family', options.fontFamily);
    if (options.fontWeight) element.setAttribute('data-font-weight', options.fontWeight.toString());

    // 應用樣式
    this.applyTextStyle(element, level, layoutMode, options);

    return element;
  }

  /**
   * 獲取預設的HTML標籤
   */
  private static getDefaultTag(level: keyof typeof this.TEXT_LEVELS): keyof HTMLElementTagNameMap {
    const tagMap: Record<keyof typeof this.TEXT_LEVELS, keyof HTMLElementTagNameMap> = {
      display: 'h1',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      body: 'p',
      small: 'small',
      caption: 'span'
    };

    return tagMap[level] || 'span';
  }

  /**
   * 計算最佳行長（字符數）
   */
  static getOptimalLineLength(layoutMode: LayoutMode): number {
    const lineLengths = {
      MOBILE: 45,    // 手機：較短行長
      TABLET: 60,    // 平板：中等行長
      DESKTOP: 75,   // 桌面：標準行長
      WIDE: 85,      // 寬螢幕：較長行長
      ULTRA_WIDE: 95 // 超寬螢幕：更長行長
    };

    return lineLengths[layoutMode.toUpperCase() as keyof typeof lineLengths];
  }

  /**
   * 檢查文字對比度
   */
  static checkContrastRatio(foreground: string, background: string): number {
    // 簡化的對比度計算（實際實現應使用完整的WCAG算法）
    // 這裡返回一個模擬值
    return 4.5; // 假設符合AA標準
  }
}

// 類型定義
interface TextStyleOptions {
  fontFamily?: string;
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  color?: string;
}

interface TextStyle {
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  fontFamily: string;
  fontWeight: number | string;
  fontStyle: string;
  textTransform: string;
  color: string;
}
```

### 2. Tailwind CSS響應式文字類別

#### 擴展Tailwind配置 (`tailwind.config.js` 或透過 `@theme` 指令)
```css
/* 在 src/index.css 中添加 */
@theme {
  /* 響應式文字大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  --text-7xl: 4.5rem;    /* 72px */
  --text-8xl: 6rem;      /* 96px */
  --text-9xl: 8rem;      /* 128px */

  /* 響應式行高 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* 響應式字間距 */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}

/* 響應式文字工具類別 */
.text-responsive-xs { font-size: var(--text-xs); }
.text-responsive-sm { font-size: var(--text-sm); }
.text-responsive-base { font-size: var(--text-base); }
.text-responsive-lg { font-size: var(--text-lg); }
.text-responsive-xl { font-size: var(--text-xl); }

/* 裝置特定的文字類別 */
@media (max-width: 767px) {
  .mobile\:text-xs { font-size: 0.75rem; }
  .mobile\:text-sm { font-size: 0.875rem; }
  .mobile\:text-base { font-size: 1rem; }
  .mobile\:text-lg { font-size: 1.125rem; }
  .mobile\:text-xl { font-size: 1.25rem; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .tablet\:text-xs { font-size: 0.75rem; }
  .tablet\:text-sm { font-size: 0.875rem; }
  .tablet\:text-base { font-size: 1rem; }
  .tablet\:text-lg { font-size: 1.125rem; }
  .tablet\:text-xl { font-size: 1.25rem; }
}

@media (min-width: 1024px) {
  .desktop\:text-xs { font-size: 0.75rem; }
  .desktop\:text-sm { font-size: 0.875rem; }
  .desktop\:text-base { font-size: 1rem; }
  .desktop\:text-lg { font-size: 1.125rem; }
  .desktop\:text-xl { font-size: 1.25rem; }
}
```

### 3. React組件中的響應式文字

#### 響應式文字組件 (`src/components/shared/ResponsiveText.tsx`)
```typescript
import React from 'react';
import { TextScaleManager } from '../../utils/TextScaleManager';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  level?: keyof typeof TextScaleManager.TEXT_LEVELS;
  children: React.ReactNode;
  as?: keyof HTMLElementTagNameMap;
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  clamp?: number; // 行數限制
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  level = 'body',
  children,
  as,
  fontFamily,
  fontWeight,
  align,
  truncate = false,
  clamp,
  className = '',
  style = {},
  ...props
}) => {
  const { deviceInfo } = useResponsiveLayout(0, 0); // 不需要畫布尺寸

  // 決定使用哪個HTML標籤
  const Tag = as || TextScaleManager.getDefaultTag(level);

  // 構建樣式
  const textStyle = TextScaleManager.getTextStyle(level, deviceInfo.layoutMode, {
    fontFamily: fontFamily ? TextScaleManager.FONT_FAMILIES[fontFamily] : undefined,
    fontWeight
  });

  const combinedStyle = {
    ...textStyle,
    textAlign: align,
    ...style
  };

  // 處理文字截斷
  const truncateClass = truncate ? 'truncate' : '';
  const clampStyle = clamp ? {
    display: '-webkit-box',
    WebkitLineClamp: clamp,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  } : {};

  return (
    <Tag
      className={`text-responsive ${truncateClass} ${className}`}
      style={{
        ...combinedStyle,
        ...clampStyle
      }}
      data-text-level={level}
      {...props}
    >
      {children}
    </Tag>
  );
};

// 預定義的文字組件
export const DisplayText: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="display" {...props} />
);

export const Heading1: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="h1" {...props} />
);

export const Heading2: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="h2" {...props} />
);

export const Heading3: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="h3" {...props} />
);

export const BodyText: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="body" {...props} />
);

export const SmallText: React.FC<Omit<ResponsiveTextProps, 'level'>> = (props) => (
  <ResponsiveText level="small" {...props
