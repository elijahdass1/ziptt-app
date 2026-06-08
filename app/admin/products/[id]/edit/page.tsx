export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AdminProductForm } from '@/components/admin/AdminProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  const [product, categories, vendors] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.vendor.findMany({ where: { status: 'APPROVED' }, orderBy: { storeName: 'asc' }, select: { id: true, storeName: true } }),
  ])

  if (!product) notFound()

  const images = typeof product.images === 'string'
    ? JSON.parse(product.images as string) as string[]
    : product.images as unknown as string[]

  const tags = typeof product.tags === 'string'
    ? JSON.parse(product.tags as string) as string[]
    : product.tags as unknown as string[]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-[#888] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
            Edit Product
          </h1>
          <p className="text-sm text-[#888] mt-0.5">{product.name}</p>
        </div>
      </div>
      <AdminProductForm
        categories={categories}
        vendors={vendors}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          images,
          stock: product.stock,
          sku: product.sku,
          tags,
          categoryId: product.categoryId,
          vendorId: product.vendorId,
          status: product.status,
          featured: product.featured,
        }}
      />
    </div>
  )
}
