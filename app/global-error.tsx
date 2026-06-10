'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ziptt] unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0A0A0A', color: '#F5F0E8', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#C9A84C' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#9A8F7A', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            An unexpected error occurred. Our team has been notified.
            {error?.digest && (
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#555' }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{ background: '#C9A84C', color: '#000', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ border: '1px solid #333', color: '#9A8F7A', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}
            >
              Back to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
