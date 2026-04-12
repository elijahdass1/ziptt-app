export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductForm } from '@/components/vendor/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) redirect('/vendor/register')

  const [product, categories] = await Promise.all([
    prisma.product.findFirst({ where: { id: params.id, vendorId: vendor.id } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: 'asc' } }),
  ])

  if (!product) redirect('/vendor/products')

  // Parse JSON string fields for ProductForm
  const parseJsonArr = (val: string): string[] => {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  const productForForm = {
    ...product,
    images: parseJsonArr(product.images),
    tags: parseJsonArr(product.tags),
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">Update your product listing</p>
      </div>
      <ProductForm categories={categories} vendorId={vendor.id} product={productForForm} />
    </div>
  )
}
