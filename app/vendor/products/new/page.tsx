import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductForm } from '@/components/vendor/ProductForm'

export default async function NewProductPage() {
  const session = await getServerSession(authOptions)!
  const [vendor, categories] = await Promise.all([
    prisma.vendor.findUnique({ where: { userId: session!.user.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500">Fill in the details to list your product on zip.tt</p>
      </div>
      <ProductForm categories={categories} vendorId={vendor?.id ?? ''} />
    </div>
  )
}
