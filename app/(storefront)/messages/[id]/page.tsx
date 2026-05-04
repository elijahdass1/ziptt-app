// Single-thread message view. Server-side: gate access + fetch initial state,
// then hand off to a client component for the polling loop.
export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MessageThreadClient } from './MessageThreadClient'

export default async function MessageThreadPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/auth/login?callbackUrl=/messages/${params.id}`)

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, image: true } },
      vendor:   { select: { id: true, userId: true, slug: true, storeName: true, logo: true } },
    },
  })
  if (!conversation) notFound()

  const isCustomer = conversation.customerId === session.user.id
  const isVendor   = conversation.vendor.userId === session.user.id
  if (!isCustomer && !isVendor) notFound()

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
  })

  // Mark unread messages from the other party as read on view.
  await prisma.message.updateMany({
    where: {
      conversationId: params.id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  const otherParty = isVendor
    ? {
        name: conversation.customer.name ?? 'Customer',
        image: conversation.customer.image,
        href: null,
      }
    : {
        name: conversation.vendor.storeName,
        image: conversation.vendor.logo,
        href: `/store/${conversation.vendor.slug}`,
      }

  return (
    <MessageThreadClient
      conversationId={params.id}
      currentUserId={session.user.id}
      otherParty={otherParty}
      initialMessages={messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        fromMe: m.senderId === session.user.id,
      }))}
    />
  )
}
