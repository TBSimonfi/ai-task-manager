'use client'

import { useGamification, Badge } from './GamificationProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Info, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function BadgeDisplay() {
  const { badges, gainXp } = useGamification()
  const [isOpen, setIsOpen] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)

  const discoverBadge = async () => {
    setIsDiscovering(true);
    try {
      const supabase = createClient();
      const { data: acts } = await supabase.from('activities').select('*').limit(50);
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'badge', payload: { actionName: 'task_completion' } })
      });
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: acts })
      });
      const data = await res.json();
      
      if (data.badge) {
        const newBadge: Badge = { 
          ...data.badge, 
          unlockedAt: new Date().toISOString() 
        };
        
        // Check if already has it
        if (!badges.find(b => b.id === newBadge.id)) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('profiles').update({ badges: [...badges, newBadge] }).eq('id', session.user.id);
                gainXp(200);
                window.location.reload(); // Quick way to refresh gamification state for prototype
            }
        }
      }
    } catch {
      alert('AI could not identify a pattern yet. Keep working!');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 transition-all group"
      >
        <Award size={16} />
        <span className="text-xs font-black">{badges.length}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl z-50 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Achievement Gallery</h4>
               <Award size={14} className="text-yellow-500" />
            </div>

            <button 
              onClick={discoverBadge}
              disabled={isDiscovering}
              className="w-full py-3 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[9px] mb-6 flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
            >
              {isDiscovering ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Sparkles size={12} /> Discover AI Badge</>}
            </button>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
               {badges.length > 0 ? (
                 badges.map(badge => (
                   <div key={badge.id} className="flex gap-4 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/30">
                      <div className="w-12 h-12 min-w-[48px] rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-2xl">
                        {badge.icon}
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-800 dark:text-neutral-100">{badge.name}</p>
                        <p className="text-[10px] text-neutral-500 leading-tight mt-1">{badge.description}</p>
                        <p className="text-[8px] text-neutral-400 mt-2 font-bold uppercase tracking-tighter">Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 opacity-30 italic">
                    <p className="text-xs text-neutral-500">Your gallery is empty.<br/>Start working or use AI to unlock honors.</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
