import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { AccountForm } from '@/components/account/AccountForm'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/account')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true },
  })

  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>
        <AccountForm user={user} />
      </div>
      <Footer />
    </div>
  )
}
