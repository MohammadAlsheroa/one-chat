'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function NavMenu() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (status === 'loading') return <div className="w-9 h-9" />

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 active:scale-[0.95] transition-all text-stone-600"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] overflow-hidden z-50">
          {session ? (
            <>
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                My chats
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Profile
              </Link>
              <div className="border-t border-stone-100" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors w-full text-left"
              >
                <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6 0l3 3m0 0l3-3m-3 3V12" />
                </svg>
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
