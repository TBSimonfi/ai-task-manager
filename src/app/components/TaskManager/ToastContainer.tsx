'use client'

import { Toast } from './types'

interface ToastContainerProps {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-xs w-full">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300 ${
            toast.type === 'success' 
              ? 'bg-neutral-900 border-green-600/30 text-green-400 shadow-green-900/10' 
              : 'bg-neutral-900 border-red-600/30 text-red-400 shadow-red-900/10'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <p className="text-xs font-black uppercase tracking-wider">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
