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
import Sidebar from './components/UI/Sidebar';
import BottomCardArea from './components/UI/BottomCardArea';
import GameOverScreen from './components/UI/GameOverScreen';
import DayTransition from './components/UI/DayTransition';

export default function App() {
  const {
    gameState,
    playCard,
    drawCard,
    clockOut,
    buyItem
  } = useGameEngine();

  const [selectedPlayerId, setSelectedPlayerId] = useState('player');
  const [showEvent, setShowEvent] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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
      setTimeout(() => setIsChangingDay(false), 1500);
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
    <div className={`h-screen w-screen ${tw.bg.light} ${tw.text.primary} font-sans overflow-hidden flex flex-row`}>
      <DayTransition
        isChangingDay={isChangingDay}
        summaryData={summaryData}
        onStartNewDay={() => setSummaryData(null)}
      />

      <Sidebar
        gameState={gameState}
        player={playerState as any}
        showGuide={showGuide}
        showShop={showShop}
        onToggleGuide={() => { setShowGuide(!showGuide); setShowShop(false); }}
        onToggleShop={() => { setShowShop(!showShop); setShowGuide(false); }}
        onBuyItem={buyItem}
        onClockOut={handleClockOut}
      />

      <main className="flex-1 flex flex-col relative h-full">
        <div
          className={`flex-1 ${tw.bg.canvas} relative overflow-hidden flex items-center justify-center`}
          style={{
            backgroundImage: `radial-gradient(${themeColors.secondary[200]} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02)'
          }}
        >
          {/* 背景裝飾：光暈 */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
               style={{ background: `radial-gradient(circle at 50% 50%, ${themeColors.primary[100]}, transparent 70%)` }} />

          <AnimatePresence>
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

        <BottomCardArea
          gameState={gameState}
          player={playerState as any}
          onDrawCard={drawCard}
          onPlayCard={playCard}
        />
      </main>
    </div>
  );
}
