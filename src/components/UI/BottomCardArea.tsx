/**
 * BottomCardArea 組件 - 規範化色彩版本
 */

import React from 'react';
import { motion } from 'motion/react';
import { Activity, PlusCircle, Zap, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player, CardType } from '../../types';
import { themeColors } from '../../theme/colors';
import { tw, getStressColorClass, getCardColor, getThemeColor } from '../../theme/colorUtils';

interface BottomCardAreaProps {
  gameState: GameState;
  player: Player;
  onDrawCard: () => void;
  onPlayCard: (cardId: string) => void;
}

const BottomCardArea: React.FC<BottomCardAreaProps> = ({
  gameState,
  player,
  onDrawCard,
  onPlayCard,
}) => {
  return (
    <div
      className={cn(
        "h-[200px] md:h-[240px] border-t flex flex-col px-4 md:px-8 py-3 z-40 overflow-hidden relative shadow-[0_-10px_30px_rgba(0,0,0,0.1)]",
        tw.bg.light
      )}
      style={{ borderColor: themeColors.secondary[200] }}
    >
      {/* 裝飾性網格：與 App 統一 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{
             backgroundImage: `linear-gradient(90deg, ${themeColors.primary[500]} 1px, transparent 1px), linear-gradient(0deg, ${themeColors.primary[500]} 1px, transparent 1px)`,
             backgroundSize: '10px 10px'
           }} />

      <div className="flex justify-between items-center mb-2 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: themeColors.primary[300] }} />
            <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: themeColors.primary[700] }}>
              Tactical Console v1.1
            </span>
          </div>

          {/* 核心資源快速監控 */}
          <div className="flex items-center gap-4 border-l pl-6" style={{ borderColor: themeColors.secondary[200] }}>
            <div className="flex items-center gap-2 group">
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                style={{ backgroundColor: `${themeColors.success[500]}10`, borderColor: `${themeColors.success[500]}30`, color: themeColors.success[400] }}
              >
                <Zap size={14} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-[9px] font-black uppercase leading-none mb-1", tw.text.muted)}>Energy</span>
                <span className="text-sm font-black font-mono leading-none" style={{ color: themeColors.success[400] }}>
                  {player.stats.energy}<span className={cn("text-[10px]", tw.text.muted)}>/{player.stats.maxEnergy}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 group">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transition-all",
                  player.stats.stress > 80 ? "animate-pulse" : ""
                )}
                style={{
                  backgroundColor: player.stats.stress > 80 ? `${themeColors.error[500]}20` : `${themeColors.warning[500]}10`,
                  borderColor: player.stats.stress > 80 ? `${themeColors.error[500]}50` : `${themeColors.warning[500]}30`,
                  color: player.stats.stress > 80 ? themeColors.error[500] : themeColors.warning[400]
                }}
              >
                <Flame size={14} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-[9px] font-black uppercase leading-none mb-1", tw.text.muted)}>Stress</span>
                <span className={cn("text-sm font-black font-mono leading-none", getStressColorClass(player.stats.stress))}>
                  {player.stats.stress}<span className={cn("text-[10px]", tw.text.muted)}>/100</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <span className="text-[9px] font-black px-2 py-0.5 rounded border" style={{ color: `${themeColors.error[400]}CC`, borderColor: `${themeColors.error[500]}40` }}>PRANK</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded border" style={{ color: `${themeColors.primary[300]}CC`, borderColor: `${themeColors.primary[500]}40` }}>EVADE</span>
          </div>
          <span className={cn("text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border", tw.bg.card)} style={{ borderColor: themeColors.primary[500], color: themeColors.primary[700] }}>
            HAND: {gameState.hand.length}/5
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 h-full overflow-hidden relative z-10">
        {/* 抽牌區 */}
        <div
          className="shrink-0 h-[130px] flex items-center rounded-[28px] border p-2 relative shadow-2xl mr-0 group/slot transition-all"
          style={{ backgroundColor: `${themeColors.secondary[50]}80`, borderColor: themeColors.primary[500] }}
        >
          <button
            onClick={onDrawCard}
            disabled={player.stats.energy <= 0}
            className={cn(
              "w-20 md:w-24 h-[114px] rounded-2xl flex flex-col items-center justify-between py-3 px-2 transition-all duration-300 relative overflow-hidden group shrink-0 shadow-lg",
              player.stats.energy > 0
                ? "text-white hover:-translate-y-1 active:scale-95"
                : "cursor-not-allowed opacity-50"
            )}
            style={{ backgroundColor: player.stats.energy > 0 ? themeColors.primary[500] : themeColors.secondary[800] }}
          >
            <div className="flex flex-col items-center gap-2">
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 text-center">Draw Protocol</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-tighter leading-none mb-2">摸魚</span>
              <div className="px-2 py-1 bg-black/30 rounded-full flex items-center gap-1 border border-white/10">
                <Zap size={10} style={{ color: themeColors.success[400] }} className="fill-current" />
                <span className="text-[10px] font-bold" style={{ color: themeColors.success[400] }}>1 MP</span>
              </div>
            </div>
          </button>
        </div>

        {/* 手牌捲動區 */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar h-full py-2">
          {gameState.hand.map((card, idx) => {
            const isPrank = card.type === CardType.PRANK;
            const cardUI = getCardColor(card.type);

            return (
              <motion.div
                key={`${card.id}-${idx}`}
                layoutId={card.id}
                whileHover={{ y: -16, scale: 1.05, zIndex: 20 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlayCard(card.id)}
                className={cn(
                  "w-40 md:w-44 h-[120px] border-2 rounded-2xl p-3 cursor-pointer flex flex-col relative transition-all shrink-0 group overflow-hidden shadow-xl",
                  player.stats.energy < card.energyCost
                    ? "opacity-40 grayscale pointer-events-none border-dashed"
                    : "active:border-indigo-400"
                )}
                style={{
                  backgroundColor: themeColors.secondary[50],
                  borderColor: themeColors.secondary[200]
                }}
              >
                {/* 稀有度指示器 */}
                <div className="absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rotate-45"
                     style={{ backgroundColor: card.rarity === 'S' ? themeColors.warning[500] : card.rarity === 'A' ? themeColors.primary[500] : themeColors.secondary[600] }} />

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", tw.text.muted)}>{card.rarity} RANK</span>
                  <div
                    className="px-2 py-1 rounded-lg border flex items-center gap-1"
                    style={{ backgroundColor: themeColors.secondary[100], borderColor: themeColors.secondary[200] }}
                  >
                    <Zap size={10} style={{ color: themeColors.success[400] }} className="fill-current" />
                    <span className="font-mono font-black text-xs" style={{ color: themeColors.success[400] }}>{card.energyCost}</span>
                  </div>
                </div>

                <div className="mb-2 relative z-10">
                  <h3 className={cn("font-black text-sm leading-tight mb-1 group-hover:text-indigo-400 transition-colors", tw.text.primary)}>{card.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isPrank ? themeColors.error[500] : themeColors.primary[500] }} />
                    <span className={cn("text-[9px] font-black uppercase tracking-tighter", tw.text.muted)}>{card.type}</span>
                  </div>
                </div>
                <p className={cn("text-[10px] font-bold leading-relaxed line-clamp-2", tw.text.muted)}>{card.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomCardArea;
