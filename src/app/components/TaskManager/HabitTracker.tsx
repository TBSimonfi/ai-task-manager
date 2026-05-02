'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Trash2, Sparkles } from 'lucide-react'

interface Habit {
  id: number;
  title: string;
  color: string;
  habit_logs: { completed_at: string }[];
}

interface HabitTrackerProps {
  habits: Habit[];
  projects: string[];
  onToggle: (habitId: number) => void;
  onAdd: (title: string) => void;
  onDelete: (id: number) => void;
}

export default function HabitTracker({ habits, projects, onToggle, onAdd, onDelete }: HabitTrackerProps) {
  const [newHabit, setNewHabit] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/ai/habit-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects })
      });
      const data = await res.json();
      if (data.habit) {
        onAdd(data.habit);
      }
    } catch {
      alert('AI could not suggest a habit yet.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const calculateStreak = (logs: { completed_at: string }[]) => {
    const dates = logs.map(l => l.completed_at).sort().reverse();
    let streak = 0;
    let curr = new Date();
    curr.setHours(0,0,0,0);

    for (const d of dates) {
      const logDate = new Date(d);
      logDate.setHours(0,0,0,0);
      const diff = (curr.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1) {
        streak++;
        curr = logDate;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Daily Habits</h4>
        <div className="flex gap-2">
           <button 
             onClick={handleSuggest}
             disabled={isSuggesting}
             className="p-1 rounded-lg bg-orange-600/10 border border-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
             title="AI Habit Suggestion"
           >
             {isSuggesting ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={14} />}
           </button>
           <input 
             type="text" 
             value={newHabit}
             onChange={(e) => setNewHabit(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && (onAdd(newHabit), setNewHabit(''))}
             placeholder="New habit..."
             className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-2 py-1 text-[10px] text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
           />
           <button onClick={() => { onAdd(newHabit); setNewHabit(''); }} className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"><Plus size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {habits.map(habit => {
          const isDoneToday = habit.habit_logs.some(l => l.completed_at === today);
          const streak = calculateStreak(habit.habit_logs);

          return (
            <div key={habit.id} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/30 flex items-center justify-between group">
               <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={() => onToggle(habit.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isDoneToday 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' 
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {isDoneToday ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>}
                  </button>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-black truncate ${isDoneToday ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>{habit.title}</p>
                    <p className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter flex items-center gap-1">
                       🔥 {streak} Day Streak
                    </p>
                  </div>
               </div>
               <button onClick={() => onDelete(habit.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
