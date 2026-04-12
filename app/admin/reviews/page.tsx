import prisma from '@/lib/prisma'
import { Star } from 'lucide-react'
import { AdminReviewActions } from '@/components/admin/AdminReviewActions'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  PENDING:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#444]'}`}
        />
      ))}
    </div>
  )
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status ?? 'PENDING'

  const where = statusFilter ? { status: statusFilter } : {}

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  })

  const pending = await prisma.review.count({ where: { status: 'PENDING' } })

  const tabs = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All', value: '' },
  ]

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
            Reviews
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {pending > 0 ? (
              <span className="text-yellow-400">{pending} pending approval</span>
            ) : (
              'No pending reviews'
            )}
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1a1a1a]">
        {tabs.map((tab) => {
          const active = statusFilter === tab.value
          return (
            <Link
              key={tab.value}
              href={tab.value ? `?status=${tab.value}` : '?'}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-[#888] hover:text-[#F5F0E8]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0A0A0A]">
                {['Reviewer', 'Product', 'Rating', 'Review', 'Status', 'Date', 'Actions'].map((h, i) => (
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
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#555]">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b border-[#1a1a1a] hover:bg-[#0A0A0A] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#F5F0E8]">{review.user.name ?? 'Anonymous'}</p>
                      <p className="text-xs text-[#555]">{review.user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="text-[#C9A84C] hover:underline line-clamp-1 max-w-[180px] block"
                      >
                        {review.product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {review.title && (
                        <p className="font-medium text-[#F5F0E8] line-clamp-1">{review.title}</p>
                      )}
                      {review.body && (
                        <p className="text-xs text-[#888] line-clamp-2">{review.body}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[review.status] ?? 'bg-[#333] text-[#888]'}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#888] whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString('en-TT', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AdminReviewActions reviewId={review.id} currentStatus={review.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
