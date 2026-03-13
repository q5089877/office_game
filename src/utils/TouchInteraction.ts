/**
 * 觸控互動系統
 * 提供統一的觸控事件處理和手勢檢測
 * 支援多點觸控、滑動、縮放等手勢
 */

import { BREAKPOINTS, LayoutMode } from './responsiveConfig';

// 觸控事件類型
export type TouchEventType = 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate';

// 觸控事件方向
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

// 觸控事件介面
export interface TouchEventData {
  type: TouchEventType;
  x: number;
  y: number;
  target?: EventTarget | null;
  timestamp: number;
  duration?: number; // 事件持續時間（毫秒）
  distance?: number; // 移動距離（像素）
  direction?: SwipeDirection; // 滑動方向
  scale?: number; // 縮放比例
  rotation?: number; // 旋轉角度（度）
  touches?: TouchList; // 原始觸控點
}

// 觸控事件回調
export type TouchEventHandler = (event: TouchEventData) => void;

// 觸控配置選項
export interface TouchConfig {
  tapThreshold: number; // 點擊閾值（毫秒）
  doubleTapThreshold: number; // 雙擊閾值（毫秒）
  longPressThreshold: number; // 長按閾值（毫秒）
  swipeThreshold: number; // 滑動閾值（像素）
  swipeVelocityThreshold: number; // 滑動速度閾值（像素/毫秒）
  pinchThreshold: number; // 縮放閾值（比例）
  rotationThreshold: number; // 旋轉閾值（度）
  preventDefault: boolean; // 是否阻止預設行為
  stopPropagation: boolean; // 是否停止事件傳播
}

// 預設配置
const DEFAULT_CONFIG: TouchConfig = {
  tapThreshold: 300, // 300ms
  doubleTapThreshold: 500, // 500ms
  longPressThreshold: 800, // 800ms
  swipeThreshold: 30, // 30px
  swipeVelocityThreshold: 0.3, // 0.3px/ms
  pinchThreshold: 0.1, // 10%
  rotationThreshold: 5, // 5度
  preventDefault: true,
  stopPropagation: false
};

// 觸控狀態
interface TouchState {
  startTime: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  isTouching: boolean;
  touchCount: number;
  lastTapTime: number;
  lastTapX: number;
  lastTapY: number;
  longPressTimer?: NodeJS.Timeout;
}

/**
 * 觸控互動管理器
 * 提供統一的觸控事件處理和手勢檢測
 */
export class TouchInteractionManager {
  private element: HTMLElement;
  private config: TouchConfig;
  private state: TouchState;
  private eventHandlers: Map<TouchEventType, TouchEventHandler[]>;
  private isEnabled: boolean;

  constructor(element: HTMLElement, config: Partial<TouchConfig> = {}) {
    this.element = element;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
    this.eventHandlers = new Map();
    this.isEnabled = true;

    this.bindEvents();
  }

  /**
   * 創建初始狀態
   */
  private createInitialState(): TouchState {
    return {
      startTime: 0,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
      isTouching: false,
      touchCount: 0,
      lastTapTime: 0,
      lastTapX: 0,
      lastTapY: 0
    };
  }

  /**
   * 綁定事件監聽器
   */
  private bindEvents(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // 也支援滑鼠事件（用於桌面測試）
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  /**
   * 解除綁定事件監聽器
   */
  private unbindEvents(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));

    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  /**
   * 處理觸控開始事件
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.isEnabled) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.touches[0];
    const now = Date.now();

    this.state.startTime = now;
    this.state.startX = touch.clientX;
    this.state.startY = touch.clientY;
    this.state.lastX = touch.clientX;
    this.state.lastY = touch.clientY;
    this.state.lastTime = now;
    this.state.isTouching = true;
    this.state.touchCount = event.touches.length;

    // 設置長按計時器
    this.state.longPressTimer = setTimeout(() => {
      if (this.state.isTouching) {
        this.triggerLongPress(touch.clientX, touch.clientY, event.touches);
      }
    }, this.config.longPressThreshold);

    // 檢查是否為雙擊
    const timeSinceLastTap = now - this.state.lastTapTime;
    const distanceFromLastTap = Math.sqrt(
      Math.pow(touch.clientX - this.state.lastTapX, 2) +
      Math.pow(touch.clientY - this.state.lastTapY, 2)
    );

    if (timeSinceLastTap < this.config.doubleTapThreshold &&
        distanceFromLastTap < this.config.swipeThreshold) {
      // 雙擊事件
      this.triggerDoubleTap(touch.clientX, touch.clientY, event.touches);
      this.state.lastTapTime = 0; // 重置
    }
  }

  /**
   * 處理觸控移動事件
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.isEnabled || !this.state.isTouching) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.touches[0];
    const now = Date.now();
    const deltaTime = now - this.state.lastTime;

    if (deltaTime > 0) {
      const deltaX = touch.clientX - this.state.lastX;
      const deltaY = touch.clientY - this.state.lastY;
      const velocityX = deltaX / deltaTime;
      const velocityY = deltaY / deltaTime;

      this.state.lastX = touch.clientX;
      this.state.lastY = touch.clientY;
      this.state.lastTime = now;

      // 檢查是否達到滑動閾值
      const distance = Math.sqrt(
        Math.pow(touch.clientX - this.state.startX, 2) +
        Math.pow(touch.clientY - this.state.startY, 2)
      );

      if (distance >= this.config.swipeThreshold) {
        // 取消長按計時器
        if (this.state.longPressTimer) {
          clearTimeout(this.state.longPressTimer);
          this.state.longPressTimer = undefined;
        }

        // 檢查速度是否達到滑動閾值
        const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (velocity >= this.config.swipeVelocityThreshold) {
          // 確定滑動方向
          const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
          let direction: SwipeDirection;

          if (angle >= -45 && angle < 45) direction = 'right';
          else if (angle >= 45 && angle < 135) direction = 'down';
          else if (angle >= -135 && angle < -45) direction = 'up';
          else direction = 'left';

          this.triggerSwipe(
            touch.clientX,
            touch.clientY,
            direction,
            distance,
            velocity,
            event.touches
          );
        }
      }

      // 多點觸控處理（縮放和旋轉）
      if (event.touches.length >= 2) {
        this.handleMultiTouch(event.touches);
      }
    }
  }

  /**
   * 處理多點觸控
   */
  private handleMultiTouch(touches: TouchList): void {
    const touch1 = touches[0];
    const touch2 = touches[1];

    // 計算兩點之間的距離和角度
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // 這裡可以實現縮放和旋轉檢測
    // 簡化版本：只記錄多點觸控狀態
    this.state.touchCount = touches.length;
  }

  /**
   * 處理觸控結束事件
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isEnabled || !this.state.isTouching) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const now = Date.now();
    const duration = now - this.state.startTime;
    const distance = Math.sqrt(
      Math.pow(this.state.lastX - this.state.startX, 2) +
      Math.pow(this.state.lastY - this.state.startY, 2)
    );

    // 取消長按計時器
    if (this.state.longPressTimer) {
      clearTimeout(this.state.longPressTimer);
      this.state.longPressTimer = undefined;
    }

    // 檢查是否為點擊
    if (duration < this.config.tapThreshold && distance < this.config.swipeThreshold) {
      this.triggerTap(this.state.lastX, this.state.lastY, event.changedTouches);

      // 記錄最後一次點擊的位置和時間（用於雙擊檢測）
      this.state.lastTapTime = now;
      this.state.lastTapX = this.state.lastX;
      this.state.lastTapY = this.state.lastY;
    }

    // 重置狀態
    this.state.isTouching = false;
    this.state.touchCount = 0;
  }

  /**
   * 處理觸控取消事件
   */
  private handleTouchCancel(event: TouchEvent): void {
    if (!this.isEnabled) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    // 取消長按計時器
    if (this.state.longPressTimer) {
      clearTimeout(this.state.longPressTimer);
      this.state.longPressTimer = undefined;
    }

    // 重置狀態
    this.state.isTouching = false;
    this.state.touchCount = 0;
  }

  /**
   * 滑鼠事件處理（用於桌面測試）
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.isEnabled) return;

    // 模擬觸控開始
    const fakeTouchEvent = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }] as any,
      changedTouches: [{ clientX: event.clientX, clientY: event.clientY }] as any,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    } as TouchEvent;

    this.handleTouchStart(fakeTouchEvent);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isEnabled || !this.state.isTouching) return;

    // 模擬觸控移動
    const fakeTouchEvent = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }] as any,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    } as TouchEvent;

    this.handleTouchMove(fakeTouchEvent);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.isEnabled || !this.state.isTouching) return;

    // 模擬觸控結束
    const fakeTouchEvent = {
      changedTouches: [{ clientX: event.clientX, clientY: event.clientY }] as any,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    } as TouchEvent;

    this.handleTouchEnd(fakeTouchEvent);
  }

  private handleMouseLeave(event: MouseEvent): void {
    if (!this.isEnabled || !this.state.isTouching) return;

    // 模擬觸控取消
    const fakeTouchEvent = {
      changedTouches: [{ clientX: event.clientX, clientY: event.clientY }] as any,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation()
    } as TouchEvent;

    this.handleTouchCancel(fakeTouchEvent);
  }

  /**
   * 觸發點擊事件
   */
  private triggerTap(x: number, y: number, touches?: TouchList): void {
    const eventData: TouchEventData = {
      type: 'tap',
      x,
      y,
      timestamp: Date.now(),
      touches
    };

    this.emitEvent('tap', eventData);
  }

  /**
   * 觸發雙擊事件
   */
  private triggerDoubleTap(x: number, y: number, touches?: TouchList): void {
    const eventData: TouchEventData = {
      type: 'doubleTap',
      x,
      y,
      timestamp: Date.now(),
      touches
    };

    this.emitEvent('doubleTap', eventData);
  }

  /**
   * 觸發長按事件
   */
  private triggerLongPress(x: number, y: number, touches?: TouchList): void {
    const eventData: TouchEventData = {
      type: 'longPress',
      x,
      y,
      timestamp: Date.now(),
      duration: this.config.longPressThreshold,
      touches
    };

    this.emitEvent('longPress', eventData);
  }

  /**
   * 觸發滑動事件
   */
  private triggerSwipe(
    x: number,
    y: number,
    direction: SwipeDirection,
    distance: number,
    velocity: number,
    touches?: TouchList
  ): void {
    const eventData: TouchEventData = {
      type: 'swipe',
      x,
      y,
      timestamp: Date.now(),
      distance,
      direction,
      touches
    };

    this.emitEvent('swipe', eventData);
  }

  /**
   * 發送事件給所有註冊的處理器
   */
  private emitEvent(type: TouchEventType, data: TouchEventData): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * 註冊事件處理器
   */
  public on(type: TouchEventType, handler: TouchEventHandler): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type)!.push(handler);
  }

  /**
   * 移除事件處理器
   */
  public off(type: TouchEventType, handler: TouchEventHandler): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 啟用/禁用觸控處理
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      // 禁用時重置狀態
      this.state = this.createInitialState();
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<TouchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 銷毀管理器
   */
  public destroy(): void {
    this.unbindEvents();
    this.eventHandlers.clear();

    if (this.state.longPressTimer) {
      clearTimeout(this.state.longPressTimer);
    }
  }

  /**
   * 靜態方法：創建適合裝置的觸控配置
   */
  static createConfigForDevice(layoutMode: LayoutMode): Partial<TouchConfig> {
    switch (layoutMode) {
      case 'mobile':
        return {
          tapThreshold: 350, // 手機需要更長的點擊時間
          longPressThreshold: 1000, // 手機長按時間更長
          swipeThreshold: 20, // 手機滑動閾值較小
          preventDefault: true
        };
      case 'tablet':
        return {
          tapThreshold: 300,
          longPressThreshold: 900,
          swipeThreshold: 25,
          preventDefault: true
        };
      case 'desktop':
      case 'wide':
      case 'ultra-wide':
        return {
          tapThreshold: 250, // 桌面點擊更快
          longPressThreshold: 700,
          swipeThreshold: 30,
          preventDefault: false // 桌面不需要阻止預設行為
        };
      default:
        return {};
    }
  }

  /**
   * 靜態方法：檢查是否為觸控裝置
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           (navigator as any).msMaxTouchPoints > 0;
  }

  /**
   * 靜態方法：獲取最佳觸控目標尺寸
   */
  static getOptimalTouchTargetSize(layoutMode: LayoutMode): { width: number; height: number } {
    // WCAG標準：最小觸控目標為44x44像素
    const baseSize = 44;

    switch (layoutMode) {
      case 'mobile':
        return { width: baseSize * 1.2, height: baseSize * 1.2 }; // 手機上稍大
      case 'tablet':
        return { width: baseSize * 1.1, height: baseSize * 1.1 }; // 平板上適中
      default:
        return { width: baseSize, height: baseSize }; // 桌面使用標準尺寸
    }
  }

  /**
   * 靜態方法：計算觸控目標間距
   */
  static getTouchTargetSpacing(layoutMode: LayoutMode): number {
    switch (layoutMode) {
      case 'mobile':
        return 12; // 手機上間距較大
      case 'tablet':
        return 10; // 平板上適中
      default:
        return 8; // 桌面上較小
    }
  }
}
