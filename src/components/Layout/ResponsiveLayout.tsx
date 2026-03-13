/**
 * 響應式佈局組件
 * 根據裝置類型和螢幕尺寸動態調整佈局
 * 提供統一的佈局管理和子組件分配
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { AvailableSpaceCalculator, UIElementType } from '../../utils/AvailableSpaceCalculator';
import { TextScaleManager } from '../../utils/TextScaleManager';
import { TouchTargetOptimizer } from '../../utils/TouchTargetOptimizer';
import { LayoutMode } from '../../utils/responsiveConfig';

// 佈局配置
export interface ResponsiveLayoutConfig {
  baseWidth: number;
  baseHeight: number;
  enableTouchOptimization: boolean;
  enableTextScaling: boolean;
  enableSpaceAllocation: boolean;
  defaultLayoutMode?: LayoutMode;
  onLayoutChange?: (layoutMode: LayoutMode) => void;
  onScaleChange?: (scale: number) => void;
}

// 子組件配置
export interface LayoutChildConfig {
  id: string;
  elementType: UIElementType;
  component: ReactNode;
  priority: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  visible?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// 佈局屬性
export interface ResponsiveLayoutProps {
  children?: ReactNode;
  config?: Partial<ResponsiveLayoutConfig>;
  childConfigs?: LayoutChildConfig[];
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

/**
 * 響應式佈局組件
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  config = {},
  childConfigs = [],
  className = '',
  style = {},
  testId = 'responsive-layout'
}) => {
  // 合併配置
  const fullConfig: ResponsiveLayoutConfig = {
    baseWidth: 1200,
    baseHeight: 800,
    enableTouchOptimization: true,
    enableTextScaling: true,
    enableSpaceAllocation: true,
    defaultLayoutMode: 'desktop',
    ...config
  };

  // 狀態
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(fullConfig.defaultLayoutMode || 'desktop');
  const [childElements, setChildElements] = useState<LayoutChildConfig[]>(childConfigs);
  const [allocatedSpaces, setAllocatedSpaces] = useState<any[]>([]);

  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const spaceCalculatorRef = useRef<AvailableSpaceCalculator | null>(null);
  const textScaleManagerRef = useRef<TextScaleManager | null>(null);
  const touchOptimizerRef = useRef<TouchTargetOptimizer | null>(null);

  // 使用響應式佈局Hook
  const responsiveLayout = useResponsiveLayout({
    baseWidth: fullConfig.baseWidth,
    baseHeight: fullConfig.baseHeight,
    onScaleChange: (result) => {
      config.onScaleChange?.(result.scale);
    },
    onDeviceChange: (deviceInfo) => {
      const newLayoutMode = deviceInfo.layoutMode;
      setLayoutMode(newLayoutMode);
      config.onLayoutChange?.(newLayoutMode);
    }
  });

  // 初始化管理器
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // 初始化空間計算器
    spaceCalculatorRef.current = new AvailableSpaceCalculator(width, height, layoutMode);

    // 初始化文字縮放管理器
    textScaleManagerRef.current = new TextScaleManager({}, layoutMode);

    // 初始化觸控目標優化器
    if (fullConfig.enableTouchOptimization) {
      touchOptimizerRef.current = new TouchTargetOptimizer(layoutMode);
    }

    // 應用文字縮放
    if (fullConfig.enableTextScaling && textScaleManagerRef.current) {
      textScaleManagerRef.current.applyCSSVariables();
    }

    // 計算空間分配
    if (fullConfig.enableSpaceAllocation && spaceCalculatorRef.current && childElements.length > 0) {
      const elementTypes = childElements
        .filter(child => child.visible !== false)
        .map(child => child.elementType);

      const allocations = spaceCalculatorRef.current.allocateSpaceForElements(
        elementTypes,
        getLayoutForMode(layoutMode)
      );

      setAllocatedSpaces(allocations);
    }

    // 優化觸控目標
    if (fullConfig.enableTouchOptimization && touchOptimizerRef.current) {
      setTimeout(() => {
        optimizeTouchTargets();
      }, 100);
    }

    return () => {
      // 清理
      if (touchOptimizerRef.current) {
        touchOptimizerRef.current.destroy();
      }
    };
  }, [layoutMode, childElements.length]);

  // 處理視窗大小變化
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !spaceCalculatorRef.current) return;

      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();

      spaceCalculatorRef.current.setContainerSize(width, height);

      if (fullConfig.enableSpaceAllocation && childElements.length > 0) {
        const elementTypes = childElements
          .filter(child => child.visible !== false)
          .map(child => child.elementType);

        const allocations = spaceCalculatorRef.current.allocateSpaceForElements(
          elementTypes,
          getLayoutForMode(layoutMode)
        );

        setAllocatedSpaces(allocations);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始調用

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [layoutMode, childElements]);

  // 根據佈局模式獲取佈局類型
  const getLayoutForMode = (mode: LayoutMode): 'horizontal' | 'vertical' | 'grid' => {
    switch (mode) {
      case 'mobile':
        return 'vertical'; // 手機上垂直佈局
      case 'tablet':
        return 'horizontal'; // 平板上水平佈局
      case 'desktop':
        return 'grid'; // 桌面上網格佈局
      case 'wide':
        return 'grid'; // 寬螢幕網格佈局
      case 'ultra-wide':
        return 'grid'; // 超寬螢幕網格佈局
      default:
        return 'horizontal';
    }
  };

  // 優化觸控目標
  const optimizeTouchTargets = () => {
    if (!touchOptimizerRef.current || !containerRef.current) return;

    const container = containerRef.current;

    // 優化按鈕
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      touchOptimizerRef.current?.optimizeElement(button, 'button');
    });

    // 優化連結
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      touchOptimizerRef.current?.optimizeElement(link, 'link');
    });

    // 優化輸入框
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      touchOptimizerRef.current?.optimizeElement(input as HTMLElement, 'input');
    });

    // 優化卡片
    const cards = container.querySelectorAll('[data-card]');
    cards.forEach(card => {
      touchOptimizerRef.current?.optimizeElement(card as HTMLElement, 'card');
    });
  };

  // 添加子組件
  const addChild = (childConfig: LayoutChildConfig) => {
    setChildElements(prev => [...prev, childConfig]);
  };

  // 移除子組件
  const removeChild = (id: string) => {
    setChildElements(prev => prev.filter(child => child.id !== id));
  };

  // 更新子組件
  const updateChild = (id: string, updates: Partial<LayoutChildConfig>) => {
    setChildElements(prev =>
      prev.map(child =>
        child.id === id ? { ...child, ...updates } : child
      )
    );
  };

  // 獲取子組件樣式
  const getChildStyle = (childId: string): React.CSSProperties => {
    const allocation = allocatedSpaces.find(alloc =>
      alloc.elementType === childElements.find(c => c.id === childId)?.elementType
    );

    if (!allocation) return {};

    return {
      position: 'absolute',
      left: `${allocation.x}px`,
      top: `${allocation.y}px`,
      width: `${allocation.allocatedWidth}px`,
      height: `${allocation.allocatedHeight}px`,
      ...childElements.find(c => c.id === childId)?.style
    };
  };

  // 渲染子組件
  const renderChildren = () => {
    if (childElements.length === 0 && !children) {
      return null;
    }

    // 如果有配置的子組件，使用配置渲染
    if (childElements.length > 0) {
      return childElements
        .filter(child => child.visible !== false)
        .sort((a, b) => b.priority - a.priority) // 按優先級排序
        .map(child => (
          <div
            key={child.id}
            className={`layout-child ${child.className || ''}`}
            style={getChildStyle(child.id)}
            data-element-type={child.elementType}
            data-layout-child-id={child.id}
          >
            {child.component}
          </div>
        ));
    }

    // 否則渲染children
    return children;
  };

  // 獲取容器樣式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...style
  };

  // 添加佈局模式類別
  const layoutClasses = [
    'responsive-layout',
    `layout-mode-${layoutMode}`,
    `device-${responsiveLayout.deviceInfo?.type || 'desktop'}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={layoutClasses}
      style={containerStyle}
      data-testid={testId}
      data-layout-mode={layoutMode}
      data-scale-factor={responsiveLayout.scaleResult?.scale.toFixed(2)}
    >
      {/* 調試資訊（僅在開發模式下顯示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="layout-debug-info">
          <div>佈局模式: {layoutMode}</div>
          <div>裝置類型: {responsiveLayout.deviceInfo?.type}</div>
          <div>縮放比例: {responsiveLayout.scaleResult?.scale.toFixed(2)}</div>
          <div>子組件數量: {childElements.length}</div>
        </div>
      )}

      {/* 渲染內容 */}
      {renderChildren()}

      {/* 樣式 */}
      <style>{`
        .responsive-layout {
          --layout-mode: ${layoutMode};
          --scale-factor: ${responsiveLayout.scaleResult?.scale || 1};
        }

        .layout-mode-mobile {
          --touch-target-size: 48px;
          --text-scale-ratio: 0.85;
        }

        .layout-mode-tablet {
          --touch-target-size: 44px;
          --text-scale-ratio: 0.95;
        }

        .layout-mode-desktop {
          --touch-target-size: 40px;
          --text-scale-ratio: 1.0;
        }

        .layout-mode-wide {
          --touch-target-size: 38px;
          --text-scale-ratio: 1.05;
        }

        .layout-mode-ultra-wide {
          --touch-target-size: 36px;
          --text-scale-ratio: 1.1;
        }

        .layout-child {
          transition: all 0.3s ease;
        }

        .layout-debug-info {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          pointer-events: none;
        }

        /* 觸控目標優化樣式 */
        .touch-target-optimized {
          min-width: var(--touch-target-size, 44px);
          min-height: var(--touch-target-size, 44px);
        }

        .touch-feedback-enabled:active {
          transform: scale(0.95);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

/**
 * 佈局上下文提供者
 */
export const ResponsiveLayoutProvider: React.FC<{
  children: ReactNode;
  config?: Partial<ResponsiveLayoutConfig>;
}> = ({ children, config }) => {
  return (
    <ResponsiveLayout config={config}>
      {children}
    </ResponsiveLayout>
  );
};

/**
 * 佈局子組件
 */
export const LayoutChild: React.FC<{
  id: string;
  elementType: UIElementType;
  priority?: number;
  visible?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}> = ({
  id,
  elementType,
  priority = 5,
  visible = true,
  className = '',
  style = {},
  children
}) => {
  // 這個組件主要用於標記，實際渲染由ResponsiveLayout處理
  return (
    <div
      className={`layout-child-placeholder ${className}`}
      style={style}
      data-layout-child-id={id}
      data-element-type={elementType}
      data-priority={priority}
      data-visible={visible}
    >
      {children}
    </div>
  );
};

/**
 * 快速佈局組件：用於常見佈局模式
 */
export const MobileLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ResponsiveLayout config={{ defaultLayoutMode: 'mobile' }}>
    {children}
  </ResponsiveLayout>
);

export const TabletLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ResponsiveLayout config={{ defaultLayoutMode: 'tablet' }}>
    {children}
  </ResponsiveLayout>
);

export const DesktopLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ResponsiveLayout config={{ defaultLayoutMode: 'desktop' }}>
    {children}
  </ResponsiveLayout>
);

export const WideLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ResponsiveLayout config={{ defaultLayoutMode: 'wide' }}>
    {children}
  </ResponsiveLayout>
);

/**
 * 佈局工具Hook
 */
export function useResponsiveLayoutContext() {
  // 這個Hook可以在子組件中獲取佈局上下文
  // 簡化版本：返回一些有用的資訊
  return {
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };
}
