import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductDetail } from '@/components/storefront/ProductDetail'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ReviewSection } from '@/components/storefront/ReviewSection'

interface PageProps { params: { slug: string } }

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      vendor: true,
      category: true,
    },
  })
}

async function getReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: 'APPROVED' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: { images: [product.images[0]] },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const [product, session] = await Promise.all([
    getProduct(params.slug),
    getServerSession(authOptions),
  ])
  if (!product) notFound()

  const [reviews, related] = await Promise.all([
    getReviews(product.id),
    prisma.product.findMany({
      where: { categoryId: product.categoryId, status: 'ACTIVE', NOT: { id: product.id } },
      take: 4,
      include: { category: { select: { name: true, slug: true } }, vendor: { select: { storeName: true, slug: true } } },
    }),
  ])

  // Compute average rating from approved reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
      : product.rating

  // Enrich product with computed avg rating for display
  const productWithRating = { ...product, rating: avgRating }

  const serialisedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.name, image: r.user.image },
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <ProductDetail product={{ ...productWithRating, reviews }} />

      <ReviewSection
        productSlug={params.slug}
        initialReviews={serialisedReviews}
        userSession={session ? { user: { id: session.user.id, name: session.user.name ?? undefined } } : null}
      />

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[#F5F0E8] mb-6">More from {product.category?.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
