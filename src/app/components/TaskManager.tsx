'use client'

import { useState, useEffect, FormEvent, useRef, useCallback, useMemo } from 'react'
import { Task, Toast } from './TaskManager/types'
import TaskItem from './TaskManager/TaskItem'
import TaskForm from './TaskManager/TaskForm'
import FilterBar from './TaskManager/FilterBar'
import StatsBar from './TaskManager/StatsBar'
import ChatAssistant from './TaskManager/ChatAssistant'
import ToastContainer from './TaskManager/ToastContainer'
import ProductivityDashboard from './TaskManager/ProductivityDashboard'
import SettingsModal from './TaskManager/SettingsModal'
import BulkActionsBar from './TaskManager/BulkActionsBar'
import CalendarView from './TaskManager/CalendarView'
import MatrixView from './TaskManager/MatrixView'
import FocusTimer from './TaskManager/FocusTimer'
import { filterTasks, sortTasks } from '@/utils/taskHelpers'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from './Providers'
import { useGamification } from './GamificationProvider'
import { Sparkles, ShieldAlert, Check } from 'lucide-react'

export default function TaskManager() {
  const { t } = useLanguage()
  const { gainXp, checkMilestones } = useGamification()
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<{ id: number; content: string; due_date: string; priority: number; category: string; description: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority-desc' | 'priority-asc' | 'due-date'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [celebration, setCelebration] = useState<{ isOpen: boolean; message: string } | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'matrix'>('list');
  const [isArchiveView, setIsArchiveView] = useState(false);

  // AI Suggestions for empty state
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // AI Search states
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<number[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // AI Insights states
  const [conflicts, setConflicts] = useState<{ taskId: number; message: string }[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [isResolvingConflicts, setIsResolvingConflicts] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [aiUsedCount, setAiUsedCount] = useState(0);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isGrouping, setIsGrouping] = useState(false);

  // Feedback states
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const logActivity = async (action: string, details: string, taskId?: number) => {
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details, taskId })
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) {
      setAiFilteredIds(null);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, tasks })
      });
      const data = await response.json();
      if (data.taskIds) {
        setAiFilteredIds(data.taskIds);
        showToast(`AI found ${data.taskIds.length} matching tasks`);
        gainXp(10);
      }
    } catch {
      showToast('AI search failed', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAiSuggestions = useCallback(async () => {
    if (tasks.length > 0 || isFetchingSuggestions) return;
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggest', { method: 'POST' });
      const data = await response.json();
      if (data.suggestions) setAiSuggestions(data.suggestions);
    } catch {
      console.error('Failed to fetch AI suggestions');
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, [tasks.length, isFetchingSuggestions]);

  useEffect(() => {
    if (tasks.length === 0 && !loading) {
      fetchAiSuggestions();
    }
  }, [tasks.length, loading, fetchAiSuggestions]);

  const handleAutoLink = async () => {
    if (tasks.length === 0 || isLinking) return;
    setIsLinking(true);
    try {
      const response = await fetch('/api/ai/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await response.json();
      if (data.dependencies) {
        setTasks(prev => prev.map(t => {
          const deps = data.dependencies.filter((d: any) => d.taskId === t.id).map((d: any) => d.dependsOnId);
          if (deps.length > 0) return { ...t, depends_on: [...(t.depends_on || []), ...deps] };
          return t;
        }));
        gainXp(80);
        logActivity('dependencies', `AI identified ${data.dependencies.length} task prerequisites`);
        showToast('Task dependencies mapped');
      }
    } catch {
      showToast('Dependency check failed', 'error');
    } finally {
      setIsLinking(false);
    }
  };

  const handleResolveConflicts = async () => {
    if (conflicts.length === 0 || isResolvingConflicts) return;
    setIsResolvingConflicts(true);
    try {
      const response = await fetch('/api/ai/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflicts, tasks })
      });
      const data = await response.json();
      if (data.adjustments) {
        setTasks(prev => prev.map(t => {
          const adj = data.adjustments.find((a: any) => a.id === t.id);
          return adj ? { ...t, due_date: adj.due_date, priority: adj.priority } : t;
        }));
        setConflicts([]);
        gainXp(120);
        logActivity('resolve', `AI auto-corrected ${data.adjustments.length} schedule conflicts`);
        showToast('Schedule conflicts resolved');
      }
    } catch {
      showToast('Resolution failed', 'error');
    } finally {
      setIsResolvingConflicts(false);
    }
  };

  const triggerCelebration = async (milestone: string) => {
    try {
      const response = await fetch('/api/ai/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone })
      });
      const data = await response.json();
      setCelebration({ isOpen: true, message: data.message });
      setTimeout(() => setCelebration(null), 5000);
    } catch {
      setCelebration({ isOpen: true, message: "Incredibil! Ai atins un nou nivel!" });
      setTimeout(() => setCelebration(null), 5000);
    }
  };

  const checkConflicts = useCallback(async () => {
    if (tasks.length === 0 || isArchiveView) return;
    setIsCheckingConflicts(true);
    try {
      const response = await fetch('/api/ai/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await response.json();
      if (data.conflicts) setConflicts(data.conflicts);
    } catch {
      console.error('Conflict check failed');
    } finally {
      setIsCheckingConflicts(false);
    }
  }, [tasks.length, isArchiveView]);

  useEffect(() => {
    const timer = setTimeout(checkConflicts, 2000);
    return () => clearTimeout(timer);
  }, [tasks.length, checkConflicts]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?includeArchived=${isArchiveView}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks?.filter((t: Task) => t.is_archived === isArchiveView) || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('syncError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [isArchiveView, t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelectTask = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0 || isBatchProcessing) return;

    setConfirmModal({
      isOpen: true,
      title: `${t('delete')} ${selectedIds.length} Tasks`,
      message: t('confirmDelete'),
      onConfirm: async () => {
        setIsBatchProcessing(true);
        const originalTasks = tasks;
        const idsToRemove = selectedIds;
        
        setTasks(prev => prev.filter(t => !idsToRemove.includes(t.id)));
        setSelectedIds([]);
        setConfirmModal(null);

        try {
          const deletePromises = idsToRemove.map(id => 
            fetch(`/api/tasks/${id}`, { method: 'DELETE' })
          );
          await Promise.all(deletePromises);
          logActivity('batch delete', `Deleted ${idsToRemove.length} tasks`);
          showToast(`${t('delete')} complete`);
        } catch {
          showToast('Batch delete failed', 'error');
          setTasks(originalTasks);
        } finally {
          setIsBatchProcessing(false);
        }
      }
    });
  };

  const handleBatchStatusUpdate = async (status: 'todo' | 'done') => {
    if (selectedIds.length === 0 || isBatchProcessing) return;

    setIsBatchProcessing(true);
    const originalTasks = tasks;
    const idsToUpdate = selectedIds;

    setTasks(prev => prev.map(t => 
      idsToUpdate.includes(t.id) ? { ...t, status } : t
    ));
    setSelectedIds([]);

    try {
      const updatePromises = idsToUpdate.map(id => 
        fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      );
      await Promise.all(updatePromises);
      if (status === 'done') {
        gainXp(idsToUpdate.length * 50);
        logActivity('batch complete', `Completed ${idsToUpdate.length} tasks`);
        const doneCount = tasks.filter(t => t.status === 'done').length + idsToUpdate.length;
        if (doneCount > 0 && doneCount % 10 === 0) triggerCelebration(`${doneCount} tasks completed`);
        checkMilestones({ completedCount: doneCount, aiUsedCount, focusCount: 0 });
      }
      showToast(`${t('saveChanges')} complete`);
    } catch {
      showToast('Batch update failed', 'error');
      setTasks(originalTasks);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const addTaskByText = async (content: string) => {
    if (!content.trim() || isAdding) return;
    setIsAdding(true);
    const tempId = Date.now();
    
    const optimisticTask: Task = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      status: 'todo',
      category: 'Processing...',
      priority: undefined,
      is_archived: false
    };
    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.task) {
        throw new Error(data.error || 'Failed to add task');
      }

      setTasks(prev => prev.map(task => (task.id === tempId ? data.task : task)));
      gainXp(20);
      logActivity('created', `Added task: ${content}`, data.task.id);
      showToast(t('addTask') + ' success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add task', 'error');
      setTasks(prev => prev.filter(task => task.id !== tempId));
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim() || isAdding) return;
    const content = newTaskContent;
    setNewTaskContent('');
    await addTaskByText(content);
  };

  const handleDeleteTask = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: t('delete'),
      message: t('confirmDelete'),
      onConfirm: async () => {
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        setConfirmModal(null);

        try {
          const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete task');
          logActivity('deleted', `Removed task ID: ${id}`);
          showToast(t('delete') + ' success');
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
          setTasks(originalTasks);
        }
      }
    });
  };

  const handleArchiveTask = async (id: number, archive: boolean) => {
    const originalTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archive })
      });
      if (!response.ok) throw new Error('Failed to archive task');
      logActivity('archived', `${archive ? 'Archived' : 'Restored'} task ID: ${id}`, id);
      showToast(archive ? 'Task archived' : 'Task restored');
    } catch {
      showToast('Archiving failed', 'error');
      setTasks(originalTasks);
    }
  };

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    if (completedTasks.length === 0 || isClearing) return;

    setConfirmModal({
      isOpen: true,
      title: t('clearCompleted'),
      message: t('confirmClear'),
      onConfirm: async () => {
        setIsClearing(true);
        const originalTasks = tasks;
        setTasks(prev => prev.filter(t => t.status !== 'done'));
        setConfirmModal(null);

        try {
          const deletePromises = completedTasks.map(task => 
            fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
          );
          const results = await Promise.all(deletePromises);
          if (results.some(r => !r.ok)) throw new Error('Some tasks could not be deleted');
          logActivity('clear done', `Cleared ${completedTasks.length} finished tasks`);
          showToast(t('clearCompleted'));
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : 'Failed to clear tasks', 'error');
          setTasks(originalTasks);
        } finally {
          setIsClearing(false);
        }
      }
    });
  };
  
  const handleStartEdit = (task: Task) => {
    setEditingTask({ 
      id: task.id, 
      content: task.content, 
      due_date: task.due_date || '',
      priority: task.priority || 3,
      category: task.category || '',
      description: task.description || ''
    });
    setExpandedTaskId(task.id);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleUpdateTask = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTask || isUpdating) return;

    setIsUpdating(true);
    const originalTasks = tasks;
    const { id, content, due_date, priority, category, description } = editingTask;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, content, due_date: due_date || undefined, priority, category, description: description || undefined } : task
      )
    );
    setEditingTask(null);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          due_date: due_date || null, 
          priority, 
          category: category || null,
          description: description || null
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const data = await response.json();
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === id ? data.task : task))
      );
      logActivity('updated', `Modified task: ${content}`, id);
      showToast(t('saveChanges'));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update task', 'error');
      setTasks(originalTasks);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const originalTasks = tasks;
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    );

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      
      if (!response.ok || !data.task) {
        throw new Error(data.error || 'Failed to update task');
      }

      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === task.id ? data.task : t))
      );
      if (newStatus === 'done') {
        gainXp(50);
        logActivity('completed', `Finished task: ${task.content}`, task.id);
        const doneCount = tasks.filter(t => t.status === 'done').length + 1;
        if (doneCount > 0 && doneCount % 10 === 0) triggerCelebration(`${doneCount} tasks completed`);
        checkMilestones({ completedCount: doneCount, aiUsedCount, focusCount: 0 });
      }
      showToast(newStatus === 'done' ? 'Task completed! 🎉' : 'Task reopened');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
      setTasks(originalTasks);
    }
  };

  const handleBreakdown = async (task: Task) => {
    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, content: task.content })
      });
      const data = await response.json();
      if (data.task) {
        setTasks(prev => prev.map(t => t.id === task.id ? data.task : t));
        gainXp(30);
        logActivity('breakdown', `AI decomposed task: ${task.content}`, task.id);
        showToast(t('breakdown') + ' complete');
      }
    } catch {
      showToast(t('breakdown') + ' failed', 'error');
    }
  };

  const handleRefineTask = async (content: string) => {
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (data.refined) {
        gainXp(15);
        const newAiCount = aiUsedCount + 1;
        setAiUsedCount(newAiCount);
        checkMilestones({ completedCount: tasks.filter(t => t.status === 'done').length, aiUsedCount: newAiCount, focusCount: 0 });
        showToast('Task refined with AI');
        return data.refined;
      }
      return null;
    } catch {
      showToast('Refinement failed', 'error');
      return null;
    }
  };

  const handleAutoGroup = async () => {
    if (tasks.length === 0 || isGrouping) return;
    setIsGrouping(true);
    try {
      const response = await fetch('/api/ai/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await response.json();
      if (data.groupings) {
        setTasks(prev => prev.map(t => {
          const group = data.groupings.find((g: any) => g.id === t.id);
          return group ? { ...t, project_name: group.project_name } : t;
        }));
        gainXp(100);
        logActivity('grouping', `AI organized tasks into ${new Set(data.groupings.map((g:any) => g.project_name)).size} projects`);
        showToast('Tasks grouped into Projects');
      }
    } catch {
      showToast('Grouping failed', 'error');
    } finally {
      setIsGrouping(false);
    }
  };

  const handleToggleSubTask = async (taskId: number, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.sub_tasks) return;

    const subTask = task.sub_tasks.find(st => st.id === subTaskId);
    const isNowCompleted = !subTask?.completed;

    const newSubTasks = task.sub_tasks.map(st => 
      st.id === subTaskId ? { ...st, completed: isNowCompleted } : st
    );

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, sub_tasks: newSubTasks } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub_tasks: newSubTasks })
      });
      if (isNowCompleted) gainXp(10);
    } catch {
      showToast('Failed to update sub-task', 'error');
      setTasks(prev => prev.map(t => t.id === taskId ? task : t));
    }
  };

  const handleImportTasks = async (importedTasks: Partial<Task>[]) => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Unauthorized');

      const tasksToInsert = importedTasks.map(t => ({
        user_id: session.user.id,
        content: t.content || 'Untitled Task',
        description: t.description || null,
        status: t.status || 'todo',
        category: t.category || 'Imported',
        priority: t.priority || 3,
        due_date: t.due_date || null,
        is_archived: false
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;
      if (data) {
        setTasks(prev => [...data, ...prev]);
        gainXp(data.length * 5);
        logActivity('import', `Batch imported ${data.length} tasks`);
        showToast(`Successfully imported ${data.length} tasks`);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Import failed', 'error');
    }
  };

  const toggleExpandTask = (id: number) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean))) as string[];

  const filteredTasks = useMemo(() => {
    let result = filterTasks(tasks, filter, selectedCategory, isAiSearch ? '' : searchQuery);
    if (isAiSearch && aiFilteredIds !== null) {
      result = result.filter(t => aiFilteredIds.includes(t.id));
    }
    return result;
  }, [tasks, filter, selectedCategory, searchQuery, isAiSearch, aiFilteredIds]);

  const sortedTasks = sortTasks(filteredTasks, sortBy);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-neutral-500 font-medium animate-pulse">{t('loadingAI')}</p>
    </div>
  );

  return (
    <div className="w-full relative pb-20">
      {celebration && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden flex items-center justify-center">
           <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] shadow-2xl border-4 border-blue-500 text-center relative z-50">
              <div className="text-7xl mb-6">🏆</div>
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter mb-4">Epic Milestone!</h2>
              <p className="text-neutral-500 dark:text-neutral-300 font-bold italic max-w-sm leading-relaxed">"{celebration.message}"</p>
           </motion.div>
           {[...Array(30)].map((_, i) => (
             <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200, rotate: 720, opacity: 0 }} transition={{ duration: 2.5, ease: 'easeOut' }} className={`absolute w-3 h-3 bg-${['blue', 'red', 'yellow', 'green', 'purple'][i % 5]}-500 rounded-full`} />
           ))}
        </div>
      )}

      {!isArchiveView && (
        <TaskForm 
          content={newTaskContent} setContent={setNewTaskContent}
          dueDate={newTaskDueDate} setDueDate={setNewTaskDueDate}
          description={newTaskDescription} setDescription={setNewTaskDescription}
          isAdding={isAdding} onSubmit={handleAddTask}
        />
      )}

      <FilterBar 
        filter={filter} setFilter={setFilter}
        sortBy={sortBy} setSortBy={setSortBy}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        categories={categories}
        showDashboard={showDashboard} setShowDashboard={setShowDashboard}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen}
        viewMode={viewMode} setViewMode={setViewMode}
        onAutoGroup={handleAutoGroup}
        isGrouping={isGrouping}
        isArchiveView={isArchiveView}
        setIsArchiveView={setIsArchiveView}
        isAiSearch={isAiSearch}
        setIsAiSearch={setIsAiSearch}
        onAiSearch={handleAiSearch}
        isSearching={isSearching}
        onAutoLink={handleAutoLink}
        isLinking={isLinking}
      />

      {showDashboard && <ProductivityDashboard tasks={tasks} />}

      <StatsBar 
        tasks={tasks} sortedCount={sortedTasks.length} 
        searchQuery={searchQuery} isClearing={isClearing} 
        onClearCompleted={handleClearCompleted} 
      />

      <div className="mt-4">
        {conflicts.length > 0 && !isArchiveView && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between shadow-lg shadow-yellow-900/5">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-white"><ShieldAlert size={20} /></div>
                <div>
                   <h4 className="text-sm font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">Workload Conflicts</h4>
                   <p className="text-xs text-neutral-500 font-medium">AI detected {conflicts.length} overlapping priorities.</p>
                </div>
             </div>
             <button 
               onClick={handleResolveConflicts}
               disabled={isResolvingConflicts}
               className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-md shadow-yellow-900/20 flex items-center gap-2 active:scale-95"
             >
               {isResolvingConflicts ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Check size={14} /> Resolve All</>}
             </button>
          </motion.div>
        )}

        {isArchiveView && (
          <div className="mb-6 p-6 rounded-3xl bg-purple-600/10 border border-purple-600/30 flex items-center gap-6 shadow-lg shadow-purple-900/5">
             <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-purple-900/20">📦</div>
             <div>
                <h4 className="text-lg font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Archive Vault</h4>
                <p className="text-xs text-neutral-500 font-medium">History of your success. Restore items to bring them back to your active workflow.</p>
             </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {sortedTasks.length > 0 ? (
                <ul className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {sortedTasks.map((task) => (
                      <TaskItem 
                        key={task.id} task={task}
                        isEditing={editingTask?.id === task.id}
                        isExpanded={expandedTaskId === task.id}
                        isUpdating={isUpdating}
                        isSelected={selectedIds.includes(task.id)}
                        editingData={editingTask}
                        onToggle={toggleTaskStatus}
                        onExpand={toggleExpandTask}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        onDelete={handleDeleteTask}
                        onUpdate={handleUpdateTask}
                        onSelect={handleSelectTask}
                        onBreakdown={handleBreakdown}
                        onToggleSubTask={handleToggleSubTask}
                        onRefine={handleRefineTask}
                        onArchive={handleArchiveTask}
                        setEditingData={setEditingTask}
                        conflict={conflicts.find(c => c.taskId === task.id)?.message}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <div className="text-center py-24 bg-neutral-50/50 dark:bg-neutral-900/20 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800/50 flex flex-col items-center gap-8 transition-all">
                  <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-4xl shadow-inner animate-bounce">🎯</div>
                  <div className="max-w-xs">
                    <p className="text-neutral-900 dark:text-neutral-300 font-black text-2xl uppercase tracking-tighter mb-2">{filter === 'all' ? 'Work list empty' : `No ${t(filter)} found`}</p>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed">{filter === 'all' ? 'Your focus list is clear. Would you like a suggestion from your partner?' : 'Try adjusting your filters or search'}</p>
                  </div>
                  
                  {filter === 'all' && aiSuggestions.length > 0 && (
                    <div className="flex flex-col gap-3 w-full max-w-sm px-6">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                          <Sparkles size={12} /> AI Suggested Momentum
                       </p>
                       {aiSuggestions.map((s, i) => (
                         <button 
                           key={i} 
                           onClick={() => addTaskByText(s)}
                           disabled={isAdding}
                           className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:border-blue-500 hover:text-blue-500 transition-all text-left shadow-sm active:scale-95"
                         >
                            + {s}
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : viewMode === 'calendar' ? (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarView 
                tasks={filteredTasks} 
                onTaskClick={handleStartEdit}
              />
            </motion.div>
          ) : (
            <motion.div
              key="matrix-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <MatrixView 
                tasks={filteredTasks}
                onTaskClick={handleStartEdit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatAssistant tasks={tasks} onShowToast={showToast} />
      
      <FocusTimer tasks={tasks} />

      <ToastContainer toasts={toasts} />

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onDelete={handleBatchDelete}
        onMarkDone={() => handleBatchStatusUpdate('done')}
        onMarkTodo={() => handleBatchStatusUpdate('todo')}
        onDeselectAll={() => setSelectedIds([])}
        isProcessing={isBatchProcessing}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        tasks={tasks} 
        onImport={handleImportTasks}
      />

      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl max-sm w-full p-10 transform transition-all border-t-red-600/50 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-14 rounded-2xl bg-red-900/20 flex items-center justify-center text-red-500 mb-6 text-2xl">⚠️</div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">{confirmModal.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-10 font-medium">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-4 rounded-2xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 font-black transition-all text-xs uppercase tracking-widest border border-neutral-700">Cancel</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 px-4 py-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-black transition-all shadow-lg shadow-red-900/30 text-xs uppercase tracking-widest">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
