'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface AuthResponse {
  error?: string;
  message?: string;
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signup(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`, // Make sure this is correct for your deployment
    },
  })

  if (error) {
    return { error: error.message }
  }

  // After successful signup, Supabase typically sends a confirmation email.
  // The user will be redirected to /dashboard after confirming their email,
  // or they might be directly signed in depending on Supabase settings.
  redirect('/')
}
