'use client'

import { useGamification } from './GamificationProvider'
import { motion } from 'framer-motion'

export default function LevelProgress() {
  const { xp, level, nextLevelXp } = useGamification()
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="flex flex-col items-end gap-1 min-w-[120px]">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Level</span>
        <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm shadow-blue-900/20">
          {level}
        </span>
      </div>
      <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700/50">
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">
        {xp} / {nextLevelXp} XP
      </div>
    </div>
  )
}
