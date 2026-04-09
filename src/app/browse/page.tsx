import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { page?: string }
}

async function getChats(page: number) {
  const limit = 20
  const skip = (page - 1) * limit

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'asc' } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.count(),
  ])

  return { conversations, total, pages: Math.ceil(total / limit) }
}

export default async function BrowsePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const { conversations, total, pages } = await getChats(page)

  return (
    <main className="min-h-[100dvh] bg-stone-50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-4 inline-block">
              OneChat
            </Link>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tighter">Browse conversations</h1>
          </div>
        </div>

        <p className="text-sm text-stone-400 mb-8 font-mono tabular-nums">
          {total.toLocaleString()} public conversations
        </p>

        {/* Notice banner */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-3 mb-10 flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <p className="text-xs text-amber-700">
            All conversations are anonymous. You are seeing them as the public sees them.
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-stone-400 text-sm mb-3">No conversations yet</p>
            <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
              Start the first one
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-stone-200/80">
              {conversations.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className="block py-4 px-2 hover:bg-white -mx-2 rounded-lg transition-all duration-200 group animate-fade-slide-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <p className="text-stone-800 font-medium text-sm group-hover:text-stone-950 transition-colors">
                        {c.forkedFromId && (
                          <span className="text-[9px] text-stone-400 uppercase tracking-wider font-mono mr-2 bg-stone-100 px-1.5 py-0.5 rounded-md">fork</span>
                        )}
                        {c.title}
                      </p>
                      {c.messages[0] && (
                        <p className="text-stone-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {c.messages[0].content}
                        </p>
                      )}
                      <p className="text-stone-300 text-xs mt-2 font-mono tabular-nums">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-300 font-mono shrink-0 tabular-nums mt-0.5">
                      {c._count.messages}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {page > 1 && (
                  <Link
                    href={`/browse?page=${page - 1}`}
                    className="px-4 py-2 bg-white hover:bg-stone-50 active:scale-[0.98] border border-stone-200 rounded-xl text-sm text-stone-700 transition-all font-medium shadow-sm"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-stone-400 text-sm font-mono tabular-nums">
                  {page}/{pages}
                </span>
                {page < pages && (
                  <Link
                    href={`/browse?page=${page + 1}`}
                    className="px-4 py-2 bg-white hover:bg-stone-50 active:scale-[0.98] border border-stone-200 rounded-xl text-sm text-stone-700 transition-all font-medium shadow-sm"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
