/**
 * 主應用程式組件 - 視覺統一重構版本
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameEngine } from './useGameEngine';
import { CANVAS_CONFIG } from './config/canvasConfig';
import { tw, getThemeColor } from './theme/colorUtils';
import { themeColors } from './theme/colors';

// 導入模組化組件
import OfficeCanvas from './components/Canvas/OfficeCanvas';
import ConsolePanel from './components/UI/ConsolePanel';
import Sidebar from './components/UI/Sidebar';
import GameOverScreen from './components/UI/GameOverScreen';
import DayTransition from './components/UI/DayTransition';
import TutorialModal from './components/UI/TutorialModal';
import LogWindow from './components/UI/LogWindow';

export default function App() {
  const {
    gameState,
    executeAction,
    clockOut,
    buyItem,
    interactWithNPC
  } = useGameEngine();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>('player');
  const [showEvent, setShowEvent] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // 取得玩家狀態

  const [showGuide, setShowGuide] = useState(() => localStorage.getItem('pixelThief_guided') !== 'true');
  const [scale, setScale] = useState(1);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isChangingDay, setIsChangingDay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [finalLogSnapshot, setFinalLogSnapshot] = useState<string[] | null>(null);

  // 縮放與響應式計算
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768; // Tailwind md breakpoint
      setIsMobile(mobile);

      // 重新計算可用空間
      // 電腦版：恢復原本的演算法，讓地圖大一點（沉浸式墊在 UI 底下）
      const availableWidth = mobile ? width : width - CANVAS_CONFIG.UI.SIDEBAR_WIDTH;
      const availableHeight = mobile ? height - 180 : height - CANVAS_CONFIG.UI.BOTTOM_HEIGHT;
      
      const scaleX = availableWidth / CANVAS_CONFIG.BASE_WIDTH;
      const scaleY = availableHeight / CANVAS_CONFIG.BASE_HEIGHT;
      
      // 手機板縮放確保全地圖可見，電腦版維持原始的 0.9 係數
      const finalScale = mobile 
        ? Math.max(0.3, Math.min(1.0, scaleX)) 
        : Math.max(0.5, Math.min(1.2, Math.min(scaleX, scaleY) * 0.9));
        
      setScale(finalScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 事件顯示
  React.useEffect(() => {
    if (gameState.lastEvent) {
      setShowEvent(true);
      const timer = setTimeout(() => setShowEvent(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastEvent]);

  // 偵測遊戲結束並捕捉最後快照
  const playerState = gameState.players.find(p => p.id === 'player');
  const isGameOver = playerState && (playerState.stats.stress >= 100 || playerState.stats.savings < -1000);

  React.useEffect(() => {
    if (isGameOver && !finalLogSnapshot) {
      setFinalLogSnapshot(gameState.notifications.slice(0, 10));
    }
  }, [isGameOver, gameState.notifications]);

  const handleClockOut = () => {
    const summary = clockOut();
    if (summary) {
      setSummaryData(summary);
      setIsChangingDay(true);
    }
  };

  // 安全判定
  if (!playerState) return null;

  if (isGameOver && finalLogSnapshot) {
    return (
      <GameOverScreen 
        onRestart={() => window.location.reload()} 
        finalStats={playerState.stats}
        notifications={finalLogSnapshot}
      />
    );
  }

  return (
    <div className={`relative h-[100dvh] w-screen bg-[#f1f5f9] font-sans overflow-hidden text-slate-300 selection:bg-indigo-500/30`}>
      <DayTransition
        isChangingDay={isChangingDay}
        summaryData={summaryData}
        notifications={summaryData?.notifications || []}
        onStartNewDay={() => {
          setSummaryData(null);
          setIsChangingDay(false);
        }}
      />
      <TutorialModal 
        isOpen={showGuide} 
        onClose={() => {
          setShowGuide(false);
          localStorage.setItem('pixelThief_guided', 'true');
        }} 
      />

      {/* Layer 0: Map Canvas */}
      <div className="absolute inset-0 z-0 bg-white">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-repeat opacity-[0.08]" />
        <div className="absolute inset-0 pointer-events-none z-10"
             style={{ 
               background: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)`,
               boxShadow: 'inset 0 0 120px rgba(0,0,0,0.8)'
             }} />

        <AnimatePresence>
          {showEvent && gameState.lastEvent && (
            <motion.div
              initial={{ opacity: 0, y: -40, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="absolute top-4 md:top-8 left-1/2 z-[100] px-4 md:px-8 py-2 md:py-3.5 rounded-2xl shadow-2xl font-black text-xs md:text-sm flex items-center gap-2 md:gap-3 border backdrop-blur-md whitespace-nowrap"
              style={{
                backgroundColor: `${themeColors.secondary[50]}EE`,
                color: themeColors.primary[900],
                borderColor: themeColors.primary[500]
              }}
            >
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: themeColors.error[500] }} />
              {gameState.lastEvent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 畫布容器：手機版微調位置，避免被底部 HUD 擋住 */}
        <div className={`w-full h-full flex items-center justify-center ${isMobile ? 'pb-24' : ''}`}>
          <OfficeCanvas
            gameState={gameState}
            scale={scale}
            showEvent={showEvent}
            selectedPlayerId={selectedPlayerId}
            player={playerState as any}
            onPlayerClick={(id) => {
              setSelectedPlayerId(id);
              interactWithNPC(id);
            }}
          />
        </div>
      </div>

      {/* Layer 1: U-Shape HUD / Mobile Layout */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
        
        {/* Top: The Wings (Desktop Only) / Floating status (Mobile) */}
        <div className={`flex ${isMobile ? 'flex-col justify-start' : 'justify-between items-start'} p-2 md:p-6 h-full overflow-hidden`}>
          
          {/* Left Wing / Top Status */}
          <div className={`pointer-events-auto flex flex-col gap-2 md:gap-4 ${isMobile ? 'w-full h-24 mb-2' : 'h-[calc(100%-240px)] w-72 md:w-80'}`}>
            <LogWindow notifications={gameState.notifications} />
          </div>

          {/* Right Wing: Status & Shop */}
          <div className={`pointer-events-auto flex flex-col gap-4 ${isMobile ? 'w-full px-2' : 'h-[calc(100%-240px)]'}`}>
            <Sidebar
              gameState={gameState}
              player={playerState as any}
              showShop={true}
              onToggleGuide={() => setShowGuide(true)}
              onToggleShop={() => {}}
              onBuyItem={buyItem}
              onClockOut={handleClockOut}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Bottom: Tactical Console */}
        <div className="pointer-events-auto shrink-0 w-full pb-safe">
          <ConsolePanel
            gameState={gameState}
            player={playerState as any}
            onExecuteAction={executeAction}
            onClockOut={handleClockOut}
          />
        </div>
      </div>
    </div>
  );
}
