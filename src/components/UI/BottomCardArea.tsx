/**
 * BottomCardArea 組件
 * 底部卡片區域，包含抽牌按鈕和手牌顯示
 */

import React from 'react';
import { motion } from 'motion/react';
import { Activity, PlusCircle, Zap, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player, Card, CardType } from '../../types';

interface BottomCardAreaProps {
  gameState: GameState;
  player: Player;
  onDrawCard: () => void;
  onPlayCard: (cardId: string) => void; // 不再需要playerId參數
}

const BottomCardArea: React.FC<BottomCardAreaProps> = ({
  gameState,
  player,
  onDrawCard,
  onPlayCard,
}) => {
  return (
    <div className="h-[180px] md:h-[220px] bg-slate-900 border-t border-slate-700 flex flex-col px-4 md:px-8 py-4 z-40 overflow-hidden relative">
      {/* 裝飾性背景線條 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(90deg, #4F46E5 1px, transparent 1px), linear-gradient(0deg, #4F46E5 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" />
            <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em]">
              Tactical Console v1.0
            </span>
          </div>

          {/* 核心資源快速監控 (Tactical Orbs) */}
          <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Zap size={14} className="fill-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Energy</span>
                <span className="text-sm font-black text-emerald-400 font-mono leading-none">
                  {player.stats.energy}<span className="text-slate-600 text-[10px]">/{player.stats.maxEnergy}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 group">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all",
                player.stats.stress > 80 ? "bg-rose-500/20 border border-rose-500/50 text-rose-500 animate-pulse" : "bg-orange-500/10 border border-orange-500/30 text-orange-400"
              )}>
                <Flame size={14} className={player.stats.stress > 80 ? "fill-rose-500" : "fill-orange-500"} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Stress</span>
                <span className={cn("text-sm font-black font-mono leading-none", player.stats.stress > 80 ? "text-rose-500" : "text-orange-400")}>
                  {player.stats.stress}<span className="text-slate-600 text-[10px]">/100</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <span className="text-[9px] font-black text-rose-400/70 px-2 py-0.5 rounded border border-rose-500/30">PRANK</span>
            <span className="text-[9px] font-black text-cyan-400/70 px-2 py-0.5 rounded border border-cyan-500/30">EVADE</span>
          </div>
          <span className="text-xs text-slate-400 font-black uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            HAND: {gameState.hand.length}/5
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full overflow-hidden relative z-10">
        {/* 抽牌區優化 */}
        <div className="shrink-0 h-[130px] flex items-center bg-slate-800/50 rounded-[28px] border border-slate-700 p-2 relative shadow-2xl mr-2 group/slot transition-all hover:border-indigo-500/50">
          <button
            onClick={onDrawCard}
            disabled={player.stats.energy <= 0}
            className={cn(
              "w-24 h-[114px] rounded-2xl flex flex-col items-center justify-between py-3 px-2 transition-all duration-300 relative overflow-hidden group shrink-0 shadow-lg",
              player.stats.energy > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1 active:scale-95"
                : "bg-slate-700 text-slate-500 border-none cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 text-center">Draw Protocol</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-tighter leading-none mb-2">摸魚</span>
              <div className="px-2 py-1 bg-black/30 rounded-full flex items-center gap-1 border border-white/10">
                <Zap size={10} className="text-emerald-400 fill-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">1 MP</span>
              </div>
            </div>
          </button>
        </div>

        {/* 手牌捲動區 */}
        <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar h-full py-2">
          {gameState.hand.map((card, idx) => {
            const isPrank = card.type === CardType.PRANK;
            const isEvade = card.id.startsWith('c2') || card.id.startsWith('c3');
            const colorClass = isPrank ? "hover:border-rose-500/50 shadow-rose-900/10" : "hover:border-indigo-500/50 shadow-indigo-900/10";

            return (
              <motion.div
                key={`${card.id}-${idx}`}
                layoutId={card.id}
                whileHover={{ y: -16, scale: 1.05, zIndex: 20 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlayCard(card.id)}
                className={cn(
                  "w-48 h-[120px] bg-slate-800 border-2 border-slate-700 rounded-2xl p-3 cursor-pointer flex flex-col relative transition-all shrink-0 group overflow-hidden shadow-xl",
                  colorClass,
                  player.stats.energy < card.energyCost
                    ? "opacity-40 grayscale pointer-events-none border-dashed"
                    : "hover:border-indigo-500 hover:shadow-indigo-500/20 active:border-indigo-400"
                )}
              >
                {/* 稀有度指示器 */}
                <div className={cn(
                  "absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rotate-45",
                  card.rarity === 'S' ? "bg-amber-500" : card.rarity === 'A' ? "bg-indigo-500" : "bg-slate-600"
                )} />

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.rarity} RANK</span>
                  <div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                    <Zap size={10} className="text-emerald-400 fill-emerald-400" />
                    <span className="font-mono font-black text-xs text-emerald-400">{card.energyCost}</span>
                  </div>
                </div>

                <div className="mb-2 relative z-10">
                  <h3 className="font-black text-sm text-slate-100 leading-tight mb-1 group-hover:text-indigo-400 transition-colors">{card.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isPrank ? "bg-rose-500" : "bg-indigo-500")} />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{card.type}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed line-clamp-2">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomCardArea;
