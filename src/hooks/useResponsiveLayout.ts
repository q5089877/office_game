/**
 * 響應式佈局Hook
 * 提供裝置資訊和佈局相關的功能
 */

import { useState, useEffect, useCallback } from 'react';
import { deviceDetector, DeviceInfo } from '../utils/DeviceDetector';
import { CanvasScaleManager, canvasScaleManager, ScaleResult } from '../utils/CanvasScaleManager';
import {
  LayoutMode,
  getSidebarWidth,
  getBottomAreaHeight,
  getScaleStrategy
} from '../utils/responsiveConfig';

interface UseResponsiveLayoutOptions {
  baseWidth: number;
  baseHeight: number;
  onScaleChange?: (result: ScaleResult) => void;
  onDeviceChange?: (info: DeviceInfo) => void;
}

interface UseResponsiveLayoutReturn {
  deviceInfo: DeviceInfo;
  scaleResult: ScaleResult | null;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  sidebarWidth: string;
  bottomAreaHeight: string;
  scaleStrategy: ReturnType<typeof getScaleStrategy>;
  updateScale: () => void;
  applyScaleToElement: (element: HTMLElement, transition?: boolean) => void;
}

export function useResponsiveLayout({
  baseWidth,
  baseHeight,
  onScaleChange,
  onDeviceChange
}: UseResponsiveLayoutOptions): UseResponsiveLayoutReturn {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => deviceDetector.getDeviceInfo());
  const [scaleResult, setScaleResult] = useState<ScaleResult | null>(null);

  // 計算UI尺寸的函數
  const getUIWidth = useCallback((): number => {
    const widthStr = getSidebarWidth(deviceInfo.layoutMode);
    if (widthStr.endsWith('px')) {
      return parseFloat(widthStr);
    } else if (widthStr.endsWith('%')) {
      return (parseFloat(widthStr) / 100) * window.innerWidth;
    }
    return 0;
  }, [deviceInfo.layoutMode]);

  const getUIHeight = useCallback((): number => {
    const heightStr = getBottomAreaHeight(deviceInfo.layoutMode);
    if (heightStr.endsWith('px')) {
      return parseFloat(heightStr);
    }
    return 0;
  }, [deviceInfo.layoutMode]);

  // 計算可用空間
  const getAvailableSpace = useCallback(() => {
    return {
      width: window.innerWidth - getUIWidth(),
      height: window.innerHeight - getUIHeight()
    };
  }, [getUIWidth, getUIHeight]);

  // 處理裝置變化
  useEffect(() => {
    const unsubscribe = deviceDetector.onDeviceChange((info) => {
      setDeviceInfo(info);
      onDeviceChange?.(info);
    });

    return unsubscribe;
  }, [onDeviceChange]);

  // 處理縮放變化
  useEffect(() => {
    const unsubscribe = canvasScaleManager.onScaleChange((result) => {
      setScaleResult(result);
      onScaleChange?.(result);
    });

    return unsubscribe;
  }, [onScaleChange]);

  // 設置縮放監聽器
  useEffect(() => {
    canvasScaleManager.setupScaleListener(
      baseWidth,
      baseHeight,
      getAvailableSpace,
      deviceInfo.layoutMode,
      {
        minScale: getScaleStrategy(deviceInfo.layoutMode).MIN_SCALE,
        maxScale: getScaleStrategy(deviceInfo.layoutMode).MAX_SCALE,
        paddingFactor: getScaleStrategy(deviceInfo.layoutMode).PADDING_FACTOR,
        aspectRatioAdjust: getScaleStrategy(deviceInfo.layoutMode).ASPECT_RATIO_ADJUST
      }
    );

    return () => {
      canvasScaleManager.destroy();
    };
  }, [baseWidth, baseHeight, deviceInfo.layoutMode, getAvailableSpace]);

  // 手動更新縮放
  const updateScale = useCallback(() => {
    const availableSpace = getAvailableSpace();
    canvasScaleManager.recalculateScale(
      baseWidth,
      baseHeight,
      availableSpace.width,
      availableSpace.height,
      deviceInfo.layoutMode
    );
  }, [baseWidth, baseHeight, deviceInfo.layoutMode, getAvailableSpace]);

  // 應用縮放到元素
  const applyScaleToElement = useCallback((element: HTMLElement, transition: boolean = true) => {
    if (scaleResult) {
      CanvasScaleManager.applyScaleToCanvas(element, scaleResult, { transition });
    }
  }, [scaleResult]);

  // 計算UI尺寸
  const sidebarWidth = getSidebarWidth(deviceInfo.layoutMode);
  const bottomAreaHeight = getBottomAreaHeight(deviceInfo.layoutMode);
  const scaleStrategy = getScaleStrategy(deviceInfo.layoutMode);

  return {
    deviceInfo,
    scaleResult,
    isMobile: deviceInfo.layoutMode === 'mobile',
    isTablet: deviceInfo.layoutMode === 'tablet',
    isDesktop: ['desktop', 'wide', 'ultra-wide'].includes(deviceInfo.layoutMode),
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape',
    sidebarWidth,
    bottomAreaHeight,
    scaleStrategy,
    updateScale,
    applyScaleToElement
  };
}

// 簡化版本的Hook，用於不需要畫布縮放的組件
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => deviceDetector.getDeviceInfo());

  useEffect(() => {
    const unsubscribe = deviceDetector.onDeviceChange(setDeviceInfo);
    return unsubscribe;
  }, []);

  return deviceInfo;
}

// 用於檢查特定佈局模式的Hook
export function useLayoutMode(mode: LayoutMode): boolean {
  const deviceInfo = useDeviceInfo();
  return deviceInfo.layoutMode === mode;
}

// 用於檢查裝置類型的Hook
export function useIsMobile(): boolean {
  return useLayoutMode('mobile');
}

export function useIsTablet(): boolean {
  return useLayoutMode('tablet');
}

export function useIsDesktop(): boolean {
  const deviceInfo = useDeviceInfo();
  return ['desktop', 'wide', 'ultra-wide'].includes(deviceInfo.layoutMode);
}

// 用於檢查方向的Hook
export function useOrientation() {
  const deviceInfo = useDeviceInfo();
  return {
    isPortrait: deviceInfo.orientation === 'portrait',
    isLandscape: deviceInfo.orientation === 'landscape',
    orientation: deviceInfo.orientation
  };
}

// 用於檢查觸控支援的Hook
export function useTouchSupport() {
  const deviceInfo = useDeviceInfo();
  return {
    isTouchDevice: deviceInfo.isTouchDevice,
    supportsHover: !deviceInfo.isTouchDevice
  };
}

// 用於獲取CSS媒體查詢的Hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 現代瀏覽器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // 舊瀏覽器
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

// 預定義的媒體查詢Hook
export function useMobileMediaQuery(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useTabletMediaQuery(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useDesktopMediaQuery(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useWideMediaQuery(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

export function useUltraWideMediaQuery(): boolean {
  return useMediaQuery('(min-width: 1920px)');
}

// 用於檢查減少動畫偏好的Hook
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// 用於檢查深色模式的Hook
export function useDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}
