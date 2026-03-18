import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Timer as TimerIcon } from 'lucide-react';

interface TimerOverlayProps {
  minutes: number;
  onClose: () => void;
}

export const TimerOverlay: React.FC<TimerOverlayProps> = ({ minutes, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-12"
    >
      <button 
        onClick={onClose}
        className="absolute top-12 right-12 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <TimerIcon className="w-24 h-24 mb-12 opacity-40" />
        <div className="text-[20vw] font-light tracking-tighter tabular-nums leading-none">
          {formatTime(secondsLeft)}
        </div>
        <div className="text-4xl font-medium opacity-60 mt-8 uppercase tracking-widest">
          Timer Running
        </div>
      </motion.div>

      {secondsLeft <= 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-24 text-6xl font-bold text-emerald-400 animate-pulse"
        >
          Time's Up!
        </motion.div>
      )}
    </motion.div>
  );
};
