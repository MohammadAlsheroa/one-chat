'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

function UserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initial = username?.[0]?.toUpperCase() ?? '?'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-stone-200 rounded-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] overflow-hidden">
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
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-stone-100 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-semibold">{initial}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{username}</p>
          <p className="text-xs text-stone-400">OneChat</p>
        </div>
        <svg className="w-4 h-4 text-stone-400 group-hover:text-stone-600 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </button>
    </div>
  )
}

interface Conversation {
  id: string
  title: string
  forkedFromId: string | null
  createdAt: string
}

export function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [session, pathname])

  useEffect(() => {
    if (renamingId) renameRef.current?.focus()
  }, [renamingId])

  async function newChat() {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (!res.ok) return
    const conv = await res.json()
    setConversations((prev) => [conv, ...prev])
    router.push(`/chat/${conv.id}`)
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (pathname === `/chat/${id}`) router.push('/chat')
  }

  function startRename(c: Conversation, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setRenamingId(c.id)
    setRenameValue(c.title)
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)))
    setRenamingId(null)
    await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    })
  }

  function handleRenameKey(e: React.KeyboardEvent, id: string) {
    if (e.key === 'Enter') commitRename(id)
    if (e.key === 'Escape') setRenamingId(null)
  }

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const username = (session?.user as any)?.username ?? session?.user?.name ?? 'User'

  return (
    <div className="w-64 bg-white border-r border-stone-200/80 flex flex-col h-full shrink-0">

      {/* Logo */}
      <div className="px-4 pt-5 pb-3">
        <Link href="/" className="text-xl font-bold text-stone-900 tracking-tight hover:text-stone-700 transition-colors">
          OneChat
        </Link>
      </div>

      {/* Top nav */}
      <div className="px-2 space-y-0.5">
        {session ? (
          <button
            onClick={newChat}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 transition-colors font-medium group"
          >
            <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New chat
          </button>
        ) : (
          <Link
            href="/signup"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 transition-colors font-medium"
          >
            <svg className="w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New chat
          </Link>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
          <svg className="w-4 h-4 text-stone-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none min-w-0"
          />
        </div>
      </div>

      <div className="mx-3 my-3 border-t border-stone-100" />

      {/* Nav links */}
      <div className="px-2 space-y-0.5">
        <Link
          href="/chat"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/chat' ? 'bg-stone-100 text-stone-900 font-medium' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          Chats
        </Link>
        <Link
          href="/browse"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/browse' ? 'bg-stone-100 text-stone-900 font-medium' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 011.716-5.336" />
          </svg>
          Browse
        </Link>
      </div>

      <div className="mx-3 my-3 border-t border-stone-100" />

      {/* Recents */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        {session && (
          <>
            <p className="text-xs font-medium text-stone-400 px-3 mb-1 uppercase tracking-wider">Recents</p>

            {loading && (
              <div className="px-3 py-2 space-y-2">
                <div className="h-3.5 skeleton rounded" />
                <div className="h-3.5 skeleton rounded w-4/5" />
                <div className="h-3.5 skeleton rounded w-3/5" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-xs text-stone-400 px-3 py-4">
                {search ? 'No matches' : 'No conversations yet'}
              </p>
            )}

            {filtered.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                  pathname === `/chat/${c.id}`
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                {renamingId === c.id ? (
                  <input
                    ref={renameRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(c.id)}
                    onKeyDown={(e) => handleRenameKey(e, c.id)}
                    className="flex-1 bg-white border border-emerald-300 ring-2 ring-emerald-100 rounded-lg px-2 py-0.5 text-stone-900 text-sm outline-none min-w-0"
                  />
                ) : (
                  <Link href={`/chat/${c.id}`} className="truncate flex-1 min-w-0 leading-snug">
                    {c.forkedFromId && (
                      <span className="text-[9px] text-stone-400 font-mono mr-1 uppercase tracking-wider">fork</span>
                    )}
                    {c.title}
                  </Link>
                )}

                {renamingId !== c.id && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 ml-1 shrink-0 transition-all">
                    <button
                      onClick={(e) => startRename(c, e)}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => deleteConversation(c.id, e)}
                      className="text-stone-400 hover:text-red-500 p-1 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {!session && (
          <div className="px-3 py-4 space-y-2">
            <Link
              href="/login"
              className="block text-center bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm px-3 py-2 rounded-xl transition-all border border-stone-200 font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-2 rounded-xl transition-all font-medium"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Bottom user row */}
      {session && (
        <div className="p-3 border-t border-stone-200/80">
          <UserMenu username={username} />
        </div>
      )}
    </div>
  )
}
