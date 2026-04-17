import { NextRequest, NextResponse } from 'next/server'

// Category icons and colors
const CAT_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  toys:         { icon: '⬡', color: '#7EC8E3', bg: '#0A1520' },
  electronics:  { icon: '⚡', color: '#4A9EFF', bg: '#0A0F1A' },
  fashion:      { icon: '◈', color: '#FF7EB3', bg: '#1A0A12' },
  'urban-fashion': { icon: '▲', color: '#C9A84C', bg: '#1A1500' },
  carnival:     { icon: '✦', color: '#FF6B35', bg: '#1A0A00' },
  'rum-spirits':{ icon: '◇', color: '#B8860B', bg: '#1A1000' },
  'home-garden':{ icon: '⬢', color: '#4CAF82', bg: '#0A1A10' },
  appliances:   { icon: '◉', color: '#9C88FF', bg: '#100A1A' },
  groceries:    { icon: '◆', color: '#E8B04B', bg: '#1A1200' },
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxLen) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current.trim())
  return lines.slice(0, 3) // max 3 lines
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name    = searchParams.get('name') ?? 'Product'
  const cat     = searchParams.get('cat') ?? 'toys'
  const store   = searchParams.get('store') ?? "D'Best Toys"

  const cfg     = CAT_CONFIG[cat] ?? CAT_CONFIG['toys']
  const lines   = wrapText(name, 22)
  const lineH   = 36
  const textY   = 210 - ((lines.length - 1) * lineH) / 2

  // Truncate store name
  const storeName = store.length > 20 ? store.substring(0, 20) + '…' : store

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0A0A"/>
      <stop offset="100%" style="stop-color:${cfg.bg}"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#C9A84C"/>
      <stop offset="50%" style="stop-color:#F0C040"/>
      <stop offset="100%" style="stop-color:#C9A84C"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${cfg.color};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:${cfg.color};stop-opacity:0"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="600" fill="url(#bg)"/>

  <!-- Subtle glow circle -->
  <circle cx="300" cy="220" r="200" fill="${cfg.color}" opacity="0.06" filter="url(#blur)"/>

  <!-- Border -->
  <rect x="1" y="1" width="598" height="598" rx="16" ry="16" fill="none" stroke="${cfg.color}" stroke-width="1" opacity="0.4"/>
  <rect x="8" y="8" width="584" height="584" rx="12" ry="12" fill="none" stroke="${cfg.color}" stroke-width="0.5" opacity="0.2"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="600" height="4" rx="2" fill="url(#gold)"/>

  <!-- Category icon circle -->
  <circle cx="300" cy="130" r="56" fill="${cfg.color}" opacity="0.1"/>
  <circle cx="300" cy="130" r="52" fill="none" stroke="${cfg.color}" stroke-width="1" opacity="0.4"/>
  <text x="300" y="148" text-anchor="middle" font-family="system-ui, sans-serif"
    font-size="48" fill="${cfg.color}" opacity="0.9">${cfg.icon}</text>

  <!-- Product name -->
  ${lines.map((line, i) =>
    `<text x="300" y="${textY + i * lineH}" text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="${lines[0].length > 18 ? '22' : '26'}" font-weight="700"
      fill="#F5F0E8" opacity="0.95">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</text>`
  ).join('\n  ')}

  <!-- Divider -->
  <rect x="180" y="${textY + lines.length * lineH + 16}" width="240" height="1" fill="url(#gold)" opacity="0.5"/>

  <!-- Store name -->
  <text x="300" y="${textY + lines.length * lineH + 42}"
    text-anchor="middle"
    font-family="system-ui, sans-serif"
    font-size="14" font-weight="600" letter-spacing="1"
    fill="${cfg.color}" opacity="0.8">${storeName.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>

  <!-- Bottom zip.tt branding -->
  <text x="300" y="560" text-anchor="middle"
    font-family="system-ui, sans-serif"
    font-size="12" letter-spacing="3"
    fill="#9A8F7A" opacity="0.5">ZIP.TT</text>

  <!-- Corner accents -->
  <line x1="20" y1="20" x2="44" y2="20" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="20" y1="20" x2="20" y2="44" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="580" y1="20" x2="556" y2="20" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="580" y1="20" x2="580" y2="44" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="20" y1="580" x2="44" y2="580" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="20" y1="580" x2="20" y2="556" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="580" y1="580" x2="556" y2="580" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
  <line x1="580" y1="580" x2="580" y2="556" stroke="${cfg.color}" stroke-width="1.5" opacity="0.4"/>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
