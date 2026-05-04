import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { VendorSidebar } from '@/components/vendor/VendorSidebar'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor')

  const vendor = await prisma.vendor.findFirst({
    where: { userId: session.user.id as string },
  })

  const showSidebar = vendor && (vendor.status === 'APPROVED' || vendor.status === 'ACTIVE')

  // Count products with bad images so the sidebar can show a badge.
  // Cheap COUNT — no need to pull rows.
  const needsPhotosCount = vendor
    ? await prisma.product.count({
        where: {
          vendorId: vendor.id,
          OR: [
            { images: { contains: 'placehold.co' } },
            { images: { contains: 'placeholder.com' } },
            { images: { contains: '/api/product-img' } },
            { images: { contains: 'images.unsplash' } },
            { images: '[]' },
          ],
        },
      })
    : 0

  // Unread customer messages — shows as a red pip on the Inbox link.
  // SSR-only count; the client-side polling on /messages is what keeps
  // the badge fresh once the vendor is on a vendor page.
  const unreadMessages = vendor
    ? await prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: session.user.id as string },
          conversation: { vendorId: vendor.id },
        },
      })
    : 0

  // Unconfirmed orders — shows as a red pip on the Orders link and as
  // an alert banner on the dashboard home. PENDING means the vendor
  // hasn't acted yet; CONFIRMED means they accepted but haven't
  // dispatched. We count both because the vendor needs a nudge until
  // the order leaves their store.
  const unconfirmedOrders = vendor
    ? await prisma.order.count({
        where: {
          vendorId: vendor.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      })
    : 0

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {showSidebar && (
        <VendorSidebar
          vendor={vendor}
          needsPhotosCount={needsPhotosCount}
          unreadMessages={unreadMessages}
          unconfirmedOrders={unconfirmedOrders}
        />
      )}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}
