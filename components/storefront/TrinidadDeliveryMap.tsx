'use client'

import dynamic from 'next/dynamic'

// Leaflet must never render on the server — SSR: false is required
const DeliveryMapInner = dynamic(() => import('./DeliveryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[340px] rounded-2xl bg-[#1A2A1A] border border-blue-500/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3" />
        <p className="text-blue-300 text-sm">Loading delivery map...</p>
      </div>
    </div>
  ),
})

interface Props {
  selectedRegion?: string
}

export function TrinidadDeliveryMap({ selectedRegion }: Props) {
  return <DeliveryMapInner selectedRegion={selectedRegion} />
}
