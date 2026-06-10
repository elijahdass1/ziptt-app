'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-4 text-center">
      <div className="space-y-4 max-w-sm">
        <div className="text-5xl">📦</div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
          You're offline
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Check your internet connection and try again. zip.tt needs a connection to show you the latest products and process orders.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#C9A84C] hover:bg-[#F0C040] text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
