import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, street, city, region } = await req.json()
  if (!street || !city || !region) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } })

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: label || 'Home',
      street,
      city,
      region,
      isDefault: existingCount === 0,
    },
  })

  return NextResponse.json(address, { status: 201 })
}
