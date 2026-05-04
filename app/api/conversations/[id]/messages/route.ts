// Messages API for a single conversation.
//
// GET  /api/conversations/[id]/messages?since=<iso>
//   - Returns all messages in the thread; if `since` is provided, only those
//     created after it. The client polls with ?since=<lastSeen> at ~5s for a
//     cheap pseudo-realtime feel.
//
// POST /api/conversations/[id]/messages   body: { body }
//   - Append a new message. Verifies the caller is one of the two
//     participants (customer OR the vendor's underlying user).
//
// Both endpoints check authorization via the participant set. We don't
// trust the client to tell us who they are.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Resolve participant identities once. Returns null when the user has no
// access. Centralised so both verbs apply the same rule.
async function resolveParticipants(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      customerId: true,
      vendor: { select: { id: true, userId: true } },
    },
  })
  if (!conversation) return null
  const isCustomer = conversation.customerId === userId
  const isVendor = conversation.vendor.userId === userId
  if (!isCustomer && !isVendor) return null
  return { conversation, isCustomer, isVendor }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await resolveParticipants(params.id, session.user.id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const since = req.nextUrl.searchParams.get('since')
  const where: { conversationId: string; createdAt?: { gt: Date } } = {
    conversationId: params.id,
  }
  if (since) {
    const t = new Date(since)
    if (!Number.isNaN(t.getTime())) where.createdAt = { gt: t }
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
  })

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      fromMe: m.senderId === session.user.id,
      readAt: m.readAt,
    }))
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ctx = await resolveParticipants(params.id, session.user.id)
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { body } = await req.json()
  const trimmed = typeof body === 'string' ? body.trim() : ''
  if (!trimmed) {
    return NextResponse.json({ error: 'Message body required' }, { status: 400 })
  }
  if (trimmed.length > 2000) {
    return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 })
  }

  // Append message + bump conversation lastMessageAt in one transaction so
  // the inbox sort never lags the actual message timestamps.
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        body: trimmed,
      },
      select: { id: true, body: true, createdAt: true, senderId: true },
    }),
    prisma.conversation.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() },
    }),
  ])

  return NextResponse.json(
    { id: message.id, body: message.body, createdAt: message.createdAt, fromMe: true },
    { status: 201 }
  )
}
