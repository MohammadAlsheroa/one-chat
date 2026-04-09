import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const original = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!original) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const forked = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: `Fork: ${original.title}`,
      forkedFromId: original.id,
      messages: {
        create: original.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    },
  })

  return NextResponse.json(forked, { status: 201 })
}
