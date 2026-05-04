export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DriverDashboardClient } from './DriverDashboardClient'

// Drivers see this page; everyone else is bounced. Admins can preview by
// flipping their role to DRIVER, or use the admin order-status panel.
export default async function DriverPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/driver')

  const role = session.user.role
  if (role !== 'DRIVER' && role !== 'ADMIN') {
    redirect('/')
  }

  return <DriverDashboardClient driverName={session.user.name ?? 'Driver'} />
}
