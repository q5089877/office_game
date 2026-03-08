/**
 * Sidebar 組件 - 優化 Layout 版本
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ghost, Calendar, Coffee, HelpCircle,
  Flame, Zap, CheckCircle2, Info, Wallet, TrendingUp
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player, ItemType } from '../../types';
import { SHOP_ITEMS } from '../../constants';

interface SidebarProps {
  gameState: GameState;
  player: Player;
  showGuide: boolean;
  showShop: boolean;
  onToggleGuide: () => void;
  onToggleShop: () => void;
  onBuyItem: (itemId: string) => void;
  onClockOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  gameState,
  player,
  showGuide,
  showShop,
  onToggleGuide,
  onToggleShop,
  onBuyItem,
  onClockOut,
}) => {
  return (
    <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col z-50 shadow-2xl shrink-0 relative overflow-hidden font-sans">
      
      {/* Header Section - 玩家資訊與等級 */}
      <div className="bg-white p-6 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <Ghost size={28} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
              LV.{player.stats.level}
            </div>
          </div>
          <div className="min-w-0 flex flex-col">
            <h1 className="font-black text-xl italic tracking-tighter text-slate-800 leading-none mb-1">
              PIXEL THIEF
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tracking-widest uppercase">
                {player.role}
              </span>
            </div>
          </div>
        </div>

        {/* Vitals - 橫向進度條優化空間 */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1"><Zap size={10} className="text-orange-500" /> 壓力值 (Stress)</span>
              <span className={cn(player.stats.stress > 80 ? "text-rose-500 animate-pulse" : "text-slate-600")}>{player.stats.stress} / 100</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
              <motion.div 
                className={cn("h-full transition-colors duration-500", player.stats.stress > 80 ? "bg-rose-500" : "bg-orange-400")}
                initial={{ width: 0 }}
                animate={{ width: `${player.stats.stress}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1"><TrendingUp size={10} className="text-emerald-500" /> 精力值 (Energy)</span>
              <span className="text-slate-600">{player.stats.energy} / {player.stats.maxEnergy}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${(player.stats.energy / player.stats.maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Area - 終端機風格日誌 */}
      <div className="p-4 bg-slate-900 mx-4 mt-4 rounded-xl border border-slate-800 shadow-2xl h-32 overflow-hidden flex flex-col relative group">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM LOG
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          <AnimatePresence mode="popLayout">
            {gameState.notifications.map((note, i) => (
              <motion.div
                key={`${note}-${i}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "text-[13px] font-black leading-tight flex items-start gap-2",
                  note.includes("❌") || note.includes("⚠️") ? "text-rose-400" : 
                  note.includes("💰") ? "text-emerald-400" : "text-indigo-300"
                )}
              >
                <span className="shrink-0 opacity-50 mt-1">●</span>
                <span>{note}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/10 via-transparent to-slate-900/40" />
      </div>

      {/* Economy & Shop Toggle - 錢包風格 */}
      <div className="px-6 py-4 flex items-center justify-between mt-auto bg-white/50 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Wallet size={10} /> SAVINGS
          </span>
          <span className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
            ${player.stats.savings}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onToggleShop}
            className={cn(
              "p-3 rounded-xl transition-all shadow-sm border",
              showShop ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Coffee size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area (Shop/Guide) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white/30 backdrop-blur-sm">
        {showShop ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Available Tools</h3>
            <div className="grid gap-3">
              {SHOP_ITEMS.map((item) => {
                const isOwned = player.ownedItemIds?.includes(item.id);
                const canAfford = player.stats.savings >= item.price;
                return (
                  <button
                    key={item.id}
                    disabled={isOwned}
                    onClick={() => onBuyItem(item.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all group relative overflow-hidden",
                      isOwned ? "bg-slate-50 border-slate-200 grayscale opacity-60 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md active:scale-95",
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 uppercase tracking-tighter">TOOL</div>
                      {isOwned ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <span className={cn("font-black text-sm", canAfford ? "text-slate-900" : "text-rose-500")}>
                          ${item.price}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-sm text-slate-800 mb-1">{item.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 leading-relaxed">{item.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Flame size={12} className="text-orange-500" /> 混亂度</span>
                  <span className="text-xs font-black text-orange-500">{gameState.chaosLevel}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-orange-400" initial={{ width: 0 }} animate={{ width: `${gameState.chaosLevel}%` }} />
               </div>
            </div>
            
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
              <Calendar className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform" size={60} />
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">今日事件</p>
              <p className="font-black text-lg leading-tight mb-1">{gameState.currentEvent.name}</p>
              <p className="text-[11px] font-bold opacity-80">{gameState.currentEvent.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - 下班按鈕 */}
      <div className="p-6 bg-white border-t border-slate-100">
        <button
          disabled={gameState.activityThisDay < 3}
          onClick={onClockOut}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
            gameState.activityThisDay >= 3 
              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          下班 (Clock Out)
          {gameState.activityThisDay >= 3 && (
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
        </button>
        <p className="text-center text-[10px] font-black text-slate-300 mt-3 tracking-widest">
           PROGRESS: {Math.min(100, Math.round(gameState.activityThisDay * 33.3))}%
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
