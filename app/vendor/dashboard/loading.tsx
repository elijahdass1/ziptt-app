// Skeleton shown while the vendor dashboard loads its metrics.
export default function VendorDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-52 bg-gray-200 rounded-lg" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table / list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-1/4 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
