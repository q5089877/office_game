/**
 * cn 工具函數
 * 用於合併CSS類名，結合clsx和tailwind-merge
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
