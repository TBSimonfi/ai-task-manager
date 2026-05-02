'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import { useLanguage } from '@/app/components/Providers'
import LanguageToggle from '@/app/components/LanguageToggle'
import ThemeToggle from '@/app/components/ThemeToggle'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { t } = useLanguage()

  const login = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return router.push('/login?message=Could not authenticate user')
    }

    return router.push('/')
  }

  const signup = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return router.push('/login?message=Could not authenticate user')
    }

    return router.push('/login?message=Check email to continue sign in process')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 justify-center items-center bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <div className="absolute top-6 right-6 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-2xl transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">AI Task Manager</h1>
          <p className="text-neutral-500 dark:text-neutral-400">{t('manageIntelligence')}</p>
        </div>

        <form className="flex flex-col w-full gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300 block mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full rounded-lg px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="mb-2">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300 block mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-lg px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {t('signIn')}
            </button>
            <button
              formAction={signup}
              className="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-200 font-medium py-2.5 rounded-lg transition-all border border-neutral-200 dark:border-neutral-700 active:scale-95"
            >
              {t('createAccount')}
            </button>
          </div>

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center text-sm animate-in fade-in zoom-in-95 duration-200 ${
              message.toLowerCase().includes('check email') 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
            }`}>
              {message.toLowerCase().includes('check email') ? t('checkEmail') : message.toLowerCase().includes('authenticate') ? t('invalidLogin') : message}
            </div>
          )}
        </form>

        <p className="text-center mt-8 text-xs text-neutral-400 dark:text-neutral-500">
          Powered by Supabase & Google Gemini AI
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
