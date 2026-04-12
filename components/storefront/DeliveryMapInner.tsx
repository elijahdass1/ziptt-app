'use client'

import { useEffect, useRef } from 'react'

// ── Delivery zones: established residential/commercial areas ──────────────
export const DELIVERY_ZONES = [
  // PORT OF SPAIN — split into precise sub-zones (west & north only)
  { region: 'Port of Spain',  name: 'Woodbrook / Newtown',        lat: 10.6545, lng: -61.5200, radius: 1350, eta: '1–2 days', note: 'Woodbrook, Newtown, Bournes Road' },
  { region: 'Port of Spain',  name: 'St. Clair / Ellerslie Park', lat: 10.6640, lng: -61.5230, radius: 1200, eta: '1–2 days', note: "St. Clair, Ellerslie Park, Queen's Park West" },
  { region: 'Port of Spain',  name: 'St. James',                  lat: 10.6600, lng: -61.5380, radius: 1100, eta: '1–2 days', note: 'St. James, Mucurapo, Western Main Road' },
  { region: 'Port of Spain',  name: 'Federation Park / Cascade',  lat: 10.6730, lng: -61.5130, radius: 1100, eta: '1–2 days', note: 'Federation Park, Upper Cascade, Long Circular upper' },
  { region: 'Maraval',        name: 'Maraval',                    lat: 10.6850, lng: -61.5270, radius: 2200, eta: '1–2 days', note: 'Maraval Valley, Glencoe, Long Circular' },
  // WEST
  { region: 'Westmoorings',   name: 'Westmoorings',               lat: 10.6760, lng: -61.5520, radius: 2400, eta: '1–2 days', note: 'Westmoorings, Goodwood Park, West Mall area' },
  { region: 'Diego Martin',   name: 'Diego Martin',               lat: 10.7010, lng: -61.5647, radius: 3400, eta: '1–2 days', note: 'Diego Martin, Petit Valley, River Estate' },
  { region: 'Carenage',       name: 'Carenage',                   lat: 10.6960, lng: -61.5820, radius: 2200, eta: '1–2 days', note: 'Carenage, Covigne, Chaguaramas' },
  // EAST–WEST CORRIDOR
  { region: 'Champ Fleurs',   name: 'Champ Fleurs / Mt. Hope',    lat: 10.6460, lng: -61.4200, radius: 1800, eta: '1–2 days', note: 'Champ Fleurs, Mt. Hope, El Socorro North' },
  { region: 'Valsayn',        name: 'Valsayn / Curepe',           lat: 10.6290, lng: -61.4050, radius: 2600, eta: '1–2 days', note: 'Valsayn North & South, Curepe, St. Joseph' },
  { region: 'Tunapuna',       name: 'Tunapuna / Tacarigua',       lat: 10.6430, lng: -61.3830, radius: 2800, eta: '2–3 days', note: 'Tunapuna, Tacarigua, El Dorado' },
  { region: 'Trincity',       name: 'Trincity / Piarco',          lat: 10.5990, lng: -61.3500, radius: 2400, eta: '2–3 days', note: 'Trincity Mall area, Piarco' },
  { region: 'Arima',          name: 'Arima',                      lat: 10.6368, lng: -61.2830, radius: 2800, eta: '2–3 days', note: 'Arima, Calvary Hill, Tumpuna Road' },
  // CENTRAL — tightened to highway corridor & established estates
  { region: 'Chaguanas',      name: 'Chaguanas',                  lat: 10.5220, lng: -61.4000, radius: 3200, eta: '2–3 days', note: 'Chaguanas, Endeavour, Highway commercial strip' },
  { region: 'Couva',          name: 'Couva',                      lat: 10.4190, lng: -61.4500, radius: 3000, eta: '2–3 days', note: 'Couva, Preysal, Claxton Bay' },
  // SOUTH — tightened to established districts
  { region: 'San Fernando',   name: 'San Fernando North',         lat: 10.2950, lng: -61.4630, radius: 2600, eta: '2–3 days', note: 'San Fernando, Pleasantville, Paradise Pastures' },
  { region: 'San Fernando',   name: 'La Romaine / Gulf City',     lat: 10.2620, lng: -61.4560, radius: 2200, eta: '2–3 days', note: 'La Romaine, Gulf City Mall area, Corinth' },
]

export const AVAILABLE_REGIONS = [...new Set(DELIVERY_ZONES.map((z) => z.region))]

interface Props {
  selectedRegion?: string
}

export default function DeliveryMapInner({ selectedRegion }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circlesRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Dynamically import Leaflet to avoid SSR
    import('leaflet').then((L) => {
      // Inject Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Guard: bail if another render already set up the map
      if (leafletMapRef.current) return

      // React StrictMode double-invokes effects: cleanup calls map.remove() but
      // Leaflet leaves _leaflet_id stamped on the DOM node. Delete it so L.map()
      // doesn't throw "Map container is already initialized."
      const container = mapRef.current! as HTMLDivElement & { _leaflet_id?: number }
      delete container._leaflet_id

      // Fix default marker icon paths broken by webpack
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Trinidad centre
      const map = L.map(mapRef.current!, {
        center: [10.52, -61.31],
        zoom: 10,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      // Dark CartoDB tile layer — matches the black & gold brand
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OSM',
        maxZoom: 19,
      }).addTo(map)

      leafletMapRef.current = map

      // Draw circles for each delivery zone
      DELIVERY_ZONES.forEach((zone) => {
        const isSelected = zone.region === selectedRegion
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: isSelected ? 0.45 : 0.22,
          weight: isSelected ? 2.5 : 1.2,
          opacity: isSelected ? 1 : 0.7,
        })
          .addTo(map)
          .bindTooltip(
            `<div style="font-size:12px;line-height:1.5">
              <strong style="color:#2563eb">${zone.name}</strong><br/>
              <span style="color:#555">${zone.note}</span><br/>
              <span style="color:#16a34a;font-weight:600">🚚 ${zone.eta}</span>
            </div>`,
            { sticky: true, direction: 'top' }
          )
        circlesRef.current.push({ zone, circle })
      })
    })

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
      circlesRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pan and highlight when selected region changes
  useEffect(() => {
    if (!leafletMapRef.current || !selectedRegion) return
    import('leaflet').then((L) => {
      const zone = DELIVERY_ZONES.find((z) => z.region === selectedRegion)
      if (zone) {
        leafletMapRef.current.flyTo([zone.lat, zone.lng], 13, { duration: 1.2 })
      }
      // Update circle styles
      circlesRef.current.forEach(({ zone: z, circle }) => {
        const sel = z.region === selectedRegion
        circle.setStyle({
          fillOpacity: sel ? 0.45 : 0.22,
          weight: sel ? 2.5 : 1.2,
          opacity: sel ? 1 : 0.7,
        })
      })
    })
  }, [selectedRegion])

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_24px_rgba(59,130,246,0.08)]">
      {/* Legend bar */}
      <div className="bg-[#0D1B2A] border-b border-blue-500/20 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500 opacity-80" />
            <span className="text-blue-200 font-medium">Delivery zone</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 italic">Hover a zone for details · Select region to zoom</span>
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ height: '340px', width: '100%', background: '#0D1B2A' }} />

      {/* Footer note */}
      <div className="bg-[#0D1B2A] border-t border-blue-500/20 px-4 py-2 text-center">
        <p className="text-[11px] text-slate-500">
          Need delivery outside these zones?{' '}
          <span className="text-blue-400">Contact us at support@zip.tt</span>
          {' '}for special arrangements.
        </p>
      </div>
    </div>
  )
}
