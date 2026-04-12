/**
 * Trini Necessities full import — 563 products via Shopify products.json
 * Run:  node prisma/scrape-trininecessities.mjs
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
  fashion:    'cmn5kf9zl0002o0cnyob6j5xq',   // Fashion & Clothing
  homeGarden: 'cmn5kf9zq0003o0cn1zxkg8oj',   // Home & Garden
  beauty:     'cmn5kf9zw0004o0cnfuedrbes',   // Beauty & Health
  toys:       'cmn5lmrg40001pwcna4lw49cw',   // Toys, Games & Kids
  sports:     'cmn5kfa080006o0cn1y2zljlg',   // Sports & Fitness
  urban:      'cmn5lmrfy0000pwcnoitrpp92',   // Urban Fashion & Streetwear
}

// ── Category inference from product type / tags / title ─────────────────────
function inferCategory(product) {
  const type  = (product.product_type || '').toLowerCase()
  const tags  = (Array.isArray(product.tags) ? product.tags.join(',') : product.tags || '').toLowerCase()
  const title = product.title.toLowerCase()
  const all   = `${type} ${tags} ${title}`

  // Toys / plushies / kids
  if (/plush|stuffed|keychain|stitch|minecraft|squid toy|lego|puzzle.*kids|kids.*toy|children|plushie|night light.*baby|baby.*light|surprise.*pouch/.test(all))
    return CATS.toys

  // Home decor / incense / lamps / spiritual
  if (/incense|backflow|back.?flow|burner|buddha|ganesh|feng shui|jade|chakra|crystal|lamp|lantern|rgb|light.*wall|wall.*light|night light|decor|figurine|obsidian|natural stone|pixiu|evil eye|ornament|ceramic|resin|murti|sand stone/.test(all))
    return CATS.homeGarden

  // Beauty / health / wellness
  if (/bunion|orthopedic|wellness|health|skin|face|beauty|massage|posture/.test(all))
    return CATS.beauty

  // Sports / fitness / gym
  if (/gym|fitness|sport|workout|travel bag|duffel|magnetic.*bag/.test(all))
    return CATS.sports

  // Jewelry / accessories / bags
  if (/bracelet|necklace|ring|earring|pendant|charm|zircon|stainless steel|gold|silver|jewelry|jewel|backpack|side bag|bag|purse/.test(all))
    return CATS.fashion

  // Apparel / clothing
  if (/hoodie|shirt|tshirt|t-shirt|jacket|pants|shorts|apparel|clothing|wear|dress|top|blouse|sweater/.test(all))
    return CATS.urban

  // Default
  return CATS.homeGarden
}

function uid() {
  return 'c' + randomBytes(11).toString('hex')
}

function makeSlug(title) {
  return 'tn-' + title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 90)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const db = new Database(DB_PATH)
  const now = new Date().toISOString()

  // ── Create or find Vendor ────────────────────────────────────────────────
  let vendor = db.prepare("SELECT id FROM Vendor WHERE slug = 'trini-necessities'").get()

  if (!vendor) {
    console.log('Creating Trini Necessities vendor...')
    const userId = uid()
    const vendorId = uid()

    db.prepare(`
      INSERT INTO User (id, name, email, emailVerified, image, password, phone, role, status, createdAt, updatedAt)
      VALUES (@id, @name, @email, NULL, NULL, @password, NULL, 'VENDOR', 'ACTIVE', @now, @now)
    `).run({
      id: userId,
      name: 'Trini Necessities',
      email: 'trini.necessities@zip.tt',
      password: '$2b$10$placeholder',
      now,
    })

    db.prepare(`
      INSERT INTO Vendor (id, userId, storeName, slug, description, logo, banner, phone, address, region, status, rating, totalSales, commission, bankInfo, createdAt, updatedAt)
      VALUES (@id, @userId, @storeName, @slug, @description, NULL, NULL, NULL, NULL, 'Port of Spain', 'ACTIVE', 0, 0, 0.1, NULL, @now, @now)
    `).run({
      id: vendorId,
      userId,
      storeName: 'Trini Necessities',
      slug: 'trini-necessities',
      description: 'Your go-to Trinidad store for unique gifts, jewelry, home decor, plushies, lighting and lifestyle essentials.',
      now,
    })

    vendor = { id: vendorId }
    console.log('  Created vendor:', vendorId)
  } else {
    console.log('Vendor already exists:', vendor.id)
  }

  const VENDOR_ID = vendor.id

  // ── Clear existing products ──────────────────────────────────────────────
  const existingIds = db.prepare('SELECT id FROM Product WHERE vendorId = ?')
    .all(VENDOR_ID).map(r => r.id)

  if (existingIds.length) {
    console.log(`Clearing ${existingIds.length} old Trini Necessities products...`)
    const ph = existingIds.map(() => '?').join(',')
    db.prepare(`DELETE FROM CartItem  WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM OrderItem WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Review    WHERE productId IN (${ph})`).run(...existingIds)
    db.prepare(`DELETE FROM Product   WHERE vendorId  = ?`).run(VENDOR_ID)
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

  // ── Fetch all products from Shopify ─────────────────────────────────────
  console.log('Fetching products from Shopify API...')
  const allProducts = []
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`https://trininecessities.com/products.json?limit=250&page=${page}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZipTT/1.0)', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) { console.warn(`Page ${page} failed: ${res.status}`); break }
    const data = await res.json()
    const products = data.products || []
    allProducts.push(...products)
    console.log(`  Fetched page ${page}: ${products.length} products (total: ${allProducts.length})`)
    if (products.length < 250) break
    await sleep(400)
  }

  console.log(`\nInserting ${allProducts.length} products...`)

  const usedSlugs  = new Set()
  let totalInserted = 0
  let totalSkipped  = 0

  for (const p of allProducts) {
    // Build slug
    let productSlug = makeSlug(p.title)
    if (usedSlugs.has(productSlug)) {
      productSlug = productSlug.substring(0, 80) + '-' + uid().slice(0, 5)
    }
    usedSlugs.add(productSlug)

    if (db.prepare('SELECT 1 FROM Product WHERE slug = ?').get(productSlug)) {
      totalSkipped++
      continue
    }

    // Price from first variant
    const variant       = p.variants?.[0]
    const price         = Math.round(parseFloat(variant?.price || '0'))
    const compareAtStr  = variant?.compare_at_price
    const comparePrice  = compareAtStr ? Math.round(parseFloat(compareAtStr)) : null

    // Images — up to 5
    const images = (p.images || []).slice(0, 5).map(img => img.src.split('?')[0])

    // Tags
    const rawTags = Array.isArray(p.tags)
      ? p.tags
      : (p.tags || '').split(',').map(t => t.trim()).filter(Boolean)
    const tags = rawTags.slice(0, 8)

    // Description
    const description = (p.body_html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500)

    // Category
    const categoryId = inferCategory(p)

    try {
      insertProduct.run({
        id:           uid(),
        vendorId:     VENDOR_ID,
        categoryId,
        name:         p.title,
        slug:         productSlug,
        description,
        price,
        comparePrice: comparePrice && comparePrice > price ? comparePrice : null,
        images:       JSON.stringify(images),
        stock:        variant?.inventory_quantity > 0 ? variant.inventory_quantity : 10,
        sku:          variant?.sku || null,
        tags:         JSON.stringify(tags),
        status:       'ACTIVE',
        featured:     0,
        rating:       0,
        reviewCount:  0,
        soldCount:    0,
        weight:       variant?.weight ? Math.round(variant.weight * 1000) : null,
        createdAt:    now,
        updatedAt:    now,
      })
      totalInserted++
    } catch (e) {
      console.warn(`  ERR "${p.title}": ${e.message}`)
      totalSkipped++
    }
  }

  db.close()

  console.log(`\n✅  Done!`)
  console.log(`   Inserted : ${totalInserted}`)
  console.log(`   Skipped  : ${totalSkipped}`)
  console.log(`   Vendor ID: ${VENDOR_ID}`)
}

main().catch(e => { console.error(e); process.exit(1) })
