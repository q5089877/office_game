/**
 * 觸控互動Hook
 * 提供React組件中的觸控互動功能
 * 整合觸控管理器、手勢檢測和觸控目標優化
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TouchInteractionManager, TouchEventData, TouchConfig } from '../utils/TouchInteraction';
import { TouchTargetOptimizer, TouchTargetConfig, TouchTargetType } from '../utils/TouchTargetOptimizer';
import { GestureManager, GestureEvent, GestureConfig } from '../utils/GestureManager';
import { LayoutMode } from '../utils/responsiveConfig';

// Hook配置選項
export interface UseTouchInteractionOptions {
  elementRef?: React.RefObject<HTMLElement>;
  enableTouchDetection?: boolean;
  enableGestureDetection?: boolean;
  enableTouchOptimization?: boolean;
  touchConfig?: Partial<TouchConfig>;
  gestureConfig?: Partial<GestureConfig>;
  touchTargetConfig?: Partial<TouchTargetConfig>;
  layoutMode?: LayoutMode;
  onTap?: (event: TouchEventData) => void;
  onDoubleTap?: (event: TouchEventData) => void;
  onLongPress?: (event: TouchEventData) => void;
  onSwipe?: (event: TouchEventData) => void;
  onPinch?: (event: GestureEvent) => void;
  onRotate?: (event: GestureEvent) => void;
  onPan?: (event: GestureEvent) => void;
}

// Hook返回值
export interface UseTouchInteractionReturn {
  // 狀態
  isTouchDevice: boolean;
  isTouching: boolean;
  touchCount: number;
  lastTouchPosition: { x: number; y: number } | null;

  // 管理器實例
  touchManager: TouchInteractionManager | null;
  gestureManager: GestureManager | null;
  touchOptimizer: TouchTargetOptimizer | null;

  // 方法
  enable: () => void;
  disable: () => void;
  updateConfig: (config: Partial<UseTouchInteractionOptions>) => void;
  optimizeElement: (element: HTMLElement, type: TouchTargetType) => void;
  restoreElement: (element: HTMLElement) => boolean;

  // 事件處理器綁定
  bindTouchEvents: (element: HTMLElement) => void;
  unbindTouchEvents: (element: HTMLElement) => void;
}

/**
 * 觸控互動Hook
 * 提供React組件中的觸控互動功能
 */
export function useTouchInteraction(
  options: UseTouchInteractionOptions = {}
): UseTouchInteractionReturn {
  const {
    elementRef,
    enableTouchDetection = true,
    enableGestureDetection = true,
    enableTouchOptimization = true,
    touchConfig = {},
    gestureConfig = {},
    touchTargetConfig = {},
    layoutMode = 'desktop',
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    onRotate,
    onPan
  } = options;

  // 狀態
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // 管理器引用
  const touchManagerRef = useRef<TouchInteractionManager | null>(null);
  const gestureManagerRef = useRef<GestureManager | null>(null);
  const touchOptimizerRef = useRef<TouchTargetOptimizer | null>(null);
  const elementRefInternal = useRef<HTMLElement | null>(null);

  // 初始化
  useEffect(() => {
    // 檢查是否為觸控裝置
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0 ||
                     (navigator as any).msMaxTouchPoints > 0;
      setIsTouchDevice(isTouch);
      return isTouch;
    };

    const isTouch = checkTouchDevice();

    // 如果不需要觸控功能，則跳過初始化
    if (!isTouch && !enableTouchDetection) {
      return;
    }

    // 獲取目標元素
    const element = elementRef?.current || elementRefInternal.current;
    if (!element) {
      console.warn('useTouchInteraction: No element provided');
      return;
    }

    // 初始化觸控管理器
    if (enableTouchDetection && !touchManagerRef.current) {
      const manager = new TouchInteractionManager(element, touchConfig);
      touchManagerRef.current = manager;

      // 註冊事件處理器
      if (onTap) manager.on('tap', onTap);
      if (onDoubleTap) manager.on('doubleTap', onDoubleTap);
      if (onLongPress) manager.on('longPress', onLongPress);
      if (onSwipe) manager.on('swipe', onSwipe);

      // 監聽觸控狀態
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }

    // 初始化手勢管理器
    if (enableGestureDetection && !gestureManagerRef.current) {
      const manager = new GestureManager(element, gestureConfig);
      gestureManagerRef.current = manager;

      // 註冊事件處理器
      if (onPinch) manager.on('pinch', onPinch);
      if (onRotate) manager.on('rotate', onRotate);
      if (onPan) manager.on('pan', onPan);
    }

    // 初始化觸控目標優化器
    if (enableTouchOptimization && !touchOptimizerRef.current) {
      const optimizer = new TouchTargetOptimizer(layoutMode);
      touchOptimizerRef.current = optimizer;

      // 設置觸控管理器（如果可用）
      if (touchManagerRef.current) {
        optimizer.setTouchInteractionManager(touchManagerRef.current);
      }
    }

    // 清理函數
    return () => {
      if (touchManagerRef.current) {
        touchManagerRef.current.destroy();
        touchManagerRef.current = null;
      }

      if (gestureManagerRef.current) {
        gestureManagerRef.current.destroy();
        gestureManagerRef.current = null;
      }

      if (touchOptimizerRef.current) {
        touchOptimizerRef.current.destroy();
        touchOptimizerRef.current = null;
      }

      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    elementRef?.current,
    enableTouchDetection,
    enableGestureDetection,
    enableTouchOptimization,
    layoutMode
  ]);

  // 處理觸控開始
  const handleTouchStart = useCallback((event: TouchEvent) => {
    setIsTouching(true);
    setTouchCount(event.touches.length);

    if (event.touches.length > 0) {
      const touch = event.touches[0];
      setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  // 處理觸控結束
  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    setTouchCount(0);
  }, []);

  // 啟用功能
  const enable = useCallback(() => {
    if (touchManagerRef.current) {
      touchManagerRef.current.setEnabled(true);
    }

    if (gestureManagerRef.current) {
      gestureManagerRef.current.setEnabled(true);
    }
  }, []);

  // 禁用功能
  const disable = useCallback(() => {
    if (touchManagerRef.current) {
      touchManagerRef.current.setEnabled(false);
    }

    if (gestureManagerRef.current) {
      gestureManagerRef.current.setEnabled(false);
    }

    setIsTouching(false);
    setTouchCount(0);
    setLastTouchPosition(null);
  }, []);

  // 更新配置
  const updateConfig = useCallback((config: Partial<UseTouchInteractionOptions>) => {
    if (config.touchConfig && touchManagerRef.current) {
      touchManagerRef.current.updateConfig(config.touchConfig);
    }

    if (config.gestureConfig && gestureManagerRef.current) {
      gestureManagerRef.current.updateConfig(config.gestureConfig);
    }

    if (config.layoutMode && touchOptimizerRef.current) {
      touchOptimizerRef.current.setLayoutMode(config.layoutMode);
    }
  }, []);

  // 優化元素
  const optimizeElement = useCallback((element: HTMLElement, type: TouchTargetType = 'custom') => {
    if (!touchOptimizerRef.current) {
      console.warn('useTouchInteraction: Touch optimizer not initialized');
      return;
    }

    return touchOptimizerRef.current.optimizeElement(element, type, touchTargetConfig);
  }, [touchTargetConfig]);

  // 恢復元素
  const restoreElement = useCallback((element: HTMLElement) => {
    if (!touchOptimizerRef.current) {
      console.warn('useTouchInteraction: Touch optimizer not initialized');
      return false;
    }

    return touchOptimizerRef.current.restoreElement(element);
  }, []);

  // 綁定觸控事件
  const bindTouchEvents = useCallback((element: HTMLElement) => {
    elementRefInternal.current = element;

    // 重新初始化管理器
    if (enableTouchDetection && !touchManagerRef.current) {
      const manager = new TouchInteractionManager(element, touchConfig);
      touchManagerRef.current = manager;

      if (onTap) manager.on('tap', onTap);
      if (onDoubleTap) manager.on('doubleTap', onDoubleTap);
      if (onLongPress) manager.on('longPress', onLongPress);
      if (onSwipe) manager.on('swipe', onSwipe);

      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }

    if (enableGestureDetection && !gestureManagerRef.current) {
      const manager = new GestureManager(element, gestureConfig);
      gestureManagerRef.current = manager;

      if (onPinch) manager.on('pinch', onPinch);
      if (onRotate) manager.on('rotate', onRotate);
      if (onPan) manager.on('pan', onPan);
    }
  }, [
    enableTouchDetection,
    enableGestureDetection,
    touchConfig,
    gestureConfig,
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    onRotate,
    onPan,
    handleTouchStart,
    handleTouchEnd
  ]);

  // 解除綁定觸控事件
  const unbindTouchEvents = useCallback((element: HTMLElement) => {
    if (touchManagerRef.current) {
      touchManagerRef.current.destroy();
      touchManagerRef.current = null;
    }

    if (gestureManagerRef.current) {
      gestureManagerRef.current.destroy();
      gestureManagerRef.current = null;
    }

    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);

    elementRefInternal.current = null;
  }, [handleTouchStart, handleTouchEnd]);

  return {
    // 狀態
    isTouchDevice,
    isTouching,
    touchCount,
    lastTouchPosition,

    // 管理器實例
    touchManager: touchManagerRef.current,
    gestureManager: gestureManagerRef.current,
    touchOptimizer: touchOptimizerRef.current,

    // 方法
    enable,
    disable,
    updateConfig,
    optimizeElement,
    restoreElement,

    // 事件處理器綁定
    bindTouchEvents,
    unbindTouchEvents
  };
}

/**
 * 簡化版觸控Hook：僅用於檢測觸控裝置
 */
export function useTouchDeviceDetection(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0 ||
                     (navigator as any).msMaxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };

    checkTouchDevice();

    // 監聽視窗大小變化（某些裝置在旋轉時可能改變觸控能力）
    window.addEventListener('resize', checkTouchDevice);

    return () => {
      window.removeEventListener('resize', checkTouchDevice);
    };
  }, []);

  return isTouchDevice;
}

/**
 * 觸控目標優化Hook
 */
export function useTouchTargetOptimization(
  elementRef: React.RefObject<HTMLElement>,
  type: TouchTargetType = 'custom',
  config?: Partial<TouchTargetConfig>,
  layoutMode: LayoutMode = 'desktop'
): {
  isOptimized: boolean;
  optimize: () => void;
  restore: () => void;
  validate: () => ReturnType<TouchTargetOptimizer['validateElement']>;
} {
  const [isOptimized, setIsOptimized] = useState(false);
  const optimizerRef = useRef<TouchTargetOptimizer | null>(null);

  // 初始化優化器
  useEffect(() => {
    if (!elementRef.current) return;

    optimizerRef.current = new TouchTargetOptimizer(layoutMode);

    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.destroy();
        optimizerRef.current = null;
      }
    };
  }, [elementRef.current, layoutMode]);

  // 優化元素
  const optimize = useCallback(() => {
    if (!elementRef.current || !optimizerRef.current) return;

    optimizerRef.current.optimizeElement(elementRef.current, type, config);
    setIsOptimized(true);
  }, [elementRef.current, type, config]);

  // 恢復元素
  const restore = useCallback(() => {
    if (!elementRef.current || !optimizerRef.current) return;

    const restored = optimizerRef.current.restoreElement(elementRef.current);
    if (restored) {
      setIsOptimized(false);
    }
  }, [elementRef.current]);

  // 驗證元素
  const validate = useCallback(() => {
    if (!elementRef.current || !optimizerRef.current) {
      return {
        isValid: false,
        issues: ['Element or optimizer not available'],
        recommendations: ['Initialize optimizer first']
      };
    }

    return optimizerRef.current.validateElement(elementRef.current, type);
  }, [elementRef.current, type]);

  return {
    isOptimized,
    optimize,
    restore,
    validate
  };
}

/**
 * 手勢檢測Hook
 */
export function useGestureDetection(
  elementRef: React.RefObject<HTMLElement>,
  config?: Partial<GestureConfig>
): {
  gestureManager: GestureManager | null;
  bindGestures: () => void;
  unbindGestures: () => void;
} {
  const [gestureManager, setGestureManager] = useState<GestureManager | null>(null);

  // 綁定手勢
  const bindGestures = useCallback(() => {
    if (!elementRef.current) return;

    const manager = new GestureManager(elementRef.current, config);
    setGestureManager(manager);
  }, [elementRef.current, config]);

  // 解除綁定手勢
  const unbindGestures = useCallback(() => {
    if (gestureManager) {
      gestureManager.destroy();
      setGestureManager(null);
    }
  }, [gestureManager]);

  // 清理
  useEffect(() => {
    return () => {
      if (gestureManager) {
        gestureManager.destroy();
      }
    };
  }, [gestureManager]);

  return {
    gestureManager,
    bindGestures,
    unbindGestures
  };
}
