export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)
  let userIdVerified = false
  let userTotalOrders = 0

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { idVerified: true, totalOrders: true },
    })
    userIdVerified = user?.idVerified ?? false
    userTotalOrders = user?.totalOrders ?? 0
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]" /></div>}>
      <CheckoutClient userIdVerified={userIdVerified} userTotalOrders={userTotalOrders} />
    </Suspense>
  )
}
