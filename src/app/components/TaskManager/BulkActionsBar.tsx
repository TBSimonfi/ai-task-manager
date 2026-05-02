'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../Providers'

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onMarkDone: () => void;
  onMarkTodo: () => void;
  onDeselectAll: () => void;
  isProcessing: boolean;
}

export default function BulkActionsBar({
  selectedCount,
  onDelete,
  onMarkDone,
  onMarkTodo,
  onDeselectAll,
  isProcessing
}: BulkActionsBarProps) {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-full max-w-lg px-4"
        >
          <div className="bg-neutral-900 border border-blue-600/30 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl bg-neutral-900/90">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white text-xs font-black px-2 py-1 rounded-md min-w-[24px] text-center">
                {selectedCount}
              </div>
              <span className="text-sm font-bold text-neutral-300 hidden sm:inline">{t('found')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={onMarkDone}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-green-400 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {t('done')}
              </button>
              <button 
                onClick={onMarkTodo}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {t('todo')}
              </button>
              <button 
                onClick={onDelete}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {t('delete')}
              </button>
              <div className="w-px h-6 bg-neutral-800 mx-1"></div>
              <button 
                onClick={onDeselectAll}
                className="text-neutral-500 hover:text-white text-xs font-bold transition-colors px-2"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
