import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Zap, AlertTriangle, X, ShieldAlert, Leaf } from 'lucide-react';
import { cn } from '../../utils/cn';
import { themeColors } from '../../theme/colors';
import { tw } from '../../theme/colorUtils';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col z-[9999]"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">生存指南 <span className="text-indigo-600">手冊</span></h2>
                    <p className="text-sm font-bold text-slate-500">歡迎來到 PIXEL THIEF 摸魚辦公室</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm relative z-10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 grid gap-6 md:grid-cols-2 relative h-full bg-slate-50/50">
                
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-3xl transition-all group-hover:w-2" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><AlertTriangle size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800">🎯 核心目標</h3>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    在不被老闆抓包、不崩潰的情況下完成工作！每次使用卡牌行動都會推進度，當 <strong className="text-indigo-600">進度達到 100% (使用3次卡牌)</strong> 即可點擊側邊欄【下班】按鈕安全脫出。
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-3xl transition-all group-hover:w-2" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Zap size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800">⚡ 生存資源</h3>
                  </div>
                  <ul className="space-y-3 text-sm font-bold text-slate-600">
                    <li className="flex flex-col md:flex-row gap-1 md:gap-2">
                       <span className="text-emerald-500 font-black shrink-0">精力 (Energy):</span>
                       <span>這決定你的行動力。點擊動作按鈕需要消耗精力。</span>
                    </li>
                    <li className="flex flex-col md:flex-row gap-1 md:gap-2">
                       <span className="text-rose-500 font-black shrink-0">壓力 (Stress):</span>
                       <span>隨時間被動增加。當壓力到達 <strong className="text-rose-600 bg-rose-50 px-1 rounded">100</strong> 時，精力會快速見底，導致你崩潰（遊戲結束）。</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 rounded-l-3xl transition-all group-hover:w-2" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600"><ShieldAlert size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800">👿 老闆與混亂度</h3>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    使用囂張的摸魚行為會提升 <strong className="text-orange-500">混亂度 (Chaos)</strong>。混亂度越高，老闆巡邏速度越快。如果老闆的座標與你 <strong className="text-rose-600">重疊</strong>，會遭到扣除罰金與巨量壓力懲罰！
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500 rounded-l-3xl transition-all group-hover:w-2" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-600"><Leaf size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800">🪴 互動與升級</h3>
                  </div>
                  <ul className="space-y-3 text-sm font-bold text-slate-600">
                    <li className="flex items-start gap-2">📍 <span>點擊畫面上的人事物會顯示各種隱藏狀態。</span></li>
                    <li className="flex items-start gap-2">🌿 <span>靠近「舒壓植栽」可以獲得自動每秒緩解壓力的微小 Buff。</span></li>
                    <li className="flex items-start gap-2">🛒 <span>存夠錢後別忘了到商店購買裝備（側邊欄 ☕ 圖示），能大幅提昇生存機率！</span></li>
                  </ul>
                </div>

              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95"
                >
                  準備上班 (Start Working)
                </button>
              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default TutorialModal;
