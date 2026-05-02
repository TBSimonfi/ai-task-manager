'use client'

import TaskManager from '@/app/components/TaskManager'
import ThemeToggle from '@/app/components/ThemeToggle'
import LanguageToggle from '@/app/components/LanguageToggle'
import LevelProgress from '@/app/components/LevelProgress'
import BadgeDisplay from '@/app/components/BadgeDisplay'
import { useLanguage } from '@/app/components/Providers'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Coffee, X, Volume2, VolumeX } from 'lucide-react'

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dailyQuote, setDailyQuote] = useState<string | null>(null)
  const [morningBriefing, setMorningBriefing] = useState<string | null>(null)
  const [isBriefingOpen, setIsBriefingOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchQuote()
        checkAutoBriefing(session.user.id)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const fetchQuote = async () => {
    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quote', payload: { tasksCount: 5 } }) 
      });
      const data = await res.json();
      setDailyQuote(data.quote);
    } catch {
      setDailyQuote("Your productivity defines your path.");
    }
  };

  const checkAutoBriefing = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const lastBriefing = localStorage.getItem(`last_briefing_${userId}`);
    
    if (lastBriefing !== today) {
      try {
        const supabase = createClient();
        const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('status', 'todo');
        
        const res = await fetch('/api/ai/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'briefing', payload: tasks })
        });
        const data = await res.json();
        if (data.briefing) {
          setMorningBriefing(data.briefing);
          setIsBriefingOpen(true);
          localStorage.setItem(`last_briefing_${userId}`, today);
        }
      } catch (err) {
        console.error('Failed auto briefing:', err);
      }
    }
  };

  const handleSpeak = () => {
    if (!morningBriefing) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(morningBriefing);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !user) return null

  return (
    <div className="flex-1 flex flex-col w-full items-center">
      {/* Morning Briefing Modal */}
      <AnimatePresence>
        {isBriefingOpen && morningBriefing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 border border-orange-500/30 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
                       <Coffee size={24} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Good Morning!</h2>
                       <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Your Concierge AI Briefing</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleSpeak}
                      className={`p-2 rounded-full transition-all ${isSpeaking ? 'bg-orange-600 text-white animate-pulse' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-orange-500'}`}
                      title={isSpeaking ? 'Stop Speaking' : 'Read Aloud'}
                    >
                      {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button onClick={() => { setIsBriefingOpen(false); window.speechSynthesis.cancel(); }} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                      <X size={20} />
                    </button>
                 </div>
              </div>
              
              <div className="p-8 pt-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                 <div className="bg-orange-50 dark:bg-orange-600/5 p-6 rounded-3xl border border-orange-100 dark:border-orange-600/10">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap italic">
                       {morningBriefing}
                    </p>
                 </div>
              </div>

              <div className="p-8 pt-0 flex gap-4">
                 <button 
                   onClick={() => { setIsBriefingOpen(false); window.speechSynthesis.cancel(); }}
                   className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                 >
                   Let's Start the Day
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4 px-6 gap-4">
          <div className="flex items-center gap-2 min-w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
              AI
            </div>
            <span className="font-bold text-neutral-900 dark:text-white hidden sm:inline-block tracking-tight">Task Manager</span>
          </div>

          <div className="flex-grow flex justify-center px-4 overflow-hidden">
             <AnimatePresence mode="wait">
                {dailyQuote && (
                  <motion.p 
                    key={dailyQuote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] md:text-xs font-bold text-neutral-500 dark:text-neutral-400 italic text-center max-w-md truncate md:whitespace-normal leading-tight"
                  >
                    "{dailyQuote}"
                  </motion.p>
                )}
             </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 min-w-fit">
            <div className="flex items-center gap-2 mr-2 border-r border-neutral-200 dark:border-neutral-800 pr-4">
               <BadgeDisplay />
               <LanguageToggle />
               <ThemeToggle />
            </div>

            <div className="hidden lg:flex items-center gap-6 border-r border-neutral-200 dark:border-neutral-800 pr-4">
              <LevelProgress />
              <div className="text-right">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{t('welcome')}</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{user.email}</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="py-2 px-4 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-all active:scale-95 shadow-sm"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-4xl p-6 mt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{t('yourTasks')}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 leading-relaxed">{t('aiTagline')}</p>
        </div>
        <TaskManager />
      </main>
    </div>
  )
}
