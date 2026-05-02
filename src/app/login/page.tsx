'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login, signup } from './actions'
import { useRouter } from 'next/navigation' // Corrected import for useRouter

function SubmitButton({ text, formAction }: { text: string; formAction?: string | ((formData: FormData) => void | Promise<void>) }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      formAction={formAction}
      aria-disabled={pending}
      disabled={pending}
      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Processing...' : text}
    </button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter() // Initialize useRouter

  // Handle form submission for both login and signup
  const handleAuthAction = async (action: (formData: FormData) => Promise<{ error?: string | undefined; message?: string | undefined; }>, formData: FormData) => {
    setError(null) // Clear previous errors
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      // If no error, the server action would have handled the redirect.
      // For client-side navigation if no redirect happens on server action
      // router.push('/dashboard') 
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-col space-y-4">
            <SubmitButton formAction={(formData) => handleAuthAction(login, formData)} text="Sign in" />
            <SubmitButton formAction={(formData) => handleAuthAction(signup, formData)} text="Sign up" />
          </div>
        </form>
      </div>
    </div>
  )
}
