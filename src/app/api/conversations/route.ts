import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      forkedFromId: true,
      createdAt: true,
    },
  })

  return NextResponse.json(conversations)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json().catch(() => ({}))

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: title || 'New Chat',
    },
  })

  return NextResponse.json(conversation, { status: 201 })
}
