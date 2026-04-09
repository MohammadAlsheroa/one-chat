import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/Sidebar'
import { PublicBanner } from '@/components/PublicBanner'
import { ChatInterface } from '@/components/ChatInterface'
import { ForkButton } from '@/components/ForkButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function ConversationPage({ params }: Props) {
  const [session, conversation] = await Promise.all([
    getServerSession(authOptions),
    prisma.conversation.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    }),
  ])

  if (!conversation) notFound()

  const isOwner = session?.user?.id === conversation.userId

  return (
    <div className="flex h-[100dvh] bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <PublicBanner />

        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200/80 bg-white shrink-0">
          <h1 className="text-sm font-medium text-stone-700 truncate tracking-tight">{conversation.title}</h1>
          {!isOwner && <ForkButton conversationId={conversation.id} />}
        </div>

        <ChatInterface
          conversationId={conversation.id}
          initialMessages={conversation.messages}
          isOwner={isOwner}
          isForked={!!conversation.forkedFromId}
        />
      </div>
    </div>
  )
}
