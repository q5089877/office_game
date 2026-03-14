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
    buyItem
  } = useGameEngine();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>('player');
  const [showEvent, setShowEvent] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // 取得玩家狀態

  const [showGuide, setShowGuide] = useState(() => localStorage.getItem('pixelThief_guided') !== 'true');
  const [scale, setScale] = useState(1);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isChangingDay, setIsChangingDay] = useState(false);

  // 縮放計算
  React.useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth - CANVAS_CONFIG.UI.SIDEBAR_WIDTH;
      const availableHeight = window.innerHeight - CANVAS_CONFIG.UI.BOTTOM_HEIGHT;
      const scaleX = availableWidth / CANVAS_CONFIG.BASE_WIDTH;
      const scaleY = availableHeight / CANVAS_CONFIG.BASE_HEIGHT;
      const finalScale = Math.max(0.5, Math.min(1.2, Math.min(scaleX, scaleY) * 0.9));
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

  const handleClockOut = () => {
    const summary = clockOut();
    if (summary) {
      setSummaryData(summary);
      setIsChangingDay(true);
    }
  };

  // 安全判定
  const playerState = gameState.players.find(p => p.id === 'player');
  if (!playerState) return null;

  const isGameOver = playerState.stats.stress >= 100 || playerState.stats.savings < -1000;
  if (isGameOver) {
    return <GameOverScreen onRestart={() => window.location.reload()} />;
  }

  return (
    <div className={`relative h-screen w-screen bg-[#f1f5f9] font-sans overflow-hidden text-slate-300 selection:bg-indigo-500/30`}>
      <DayTransition
        isChangingDay={isChangingDay}
        summaryData={summaryData}
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
        {/* 背景裝飾：網格與周圍暗角 (Vignette) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-repeat opacity-[0.08]" />
        <div className="absolute inset-0 pointer-events-none z-10"
             style={{ 
               background: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)`,
               boxShadow: 'inset 0 0 120px rgba(0,0,0,0.8)'
             }} />

        <AnimatePresence>
          {/* 僅在重大事件時顯示 */}
          {showEvent && gameState.lastEvent && (
            <motion.div
              initial={{ opacity: 0, y: -40, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="absolute top-8 left-1/2 z-[100] px-8 py-3.5 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 border backdrop-blur-md"
              style={{
                backgroundColor: `${themeColors.secondary[50]}EE`,
                color: themeColors.primary[900],
                borderColor: themeColors.primary[500]
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: themeColors.error[500] }} />
              {gameState.lastEvent}
            </motion.div>
          )}
        </AnimatePresence>

        <OfficeCanvas
          gameState={gameState}
          scale={scale}
          showEvent={showEvent}
          selectedPlayerId={selectedPlayerId}
          player={playerState as any}
          onPlayerClick={(id) => setSelectedPlayerId(id)}
        />
      </div>

      {/* Layer 1: U-Shape HUD */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
        
        {/* Top: The Wings */}
        <div className="flex justify-between items-start p-4 md:p-6 h-full overflow-hidden">
          
          {/* Left Wing: LogWindow */}
          <div className="pointer-events-auto flex flex-col gap-4 h-full w-72 md:w-80">
            <LogWindow notifications={gameState.notifications} />
          </div>

          {/* Right Wing: Status & Shop */}
          <div className="pointer-events-auto flex flex-col gap-4 h-full">
            <Sidebar
              gameState={gameState}
              player={playerState as any}
              showShop={true}
              onToggleGuide={() => setShowGuide(true)}
              onToggleShop={() => {}}
              onBuyItem={buyItem}
              onClockOut={handleClockOut}
            />
          </div>
        </div>

        {/* Bottom: Tactical Console */}
        <div className="pointer-events-auto shrink-0 w-full">
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
