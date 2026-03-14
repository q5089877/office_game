import React from 'react';
import { Skull, AlertTriangle, Coins, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  onRestart: () => void;
  finalStats?: { stress: number; savings: number };
  notifications?: string[];
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, finalStats, notifications }) => {
  const isStressFull = (finalStats?.stress || 0) >= 100;
  const isBankrupt = (finalStats?.savings || 0) < -1000;

  const getDeathReason = () => {
    if (isStressFull) return "🤯 你的靈魂已經燒乾了！壓力爆表導致你在辦公室原地蒸發，HR 甚至還沒幫你打離職報告。";
    if (isBankrupt) return "💸 破產啦！你買咖啡買到家產散盡，現在連公司的印表機都想把你當成耗材抵債。";
    return "人生無常，大腸包小腸。總之你掛了。";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b,black)] opacity-50" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 max-w-2xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="bg-rose-500/20 p-5 rounded-full mb-8 animate-bounce">
            <Skull size={64} className="text-rose-500" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4 uppercase">
            生命值歸零
        </h1>
        
        <div className="w-20 h-1.5 bg-rose-500 rounded-full mb-8" />

        <p className="text-lg md:text-xl text-slate-300 font-bold mb-10 leading-relaxed max-w-md">
            {getDeathReason()}
        </p>

        {/* 致命案發日誌 */}
        <div className="w-full bg-black/40 rounded-3xl p-6 mb-10 border border-white/5 text-left">
            <h3 className="text-rose-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> 案發前最後目擊紀錄 (Log)
            </h3>
            <div className="space-y-3">
                {notifications && notifications.length > 0 ? (
                    [...notifications].reverse().map((msg, i, arr) => {
                        const logIndex = notifications.length - (arr.length - 1 - i);
                        const isLastAction = i === arr.length - 1;
                        return (
                            <div key={i} className="text-sm text-slate-400 font-medium flex gap-3 leading-tight">
                                <span className="text-slate-600 font-mono">#{logIndex}</span>
                                <span className={isLastAction ? "text-rose-200 font-bold" : ""}>{msg}</span>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-slate-600 text-sm italic text-center py-4">無日誌紀錄...</div>
                )}
            </div>
        </div>

        <button
            onClick={onRestart}
            className="group relative px-12 py-5 bg-white text-slate-950 rounded-full font-black text-lg uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
        >
            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>重啟黑白人生</span>
        </button>
      </motion.div>
    </div>
  );
};

// 因為使用了 Framer Motion 卻沒 import
import { motion } from 'motion/react';

export default GameOverScreen;
