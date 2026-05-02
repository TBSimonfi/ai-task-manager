'use client'

import { FormEvent } from 'react'
import { useLanguage } from '../Providers'
import VoiceInput from './VoiceInput'

interface TaskFormProps {
  content: string;
  setContent: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isAdding: boolean;
  onSubmit: (e: FormEvent) => void;
}

export default function TaskForm({
  content,
  setContent,
  dueDate,
  setDueDate,
  description,
  setDescription,
  isAdding,
  onSubmit
}: TaskFormProps) {
  const { t } = useLanguage()

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-8 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl transition-colors">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-grow flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-grow rounded-md px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-foreground focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            disabled={isAdding}
          />
          <VoiceInput onResult={(text) => setContent(text)} isAdding={isAdding} />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-foreground text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-md transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAdding && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isAdding ? t('addTask') + '...' : t('addTask')}
          </button>
        </div>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('notesPlaceholder')}
        className="w-full rounded-md px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-none text-neutral-900 dark:text-foreground text-sm focus:ring-1 focus:ring-blue-500 resize-none h-20 outline-none transition-all"
        disabled={isAdding}
      />
    </form>
  );
}
