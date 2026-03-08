/**
 * Sidebar 組件
 * 左側邊欄，包含玩家資訊、狀態、商店、指南等
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Ghost, Calendar, Coffee, HelpCircle,
  Flame, Zap, Sparkles, Clover
} from 'lucide-react';
import { cn } from '../../utils/cn';
import VerticalBar from '../shared/VerticalBar';
import { GameState, Player } from '../../types';

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
    <aside className="w-72 bg-white border-r border-stone-200 flex flex-col p-4 z-50 shadow-[4px_0_20px_rgba(0,0,0,0.03)] shrink-0 relative">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white relative shrink-0">
          <Ghost size={28} className="animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
            LV.{player.stats.level}
          </span>
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h1 className="font-black text-xl uppercase italic tracking-tighter bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-600 text-transparent bg-clip-text leading-none mb-1 drop-shadow-sm">
            Pixel Thief
          </h1>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] truncate">
            {player.role}
          </p>
        </div>
      </div>

      {/* Daily Event */}
      <div className={cn(
        "mb-4 p-3 rounded-2xl border-2 flex flex-col gap-1 shadow-sm",
        gameState.currentEvent.id === 'deadline' ? "bg-rose-50 border-rose-100 text-rose-900" :
        gameState.currentEvent.id === 'friday' ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
        gameState.currentEvent.id === 'coffee_broken' ? "bg-amber-50 border-amber-100 text-amber-900" :
        gameState.currentEvent.id === 'boss_meeting' ? "bg-indigo-50 border-indigo-100 text-indigo-900" :
        "bg-stone-50 border-stone-100 text-stone-900"
      )}>
        <div className="flex items-center gap-2 mb-0.5">
          <Calendar size={14} className="opacity-60" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">今日事件</span>
        </div>
        <p className="font-black text-sm">{gameState.currentEvent.name}</p>
        <p className="text-[10px] font-bold opacity-70 leading-tight">{gameState.currentEvent.description}</p>
      </div>

      {/* Vitals (HP/MP/XP) */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex justify-around mb-4">
        <VerticalBar
          value={player.stats.hp}
          max={100}
          color="bg-rose-500"
          label="HP"
          title="體力：歸零則 Game Over"
        />
        <VerticalBar
          value={player.stats.mp}
          max={player.stats.maxMp}
          color="bg-cyan-500"
          label="MP"
          title="摸魚值：抽牌出牌用"
        />
        <div className="flex flex-col items-center gap-1 h-full group">
          <div className="w-2.5 h-16 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200 shadow-inner">
            <motion.div
              className="absolute bottom-0 w-full bg-amber-400 rounded-full"
              animate={{ height: `${player.stats.xp}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-stone-700 leading-none mt-0.5">{Math.round(player.stats.xp)}</span>
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider">XP</span>
        </div>
      </div>

      {/* Economy & Shop Toggle */}
      <div className="mb-4 px-2 flex justify-between items-end">
        <div>
          <p className="text-[11px] text-stone-400 font-bold uppercase mb-1 tracking-wider">Savings</p>
          <p className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">
            <span className="text-2xl opacity-50">$</span>{player.stats.savings}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleGuide}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm",
              showGuide ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-100 hover:bg-stone-50"
            )}
          >
            <HelpCircle size={20} />
          </button>
          <button
            onClick={onToggleShop}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm",
              showShop ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-100 hover:bg-stone-50"
            )}
          >
            <Coffee size={20} />
          </button>
        </div>
      </div>

      {/* Attributes / Shop / Guide Panel - SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        {showGuide ? (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <p className="text-[11px] text-indigo-500 font-black uppercase mb-1 tracking-widest">遊戲指南</p>
            <div className="space-y-4 pr-1 text-[11px] font-bold text-stone-500">
              <section>
                <h4 className="font-black text-stone-700 mb-1.5 border-b border-stone-100 pb-1 uppercase tracking-tighter text-[10px]">基礎數值</h4>
                <div className="space-y-1">
                  <div className="flex justify-between bg-stone-50/50 p-1.5 rounded-md"><span className="text-rose-500">HP (體力)</span><span>歸零則結束</span></div>
                  <div className="flex justify-between bg-stone-50/50 p-1.5 rounded-md"><span className="text-cyan-500">MP (摸魚)</span><span>抽牌消耗 1</span></div>
                  <div className="flex justify-between bg-stone-50/50 p-1.5 rounded-md"><span className="text-amber-500">XP (年資)</span><span>100% 則升職</span></div>
                </div>
              </section>
            </div>
          </div>
        ) : showShop ? (
          <div className="flex flex-col gap-2 animate-in fade-in duration-300">
            <p className="text-[11px] text-indigo-500 font-black uppercase mb-2 tracking-widest">Office Shop</p>
            <button onClick={() => onBuyItem('hp_pot')} className="flex justify-between items-center p-2.5 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors text-xs">
              <div className="text-left font-black text-rose-700">能量飲料 (+30 HP)</div>
              <span className="font-black text-rose-600">$200</span>
            </button>
            <button onClick={() => onBuyItem('mp_pot')} className="flex justify-between items-center p-2.5 bg-cyan-50 border border-cyan-100 rounded-xl hover:bg-cyan-100 transition-colors text-xs">
              <div className="text-left font-black text-cyan-700">提神薄荷 (+50 MP)</div>
              <span className="font-black text-cyan-600">$300</span>
            </button>
            <button onClick={() => onBuyItem('luck_up')} className="flex justify-between items-center p-2.5 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-colors text-xs">
              <div className="text-left font-black text-amber-700">開運御守 (+2 幸運)</div>
              <span className="font-black text-amber-600">$500</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <p className="text-[11px] text-indigo-500 font-black uppercase mb-1 tracking-widest">屬性面板</p>
            <div className="space-y-2">
              <div className={cn("flex justify-between items-center bg-stone-50/50 p-2 rounded-lg transition-all", gameState.chaosLevel > 70 && "animate-shake")}>
                <span className="text-[11px] font-black text-stone-700 uppercase tracking-tighter flex items-center gap-1.5"><Flame size={12} className="text-orange-500" />混亂度</span>
                <span className="text-[11px] font-black text-orange-500">{gameState.chaosLevel}%</span>
              </div>
              <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg border-l-4 border-emerald-400 shadow-sm">
                <span className="text-[11px] font-black text-stone-700 uppercase tracking-tighter flex items-center gap-1.5"><Clover size={12} className="text-emerald-500" />幸運</span>
                <span className="text-[11px] font-black text-emerald-500">{player.stats.luck}</span>
              </div>
              <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg border-l-4 border-emerald-400 shadow-sm">
                <span className="text-[11px] font-black text-stone-700 uppercase tracking-tighter flex items-center gap-1.5"><Sparkles size={12} className="text-emerald-500" />魅力</span>
                <span className="text-[11px] font-black text-emerald-500">{player.stats.charisma}</span>
              </div>
              <div className="flex justify-between items-center bg-stone-50/50 p-2 rounded-lg border-l-4 border-rose-400 shadow-sm">
                <span className="text-[11px] font-black text-stone-700 uppercase tracking-tighter flex items-center gap-1.5"><Zap size={12} className={player.stats.stress > 80 ? "text-rose-500" : "text-stone-400"} />壓力</span>
                <span className={cn("text-[11px] font-black", player.stats.stress > 80 ? "text-rose-600 animate-pulse" : "text-rose-500")}>{player.stats.stress}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED FOOTER - Today's Goal & Clock Out */}
      <div className="pt-4 border-t border-stone-100 bg-white">
        <p className="text-[11px] text-indigo-500 font-black uppercase mb-2 tracking-widest">今日目標</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-[11px] font-black text-stone-600">
            <span>下班進度</span>
            <span className="text-emerald-500">{Math.min(100, Math.round(gameState.activityThisDay * 33.3))}%</span>
          </div>
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-emerald-500" 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min(100, gameState.activityThisDay * 33.3)}%` }} 
              transition={{ duration: 0.5 }} 
            />
          </div>
        </div>
        <button
          disabled={gameState.activityThisDay < 3}
          onClick={onClockOut}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden",
            gameState.activityThisDay >= 3 
              ? "bg-[#5D3FD3] text-white shadow-[0_12px_40px_-6px_rgba(93,63,211,0.4)] animate-pulse cursor-pointer hover:scale-[1.02] active:scale-95" 
              : "bg-stone-100 text-stone-400 border border-stone-50 cursor-not-allowed"
          )}
        >
          {gameState.activityThisDay >= 3 && (
            <div className="absolute inset-0 bg-white/20 animate-ping opacity-10" />
          )}
          下班 (Clock Out)
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
