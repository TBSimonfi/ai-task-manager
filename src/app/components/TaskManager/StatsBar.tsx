'use client'

import { Task } from './types'
import { useLanguage } from '../Providers'

interface StatsBarProps {
  tasks: Task[];
  sortedCount: number;
  searchQuery: string;
  isClearing: boolean;
  onClearCompleted: () => void;
}

export default function StatsBar({
  tasks,
  sortedCount,
  searchQuery,
  isClearing,
  onClearCompleted
}: StatsBarProps) {
  const { t } = useLanguage()
  if (tasks.length === 0) return null;

  return (
    <div className="flex gap-6 mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500 items-center">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
        {t('total')}: <span className="text-neutral-900 dark:text-neutral-300">{tasks.length}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        {t('todo')}: <span className="text-blue-600 dark:text-blue-400">{tasks.filter(t => t.status !== 'done').length}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
        {t('done')}: <span className="text-green-600 dark:text-green-400">{tasks.filter(t => t.status === 'done').length}</span>
      </div>
      {searchQuery && (
        <div className="text-yellow-600 dark:text-yellow-500">{t('found')}: {sortedCount}</div>
      )}
      {tasks.some(t => t.status === 'done') && (
        <button 
          onClick={onClearCompleted}
          disabled={isClearing}
          className={`ml-auto text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline transition-all flex items-center gap-1.5 ${isClearing ? 'opacity-50' : ''}`}
        >
          {isClearing && <div className="w-2 h-2 border border-red-600 dark:border-red-500 border-t-transparent rounded-full animate-spin"></div>}
          {t('clearCompleted')}
        </button>
      )}
    </div>
  );
}
