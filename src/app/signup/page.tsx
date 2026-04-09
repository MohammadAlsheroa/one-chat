'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Signup failed')
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push('/chat')
  }

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex items-center justify-center px-4">
      {/* Subtle background orb */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-emerald-50/80 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-10">
          <Link href="/" className="text-base font-bold text-stone-800 hover:text-stone-950 transition-colors tracking-tight">
            OneChat
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-6">Create your account</h1>
          <p className="text-stone-400 mt-1 text-sm">Everything you write will be public and anonymous</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm text-stone-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-stone-700 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="your_username"
            />
            <p className="text-xs text-stone-400">For your account only. Never shown publicly.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-stone-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              placeholder="Min. 8 characters"
            />
          </div>

          {/* Public notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              All conversations are <span className="font-semibold">public and anonymous</span>. Everyone can read what you write.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-sm shadow-emerald-200/80"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-stone-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
