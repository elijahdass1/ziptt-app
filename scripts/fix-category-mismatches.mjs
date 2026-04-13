// Fix category mismatches caused by substring over-matching
import pg from 'pg'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const { rows: cats } = await pool.query(`SELECT id, slug FROM "Category"`)
  const catId = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // ── Step 1: Move all non-alcohol products out of rum-spirits → back to toys ─
  // These got here from substring matches (drum→rum, singing→gin, spirits→Super Friends, etc.)
  console.log('🔧 Moving wrongly-categorised products back to toys...')
  const restored = await pool.query(`
    UPDATE "Product" SET "categoryId" = $1
    WHERE "categoryId" = $2
    AND NOT (
      name ILIKE '%angostura%'
      OR name ILIKE '%fernandes rum%'
      OR name ILIKE '% rum %'
      OR name ILIKE '% rum (%'
      OR name ILIKE '%scotch bonnet pepper rum%'
      OR name ILIKE '%whisky%'
      OR name ILIKE '%whiskey%'
      OR name ILIKE '%vodka%'
      OR name ILIKE '%bourbon%'
      OR name ILIKE '%cognac%'
      OR name ILIKE '%liqueur%'
      OR name ILIKE '%black label rum%'
    )
    RETURNING name
  `, [catId['toys'], catId['rum-spirits']])
  console.log(`  Restored ${restored.rows.length} products to toys`)

  // ── Step 2: Move Hot Wheels & car tracks out of fashion → back to toys ──────
  console.log('\n🔧 Moving Hot Wheels & vehicles out of fashion → toys...')
  const hwRestored = await pool.query(`
    UPDATE "Product" SET "categoryId" = $1
    WHERE "categoryId" = $2
    AND (
      name ILIKE '%hot wheels%'
      OR name ILIKE '%power wheels%'
      OR name ILIKE '%step2%'
      OR name ILIKE '%basketball hoop%'
      OR name ILIKE '%play-doh%'
      OR name ILIKE '%vtech go%'
      OR name ILIKE '%go! go! smart%'
      OR name ILIKE '%potty training%'
      OR name ILIKE '%ride-on%'
      OR name ILIKE '%jeep wrangler%'
    )
    RETURNING name
  `, [catId['toys'], catId['fashion']])
  console.log(`  Restored ${hwRestored.rows.length} toy/vehicle products from fashion → toys`)

  // ── Step 3: Ensure real rum & spirits are in rum-spirits ─────────────────────
  console.log('\n🍾 Re-assigning real rum/spirits products...')
  const rumUpdate = await pool.query(`
    UPDATE "Product" SET "categoryId" = $1
    WHERE "categoryId" != $1
    AND (
      name ILIKE '%angostura%'
      OR name ILIKE '%fernandes%rum%'
      OR name ILIKE '%scotch bonnet pepper rum%'
      OR (name ILIKE '% rum%' AND name NOT ILIKE '%drum%' AND name NOT ILIKE '%forum%' AND name NOT ILIKE '%classroom%')
      OR name ILIKE '%single malt%'
      OR name ILIKE '%bourbon%'
      OR name ILIKE '%cognac%'
      OR name ILIKE '%1919 rum%'
      OR name ILIKE '%7 year%rum%'
    )
    RETURNING name
  `, [catId['rum-spirits']])
  rumUpdate.rows.forEach(r => console.log(`  ✅ rum-spirits: ${r.name}`))

  // ── Step 4: Ensure D'Mas Camp carnival products are in carnival ──────────────
  console.log('\n🎭 Fixing carnival products...')
  const carnivalFix = await pool.query(`
    UPDATE "Product" SET "categoryId" = $1
    FROM "Vendor" v
    WHERE "Product"."vendorId" = v.id
    AND v.slug = 'dmas-camp'
    AND "Product"."categoryId" != $1
    RETURNING "Product".name
  `, [catId['carnival']])
  carnivalFix.rows.forEach(r => console.log(`  ✅ carnival: ${r.name}`))

  // ── Step 5: Fix Sasha's Gourmet groceries ────────────────────────────────────
  console.log('\n🛒 Fixing groceries...')
  const groceriesFix = await pool.query(`
    UPDATE "Product" SET "categoryId" = $1
    FROM "Vendor" v
    WHERE "Product"."vendorId" = v.id
    AND v.slug = 'sashas-gourmet'
    AND "Product"."categoryId" != $1
    AND "Product"."categoryId" != $2
    RETURNING "Product".name
  `, [catId['groceries'], catId['rum-spirits']])
  groceriesFix.rows.forEach(r => console.log(`  ✅ groceries: ${r.name}`))

  // ── Final counts ─────────────────────────────────────────────────────────────
  console.log('\n📊 Final category counts:')
  const { rows } = await pool.query(`
    SELECT c.slug, c.name, COUNT(p.id) as cnt
    FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c.id AND p.status = 'ACTIVE'
    GROUP BY c.id ORDER BY cnt::int DESC
  `)
  rows.forEach(r => console.log(`  ${r.slug.padEnd(22)} ${String(r.cnt).padStart(5)}  ${r.name}`))

  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
