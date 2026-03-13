/**
 * 遊戲響應式演示組件
 * 展示如何將響應式系統整合到遊戲中
 * 提供完整的響應式UI示例
 */

import React, { useState, useEffect } from 'react';
import { ResponsiveLayout } from './ResponsiveLayout';
import { ResponsiveText, GameTitle, GameBody, ButtonText } from '../shared/ResponsiveText';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { LayoutMode } from '../../utils/responsiveConfig';

// 演示組件屬性
export interface GameResponsiveDemoProps {
  // 配置
  showDebugInfo?: boolean;
  enableTouchDemo?: boolean;
  enableLayoutDemo?: boolean;
  enableTextDemo?: boolean;

  // 樣式
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 遊戲響應式演示組件
 */
export const GameResponsiveDemo: React.FC<GameResponsiveDemoProps> = ({
  showDebugInfo = true,
  enableTouchDemo = true,
  enableLayoutDemo = true,
  enableTextDemo = true,
  className = '',
  style = {}
}) => {
  // 狀態
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop');
  const [scaleFactor, setScaleFactor] = useState(1);
  const [touchEvents, setTouchEvents] = useState<string[]>([]);

  // 使用響應式佈局Hook
  const responsiveLayout = useResponsiveLayout({
    baseWidth: 1200,
    baseHeight: 800,
    onScaleChange: (result) => {
      setScaleFactor(result.scale);
    },
    onDeviceChange: (deviceInfo) => {
      setLayoutMode(deviceInfo.layoutMode);
    }
  });

  // 使用觸控互動Hook
  const touchInteraction = useTouchInteraction({
    enableTouchDetection: enableTouchDemo,
    enableGestureDetection: enableTouchDemo,
    enableTouchOptimization: enableTouchDemo,
    onTap: (event) => {
      setTouchCount(prev => prev + 1);
      setLastTouchPosition({ x: event.x, y: event.y });
      addTouchEvent(`點擊: (${event.x}, ${event.y})`);
    },
    onDoubleTap: (event) => {
      addTouchEvent(`雙擊: (${event.x}, ${event.y})`);
    },
    onLongPress: (event) => {
      addTouchEvent(`長按: (${event.x}, ${event.y})`);
    },
    onSwipe: (event) => {
      addTouchEvent(`滑動: ${event.direction}`);
    }
  });

  // 添加觸控事件到歷史記錄
  const addTouchEvent = (event: string) => {
    setTouchEvents(prev => {
      const newEvents = [event, ...prev.slice(0, 4)]; // 只保留最近5個事件
      return newEvents;
    });
  };

  // 處理按鈕點擊
  const handleButtonClick = (buttonId: string) => {
    addTouchEvent(`按鈕點擊: ${buttonId}`);
  };

  // 處理佈局模式切換
  const handleLayoutModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    addTouchEvent(`切換佈局模式: ${mode}`);
  };

  // 渲染調試面板
  const renderDebugPanel = () => {
    if (!showDebugInfo) return null;

    return (
      <div className="debug-panel" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>響應式系統調試</h3>

        <div style={{ marginBottom: '10px' }}>
          <strong>裝置資訊:</strong>
          <div>類型: {responsiveLayout.deviceInfo?.type}</div>
          <div>佈局模式: {layoutMode}</div>
          <div>方向: {responsiveLayout.deviceInfo?.orientation}</div>
          <div>解析度: {responsiveLayout.deviceInfo?.width} × {responsiveLayout.deviceInfo?.height}</div>
          <div>像素比: {responsiveLayout.deviceInfo?.pixelRatio.toFixed(2)}</div>
          <div>觸控裝置: {responsiveLayout.deviceInfo?.isTouchDevice ? '是' : '否'}</div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>縮放資訊:</strong>
          <div>縮放比例: {scaleFactor.toFixed(2)}</div>
          <div>畫布尺寸: {responsiveLayout.scaleResult?.width} × {responsiveLayout.scaleResult?.height}</div>
          <div>偏移: ({responsiveLayout.scaleResult?.offsetX}, {responsiveLayout.scaleResult?.offsetY})</div>
        </div>

        {enableTouchDemo && (
          <div style={{ marginBottom: '10px' }}>
            <strong>觸控資訊:</strong>
            <div>觸控次數: {touchCount}</div>
            <div>最後位置: {lastTouchPosition ? `(${lastTouchPosition.x}, ${lastTouchPosition.y})` : '無'}</div>
            <div>觸控中: {touchInteraction.isTouching ? '是' : '否'}</div>
          </div>
        )}

        {enableTouchDemo && touchEvents.length > 0 && (
          <div>
            <strong>最近觸控事件:</strong>
            {touchEvents.map((event, index) => (
              <div key={index} style={{ fontSize: '11px', opacity: 0.9 }}>
                {event}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染佈局模式選擇器
  const renderLayoutModeSelector = () => {
    const modes: LayoutMode[] = ['mobile', 'tablet', 'desktop', 'wide', 'ultra-wide'];

    return (
      <div className="layout-mode-selector" style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        gap: '5px',
        zIndex: 1000
      }}>
        {modes.map(mode => (
          <button
            key={mode}
            onClick={() => handleLayoutModeChange(mode)}
            style={{
              padding: '5px 10px',
              background: layoutMode === mode ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {mode}
          </button>
        ))}
      </div>
    );
  };

  // 渲染觸控演示區域
  const renderTouchDemo = () => {
    if (!enableTouchDemo) return null;

    return (
      <div className="touch-demo-area" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        background: 'rgba(0, 123, 255, 0.1)',
        border: '2px dashed #007bff',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      ref={(el) => {
        if (el && touchInteraction.bindTouchEvents) {
          touchInteraction.bindTouchEvents(el);
        }
      }}>
        <ResponsiveText type="body" style={{ textAlign: 'center' }}>
          觸控測試區域
          <br />
          <small>點擊、雙擊、長按、滑動</small>
        </ResponsiveText>
      </div>
    );
  };

  // 渲染文字演示
  const renderTextDemo = () => {
    if (!enableTextDemo) return null;

    return (
      <div className="text-demo-area" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <GameTitle style={{ marginBottom: '15px' }}>
          響應式文字演示
        </GameTitle>

        <GameBody style={{ marginBottom: '15px' }}>
          這個文字會根據裝置尺寸自動調整大小。
          在手機上文字會變大以提高可讀性，
          在寬螢幕上文字會適當縮小以保持美觀。
        </GameBody>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <ButtonText onClick={() => handleButtonClick('primary')}>
            主要按鈕
          </ButtonText>

          <ButtonText
            onClick={() => handleButtonClick('secondary')}
            style={{ background: '#6c757d', color: 'white', padding: '8px 16px', borderRadius: '4px' }}
          >
            次要按鈕
          </ButtonText>

          <ResponsiveText
            type="caption"
            onClick={() => handleButtonClick('link')}
            style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            連結文字
          </ResponsiveText>
        </div>
      </div>
    );
  };

  // 渲染佈局演示
  const renderLayoutDemo = () => {
    if (!enableLayoutDemo) return null;

    return (
      <div className="layout-demo-area" style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: layoutMode === 'mobile' ? 'column' : 'row',
        gap: '10px',
        maxWidth: '500px'
      }}>
        {['遊戲畫布', '玩家資訊', '道具欄', '聊天室'].map((item, index) => (
          <div
            key={index}
            className="layout-demo-item"
            style={{
              flex: 1,
              minWidth: layoutMode === 'mobile' ? '100%' : '120px',
              minHeight: '80px',
              background: `hsl(${index * 90}, 70%, 80%)`,
              border: '2px solid hsl(0, 0%, 70%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            <ResponsiveText type="bodySmall" style={{ textAlign: 'center', fontWeight: 'bold' }}>
              {item}
              <br />
              <small>{layoutMode}模式</small>
            </ResponsiveText>
          </div>
        ))}
      </div>
    );
  };

  // 容器樣式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '600px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overflow: 'hidden',
    ...style
  };

  return (
    <div
      className={`game-responsive-demo ${className}`}
      style={containerStyle}
    >
      {/* 使用響應式佈局 */}
      <ResponsiveLayout
        config={{
          baseWidth: 1200,
          baseHeight: 800,
          enableTouchOptimization: enableTouchDemo,
          enableTextScaling: enableTextDemo,
          enableSpaceAllocation: enableLayoutDemo,
          defaultLayoutMode: layoutMode,
          onLayoutChange: setLayoutMode,
          onScaleChange: setScaleFactor
        }}
      >
        {/* 演示內容 */}
        {renderTouchDemo()}
        {renderTextDemo()}
        {renderLayoutDemo()}
      </ResponsiveLayout>

      {/* 調試面板 */}
      {renderDebugPanel()}

      {/* 佈局模式選擇器 */}
      {renderLayoutModeSelector()}

      {/* 說明文字 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        color: 'white',
        fontSize: '12px',
        textAlign: 'right',
        maxWidth: '300px',
        opacity: 0.8
      }}>
        <ResponsiveText type="caption">
          響應式UI演示 - 調整視窗大小或切換佈局模式以查看效果
        </ResponsiveText>
      </div>

      {/* 樣式 */}
      <style>{`
        .game-responsive-demo {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .layout-demo-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        button {
          transition: all 0.2s ease;
        }

        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .debug-panel {
            max-width: 250px;
            font-size: 11px;
            padding: 10px;
          }

          .layout-mode-selector {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .debug-panel {
            position: static;
            width: 100%;
            max-width: none;
            border-radius: 0;
            margin-bottom: 10px;
          }

          .layout-mode-selector {
            position: static;
            width: 100%;
            border-radius: 0;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * 簡化版演示組件
 */
export const SimpleResponsiveDemo: React.FC = () => {
  return (
    <GameResponsiveDemo
      showDebugInfo={false}
      enableTouchDemo={true}
      enableLayoutDemo={true}
      enableTextDemo={true}
      style={{ minHeight: '400px' }}
    />
  );
};

/**
 * 觸控優化演示組件
 */
export const TouchOptimizationDemo: React.FC = () => {
  const [optimizedCount, setOptimizedCount] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>觸控目標優化演示</h2>
      <p>以下按鈕已經過觸控目標優化，確保在行動裝置上易於點擊。</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => setOptimizedCount(prev => prev + 1)}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px'
            }}
            data-touch-optimized="true"
          >
            按鈕 {num}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>已點擊次數: {optimizedCount}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          WCAG標準：最小觸控目標為44×44像素
        </p>
      </div>
    </div>
  );
};
