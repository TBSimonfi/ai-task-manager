'use client'

import { Task } from './types'
import { motion } from 'framer-motion'
import { useLanguage } from '../Providers'

interface MatrixViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function MatrixView({ tasks, onTaskClick }: MatrixViewProps) {
  const { t } = useLanguage()

  const isUrgent = (task: Task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date).getTime();
    const now = new Date().getTime();
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    return dueDate - now < fortyEightHoursInMs;
  };

  const isImportant = (task: Task) => (task.priority || 3) <= 2;

  const urgentImportant = tasks.filter(t => isUrgent(t) && isImportant(t) && t.status !== 'done');
  const notUrgentImportant = tasks.filter(t => !isUrgent(t) && isImportant(t) && t.status !== 'done');
  const urgentNotImportant = tasks.filter(t => isUrgent(t) && !isImportant(t) && t.status !== 'done');
  const notUrgentNotImportant = tasks.filter(t => !isUrgent(t) && !isImportant(t) && t.status !== 'done');

  const quadrants = [
    { 
      title: 'Do First', 
      label: 'Urgent & Important', 
      tasks: urgentImportant, 
      color: 'border-red-500/50', 
      bg: 'bg-red-500/5',
      icon: '🔥'
    },
    { 
      title: 'Schedule', 
      label: 'Not Urgent & Important', 
      tasks: notUrgentImportant, 
      color: 'border-blue-500/50', 
      bg: 'bg-blue-500/5',
      icon: '📅'
    },
    { 
      title: 'Delegate', 
      label: 'Urgent & Not Important', 
      tasks: urgentNotImportant, 
      color: 'border-yellow-500/50', 
      bg: 'bg-yellow-500/5',
      icon: '🤝'
    },
    { 
      title: 'Eliminate', 
      label: 'Not Urgent & Not Important', 
      tasks: notUrgentNotImportant, 
      color: 'border-neutral-500/50', 
      bg: 'bg-neutral-500/5',
      icon: '🗑️'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
      {quadrants.map((q, i) => (
        <div 
          key={i} 
          className={`min-h-[300px] rounded-3xl border ${q.color} ${q.bg} p-6 flex flex-col backdrop-blur-sm transition-all hover:shadow-xl hover:scale-[1.01]`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl">{q.icon}</span>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white">{q.title}</h4>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">{q.label}</p>
              </div>
            </div>
            <span className="bg-neutral-900/50 text-neutral-400 text-xs font-black px-2.5 py-1 rounded-full border border-neutral-800">
              {q.tasks.length}
            </span>
          </div>

          <div className="flex-grow space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {q.tasks.length > 0 ? (
              q.tasks.map(task => (
                <motion.div
                  key={task.id}
                  layoutId={`matrix-task-${task.id}`}
                  onClick={() => onTaskClick(task)}
                  className="p-3 rounded-xl bg-white/5 dark:bg-neutral-900/50 border border-neutral-200/10 dark:border-neutral-800 hover:border-neutral-400 transition-all cursor-pointer group"
                >
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate group-hover:text-blue-400">
                    {task.content}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold uppercase text-neutral-500">{task.category || 'N/A'}</span>
                    {task.due_date && (
                      <span className="text-[9px] font-black text-neutral-400">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-20 italic text-xs text-neutral-500">
                No tasks in this quadrant
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
