'use client'

import { useState } from 'react'
import { Task } from './types'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../Providers'

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Adjust for Monday start (standard in many regions, including RO)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const year = currentDate.getFullYear()

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  }

  const calendarDays = [];
  for (let i = 0; i < offset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-widest">{monthName} {year}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-400">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const dayTasks = day ? getTasksForDay(day) : [];
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={i} 
              className={`min-h-[120px] p-2 border-r border-b border-neutral-100 dark:border-neutral-800/50 transition-colors ${day ? 'bg-transparent' : 'bg-neutral-50/30 dark:bg-neutral-900/30'} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
            >
              {day && (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-neutral-400 dark:text-neutral-500'}`}>
                      {day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layoutId={`task-${task.id}`}
                        onClick={() => onTaskClick(task)}
                        className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer truncate shadow-sm transition-all border ${
                          task.status === 'done'
                            ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 line-through'
                            : 'bg-blue-600 text-white border-blue-500 hover:scale-[1.02] active:scale-95'
                        }`}
                      >
                        {task.content}
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
