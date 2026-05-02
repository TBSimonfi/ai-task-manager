'use client'

import React from 'react'
import { Task } from './types'
import { useLanguage } from '../Providers'

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImport: (tasks: Partial<Task>[]) => Promise<void>;
}

export default function SettingsModal({ isOpen, onClose, tasks, onImport }: SettingsModalProps) {
  const { t } = useLanguage()
  const [isImporting, setIsImporting] = React.useState(false);
  if (!isOpen) return null;

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "ai-task-manager-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToCsv = () => {
    const headers = ["ID", "Content", "Status", "Category", "Priority", "Due Date", "Created At"];
    const rows = tasks.map(t => [
      t.id,
      `"${t.content.replace(/"/g, '""')}"`,
      t.status,
      t.category || "N/A",
      t.priority || "N/A",
      t.due_date || "N/A",
      t.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ai-task-manager-export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let importedTasks: Partial<Task>[] = [];

        if (file.name.endsWith('.json')) {
          importedTasks = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          importedTasks = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',');
            const task: any = {};
            headers.forEach((h, i) => {
              const key = h.trim().toLowerCase().replace(' ', '_');
              let val: any = values[i]?.replace(/^"(.*)"$/, '$1');
              if (key === 'priority') val = parseInt(val) || 3;
              task[key] = val;
            });
            return task;
          });
        }

        await onImport(importedTasks);
        onClose();
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to parse file. Please ensure it matches the required format.');
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
          <h3 className="text-xl font-black text-white uppercase tracking-widest">{t('settings')} & Data</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white text-2xl transition-colors">✕</button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Data Portability Section */}
          <section>
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4">{t('dataPortability')}</h4>
            
            <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest mb-4">Export</p>
            <div className="flex flex-col gap-3 mb-8">
              <button 
                onClick={exportToJson}
                className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all flex items-center justify-between border border-neutral-700 group"
              >
                <span>{t('exportJson')}</span>
                <span className="text-neutral-500 group-hover:text-blue-400 transition-colors">↓</span>
              </button>
              <button 
                onClick={exportToCsv}
                className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-all flex items-center justify-between border border-neutral-700 group"
              >
                <span>{t('exportCsv')}</span>
                <span className="text-neutral-500 group-hover:text-green-400 transition-colors">↓</span>
              </button>
            </div>

            <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest mb-4">Import</p>
            <label className={`w-full py-3 px-4 rounded-xl bg-blue-600/5 border border-blue-600/20 text-blue-400 font-bold transition-all flex items-center justify-between cursor-pointer hover:bg-blue-600/10 ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
              <span>{isImporting ? 'Processing...' : 'Upload JSON/CSV'}</span>
              <span>↑</span>
              <input type="file" accept=".json,.csv" className="hidden" onChange={handleImport} disabled={isImporting} />
            </label>
          </section>

          {/* Productivity Hacks Section */}
          <section>
            <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em] mb-4">{t('shortcuts')}</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">{t('saveChanges')} ({t('edit')})</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-white text-[10px] font-bold">CTRL + ENTER</kbd>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">{t('cancel')} {t('edit')}</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-white text-[10px] font-bold">ESC</kbd>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Submit Form</span>
                <kbd className="px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-white text-[10px] font-bold">ENTER</kbd>
              </div>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-blue-600/5 border border-blue-600/20">
               <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{t('proTip')}</p>
               <p className="text-neutral-400 text-xs italic leading-relaxed">"Try asking the AI Assistant to 'Summarize my high priority tasks for today' using the chat bubble."</p>
            </div>
          </section>
        </div>

        <div className="p-6 bg-neutral-900 border-t border-neutral-800 text-center">
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em]">AI Task Manager v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
