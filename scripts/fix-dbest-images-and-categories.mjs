// Fix D'Best Toys images with product-name-aware Unsplash photos
// Also fix rum/spirits products into correct category
import pg from 'pg'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Keyword → best-match Unsplash photo ID for toy/product types
const IMAGE_MAP = [
  // Barbie / Dolls
  { keys: ['barbie', 'fashionista', 'dreamhouse', 'princess doll', 'color reveal'], img: 'photo-1515488042361-ee00e0ddd4e4' },
  // Baby Alive / baby dolls
  { keys: ['baby alive', 'baby doll', 'sweet tears'], img: 'photo-1617331721458-bd3bd3f9c7f8' },
  // LEGO
  { keys: ['lego', 'duplo', 'technic', 'building block', 'building set', 'construction set', 'block set', 'bricks'], img: 'photo-1587654780291-39c9404d746b' },
  // Hot Wheels / die-cast cars
  { keys: ['hot wheels', 'die cast', 'diecast', 'matchbox', 'race car', 'toy car', 'cars pack', 'vehicle set'], img: 'photo-1544551763-46a013bb70d5' },
  // Remote control / RC
  { keys: ['remote control', 'rc car', 'rc truck', 'rc vehicle', 'radio control', 'radio-control'], img: 'photo-1580480055273-228ff5388ef8' },
  // Nerf / blasters
  { keys: ['nerf', 'blaster', 'dart', 'water gun', 'water blaster', 'squirt'], img: 'photo-1600269452121-4f2416e55c28' },
  // Board games / card games
  { keys: ['monopoly', 'uno', 'scrabble', 'chess', 'checkers', 'jenga', 'connect 4', 'twister', 'clue', 'sorry', 'card game', 'board game', 'stacko', 'tabletop'], img: 'photo-1611996575749-79a3a250f948' },
  // Puzzles
  { keys: ['puzzle', 'jigsaw', '1000 piece', '500 piece', '300 piece', 'floor puzzle'], img: 'photo-1606092195730-5d7b9af1efc5' },
  // Power Wheels / ride-on
  { keys: ['power wheels', 'ride-on', 'ride on', 'pedal car', 'electric car', 'go kart', 'electric ride'], img: 'photo-1558618048-a8bd5ae4f3a7' },
  // Disney / Frozen / Elsa / princesses
  { keys: ['disney', 'frozen', 'elsa', 'anna', 'moana', 'rapunzel', 'cinderella', 'ariel', 'belle', 'princess', 'sofia'], img: 'photo-1607462109702-de7df51c72f3' },
  // Marvel / DC / Superheroes / Action figures
  { keys: ['spiderman', 'spider-man', 'avengers', 'batman', 'superman', 'marvel', 'dc comics', 'action figure', 'superhero', 'iron man', 'captain america', 'hulk', 'thor', 'black panther', 'transformers', 'optimus'], img: 'photo-1608889825271-9696283b8986' },
  // Star Wars
  { keys: ['star wars', 'lightsaber', 'darth', 'yoda', 'stormtrooper', 'millennium falcon'], img: 'photo-1608889825271-9696283b8986' },
  // Stuffed animals / plush
  { keys: ['plush', 'stuffed', 'teddy', 'bear', 'bunny', 'labubu', 'squishmallow', 'care bear', 'pokemon plush', 'pikachu plush', 'soft toy'], img: 'photo-1559715541-5daf8a0296d0' },
  // Graco / stroller / car seat / baby gear
  { keys: ['graco', 'stroller', 'car seat', 'travel system', 'infant carrier', 'high chair', 'baby gate', 'pack n play'], img: 'photo-1515488042361-ee00e0ddd4e4' },
  // Musical instruments (kids)
  { keys: ['drum', 'xylophone', 'keyboard', 'piano', 'guitar', 'instrument', 'trumpet', 'saxophone', 'flute', 'microphone', 'musical'], img: 'photo-1511379938547-c1f69419868d' },
  // Outdoor / Sports toys
  { keys: ['basketball', 'football', 'soccer', 'baseball', 'bike', 'bicycle', 'scooter', 'skateboard', 'frisbee', 'kite', 'trampoline', 'swing', 'slide', 'sandbox', 'sand table', 'water table'], img: 'photo-1546519638405-a5ee3ff90b63' },
  // Play kitchen / pretend play / role play
  { keys: ['kitchen', 'play food', 'tea set', 'cooking', 'cash register', 'shopping cart', 'doctor', 'tool set', 'workbench', 'farm set', 'dollhouse', 'play house'], img: 'photo-1558618666-fcd25c85cd64' },
  // Pokemon / trading cards
  { keys: ['pokemon', 'pikachu', 'trading card', 'yu-gi-oh', 'magic the gathering'], img: 'photo-1607462109702-de7df51c72f3' },
  // Baby Einstein / VTech / LeapFrog / educational
  { keys: ['vtech', 'leapfrog', 'baby einstein', 'learning', 'educational', 'alphabet', 'counting', 'flash card', 'activity cube', 'shape sorter'], img: 'photo-1617331721458-bd3bd3f9c7f8' },
  // Default toy fallback
  { keys: ['toy', 'kids', 'children', 'play', 'game', 'fun'], img: 'photo-1558618666-fcd25c85cd64' },
]

function getImageForProduct(name) {
  const lower = name.toLowerCase()
  for (const { keys, img } of IMAGE_MAP) {
    if (keys.some(k => lower.includes(k))) {
      return `https://images.unsplash.com/${img}?w=600`
    }
  }
  return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
}

async function main() {
  // ── 1. Fix D'Best Toys images ───────────────────────────────────────────────
  console.log('📦 Fetching D\'Best Toys products...')
  const { rows: dbestProducts } = await pool.query(`
    SELECT p.id, p.name, p.slug, p.images
    FROM "Product" p
    JOIN "Vendor" v ON p."vendorId" = v.id
    WHERE v.slug = 'dbest-toys'
    AND p.slug NOT IN (
      'lego-city-police-station','barbie-dreamhouse-2024','hot-wheels-20-car-gift-pack',
      'nerf-elite-2-commander','uno-card-game','monopoly-classic-board-game',
      'graco-modes-element-travel-system','baby-alive-sweet-tears',
      'graco-slim2fit-3in1-car-seat','barbie-fashionista-doll',
      'barbie-color-reveal-doll','lego-classic-creative-bricks-900',
      'lego-ninjago-dragon-set','nerf-fortnite-arl-blaster',
      'disney-frozen-elsa-singing-doll','power-wheels-jeep-wrangler-12v'
    )
  `)
  console.log(`Found ${dbestProducts.length} D'Best Toys migration products to update`)

  let updated = 0
  for (const product of dbestProducts) {
    const newImage = getImageForProduct(product.name)
    const currentImages = (() => { try { return JSON.parse(product.images) } catch { return [] } })()
    // Only update if still using a generic rotating image
    const isGeneric = currentImages.length > 0 && (
      currentImages[0].includes('photo-1558618666') ||
      currentImages[0].includes('photo-1515488042361') ||
      currentImages[0].includes('photo-1559715541') ||
      currentImages[0].includes('photo-1558981806') ||
      currentImages[0].includes('photo-1611996575749') ||
      currentImages[0].includes('photo-1607082348824')
    )
    if (isGeneric || !currentImages.length) {
      await pool.query('UPDATE "Product" SET images = $1 WHERE id = $2', [JSON.stringify([newImage]), product.id])
      updated++
    }
  }
  console.log(`✅ Updated ${updated} D'Best Toys products with category-appropriate images`)

  // ── 2. Fix rum/spirits products into correct category ───────────────────────
  console.log('\n🍾 Fixing rum & spirits category...')
  const { rows: [rumCat] } = await pool.query(`SELECT id FROM "Category" WHERE slug = 'rum-spirits'`)
  if (!rumCat) { console.log('❌ rum-spirits category not found'); return }

  const rumKeywords = ['rum', 'whisky', 'whiskey', 'vodka', 'gin', 'brandy', 'spirits', 'bitters', 'liqueur', 'scotch', 'bourbon', 'cognac', 'wine', 'beer', 'champagne', 'angostura', 'fernandes', 'black label', 'single malt']
  for (const kw of rumKeywords) {
    const result = await pool.query(`
      UPDATE "Product" SET "categoryId" = $1
      WHERE name ILIKE $2
      AND "categoryId" != $1
      RETURNING name
    `, [rumCat.id, `%${kw}%`])
    if (result.rows.length > 0) {
      result.rows.forEach(r => console.log(`  ✅ Moved to rum-spirits: ${r.name}`))
    }
  }

  // ── 3. Fix fashion products ─────────────────────────────────────────────────
  console.log('\n👔 Fixing fashion category...')
  const { rows: [fashionCat] } = await pool.query(`SELECT id FROM "Category" WHERE slug = 'fashion'`)
  const fashionKeywords = ['dress', 'skirt', 'blouse', 'heels', 'sandals', 'handbag', 'purse', 'lingerie', 'swimwear', 'bikini']
  for (const kw of fashionKeywords) {
    const result = await pool.query(`
      UPDATE "Product" SET "categoryId" = $1
      WHERE name ILIKE $2 AND "categoryId" != $1
      RETURNING name
    `, [fashionCat.id, `%${kw}%`])
    if (result.rows.length > 0) {
      result.rows.forEach(r => console.log(`  ✅ Moved to fashion: ${r.name}`))
    }
  }

  // ── 4. Verify final counts ──────────────────────────────────────────────────
  console.log('\n📊 Final category counts:')
  const { rows: counts } = await pool.query(`
    SELECT c.slug, c.name, COUNT(p.id) as cnt
    FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c.id AND p.status = 'ACTIVE'
    GROUP BY c.id ORDER BY cnt DESC
  `)
  counts.forEach(r => console.log(`  ${r.slug.padEnd(20)} ${r.cnt.toString().padStart(5)}  ${r.name}`))

  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
