/**
 * 響應式文字組件
 * 根據裝置尺寸和佈局模式動態調整文字大小
 * 提供一致的文字縮放和可讀性優化
 */

import React, { useState, useEffect, useRef } from 'react';
import { TextScaleManager, TextType } from '../../utils/TextScaleManager';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { LayoutMode } from '../../utils/responsiveConfig';

// 文字組件屬性
export interface ResponsiveTextProps {
  // 文字內容
  children: React.ReactNode;

  // 文字類型
  type?: TextType;

  // 自定義配置
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  fontWeight?: number | string;
  fontFamily?: string;

  // 響應式配置
  responsive?: boolean;
  minSize?: number;
  maxSize?: number;

  // 佈局模式（自動檢測或手動指定）
  layoutMode?: LayoutMode;

  // 樣式和類別
  className?: string;
  style?: React.CSSProperties;

  // 事件處理
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // 輔助功能
  title?: string;
  ariaLabel?: string;
  role?: string;

  // 測試
  testId?: string;
}

/**
 * 響應式文字組件
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  type = 'body',
  size,
  lineHeight,
  letterSpacing,
  fontWeight,
  fontFamily,
  responsive = true,
  minSize,
  maxSize,
  layoutMode,
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  title,
  ariaLabel,
  role,
  testId = 'responsive-text'
}) => {
  // 狀態
  const [computedStyle, setComputedStyle] = useState<React.CSSProperties>({});
  const [textScaleManager, setTextScaleManager] = useState<TextScaleManager | null>(null);

  // 引用
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用響應式佈局Hook
  const responsiveLayout = useResponsiveLayout({
    baseWidth: 1200,
    baseHeight: 800
  });

  // 初始化文字縮放管理器
  useEffect(() => {
    const currentLayoutMode = layoutMode || responsiveLayout.deviceInfo?.layoutMode || 'desktop';
    const manager = new TextScaleManager({}, currentLayoutMode);

    // 註冊自定義配置（如果提供了自定義參數）
    if (size !== undefined || minSize !== undefined || maxSize !== undefined) {
      const customConfig: any = {};
      if (size !== undefined) customConfig.baseSize = size;
      if (minSize !== undefined) customConfig.minSize = minSize;
      if (maxSize !== undefined) customConfig.maxSize = maxSize;
      if (lineHeight !== undefined) customConfig.lineHeight = lineHeight;
      if (letterSpacing !== undefined) customConfig.letterSpacing = letterSpacing;
      if (fontWeight !== undefined) customConfig.fontWeight = fontWeight;
      if (fontFamily !== undefined) customConfig.fontFamily = fontFamily;
      customConfig.responsive = responsive;

      manager.registerCustomConfig(type, customConfig);
    }

    setTextScaleManager(manager);

    // 計算樣式
    const textStyle = manager.generateStyle(type);
    setComputedStyle(textStyle);

    // 應用CSS變數
    if (responsive) {
      manager.applyCSSVariables();
    }
  }, [
    type,
    size,
    lineHeight,
    letterSpacing,
    fontWeight,
    fontFamily,
    responsive,
    minSize,
    maxSize,
    layoutMode,
    responsiveLayout.deviceInfo?.layoutMode
  ]);

  // 監聽佈局模式變化
  useEffect(() => {
    if (!textScaleManager || !responsiveLayout.deviceInfo) return;

    const currentLayoutMode = layoutMode || responsiveLayout.deviceInfo.layoutMode;
    textScaleManager.setLayoutMode(currentLayoutMode);

    // 更新樣式
    const textStyle = textScaleManager.generateStyle(type);
    setComputedStyle(textStyle);

    // 更新CSS變數
    if (responsive) {
      textScaleManager.applyCSSVariables();
    }
  }, [textScaleManager, responsiveLayout.deviceInfo?.layoutMode, layoutMode, type, responsive]);

  // 處理點擊事件
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // 處理滑鼠進入事件
  const handleMouseEnter = () => {
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  // 處理滑鼠離開事件
  const handleMouseLeave = () => {
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  // 合併樣式
  const mergedStyle: React.CSSProperties = {
    ...computedStyle,
    ...style,
    cursor: onClick ? 'pointer' : 'inherit'
  };

  // 添加互動類別
  const interactionClass = onClick ? 'interactive-text' : '';

  // 構建類別字符串
  const classNames = [
    'responsive-text',
    `text-type-${type}`,
    `layout-mode-${layoutMode || responsiveLayout.deviceInfo?.layoutMode || 'desktop'}`,
    interactionClass,
    className
  ].filter(Boolean).join(' ');

  // 驗證可讀性
  const validateReadability = () => {
    if (!textScaleManager) return { isValid: true, issues: [], recommendations: [] };

    const currentLayoutMode = layoutMode || responsiveLayout.deviceInfo?.layoutMode || 'desktop';
    const context = currentLayoutMode === 'mobile' ? 'mobile' :
                   currentLayoutMode === 'tablet' ? 'tablet' : 'desktop';

    return textScaleManager.validateReadability(type, context);
  };

  // 獲取文字大小資訊
  const getTextSizeInfo = () => {
    if (!textScaleManager) return { baseSize: 0, scaledSize: 0 };

    const baseSize = textScaleManager.getTextConfig(type).baseSize;
    const scaledSize = textScaleManager.calculateFontSize(type);

    return { baseSize, scaledSize };
  };

  // 渲染調試資訊（僅在開發模式下）
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    const readability = validateReadability();
    const sizeInfo = getTextSizeInfo();

    return (
      <div className="text-debug-info" style={{
        position: 'absolute',
        top: '-20px',
        right: '0',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '2px 4px',
        fontSize: '10px',
        borderRadius: '2px',
        display: readability.isValid ? 'none' : 'block'
      }}>
        {!readability.isValid && `⚠️ ${readability.issues[0]}`}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="responsive-text-container"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <span
        ref={textRef}
        className={classNames}
        style={mergedStyle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={title}
        aria-label={ariaLabel}
        role={role}
        data-testid={testId}
        data-text-type={type}
        data-responsive={responsive}
        data-layout-mode={layoutMode || responsiveLayout.deviceInfo?.layoutMode}
      >
        {children}
      </span>

      {renderDebugInfo()}

      {/* 樣式 */}
      <style>{`
        .responsive-text {
          transition: all 0.2s ease;
        }

        .interactive-text:hover {
          opacity: 0.8;
        }

        .interactive-text:active {
          transform: scale(0.98);
        }

        /* 文字類型特定樣式 */
        .text-type-heading1 {
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .text-type-heading2 {
          font-weight: 700;
          letter-spacing: -0.25px;
        }

        .text-type-heading3 {
          font-weight: 600;
        }

        .text-type-body {
          line-height: 1.6;
        }

        .text-type-bodySmall {
          line-height: 1.6;
        }

        .text-type-caption {
          letter-spacing: 0.25px;
        }

        .text-type-button {
          font-weight: 600;
          letter-spacing: 0.25px;
          text-transform: uppercase;
        }

        .text-type-buttonSmall {
          font-weight: 600;
          letter-spacing: 0.1px;
          text-transform: uppercase;
        }

        /* 遊戲特定文字樣式 */
        .text-type-gameTitle {
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .text-type-gameSubtitle {
          font-weight: 700;
          letter-spacing: -0.25px;
        }

        .text-type-gameBody {
          line-height: 1.5;
        }

        .text-type-gameCaption {
          font-weight: 500;
          letter-spacing: 0.1px;
        }

        /* 佈局模式特定調整 */
        .layout-mode-mobile .responsive-text {
          /* 手機上文字稍大以提高可讀性 */
        }

        .layout-mode-tablet .responsive-text {
          /* 平板上文字適中 */
        }

        .layout-mode-desktop .responsive-text {
          /* 桌面標準 */
        }

        .layout-mode-wide .responsive-text {
          /* 寬螢幕上文字稍大 */
        }

        .layout-mode-ultra-wide .responsive-text {
          /* 超寬螢幕上文字最大 */
        }

        /* 可訪問性優化 */
        @media (prefers-reduced-motion: reduce) {
          .responsive-text {
            transition: none;
          }

          .interactive-text:active {
            transform: none;
          }
        }

        /* 高對比度模式 */
        @media (prefers-contrast: high) {
          .responsive-text {
            font-weight: 700;
          }
        }

        /* 深色模式 */
        @media (prefers-color-scheme: dark) {
          .responsive-text {
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * 快速文字組件：預定義的文字類型
 */
export const Heading1: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading1" {...props} />
);

export const Heading2: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading2" {...props} />
);

export const Heading3: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading3" {...props} />
);

export const Heading4: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading4" {...props} />
);

export const Heading5: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading5" {...props} />
);

export const Heading6: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="heading6" {...props} />
);

export const Body: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="body" {...props} />
);

export const BodySmall: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="caption" {...props} />
);

export const ButtonText: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="button" {...props} />
);

export const ButtonSmallText: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="buttonSmall" {...props} />
);

export const GameTitle: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="gameTitle" {...props} />
);

export const GameSubtitle: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="gameSubtitle" {...props} />
);

export const GameBody: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="gameBody" {...props} />
);

export const GameCaption: React.FC<Omit<ResponsiveTextProps, 'type'>> = (props) => (
  <ResponsiveText type="gameCaption" {...props} />
);

/**
 * 文字組件Hook
 */
export function useResponsiveText() {
  const [textScaleManager, setTextScaleManager] = useState<TextScaleManager | null>(null);

  // 初始化
  useEffect(() => {
    const manager = new TextScaleManager();
    setTextScaleManager(manager);

    return () => {
      // 清理
    };
  }, []);

  // 獲取文字樣式
  const getTextStyle = (type: TextType, layoutMode?: LayoutMode) => {
    if (!textScaleManager) return {};

    if (layoutMode) {
      textScaleManager.setLayoutMode(layoutMode);
    }

    return textScaleManager.generateStyle(type);
  };

  // 應用文字樣式到元素
  const applyTextStyle = (element: HTMLElement, type: TextType, layoutMode?: LayoutMode) => {
    if (!textScaleManager) return;

    if (layoutMode) {
      textScaleManager.setLayoutMode(layoutMode);
    }

    textScaleManager.applyToElement(element, type);
  };

  // 生成CSS變數
  const generateCSSVariables = (layoutMode?: LayoutMode) => {
    if (!textScaleManager) return '';

    if (layoutMode) {
      textScaleManager.setLayoutMode(layoutMode);
    }

    return textScaleManager.generateCSSVariables();
  };

  return {
    textScaleManager,
    getTextStyle,
    applyTextStyle,
    generateCSSVariables
  };
}
