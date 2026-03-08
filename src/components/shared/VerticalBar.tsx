/**
 * VerticalBar 組件
 * 垂直進度條，用於顯示HP/MP/XP等數值
 */

import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerticalBarProps {
  value: number;
  max: number;
  color: string;
  label: string;
  icon?: React.ElementType;
  title?: string;
}

const VerticalBar: React.FC<VerticalBarProps> = ({
  value,
  max,
  color,
  label,
  icon: Icon,
  title
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex flex-col items-center gap-1 h-full group" title={title}>
      <div className="w-2.5 h-16 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200 shadow-inner">
        <motion.div
          className={cn("absolute bottom-0 w-full rounded-full", color)}
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      <span className="text-[10px] font-black text-stone-700 leading-none mt-0.5">
        {Math.round(value)}
      </span>
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider group-hover:text-stone-600 transition-colors">
        {label}
      </span>
      {Icon && (
        <div className="absolute -top-2 -right-2 opacity-20 group-hover:opacity-40 transition-opacity">
          <Icon size={12} />
        </div>
      )}
    </div>
  );
};

export default VerticalBar;
