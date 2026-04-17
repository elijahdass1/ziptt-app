// Point all D'Best Toys migration products at our dynamic SVG image generator
import pg from 'pg'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Named seed products that already have real Amazon CDN images — keep them
const KEEP_SLUGS = new Set([
  'lego-city-police-station','barbie-dreamhouse-2024','hot-wheels-20-car-gift-pack',
  'nerf-elite-2-commander','uno-card-game','monopoly-classic-board-game',
  'graco-modes-element-travel-system','baby-alive-sweet-tears',
  'graco-slim2fit-3in1-car-seat','barbie-fashionista-doll',
  'barbie-color-reveal-doll','lego-classic-creative-bricks-900',
  'lego-ninjago-dragon-set','nerf-fortnite-arl-blaster',
  'disney-frozen-elsa-singing-doll','power-wheels-jeep-wrangler-12v',
])

async function main() {
  console.log("🎨 Fetching D'Best Toys migration products...")
  const { rows } = await pool.query(`
    SELECT p.id, p.name, p.slug, c.slug as cat_slug
    FROM "Product" p
    JOIN "Vendor" v ON p."vendorId" = v.id
    JOIN "Category" c ON p."categoryId" = c.id
    WHERE v.slug = 'dbest-toys'
  `)

  const toUpdate = rows.filter(r => !KEEP_SLUGS.has(r.slug))
  console.log(`Updating ${toUpdate.length} products...`)

  // Build one big UPDATE using a VALUES list
  const cases = []
  const params = []
  let idx = 1
  for (const p of toUpdate) {
    const name = encodeURIComponent(p.name.substring(0, 80))
    const cat  = encodeURIComponent(p.cat_slug)
    const url  = `/api/product-img?name=${name}&cat=${cat}&store=D%27Best+Toys`
    const img  = JSON.stringify([url])
    cases.push(`($${idx++}::text, $${idx++}::text)`)
    params.push(p.id, img)
  }

  // Process in batches of 500 to avoid huge queries
  const BATCH = 500
  let done = 0
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const slice = toUpdate.slice(i, i + BATCH)
    const bCases = []
    const bParams = []
    let bi = 1
    for (const p of slice) {
      const name = encodeURIComponent(p.name.substring(0, 80))
      const cat  = encodeURIComponent(p.cat_slug)
      const url  = `/api/product-img?name=${name}&cat=${cat}&store=D%27Best+Toys`
      bCases.push(`($${bi++}::text, $${bi++}::text)`)
      bParams.push(p.id, JSON.stringify([url]))
    }
    await pool.query(`
      UPDATE "Product" AS t SET images = v.images
      FROM (VALUES ${bCases.join(',')}) AS v(id, images)
      WHERE t.id::text = v.id
    `, bParams)
    done += slice.length
    process.stdout.write(`\r  ${done}/${toUpdate.length}`)
  }

  console.log(`\n✅ Done — ${done} products updated with branded black-background images`)
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
