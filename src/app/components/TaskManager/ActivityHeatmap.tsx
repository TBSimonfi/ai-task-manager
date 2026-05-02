'use client'

import { Task } from './types'
import { motion } from 'framer-motion'

interface ActivityHeatmapProps {
  tasks: Task[];
}

export default function ActivityHeatmap({ tasks }: ActivityHeatmapProps) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800';
    if (count <= 2) return 'bg-blue-200 dark:bg-blue-900/40';
    if (count <= 4) return 'bg-blue-400 dark:bg-blue-700/60';
    if (count <= 6) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-400';
  };

  const dayStats = last30Days.map(day => {
    const count = tasks.filter(t => {
      const completionDate = new Date(t.created_at); // Simplified for prototype, ideally use a 'completed_at' field
      completionDate.setHours(0,0,0,0);
      return completionDate.getTime() === day.getTime();
    }).length;
    return { day, count };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Activity (Last 30 Days)</h4>
        <div className="flex gap-1 items-center">
           <span className="text-[8px] text-neutral-500 uppercase font-bold mr-1">Less</span>
           {[0, 2, 4, 6, 8].map(v => (
             <div key={v} className={`w-2 h-2 rounded-sm ${getIntensity(v)}`}></div>
           ))}
           <span className="text-[8px] text-neutral-500 uppercase font-bold ml-1">More</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {dayStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${getIntensity(stat.count)} transition-all hover:scale-125 cursor-help border border-transparent hover:border-blue-400/50 shadow-sm`}
            title={`${stat.count} tasks on ${stat.day.toLocaleDateString()}`}
          />
        ))}
      </div>
    </div>
  );
}
