'use client'

import { useState, useRef, useEffect } from 'react'
import { Task } from './types'
import { useLanguage } from '../Providers'

interface ChatAssistantProps {
  tasks: Task[];
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ChatAssistant({ tasks, onShowToast }: ChatAssistantProps) {
  const { t } = useLanguage()
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, isChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const message = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tasks })
      });
      const data = await res.json();
      if (data.response) {
        setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        onShowToast(t('loadingAI') + ' error', 'error');
      }
    } catch {
      onShowToast('Network error', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 z-[70] group"
      >
        {isChatOpen ? '✕' : '💬'}
        {!isChatOpen && <span className="absolute left-full ml-3 px-2 py-1 bg-neutral-800 text-white text-[10px] uppercase font-black tracking-widest rounded border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ask AI</span>}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 left-6 w-[calc(100%-3rem)] md:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-[70] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white">AI Assistant</h4>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-neutral-500 hover:text-white transition-colors">✕</button>
          </div>

          <div className="flex-grow h-80 overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-900/50">
            {chatMessages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed px-4">
                  Ask me about your tasks,<br/>or request a productivity briefing.
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 border border-neutral-700 p-3 rounded-xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-neutral-800 border-t border-neutral-700 flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
}
