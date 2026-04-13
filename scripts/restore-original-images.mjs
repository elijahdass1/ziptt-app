// Restore original product images from seed data
import pg from 'pg'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
config({ path: envPath })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// All original images from seed.ts, keyed by slug
const originalImages = {
  // Trini Tech Hub — Electronics
  'samsung-galaxy-a55-5g': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
  'jbl-charge-5-bluetooth-speaker': ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
  'apple-airpods-pro-2nd-gen': ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'],
  'anker-powercore-26800': ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600'],

  // D'Mas Camp — Carnival
  'carnival-full-costume-golden-dynasty': ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'],
  'soca-fest-tank-top-bundle': ['https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=600'],
  'trini-pride-snapback-cap': ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'],

  // Sasha's Gourmet — Groceries & Rum
  'shadow-beni-bundle-6-packs': ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600'],
  'mamas-green-seasoning-500ml': ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600'],
  'angostura-1919-rum-750ml': ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600'],
  'grace-coconut-milk-12-pack': ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'],
  'chief-curry-powder-combo': ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'],

  // Don Wvrldwide — REAL CDN URLs from donwvrldwide.com
  'dw-conqueror-tee-black-gold': ['https://donwvrldwide.com/cdn/shop/files/website_NEW_The_conqueror_football_tee_115_color_intensity_black_and_gold_front_copy_2.png?v=1766447284&width=600'],
  'dw-conqueror-tee-army-green': ['https://donwvrldwide.com/cdn/shop/files/website_TheconquerorfootballteePRE-ORDERARMYGREENcopy2.png?v=1772771276&width=600'],
  'dw-conqueror-tee-white': ['https://donwvrldwide.com/cdn/shop/files/website_NEWTheconquerorfootballtee200colorintensitywhitecopy2.png?v=1736276708&width=600'],
  'dw-motto-tee-black-pink': ['https://donwvrldwide.com/cdn/shop/files/THE_MOTTO_TEE_FRONT_PINK_copy.png?v=1741644140&width=600'],
  'dw-motto-tee-white-black': ['https://donwvrldwide.com/cdn/shop/files/THEMOTTOTEEFRONTWHITEcopy.png?v=1734494781&width=600'],
  'dw-loyalty-hoodie-black': ['https://donwvrldwide.com/cdn/shop/files/LOYALTY_CUT_CROP_HOODIE_FRONT_copy_2_0a7d482b-1933-4a5b-8fcc-c4da9f1d67b1.png?v=1734017187&width=600'],
  'dw-enforcer-hoodie-black': ['https://donwvrldwide.com/cdn/shop/files/WEBSITE_ENFORCER_HOODIE_FRONT.png?v=1746242105&width=600'],
  'dw-conqueror-crew-socks': ['https://donwvrldwide.com/cdn/shop/files/Socks_3_pack_copy_2.png?v=1733077589&width=600'],

  // D'Best Toys — Amazon CDN
  'lego-city-police-station': ['https://m.media-amazon.com/images/I/71cLQcFKNqL._AC_SL500_.jpg'],
  'barbie-dreamhouse-2024': ['https://m.media-amazon.com/images/I/819FZXIRuLL._AC_SL500_.jpg'],
  'hot-wheels-20-car-gift-pack': ['https://m.media-amazon.com/images/I/81XfGVZeZkL._AC_SL500_.jpg'],
  'nerf-elite-2-commander': ['https://m.media-amazon.com/images/I/81GNuBJFVJL._AC_SL500_.jpg'],
  'uno-card-game': ['https://m.media-amazon.com/images/I/71XGFAHbKOL._AC_SL500_.jpg'],
  'monopoly-classic-board-game': ['https://m.media-amazon.com/images/I/91YNJM4oyhL._AC_SL500_.jpg'],
  'graco-modes-element-travel-system': ['https://m.media-amazon.com/images/I/71vYtR5zB2L._AC_SL500_.jpg'],
  'baby-alive-sweet-tears': ['https://m.media-amazon.com/images/I/61TjGQvIFXL._AC_SL500_.jpg'],
  'graco-slim2fit-3in1-car-seat': ['https://m.media-amazon.com/images/I/81CJnPjsF4L._AC_SL500_.jpg'],
  'barbie-fashionista-doll': ['https://m.media-amazon.com/images/I/71JOBo7XVIL._AC_SL500_.jpg'],
  'barbie-color-reveal-doll': ['https://m.media-amazon.com/images/I/61WkSbmFoIL._AC_SL500_.jpg'],
  'lego-classic-creative-bricks-900': ['https://m.media-amazon.com/images/I/81KdEuGMvHL._AC_SL500_.jpg'],
  'lego-ninjago-dragon-set': ['https://m.media-amazon.com/images/I/81XfGVZeZkL._AC_SL500_.jpg'],
  'nerf-fortnite-arl-blaster': ['https://m.media-amazon.com/images/I/71c3P4sIXQL._AC_SL500_.jpg'],
  'disney-frozen-elsa-singing-doll': ['https://m.media-amazon.com/images/I/61JnNQKPPQL._AC_SL500_.jpg'],
  'power-wheels-jeep-wrangler-12v': ['https://m.media-amazon.com/images/I/71gSTiWRBeL._AC_SL500_.jpg'],

  // Elite Home Decor — Facebook CDN + Unsplash
  'maxsonic-15cuft-fridge-inverter': ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/655569935_1259509066372066_5075608673823514987_n.jpg'],
  'maxsonic-30inch-gas-stove-broiler': ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/653936933_1259493363040303_6825220363994660625_n.jpg'],
  'premium-platinum-19cuft-4door-fridge': ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
  'cedar-ply-5-drawer-chest-mirror': ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651179612_1257839846538988_7798360715653517201_n.jpg'],
  'cedar-ply-5-drawer-chest': ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651335290_1257838659872440_8527368108116913156_n.jpg'],
  'cedar-ply-6-drawer-tall-chest-mirror': ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651209498_1257834693206170_22898707317486772_n.jpg'],
  'cedar-ply-6-drawer-tall-chest': ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/652184075_1257833919872914_8796869614260391205_n.jpg'],
  'cedar-ply-6-drawer-jumbo-chest-mirror': ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/652332027_1257825686540404_2995123383046012186_n.jpg'],
  'cedar-ply-6-drawer-jumbo-chest': ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/650732162_1257770899879216_8294802363858132479_n.jpg'],
}

async function main() {
  console.log('🔄 Restoring original product images...\n')
  let updated = 0
  let notFound = 0

  for (const [slug, images] of Object.entries(originalImages)) {
    const imagesJson = JSON.stringify(images)
    const result = await pool.query(
      'UPDATE "Product" SET images = $1 WHERE slug = $2 RETURNING id, name',
      [imagesJson, slug]
    )
    if (result.rows.length > 0) {
      console.log(`✅ ${result.rows[0].name}`)
      updated++
    } else {
      console.log(`⚠️  Not found: ${slug}`)
      notFound++
    }
  }

  console.log(`\n✅ Updated: ${updated} products`)
  if (notFound > 0) console.log(`⚠️  Not found: ${notFound} products`)
  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
