/**
 * Fix missing images for iWorld TT Apple products
 * Re-scrapes listing pages + product pages with improved extraction
 * Falls back to curated Apple product images for remaining gaps
 * Run: node prisma/fix-iworld-images.mjs
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const require  = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.join(__dirname, 'dev.db')

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function fullSizeImage(url) {
  return url.replace(/\/(\d+x\d+x\d+)\//, '/')
}

async function fetchPage(url, retries = 4) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  }
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) })
      if (res.status === 404) return null
      if (!res.ok) { await sleep(2000 * i); continue }
      return await res.text()
    } catch (e) {
      if (i < retries) await sleep(2500 * i)
    }
  }
  return null
}

/** Extract all images from a product page using multiple strategies */
function extractImagesFromPage(html) {
  const images = new Set()

  // 1. JSON-LD structured data  (<script type="application/ld+json">)
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1])
      const addFromObj = obj => {
        if (!obj) return
        const imgs = Array.isArray(obj.image) ? obj.image : (obj.image ? [obj.image] : [])
        imgs.forEach(img => {
          const u = typeof img === 'string' ? img : img?.url
          if (u && u.startsWith('http')) images.add(u.split('?')[0])
        })
        if (Array.isArray(obj['@graph'])) obj['@graph'].forEach(addFromObj)
      }
      addFromObj(data)
    } catch {}
  }

  // 2. Open Graph og:image
  const og = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
           || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i)
  if (og) images.add(og[1].split('?')[0])

  // 3. Lightspeed CDN — broad, no extension required (catches AVIF, WEBP, etc.)
  for (const m of html.matchAll(/https:\/\/cdn\.shoplightspeed\.com\/shops\/622137\/files\/\d+\/[^"'\s,\\]+/gi)) {
    const u = fullSizeImage(m[0].split('?')[0])
    if (!u.includes('/themes/') && !u.includes('/assets/') && /\.(jpg|jpeg|png|webp|avif)/i.test(u))
      images.add(u)
  }

  // 4. data-src / data-lazy / data-zoom-image attributes
  for (const m of html.matchAll(/data-(?:src|lazy-src|zoom-image|original)="(https?:[^"]+\.(?:jpg|jpeg|png|webp|avif))"/gi)) {
    const u = fullSizeImage(m[1].split('?')[0])
    if (!u.includes('/themes/') && !u.includes('/assets/')) images.add(u)
  }

  // 5. srcset — pick highest-width variant
  for (const m of html.matchAll(/srcset="([^"]+)"/gi)) {
    let best = null, bestW = 0
    for (const entry of m[1].split(',')) {
      const parts = entry.trim().split(/\s+/)
      if (parts.length < 2) continue
      const w = parseInt(parts[1])
      if (w > bestW && /cdn\.shoplightspeed/.test(parts[0])) { bestW = w; best = parts[0] }
    }
    if (best) {
      const u = fullSizeImage(best.split('?')[0])
      if (!u.includes('/themes/') && !u.includes('/assets/')) images.add(u)
    }
  }

  return [...images].slice(0, 6)
}

/** Extract listing-page thumbnail from a product card block */
function extractListingImage(block) {
  // data-src
  const dsM = block.match(/data-(?:src|lazy-src|zoom-image)="(https?:[^"]+\.(?:jpg|jpeg|png|webp|avif))"/i)
  if (dsM) return fullSizeImage(dsM[1].split('?')[0])

  // srcset — best width
  const ssM = block.match(/srcset="([^"]+)"/)
  if (ssM) {
    let best = null, bestW = 0
    for (const entry of ssM[1].split(',')) {
      const parts = entry.trim().split(/\s+/)
      if (parts.length < 2) continue
      const w = parseInt(parts[1])
      if (w > bestW) { bestW = w; best = parts[0] }
    }
    if (best) return fullSizeImage(best.split('?')[0])
  }

  // regular src
  const srcM = block.match(/src="(https?:[^"]+\.(?:jpg|jpeg|png|webp|avif))"/i)
  if (srcM && !srcM[1].includes('/themes/') && !srcM[1].includes('/assets/'))
    return fullSizeImage(srcM[1].split('?')[0])

  // Lightspeed CDN pattern (with dimension segment)
  const cdnM = block.match(/cdn\.shoplightspeed\.com\/shops\/622137\/files\/(\d+)\/[\d]+x[\d]+x[\d]+\/([^"'\s]+\.(?:jpg|jpeg|png|webp))/i)
  if (cdnM) return `https://cdn.shoplightspeed.com/shops/622137/files/${cdnM[1]}/${cdnM[2]}`

  return null
}

// ── Curated Apple product fallback images (Unsplash, royalty-free) ────────────
const FALLBACKS = [
  // Major devices — specific matches first
  { test: /iphone\s*1[5-9]|iphone\s*air|iphone\s*[2-9]\d/i,
    img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80' },
  { test: /iphone/i,
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80' },
  { test: /apple watch ultra/i,
    img: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80' },
  { test: /apple watch/i,
    img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80' },
  { test: /imac/i,
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { test: /macbook/i,
    img: 'https://images.unsplash.com/photo-1484788984921-03950022c38b?w=800&q=80' },
  { test: /ipad/i,
    img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
  { test: /airpods max/i,
    img: 'https://images.unsplash.com/photo-1610374792793-f016b77ca51a?w=800&q=80' },
  { test: /airpods|earpods/i,
    img: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80' },
  { test: /magic keyboard/i,
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80' },
  { test: /magic trackpad/i,
    img: 'https://images.unsplash.com/photo-1562976526-82df2dc5a7c7?w=800&q=80' },
  { test: /magic mouse/i,
    img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80' },
  { test: /apple tv/i,
    img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834b?w=800&q=80' },
  { test: /airtag/i,
    img: 'https://images.unsplash.com/photo-1621768216002-5ac171465927?w=800&q=80' },
  { test: /pencil/i,
    img: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80' },
  { test: /cable|adapter|charger|converter|connector|thunderbolt|lightning|magsafe|usb|vga|dvi|hdmi/i,
    img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80' },
  { test: /polishing cloth/i,
    img: 'https://images.unsplash.com/photo-1621768216002-5ac171465927?w=800&q=80' },
  { test: /itunes|gift card/i,
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
  // Catch-all Apple
  { test: /.*/,
    img: 'https://images.unsplash.com/photo-1621768216002-5ac171465927?w=800&q=80' },
]

function getFallback(name) {
  for (const { test, img } of FALLBACKS) {
    if (test.test(name)) return img
  }
  return FALLBACKS[FALLBACKS.length - 1].img
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const db = new Database(DB_PATH)

  const vendor = db.prepare("SELECT id FROM Vendor WHERE slug = 'iworld-tt'").get()
  if (!vendor) { console.error('iWorld TT vendor not found'); process.exit(1) }

  // Find all products with empty/missing images
  const emptyRows = db.prepare(
    `SELECT id, name, slug FROM Product
     WHERE vendorId = ? AND (images = '[]' OR images = '' OR images IS NULL)`
  ).all(vendor.id)

  console.log(`\niWorld TT vendor: ${vendor.id}`)
  console.log(`Products with no images: ${emptyRows.length}\n`)
  if (emptyRows.length === 0) { console.log('Nothing to fix!'); db.close(); return }

  // ── Step 1: Re-scrape listing pages to collect product URLs + thumbnails ──
  console.log('Step 1: Re-scraping Apple listing pages...')
  // Map: normalised name fragment → { url, listingImg }
  const urlMap = new Map()

  for (let page = 1; page <= 20; page++) {
    const url = page === 1
      ? 'https://www.iworldtt.com/brands/apple/'
      : `https://www.iworldtt.com/brands/apple/page${page}.html`

    process.stdout.write(`  Page ${page}... `)
    const html = await fetchPage(url)
    if (!html) { console.log('failed'); break }

    const blocks = html.split(/(?=<(?:li|div)[^>]*class="[^"]*prod-card[^"]*")/g)
    let found = 0
    for (const block of blocks) {
      const linkM = block.match(/href="(https?:\/\/www\.iworldtt\.com\/[^"]+\.html)"/)
      const titleM = block.match(/class="[^"]*product-card__title[^"]*"[^>]*>([\s\S]*?)<\/(?:a|h1|h2|div|span)>/)
      if (!linkM || !titleM) continue
      const rawName = titleM[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()
      const listingImg = extractListingImage(block)
      urlMap.set(rawName.toLowerCase(), { url: linkM[1], listingImg, rawName })
      found++
    }
    console.log(`${found} entries`)
    if (!html.includes(`page${page + 1}.html`)) break
    await sleep(400)
  }
  console.log(`  Collected ${urlMap.size} product URLs\n`)

  // Helper: find best URL match by name similarity
  function findEntry(productName) {
    const pn = productName.toLowerCase()
    // Exact match
    if (urlMap.has(pn)) return urlMap.get(pn)
    // Substring match (product name contains key, or key contains product name)
    for (const [key, entry] of urlMap.entries()) {
      const minLen = Math.min(pn.length, key.length)
      const prefix = Math.min(40, minLen)
      if (pn.substring(0, prefix) === key.substring(0, prefix)) return entry
      if (pn.includes(key.substring(0, 30)) || key.includes(pn.substring(0, 30))) return entry
    }
    return null
  }

  // ── Step 2: Fix each product ─────────────────────────────────────────────
  console.log('Step 2: Fetching images for each empty product...\n')
  const update = db.prepare('UPDATE Product SET images = ?, updatedAt = ? WHERE id = ?')
  const now = new Date().toISOString()

  let fromPage = 0, fromListing = 0, fromFallback = 0

  for (let i = 0; i < emptyRows.length; i++) {
    const p = emptyRows[i]
    process.stdout.write(`  [${i + 1}/${emptyRows.length}] ${p.name.substring(0, 52).padEnd(52)} `)

    const entry = findEntry(p.name)
    let images = []

    // A) Try product page with improved extraction
    if (entry?.url) {
      await sleep(500)
      const html = await fetchPage(entry.url)
      if (html) images = extractImagesFromPage(html)
    }

    if (images.length > 0) {
      update.run(JSON.stringify(images), now, p.id)
      console.log(`→ ✓ ${images.length} img(s) from product page`)
      fromPage++
      continue
    }

    // B) Use listing page thumbnail
    if (entry?.listingImg) {
      update.run(JSON.stringify([entry.listingImg]), now, p.id)
      console.log(`→ ⚡ listing thumbnail`)
      fromListing++
      continue
    }

    // C) Curated fallback
    const fb = getFallback(p.name)
    update.run(JSON.stringify([fb]), now, p.id)
    console.log(`→ 🖼  fallback (${p.name.match(/iphone|watch|mac|ipad|airpod|pencil|cable|adapter/i)?.[0] || 'apple'})`)
    fromFallback++
  }

  db.close()
  console.log(`
✅  Done fixing images!
   From product page : ${fromPage}
   From listing thumb: ${fromListing}
   From fallback     : ${fromFallback}
   Total fixed       : ${emptyRows.length}
`)
}

main().catch(e => { console.error(e); process.exit(1) })
