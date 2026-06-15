// Skeleton shown while the vendor directory streams in.
export default function VendorsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-7 w-56 bg-[var(--bg-card)] rounded-lg mb-2" />
      <div className="h-4 w-40 bg-[var(--bg-card)] rounded mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[#C9A84C]/10 rounded-2xl overflow-hidden">
            <div className="aspect-[16/6] bg-[var(--bg-card)]" />
            <div className="p-4 -mt-8 relative">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--bg-primary)] shrink-0" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-4 w-2/3 bg-[var(--bg-card)] rounded" />
                  <div className="h-3 w-1/3 bg-[var(--bg-card)] rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-[var(--bg-card)] rounded mt-4" />
              <div className="h-3 w-4/5 bg-[var(--bg-card)] rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
