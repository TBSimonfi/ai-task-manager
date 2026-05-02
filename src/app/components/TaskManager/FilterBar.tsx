'use client'

import { Task } from './types'
import { useLanguage } from '../Providers'
import { Search, Sparkles, Link as LinkIcon, Folder } from 'lucide-react'

interface FilterBarProps {
  filter: 'all' | 'todo' | 'done';
  setFilter: (f: 'all' | 'todo' | 'done') => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categories: string[];
  showDashboard: boolean;
  setShowDashboard: (s: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (s: boolean) => void;
  viewMode: 'list' | 'calendar' | 'matrix';
  setViewMode: (v: 'list' | 'calendar' | 'matrix') => void;
  onAutoGroup: () => void;
  isGrouping: boolean;
  isArchiveView: boolean;
  setIsArchiveView: (v: boolean) => void;
  isAiSearch: boolean;
  setIsAiSearch: (v: boolean) => void;
  onAiSearch: () => void;
  isSearching: boolean;
  onAutoLink: () => void;
  isLinking: boolean;
}

export default function FilterBar({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  showDashboard,
  setShowDashboard,
  isSettingsOpen,
  setIsSettingsOpen,
  viewMode,
  setViewMode,
  onAutoGroup,
  isGrouping,
  isArchiveView,
  setIsArchiveView,
  isAiSearch,
  setIsAiSearch,
  onAiSearch,
  isSearching,
  onAutoLink,
  isLinking
}: FilterBarProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-neutral-900 p-4 rounded-lg transition-all shadow-lg border border-neutral-800">
      <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
        <div className="flex gap-2">
          <div className="flex bg-neutral-800 rounded-md p-1 border border-neutral-700/50">
            {(['list', 'calendar', 'matrix'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                  viewMode === v ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsArchiveView(!isArchiveView)}
            className={`px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all border ${
              isArchiveView 
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isArchiveView ? 'Close Archive' : '📦 Archive'}
          </button>

          <button
            onClick={onAutoGroup}
            disabled={isGrouping}
            className={`px-3 py-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isGrouping ? 'opacity-50' : ''}`}
            title="Auto-Group into Projects"
          >
            {isGrouping ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Folder size={14} />}
          </button>

          <button
            onClick={onAutoLink}
            disabled={isLinking}
            className={`px-3 py-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isLinking ? 'opacity-50' : ''}`}
            title="Auto-Detect Dependencies"
          >
            {isLinking ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <LinkIcon size={14} />}
          </button>

          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className={`px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest transition-all border ${
              showDashboard 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {showDashboard ? t('cancel') : '📊 ' + t('dashboard')}
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-black uppercase tracking-widest transition-all"
          >
            ⚙️ {t('settings')}
          </button>
        </div>

        {!isAiSearch && (
          <>
            <div className="flex gap-2 items-center text-foreground transition-all">
              <span className="text-sm text-neutral-400 font-medium">{t('filter')}:</span>
              <div className="flex bg-neutral-800 rounded-md p-1 border border-neutral-700/50">
                {(['all', 'todo', 'done'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${
                      filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    {t(f)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center transition-all">
              <span className="text-sm text-neutral-400 font-medium">{t('sort')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-800 text-sm text-neutral-200 rounded-md px-3 py-1.5 border-none focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="due-date">Due Date</option>
                <option value="priority-desc">Priority ↑</option>
                <option value="priority-asc">Priority ↓</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="w-full md:w-80 flex gap-2">
        <div className="relative flex-grow group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isAiSearch && onAiSearch()}
            placeholder={isAiSearch ? 'Describe what to find...' : t('search')}
            className={`w-full bg-neutral-800 text-sm text-neutral-200 rounded-md px-4 py-2 border transition-all outline-none pl-10 ${
              isAiSearch ? 'border-blue-600/50 shadow-[0_0_10px_rgba(37,99,235,0.1)]' : 'border-neutral-700/50'
            } focus:ring-1 focus:ring-blue-500`}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {isAiSearch ? <Sparkles size={16} className="text-blue-500" /> : <Search size={16} />}
          </div>
          {isAiSearch && (
            <button 
              onClick={onAiSearch}
              disabled={isSearching || !searchQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-30"
            >
              {isSearching ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : 'Go'}
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsAiSearch(!isAiSearch)}
          className={`p-2 rounded-md transition-all border ${
            isAiSearch 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-blue-400'
          }`}
          title="Toggle AI Semantic Search"
        >
          <Sparkles size={18} />
        </button>
      </div>
    </div>
  );
}
