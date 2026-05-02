'use client'

import { useLanguage } from './Providers'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ro' : 'en')}
      className="p-2 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-all text-xs font-black uppercase tracking-tighter"
      aria-label="Toggle Language"
    >
      {language === 'en' ? 'RO' : 'EN'}
    </button>
  )
}
