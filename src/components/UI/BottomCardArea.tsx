/**
 * BottomCardArea 組件
 * 底部卡片區域，包含抽牌按鈕和手牌顯示
 */

import React from 'react';
import { motion } from 'motion/react';
import { Activity, PlusCircle, Zap } from 'lucide-react';
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
    <div className="h-[200px] bg-[#E2E8F0]/90 backdrop-blur-md border-t border-slate-300 flex flex-col px-8 py-4 z-40 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#4F46E5]" />
          <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
            摸魚協議 (Slacking Protocol)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">💢 PRANK</span>
            <span className="flex items-center gap-1 text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">💨 EVADE</span>
            <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">🛠️ UTIL</span>
          </div>
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider bg-slate-200/50 px-3 py-1 rounded-full">
            手牌: {gameState.hand.length} / 5
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 h-full overflow-hidden">
        {/* ... */}
        <div className="shrink-0 h-[126px] flex items-center bg-slate-200/40 rounded-[24px] border border-slate-300/50 p-1.5 relative shadow-inner mr-4 group/slot transition-colors hover:bg-slate-200/60">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[#4F46E5]/5 blur-3xl rounded-[24px] pointer-events-none group-hover/slot:bg-[#4F46E5]/10 transition-all" />

          {/* 視覺化牌堆 (Deck Stack) */}
          <div className="relative w-12 h-[100px] ml-2 mr-3 opacity-80 pointer-events-none">
            {[...Array(Math.max(1, 5 - gameState.hand.length))].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-0 w-full h-full bg-slate-300 border border-slate-400 rounded-lg shadow-sm"
                style={{
                  transform: `translateY(${i * -3}px) translateX(${i * -1}px) rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                  zIndex: i
                }}
              >
                <div className="absolute inset-1 border border-slate-400/50 rounded-sm" />
              </div>
            ))}
            <div className="absolute -bottom-6 left-0 w-full text-center text-[9px] font-black text-slate-500 tracking-widest uppercase">
              DECK
            </div>
          </div>

          <button
            onClick={onDrawCard}
            disabled={player.stats.mp <= 0}
            className={cn(
              "w-24 h-[114px] rounded-2xl flex flex-col items-center justify-between py-2.5 px-2 transition-all duration-300 relative overflow-hidden group shrink-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 active:scale-95 disabled:grayscale disabled:opacity-50",
              player.stats.mp > 0
                ? "bg-gradient-to-br from-[#4F46E5] via-[#4F46E5] to-indigo-800 text-white border-t border-white/20"
                : "bg-slate-300 text-slate-500 border-none"
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
          {gameState.hand.map((card, idx) => {
            const isPrank = card.type === CardType.PRANK;
            const isEvade = card.id.startsWith('c2') || card.id.startsWith('c3'); // 這裡簡化判斷
            const emoji = isPrank ? "💢" : (isEvade ? "💨" : "🛠️");
            const bandColor = isPrank ? "bg-rose-500" : (isEvade ? "bg-cyan-500" : "bg-purple-500");

            return (
              <motion.div
                key={`${card.id}-${idx}`}
                layoutId={card.id}
                whileHover={{ y: -12, scale: 1.05, zIndex: 10 }}
                onClick={() => onPlayCard(card.id)}
                className={cn(
                  "w-44 h-[114px] bg-white border-2 rounded-2xl p-2.5 cursor-pointer flex flex-col relative shadow-md hover:shadow-2xl transition-all shrink-0 overflow-hidden",
                  isPrank ? "border-slate-200 hover:border-rose-400" : "border-slate-200 hover:border-indigo-400",
                  player.stats.mp < card.mpCost && "opacity-50 grayscale"
                )}
              >
                {/* 分類色帶 (5px) + 圖示 */}
                <div className={cn("absolute top-0 left-0 right-0 h-[5px] flex items-center px-2", bandColor)}>
                  <span className="text-[8px] mt-4 filter grayscale contrast-200 opacity-40">{emoji}</span>
                </div>

                <div className="flex justify-between items-start mb-1.5 mt-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border",
                    card.rarity === 'S' ? "text-amber-600 bg-amber-50 border-amber-200" :
                    card.rarity === 'A' ? "text-[#4F46E5] bg-indigo-50 border-indigo-200" :
                    "text-slate-500 bg-slate-50 border-slate-200"
                  )}>
                    {card.rarity} Rank
                  </span>

                  {/* 消耗數值強調 */}
                  <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
                    <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-mono font-black text-[11px] leading-none">{card.mpCost}</span>
                  </div>
                </div>

                <div className="flex flex-col mb-1.5">
                  <h3 className="font-black text-sm text-slate-900 leading-tight truncate">{card.name}</h3>
                  <span className={cn("text-[9px] font-black uppercase mt-0.5 flex items-center gap-1",
                    isPrank ? "text-rose-500" : "text-cyan-600"
                  )}>
                    {emoji} {card.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomCardArea;
