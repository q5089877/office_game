/**
 * 響應式系統入口檔案
 * 提供統一的導入接口和工具函數
 */

// 重新導出所有響應式相關的類型和工具
export * from './responsiveConfig';
export * from './DeviceDetector';
export * from './CanvasScaleManager';
export * from './TouchInteraction';
export * from './TouchTargetOptimizer';
export * from './GestureManager';
export * from './TextScaleManager';
export * from './AvailableSpaceCalculator';

// 重新導出Hooks
export * from '../hooks/useResponsiveLayout';
export * from '../hooks/useTouchInteraction';

// 重新導出組件
export * from '../components/Layout/ResponsiveLayout';
export * from '../components/shared/ResponsiveText';
export * from '../components/Layout/GameResponsiveDemo';

// 工具函數
import { BREAKPOINTS, LayoutMode, DeviceType, getScaleStrategy } from './responsiveConfig';
import { deviceDetector, DeviceInfo } from './DeviceDetector';

/**
 * 快速工具函數
 */

/**
 * 檢查是否為觸控裝置
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         (navigator as any).msMaxTouchPoints > 0;
}

/**
 * 獲取當前佈局模式
 */
export function getCurrentLayoutMode(): LayoutMode {
  const detector = deviceDetector;
  return detector.getDeviceInfo().layoutMode;
}

/**
 * 獲取裝置類型
 */
export function getDeviceType(): DeviceType {
  const detector = deviceDetector;
  return detector.getDeviceInfo().type;
}

/**
 * 檢查是否為行動裝置
 */
export function isMobileDevice(): boolean {
  const detector = deviceDetector;
  return detector.getDeviceInfo().isMobile;
}

/**
 * 檢查是否為平板裝置
 */
export function isTabletDevice(): boolean {
  const detector = deviceDetector;
  return detector.getDeviceInfo().isTablet;
}

/**
 * 檢查是否為桌面裝置
 */
export function isDesktopDevice(): boolean {
  const detector = deviceDetector;
  return detector.getDeviceInfo().isDesktop;
}

/**
 * 獲取最佳觸控目標尺寸
 */
export function getOptimalTouchTargetSize(): { width: number; height: number } {
  const layoutMode = getCurrentLayoutMode();

  // WCAG標準：最小觸控目標為44x44像素
  const baseSize = 44;

  switch (layoutMode) {
    case 'mobile':
      return { width: baseSize * 1.2, height: baseSize * 1.2 };
    case 'tablet':
      return { width: baseSize * 1.1, height: baseSize * 1.1 };
    default:
      return { width: baseSize, height: baseSize };
  }
}

/**
 * 計算響應式文字大小
 */
export function calculateResponsiveFontSize(
  baseSize: number,
  layoutMode?: LayoutMode
): number {
  const currentLayoutMode = layoutMode || getCurrentLayoutMode();
  const scaleRatios = {
    mobile: 0.85,
    tablet: 0.95,
    desktop: 1.0,
    wide: 1.05,
    ultraWide: 1.1
  };

  const scaleRatio = scaleRatios[currentLayoutMode];
  return Math.round(baseSize * scaleRatio);
}

/**
 * 生成響應式CSS類別
 */
export function generateResponsiveClasses(): string {
  const detector = deviceDetector;
  const info = detector.getDeviceInfo();
  const classes = [
    `device-${info.type}`,
    `layout-${info.layoutMode}`,
    `orientation-${info.orientation}`,
    info.isTouchDevice ? 'touch-device' : 'no-touch'
  ];

  return classes.join(' ');
}

/**
 * 應用響應式樣式到元素
 */
export function applyResponsiveStyles(element: HTMLElement): void {
  const classes = generateResponsiveClasses();
  element.className = `${element.className} ${classes}`.trim();

  // 如果是觸控裝置，添加觸控樣式
  if (isTouchDevice()) {
    element.classList.add('touch-optimized');
  }
}

/**
 * 響應式工具Hook（React專用）
 * 注意：這個函數需要在React組件中使用
 */
export function useResponsiveTools() {
  // 這個函數需要在React環境中使用
  // 這裡只提供類型定義，實際實現需要在React組件中
  return {
    isTouchDevice: isTouchDevice(),
    layoutMode: getCurrentLayoutMode(),
    deviceType: getDeviceType(),
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isDesktop: isDesktopDevice(),
    optimalTouchSize: getOptimalTouchTargetSize()
  };
}
