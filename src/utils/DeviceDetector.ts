/**
 * 裝置檢測工具
 * 檢測裝置類型、螢幕尺寸、方向等資訊
 */

import {
  LayoutMode,
  DeviceType,
  Orientation,
  getLayoutMode,
  getDeviceType,
  getOrientation
} from './responsiveConfig';

export interface DeviceInfo {
  type: DeviceType;
  layoutMode: LayoutMode;
  orientation: Orientation;
  width: number;
  height: number;
  pixelRatio: number;
  isTouchDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  userAgent: string;
  platform: string;
}

export class DeviceDetector {
  private static instance: DeviceDetector;
  private deviceInfo: DeviceInfo;
  private listeners: Array<(info: DeviceInfo) => void> = [];
  private resizeTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.deviceInfo = this.detectDeviceInfo();
    this.setupEventListeners();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  /**
   * 獲取當前裝置資訊
   */
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  /**
   * 檢測裝置資訊
   */
  private detectDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const layoutMode = getLayoutMode(width);
    const deviceType = getDeviceType(width);
    const orientation = getOrientation(width, height);

    return {
      type: deviceType,
      layoutMode,
      orientation,
      width,
      height,
      pixelRatio: window.devicePixelRatio || 1,
      isTouchDevice: this.isTouchDevice(),
      isMobile: layoutMode === 'mobile',
      isTablet: layoutMode === 'tablet',
      isDesktop: ['desktop', 'wide', 'ultra-wide'].includes(layoutMode),
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }

  /**
   * 檢查是否為觸控裝置
   */
  private isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    // 視窗大小變化
    window.addEventListener('resize', this.handleResize.bind(this));

    // 裝置方向變化
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

    // 頁面可見性變化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * 處理視窗大小變化
   */
  private handleResize(): void {
    // 防抖動處理
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const newInfo = this.detectDeviceInfo();
      const hasChanged = this.hasDeviceInfoChanged(newInfo);

      if (hasChanged) {
        this.deviceInfo = newInfo;
        this.notifyListeners();
      }

      this.resizeTimeout = null;
    }, 150); // 150ms防抖動
  }

  /**
   * 處理裝置方向變化
   */
  private handleOrientationChange(): void {
    // 方向變化後稍微延遲以確保尺寸已更新
    setTimeout(() => {
      const newInfo = this.detectDeviceInfo();
      this.deviceInfo = newInfo;
      this.notifyListeners();
    }, 100);
  }

  /**
   * 處理頁面可見性變化
   */
  private handleVisibilityChange(): void {
    if (!document.hidden) {
      // 頁面重新可見時重新檢測
      const newInfo = this.detectDeviceInfo();
      const hasChanged = this.hasDeviceInfoChanged(newInfo);

      if (hasChanged) {
        this.deviceInfo = newInfo;
        this.notifyListeners();
      }
    }
  }

  /**
   * 檢查裝置資訊是否發生變化
   */
  private hasDeviceInfoChanged(newInfo: DeviceInfo): boolean {
    return (
      newInfo.layoutMode !== this.deviceInfo.layoutMode ||
      newInfo.orientation !== this.deviceInfo.orientation ||
      Math.abs(newInfo.width - this.deviceInfo.width) > 50 ||
      Math.abs(newInfo.height - this.deviceInfo.height) > 50
    );
  }

  /**
   * 註冊裝置變化監聽器
   */
  public onDeviceChange(callback: (info: DeviceInfo) => void): () => void {
    this.listeners.push(callback);

    // 返回取消註冊函數
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有監聽器
   */
  private notifyListeners(): void {
    const info = this.getDeviceInfo();
    this.listeners.forEach(listener => {
      try {
        listener(info);
      } catch (error) {
        console.error('Error in device change listener:', error);
      }
    });
  }

  /**
   * 檢查是否為特定裝置類型
   */
  public isDeviceType(type: DeviceType): boolean {
    return this.deviceInfo.type === type;
  }

  /**
   * 檢查是否為特定佈局模式
   */
  public isLayoutMode(mode: LayoutMode): boolean {
    return this.deviceInfo.layoutMode === mode;
  }

  /**
   * 獲取CSS媒體查詢字串
   */
  public getMediaQuery(mode: LayoutMode): string {
    const breakpoints = {
      mobile: `(max-width: 767px)`,
      tablet: `(min-width: 768px) and (max-width: 1023px)`,
      desktop: `(min-width: 1024px) and (max-width: 1279px)`,
      wide: `(min-width: 1280px) and (max-width: 1919px)`,
      'ultra-wide': `(min-width: 1920px)`
    };

    return breakpoints[mode];
  }

  /**
   * 檢查是否支援特定功能
   */
  public supportsFeature(feature: string): boolean {
    switch (feature) {
      case 'touch':
        return this.deviceInfo.isTouchDevice;
      case 'hover':
        return !this.deviceInfo.isTouchDevice;
      case 'high-resolution':
        return this.deviceInfo.pixelRatio >= 2;
      case 'reduced-motion':
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      case 'dark-mode':
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      default:
        return false;
    }
  }

  /**
   * 獲取裝置能力報告
   */
  public getCapabilityReport(): Record<string, boolean> {
    return {
      touch: this.deviceInfo.isTouchDevice,
      hover: !this.deviceInfo.isTouchDevice,
      highResolution: this.deviceInfo.pixelRatio >= 2,
      reducedMotion: this.supportsFeature('reduced-motion'),
      darkMode: this.supportsFeature('dark-mode'),
      mobile: this.deviceInfo.isMobile,
      tablet: this.deviceInfo.isTablet,
      desktop: this.deviceInfo.isDesktop,
      portrait: this.deviceInfo.isPortrait,
      landscape: this.deviceInfo.isLandscape
    };
  }

  /**
   * 銷毀實例
   */
  public destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.listeners = [];
    DeviceDetector.instance = null as any;
  }
}

// 導出單例實例
export const deviceDetector = DeviceDetector.getInstance();

// 導出Hook友好的輔助函數
export function useDeviceDetector() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => deviceDetector.getDeviceInfo());

  useEffect(() => {
    const unsubscribe = deviceDetector.onDeviceChange(setDeviceInfo);
    return unsubscribe;
  }, []);

  return deviceInfo;
}

// React Hook（需要在React組件中使用）
import { useState, useEffect } from 'react';
