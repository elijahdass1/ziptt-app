import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatTTD } from '@/lib/utils'
import Link from 'next/link'
import { PlusCircle, Edit, Package } from 'lucide-react'
import { VendorProductActions } from '@/components/vendor/VendorProductActions'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'badge-green', DRAFT: 'badge-gray', OUT_OF_STOCK: 'badge-yellow', ARCHIVED: 'badge-gray',
}

export default async function VendorProductsPage() {
  const session = await getServerSession(authOptions)!
  const vendor = await prisma.vendor.findUnique({ where: { userId: session!.user.id } })
  if (!vendor) return null

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} listings</p>
        </div>
        <Link href="/vendor/products/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h2>
          <p className="text-gray-500 mb-6">Start by adding your first product to the marketplace.</p>
          <Link href="/vendor/products/new" className="btn-primary">Add Your First Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Product</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Price</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Stock</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Status</th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0] ?? ''} alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.soldCount} sold</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{product.category.name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatTTD(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock === 0 ? 'text-red-600 font-semibold' : product.stock <= 5 ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[product.status] ?? 'badge-gray'}>{product.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/vendor/products/${product.id}/edit`}
                        className="text-xs text-gray-500 hover:text-[#D62828] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <VendorProductActions productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
