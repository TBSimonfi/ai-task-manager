'use client'

import { Activity } from './types'
import { motion } from 'framer-motion'
import { CheckCircle2, PlusCircle, Archive, Zap, Timer } from 'lucide-react'

interface TimelineProps {
  activities: Activity[];
}

export default function Timeline({ activities }: TimelineProps) {
  const getIcon = (action: string) => {
    switch (action) {
      case 'created': return <PlusCircle size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'archived': return <Archive size={16} className="text-purple-500" />;
      case 'breakdown': return <Zap size={16} className="text-yellow-500" />;
      case 'focused': return <Timer size={16} className="text-orange-500" />;
      default: return <PlusCircle size={16} className="text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-6">Recent Activity</h4>
      <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-2 space-y-8 pb-4">
        {activities.length > 0 ? (
          activities.map((activity, i) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-6"
            >
              <div className="absolute -left-[9px] top-0.5 bg-white dark:bg-neutral-950 p-0.5 rounded-full ring-4 ring-white dark:ring-neutral-950">
                {getIcon(activity.action)}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-tight capitalize">
                  {activity.action}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {activity.details}
                </p>
                <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                  {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="pl-6 italic text-xs text-neutral-500 opacity-50">
            No activities recorded yet. Start working to build your timeline!
          </div>
        )}
      </div>
    </div>
  );
}
