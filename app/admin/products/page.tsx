import prisma from '@/lib/prisma'
import { formatTTD } from '@/lib/utils'
import { AdminProductActions } from '@/components/admin/AdminProductActions'
import Image from 'next/image'
import { Search } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border border-green-500/30',
  DRAFT: 'bg-[#333] text-[#888] border border-[#444]',
  ARCHIVED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  OUT_OF_STOCK: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit
  const statusFilter = searchParams.status ?? ''

  const where: Record<string, unknown> = {}
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { vendor: { storeName: { contains: searchParams.q } } },
    ]
  }
  if (statusFilter) where.status = statusFilter

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { storeName: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
          Products
        </h1>
        <p className="text-sm text-[#888] mt-1">{total.toLocaleString()} product{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Search and filter */}
      <form className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search product or vendor…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded placeholder:text-[#555]"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter}
          className="text-sm bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
        <button
          type="submit"
          className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#b8963f] font-semibold px-4 py-2 rounded text-sm transition-colors"
        >
          Filter
        </button>
      </form>

      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0A0A0A]">
                {['Product', 'Vendor', 'Category', 'Price (TTD)', 'Stock', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-medium text-[#555] uppercase tracking-wide ${
                      i === 6 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#555]">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const images = typeof product.images === 'string'
                    ? JSON.parse(product.images as string) as string[]
                    : product.images as unknown as string[]
                  return (
                    <tr key={product.id} className="border-b border-[#1a1a1a] hover:bg-[#0A0A0A] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {images[0] ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a]">
                              <Image src={images[0]} alt={product.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-[#F5F0E8] line-clamp-1">{product.name}</p>
                            <p className="text-xs text-[#555]">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#888]">{product.vendor.storeName}</td>
                      <td className="px-5 py-3 text-xs text-[#888]">{product.category?.name ?? '—'}</td>
                      <td className="px-5 py-3 font-medium text-[#F5F0E8]">{formatTTD(product.price)}</td>
                      <td className="px-5 py-3 text-[#888]">{product.stock}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[product.status] ?? 'bg-[#333] text-[#888]'}`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <AdminProductActions productId={product.id} currentStatus={product.status} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-[#1a1a1a] flex items-center justify-between">
            <p className="text-xs text-[#888]">Page {page} of {pages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(statusFilter ? { status: statusFilter } : {}), page: String(page - 1) })}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors"
                >
                  Prev
                </a>
              )}
              {page < pages && (
                <a
                  href={`?${new URLSearchParams({ ...(searchParams.q ? { q: searchParams.q } : {}), ...(statusFilter ? { status: statusFilter } : {}), page: String(page + 1) })}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
