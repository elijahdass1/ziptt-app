/**
 * D'Best Toys full scraper — all 135 pages
 * Run:  node prisma/scrape-dbesttoys.mjs
 */

import { createRequire } from 'module'
import { randomBytes }   from 'crypto'
import path              from 'path'
import { fileURLToPath } from 'url'

const require  = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH   = path.join(__dirname, 'dev.db')

const VENDOR_ID   = 'cmn5lmrom0005pwcn06o0ili3'
const TOYS_CAT_ID = 'cmn5lmrg40001pwcna4lw49cw'
const BASE_URL    = 'https://www.dbesttoys.com/product-category/all-products'
const TOTAL_PAGES = 135
const DELAY_MS    = 600

function uid() {
  return 'c' + randomBytes(11).toString('hex')
}

function makeSlug(name) {
  return 'dbest-' + name
    .toLowerCase()
    .replace(/&amp;/g, 'and').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .substring(0, 90)
}

function parsePrice(str) {
  if (!str) return null
  const m = String(str).replace(/,/g, '').match(/[\d]+\.?\d*/)
  return m ? Math.round(parseFloat(m[0])) : null
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function bestFromSrcset(srcset) {
  if (!srcset) return null
  let best = null, bestW = 0
  for (const entry of srcset.split(',')) {
    const m = entry.trim().match(/^(\S+)\s+(\d+)w$/)
    if (!m) continue
    const w = parseInt(m[2])
    if (w > bestW) { bestW = w; best = m[1] }
  }
  return best
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '-').replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .trim()
}

function extractProducts(html) {
  const products = []
  const blocks = html.split(/(?=<div[^>]*\bproduct\b[^>]*\btype-product\b[^>]*>)/g)

  for (const block of blocks) {
    if (!block.includes('type-product') || !block.includes('product-title')) continue

    // Name
    const nameMatch = block.match(/<h2[^>]*class="product-title"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/)
    if (!nameMatch) continue
    const name = decodeHtml(nameMatch[1])
    if (!name) continue

    // Link
    const linkMatch = block.match(/href="(https?:\/\/www\.dbesttoys\.com\/store\/[^"]+)"/)
    const link = linkMatch ? linkMatch[1] : null

    // SKU
    const skuMatch = block.match(/data-product_sku="([^"]+)"/)
    const sku = skuMatch ? skuMatch[1] : null

    // Image — best from srcset
    const srcsetMatch = block.match(/srcset="([^"]+)"/)
    let img = srcsetMatch ? bestFromSrcset(srcsetMatch[1]) : null
    if (!img) {
      const srcMatch = block.match(/src="(https?:\/\/www\.dbesttoys\.com\/wp-content\/[^"]+\.(?:jpg|jpeg|png|webp))"/)
      img = srcMatch ? srcMatch[1] : null
    }

    // Prices — match digits after currency symbol span inside del/ins/bdi
    const delM = block.match(/<del[^>]*>[\s\S]*?<bdi>TTD<span[^>]*>[^<]*<\/span>([\d,]+\.?\d*)/)
    const regularPrice = delM ? parsePrice(delM[1]) : null

    const insM = block.match(/<ins[^>]*>[\s\S]*?<bdi>TTD<span[^>]*>[^<]*<\/span>([\d,]+\.?\d*)/)
    const salePrice = insM ? parsePrice(insM[1]) : null

    // Single price fallback (no sale)
    let singlePrice = null
    if (!regularPrice && !salePrice) {
      const singleM = block.match(/<bdi>TTD<span[^>]*>[^<]*<\/span>([\d,]+\.?\d*)/)
      singlePrice = singleM ? parsePrice(singleM[1]) : null
    }

    const finalPrice   = salePrice ?? singlePrice ?? regularPrice ?? 0
    const comparePrice = (salePrice != null && regularPrice != null) ? regularPrice : null

    // Tags from WP classes
    const catTags = [...block.matchAll(/product_cat-([\w-]+)/g)]
      .map(m => m[1]).filter(c => c !== 'all-products').slice(0, 5)
    const wpTags  = [...block.matchAll(/product_tag-([\w-]+)/g)]
      .map(m => m[1]).slice(0, 6)
    const tags = [...new Set([...catTags, ...wpTags])]

    products.push({ name, link, img, sku, finalPrice, comparePrice, tags })
  }

  return products
}

async function main() {
  const db = new Database(DB_PATH)

  console.log("Clearing old D'Best Toys products...")
  const existingIds = db.prepare('SELECT id FROM Product WHERE vendorId = ?')
    .all(VENDOR_ID).map(r => r.id)

  if (existingIds.length) {
    const ph = existingIds.map(() => '?').join(',')
    db.prepare(`DELETE FROM CartItem  WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM OrderItem WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Review    WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Product   WHERE vendorId  = ?`).run(VENDOR_ID)
    console.log(`  Deleted ${existingIds.length} old products.`)
  }

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO Product
      (id, vendorId, categoryId, name, slug, description,
       price, comparePrice, images, stock, sku, tags, status,
       featured, rating, reviewCount, soldCount, weight,
       createdAt, updatedAt)
    VALUES
      (@id, @vendorId, @categoryId, @name, @slug, @description,
       @price, @comparePrice, @images, @stock, @sku, @tags, @status,
       @featured, @rating, @reviewCount, @soldCount, @weight,
       @createdAt, @updatedAt)
  `)

  const usedSlugs   = new Set()
  let totalInserted = 0
  let totalSkipped  = 0

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const url = page === 1
      ? `${BASE_URL}/`
      : `${BASE_URL}/page/${page}/`

    process.stdout.write(`  Page ${String(page).padStart(3)}/${TOTAL_PAGES}... `)

    let html = null
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(25_000),
        })
        if (res.status === 404) { process.stdout.write('404\n'); break }
        if (!res.ok) { process.stdout.write(`HTTP${res.status} `); await sleep(2000); continue }
        html = await res.text()
        break
      } catch (e) {
        process.stdout.write(`err${attempt} `)
        await sleep(3000 * attempt)
      }
    }

    if (!html) { console.log('SKIP'); continue }

    const products = extractProducts(html)
    process.stdout.write(`${products.length} found -> `)

    let pageInserted = 0
    for (const p of products) {
      let productSlug = makeSlug(p.name)
      if (usedSlugs.has(productSlug)) {
        productSlug = productSlug.substring(0, 80) + '-' + uid().slice(0, 5)
      }
      usedSlugs.add(productSlug)

      if (db.prepare('SELECT 1 FROM Product WHERE slug = ?').get(productSlug)) {
        totalSkipped++
        continue
      }

      const images = p.img ? JSON.stringify([p.img]) : JSON.stringify([])
      const now    = new Date().toISOString()

      try {
        insertProduct.run({
          id: uid(), vendorId: VENDOR_ID, categoryId: TOYS_CAT_ID,
          name: p.name, slug: productSlug, description: '',
          price: p.finalPrice, comparePrice: p.comparePrice,
          images, stock: 10, sku: p.sku ?? null,
          tags: JSON.stringify(p.tags), status: 'ACTIVE',
          featured: 0, rating: 0, reviewCount: 0, soldCount: 0, weight: null,
          createdAt: now, updatedAt: now,
        })
        pageInserted++
        totalInserted++
      } catch (e) {
        process.stdout.write(`\n    ERR "${p.name}": ${e.message} `)
        totalSkipped++
      }
    }

    console.log(`inserted ${pageInserted}`)
    if (page < TOTAL_PAGES) await sleep(DELAY_MS)
  }

  db.close()
  console.log(`\nDone! Inserted ${totalInserted} products (${totalSkipped} skipped).`)
}

main().catch(e => { console.error(e); process.exit(1) })
