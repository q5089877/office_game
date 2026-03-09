/**
 * Sidebar 組件 - 規範化色彩版本
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ghost, Calendar, Coffee,
  Flame, Wallet, CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player } from '../../types';
import { SHOP_ITEMS } from '../../constants';
import { themeColors, textColors } from '../../theme/colors';
import { tw, getNotificationColor, getChaosColorClass, getThemeColor } from '../../theme/colorUtils';

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
  showShop,
  onToggleShop,
  onBuyItem,
  onClockOut,
}) => {
  return (
    <aside className={cn(
      "w-64 md:w-80 flex flex-col z-50 shadow-2xl shrink-0 relative overflow-hidden font-sans border-r",
      tw.bg.sidebar,
      tw.border.light
    )}>

      {/* Header Section - 玩家資訊與等級 */}
      <div className={cn("p-6 border-b shadow-sm", tw.bg.light, tw.border.light)}>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary[500]}, ${themeColors.primary[600]})` }}
            >
              <Ghost size={28} />
            </div>
            <div
              className="absolute -bottom-2 -right-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: themeColors.primary[600] }}
            >
              LV.{player.stats.level}
            </div>
          </div>
          <div className="min-w-0 flex flex-col">
            <h1 className={cn("font-black text-xl italic tracking-tighter leading-none mb-1", tw.text.primary)}>
              PIXEL THIEF
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border"
                style={{
                  backgroundColor: themeColors.primary[50],
                  color: themeColors.primary[600],
                  borderColor: themeColors.primary[100]
                }}
              >
                {player.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Area - 終端機風格日誌 */}
      <div className={cn(
        "mx-4 rounded-xl border shadow-2xl overflow-hidden flex flex-col relative group transition-all duration-500 ease-in-out",
        tw.bg.notification,
        "border-gray-200", // 改為淺色邊框
        showShop ? "flex-[0] min-h-0 h-0 p-0 mt-0 opacity-0 border-0" : "flex-1 min-h-[240px] p-4 mt-4 opacity-100"
      )}>
        <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
          <div
            className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
            style={{ color: themeColors.primary[300] }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColors.primary[400] }} />
            LIVE_SYSTEM_LOG
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400/30" />
            <div className="w-2 h-2 rounded-full bg-amber-400/30" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 font-mono">
          <AnimatePresence mode="popLayout">
            {gameState.notifications.map((note, i) => {
              const colors = getNotificationColor(note);
              return (
                <motion.div
                  key={`${note}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "text-[12px] font-bold leading-tight flex items-start gap-2 py-2 px-2 rounded-lg transition-colors",
                    colors.text,
                    colors.bg,
                    colors.border ? `border-l-4 ${colors.border}` : ""
                  )}
                >
                  <span className="shrink-0 opacity-50 mt-1 text-[9px] text-gray-500">
                    [{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]
                  </span>
                  <span>{note}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: `radial-gradient(${themeColors.primary[500]} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
        />
      </div>

      {/* Economy & Shop Toggle */}
      <div className={cn(
        "px-6 py-4 flex items-center justify-between mt-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]",
        tw.bg.sidebar,
        tw.border.light
      )}>
        <div className="flex flex-col">
          <span className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1", tw.text.muted)}>
            <Wallet size={10} /> CURRENT SAVINGS
          </span>
          <span className={cn("text-3xl font-black font-mono tracking-tighter", tw.text.primary)}>
            ${player.stats.savings}
          </span>
        </div>
        <button
          onClick={onToggleShop}
          className={cn(
            "p-3 rounded-xl transition-all shadow-sm border flex items-center gap-2",
            showShop
              ? "text-white"
              : cn(tw.bg.light, tw.text.secondary, tw.border.light, `hover:${tw.bg.sidebar}`)
          )}
          style={showShop ? { backgroundColor: themeColors.primary[600], borderColor: themeColors.primary[600] } : {}}
        >
          <Coffee size={20} />
          {showShop && <span className="text-[10px] font-black uppercase tracking-widest">Shop</span>}
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-white/50 backdrop-blur-sm">
        {showShop ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em] mb-4", tw.text.muted)}>Available Tools</h3>
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
                      isOwned
                        ? cn(tw.bg.sidebar, tw.border.light, "grayscale opacity-60 cursor-not-allowed")
                        : cn("bg-white hover:shadow-md active:scale-95", tw.border.light, "hover:border-indigo-200")
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter"
                        style={{ backgroundColor: themeColors.primary[50], color: themeColors.primary[500] }}
                      >
                        TOOL
                      </div>
                      {isOwned ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <span className={cn("font-black text-sm", canAfford ? tw.text.primary : "text-rose-500")}>
                          ${item.price}
                        </span>
                      )}
                    </div>
                    <div className={cn("font-black text-sm mb-1", tw.text.primary)}>{item.name}</div>
                    <div className={cn("text-[10px] font-bold leading-relaxed", tw.text.secondary)}>{item.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={cn("p-4 bg-white rounded-2xl border shadow-sm", tw.border.light)}>
               <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", tw.text.muted)}>
                    <Flame size={12} className="text-orange-500" /> 混亂度
                  </span>
                  <span className={cn("text-xs font-black", getChaosColorClass(gameState.chaosLevel))}>
                    {gameState.chaosLevel}%
                  </span>
               </div>
               <div className={cn("h-1.5 w-full rounded-full overflow-hidden", tw.bg.light)}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: themeColors.warning[400] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${gameState.chaosLevel}%` }}
                  />
               </div>
            </div>

            <div
              className="p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group"
              style={{ backgroundColor: themeColors.primary[600], boxShadow: shadowColors.primary }}
            >
              <Calendar className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform" size={60} />
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">今日事件</p>
              <p className="font-black text-lg leading-tight mb-1">{gameState.currentEvent.name}</p>
              <p className="text-[11px] font-bold opacity-80">{gameState.currentEvent.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - 下班按鈕 */}
      <div className={cn("p-6 bg-white border-t", tw.border.light)}>
        <button
          disabled={gameState.activityThisDay < 3}
          onClick={onClockOut}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
            gameState.activityThisDay >= 3
              ? "text-white shadow-xl hover:opacity-90 active:scale-95"
              : cn(tw.bg.light, tw.text.muted, "cursor-not-allowed")
          )}
          style={gameState.activityThisDay >= 3 ? {
            backgroundColor: themeColors.primary[600],
            boxShadow: shadowColors.primary
          } : {}}
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
        <p className={cn("text-center text-[10px] font-black mt-3 tracking-widest", tw.text.muted)}>
           PROGRESS: {Math.min(100, Math.round(gameState.activityThisDay * 33.3))}%
        </p>
      </div>
    </aside>
  );
};

const shadowColors = {
  primary: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
};

export default Sidebar;
