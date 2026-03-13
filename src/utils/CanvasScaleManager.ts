/**
 * 畫布縮放管理器
 * 計算和管理畫布的縮放比例和尺寸
 */

import {
  LayoutMode,
  getScaleStrategy,
  debounce
} from './responsiveConfig';

export interface ScaleOptions {
  minScale?: number;
  maxScale?: number;
  paddingFactor?: number;
  aspectRatioAdjust?: number;
  preserveAspectRatio?: boolean;
}

export interface ScaleStrategy extends ScaleOptions {
  debounceMs: number;
}

export interface ScaleResult {
  scale: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  fitsScreen: boolean;
  layoutMode: LayoutMode;
}

export interface AvailableSpace {
  width: number;
  height: number;
}

export class CanvasScaleManager {
  private currentScale: number = 1;
  private currentResult: ScaleResult | null = null;
  private resizeCallbacks: Array<(result: ScaleResult) => void> = [];
  private cleanupFunctions: Array<() => void> = [];

  /**
   * 計算最佳縮放比例
   */
  static calculateOptimalScale(
    availableWidth: number,
    availableHeight: number,
    baseWidth: number,
    baseHeight: number,
    layoutMode: LayoutMode,
    options: ScaleOptions = {}
  ): ScaleResult {
    const strategy = getScaleStrategy(layoutMode);

    // 合併選項
    const {
      minScale = strategy.MIN_SCALE,
      maxScale = strategy.MAX_SCALE,
      paddingFactor = strategy.PADDING_FACTOR,
      aspectRatioAdjust = strategy.ASPECT_RATIO_ADJUST,
      preserveAspectRatio = true
    } = options;

    // 計算基礎縮放比例
    const scaleX = availableWidth / baseWidth;
    const scaleY = availableHeight / baseHeight;

    let scale: number;

    if (preserveAspectRatio) {
      // 保持寬高比，取最小比例
      scale = Math.min(scaleX, scaleY) * paddingFactor;
    } else {
      // 不保持寬高比，獨立縮放（不建議）
      scale = Math.min(scaleX, scaleY) * paddingFactor;
    }

    // 應用寬高比調整
    scale *= aspectRatioAdjust;

    // 限制在最小和最大範圍內
    scale = Math.max(minScale, Math.min(maxScale, scale));

    // 計算實際尺寸
    const width = baseWidth * scale;
    const height = baseHeight * scale;

    // 計算位置（置中）
    const offsetX = (availableWidth - width) / 2;
    const offsetY = (availableHeight - height) / 2;

    // 檢查是否適合螢幕
    const fitsScreen = scale >= minScale && scale <= maxScale;

    return {
      scale,
      width,
      height,
      offsetX,
      offsetY,
      fitsScreen,
      layoutMode
    };
  }

  /**
   * 計算可用空間
   */
  static calculateAvailableSpace(
    windowWidth: number,
    windowHeight: number,
    layoutMode: LayoutMode,
    getUIWidth: () => number,
    getUIHeight: () => number
  ): AvailableSpace {
    let availableWidth = windowWidth;
    let availableHeight = windowHeight;

    // 根據佈局模式扣除UI空間
    switch (layoutMode) {
      case 'mobile':
        // 手機：垂直堆疊，扣除底部區域
        availableHeight -= getUIHeight();
        break;

      case 'tablet':
      case 'desktop':
      case 'wide':
      case 'ultra-wide':
        // 其他模式：扣除側邊欄和底部區域
        availableWidth -= getUIWidth();
        availableHeight -= getUIHeight();
        break;
    }

    // 確保最小尺寸
    availableWidth = Math.max(100, availableWidth);
    availableHeight = Math.max(100, availableHeight);

    return { width: availableWidth, height: availableHeight };
  }

  /**
   * 設置縮放監聽器
   */
  setupScaleListener(
    baseWidth: number,
    baseHeight: number,
    getAvailableSpace: () => AvailableSpace,
    layoutMode: LayoutMode,
    options: ScaleOptions = {}
  ): void {
    const strategy = getScaleStrategy(layoutMode);

    const calculateAndNotify = () => {
      const availableSpace = getAvailableSpace();
      const result = CanvasScaleManager.calculateOptimalScale(
        availableSpace.width,
        availableSpace.height,
        baseWidth,
        baseHeight,
        layoutMode,
        options
      );

      this.currentScale = result.scale;
      this.currentResult = result;
      this.notifyResizeCallbacks(result);
    };

    // 防抖動處理
    const debouncedCalculate = debounce(calculateAndNotify, strategy.DEBOUNCE_MS);

    // 監聽事件
    const handleResize = () => debouncedCalculate();
    const handleOrientationChange = () => {
      // 方向變化後稍微延遲
      setTimeout(() => debouncedCalculate(), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // 初始計算
    calculateAndNotify();

    // 保存清理函數
    this.cleanupFunctions.push(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    });
  }

  /**
   * 手動觸發縮放計算
   */
  recalculateScale(
    baseWidth: number,
    baseHeight: number,
    availableWidth: number,
    availableHeight: number,
    layoutMode: LayoutMode,
    options: ScaleOptions = {}
  ): ScaleResult {
    const result = CanvasScaleManager.calculateOptimalScale(
      availableWidth,
      availableHeight,
      baseWidth,
      baseHeight,
      layoutMode,
      options
    );

    this.currentScale = result.scale;
    this.currentResult = result;
    this.notifyResizeCallbacks(result);

    return result;
  }

  /**
   * 獲取當前縮放結果
   */
  getCurrentScale(): number {
    return this.currentScale;
  }

  /**
   * 獲取當前縮放結果
   */
  getCurrentResult(): ScaleResult | null {
    return this.currentResult;
  }

  /**
   * 註冊縮放變化監聽器
   */
  onScaleChange(callback: (result: ScaleResult) => void): () => void {
    this.resizeCallbacks.push(callback);

    // 立即通知當前狀態
    if (this.currentResult) {
      callback(this.currentResult);
    }

    // 返回取消註冊函數
    return () => {
      const index = this.resizeCallbacks.indexOf(callback);
      if (index > -1) {
        this.resizeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有監聽器
   */
  private notifyResizeCallbacks(result: ScaleResult): void {
    this.resizeCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in scale change callback:', error);
      }
    });
  }

  /**
   * 應用縮放到畫布元素
   */
  static applyScaleToCanvas(
    canvasElement: HTMLElement,
    result: ScaleResult,
    options: { transition?: boolean } = {}
  ): void {
    const { transition = true } = options;

    // 設置過渡效果
    if (transition) {
      canvasElement.style.transition = 'width 0.3s ease, height 0.3s ease, margin 0.3s ease';
    } else {
      canvasElement.style.transition = 'none';
    }

    // 應用尺寸和位置
    canvasElement.style.width = `${result.width}px`;
    canvasElement.style.height = `${result.height}px`;
    canvasElement.style.marginLeft = `${result.offsetX}px`;
    canvasElement.style.marginTop = `${result.offsetY}px`;

    // 添加資料屬性以便於調試
    canvasElement.dataset.scale = result.scale.toFixed(2);
    canvasElement.dataset.layoutMode = result.layoutMode;
    canvasElement.dataset.fitsScreen = result.fitsScreen.toString();
  }

  /**
   * 計算畫布內部的座標轉換
   */
  static convertToCanvasCoordinates(
    screenX: number,
    screenY: number,
    canvasElement: HTMLElement,
    result: ScaleResult
  ): { x: number; y: number } {
    const rect = canvasElement.getBoundingClientRect();

    // 計算相對於畫布的座標
    const relativeX = screenX - rect.left;
    const relativeY = screenY - rect.top;

    // 考慮縮放比例轉換為原始座標
    const originalX = relativeX / result.scale;
    const originalY = relativeY / result.scale;

    return { x: originalX, y: originalY };
  }

  /**
   * 檢查點是否在畫布內
   */
  static isPointInCanvas(
    screenX: number,
    screenY: number,
    canvasElement: HTMLElement
  ): boolean {
    const rect = canvasElement.getBoundingClientRect();
    return (
      screenX >= rect.left &&
      screenX <= rect.right &&
      screenY >= rect.top &&
      screenY <= rect.bottom
    );
  }

  /**
   * 獲取畫布的可見區域
   */
  static getVisibleCanvasArea(
    canvasElement: HTMLElement,
    result: ScaleResult
  ): { x: number; y: number; width: number; height: number } {
    const rect = canvasElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 計算畫布在視口中的可見區域
    const visibleLeft = Math.max(0, rect.left);
    const visibleTop = Math.max(0, rect.top);
    const visibleRight = Math.min(viewportWidth, rect.right);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);

    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    // 轉換為原始座標
    const originalX = (visibleLeft - rect.left) / result.scale;
    const originalY = (visibleTop - rect.top) / result.scale;
    const originalWidth = visibleWidth / result.scale;
    const originalHeight = visibleHeight / result.scale;

    return {
      x: originalX,
      y: originalY,
      width: originalWidth,
      height: originalHeight
    };
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.resizeCallbacks = [];
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}

// 導出單例實例
export const canvasScaleManager = new CanvasScaleManager();
