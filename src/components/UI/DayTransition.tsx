/**
 * DayTransition 組件
 * 天數過渡動畫和總結畫面
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, DollarSign, AlertCircle, Clock } from 'lucide-react';

interface DaySummary {
  prevDay: number;
  moneyEarned: number;
  stressChange: number;
  performance: number;
  wasCaught: boolean;
  rank: string;
}

interface DayTransitionProps {
  isChangingDay: boolean;
  summaryData: DaySummary | null;
  onStartNewDay: () => void;
}

const DayTransition: React.FC<DayTransitionProps> = ({
  isChangingDay,
  summaryData,
  onStartNewDay,
}) => {
  return (
    <AnimatePresence>
      {isChangingDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-[40px] p-10 max-w-2xl w-full mx-8 shadow-2xl border border-slate-200"
          >
            <div className="text-center mb-8">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
                DAY {summaryData?.prevDay} 結束
              </h2>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                今日摸魚報告
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={20} className="text-emerald-600" />
                  <span className="text-sm font-black uppercase tracking-wider text-emerald-700">
                    今日收入
                  </span>
                </div>
                <p className="text-4xl font-black text-emerald-600 font-mono">
                  ${summaryData?.moneyEarned || 0}
                </p>
              </div>

              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle size={20} className="text-rose-600" />
                  <span className="text-sm font-black uppercase tracking-wider text-rose-700">
                    壓力變化
                  </span>
                </div>
                <p className={`text-4xl font-black font-mono ${(summaryData?.stressChange || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {(summaryData?.stressChange || 0) > 0 ? '+' : ''}{(summaryData?.stressChange || 0).toFixed(1)}
                </p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy size={20} className="text-[#4F46E5]" />
                  <span className="text-sm font-black uppercase tracking-wider text-[#4F46E5]">
                    績效評分
                  </span>
                </div>
                <p className="text-4xl font-black text-[#4F46E5] font-mono">
                  {summaryData?.performance || 0}%
                </p>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={20} className="text-amber-600" />
                  <span className="text-sm font-black uppercase tracking-wider text-amber-700">
                    被抓次數
                  </span>
                </div>
                <p className="text-4xl font-black text-amber-600 font-mono">
                  {summaryData?.wasCaught ? '1' : '0'}
                </p>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-slate-100 px-6 py-3 rounded-full">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">今日評級</span>
                <span className="text-2xl font-black text-slate-900 uppercase italic">{summaryData?.rank || 'C'}</span>
              </div>
            </div>

            <button
              onClick={onStartNewDay}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              迎接新的一天 <Sparkles size={20} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DayTransition;
