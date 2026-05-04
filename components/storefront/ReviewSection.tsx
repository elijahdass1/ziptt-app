'use client'

import { useState } from 'react'

interface ReviewUser {
  name: string | null
  image: string | null
}

interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  createdAt: string | Date
  user: ReviewUser
}

interface Props {
  productSlug: string
  initialReviews: Review[]
  userSession: { user?: { id?: string; name?: string } } | null
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'text-[#C9A84C]' : 'text-[#444]'} style={{ fontSize: '1rem' }}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="text-2xl focus:outline-none transition-colors"
          style={{ color: s <= (hover || value) ? '#C9A84C' : '#444' }}
          aria-label={`${s} star${s !== 1 ? 's' : ''}`}
        >
          {s <= (hover || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function ReviewSection({ productSlug, initialReviews, userSession }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (body.length < 20) {
      setError('Review body must be at least 20 characters.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to submit review.')
        return
      }
      setSubmitted(true)
      setShowForm(false)
      setTitle('')
      setBody('')
      setRating(5)
    } catch {
      setError('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <div className="border-t border-[var(--bg-card)] pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
              Customer Reviews
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(avgRating)} />
                <span className="text-[#C9A84C] font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-[#888] text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          {userSession?.user && !submitted && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 px-4 py-2 rounded text-sm font-semibold transition-colors"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-6 p-4 bg-[var(--bg-secondary)] border border-[#C9A84C]/30 rounded-lg text-[#C9A84C] text-sm font-medium">
            Review submitted for approval. Thank you!
          </div>
        )}

        {/* Review form */}
        {showForm && !submitted && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-5 bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl space-y-4"
          >
            <h3 className="text-[var(--text-primary)] font-semibold">Your Review</h3>

            <div>
              <label className="block text-xs text-[#888] mb-1">Rating</label>
              <InteractiveStars value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full bg-[var(--bg-primary)] border border-[#333] text-[var(--text-primary)] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm placeholder:text-[#555]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888] mb-1">
                Review <span className="text-[#555]">(min 20 characters)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product…"
                className="w-full bg-[var(--bg-primary)] border border-[#333] text-[var(--text-primary)] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm placeholder:text-[#555] resize-none"
              />
              <p className="text-xs text-[#555] mt-1">{body.length} / 20 min characters</p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-[#C9A84C] text-black hover:bg-[#b8963f] font-semibold px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="py-10 text-center text-[#888]">
            <p className="text-4xl mb-3">★</p>
            <p className="text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="h-9 w-9 rounded-full bg-[#C9A84C] flex items-center justify-center text-sm font-bold text-black shrink-0"
                  >
                    {getInitials(review.user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {review.user.name ?? 'Anonymous'}
                      </span>
                      <span className="text-xs text-[#888]">
                        {new Date(review.createdAt).toLocaleDateString('en-TT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.title && (
                      <p className="text-sm font-bold text-[var(--text-primary)] mt-2">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-[#888] mt-1 leading-relaxed">{review.body}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
