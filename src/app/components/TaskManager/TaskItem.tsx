'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from './types'
import { useLanguage } from '../Providers'
import { Sparkles, Archive, RotateCcw } from 'lucide-react'

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  isExpanded: boolean;
  isUpdating: boolean;
  isSelected: boolean;
  editingData: { content: string; due_date: string; priority: number; category: string; description: string } | null;
  onToggle: (task: Task) => void;
  onExpand: (id: number) => void;
  onStartEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  onUpdate: (e?: React.FormEvent) => void;
  onSelect: (id: number) => void;
  onBreakdown: (task: Task) => Promise<void>;
  onToggleSubTask: (taskId: number, subTaskId: string) => void;
  onRefine: (content: string) => Promise<string | null>;
  onArchive: (id: number, archive: boolean) => void;
  setEditingData: (data: any) => void;
  conflict?: string;
}

export default function TaskItem({
  task,
  isEditing,
  isExpanded,
  isUpdating,
  isSelected,
  editingData,
  onToggle,
  onExpand,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onUpdate,
  onSelect,
  onBreakdown,
  onToggleSubTask,
  onRefine,
  onArchive,
  setEditingData,
  conflict
}: TaskItemProps) {
  const { t } = useLanguage()
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  };

  const handleRefineClick = async () => {
    if (!editingData?.content) return;
    setIsRefining(true);
    const refined = await onRefine(editingData.content);
    if (refined) {
      setEditingData({ ...editingData, content: refined });
    }
    setIsRefining(false);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  if (isEditing && editingData) {
    return (
      <motion.li 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className="p-4 bg-neutral-800 rounded-xl shadow-sm border border-blue-600/30"
      >
        <form 
          onSubmit={(e) => { e.preventDefault(); onUpdate(); }}
          className="flex flex-col gap-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancelEdit();
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onUpdate();
          }}
        >
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={editingData.content}
              onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
              className="flex-grow rounded-md px-4 py-2 bg-neutral-900 border border-neutral-700 text-foreground outline-none focus:ring-1 focus:ring-blue-500 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={handleRefineClick}
              disabled={isRefining}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
              title="Refine with AI"
            >
              {isRefining ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
            </button>
          </div>
          <textarea
            value={editingData.description}
            onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
            placeholder={t('notesPlaceholder')}
            className="w-full rounded-md px-4 py-2 bg-neutral-900 border border-neutral-700 text-foreground text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none h-24"
          />
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-neutral-400 font-medium">{t('due')}:</span>
              <input
                type="date"
                value={editingData.due_date}
                onChange={(e) => setEditingData({ ...editingData, due_date: e.target.value })}
                className="rounded-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-foreground text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-neutral-400 font-medium">{t('category')}:</span>
              <input
                type="text"
                value={editingData.category}
                onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                className="rounded-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-foreground text-sm outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={t('category') + '...'}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-neutral-400 font-medium">{t('priority')}:</span>
              <select
                value={editingData.priority}
                onChange={(e) => setEditingData({ ...editingData, priority: parseInt(e.target.value) })}
                className="rounded-md px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-foreground text-sm outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map(p => (
                  <option key={p} value={p}>P{p} {p <= 2 ? '(High)' : p <= 3 ? '(Med)' : '(Low)'}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-neutral-700/50">
            <button 
              type="button" 
              onClick={onCancelEdit} 
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-6 rounded-md transition-all text-sm"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isUpdating}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-all text-sm flex items-center gap-2 ${isUpdating ? 'opacity-50' : ''}`}
            >
              {isUpdating && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isUpdating ? t('saveChanges') + '...' : t('saveChanges')}
            </button>
          </div>
        </form>
      </motion.li>
    );
  }

  return (
    <motion.li 
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`p-4 rounded-xl shadow-sm border transition-all group/item ${
        isSelected 
          ? 'bg-blue-600/5 border-blue-600/50' 
          : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-grow">
          <div className="flex flex-col gap-3 mt-1.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(task.id)}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-blue-600 focus:ring-blue-500 cursor-pointer opacity-0 group-hover/item:opacity-100 checked:opacity-100 transition-all"
              title="Select for batch action"
            />
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => onToggle(task)}
              className="h-4 w-4 rounded-full border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-green-600 focus:ring-green-500 cursor-pointer transition-all"
              title="Toggle status"
            />
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex items-center gap-3 group">
              <p 
                className={`text-lg font-medium cursor-pointer transition-all ${task.status === 'done' ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-white'}`} 
                onClick={() => onExpand(task.id)}
              >
                {task.content}
              </p>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.description && (
                  <span 
                    onClick={() => onExpand(task.id)}
                    className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border cursor-pointer ${isExpanded ? 'bg-blue-600/10 border-blue-600/50 text-blue-600 dark:text-blue-400' : 'bg-neutral-100 dark:bg-neutral-700/30 border-neutral-200 dark:border-neutral-600 text-neutral-500'} hover:border-neutral-400 transition-all`}
                  >
                    {isExpanded ? t('cancel') : t('notes')}
                  </span>
                )}
                {!task.sub_tasks?.length && task.status !== 'done' && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setIsBreakingDown(true);
                      await onBreakdown(task);
                      setIsBreakingDown(false);
                    }}
                    disabled={isBreakingDown}
                    className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-yellow-600/30 text-yellow-600 dark:text-yellow-500 bg-yellow-600/5 hover:bg-yellow-600/20 transition-all flex items-center gap-1"
                  >
                    {isBreakingDown ? <div className="w-2 h-2 border border-yellow-500 border-t-transparent rounded-full animate-spin"></div> : '✨ ' + t('breakdown')}
                  </button>
                )}
              </div>
            </div>

            {task.sub_tasks && task.sub_tasks.length > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-grow h-1 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-700 ease-out shadow-sm shadow-blue-500/20"
                    style={{ width: `${(task.sub_tasks.filter(st => st.completed).length / task.sub_tasks.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
                  {task.sub_tasks.filter(st => st.completed).length}/{task.sub_tasks.length}
                </span>
              </div>
            )}

            {task.due_date && (
              <span className={`text-xs mt-1.5 font-bold flex items-center gap-1.5 ${
                task.status !== 'done' && isOverdue(task.due_date) ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                <span className="opacity-70">📅</span>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                {task.status !== 'done' && isOverdue(task.due_date) && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-[9px] uppercase tracking-tighter border border-red-200 dark:border-red-800/50">{t('overdue')}</span>
                )}
              </span>
            )}

            {conflict && task.status !== 'done' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 flex items-center gap-2 text-[10px] font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-500/5 border border-yellow-500/20 p-1.5 rounded-lg"
              >
                <span>⚠️</span>
                <span>{conflict}</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-5">
          {task.priority !== undefined && (
            <div className="flex flex-col items-center min-w-[32px]">
              <span className={`text-[10px] font-black uppercase tracking-tighter ${
                task.priority <= 2 ? 'text-red-600 dark:text-red-500' : task.priority <= 3 ? 'text-yellow-600 dark:text-yellow-500' : 'text-green-600 dark:text-green-500'
              }`}>
                P{task.priority}
              </span>
              <div className="w-8 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mt-1">
                 <div className={`h-full ${
                   task.priority === 1 ? 'w-full bg-red-500' : 
                   task.priority === 2 ? 'w-[80%] bg-red-400' : 
                   task.priority === 3 ? 'w-[60%] bg-yellow-400' : 
                   task.priority === 4 ? 'w-[40%] bg-green-400' : 
                   task.priority === 4 ? 'w-[20%] bg-green-600' : 'w-[20%] bg-green-600'
                 }`}></div>
              </div>
            </div>
          )}
          <div className="flex gap-4 border-l border-neutral-200 dark:border-neutral-700/50 pl-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <button onClick={() => onArchive(task.id, !task.is_archived)} className="text-neutral-400 dark:text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title={task.is_archived ? 'Restore' : 'Archive'}>
               {task.is_archived ? <RotateCcw size={14} /> : <Archive size={14} />}
            </button>
            <button onClick={() => onStartEdit(task)} className="text-neutral-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors">{t('edit')}</button>
            <button onClick={() => onDelete(task.id)} className="text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors">{t('delete')}</button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && task.description && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 p-4 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/30 leading-relaxed shadow-inner">
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {task.sub_tasks && task.sub_tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 ml-7 border-l-2 border-neutral-200 dark:border-neutral-700/50 pl-4 space-y-3 overflow-hidden"
          >
            {task.sub_tasks.map(st => (
              <div key={st.id} className="flex items-center gap-3 group/sub">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => onToggleSubTask(task.id, st.id)}
                  className="h-3.5 w-3.5 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm ${st.completed ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-600 dark:text-neutral-400 group-hover/sub:text-neutral-900 dark:group-hover/sub:text-neutral-200'} transition-colors`}>
                  {st.content}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end mt-5 ml-7">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900/80 text-neutral-500 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-700/50">
                          {task.category || 'Uncategorized'}
                        </span>
                        {task.project_name && (
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-600/20 flex items-center gap-1.5">
                            📁 {task.project_name}
                          </span>
                        )}
                        {task.estimated_hours && (
                          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                            ⏱️ {task.estimated_hours}h
                          </span>
                        )}
                        {task.depends_on && task.depends_on.length > 0 && (
                          <span className="text-[10px] font-black uppercase tracking-tighter text-orange-500 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">
                             🔗 {task.depends_on.length}
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1.5 ml-1">
                            {task.tags.map(tag => (
                              <span key={tag} className="text-[9px] font-bold text-blue-500/60 dark:text-blue-400/50 hover:text-blue-500 transition-colors cursor-default">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-600 font-bold uppercase tracking-tighter">
                         {t('captured')} {new Date(task.created_at).toLocaleDateString()}
                      </p>
      </div>
    </motion.li>
  );
}
