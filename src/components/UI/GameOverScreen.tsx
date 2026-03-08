/**
 * GameOverScreen 組件
 * 遊戲結束畫面
 */

import React from 'react';
import { Skull } from 'lucide-react';

interface GameOverScreenProps {
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center text-slate-900 p-8 text-center">
      <Skull size={80} className="mb-6 animate-bounce text-red-500" />
      <h1 className="text-5xl font-black uppercase tracking-tighter italic">GAME OVER</h1>
      <button
        onClick={onRestart}
        className="mt-8 px-12 py-4 bg-slate-900 text-white rounded-full font-black text-sm uppercase hover:bg-black transition-colors"
      >
        再試一次
      </button>
    </div>
  );
};

export default GameOverScreen;
