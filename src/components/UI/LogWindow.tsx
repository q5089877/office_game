import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getNotificationColor } from '../../theme/colorUtils';

interface LogWindowProps {
  notifications: string[];
}

export default function LogWindow({ notifications }: LogWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (notifications.length === 0) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-h-[400px]">
      <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-100">即時戰術日誌</span>
        </div>
        <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
      </div>
      
      {/* 訊息列表區塊 */}
      <div 
        ref={scrollRef}
        className="p-4 space-y-2.5 font-mono text-[11.5px] overflow-y-auto no-scrollbar flex-1"
      >
        <AnimatePresence mode="popLayout">
          {notifications.map((note, i) => {
            const colors = getNotificationColor(note);
            // Check for specific item procs to apply visual highlights
            const isItemProc = note.includes('✨');
            
            return (
              <motion.div
                key={`${note}-${i}`}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                className={cn(
                  "leading-relaxed flex items-start gap-2 py-1 rounded-md transition-colors",
                  isItemProc ? "text-amber-400 font-bold" : "text-slate-400"
                )}
              >
                <span className={cn("shrink-0 uppercase tracking-widest text-[10px]", isItemProc ? "text-amber-500/50" : "text-indigo-400/50")}>
                  {new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={isItemProc ? "text-amber-300" : "text-slate-300"}>{note}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: [0, 1, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }} 
          className="text-indigo-400/60 pt-2"
        >
          _等待指令輸入...
        </motion.div>
      </div>
    </div>
  );
}
