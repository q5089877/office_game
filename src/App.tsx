import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Group } from 'react-konva';
import { useGameEngine } from './useGameEngine';
import { CardType } from './types';
import { OFFICE_LAYOUT } from './constants';
import {
  AlertCircle, Clock, UserCircle, PlusCircle, Activity, Skull, Ghost, DollarSign, Flame, Heart, Zap, Star, Shield, Trophy, Coffee, Trash2, Smile, Sparkles, Clover
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const VerticalBar = ({ value, max, color, label, icon: Icon }: { value: number, max: number, color: string, label: string, icon?: any }) => (
  <div className="flex flex-col items-center gap-1 h-full group">
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

const PixelCharacter = ({ name, color, isSelected, bobOffset, id }: { name: string, color: string, isSelected: boolean, bobOffset: number, id: string }) => {
  const isPlayer = id === 'player';
  const hairColor = isPlayer ? "#4c1d95" : "#78350f";
  const skinColor = "#fde68a";

  return (
    <Group y={bobOffset} scaleX={0.81} scaleY={0.81}>
      <Circle radius={15} fill="rgba(0,0,0,0.1)" scaleY={0.5} y={3} />
      <Rect width={39} height={45} fill={color} cornerRadius={6} x={-19.5} y={-45} stroke="#1a1a1a" strokeWidth={2.25} />
      <Rect width={33} height={15} fill="rgba(0,0,0,0.1)" x={-16.5} y={-18} cornerRadius={3} />
      <Rect width={33} height={30} fill={skinColor} x={-16.5} y={-48} cornerRadius={4.5} stroke="#1a1a1a" strokeWidth={2.25} />
      <Rect width={39} height={12} fill={hairColor} x={-19.5} y={-51} cornerRadius={6} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={9} height={18} fill={hairColor} x={-19.5} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={9} height={18} fill={hairColor} x={10.5} y={-45} cornerRadius={3} stroke="#1a1a1a" strokeWidth={1.5} />
      <Rect width={4.5} height={6} fill="#1a1a1a" x={-9} y={-37.5} cornerRadius={1.5} />
      <Rect width={4.5} height={6} fill="#1a1a1a" x={4.5} y={-37.5} cornerRadius={1.5} />
      <Rect width={1.5} height={1.5} fill="#fff" x={-7.5} y={-36} />
      <Rect width={1.5} height={1.5} fill="#fff" x={6} y={-36} />
      <Rect width={6} height={3} fill="#fca5a5" x={-13.5} y={-30} opacity={0.6} />
      <Rect width={6} height={3} fill="#fca5a5" x={7.5} y={-30} opacity={0.6} />
      <Group y={-61} scaleX={1.235} scaleY={1.235}>
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
  <Group x={x * 180 + 90} y={y * 104 + 52}>
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
            <VerticalBar value={player.stats.hp} max={100} color="bg-rose-500" label="HP" />
            <VerticalBar value={player.stats.mp} max={player.stats.maxMp} color="bg-cyan-500" label="MP" />
            <div className="flex flex-col items-center gap-1 h-full group">
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
            <button
              onClick={() => setShowShop(!showShop)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm",
                showShop ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-100 hover:bg-stone-50"
              )}
            >
              <Coffee size={20} />
            </button>
        </div>

        {/* Attributes / Shop Panel */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {showShop ? (
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
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '90px 52px' }}>

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
             <div className="bg-white rounded-[32px] shadow-2xl border border-stone-200/60 overflow-hidden relative" style={{ height: '522px' }}>
                 <Stage width={OFFICE_LAYOUT.width} height={522}>
                    <Layer>
                       <Rect width={OFFICE_LAYOUT.width} height={522} fill="#fff" />
                       {[...Array(13)].map((_, i) => [...Array(11)].map((_, j) => (
                         <Circle key={`${i}-${j}`} x={i * 90 + 45} y={j * 52 + 26} radius={1} fill="#cbd5e1" />
                       )))}
                       {OFFICE_LAYOUT.clusters.map(cluster => cluster.desks.map(desk => (
                         <Group key={desk.id} x={desk.x * 180 + 36} y={desk.y * 104 + 16}>
                            <Rect width={108} height={81} fill="rgba(248, 250, 252, 0.8)" stroke="#e2e8f0" strokeWidth={1.5} cornerRadius={10} />
                            <Group x={9} y={50}>
                               <Rect width={90} height={18} fill="rgba(255,255,255,0.8)" cornerRadius={4} />
                               <Text text={desk.label} fontSize={14} fill="#94a3b8" fontStyle="bold" width={90} align="center" y={3} />
                            </Group>
                         </Group>
                       )))}
                       {OFFICE_LAYOUT.objects.map(obj => (
                         <Group key={obj.id} x={obj.x * 180 + 52} y={obj.y * 104 + 16}>
                            <Rect width={76} height={76} fill="rgba(241, 245, 249, 0.8)" stroke={obj.id === 'printer' ? "#fecaca" : "#dbeafe"} strokeWidth={3} cornerRadius={16} />
                            <Text text={obj.emoji} fontSize={32} x={24} y={13} />
                            <Group y={50}>
                               <Rect width={76} height={18} fill="rgba(255,255,255,0.8)" cornerRadius={4} />
                               <Text text={obj.label} fontSize={14} fill="#94a3b8" fontStyle="bold" width={76} align="center" y={3} />
                            </Group>
                         </Group>
                       ))}
                       <Group x={gameState.bossPosition.x} y={gameState.bossPosition.y}>
                          <Text text="👿" fontSize={36} x={-18} y={-45} />
                          <Group y={-81}>
                             <Rect width={72} height={23} fill="rgba(255,255,255,0.8)" x={-36} cornerRadius={8} stroke="#000" strokeWidth={2} />
                             <Text text="抓到你囉!" fontSize={14} fill="#000" fontStyle="bold" width={72} align="center" x={-36} y={6} />
                          </Group>
                       </Group>
                       <PixelCat x={gameState.catPosition.x} y={gameState.catPosition.y} />
                       {gameState.players.map((p) => {
                         const isRecentTarget = gameState.lastEvent?.includes(p.name) || (p.id === 'player' && (gameState.lastEvent?.includes("你") || gameState.lastEvent?.includes("手速") || gameState.lastEvent?.includes("戴上")));
                         return (
                           <Group key={p.id} x={p.position.x} y={p.position.y} onClick={() => setSelectedPlayerId(p.id)}>
                              <PixelCharacter id={p.id} name={p.name} color={p.id === 'player' ? "#6366f1" : "#10b981"} isSelected={selectedPlayerId === p.id} bobOffset={p.position.y % 4} />
                              {isRecentTarget && showEvent && (
                                <Group y={-92}>
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
