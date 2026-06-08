export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AdminProductForm } from '@/components/admin/AdminProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AdminNewProductPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  const [categories, vendors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.vendor.findMany({ where: { status: 'APPROVED' }, orderBy: { storeName: 'asc' }, select: { id: true, storeName: true } }),
  ])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-[#888] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
            Add Product
          </h1>
          <p className="text-sm text-[#888] mt-0.5">Create a new product listing on behalf of a vendor</p>
        </div>
      </div>
      <AdminProductForm categories={categories} vendors={vendors} />
    </div>
  )
}
