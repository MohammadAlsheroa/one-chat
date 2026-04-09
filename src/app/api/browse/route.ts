import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
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

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      forkedFromId: c.forkedFromId,
      messageCount: c._count.messages,
      preview: c.messages[0]?.content?.slice(0, 120) || '',
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}
