/**
 * 手勢管理器
 * 提供高級手勢識別和處理
 * 支援縮放、旋轉、拖拽等複雜手勢
 */

import { TouchEventData, TouchInteractionManager } from './TouchInteraction';
import { LayoutMode } from './responsiveConfig';

// 手勢類型
export type GestureType = 'pinch' | 'rotate' | 'pan' | 'swipe' | 'tap' | 'longPress';

// 手勢狀態
export interface GestureState {
  type: GestureType;
  isActive: boolean;
  startTime: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  scale: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

// 手勢配置
export interface GestureConfig {
  pinchThreshold: number; // 縮放閾值（比例變化）
  rotateThreshold: number; // 旋轉閾值（度）
  panThreshold: number; // 平移閾值（像素）
  swipeThreshold: number; // 滑動閾值（像素）
  swipeVelocityThreshold: number; // 滑動速度閾值（像素/毫秒）
  inertiaDuration: number; // 慣性持續時間（毫秒）
  inertiaDeceleration: number; // 慣性減速度（像素/毫秒²）
  maxScale: number; // 最大縮放比例
  minScale: number; // 最小縮放比例
}

// 預設配置
const DEFAULT_CONFIG: GestureConfig = {
  pinchThreshold: 0.01, // 1%變化
  rotateThreshold: 2, // 2度
  panThreshold: 5, // 5像素
  swipeThreshold: 30, // 30像素
  swipeVelocityThreshold: 0.3, // 0.3像素/毫秒
  inertiaDuration: 300, // 300毫秒
  inertiaDeceleration: 0.001, // 0.001像素/毫秒²
  maxScale: 3.0, // 最大3倍縮放
  minScale: 0.5 // 最小0.5倍縮放
};

// 手勢事件
export interface GestureEvent {
  type: GestureType;
  state: GestureState;
  deltaX?: number;
  deltaY?: number;
  deltaScale?: number;
  deltaRotation?: number;
  velocityX?: number;
  velocityY?: number;
  timestamp: number;
}

// 手勢事件回調
export type GestureEventHandler = (event: GestureEvent) => void;

/**
 * 手勢管理器
 * 提供高級手勢識別和處理
 */
export class GestureManager {
  private element: HTMLElement;
  private config: GestureConfig;
  private touchManager: TouchInteractionManager;
  private gestureState: GestureState;
  private eventHandlers: Map<GestureType, GestureEventHandler[]>;
  private isEnabled: boolean;
  private inertiaAnimationId?: number;
  private lastTouchTime: number;
  private touchPoints: Map<number, { x: number; y: number }>; // 追蹤多點觸控

  constructor(element: HTMLElement, config: Partial<GestureConfig> = {}) {
    this.element = element;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.touchManager = new TouchInteractionManager(element);
    this.gestureState = this.createInitialState();
    this.eventHandlers = new Map();
    this.isEnabled = true;
    this.lastTouchTime = 0;
    this.touchPoints = new Map();

    this.setupTouchHandlers();
  }

  /**
   * 創建初始狀態
   */
  private createInitialState(): GestureState {
    return {
      type: 'tap',
      isActive: false,
      startTime: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      scale: 1.0,
      rotation: 0,
      velocityX: 0,
      velocityY: 0
    };
  }

  /**
   * 設置觸控處理器
   */
  private setupTouchHandlers(): void {
    // 監聽觸控事件
    this.touchManager.on('tap', this.handleTap.bind(this));
    this.touchManager.on('doubleTap', this.handleDoubleTap.bind(this));
    this.touchManager.on('longPress', this.handleLongPress.bind(this));
    this.touchManager.on('swipe', this.handleSwipe.bind(this));

    // 監聽原始觸控事件以進行手勢檢測
    this.element.addEventListener('touchstart', this.handleRawTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleRawTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleRawTouchEnd.bind(this), { passive: false });
  }

  /**
   * 處理原始觸控開始
   */
  private handleRawTouchStart(event: TouchEvent): void {
    if (!this.isEnabled) return;

    const now = Date.now();
    this.lastTouchTime = now;

    // 追蹤所有觸控點
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touchPoints.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY
      });
    }

    // 更新手勢狀態
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.gestureState = {
        ...this.gestureState,
        type: 'pan',
        isActive: true,
        startTime: now,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        scale: 1.0,
        rotation: 0
      };
    } else if (event.touches.length >= 2) {
      // 多點觸控：準備縮放或旋轉
      this.gestureState = {
        ...this.gestureState,
        type: 'pinch',
        isActive: true,
        startTime: now,
        startX: this.getCenterX(event.touches),
        startY: this.getCenterY(event.touches),
        currentX: this.getCenterX(event.touches),
        currentY: this.getCenterY(event.touches),
        scale: 1.0,
        rotation: 0
      };
    }
  }

  /**
   * 處理原始觸控移動
   */
  private handleRawTouchMove(event: TouchEvent): void {
    if (!this.isEnabled || !this.gestureState.isActive) return;

    const now = Date.now();
    const deltaTime = now - this.lastTouchTime;

    if (deltaTime > 0) {
      // 更新觸控點位置
      for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        this.touchPoints.set(touch.identifier, {
          x: touch.clientX,
          y: touch.clientY
        });
      }

      // 根據觸控點數量處理不同手勢
      if (event.touches.length === 1) {
        this.handleSingleTouchMove(event.touches[0], deltaTime);
      } else if (event.touches.length >= 2) {
        this.handleMultiTouchMove(event.touches, deltaTime);
      }

      this.lastTouchTime = now;
    }
  }

  /**
   * 處理單點觸控移動
   */
  private handleSingleTouchMove(touch: Touch, deltaTime: number): void {
    const deltaX = touch.clientX - this.gestureState.currentX;
    const deltaY = touch.clientY - this.gestureState.currentY;

    // 計算速度
    const velocityX = deltaX / deltaTime;
    const velocityY = deltaY / deltaTime;

    // 更新狀態
    this.gestureState = {
      ...this.gestureState,
      currentX: touch.clientX,
      currentY: touch.clientY,
      velocityX,
      velocityY
    };

    // 檢查是否達到平移閾值
    const distance = Math.sqrt(
      Math.pow(touch.clientX - this.gestureState.startX, 2) +
      Math.pow(touch.clientY - this.gestureState.startY, 2)
    );

    if (distance >= this.config.panThreshold) {
      this.triggerPan(deltaX, deltaY, velocityX, velocityY);
    }
  }

  /**
   * 處理多點觸控移動
   */
  private handleMultiTouchMove(touches: TouchList, deltaTime: number): void {
    const touch1 = touches[0];
    const touch2 = touches[1];

    // 計算中心點
    const centerX = this.getCenterX(touches);
    const centerY = this.getCenterY(touches);

    // 計算兩點之間的距離和角度
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    // 獲取之前的距離和角度（從觸控點追蹤）
    const prevTouch1 = this.touchPoints.get(touch1.identifier);
    const prevTouch2 = this.touchPoints.get(touch2.identifier);

    if (prevTouch1 && prevTouch2) {
      const prevDx = prevTouch2.x - prevTouch1.x;
      const prevDy = prevTouch2.y - prevTouch1.y;
      const prevDistance = Math.sqrt(prevDx * prevDx + prevDy * prevDy);
      const prevAngle = Math.atan2(prevDy, prevDx) * 180 / Math.PI;

      // 計算縮放變化
      const scaleChange = currentDistance / prevDistance;
      const deltaScale = scaleChange - 1;

      // 計算旋轉變化
      let deltaRotation = currentAngle - prevAngle;
      // 處理角度跨越360度的情況
      if (deltaRotation > 180) deltaRotation -= 360;
      if (deltaRotation < -180) deltaRotation += 360;

      // 更新狀態
      this.gestureState = {
        ...this.gestureState,
        currentX: centerX,
        currentY: centerY,
        scale: this.clampScale(this.gestureState.scale * scaleChange),
        rotation: this.gestureState.rotation + deltaRotation
      };

      // 檢查是否達到縮放閾值
      if (Math.abs(deltaScale) >= this.config.pinchThreshold) {
        this.triggerPinch(deltaScale, this.gestureState.scale);
      }

      // 檢查是否達到旋轉閾值
      if (Math.abs(deltaRotation) >= this.config.rotateThreshold) {
        this.triggerRotate(deltaRotation, this.gestureState.rotation);
      }

      // 同時也觸發平移（如果中心點移動）
      const deltaCenterX = centerX - this.gestureState.startX;
      const deltaCenterY = centerY - this.gestureState.startY;
      const centerDistance = Math.sqrt(deltaCenterX * deltaCenterX + deltaCenterY * deltaCenterY);

      if (centerDistance >= this.config.panThreshold) {
        const velocityX = deltaCenterX / deltaTime;
        const velocityY = deltaCenterY / deltaTime;
        this.triggerPan(deltaCenterX, deltaCenterY, velocityX, velocityY);
      }
    }
  }

  /**
   * 處理原始觸控結束
   */
  private handleRawTouchEnd(event: TouchEvent): void {
    if (!this.isEnabled) return;

    // 移除結束的觸控點
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touchPoints.delete(touch.identifier);
    }

    // 如果還有觸控點，更新狀態
    if (event.touches.length > 0) {
      if (event.touches.length === 1) {
        this.gestureState.type = 'pan';
      } else if (event.touches.length >= 2) {
        this.gestureState.type = 'pinch';
      }
    } else {
      // 所有觸控點都結束了
      this.handleGestureEnd();
    }
  }

  /**
   * 處理手勢結束
   */
  private handleGestureEnd(): void {
    if (!this.gestureState.isActive) return;

    this.gestureState.isActive = false;

    // 如果有速度，應用慣性
    if (Math.abs(this.gestureState.velocityX) > 0.1 ||
        Math.abs(this.gestureState.velocityY) > 0.1) {
      this.startInertiaAnimation();
    }

    // 觸發手勢結束事件
    this.emitEvent(this.gestureState.type, {
      type: this.gestureState.type,
      state: this.gestureState,
      timestamp: Date.now()
    });
  }

  /**
   * 開始慣性動畫
   */
  private startInertiaAnimation(): void {
    if (this.inertiaAnimationId) {
      cancelAnimationFrame(this.inertiaAnimationId);
    }

    const startTime = Date.now();
    const startVelocityX = this.gestureState.velocityX;
    const startVelocityY = this.gestureState.velocityY;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed >= this.config.inertiaDuration) {
        // 慣性結束
        this.inertiaAnimationId = undefined;
        return;
      }

      // 計算減速度
      const deceleration = this.config.inertiaDeceleration;
      const timeFactor = 1 - (elapsed / this.config.inertiaDuration);

      // 計算當前速度
      const currentVelocityX = startVelocityX * timeFactor;
      const currentVelocityY = startVelocityY * timeFactor;

      // 計算位移
      const deltaX = currentVelocityX * 16; // 假設60fps
      const deltaY = currentVelocityY * 16;

      // 觸發慣性平移事件
      this.triggerPan(deltaX, deltaY, currentVelocityX, currentVelocityY);

      // 繼續動畫
      this.inertiaAnimationId = requestAnimationFrame(animate);
    };

    this.inertiaAnimationId = requestAnimationFrame(animate);
  }

  /**
   * 處理點擊手勢
   */
  private handleTap(event: TouchEventData): void {
    this.triggerGesture('tap', {
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0
    });
  }

  /**
   * 處理雙擊手勢
   */
  private handleDoubleTap(event: TouchEventData): void {
    this.triggerGesture('tap', {
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0
    }, true);
  }

  /**
   * 處理長按手勢
   */
  private handleLongPress(event: TouchEventData): void {
    this.triggerGesture('longPress', {
      deltaX: 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0
    });
  }

  /**
   * 處理滑動手勢
   */
  private handleSwipe(event: TouchEventData): void {
    this.triggerGesture('swipe', {
      deltaX: event.distance || 0,
      deltaY: 0,
      velocityX: 0,
      velocityY: 0
    });
  }

  /**
   * 觸發平移手勢
   */
  private triggerPan(deltaX: number, deltaY: number, velocityX: number, velocityY: number): void {
    this.triggerGesture('pan', {
      deltaX,
      deltaY,
      velocityX,
      velocityY
    });
  }

  /**
   * 觸發縮放手勢
   */
  private triggerPinch(deltaScale: number, scale: number): void {
    this.triggerGesture('pinch', {
      deltaScale,
      deltaRotation: 0,
      velocityX: 0,
      velocityY: 0
    });
  }

  /**
   * 觸發旋轉手勢
   */
  private triggerRotate(deltaRotation: number, rotation: number): void {
    this.triggerGesture('rotate', {
      deltaScale: 0,
      deltaRotation,
      velocityX: 0,
      velocityY: 0
    });
  }

  /**
   * 觸發手勢事件
   */
  private triggerGesture(
    type: GestureType,
    data: {
      deltaX?: number;
      deltaY?: number;
      deltaScale?: number;
      deltaRotation?: number;
      velocityX?: number;
      velocityY?: number;
    },
    isDouble: boolean = false
  ): void {
    const event: GestureEvent = {
      type: isDouble ? 'tap' : type, // 雙擊仍然是tap類型
      state: this.gestureState,
      deltaX: data.deltaX,
      deltaY: data.deltaY,
      deltaScale: data.deltaScale,
      deltaRotation: data.deltaRotation,
      velocityX: data.velocityX,
      velocityY: data.velocityY,
      timestamp: Date.now()
    };

    this.emitEvent(type, event);

    if (isDouble) {
      this.emitEvent('tap', event); // 同時觸發tap事件
    }
  }

  /**
   * 發送事件給所有註冊的處理器
   */
  private emitEvent(type: GestureType, event: GestureEvent): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * 計算觸控點的中心X座標
   */
  private getCenterX(touches: TouchList): number {
    let totalX = 0;
    for (let i = 0; i < touches.length; i++) {
      totalX += touches[i].clientX;
    }
    return totalX / touches.length;
  }

  /**
   * 計算觸控點的中心Y座標
   */
  private getCenterY(touches: TouchList): number {
    let totalY = 0;
    for (let i = 0; i < touches.length; i++) {
      totalY += touches[i].clientY;
    }
    return totalY / touches.length;
  }

  /**
   * 限制縮放比例在最小和最大值之間
   */
  private clampScale(scale: number): number {
    return Math.max(this.config.minScale, Math.min(this.config.maxScale, scale));
  }

  /**
   * 註冊事件處理器
   */
  public on(type: GestureType, handler: GestureEventHandler): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type)!.push(handler);
  }

  /**
   * 移除事件處理器
   */
  public off(type: GestureType, handler: GestureEventHandler): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 啟用/禁用手勢處理
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      // 禁用時重置狀態
      this.gestureState = this.createInitialState();
      this.touchPoints.clear();

      if (this.inertiaAnimationId) {
        cancelAnimationFrame(this.inertiaAnimationId);
        this.inertiaAnimationId = undefined;
      }
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 獲取當前手勢狀態
   */
  public getState(): GestureState {
    return { ...this.gestureState };
  }

  /**
   * 重置手勢狀態
   */
  public reset(): void {
    this.gestureState = this.createInitialState();
    this.touchPoints.clear();

    if (this.inertiaAnimationId) {
      cancelAnimationFrame(this.inertiaAnimationId);
      this.inertiaAnimationId = undefined;
    }
  }

  /**
   * 銷毀管理器
   */
  public destroy(): void {
    this.setEnabled(false);
    this.touchManager.destroy();
    this.eventHandlers.clear();

    // 移除事件監聽器
    this.element.removeEventListener('touchstart', this.handleRawTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleRawTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleRawTouchEnd.bind(this));
  }

  /**
   * 靜態方法：創建適合裝置的手勢配置
   */
  static createConfigForDevice(layoutMode: LayoutMode): Partial<GestureConfig> {
    switch (layoutMode) {
      case 'mobile':
        return {
          pinchThreshold: 0.02, // 手機上需要更大的縮放變化
          rotateThreshold: 3, // 手機上需要更大的旋轉變化
          panThreshold: 8, // 手機上需要更大的平移閾值
          swipeThreshold: 25, // 手機上滑動閾值較小
          inertiaDuration: 400, // 手機上慣性更長
          maxScale: 2.5, // 手機上最大縮放較小
          minScale: 0.7 // 手機上最小縮放較大
        };
      case 'tablet':
        return {
          pinchThreshold: 0.015,
          rotateThreshold: 2.5,
          panThreshold: 6,
          swipeThreshold: 28,
          inertiaDuration: 350,
          maxScale: 2.8,
          minScale: 0.6
        };
      case 'desktop':
        return {
          pinchThreshold: 0.01,
          rotateThreshold: 2,
          panThreshold: 5,
          swipeThreshold: 30,
          inertiaDuration: 300,
          maxScale: 3.0,
          minScale: 0.5
        };
      case 'wide':
      case 'ultra-wide':
        return {
          pinchThreshold: 0.008,
          rotateThreshold: 1.5,
          panThreshold: 4,
          swipeThreshold: 35,
          inertiaDuration: 250,
          maxScale: 3.5,
          minScale: 0.4
        };
      default:
        return {};
    }
  }

  /**
   * 靜態方法：檢查是否支援多點觸控
   */
  static supportsMultiTouch(): boolean {
    return 'ontouchstart' in window &&
           (navigator.maxTouchPoints || 0) >= 2;
  }

  /**
   * 靜態方法：獲取建議的手勢配置
   */
  static getRecommendedConfig(deviceType: 'phone' | 'tablet' | 'desktop'): GestureConfig {
    const baseConfig = DEFAULT_CONFIG;

    switch (deviceType) {
      case 'phone':
        return {
          ...baseConfig,
          pinchThreshold: 0.02,
          rotateThreshold: 3,
          panThreshold: 8,
          swipeThreshold: 25,
          inertiaDuration: 400,
          maxScale: 2.5,
          minScale: 0.7
        };
      case 'tablet':
        return {
          ...baseConfig,
          pinchThreshold: 0.015,
          rotateThreshold: 2.5,
          panThreshold: 6,
          swipeThreshold: 28,
          inertiaDuration: 350,
          maxScale: 2.8,
          minScale: 0.6
        };
      case 'desktop':
        return {
          ...baseConfig,
          pinchThreshold: 0.01,
          rotateThreshold: 2,
          panThreshold: 5,
          swipeThreshold: 30,
          inertiaDuration: 300,
          maxScale: 3.0,
          minScale: 0.5
        };
      default:
        return baseConfig;
    }
  }
}
