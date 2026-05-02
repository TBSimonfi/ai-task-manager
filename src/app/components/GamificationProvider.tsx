'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

interface GamificationContextType {
  xp: number;
  level: number;
  badges: Badge[];
  gainXp: (amount: number) => Promise<void>;
  checkMilestones: (stats: any) => Promise<void>;
  nextLevelXp: number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState<Badge[]>([]);
  const nextLevelXp = level * 1000;

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level, badges')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setXp(data.xp);
        setLevel(data.level);
        setBadges(data.badges || []);
      }
    };
    fetchProfile();
  }, []);

  const gainXp = async (amount: number) => {
    const newXp = xp + amount;
    let newLevel = level;

    if (newXp >= nextLevelXp) {
      newLevel += 1;
    }

    setXp(newXp);
    setLevel(newLevel);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', session.user.id);
    }
  };

  const checkMilestones = async (stats: { completedCount: number, aiUsedCount: number, focusCount: number }) => {
    const newBadges: Badge[] = [...badges];
    let changed = false;

    const availableMilestones = [
      { id: 'task-master-1', name: 'Task Master I', icon: '🏆', description: 'Complete 10 tasks', condition: stats.completedCount >= 10 },
      { id: 'ai-pioneer', name: 'AI Pioneer', icon: '🧠', description: 'Use AI Refinement 5 times', condition: stats.aiUsedCount >= 5 },
      { id: 'focus-expert', name: 'Deep Work Expert', icon: '🧘', description: 'Complete 3 Focus Sessions', condition: stats.focusCount >= 3 }
    ];

    availableMilestones.forEach(m => {
      if (m.condition && !newBadges.find(b => b.id === m.id)) {
        newBadges.push({ id: m.id, name: m.name, icon: m.icon, description: m.description, unlockedAt: new Date().toISOString() });
        changed = true;
      }
    });

    if (changed) {
      setBadges(newBadges);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('profiles')
          .update({ badges: newBadges })
          .eq('id', session.user.id);
      }
    }
  };

  return (
    <GamificationContext.Provider value={{ xp, level, badges, gainXp, checkMilestones, nextLevelXp }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within a GamificationProvider');
  return context;
}
