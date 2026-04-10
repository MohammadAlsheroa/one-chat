import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      image: true,
      createdAt: true,
      _count: { select: { conversations: true } },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messageCount = await prisma.message.count({
    where: {
      conversation: { userId: session.user.id },
      role: 'user',
    },
  })

  return NextResponse.json({
    username: user.username,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    conversationCount: user._count.conversations,
    messageCount,
  })
}

const MAX_IMAGE_B64 = 2.8 * 1024 * 1024

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  // Image update branch
  if ('image' in body) {
    const { image } = body
    if (image !== null) {
      if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
      }
      if (image.length > MAX_IMAGE_B64) {
        return NextResponse.json({ error: 'Image too large. Maximum size is 2MB.' }, { status: 400 })
      }
    }
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: image ?? null },
    })
    return NextResponse.json({ success: true })
  }

  // Password update branch
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both passwords required' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hash },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json().catch(() => ({}))
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })

  // Get user's conversation IDs
  const userConvs = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const convIds = userConvs.map((c) => c.id)

  // Nullify forkedFromId on other users' forks that point to this user's convos
  if (convIds.length > 0) {
    await prisma.conversation.updateMany({
      where: { forkedFromId: { in: convIds } },
      data: { forkedFromId: null },
    })
  }

  // Delete user's conversations (messages cascade via onDelete: Cascade)
  await prisma.conversation.deleteMany({ where: { userId: session.user.id } })

  // Delete user
  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ success: true })
}
