'use client'

import { ThemeProvider } from 'next-themes'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { GamificationProvider } from './GamificationProvider'

type Language = 'en' | 'ro';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    welcome: 'Welcome',
    logout: 'Logout',
    yourTasks: 'Your Tasks',
    aiTagline: 'Organized and prioritized with AI intelligence.',
    addTask: 'Add Task',
    placeholder: 'What needs to be done?',
    notesPlaceholder: 'Add detailed notes (optional)...',
    filter: 'Filter',
    sort: 'Sort',
    category: 'Category',
    search: 'Search everything...',
    dashboard: 'Dashboard',
    settings: 'Settings',
    all: 'All',
    todo: 'To Do',
    done: 'Done',
    overdue: 'Overdue',
    total: 'Total',
    found: 'Found',
    clearCompleted: 'Clear Completed',
    notes: 'Notes',
    hideDetails: 'Hide Details',
    breakdown: 'Breakdown',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    due: 'Due',
    priority: 'Priority',
    syncError: 'Failed to sync with intelligence',
    retry: 'Retry Connection',
    loadingAI: 'Loading your intelligence...',
    captured: 'Captured',
    confirmDelete: 'Are you sure you want to delete this task?',
    confirmClear: 'Are you sure you want to delete all completed tasks?',
    exportJson: 'Export as JSON',
    exportCsv: 'Export as CSV',
    shortcuts: 'Keyboard Shortcuts',
    dataPortability: 'Data Portability',
    proTip: 'Pro Tip',
    checkEmail: 'Check your email to confirm your account.',
    invalidLogin: 'Invalid login credentials.',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    manageIntelligence: 'Manage your tasks with intelligence.'
  },
  ro: {
    welcome: 'Bun venit',
    logout: 'Deconectare',
    yourTasks: 'Task-urile tale',
    aiTagline: 'Organizate și prioritizate cu inteligență AI.',
    addTask: 'Adaugă Task',
    placeholder: 'Ce trebuie făcut?',
    notesPlaceholder: 'Adaugă note detaliate (opțional)...',
    filter: 'Filtrare',
    sort: 'Sortare',
    category: 'Categorie',
    search: 'Caută orice...',
    dashboard: 'Dashboard',
    settings: 'Setări',
    all: 'Toate',
    todo: 'De făcut',
    done: 'Finalizate',
    overdue: 'Întârziat',
    total: 'Total',
    found: 'Găsite',
    clearCompleted: 'Șterge Finalizate',
    notes: 'Note',
    hideDetails: 'Ascunde Detalii',
    breakdown: 'Descompunere',
    edit: 'Editare',
    delete: 'Ștergere',
    cancel: 'Anulare',
    saveChanges: 'Salvează Modificările',
    due: 'Termen',
    priority: 'Prioritate',
    syncError: 'Sincronizare eșuată cu AI',
    retry: 'Reîncearcă Conexiunea',
    loadingAI: 'Se încarcă inteligența...',
    captured: 'Capturat la',
    confirmDelete: 'Ești sigur că vrei să ștergi acest task?',
    confirmClear: 'Ești sigur că vrei să ștergi toate task-urile finalizate?',
    exportJson: 'Exportă ca JSON',
    exportCsv: 'Exportă ca CSV',
    shortcuts: 'Scurtături Tastatură',
    dataPortability: 'Portabilitate Date',
    proTip: 'Sfat util',
    checkEmail: 'Verifică e-mailul pentru a confirma contul.',
    invalidLogin: 'Date de autentificare invalide.',
    signIn: 'Autentificare',
    createAccount: 'Creează Cont',
    manageIntelligence: 'Gestionează task-urile cu inteligență.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ro');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguage(savedLang);
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('SW registered:', registration),
          (error) => console.log('SW registration failed:', error)
        );
      });
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <GamificationProvider>
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
          {children}
        </LanguageContext.Provider>
      </GamificationProvider>
    </ThemeProvider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a Providers');
  return context;
}
