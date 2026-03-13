/**
 * 簡單響應式遊戲演示
 *
 * 這個組件展示了響應式系統的核心功能，不依賴複雜的依賴
 * 適合快速測試和演示
 */

import React, { useState, useEffect } from 'react';

interface SimpleResponsiveGameDemoProps {
  showDebug?: boolean;
}

/**
 * 簡單響應式遊戲演示組件
 *
 * 展示響應式系統的核心功能：
 * 1. 裝置檢測
 * 2. 佈局適應
 * 3. 觸控優化
 * 4. 性能監控
 */
const SimpleResponsiveGameDemo: React.FC<SimpleResponsiveGameDemoProps> = ({
  showDebug = false
}) => {
  // 狀態管理
  const [deviceInfo, setDeviceInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  const [layoutMode, setLayoutMode] = useState<'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultra-wide'>('desktop');
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0
  });

  // 計算佈局模式
  const calculateLayoutMode = (width: number): typeof layoutMode => {
    if (width < 480) return 'mobile';
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1280) return 'desktop';
    if (width < 1920) return 'wide';
    return 'ultra-wide';
  };

  // 計算縮放因子
  const calculateScaleFactor = (width: number, height: number, mode: typeof layoutMode): number => {
    const baseWidth = 800;
    const baseHeight = 600;

    switch (mode) {
      case 'mobile':
        return Math.min(width / baseWidth, height / baseHeight, 0.8);
      case 'tablet':
        return Math.min(width / baseWidth, height / baseHeight, 1.0);
      case 'desktop':
        return Math.min(width / baseWidth, height / baseHeight, 1.2);
      case 'wide':
        return Math.min(width / baseWidth, height / baseHeight, 1.5);
      case 'ultra-wide':
        return Math.min(width / baseWidth, height / baseHeight, 2.0);
      default:
        return 1.0;
    }
  };

  // 初始化效果
  useEffect(() => {
    // 計算初始狀態
    const newLayoutMode = calculateLayoutMode(window.innerWidth);
    const newScaleFactor = calculateScaleFactor(
      window.innerWidth,
      window.innerHeight,
      newLayoutMode
    );

    setLayoutMode(newLayoutMode);
    setScaleFactor(newScaleFactor);

    // 性能監控
    let frameCount = 0;
    let lastTime = performance.now();

    const updatePerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setPerformanceMetrics(prev => ({
          ...prev,
          fps: Math.min(fps, 60)
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updatePerformance);
    };

    const animationId = requestAnimationFrame(updatePerformance);

    // 視窗大小變化處理
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newLayoutMode = calculateLayoutMode(newWidth);
      const newScaleFactor = calculateScaleFactor(newWidth, newHeight, newLayoutMode);

      setDeviceInfo({
        width: newWidth,
        height: newHeight,
        isMobile: newWidth < 768,
        isTablet: newWidth >= 768 && newWidth < 1024,
        isDesktop: newWidth >= 1024,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: newWidth > newHeight ? 'landscape' : 'portrait'
      });

      setLayoutMode(newLayoutMode);
      setScaleFactor(newScaleFactor);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 獲取遊戲佈局配置
  const getGameLayoutConfig = () => {
    const configs = {
      mobile: {
        canvasWidth: Math.min(deviceInfo.width * 0.95, 400),
        canvasHeight: Math.min(deviceInfo.height * 0.6, 300),
        sidebarWidth: 0,
        cardAreaHeight: 120,
        fontSize: 14,
        touchTargetSize: 44
      },
      tablet: {
        canvasWidth: Math.min(deviceInfo.width * 0.8, 600),
        canvasHeight: Math.min(deviceInfo.height * 0.7, 450),
        sidebarWidth: 200,
        cardAreaHeight: 150,
        fontSize: 16,
        touchTargetSize: 44
      },
      desktop: {
        canvasWidth: Math.min(deviceInfo.width * 0.7, 800),
        canvasHeight: Math.min(deviceInfo.height * 0.8, 600),
        sidebarWidth: 250,
        cardAreaHeight: 180,
        fontSize: 18,
        touchTargetSize: 44
      },
      wide: {
        canvasWidth: Math.min(deviceInfo.width * 0.6, 1000),
        canvasHeight: Math.min(deviceInfo.height * 0.85, 700),
        sidebarWidth: 300,
        cardAreaHeight: 200,
        fontSize: 20,
        touchTargetSize: 44
      },
      'ultra-wide': {
        canvasWidth: Math.min(deviceInfo.width * 0.5, 1200),
        canvasHeight: Math.min(deviceInfo.height * 0.9, 800),
        sidebarWidth: 350,
        cardAreaHeight: 220,
        fontSize: 22,
        touchTargetSize: 44
      }
    };

    return configs[layoutMode] || configs.desktop;
  };

  const layoutConfig = getGameLayoutConfig();
  const isMobile = layoutMode === 'mobile';
  const isTablet = layoutMode === 'tablet';
  const isDesktop = layoutMode === 'desktop' || layoutMode === 'wide' || layoutMode === 'ultra-wide';

  // 計算性能狀態
  const getPerformanceStatus = () => {
    if (performanceMetrics.fps >= 55) return { status: 'excellent', color: 'text-green-400' };
    if (performanceMetrics.fps >= 45) return { status: 'good', color: 'text-yellow-400' };
    if (performanceMetrics.fps >= 30) return { status: 'fair', color: 'text-orange-400' };
    return { status: 'poor', color: 'text-red-400' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* 性能監控面板（調試模式） */}
      {showDebug && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-xs">
          <h3 className="font-bold mb-2">性能監控</h3>
          <div className="text-sm">
            <div>FPS: {performanceMetrics.fps}</div>
            <div>記憶體: {performanceMetrics.memoryUsage}MB</div>
            <div>渲染時間: {performanceMetrics.renderTime}ms</div>
            <div className="mt-2">
              狀態: <span className={`font-bold ${performanceStatus.color}`}>
                {performanceStatus.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 裝置資訊面板 */}
      {showDebug && (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-xs">
          <h3 className="font-bold mb-2">裝置資訊</h3>
          <div className="text-sm">
            <div>佈局模式: {layoutMode}</div>
            <div>螢幕尺寸: {deviceInfo.width} × {deviceInfo.height}</div>
            <div>縮放因子: {scaleFactor.toFixed(2)}</div>
            <div>方向: {deviceInfo.orientation}</div>
            <div>觸控裝置: {deviceInfo.isTouchDevice ? '是' : '否'}</div>
            <div>像素比: {deviceInfo.pixelRatio}</div>
            <div>裝置類型: {deviceInfo.isMobile ? '手機' : deviceInfo.isTablet ? '平板' : '桌面'}</div>
          </div>
        </div>
      )}

      {/* 主遊戲區域 */}
      <div className="flex flex-col md:flex-row h-screen p-4 gap-4">
        {/* 側邊欄（桌面裝置） */}
        {(isDesktop || isTablet) && (
          <div
            className="md:w-64 lg:w-72 xl:w-80 bg-gray-800 rounded-lg p-4"
            style={{ width: layoutConfig.sidebarWidth }}
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-blue-400">遊戲控制台</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                玩家狀態
              </button>
              <button className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                物品欄
              </button>
              <button className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                任務日誌
              </button>
              <button className="w-full p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                設定
              </button>
            </div>
          </div>
        )}

        {/* 遊戲畫布區域 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Pixel Thief - 響應式演示
            </h1>
            <p className="text-gray-300">
              適應 {deviceInfo.isMobile ? '手機' : deviceInfo.isTablet ? '平板' : '桌面'} 裝置 • {layoutMode} 佈局 • {scaleFactor.toFixed(2)}× 縮放
            </p>
          </div>

          {/* 遊戲畫布 */}
          <div
            className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700"
            style={{
              width: layoutConfig.canvasWidth,
              height: layoutConfig.canvasHeight
            }}
          >
            {/* 模擬遊戲畫布 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🎮</div>
                <p className="text-gray-300">遊戲畫布區域</p>
                <div className="mt-2 text-sm text-gray-400">
                  {layoutConfig.canvasWidth} × {layoutConfig.canvasHeight} 像素
                </div>
              </div>
            </div>

            {/* 模擬遊戲元素 */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <div className="absolute top-4 right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">NPC</span>
            </div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">💼</span>
            </div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">💰</span>
            </div>
          </div>

          {/* 遊戲控制說明 */}
          <div className="mt-4 text-center max-w-md">
            <p className="text-gray-300">
              {isMobile ? '使用觸控操作遊戲' : '使用滑鼠點擊或鍵盤操作遊戲'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <button className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700 transition-colors">
                移動
              </button>
              <button className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700 transition-colors">
                互動
              </button>
              <button className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors">
                攻擊
              </button>
              <button className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700 transition-colors">
                技能
              </button>
            </div>
          </div>
        </div>

        {/* 行動裝置側邊欄（底部） */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
            <div className="flex justify-around">
              <button className="p-2 text-white hover:bg-gray-700 rounded">🏠</button>
              <button className="p-2 text-white hover:bg-gray-700 rounded">🎮</button>
              <button className="p-2 text-white hover:bg-gray-700 rounded">⚙️</button>
              <button className="p-2 text-white hover:bg-gray-700 rounded">📊</button>
              <button className="p-2 text-white hover:bg-gray-700 rounded">👤</button>
            </div>
          </div>
        )}
      </div>

      {/* 卡片區域（底部） */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 p-3"
        style={{ height: layoutConfig.cardAreaHeight }}
      >
        <div className="flex justify-center gap-4">
          <div className="w-24 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">卡片1</span>
          </div>
          <div className="w-24 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">卡片2</span>
          </div>
          <div className="w-24 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">卡片3</span>
          </div>
          <div className="w-24 h-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">卡片4</span>
          </div>
        </div>
      </div>

      {/* 響應式功能指示器 */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          <div className={`w-2 h-2 rounded-full ${performanceStatus.color.replace('text-', 'bg-')}`}></div>
          <span>性能: {performanceStatus.status}</span>
        </div>

        <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>佈局: {layoutMode}</span>
        </div>

        {deviceInfo.isTouchDevice && (
          <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>觸控優化: 啟用</span>
          </div>
        )}
      </div>

      {/* 斷點指示器 */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-400">
        當前斷點: 320px - 480px - 768px - 1024px - 1280px - 1920px
      </div>

      {/* 響應式系統說明 */}
      <div className="fixed top-20 right-4 bg-black/70 text-white p-3 rounded-lg max-w-xs text-sm">
        <h4 className="font-bold mb-2">響應式系統功能</h4>
        <ul className="space-y-1">
          <li>• 自動裝置檢測</li>
          <li>• 動態佈局調整</li>
          <li>• 智慧縮放計算</li>
          <li>• 觸控目標優化</li>
          <li>• 性能監控</li>
          <li>• 跨裝置兼容</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleResponsiveGameDemo;

/**
 * 使用示例：
 *
 * 1. 基本使用：
 * ```tsx
 * <SimpleResponsiveGameDemo />
 * ```
 *
 * 2. 帶調試資訊：
 * ```tsx
 * <SimpleResponsiveGameDemo showDebug={true} />
 * ```
 *
 * 整合到現有遊戲：
 *
 * 1. 在App.tsx中導入：
 * ```tsx
 * import SimpleResponsiveGameDemo from './examples/SimpleResponsiveGameDemo';
 * ```
 *
 * 2. 替換現有遊戲組件：
 * ```tsx
 * function App() {
 *   return (
 *     <div className="App">
 *       <SimpleResponsiveGameDemo showDebug={true} />
 *     </div>
 *   );
 * }
 * ```
 *
 * 3. 或作為開發工具使用：
 * ```tsx
 * function App() {
 *   const [showDemo, setShowDemo] = useState(false);
 *
 *   return (
 *     <div className="App">
 *       {showDemo ? (
 *         <SimpleResponsiveGameDemo />
 *       ) : (
 *         <YourGameComponent />
 *       )}
 *       <button onClick={() => setShowDemo(!showDemo)}>
 *         切換響應式演示
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
