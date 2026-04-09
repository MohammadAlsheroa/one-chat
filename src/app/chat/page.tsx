import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/Sidebar'
import { PublicBanner } from '@/components/PublicBanner'
import { ChatInterface } from '@/components/ChatInterface'

export default async function NewChatPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-[100dvh] bg-stone-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <PublicBanner />
        <ChatInterface
          conversationId={null}
          initialMessages={[]}
          isOwner={true}
        />
      </div>
    </div>
  )
}
