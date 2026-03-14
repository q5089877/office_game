/**
 * ConsolePanel 組件 - U-Shaped HUD 的底部控制台
 */

import React from 'react';
import { motion } from 'motion/react';
import { Zap, Flame, Coffee, Ghost, ArrowRight, Hand, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player, ActionCategory } from '../../types';
import { getStressColorClass } from '../../theme/colorUtils';
import { OFFICE_LAYOUT } from '../../constants';

interface ConsolePanelProps {
  gameState: GameState;
  player: Player;
  onExecuteAction: (category: ActionCategory) => void;
  onClockOut: () => void;
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({
  gameState,
  player,
  onExecuteAction,
  onClockOut,
}) => {
  // 檢查玩家是否在可互動的物件旁
  const nearbyObject = OFFICE_LAYOUT.objects.find(obj => 
    Math.abs(obj.x - player.gridX) <= 1 && Math.abs(obj.y - player.gridY) <= 1
  );

  const requiredDays = 3 + Math.floor((gameState.day - 1) / 2);
  const limitDays = Math.min(8, requiredDays);
  const canClockOut = gameState.activityThisDay >= limitDays;

  return (
    <div className="pointer-events-auto h-36 bg-slate-900 border-t border-white/10 flex items-center justify-between px-10 gap-6 shadow-[0_-30px_60px_rgba(0,0,0,0.5)] shrink-0 w-full relative z-40">
      
      {/* 左側：主動作組 */}
      <div className="flex gap-3">
        <button 
          onClick={() => onExecuteAction(ActionCategory.SLACKING)}
          disabled={player.stats.energy <= 0}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-20 rounded-3xl shadow-xl transition-all group",
            player.stats.energy > 0 ? "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95" : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
          )}
        >
          <Coffee className="w-6 h-6 mb-1.5 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-tighter">摸魚</span>
        </button>
        <button 
          onClick={() => onExecuteAction(ActionCategory.PRANK)}
          disabled={player.stats.energy <= 0}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-20 rounded-3xl shadow-xl transition-all group",
            player.stats.energy > 0 ? "bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-500 hover:-translate-y-1 active:scale-95" : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
          )}
        >
          <Ghost className="w-6 h-6 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-tighter">惡搞</span>
        </button>
      </div>

      {/* 中央：雙核心對稱數值表 */}
      <div className="flex-1 flex max-w-2xl items-center justify-center gap-8 md:gap-16">
        
        {/* 能量槽 */}
        <div className="flex flex-col gap-2 w-full max-w-[224px]">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest hidden md:inline">精力核心</span>
            </div>
            <span className="text-2xl font-mono font-black text-emerald-400 leading-none tabular-nums">
                {player.stats.energy.toFixed(0)} <span className="text-sm opacity-40 font-normal">/ {player.stats.maxEnergy}</span>
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all duration-700" style={{ width: `${(player.stats.energy/player.stats.maxEnergy)*100}%` }} />
          </div>
        </div>

        {/* 中央閃避按鈕 */}
        <button 
          onClick={() => onExecuteAction(ActionCategory.EVADE)}
          disabled={player.stats.energy <= 0}
          className={cn(
            "flex shrink-0 flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border transition-all group",
            player.stats.energy > 0 ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50" : "bg-black/20 border-white/5 text-slate-600 opacity-50 cursor-not-allowed"
          )}
        >
            <ArrowRight className="w-6 h-6 md:w-7 md:h-7 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] md:text-[11px] font-black text-white mt-1 uppercase">閃避</span>
        </button>

        {/* 壓力槽 */}
        <div className="flex flex-col gap-2 w-full max-w-[224px] text-right">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-mono font-black text-rose-500 leading-none tabular-nums">
                {player.stats.stress.toFixed(0)} <span className="text-sm opacity-40 font-normal">/ 100</span>
            </span>
            <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest hidden md:inline">壓力臨界點</span>
                <Flame className={cn("w-4 h-4 text-rose-500 fill-rose-500", player.stats.stress > 80 ? "animate-pulse" : "")} />
            </div>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div className={cn("h-full rounded-full transition-all duration-700", getStressColorClass(player.stats.stress).includes('rose') ? "bg-gradient-to-l from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "bg-gradient-to-l from-orange-500 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]")} style={{ width: `${player.stats.stress}%` }} />
          </div>
        </div>
      </div>

      {/* 右側：交互與終止 */}
      <div className="flex items-center gap-5">
        <button 
           onClick={() => nearbyObject ? onExecuteAction(ActionCategory.INTERACT) : null}
           className={cn(
             "h-20 px-4 md:px-8 rounded-3xl flex items-center gap-4 transition-all group",
             nearbyObject 
               ? "bg-orange-500 hover:bg-orange-400 text-white shadow-xl shadow-orange-500/30 active:scale-95" 
               : "bg-slate-800/50 text-slate-500/50 cursor-not-allowed border border-dashed border-slate-700/50"
           )}
        >
            <div className="flex flex-col items-start leading-none">
                <span className="text-[11px] font-black opacity-70 uppercase tracking-tighter hidden md:inline">{nearbyObject ? '目標鎖定' : '查無目標'}</span>
                <span className="text-sm md:text-lg font-black uppercase">互動</span>
            </div>
            <Hand className={cn("w-5 h-5 md:w-6 md:h-6", nearbyObject ? "group-hover:rotate-12 transition-transform" : "")} />
        </button>

        <div className="h-14 w-px bg-white/10 hidden md:block" />

        <button 
          onClick={onClockOut}
          disabled={!canClockOut}
          className={cn(
            "group h-20 flex flex-col items-center justify-center gap-1.5 transition-all px-2",
            canClockOut ? "text-emerald-400 hover:text-emerald-300" : "text-slate-500 cursor-not-allowed"
          )}
        >
            <Clock className={cn("w-6 h-6", canClockOut ? "group-hover:scale-110 transition-transform" : "")} />
            <span className="text-xs font-black uppercase tracking-tighter">打卡下班</span>
        </button>
      </div>

    </div>
  );
};

export default ConsolePanel;
