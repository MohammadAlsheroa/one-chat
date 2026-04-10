import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { DEFAULT_AVATAR } from '@/lib/defaultAvatar'

const MAX_IMAGE_B64 = 2.8 * 1024 * 1024

export async function POST(req: NextRequest) {
  const { email, password, username, image } = await req.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  // Validate image if provided
  if (image != null) {
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }
    if (image.length > MAX_IMAGE_B64) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 2MB.' }, { status: 400 })
    }
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, username, image: image ?? DEFAULT_AVATAR },
  })

  return NextResponse.json({ id: user.id }, { status: 201 })
}
