import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NavMenu } from '@/components/NavMenu'

export const dynamic = 'force-dynamic'

async function getRecentChats() {
  return prisma.conversation.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      messages: { take: 1, orderBy: { createdAt: 'asc' } },
      _count: { select: { messages: true } },
    },
  })
}

export default async function HomePage() {
  const [session, chats] = await Promise.all([getServerSession(authOptions), getRecentChats()])
  const ctaHref = session ? '/chat' : '/signup'

  return (
    <main className="min-h-[100dvh] bg-stone-50">
      {/* Ambient mesh orbs — fixed, pointer-events-none */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb-1 absolute -top-48 -right-48 w-[640px] h-[640px] rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="orb-2 absolute top-1/2 -left-64 w-[520px] h-[520px] rounded-full bg-amber-50/90 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full bg-sky-50/60 blur-3xl" />
      </div>

      {/* Top nav bar */}
      <div className="relative border-b border-stone-200/80 px-6 md:px-16 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-stone-900 tracking-tight">OneChat</Link>
        <NavMenu />
      </div>

      {/* Hero — asymmetric split */}
      <div className="relative border-b border-stone-200/80">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Left — branding + CTA */}
          <div className="px-6 md:px-16 py-20 md:py-32 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full w-fit mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-xs font-medium tracking-wide uppercase">Public by default</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none text-stone-900 mb-6">
              Every conversation,<br />
              <span className="text-stone-400">visible to everyone.</span>
            </h1>

            <p className="text-base text-stone-500 leading-relaxed max-w-[45ch] mb-10">
              Chat with AI in the open. No hidden threads, no private modes. Everything you write here is anonymous and readable by anyone.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm shadow-sm shadow-emerald-200/80"
              >
                Start a conversation
              </Link>
              <Link
                href="/browse"
                className="bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm border border-stone-200 shadow-sm"
              >
                Browse chats
              </Link>
            </div>
          </div>

          {/* Right — chat preview card */}
          <div className="hidden md:flex items-center justify-center px-16 py-32 border-l border-stone-200/80">
            <div className="w-full max-w-sm space-y-3">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)]">
                {/* User message */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-stone-100 shrink-0 mt-0.5" />
                  <div className="bg-stone-100 rounded-xl px-3 py-2 text-sm text-stone-600">
                    Explain how TCP handshakes work in simple terms
                  </div>
                </div>
                {/* AI message */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 text-sm text-stone-700 leading-relaxed">
                    TCP uses a three-way handshake: SYN, SYN-ACK, ACK. Think of it as two people confirming they can hear each other before starting a conversation...
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                <p className="text-xs text-stone-400">Anonymous &middot; Visible to everyone</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent public chats */}
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-16 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-stone-800 tracking-tight">Recent conversations</h2>
            <p className="text-sm text-stone-400 mt-1">Live feed of public AI chats</p>
          </div>
          <Link href="/browse" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
            View all
          </Link>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm mb-3">No conversations yet.</p>
            <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Be the first
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200/80">
            {chats.map((c, i) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block py-4 px-2 hover:bg-white -mx-2 rounded-lg transition-all duration-200 group animate-fade-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-stone-800 font-medium text-sm group-hover:text-stone-950 transition-colors truncate">
                      {c.forkedFromId && (
                        <span className="text-[9px] text-stone-400 uppercase tracking-wider font-mono mr-2 bg-stone-100 px-1.5 py-0.5 rounded-md">fork</span>
                      )}
                      {c.title}
                    </p>
                    {c.messages[0] && (
                      <p className="text-stone-400 text-xs mt-1 line-clamp-1">
                        {c.messages[0].content.slice(0, 140)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-300 font-mono shrink-0 tabular-nums mt-0.5">
                    {c._count.messages}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
