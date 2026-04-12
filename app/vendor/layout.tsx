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

  return (
    <div className="flex min-h-screen" style={{ background: '#0A0A0A' }}>
      {showSidebar && <VendorSidebar vendor={vendor} />}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  )
}
