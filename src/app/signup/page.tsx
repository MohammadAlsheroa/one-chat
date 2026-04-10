'use client'

import { useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTopLoader } from 'nextjs-toploader'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function SignupPage() {
  const router = useRouter()
  const topLoader = useTopLoader()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageB64, setImageB64] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be under 2MB')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setImageB64(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    topLoader.start()

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, image: imageB64 }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Signup failed')
      topLoader.done()
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

          {/* Profile picture */}
          <div className="space-y-2">
            <label className="block text-sm text-stone-700 font-medium">Profile picture <span className="text-stone-400 font-normal">(optional)</span></label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                <img
                  src={imageB64 ?? '/luffy.png'}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <label className="cursor-pointer inline-block bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium px-3 py-1.5 rounded-lg text-sm transition-all">
                  {imageB64 ? 'Change' : 'Upload photo'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
                {imageB64 && (
                  <button
                    type="button"
                    onClick={() => { setImageB64(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="block text-xs text-stone-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
                {imageError && <p className="text-xs text-red-500">{imageError}</p>}
                {!imageError && <p className="text-xs text-stone-400">JPG, PNG, WebP or GIF · Max 2MB</p>}
              </div>
            </div>
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
