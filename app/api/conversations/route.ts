// Conversations API — list/create customer↔vendor threads.
//
// GET  /api/conversations          → list threads for the current user
//                                    (works for both customers and vendors)
// POST /api/conversations          → upsert a conversation by (customer, vendor)
//                                    body: { vendorSlug } OR { vendorId }
//
// Threads are the unit of UI state. Messages live at /[id]/messages and are
// polled at ~5s by the chat panel (no websockets in v1).
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // A user can be both a customer (in many threads) AND a vendor (their own
  // store's inbox). Vendor inbox is keyed off Vendor.userId.
  const myVendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { customerId: session.user.id },
        ...(myVendor ? [{ vendorId: myVendor.id }] : []),
      ],
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      customer: { select: { id: true, name: true, image: true } },
      vendor: { select: { id: true, slug: true, storeName: true, logo: true, userId: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, body: true, senderId: true, createdAt: true, readAt: true },
      },
    },
  })

  return NextResponse.json(
    conversations.map((c) => {
      const isMineAsVendor = !!myVendor && c.vendorId === myVendor.id
      const lastMsg = c.messages[0] ?? null
      // Unread = a message exists, it wasn't sent by me, and it's not read.
      const unread = !!lastMsg && lastMsg.senderId !== session.user.id && !lastMsg.readAt
      return {
        id: c.id,
        // From this user's perspective — who is the other party?
        viewerRole: isMineAsVendor ? 'VENDOR' : 'CUSTOMER',
        otherParty: isMineAsVendor
          ? { name: c.customer.name, image: c.customer.image }
          : { name: c.vendor.storeName, image: c.vendor.logo, slug: c.vendor.slug },
        lastMessageAt: c.lastMessageAt,
        lastMessage: lastMsg
          ? { body: lastMsg.body, createdAt: lastMsg.createdAt, fromMe: lastMsg.senderId === session.user.id }
          : null,
        unread,
      }
    })
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorSlug, vendorId } = await req.json()
  if (!vendorSlug && !vendorId) {
    return NextResponse.json({ error: 'vendorSlug or vendorId required' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({
    where: vendorId ? { id: vendorId } : { slug: vendorSlug },
    select: { id: true, userId: true, storeName: true, slug: true, logo: true },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Vendors can't message themselves.
  if (vendor.userId === session.user.id) {
    return NextResponse.json({ error: 'Cannot message your own store' }, { status: 400 })
  }

  // Idempotent: the @@unique([customerId, vendorId]) makes this safe to retry.
  const conversation = await prisma.conversation.upsert({
    where: {
      customerId_vendorId: { customerId: session.user.id, vendorId: vendor.id },
    },
    update: {},
    create: {
      customerId: session.user.id,
      vendorId: vendor.id,
    },
  })

  return NextResponse.json({
    id: conversation.id,
    vendor: { slug: vendor.slug, storeName: vendor.storeName, logo: vendor.logo },
  })
}
