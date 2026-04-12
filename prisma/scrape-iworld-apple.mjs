/**
 * iWorld TT — Apple products scraper
 * Scrapes all Apple products from https://www.iworldtt.com/brands/apple/
 * Run:  node prisma/scrape-iworld-apple.mjs
 */

import { createRequire } from 'module'
import { randomBytes }   from 'crypto'
import path              from 'path'
import { fileURLToPath } from 'url'

const require  = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.join(__dirname, 'dev.db')

// ── Category IDs ────────────────────────────────────────────────────────────
const CATS = {
  electronics:  'cmn5kf9zc0001o0cnpig52r4k',  // Electronics
  fashion:      'cmn5kf9zl0002o0cnyob6j5xq',  // Fashion & Clothing (accessories/cases)
}

function uid() { return 'c' + randomBytes(11).toString('hex') }

function makeSlug(title) {
  return 'iworld-' + title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 90)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function decodeHtml(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&nbsp;/g,' ').trim()
}

/** Strip dimension segment from Lightspeed CDN URL: /files/ID/WxHx2/name.jpg → /files/ID/name.jpg */
function fullSizeImage(url) {
  return url.replace(/\/(\d+x\d+x\d+)\//, '/')
}

/** Infer category from product title */
function inferCategory(title) {
  const t = title.toLowerCase()
  if (/case|band|strap|cover|screen.?protect|charger|cable|adapter|keyboard|pencil|earpod|airpod|watch.?accessories/.test(t))
    return CATS.fashion
  return CATS.electronics
}

// ── Parse product cards from listing page HTML ────────────────────────────────
function parseListingPage(html) {
  const products = []

  // Split on product card containers
  // Each card has a link, title (product-card__title), price (prod-card__price), and image
  const blocks = html.split(/(?=<(?:li|div)[^>]*class="[^"]*prod-card[^"]*")/g)

  for (const block of blocks) {
    if (!block.includes('prod-card__price') && !block.includes('product-card__title')) continue

    // Link
    const linkM = block.match(/href="(https?:\/\/www\.iworldtt\.com\/[^"]+\.html)"/)
    if (!linkM) continue
    const link = linkM[1]

    // Title
    const titleM = block.match(/class="[^"]*product-card__title[^"]*"[^>]*>([\s\S]*?)<\/(?:a|h1|h2|div|span)>/)
    if (!titleM) continue
    const name = decodeHtml(titleM[1].replace(/<[^>]+>/g, '').trim())
    if (!name) continue

    // Price — TT$X,XXX.XX inside <ins class="prod-card__price">
    const priceM = block.match(/(?:prod-card__price|price)[^>]*>[\s\S]*?TT\$\s*([\d,]+\.?\d*)/)
    const price = priceM ? Math.round(parseFloat(priceM[1].replace(/,/g, ''))) : 0

    // Compare price — inside <del>
    const delM = block.match(/<del[^>]*>[\s\S]*?TT\$\s*([\d,]+\.?\d*)/)
    const comparePrice = delM ? Math.round(parseFloat(delM[1].replace(/,/g, ''))) : null

    // Image — largest CDN thumbnail on the listing page (strip dimensions for full size)
    const imgM = block.match(/cdn\.shoplightspeed\.com\/shops\/622137\/files\/(\d+)\/([\d]+x[\d]+x[\d]+)\/([^"'\s]+\.(?:jpg|jpeg|png|webp))/)
    const img = imgM
      ? `https://cdn.shoplightspeed.com/shops/622137/files/${imgM[1]}/${imgM[3]}`
      : null

    products.push({ name, link, price, comparePrice, img })
  }

  return products
}

// ── Fetch individual product page for extra images ────────────────────────────
async function fetchProductImages(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return []
    const html = await res.text()
    // All unique CDN image URLs (full size, not dimension variants)
    const allImgs = [...html.matchAll(/https:\/\/cdn\.shoplightspeed\.com\/shops\/622137\/files\/\d+\/[^"'\s,]+\.(?:jpg|jpeg|png|webp)/gi)]
      .map(m => fullSizeImage(m[0].split('?')[0]))
      .filter(u => !u.includes('/themes/') && !u.includes('/assets/'))
    return [...new Set(allImgs)].slice(0, 5)
  } catch {
    return []
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const db  = new Database(DB_PATH)
  const now = new Date().toISOString()

  // ── Create or find iWorld vendor ─────────────────────────────────────────
  let vendor = db.prepare("SELECT id FROM Vendor WHERE slug = 'iworld-tt'").get()
  if (!vendor) {
    console.log('Creating iWorld TT vendor...')
    const userId   = uid()
    const vendorId = uid()
    db.prepare(`INSERT INTO User (id, name, email, emailVerified, image, password, phone, role, status, createdAt, updatedAt)
      VALUES (@id,'iWorld TT','iworld@zip.tt',NULL,NULL,'$2b$10$placeholder',NULL,'VENDOR','ACTIVE',@now,@now)`)
      .run({ id: userId, now })
    db.prepare(`INSERT INTO Vendor (id, userId, storeName, slug, description, logo, banner, phone, address, region, status, rating, totalSales, commission, bankInfo, createdAt, updatedAt)
      VALUES (@id,@userId,'iWorld TT','iworld-tt','Trinidad & Tobago''s only authorised Apple reseller. iPhones, Macs, iPads, AirPods, Apple Watch and accessories.',NULL,NULL,NULL,NULL,'Port of Spain','ACTIVE',0,0,0.1,NULL,@now,@now)`)
      .run({ id: vendorId, userId, now })
    vendor = { id: vendorId }
    console.log('  Created vendor:', vendorId)
  } else {
    console.log('Vendor exists:', vendor.id)
  }
  const VENDOR_ID = vendor.id

  // Clear existing
  const existingIds = db.prepare('SELECT id FROM Product WHERE vendorId = ?').all(VENDOR_ID).map(r => r.id)
  if (existingIds.length) {
    const ph = existingIds.map(() => '?').join(',')
    db.prepare(`DELETE FROM CartItem  WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM OrderItem WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Review    WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Product   WHERE vendorId  = ?`).run(VENDOR_ID)
    console.log(`Cleared ${existingIds.length} old products.`)
  }

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO Product
      (id, vendorId, categoryId, name, slug, description,
       price, comparePrice, images, stock, sku, tags, status,
       featured, rating, reviewCount, soldCount, weight, createdAt, updatedAt)
    VALUES
      (@id, @vendorId, @categoryId, @name, @slug, @description,
       @price, @comparePrice, @images, @stock, @sku, @tags, @status,
       @featured, @rating, @reviewCount, @soldCount, @weight, @createdAt, @updatedAt)
  `)

  // ── Step 1: Collect all Apple product cards from listing pages ──────────
  console.log('\nStep 1: Collecting product listing from brand pages...')
  const productMap = new Map() // url → {name, price, comparePrice, img}

  for (let page = 1; page <= 20; page++) {
    const url = page === 1
      ? 'https://www.iworldtt.com/brands/apple/'
      : `https://www.iworldtt.com/brands/apple/page${page}.html`

    process.stdout.write(`  Page ${page}... `)
    let html = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(15_000),
        })
        if (res.status === 404) { process.stdout.write('404\n'); html = null; break }
        if (!res.ok) { await sleep(2000); continue }
        html = await res.text()
        break
      } catch (e) { await sleep(2000 * attempt) }
    }
    if (!html) break

    const products = parseListingPage(html)
    products.forEach(p => { if (!productMap.has(p.link)) productMap.set(p.link, p) })
    console.log(`${products.length} products (total unique: ${productMap.size})`)

    if (!html.includes(`page${page + 1}.html`)) break
    await sleep(500)
  }

  console.log(`\nTotal unique Apple products: ${productMap.size}`)

  // ── Step 2: For each product, fetch full-size images ────────────────────
  console.log('\nStep 2: Fetching product pages for full-size images...')
  const usedSlugs  = new Set()
  let totalInserted = 0, totalSkipped = 0

  const allProducts = [...productMap.values()]

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i]
    process.stdout.write(`  [${i+1}/${allProducts.length}] ${p.name.substring(0,50)}... `)

    // Get full-size images from product page
    let images = await fetchProductImages(p.link)
    // Fallback: use listing page thumbnail
    if (images.length === 0 && p.img) images = [p.img]

    // Build slug
    let productSlug = makeSlug(p.name)
    if (usedSlugs.has(productSlug)) productSlug = productSlug.substring(0, 80) + '-' + uid().slice(0, 5)
    usedSlugs.add(productSlug)

    if (db.prepare('SELECT 1 FROM Product WHERE slug = ?').get(productSlug)) {
      console.log('SKIP (exists)')
      totalSkipped++
      continue
    }

    // Infer tags from name
    const nameLower = p.name.toLowerCase()
    const tags = []
    if (nameLower.includes('iphone')) tags.push('iphone', 'apple', 'smartphone')
    else if (nameLower.includes('ipad')) tags.push('ipad', 'apple', 'tablet')
    else if (nameLower.includes('macbook') || nameLower.includes('imac')) tags.push('mac', 'apple', 'laptop')
    else if (nameLower.includes('airpods') || nameLower.includes('earpods')) tags.push('airpods', 'apple', 'audio')
    else if (nameLower.includes('watch')) tags.push('apple-watch', 'apple', 'wearable')
    else if (nameLower.includes('apple tv')) tags.push('apple-tv', 'apple', 'streaming')
    else tags.push('apple', 'accessories')

    try {
      insertProduct.run({
        id: uid(), vendorId: VENDOR_ID,
        categoryId: inferCategory(p.name),
        name: p.name, slug: productSlug, description: '',
        price: p.price,
        comparePrice: p.comparePrice && p.comparePrice > p.price ? p.comparePrice : null,
        images: JSON.stringify(images),
        stock: 5, sku: null,
        tags: JSON.stringify(tags), status: 'ACTIVE',
        featured: 0, rating: 0, reviewCount: 0, soldCount: 0, weight: null,
        createdAt: now, updatedAt: now,
      })
      console.log(`✓ $${p.price} | ${images.length} imgs`)
      totalInserted++
    } catch (e) {
      console.log(`ERR: ${e.message}`)
      totalSkipped++
    }

    await sleep(400)
  }

  db.close()
  console.log(`\n✅  Done! Inserted ${totalInserted} iWorld Apple products (${totalSkipped} skipped).`)
}

main().catch(e => { console.error(e); process.exit(1) })
