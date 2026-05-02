'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer, X } from 'lucide-react'
import { Task } from './types'

interface FocusTimerProps {
  tasks: Task[];
}

export default function FocusTimer({ tasks }: FocusTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeAt] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeAt(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (Notification.permission === 'granted') {
      new Notification(mode === 'work' ? 'Work Session Complete!' : 'Break Over!');
    }
    // Toggle mode
    if (mode === 'work') {
      setMode('break');
      setTimeAt(5 * 60);
    } else {
      setMode('work');
      setTimeAt(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeAt(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find(t => t.id === focusTaskId);

  return (
    <>
      {/* Floating Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-24 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center text-xl transition-all hover:scale-110 z-[70] group"
      >
        <Timer size={24} className={isActive ? 'animate-pulse' : ''} />
        {!isOpen && <span className="absolute left-full ml-3 px-2 py-1 bg-neutral-800 text-white text-[10px] uppercase font-black tracking-widest rounded border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">Focus Timer</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: -50 }}
            animate={{ y: 0, opacity: 1, x: 0 }}
            exit={{ y: 100, opacity: 0, x: -50 }}
            className="fixed bottom-24 left-6 w-80 bg-neutral-900 border border-orange-600/30 rounded-3xl shadow-2xl z-[75] overflow-hidden flex flex-col p-6 backdrop-blur-xl bg-neutral-900/90"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Focus Session</h4>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="text-5xl font-black text-white tabular-nums mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {mode === 'work' ? 'Focusing' : 'Resting'}
              </div>
            </div>

            {/* Task Selection */}
            <div className="mb-8">
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-2">Target Task</p>
              <select 
                value={focusTaskId || ''}
                onChange={(e) => setFocusTaskId(Number(e.target.value) || null)}
                className="w-full bg-neutral-800 border-none rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">No specific focus</option>
                {tasks.filter(t => t.status !== 'done').map(t => (
                  <option key={t.id} value={t.id}>{t.content}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={toggleTimer}
                className={`flex-grow py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
                  isActive 
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-900/20'
                }`}
              >
                {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
              </button>
              <button 
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {selectedTask && (
              <div className="mt-6 p-3 rounded-xl bg-orange-600/5 border border-orange-600/20 text-center animate-in fade-in slide-in-from-bottom-2">
                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Active Goal</p>
                 <p className="text-xs text-neutral-300 font-medium truncate">{selectedTask.content}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
