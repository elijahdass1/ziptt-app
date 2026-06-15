// Skeleton shown while account data loads.
export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-7 w-44 bg-gray-200 rounded-lg mb-8" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
          <div className="h-11 w-32 bg-gray-200 rounded-xl mt-2" />
        </div>
      </div>
    </div>
  )
}
