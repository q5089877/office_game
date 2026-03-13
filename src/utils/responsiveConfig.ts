/**
 * 響應式配置常數
 * 定義斷點、佈局模式和縮放策略
 */

// 斷點系統（單位：px）
export const BREAKPOINTS = {
  MOBILE: 320,      // 手機最小寬度
  PHABLET: 480,     // 大手機/小平板
  TABLET: 768,      // 平板
  DESKTOP: 1024,    // 桌面
  WIDE: 1280,       // 寬螢幕
  ULTRA_WIDE: 1920, // 超寬螢幕
  MAX_WIDTH: 2560   // 最大支援寬度
} as const;

// 佈局模式
export type LayoutMode = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultra-wide';

// 裝置類型
export type DeviceType = 'phone' | 'phablet' | 'tablet' | 'desktop' | 'wide-desktop';

// 方向
export type Orientation = 'portrait' | 'landscape';

// 佈局配置
export const LAYOUT_CONFIG = {
  // 側邊欄配置
  SIDEBAR: {
    WIDTH: {
      MOBILE: '100%',      // 手機：全寬
      TABLET: '280px',     // 平板：固定寬度
      DESKTOP: '320px',    // 桌面：固定寬度
      WIDE: '360px',       // 寬螢幕：稍寬
      ULTRA_WIDE: '400px'  // 超寬螢幕：更寬
    },
    COLLAPSIBLE: {
      MOBILE: true,        // 手機：可折疊
      TABLET: true,        // 平板：可折疊
      DESKTOP: false,      // 桌面：固定顯示
      WIDE: false,         // 寬螢幕：固定顯示
      ULTRA_WIDE: false    // 超寬螢幕：固定顯示
    }
  },

  // 底部區域配置
  BOTTOM_AREA: {
    HEIGHT: {
      MOBILE: '180px',     // 手機：較矮
      TABLET: '200px',     // 平板：標準高度
      DESKTOP: '220px',    // 桌面：標準高度
      WIDE: '240px',       // 寬螢幕：稍高
      ULTRA_WIDE: '260px'  // 超寬螢幕：更高
    },
    PADDING: {
      MOBILE: '0.75rem',   // 手機：較小間距
      TABLET: '1rem',      // 平板：標準間距
      DESKTOP: '1.25rem',  // 桌面：標準間距
      WIDE: '1.5rem',      // 寬螢幕：較大間距
      ULTRA_WIDE: '1.75rem'// 超寬螢幕：更大間距
    }
  },

  // 畫布區域配置
  CANVAS: {
    PADDING: {
      MOBILE: '0.5rem',    // 手機：較小間距
      TABLET: '1rem',      // 平板：標準間距
      DESKTOP: '1.5rem',   // 桌面：標準間距
      WIDE: '2rem',        // 寬螢幕：較大間距
      ULTRA_WIDE: '2.5rem' // 超寬螢幕：更大間距
    }
  }
} as const;

// 縮放策略
export const SCALE_STRATEGIES = {
  MOBILE: {
    MIN_SCALE: 0.25,       // 最小縮放比例
    MAX_SCALE: 0.7,        // 最大縮放比例
    PADDING_FACTOR: 0.8,   // 緩衝係數
    ASPECT_RATIO_ADJUST: 0.9, // 寬高比調整
    DEBOUNCE_MS: 200       // 防抖動時間
  },
  TABLET: {
    MIN_SCALE: 0.35,
    MAX_SCALE: 0.9,
    PADDING_FACTOR: 0.85,
    ASPECT_RATIO_ADJUST: 0.95,
    DEBOUNCE_MS: 150
  },
  DESKTOP: {
    MIN_SCALE: 0.5,
    MAX_SCALE: 1.2,
    PADDING_FACTOR: 0.9,
    ASPECT_RATIO_ADJUST: 1.0,
    DEBOUNCE_MS: 100
  },
  WIDE: {
    MIN_SCALE: 0.6,
    MAX_SCALE: 1.5,
    PADDING_FACTOR: 0.95,
    ASPECT_RATIO_ADJUST: 1.05,
    DEBOUNCE_MS: 100
  },
  ULTRA_WIDE: {
    MIN_SCALE: 0.7,
    MAX_SCALE: 2.0,
    PADDING_FACTOR: 0.98,
    ASPECT_RATIO_ADJUST: 1.1,
    DEBOUNCE_MS: 100
  }
} as const;

// 響應式文字系統
export const RESPONSIVE_TEXT = {
  // 基礎文字大小（rem）
  BASE: {
    MOBILE: '0.875rem',    // 14px
    TABLET: '0.9375rem',   // 15px
    DESKTOP: '1rem',       // 16px
    WIDE: '1.0625rem',     // 17px
    ULTRA_WIDE: '1.125rem' // 18px
  },

  // 標題大小比例
  HEADING: {
    h1: { MOBILE: 2.0, TABLET: 2.25, DESKTOP: 2.5, WIDE: 2.75, ULTRA_WIDE: 3.0 },
    h2: { MOBILE: 1.75, TABLET: 1.875, DESKTOP: 2.0, WIDE: 2.125, ULTRA_WIDE: 2.25 },
    h3: { MOBILE: 1.5, TABLET: 1.625, DESKTOP: 1.75, WIDE: 1.875, ULTRA_WIDE: 2.0 },
    h4: { MOBILE: 1.25, TABLET: 1.375, DESKTOP: 1.5, WIDE: 1.625, ULTRA_WIDE: 1.75 },
    h5: { MOBILE: 1.125, TABLET: 1.25, DESKTOP: 1.375, WIDE: 1.5, ULTRA_WIDE: 1.625 },
    h6: { MOBILE: 1.0, TABLET: 1.125, DESKTOP: 1.25, WIDE: 1.375, ULTRA_WIDE: 1.5 }
  },

  // 特殊文字大小
  SPECIAL: {
    SMALL: { MOBILE: '0.75rem', TABLET: '0.8125rem', DESKTOP: '0.875rem', WIDE: '0.9375rem', ULTRA_WIDE: '1rem' },
    LARGE: { MOBILE: '1.125rem', TABLET: '1.25rem', DESKTOP: '1.375rem', WIDE: '1.5rem', ULTRA_WIDE: '1.625rem' },
    XLARGE: { MOBILE: '1.5rem', TABLET: '1.75rem', DESKTOP: '2rem', WIDE: '2.25rem', ULTRA_WIDE: '2.5rem' }
  }
} as const;

// 觸控目標最小尺寸（符合WCAG標準）
export const TOUCH_TARGET = {
  MIN_WIDTH: '44px',
  MIN_HEIGHT: '44px',
  MIN_PADDING: '8px',
  MIN_MARGIN: '4px'
} as const;

// 間距系統（單位：rem）
export const SPACING = {
  XS: '0.25rem',  // 4px
  SM: '0.5rem',   // 8px
  MD: '1rem',     // 16px
  LG: '1.5rem',   // 24px
  XL: '2rem',     // 32px
  XXL: '3rem'     // 48px
} as const;

// 工具函數：根據寬度獲取佈局模式
export function getLayoutMode(width: number): LayoutMode {
  if (width < BREAKPOINTS.TABLET) return 'mobile';
  if (width < BREAKPOINTS.DESKTOP) return 'tablet';
  if (width < BREAKPOINTS.WIDE) return 'desktop';
  if (width < BREAKPOINTS.ULTRA_WIDE) return 'wide';
  return 'ultra-wide';
}

// 工具函數：根據寬度獲取裝置類型
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.PHABLET) return 'phone';
  if (width < BREAKPOINTS.TABLET) return 'phablet';
  if (width < BREAKPOINTS.DESKTOP) return 'tablet';
  if (width < BREAKPOINTS.ULTRA_WIDE) return 'desktop';
  return 'wide-desktop';
}

// 工具函數：獲取方向
export function getOrientation(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait';
}

// 工具函數：獲取側邊欄寬度
export function getSidebarWidth(layoutMode: LayoutMode): string {
  return LAYOUT_CONFIG.SIDEBAR.WIDTH[layoutMode.toUpperCase() as keyof typeof LAYOUT_CONFIG.SIDEBAR.WIDTH];
}

// 工具函數：獲取底部區域高度
export function getBottomAreaHeight(layoutMode: LayoutMode): string {
  return LAYOUT_CONFIG.BOTTOM_AREA.HEIGHT[layoutMode.toUpperCase() as keyof typeof LAYOUT_CONFIG.BOTTOM_AREA.HEIGHT];
}

// 工具函數：側邊欄是否可折疊
export function isSidebarCollapsible(layoutMode: LayoutMode): boolean {
  return LAYOUT_CONFIG.SIDEBAR.COLLAPSIBLE[layoutMode.toUpperCase() as keyof typeof LAYOUT_CONFIG.SIDEBAR.COLLAPSIBLE];
}

// 工具函數：獲取縮放策略
export function getScaleStrategy(layoutMode: LayoutMode) {
  return SCALE_STRATEGIES[layoutMode.toUpperCase() as keyof typeof SCALE_STRATEGIES];
}

// 工具函數：獲取基礎文字大小
export function getBaseFontSize(layoutMode: LayoutMode): string {
  return RESPONSIVE_TEXT.BASE[layoutMode.toUpperCase() as keyof typeof RESPONSIVE_TEXT.BASE];
}

// 工具函數：獲取標題文字大小
export function getHeadingFontSize(layoutMode: LayoutMode, level: keyof typeof RESPONSIVE_TEXT.HEADING): string {
  const scale = RESPONSIVE_TEXT.HEADING[level][layoutMode.toUpperCase() as keyof typeof RESPONSIVE_TEXT.HEADING.h1];
  const baseSize = parseFloat(getBaseFontSize(layoutMode).replace('rem', ''));
  return `${baseSize * scale}rem`;
}

// 工具函數：防抖動
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 工具函數：節流
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
