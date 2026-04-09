'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function ForkButton({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function fork() {
    if (!session) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/fork`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/chat/${data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={fork}
      disabled={loading}
      className="flex items-center gap-2 bg-white hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 text-stone-700 text-sm px-4 py-2 rounded-xl transition-all border border-stone-200 font-medium shadow-sm"
    >
      <svg className="w-3.5 h-3.5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v10M7 17L17 7" />
      </svg>
      {loading ? 'Copying...' : 'Copy & continue'}
    </button>
  )
}
