// Inbox — list of conversations the current user is in.
//
// Works for both customers (threads they started with vendors) and vendors
// (threads buyers started with their store). The API returns viewerRole so
// the UI doesn't have to figure out which side we're on.
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MessageSquare, Store, User as UserIcon } from 'lucide-react'

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/messages')

  // Same logic as the GET /api/conversations route, but inlined for SSR.
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
      vendor: { select: { id: true, slug: true, storeName: true, logo: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, body: true, senderId: true, createdAt: true, readAt: true },
      },
    },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-[#C9A84C]" />
        <h1 className="text-2xl font-bold text-[#F5F0E8]">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-12 text-center">
          <MessageSquare className="h-10 w-10 text-[#9A8F7A] mx-auto mb-3" strokeWidth={1.2} />
          <p className="text-sm text-[#F5F0E8] font-semibold mb-1">No conversations yet</p>
          <p className="text-xs text-[#9A8F7A]">
            Start a chat from any seller&apos;s store page.
          </p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl divide-y divide-[#C9A84C]/10 overflow-hidden">
          {conversations.map((c) => {
            const isMineAsVendor = !!myVendor && c.vendorId === myVendor.id
            const other = isMineAsVendor
              ? { name: c.customer.name ?? 'Customer', image: c.customer.image, kind: 'customer' as const }
              : { name: c.vendor.storeName, image: c.vendor.logo, kind: 'vendor' as const }
            const lastMsg = c.messages[0] ?? null
            const unread = !!lastMsg && lastMsg.senderId !== session.user.id && !lastMsg.readAt
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="h-11 w-11 rounded-full bg-[#1A1A1A] border border-[#C9A84C]/20 flex items-center justify-center overflow-hidden shrink-0">
                  {other.image ? (
                    <img src={other.image} alt="" className="h-full w-full object-cover" />
                  ) : other.kind === 'vendor' ? (
                    <Store className="h-5 w-5 text-[#C9A84C]" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-[#C9A84C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${unread ? 'font-bold text-[#F5F0E8]' : 'font-semibold text-[#F5F0E8]'}`}>
                      {other.name}
                    </p>
                    <span className="text-[10px] text-[#9A8F7A] shrink-0">
                      {new Date(c.lastMessageAt).toLocaleDateString('en-TT', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unread ? 'text-[#F5F0E8] font-semibold' : 'text-[#9A8F7A]'}`}>
                    {lastMsg
                      ? `${lastMsg.senderId === session.user.id ? 'You: ' : ''}${lastMsg.body}`
                      : 'No messages yet'}
                  </p>
                </div>
                {unread && <span className="h-2 w-2 rounded-full bg-[#C9A84C] shrink-0" />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
