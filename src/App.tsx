import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Group } from 'react-konva';
import { useGameEngine } from './useGameEngine';
import { CardType } from './types';
import { OFFICE_LAYOUT } from './constants';
import {
  AlertCircle, Clock, UserCircle, PlusCircle, Activity, Skull, Ghost, DollarSign, Flame, Heart, Zap, Star, Shield, Trophy, Coffee, Trash2, Smile, Sparkles, Clover, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const VerticalBar = ({ value, max, color, label, icon: Icon, title }: { value: number, max: number, color: string, label: string, icon?: any, title?: string }) => (
  <div className="flex flex-col items-center gap-1 h-full group" title={title}>
    <div className="w-2.5 h-16 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200 shadow-inner">
      <motion.div
        className={cn("absolute bottom-0 w-full rounded-full", color)}
        initial={{ height: 0 }}
        animate={{ height: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>
    <span className="text-[10px] font-black text-stone-700 leading-none mt-0.5">{Math.round(value)}</span>
    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider group-hover:text-stone-600 transition-colors">{label}</span>
  </div>
);

const PixelCharacter = ({ name, color, isSelected, bobOffset, id, gender }: { name: string, color: string, isSelected: boolean, bobOffset: number, id: string, gender?: string }) => {
  const isPlayer = id === 'player';
  const isFemale = gender === 'FEMALE';
  
  // 衣服顏色: 玩家固定藍色，女性粉紫色，男性綠色
  const clothesColor = isPlayer ? "#6366f1" : (isFemale ? "#ec4899" : "#10b981");
  
  // 髮型強化: 女性亮棕色+長髮 (40x12)，男性深黑色+短髮 (18x9)
  const hairColor = isFemale ? "#b45309" : "#1a1a1a";
  const hairWidth = isFemale ? 12 : 9;
  const hairHeight = isFemale ? 40 : 18;
  const hairRightX = 19.5 - hairWidth;
  
  const skinColor = "#fde68a";
  const blushColor = isFemale ? "#ff85a2" : "#fca5a5";
  const blushOpacity = isFemale ? 0.9 : 0.6;

  return (
    <Group y={bobOffset} scaleX={0.75} scaleY={0.75}>
      <Circle radius={15} fill="rgba(0,0,0,0.1)" scaleY={0.5} y={3} />
      {/* Body Rect fill */}
      <Rect width={39} height={45} fill={clothesColor} cornerRadius={6} x={-19.5} y={-45} stroke="#1a1a1a" strokeWidth={2.25} />
      <Rect width={33} height={15} fill="rgba(0,0,0,0.1)" x={-16.5} y={-18} cornerRadius={3} />
      <Rect width={33} height={30} fill={skinColor} x={-16.5} y={-48} cornerRadius={4.5} stroke="#1a1a1a" strokeWidth={2.25} />
      {/* Hair */}
      <Rect width={39} height={12} fill={hairColor} x={-19.5} y={-51} cornerRadius={6} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={hairWidth} height={hairHeight} fill={hairColor} x={-19.5} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={hairWidth} height={hairHeight} fill={hairColor} x={hairRightX} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
      {/* Eyes */}
      <Rect width={4.5} height={6} fill="#1a1a1a" x={-9} y={-37.5} cornerRadius={1.5} />
      <Rect width={4.5} height={6} fill="#1a1a1a" x={4.5} y={-37.5} cornerRadius={1.5} />
      <Rect width={1.5} height={1.5} fill="#fff" x={-7.5} y={-36} />
      <Rect width={1.5} height={1.5} fill="#fff" x={6} y={-36} />
      {/* Face: Blush */}
      <Rect width={6} height={3} fill={blushColor} x={-13.5} y={-30} opacity={blushOpacity} />
      <Rect width={6} height={3} fill={blushColor} x={7.5} y={-30} opacity={blushOpacity} />
      <Group y={-55} scaleX={1.235} scaleY={1.235}>
        <Rect width={60} height={18} fill="rgba(255,255,255,0.8)" x={-30} cornerRadius={6} stroke="#1a1a1a" strokeWidth={1.5} />
        <Text text={name} fontSize={14} fill="#1a1a1a" fontStyle="bold" width={60} align="center" x={-30} y={2.5} />
      </Group>
      {isSelected && (
        <Group y={-22.5}>
           <Circle radius={33} stroke="#8b5cf6" strokeWidth={3} dash={[6, 3]} />
        </Group>
      )}
    </Group>
  );
};

const PixelCat = ({ x, y }: { x: number, y: number }) => (
  <Group x={x * 120 + 60} y={y * 87 + 43.5}>
    <Circle radius={12} fill="rgba(0,0,0,0.05)" scaleY={0.5} y={3} />
    <Rect width={27} height={21} fill="#fb923c" x={-13.5} y={-21} cornerRadius={4.5} stroke="#1a1a1a" strokeWidth={1.5} />
    <Rect width={15} height={15} fill="#fb923c" x={-21} y={-30} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
    <Rect width={3} height={3} fill="#1a1a1a" x={-16.5} y={-25.5} />
    <Rect width={3} height={3} fill="#1a1a1a" x={-10.5} y={-25.5} />
    <Text text="🐈" fontSize={18} x={9} y={-33} />
  </Group>
);

export default function App() {
  const { gameState, playCard, drawCard, endDay, buyItem } = useGameEngine();
  const [selectedPlayerId, setSelectedPlayerId] = useState('player');
  const [showEvent, setShowEvent] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // 計算最佳縮放比例
    const calculateOptimalScale = () => {
      const { innerWidth, innerHeight } = window;

      // 定義常數
      const SIDEBAR_WIDTH = 288;      // 左側邊欄寬度
      const BOTTOM_HEIGHT = 200;      // 底部區域高度
      const CANVAS_WIDTH = 1080;      // 畫布原始寬度
      const CANVAS_HEIGHT = 600;      // 畫布原始高度
      const PADDING_FACTOR = 0.92;    // 緩衝係數 (稍微減小以確保邊界)
      const MIN_SCALE = 0.35;         // 最小縮放比例
      const MAX_SCALE = 1.5;          // 最大縮放比例

      // 根據螢幕尺寸調整計算邏輯
      let availableWidth = innerWidth;
      let availableHeight = innerHeight;

      if (innerWidth < 768) {
        // 手機尺寸：全螢幕顯示，調整佈局
        availableWidth = innerWidth - 32;     // 左右邊距
        availableHeight = innerHeight - 320;  // 更大的底部區域
      } else if (innerWidth < 1024) {
        // 平板尺寸
        availableWidth = innerWidth - SIDEBAR_WIDTH;
        availableHeight = innerHeight - BOTTOM_HEIGHT;
      } else {
        // 桌面尺寸
        availableWidth = innerWidth - SIDEBAR_WIDTH;
        availableHeight = innerHeight - BOTTOM_HEIGHT;
      }

      // 確保可用空間不小於最小值
      availableWidth = Math.max(availableWidth, CANVAS_WIDTH * MIN_SCALE);
      availableHeight = Math.max(availableHeight, CANVAS_HEIGHT * MIN_SCALE);

      // 計算寬度和高度的比例
      const widthRatio = availableWidth / CANVAS_WIDTH;
      const heightRatio = availableHeight / CANVAS_HEIGHT;

      // 取最小值以確保完整顯示，並添加緩衝
      const rawScale = Math.min(widthRatio, heightRatio) * PADDING_FACTOR;

      // 限制縮放範圍
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawScale));

      // 四捨五入到小數點後兩位，避免過於頻繁的更新
      return Math.round(clampedScale * 100) / 100;
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newScale = calculateOptimalScale();
        setScale(newScale);
      }, 150); // 150ms 防抖動，平衡響應性和效能
    };

    // 初始計算
    const initialScale = calculateOptimalScale();
    setScale(initialScale);

    // 監聽 resize 事件
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  React.useEffect(() => {
    if (gameState.lastEvent) {
      setShowEvent(true);
      const timer = setTimeout(() => setShowEvent(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastEvent]);

  const currentPlayer = gameState.players.find(p => p.id === selectedPlayerId) || gameState.players[0];
  const player = gameState.players.find(p => p.id === 'player')!;
  const isGameOver = player.stats.hp <= 0 || player.stats.savings < -500;

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center text-stone-900 p-8 text-center">
        <Skull size={80} className="mb-6 animate-bounce text-red-500" />
        <h1 className="text-5xl font-black uppercase tracking-tighter italic">GAME OVER</h1>
        <button onClick={() => window.location.reload()} className="mt-8 px-12 py-4 bg-stone-900 text-white rounded-full font-black text-sm uppercase">再試一次</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-stone-900 font-sans overflow-hidden flex flex-row selection:bg-indigo-100">

      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col p-4 z-50 shadow-[4px_0_20px_rgba(0,0,0,0.03)] shrink-0 relative">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4">
           <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 border-2 border-white relative shrink-0">
              <Ghost size={28} />
              <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                LV.{player.stats.level}
              </span>
           </div>
           <div className="min-w-0">
              <h1 className="font-black text-xl uppercase italic tracking-tighter text-stone-800 leading-none mb-1">Pixel Thief</h1>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest truncate">{player.role}</p>
           </div>
        </div>

        {/* Vitals (HP/MP/XP) */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex justify-around mb-4">
            <VerticalBar value={player.stats.hp} max={100} color="bg-rose-500" label="HP" title="體力：歸零則 Game Over" />
            <VerticalBar value={player.stats.mp} max={player.stats.maxMp} color="bg-cyan-500" label="MP" title="摸魚值：抽牌出牌用，每抽一張耗 1" />
            <div className="flex flex-col items-center gap-1 h-full group" title="年資：100% 則升職">
               <div className="w-2.5 h-16 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200 shadow-inner">
                  <motion.div
                    className="absolute bottom-0 w-full bg-amber-400 rounded-full"
                    animate={{ height: `${player.stats.xp}%` }}
                  />
               </div>
               <span className="text-[10px] font-black text-stone-700 leading-none mt-0.5">{Math.round(player.stats.xp)}</span>
               <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider group-hover:text-stone-600 transition-colors">XP</span>
            </div>
        </div>

        {/* Economy & Shop Toggle */}
        <div className="mb-4 px-2 flex justify-between items-end">
            <div>
              <p className="text-[11px] text-stone-400 font-bold uppercase mb-1 tracking-wider">Current Savings</p>
              <p className="text-4xl font-black text-emerald-500 font-mono tracking-tighter flex items-center gap-1">
                <span className="text-2xl opacity-50">$</span>{player.stats.savings}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGuide(!showGuide);
                  setShowShop(false);
                }}
                className={cn(
                  "p-2 rounded-lg transition-all border shadow-sm",
                  showGuide ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-100 hover:bg-stone-50"
                )}
                title="遊戲指南"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => {
                  setShowShop(!showShop);
                  setShowGuide(false);
                }}
                className={cn(
                  "p-2 rounded-lg transition-all border shadow-sm",
                  showShop ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-100 hover:bg-stone-50"
                )}
                title="辦公室商店"
              >
                <Coffee size={20} />
              </button>
            </div>
        </div>

        {/* Attributes / Shop / Guide Panel */}
        <div className="flex-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-420px)]">
          {showGuide ? (
            <div className="flex flex-col gap-3 animate-in slide-in-from-right-4 duration-300">
              <p className="text-[11px] text-indigo-500 font-black uppercase mb-1 tracking-widest">遊戲指南</p>
              <div className="space-y-4 pr-1">
                <section>
                  <h4 className="text-[11px] font-black text-stone-700 mb-1.5 border-b border-stone-100 pb-1 uppercase tracking-tighter">基礎數值</h4>
                  <div className="space-y-2 text-[11px] font-bold text-stone-500">
                    <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-rose-500">HP (體力)</span>
                      <span className="text-stone-400">歸零則 Game Over</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-cyan-500">MP (摸魚值)</span>
                      <span className="text-stone-400">抽牌消耗 1 點</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-amber-500">XP (年資)</span>
                      <span className="text-stone-400">100% 則升職</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-emerald-500">錢</span>
                      <span className="text-stone-400">低於 -500 則 Game Over</span>
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className="text-[11px] font-black text-stone-700 mb-1.5 border-b border-stone-100 pb-1 uppercase tracking-tighter">遊戲機制</h4>
                  <div className="space-y-2 text-[11px] font-bold text-stone-500">
                    <div className="flex flex-col gap-1 bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-orange-500">混亂度</span>
                      <p className="text-[10px] text-stone-400 leading-tight">滿 100% 會觸發提早下班</p>
                    </div>
                    <div className="flex flex-col gap-1 bg-stone-50/50 p-2 rounded-lg">
                      <span className="text-indigo-500">抽牌 / 目標</span>
                      <p className="text-[10px] text-stone-400 leading-tight">固定左側抽牌。每日達成 3 次行動即可下班。</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : showShop ? (
            <div className="flex flex-col gap-2 animate-in slide-in-from-right-4 duration-300">
              <p className="text-[11px] text-indigo-500 font-black uppercase mb-2 tracking-widest">Office Shop</p>
              <button onClick={() => buyItem('hp_pot')} className="flex justify-between items-center p-3 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-black text-rose-700">能量飲料</p>
                  <p className="text-xs text-rose-400 font-bold">體力 +30</p>
                </div>
                <span className="text-xs font-black text-rose-600">$200</span>
              </button>
              <button onClick={() => buyItem('mp_pot')} className="flex justify-between items-center p-3 bg-cyan-50 border border-cyan-100 rounded-xl hover:bg-cyan-100 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-black text-cyan-700">提神薄荷</p>
                  <p className="text-xs text-cyan-400 font-bold">摸魚值 +50</p>
                </div>
                <span className="text-xs font-black text-cyan-600">$300</span>
              </button>
              <button onClick={() => buyItem('luck_up')} className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-black text-amber-700">開運御守</p>
                  <p className="text-xs text-amber-400 font-bold">幸運 +2 (永久)</p>
                </div>
                <span className="text-xs font-black text-amber-600">$1000</span>
              </button>
              <button onClick={() => buyItem('charm_up')} className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-black text-indigo-700">高級西裝</p>
                  <p className="text-xs text-indigo-400 font-bold">魅力 +5 (永久)</p>
                </div>
                <span className="text-xs font-black text-indigo-600">$1500</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between py-3 border-b border-stone-50 group hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-stone-400 uppercase flex items-center gap-2 group-hover:text-stone-600"><Clover size={16} className="text-emerald-400"/> 幸運</span>
                    <span className="text-lg font-black text-stone-700">{player.stats.luck}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-stone-50 group hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-stone-400 uppercase flex items-center gap-2 group-hover:text-stone-600"><Smile size={16} className="text-pink-400"/> 魅力</span>
                    <span className="text-lg font-black text-stone-700">{player.stats.charisma}</span>
                </div>
                <div className="flex justify-between py-3 group hover:bg-stone-50 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-stone-400 uppercase flex items-center gap-2 group-hover:text-stone-600"><Flame size={16} className="text-orange-400"/> 混亂度</span>
                    <span className="text-lg font-black text-orange-500">{Math.round(gameState.chaosLevel)}%</span>
                </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto">
             <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-3">
                 <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">今日摸魚進度</p>
                    <p className="text-sm font-black text-indigo-600">{gameState.activityThisDay} / 3</p>
                 </div>
                 <div className="h-1 w-full bg-indigo-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-indigo-500"
                      animate={{ width: `${Math.min(100, (gameState.activityThisDay / 3) * 100)}%` }}
                    />
                 </div>
                 <p className="text-sm text-indigo-700 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"/>
                    {gameState.activityThisDay < 3 ? "請先抽牌或出牌..." : "工作進度達成！"}
                 </p>
             </div>
             <button
                onClick={endDay}
                className={cn(
                  "w-full py-3 rounded-xl font-black text-base uppercase tracking-widest transition-all shadow-lg active:scale-95",
                  gameState.activityThisDay < 3 ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-stone-900 text-white hover:bg-black hover:-translate-y-0.5"
                )}
              >
                {gameState.activityThisDay < 3 ? `進度不足 (${gameState.activityThisDay}/3)` : "下班"}
             </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Game Viewport */}
        <div className="flex-1 bg-[#f1f5f9] relative overflow-hidden flex items-center justify-center"
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '120px 87px' }}>

             {/* Event Notification */}
             <AnimatePresence>
                {showEvent && gameState.lastEvent && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    className="absolute top-8 left-1/2 z-[100] bg-stone-800 text-white px-8 py-4 rounded-full shadow-2xl font-bold text-base flex items-center gap-3 border border-stone-700"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                    {gameState.lastEvent}
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Konva Stage Container */}
             <div className="bg-white rounded-[32px] shadow-2xl border border-stone-200/60 overflow-hidden relative flex items-center justify-center">
                 <Stage
                    width={OFFICE_LAYOUT.width * scale}
                    height={OFFICE_LAYOUT.height * scale}
                    scaleX={scale}
                    scaleY={scale}
                 >
                    <Layer>
                       <Rect width={OFFICE_LAYOUT.width} height={OFFICE_LAYOUT.height} fill="#fff" />
                       {[...Array(9)].map((_, i) => [...Array(7)].map((_, j) => (
                         <Circle key={`${i}-${j}`} x={i * 120 + 60} y={j * 87 + 43.5} radius={1} fill="#cbd5e1" />
                       )))}
                       {OFFICE_LAYOUT.clusters.map(cluster => cluster.desks.map(desk => {
                         const isPlayerDesk = desk.x === player.gridX && desk.y === player.gridY;
                         return (
                           <Group key={desk.id} x={desk.x * 98 + 4} y={desk.y * 85 + 8.5}>
                              <Rect
                                width={90} height={70}
                                fill={isPlayerDesk ? "rgba(79, 70, 229, 0.25)" : "rgba(248, 250, 252, 0.8)"}
                                stroke={isPlayerDesk ? "#4f46e5" : "#e2e8f0"}
                                strokeWidth={isPlayerDesk ? 3 : 1.5}
                                cornerRadius={10}
                                shadowBlur={isPlayerDesk ? 15 : 0}
                                shadowColor="#6366f1"
                                shadowOpacity={isPlayerDesk ? 0.6 : 0}
                              />
                              <Group x={5} y={45}>
                                 <Rect
                                    width={80} height={22}
                                    fill={isPlayerDesk ? "#4f46e5" : "rgba(255,255,255,0.8)"}
                                    cornerRadius={6}
                                 />
                                 <Text
                                    text={isPlayerDesk ? "新進員工" : desk.label}
                                    fontSize={12}
                                    fill={isPlayerDesk ? "#ffffff" : "#94a3b8"}
                                    fontStyle="bold"
                                    width={80}
                                    align="center"
                                    y={5}
                                 />
                              </Group>
                           </Group>
                         );
                       }))}
                       {OFFICE_LAYOUT.objects.map(obj => (
                         <Group key={obj.id} x={obj.x * 98 + 14} y={obj.y * 85 + 4.5}>
                            <Rect width={70} height={70} fill="rgba(241, 245, 249, 0.8)" stroke={obj.id === 'printer' ? "#fecaca" : "#dbeafe"} strokeWidth={3} cornerRadius={16} />
                            <Text text={obj.emoji} fontSize={32} x={20} y={13} />
                            <Group y={50}>
                               <Rect width={70} height={20} fill="rgba(255,255,255,0.8)" cornerRadius={4} />
                               <Text text={obj.label} fontSize={12} fill="#94a3b8" fontStyle="bold" width={70} align="center" y={4} />
                            </Group>
                         </Group>
                       ))}
                       <Group x={gameState.bossPosition.x} y={gameState.bossPosition.y}>
                          <Text text="👿" fontSize={36} x={-18} y={-45} />
                          <Group y={-75}>
                             <Rect width={72} height={23} fill="rgba(255,255,255,0.8)" x={-36} cornerRadius={8} stroke="#000" strokeWidth={2} />
                             <Text text="抓到你囉!" fontSize={14} fill="#000" fontStyle="bold" width={72} align="center" x={-36} y={6} />
                          </Group>
                       </Group>
                       <PixelCat x={gameState.catPosition.x} y={gameState.catPosition.y} />
                       {gameState.players.map((p) => {
                         const isRecentTarget = gameState.lastEvent?.includes(p.name) || (p.id === 'player' && (gameState.lastEvent?.includes("你") || gameState.lastEvent?.includes("手速") || gameState.lastEvent?.includes("戴上")));
                         return (
                           <Group key={p.id} x={p.position.x} y={p.position.y} onClick={() => setSelectedPlayerId(p.id)}>
                              <PixelCharacter id={p.id} name={p.name} color={p.id === 'player' ? "#6366f1" : "#10b981"} isSelected={selectedPlayerId === p.id} bobOffset={p.position.y % 4} gender={p.gender} />
                              {isRecentTarget && showEvent && (
                                <Group y={-85}>
                                   <Rect width={90} height={30} fill="rgba(255,255,255,0.8)" x={-45} cornerRadius={9} stroke="#6366f1" strokeWidth={2} shadowBlur={5} shadowColor="rgba(0,0,0,0.1)" />
                                   <Text text="摸魚中..." fontSize={12} fill="#4338ca" fontStyle="bold" width={90} align="center" x={-45} y={9} />
                                   <Rect width={9} height={9} fill="rgba(255,255,255,0.8)" x={-4.5} y={25.5} rotation={45} stroke="#6366f1" strokeWidth={2} />
                                   <Rect width={12} height={6} fill="rgba(255,255,255,0.8)" x={-6} y={22.5} />
                                </Group>
                              )}
                           </Group>
                         );
                       })}
                    </Layer>
                 </Stage>
              </div>
        </div>

        {/* Slacking System (Bottom Card Area) */}
        <div className="h-[200px] bg-white/95 backdrop-blur-md border-t border-stone-200 flex flex-col px-8 py-4 z-40 overflow-hidden">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-indigo-500" />
                    <span className="text-sm font-black text-stone-700 uppercase tracking-widest">摸魚協議 (Slacking Protocol)</span>
                </div>
                <span className="text-sm text-stone-400 font-bold uppercase tracking-wider">手牌: {gameState.hand.length} / 5</span>
            </div>

            <div className="flex items-center gap-3 h-full overflow-hidden">
                {/* FIXED Draw Button Area (Slot Style) */}
                <div className="shrink-0 h-[126px] w-32 bg-stone-100/40 rounded-[24px] border border-stone-200/50 flex items-center justify-center relative shadow-inner mr-4 group/slot transition-colors hover:bg-stone-100/60">
                    {/* Background Glow */}
                    <div className="absolute inset-4 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none group-hover/slot:bg-indigo-500/10 transition-all" />

                    <button
                        onClick={drawCard}
                        disabled={player.stats.mp <= 0}
                        className={cn(
                            "w-24 h-[114px] rounded-2xl flex flex-col items-center justify-between py-2.5 px-2 transition-all duration-300 relative overflow-hidden group shrink-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 active:scale-95 disabled:grayscale disabled:opacity-50",
                            player.stats.mp > 0
                                ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 text-white border-t border-indigo-400/40"
                                : "bg-stone-200 text-stone-400 border-none"
                        )}
                    >
                        {/* 光澤效果飾條 */}
                        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-700 pointer-events-none" />

                        <div className="flex flex-col items-center gap-2 z-10">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Draw</span>
                        </div>

                        <div className="flex flex-col items-center z-10">
                            <span className="text-base font-black tracking-tighter leading-none mb-2">抽牌</span>
                            <div className="px-2 py-0.5 bg-black/20 rounded-full flex items-center gap-1 border border-white/10">
                                <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] font-bold">1 MP</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* SCROLLABLE Cards */}
                <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar h-full py-2">
                    {gameState.hand.map((card, idx) => (
                       <motion.div
                         key={`${card.id}-${idx}`}
                         layoutId={card.id}
                         whileHover={{ y: -12, scale: 1.05, zIndex: 10 }}
                         onClick={() => playCard(card.id, selectedPlayerId)}
                         className={cn(
                            "w-44 h-[114px] bg-white border-2 rounded-2xl p-2.5 cursor-pointer flex flex-col relative shadow-md hover:shadow-2xl transition-all shrink-0",
                            card.type === CardType.PRANK ? "border-stone-200 hover:border-rose-400" : "border-stone-200 hover:border-indigo-400",
                            player.stats.mp < card.mpCost && "opacity-50 grayscale"
                         )}
                       >
                          <div className="flex justify-between items-start mb-1.5">
                              <span className={cn("text-[11px] font-black uppercase tracking-wider",
                                  card.rarity === 'S' ? "text-amber-500" :
                                  card.rarity === 'A' ? "text-purple-500" : "text-stone-400"
                              )}>
                                  {card.rarity} 等級
                              </span>
                              <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white",
                                  card.type === CardType.PRANK ? "bg-rose-500" : "bg-sky-500"
                              )}>
                                  {card.type}
                              </div>
                          </div>

                          <div className="flex justify-between items-center mb-1.5 gap-2">
                              <h3 className="font-black text-sm text-stone-900 leading-tight truncate">{card.name}</h3>
                              <div className="flex items-center gap-1 shrink-0 bg-stone-50 px-1.5 py-0.5 rounded-lg border border-stone-100">
                                  <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                                  <span className="font-mono font-bold text-[10px] text-stone-600 leading-none">{card.mpCost}</span>
                              </div>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium leading-relaxed line-clamp-2">{card.description}</p>
                       </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
