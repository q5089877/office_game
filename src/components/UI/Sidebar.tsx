/**
 * Sidebar 組件 - Tactical Right Wing
 */

import React from 'react';
import {
  Ghost, Activity, Coins, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GameState, Player } from '../../types';
import { SHOP_ITEMS } from '../../constants';
import { themeColors } from '../../theme/colors';

interface SidebarProps {
  gameState: GameState;
  player: Player;
  showShop: boolean;
  onToggleGuide: () => void;
  onToggleShop: () => void;
  onBuyItem: (itemId: string) => void;
  onClockOut: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  gameState,
  player,
  onBuyItem,
  onToggleGuide,
  isMobile = false
}) => {
  const activityRatio = Math.min(100, Math.round(gameState.activityThisDay / Math.min(8, 3 + Math.floor((gameState.day - 1) / 2)) * 100));
  const [isShopOpen, setIsShopOpen] = React.useState(!isMobile);

  // 如果是手機版且沒開啟商店，只顯示濃縮的狀態橫條
  if (isMobile && !isShopOpen) {
    return (
      <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-2 border border-slate-200">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Ghost className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 leading-none">{player.name}</span>
              <span className="text-[10px] text-amber-500 font-black flex items-center gap-0.5"><Coins className="w-3 h-3"/>{player.stats.savings}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsShopOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/30 flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3" /> 商店
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "font-sans flex flex-col gap-4",
      isMobile ? "fixed inset-x-4 top-20 z-50 pointer-events-auto max-h-[60vh]" : "w-full max-w-[320px]"
    )}>
      
      {/* 個人核心數據 (若是手機版顯示關閉按鈕) */}
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 border border-white/10 shrink-0 relative">
        {isMobile && (
          <button 
            onClick={() => setIsShopOpen(false)}
            className="absolute top-2 right-2 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-500 font-bold"
          >
            ×
          </button>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Ghost className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 leading-none mb-1 uppercase tracking-tight truncate w-32">
                {player.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-white/5">
                  <Activity className="w-2.5 h-2.5" /> Lv.{player.stats.level} {player.role}
              </span>
            </div>
          </div>
          <button 
            onClick={onToggleGuide}
            className="p-2 hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
          >
            <AlertTriangle className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5 mt-2">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none">存款</p>
            <p className="text-xl font-mono font-black text-white flex items-center gap-1.5 leading-none">
              <Coins className="w-4 h-4 text-amber-500" /> {player.stats.savings}
            </p>
          </div>
          <div className="space-y-1 text-right">
             <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none">進度</p>
            <p className={cn("text-xl font-mono font-black leading-none", activityRatio >= 100 ? "text-emerald-400" : "text-amber-500")}>
               {activityRatio}%
            </p>
          </div>
        </div>
      </div>

      {/* 微型化商店 */}
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-100">戰術市集</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{SHOP_ITEMS.length} 件裝備</span>
        </div>
        
        <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto no-scrollbar">
          {SHOP_ITEMS.map((item) => {
            const isOwned = player.ownedItemIds?.includes(item.id);
            const currentPrice = item.id === 'specialty_coffee' ? gameState.coffeePrice : item.price;
            const canAfford = player.stats.savings >= currentPrice;
            
            return (
              <button 
                key={item.id} 
                className={cn(
                  "w-full flex flex-col p-3 rounded-2xl border transition-all group relative text-left",
                  isOwned 
                    ? "bg-emerald-900/20 border-emerald-500/30 cursor-default" 
                    : "bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10 active:scale-95"
                )}
                disabled={isOwned || !canAfford}
                onClick={() => !isOwned && canAfford && onBuyItem(item.id)}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={cn("text-xs font-bold transition-colors truncate", isOwned ? "text-emerald-400" : "text-slate-200 group-hover:text-white")}>
                    {item.name}
                  </span>
                  <span className={cn("text-xs font-mono font-black", isOwned ? "text-emerald-600" : canAfford ? "text-amber-500" : "text-rose-500")}>
                    {isOwned ? "已購" : `$${currentPrice}`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-bold truncate block w-full">{item.description}</span>
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default Sidebar;
