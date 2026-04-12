export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { VendorSettingsForm } from '@/components/vendor/VendorSettingsForm'

export default async function VendorSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) redirect('/vendor/register')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store profile and information</p>
      </div>
      <VendorSettingsForm vendor={vendor} />
    </div>
  )
}
