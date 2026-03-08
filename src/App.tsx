/**
 * 主應用程式組件 - 模組化重構版本
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameEngine } from './useGameEngine';
import { CANVAS_CONFIG } from './config/canvasConfig';

// 導入模組化組件
import OfficeCanvas from './components/Canvas/OfficeCanvas';
import Sidebar from './components/UI/Sidebar';
import BottomCardArea from './components/UI/BottomCardArea';
import GameOverScreen from './components/UI/GameOverScreen';
import DayTransition from './components/UI/DayTransition';

export default function App() {
  const {
    gameState,
    player: rawPlayer, // 這是 Character 實例
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

  const isGameOver = playerState.stats.hp <= 0 || playerState.stats.savings < -500;
  if (isGameOver) {
    return <GameOverScreen onRestart={() => window.location.reload()} />;
  }

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden flex flex-row">
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
          className="flex-1 bg-transparent relative overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '80px 80px'
          }}
        >
          <AnimatePresence>
            {showEvent && gameState.lastEvent && (
              <motion.div
                initial={{ opacity: 0, y: -40, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                className="absolute top-8 left-1/2 z-[100] bg-white/80 text-indigo-950 px-8 py-3.5 rounded-2xl shadow-xl font-black text-sm flex items-center gap-3 border border-white/60 backdrop-blur-md"
              >
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
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
