'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ziptt] route error:', error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
            Something went wrong
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            An unexpected error occurred. Please try again.
            {error?.digest && (
              <span className="block mt-1 text-xs text-[#555]">Ref: {error.digest}</span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-[#C9A84C] hover:bg-[#F0C040] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="border border-[#333] text-[var(--text-secondary)] hover:border-[#C9A84C] px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Homepage
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
