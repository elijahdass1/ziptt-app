// Skeleton shown while the products listing streams in.
export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Heading */}
      <div className="h-7 w-48 bg-[var(--bg-card)] rounded-lg mb-2" />
      <div className="h-4 w-32 bg-[var(--bg-card)] rounded mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
            <div className="aspect-square bg-[var(--bg-card)]" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-full bg-[var(--bg-card)] rounded" />
              <div className="h-3.5 w-2/3 bg-[var(--bg-card)] rounded" />
              <div className="h-4 w-1/3 bg-[var(--bg-card)] rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
