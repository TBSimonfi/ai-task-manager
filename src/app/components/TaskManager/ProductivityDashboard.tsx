'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Task, Activity } from './types'
import { useLanguage } from '../Providers'
import { motion, AnimatePresence } from 'framer-motion'
import ActivityHeatmap from './ActivityHeatmap'
import Timeline from './Timeline'
import HabitTracker from './HabitTracker'
import { Sun, Coffee, Zap, BarChart3, Target, Users, Copy, Check, Lightbulb, GraduationCap, Compass, Trophy, BookOpen, Quote, Map } from 'lucide-react'

interface ProductivityDashboardProps {
  tasks: Task[];
}

export default function ProductivityDashboard({ tasks }: ProductivityDashboardProps) {
  const { t } = useLanguage()
  const [aiVerdict, setAiVerdict] = useState<string>('Analyzing your work patterns...')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false)
  const [weeklyRecap, setWeeklyRecap] = useState<string | null>(null)
  const [isGeneratingFocus, setIsGeneratingFocus] = useState(false)
  const [weeklyFocus, setWeeklyFocus] = useState<string | null>(null)
  const [isGeneratingNext, setIsGeneratingNext] = useState(false)
  const [nextAction, setNextAction] = useState<{ recommendation: string, reason: string } | null>(null)
  const [isGeneratingBriefing, setIsGeneratingNextBriefing] = useState(false)
  const [dailyBriefing, setDailyBriefing] = useState<string | null>(null)
  const [isGeneratingTeam, setIsGeneratingTeam] = useState(false)
  const [teamReport, setTeamReport] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingGrowth, setIsGeneratingGrowth] = useState(false)
  const [growthSuggestions, setGrowthSuggestions] = useState<{ title: string, reason: string }[] | null>(null)
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false)
  const [monthlyGoal, setMonthlyGoal] = useState<string | null>(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [productivityStory, setProductivityStory] = useState<string | null>(null)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [projectRoadmap, setProjectRoadmap] = useState<string[] | null>(null)
  const [selectedRoadmapProject, setSelectedRoadmapProject] = useState<string>('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [habits, setHabits] = useState<any[]>([])

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const byPriority = [1, 2, 3, 4, 5].map(p => ({
    priority: p,
    count: tasks.filter(t => t.priority === p).length,
    completed: tasks.filter(t => t.priority === p && t.status === 'done').length
  }));

  const categoryCounts: Record<string, number> = {};
  tasks.forEach(t => {
    const cat = t.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const activeProjects = Array.from(new Set(tasks.map(t => t.project_name).filter(Boolean))) as string[];

  const overdueCount = tasks.filter(t => 
    t.status !== 'done' && 
    t.due_date && 
    new Date(t.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
  ).length;

  const totalEffort = tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const avgDuration = total > 0 ? (totalEffort / total).toFixed(1) : 0;

  const p1Ratio = byPriority[0].count > 0 ? byPriority[0].completed / byPriority[0].count : 1;
  const overduePenalty = total > 0 ? (overdueCount / total) * 50 : 0;
  const score = total > 0 
    ? Math.max(0, Math.min(100, Math.round((completionRate * 0.6) + (p1Ratio * 40) - overduePenalty)))
    : 0;

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      if (data.activities) setActivities(data.activities);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits');
      const data = await res.json();
      if (data.habits) setHabits(data.habits);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchHabits();
  }, [fetchActivities, fetchHabits]);

  const handleToggleHabit = async (habitId: number) => {
    try {
      await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId })
      });
      fetchHabits();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleAddHabit = async (title: string) => {
    if (!title.trim()) return;
    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color: '#3b82f6' })
      });
      fetchHabits();
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  const handleDeleteHabit = async (id: number) => {
     try {
       const { createClient } = await import('@/utils/supabase/client');
       const supabase = createClient();
       await supabase.from('habits').delete().eq('id', id);
       fetchHabits();
     } catch (err) {
       console.error('Failed to delete habit:', err);
     }
  };

  const resetBriefings = () => {
    setTeamReport(null);
    setDailyBriefing(null);
    setGrowthSuggestions(null);
    setProductivityStory(null);
    setProjectRoadmap(null);
  };

  useEffect(() => {
    if (total === 0) return;

    const fetchVerdict = async () => {
      setIsAnalyzing(true);
      try {
        const summary = `Completion Rate: ${completionRate}%, Overdue Tasks: ${overdueCount}, High Priority Tasks Completed: ${byPriority[0].completed}/${byPriority[0].count}, Total Tasks: ${total}`;
        const res = await fetch('/api/ai/verdict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary })
        });
        const data = await res.json();
        setAiVerdict(data.verdict);
      } catch {
        setAiVerdict('Focus on consistency to improve your score.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timeout = setTimeout(fetchVerdict, 1000);
    return () => clearTimeout(timeout);
  }, [tasks.length, completionRate, overdueCount]);

  const generateRecap = async () => {
    setIsGeneratingRecap(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setWeeklyRecap(data.report);
    } catch {
      alert('Failed to generate recap');
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  const generateFocus = async () => {
    setIsGeneratingFocus(true);
    try {
      const res = await fetch('/api/ai/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setWeeklyFocus(data.focus);
    } catch {
      alert('Failed to generate focus');
    } finally {
      setIsGeneratingFocus(false);
    }
  };

  const generateNextAction = async () => {
    setIsGeneratingNext(true);
    try {
      const res = await fetch('/api/ai/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setNextAction(data);
    } catch {
      alert('Failed to generate next action');
    } finally {
      setIsGeneratingNext(false);
    }
  };

  const generateBriefing = async () => {
    setIsGeneratingNextBriefing(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setDailyBriefing(data.briefing);
    } catch {
      alert('Failed to generate briefing');
    } finally {
      setIsGeneratingNextBriefing(false);
    }
  };

  const generateTeamReport = async () => {
    setIsGeneratingTeam(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setTeamReport(data.report);
    } catch {
      alert('Failed to generate team report');
    } finally {
      setIsGeneratingTeam(false);
    }
  };

  const generateGrowthHub = async () => {
    setIsGeneratingGrowth(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setGrowthSuggestions(data.suggestions);
    } catch {
      alert('Failed to generate growth hub');
    } finally {
      setIsGeneratingGrowth(false);
    }
  };

  const generateMonthlyGoal = async () => {
    setIsGeneratingGoal(true);
    try {
      const res = await fetch('/api/ai/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      setMonthlyGoal(data.goal);
    } catch {
      alert('Failed to generate goal');
    } finally {
      setIsGeneratingGoal(false);
    }
  };

  const generateStory = async () => {
    setIsGeneratingStory(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities })
      });
      const data = await res.json();
      setProductivityStory(data.story);
    } catch {
      alert('Failed to generate story');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const generateRoadmap = async () => {
    if (!selectedRoadmapProject) return;
    setIsGeneratingRoadmap(true);
    resetBriefings();
    try {
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: selectedRoadmapProject, tasks })
      });
      const data = await res.json();
      setProjectRoadmap(data.roadmap);
    } catch {
      alert('Failed to generate roadmap');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const copyToClipboard = () => {
    if (!teamReport) return;
    navigator.clipboard.writeText(teamReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Top Strategic Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {weeklyFocus && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                <div className="bg-orange-600/10 border border-orange-600/30 rounded-3xl p-6 flex items-center gap-6 shadow-lg shadow-orange-900/5 h-full transition-colors">
                  <div className="w-12 h-12 min-w-[48px] rounded-2xl bg-orange-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-900/20"><Target size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">Weekly Mission</p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-relaxed italic">"{weeklyFocus}"</p>
                  </div>
                  <button onClick={() => setWeeklyFocus(null)} className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {nextAction && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                <div className="bg-green-600/10 border border-green-600/30 rounded-3xl p-6 flex items-center gap-6 shadow-lg shadow-green-900/5 h-full transition-colors">
                  <div className="w-12 h-12 min-w-[48px] rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-900/20"><Zap size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Next Best Action</p>
                    <p className="text-sm font-black text-neutral-900 dark:text-white leading-tight mb-1">{nextAction.recommendation}</p>
                    <p className="text-[10px] font-medium text-neutral-500 leading-tight italic">{nextAction.reason}</p>
                  </div>
                  <button onClick={() => setNextAction(null)} className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {monthlyGoal && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                <div className="bg-indigo-600/10 border border-indigo-600/30 rounded-3xl p-6 flex items-center gap-6 shadow-lg shadow-indigo-900/5 h-full transition-colors">
                  <div className="w-12 h-12 min-w-[48px] rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-900/20"><Compass size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Monthly Vision</p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-relaxed italic">"{monthlyGoal}"</p>
                  </div>
                  <button onClick={() => setMonthlyGoal(null)} className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Columns: Main Analytics */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Productivity Score */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-1">Productivity Score</h3>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-4xl font-black">{score}<span className="text-blue-200 text-sm">/100</span></p>
                <div className="px-2 py-1 rounded-lg bg-white/20 text-[10px] font-bold">
                   {score > 80 ? 'EXCELLENT' : score > 50 ? 'STABLE' : 'GROWING'}
                </div>
              </div>
              <p className="text-xs font-medium leading-relaxed italic opacity-90 border-t border-white/10 pt-4">
                 "{aiVerdict}"
              </p>
            </div>

            {/* Activity Heatmap Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl transition-colors">
              <ActivityHeatmap tasks={tasks} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Timeline Section */}
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl overflow-hidden max-h-[400px] transition-colors">
                <Timeline activities={activities} />
             </div>

             {/* AI Intelligence Section */}
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl flex flex-col transition-colors relative overflow-hidden">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-6">AI Assistant Actions</h3>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button onClick={generateBriefing} disabled={isGeneratingBriefing} className="py-2.5 rounded-xl bg-orange-600/10 border border-orange-600/20 text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest text-[8px] hover:bg-orange-600 hover:text-white transition-all flex flex-col items-center gap-1 shadow-sm">
                    {isGeneratingBriefing ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Sun size={12} /> Brief</>}
                  </button>
                  <button onClick={generateTeamReport} disabled={isGeneratingTeam} className="py-2.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[8px] hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center gap-1 shadow-sm">
                    {isGeneratingTeam ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Users size={12} /> Team</>}
                  </button>
                  <button onClick={generateGrowthHub} disabled={isGeneratingGrowth} className="py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[8px] hover:bg-indigo-600 hover:text-white transition-all flex flex-col items-center gap-1 shadow-sm">
                    {isGeneratingGrowth ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><GraduationCap size={12} /> Growth</>}
                  </button>
                  <button onClick={generateStory} disabled={isGeneratingStory} className="py-2.5 rounded-xl bg-red-600/10 border border-red-600/20 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-[8px] hover:bg-red-600 hover:text-white transition-all flex flex-col items-center gap-1 shadow-sm">
                    {isGeneratingStory ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><BookOpen size={12} /> Journey</>}
                  </button>
                </div>
                
                <div className="flex gap-2 mb-6">
                   <select 
                     value={selectedRoadmapProject} 
                     onChange={(e) => setSelectedRoadmapProject(e.target.value)}
                     className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-2 text-[10px] text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                   >
                     <option value="">Select Project for Roadmap</option>
                     {activeProjects.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                   <button 
                     onClick={generateRoadmap} 
                     disabled={isGeneratingRoadmap || !selectedRoadmapProject} 
                     className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-30 shadow-md shadow-blue-900/20"
                   >
                     {isGeneratingRoadmap ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Map size={14} />}
                   </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                   <AnimatePresence mode="wait">
                    {projectRoadmap ? (
                      <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-blue-500 mb-2">Architectural Roadmap: {selectedRoadmapProject}</p>
                         {projectRoadmap.map((step, i) => (
                           <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-blue-600/5 border border-blue-600/10">
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center">{i+1}</div>
                              <p className="text-[10px] font-bold text-neutral-700 dark:text-neutral-200">{step}</p>
                           </div>
                         ))}
                      </motion.div>
                    ) : productivityStory ? (
                      <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-600/5 border border-red-600/20 relative">
                         <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg"><Quote size={14} /></div>
                         <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic whitespace-pre-wrap">{productivityStory}</p>
                      </motion.div>
                    ) : growthSuggestions ? (
                      <motion.div key="growth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-indigo-500 mb-2">Growth Advisor suggestions</p>
                         {growthSuggestions.map((s, i) => (
                           <div key={i} className="p-3 rounded-xl bg-indigo-600/5 border border-indigo-600/20">
                              <p className="text-xs font-black text-neutral-800 dark:text-neutral-100 flex items-center gap-2"><Lightbulb size={12} className="text-indigo-500" /> {s.title}</p>
                              <p className="text-[10px] text-neutral-500 italic mt-1 leading-tight">{s.reason}</p>
                           </div>
                         ))}
                      </motion.div>
                    ) : teamReport ? (
                      <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-neutral-700 dark:text-neutral-300 space-y-4">
                         <div className="flex justify-between items-center mb-2">
                            <span className="font-bold uppercase tracking-widest text-blue-500">Team Status Report</span>
                            <button onClick={copyToClipboard} className="flex items-center gap-1 text-neutral-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-tighter">
                               {isCopied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                            </button>
                         </div>
                         <div className="p-3 rounded-xl bg-blue-600/5 border border-blue-600/20">
                            <p className="whitespace-pre-wrap leading-relaxed">{teamReport}</p>
                         </div>
                      </motion.div>
                    ) : dailyBriefing ? (
                      <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-neutral-700 dark:text-neutral-300 space-y-4">
                        <div className="p-4 rounded-2xl bg-orange-600/5 border border-orange-600/20 relative">
                           <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white"><Coffee size={14} /></div>
                           <p className="whitespace-pre-wrap leading-relaxed italic">{dailyBriefing}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center opacity-30 italic py-10">
                        <p className="text-xs text-neutral-500">Engage your AI assistant above<br/>for strategic briefings.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>

          {/* Habits Hub Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl transition-colors overflow-hidden">
             <HabitTracker habits={habits} projects={activeProjects} onToggle={handleToggleHabit} onAdd={handleAddHabit} onDelete={handleDeleteHabit} />
          </div>
        </div>

        {/* Right Column: Execution Gauge & Insights */}
        <div className="space-y-4">
           {/* Execution Rate */}
           <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl transition-colors">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-6 text-center w-full">Execution Rate</h3>
               <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-neutral-100 dark:text-neutral-800" />
                    <circle cx="56" cy="56" r="50" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={314.15} strokeDashoffset={314.15 - (314.15 * completionRate) / 100} strokeLinecap="round" className="text-blue-500 transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-neutral-900 dark:text-white">{completionRate}%</div>
               </div>
            </div>

            {/* AI Action Toggles (Rest of functions) */}
            <div className="flex flex-col gap-2">
               <button onClick={generateNextAction} disabled={isGeneratingNext} className="w-full py-2.5 rounded-xl bg-green-600/10 border border-green-600/30 text-green-600 dark:text-green-400 font-black uppercase tracking-widest text-[9px] hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                  {isGeneratingNext ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Zap size={12} /> Suggest Next Action</>}
               </button>
               <button onClick={generateMonthlyGoal} disabled={isGeneratingGoal} className="w-full py-2.5 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest text-[9px] hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                  {isGeneratingGoal ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Compass size={12} /> Strategic Vision</>}
               </button>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-3 pt-2">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-md transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">{t('overdue')}</p>
                  <p className={`text-2xl font-black ${overdueCount > 0 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>{overdueCount}</p>
                </div>
                <div className="text-2xl opacity-20">⚠️</div>
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-md transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Total Effort</p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalEffort}h</p>
                </div>
                <div className="text-2xl opacity-20">⏱️</div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
