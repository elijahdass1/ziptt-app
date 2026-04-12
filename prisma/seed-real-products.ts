/**
 * Real product upload script for:
 *  - Elite Home Decor  (appliances & furniture from facebook.com/elitehomedecor525)
 *  - Don Wvrldwide     (streetwear from donwvrldwide.com)
 *  - D'Best Toys       (toys from dbesttoys.com)
 *
 * Run with:  npx tsx prisma/seed-real-products.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

// ─── Vendor / Category IDs from DB ────────────────────────────────────────────
const VENDORS = {
  eliteHomeDecor: 'cmn6cavfi0002ogcnosg1qnd0',
  donWvrldwide:   'cmn5lmrof0004pwcnqf11wbwj',
  dBestToys:      'cmn5lmrom0005pwcn06o0ili3',
}

const CATS = {
  appliances:   'cmn6cav5n0000ogcnfxxrchbw',   // Appliances & Home
  homeGarden:   'cmn5kf9zq0003o0cn1zxkg8oj',   // Home & Garden
  urbanFashion: 'cmn5lmrfy0000pwcnoitrpp92',   // Urban Fashion & Streetwear
  toys:         'cmn5lmrg40001pwcna4lw49cw',   // Toys, Games & Kids
}

// Helper – deterministic slug generator (same as seed.ts)
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── ELITE HOME DECOR ─────────────────────────────────────────────────────────
const eliteProducts = [
  {
    name: 'Maxsonic 15 cu.ft. Refrigerator with Inverter',
    description: 'Maxsonic 15 cu.ft. top-mount refrigerator with inverter technology for energy efficiency. Features large fresh food compartment, freezer section, and interior lighting. Comes with a 1 Year Warranty. Perfect for medium-sized households.',
    price: 4695,
    comparePrice: null,
    categoryId: CATS.appliances,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
    ],
    stock: 8,
    tags: ['maxsonic', 'refrigerator', 'inverter', 'appliance'],
  },
  {
    name: 'Maxsonic 10 cu.ft. Non-Frost Refrigerator',
    description: 'Maxsonic 10 cu.ft. non-frost refrigerator — ideal for small families or offices. Automatic defrost keeps the unit frost-free and running efficiently. 1 Year Warranty included. Stainless-look finish.',
    price: 3295,
    comparePrice: null,
    categoryId: CATS.appliances,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
    ],
    stock: 12,
    tags: ['maxsonic', 'refrigerator', 'non-frost', 'appliance'],
  },
  {
    name: 'Maxsonic 30" Stainless Steel 5-Burner Gas Stove with Broiler (MR200)',
    description: 'Maxsonic MR200 — 30" stainless steel gas stove featuring 5 burners for versatile cooking, a broiler drawer, and cast iron grates. Oven capacity with tempered glass window. 1 Year Warranty. Ideal for the modern kitchen.',
    price: 3695,
    comparePrice: null,
    categoryId: CATS.appliances,
    images: [
      'https://images.unsplash.com/photo-1556909045-b6960b5f7f15?w=800&q=80',
      'https://images.unsplash.com/photo-1556909053-3f28893e7e0a?w=800&q=80',
    ],
    stock: 6,
    tags: ['maxsonic', 'gas stove', 'stainless steel', 'appliance'],
  },
  {
    name: 'Magnum 30" Stainless Steel 5-Burner Gas Stove',
    description: 'Magnum Electronics 30" stainless steel free-standing gas stove with 5 burners. Features include heavy-duty cast iron grates, large oven with grill function, and digital ignition. 6 Months Warranty.',
    price: 2595,
    comparePrice: null,
    categoryId: CATS.appliances,
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80',
    ],
    stock: 5,
    tags: ['magnum', 'gas stove', 'stainless steel', 'appliance'],
  },
  {
    name: 'Cedar & Ply 5-Drawer Chest of Drawers with Mirror',
    description: 'Solid cedar and ply 5-drawer chest of drawers with a matching wall mirror. Dimensions: H-62" W-33½" D-16½". Features brass-finish drawer pulls and a smooth gliding mechanism. Locally crafted quality furniture — perfect for the bedroom.',
    price: 1295,
    comparePrice: 1395,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    ],
    stock: 4,
    tags: ['cedar', 'chest of drawers', 'mirror', 'bedroom', 'furniture'],
  },
  {
    name: 'Cedar & Ply 5-Drawer Chest of Drawers',
    description: 'Solid cedar and ply 5-drawer chest of drawers. Dimensions: H-34" W-33½" D-16½". Classic colonial-style brass handles. Spacious drawers for all your storage needs. Sturdy hardwood construction.',
    price: 1195,
    comparePrice: 1295,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 6,
    tags: ['cedar', 'chest of drawers', 'bedroom', 'furniture'],
  },
  {
    name: 'Cedar & Ply 6-Drawer Tall Chest of Drawers with Mirror',
    description: 'Solid cedar and ply tall 6-drawer chest of drawers with wall mirror. Dimensions: H-70" W-33½" D-16½". Extra height provides maximum storage capacity. Beautiful honey-wood finish with brass-style hardware.',
    price: 1395,
    comparePrice: 1495,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 3,
    tags: ['cedar', '6-drawer', 'tall chest', 'mirror', 'furniture'],
  },
  {
    name: 'Cedar & Ply 6-Drawer Tall Chest of Drawers',
    description: 'Solid cedar and ply tall 6-drawer chest without mirror. Dimensions: H-42" W-33½" D-16½". Smooth drawer slides, sturdy dovetail construction. Great addition to any bedroom or hallway.',
    price: 1295,
    comparePrice: 1395,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 5,
    tags: ['cedar', '6-drawer', 'tall chest', 'furniture'],
  },
  {
    name: 'Cedar & Ply 6-Drawer Jumbo Chest of Drawers with Mirror',
    description: 'Solid cedar and ply extra-wide jumbo 6-drawer chest with mirror. Dimensions: H-70" W-43½" D-16½". Generously sized for master bedrooms. Includes matching mirror and premium brass-style handles.',
    price: 1495,
    comparePrice: 1595,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 3,
    tags: ['cedar', '6-drawer', 'jumbo', 'mirror', 'furniture'],
  },
  {
    name: 'Cedar & Ply 6-Drawer Jumbo Chest of Drawers',
    description: 'Solid cedar and ply extra-wide jumbo 6-drawer chest without mirror. Dimensions: H-42" W-43½" D-16½". Wide profile provides abundant storage space. Crafted locally with quality hardwood.',
    price: 1395,
    comparePrice: 1495,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 4,
    tags: ['cedar', '6-drawer', 'jumbo', 'furniture'],
  },
  {
    name: 'Cedar & Ply Wardrobe with Dresser',
    description: 'Solid cedar and ply wardrobe with integrated dresser section. Dimensions: H-72½" W-44" D-19". Full-height single-door wardrobe with hanging rail plus a 4-drawer dresser with mirror. A timeless bedroom centrepiece.',
    price: 2195,
    comparePrice: null,
    categoryId: CATS.homeGarden,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    stock: 2,
    tags: ['cedar', 'wardrobe', 'dresser', 'bedroom', 'furniture'],
  },
]

// ─── DON WVRLDWIDE ────────────────────────────────────────────────────────────
const donProducts = [
  {
    name: 'The Conqueror Football Tee – Army Green',
    description: '100% polyester unisex athletic-fit football tee. Features crewneck, contrasting black piping, front/side/back mesh panels for ventilation, DON WVRLDWIDE football patch and word logo embroidered to front, الفاتح (Conqueror) printed at front, "Destined to Conquer" at back of neck, and WVRLDWIDE at back. Size up for relaxed fit.',
    price: 350,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_TheconquerorfootballteePRE-ORDERARMYGREENcopy2.png?v=1772771276',
    ],
    stock: 20,
    tags: ['tee', 'conqueror', 'football', 'athletic'],
  },
  {
    name: 'The Conqueror Football Tee – Red',
    description: '100% polyester unisex athletic-fit football tee. White piping detail, front/side/back mesh panels, DON WVRLDWIDE embroidered logos, الفاتح (Conqueror) printed at front, "Destined to Conquer" at back of neck, WVRLDWIDE at back.',
    price: 350,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_NEW_The_conqueror_football_tee_115_color_intensity_red_front_copy.png?v=1766444669',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_back_The_conqueror_football_tee_red_copy_2.png?v=1766444788',
    ],
    stock: 25,
    tags: ['tee', 'conqueror', 'football', 'red'],
  },
  {
    name: 'The Conqueror Football Tee – Black/Gold',
    description: '100% polyester unisex athletic-fit football tee. Gold piping detail, front/side/back mesh panels, DON WVRLDWIDE embroidered logos, الفاتح (Conqueror) at front, "Destined to Conquer" at back neck, WVRLDWIDE at back.',
    price: 350,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_NEW_The_conqueror_football_tee_115_color_intensity_black_and_gold_front_copy_2.png?v=1766447284',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_back_The_conqueror_football_tee_black_and_gold_copy_2.png?v=1766447161',
    ],
    stock: 20,
    tags: ['tee', 'conqueror', 'football', 'black', 'gold'],
  },
  {
    name: 'The Conqueror Football Tee – Pink',
    description: '100% polyester unisex athletic-fit football tee. Black piping detail, front/side/back mesh panels, DON WVRLDWIDE embroidered logos, الفاتح (Conqueror) at front, "Destined to Conquer" at back neck, WVRLDWIDE at back.',
    price: 350,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_Lighter_NEW_The_conqueror_football_tee_115_color_intensity_pink_copy.png?v=1765568237',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_Lighter_NEW_back_The_conqueror_football_tee_115_color_intensity_pink_copy.png?v=1765568237',
    ],
    stock: 20,
    tags: ['tee', 'conqueror', 'football', 'pink'],
  },
  {
    name: 'The Conqueror Football Tee – White',
    description: '100% polyester unisex athletic-fit football tee. Black & red piping detail, front/side/back mesh panels, DON WVRLDWIDE embroidered logos, الفاتح (Conqueror) at front, "Destined to Conquer" at back neck, WVRLDWIDE at back.',
    price: 350,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_NEWTheconquerorfootballtee200colorintensitywhitecopy2.png?v=1736276708',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/website_NEW_back_The_conqueror_football_tee_200_color_intensity_white_copy_3.png?v=1736277199',
    ],
    stock: 20,
    tags: ['tee', 'conqueror', 'football', 'white'],
  },
  {
    name: 'The Motto Zip-Up Hoodie – White/Black Print',
    description: 'Cotton/poly fleece zip-up hoodie with full front, back and hood screen-printed design. Adjustable drawstring, double-lined hood, pouch pocket, metal zip, ribbing at bottom. Fits true to size. Weight: 8 oz.',
    price: 380,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/ZIPUPHOODIEWHITE.png?v=1701044143',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/ZIPUPHOODIEWHITEBACK.png?v=1701044152',
    ],
    stock: 15,
    tags: ['hoodie', 'zip-up', 'motto', 'white'],
  },
  {
    name: 'The Motto Pullover Hoodie – Baby Pink/Black Print',
    description: 'Cotton/poly fleece pullover hoodie with front, back and hood screen-printed design. Adjustable drawstring, double-lined hood, pouch pocket. Fits true to size. Weight: 8 oz. Limited time colourway.',
    price: 360,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THE_MOTTO_PINK_FRONT_WEBSITE_copy.png?v=1739254542',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THE_MOTTO_BABY_PINK_BACK_HOODIE_WEBSITE_copy.png?v=1739254732',
    ],
    stock: 15,
    tags: ['hoodie', 'pullover', 'motto', 'pink'],
  },
  {
    name: 'The Motto Pullover Hoodie – Black/Pink Print',
    description: 'Cotton/poly fleece pullover with front, back and hood screen-printed pink graphics. Adjustable drawstring, double-lined hood, pouch pocket. Fits true to size. Weight: 8 oz.',
    price: 310,
    comparePrice: 360,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOBLACK_PINKPRINT_FRONTWEBSITEcopy.png?v=1765151244',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/Themottohoodiezipuppinkprintbackweb_69a107e3-256b-4b72-a44f-b047824b7823.png?v=1765151361',
    ],
    stock: 15,
    tags: ['hoodie', 'pullover', 'motto', 'black'],
  },
  {
    name: 'The Motto Pullover Hoodie – Black/Charcoal Print',
    description: 'Cotton/poly fleece pullover with front, back and hood screen-printed charcoal graphics. Adjustable drawstring, double-lined hood, pouch pocket. Fits true to size. Weight: 8 oz.',
    price: 310,
    comparePrice: 360,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOBLACKFRONTWEBSITEcopy.png?v=1765150157',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOBACKHOODIE.png?v=1700088947',
    ],
    stock: 15,
    tags: ['hoodie', 'pullover', 'motto', 'black', 'charcoal'],
  },
  {
    name: 'Enforcer Hoodie – Black',
    description: 'Cotton/poly fleece hoodie with front and back screen-printed "Enforcer" graphics. Adjustable drawstring, double-lined hood, pouch pocket. Fits true to size. Weight: 8 oz.',
    price: 360,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/WEBSITE_ENFORCER_HOODIE_FRONT.png?v=1746242105',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/WEBSITE_ENFORCER_HOODIE_BLACK_BACK.png?v=1746242113',
    ],
    stock: 20,
    tags: ['hoodie', 'enforcer', 'black'],
  },
  {
    name: 'My Year Hoodie 2025 – Black/Red & White Print',
    description: 'Cotton/poly fleece hoodie with front, back and sleeve screen-printed "My Year 2025" design. Adjustable drawstring, double-lined hood, pouch pocket. Fits true to size. Weight: 8 oz.',
    price: 280,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/MY_YEAR_HOODIE_2025_front_BLACK_WEBSITE_copy.png?v=1733878405',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/MY_YEAR_HOODIE_2025_BACK_BLACK_WEBSITE_copy.png?v=1733878405',
    ],
    stock: 15,
    tags: ['hoodie', 'my year', '2025', 'limited edition'],
  },
  {
    name: 'The Motto Tee – White/Black Print',
    description: '100% combed ring-spun cotton with side seaming. Front and back screen-printed "The Motto" graphics in black. Fits true to size. Weight: 4.3 oz.',
    price: 210,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOTEEFRONTWHITEcopy.png?v=1734494781',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOTEEwebsiteBACKcopy.png?v=1734494781',
    ],
    stock: 30,
    tags: ['tee', 'motto', 'white'],
  },
  {
    name: 'The Motto Tee – Black/Charcoal Print',
    description: '100% combed ring-spun cotton with side seaming. Front and back screen-printed "The Motto" graphics in charcoal. Fits true to size. Weight: 4.3 oz.',
    price: 210,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOTEEFRONTcopy.png?v=1703215828',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THEMOTTOTEEwebsite.png?v=1703215828',
    ],
    stock: 30,
    tags: ['tee', 'motto', 'black'],
  },
  {
    name: 'The Motto Tee – Black/Pink Print',
    description: '100% combed ring-spun cotton with side seaming. Front and back screen-printed "The Motto" graphics in pink. Fits true to size. Weight: 4.3 oz.',
    price: 210,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THE_MOTTO_TEE_FRONT_PINK_copy.png?v=1741644140',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/THE_MOTTO_TEE_website_BACK_PINK_copy.png?v=1741644148',
    ],
    stock: 30,
    tags: ['tee', 'motto', 'black', 'pink'],
  },
  {
    name: 'My Year Tee 2025 – Black/Pink & White Print',
    description: '100% combed ring-spun cotton with side seaming. Front and back screen-printed "My Year 2025" design. Fits true to size. Weight: 4.3 oz.',
    price: 220,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/My_year_tee_2025_front_pink_and_black_copy.png?v=1741643989',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/MY_YEAR_TEE_website_BACK_PINK.png?v=1741643998',
    ],
    stock: 25,
    tags: ['tee', 'my year', '2025', 'limited edition'],
  },
  {
    name: 'Loyalty Shorts',
    description: '65% cotton / 35% poly French terry shorts with front and back screen-printed "Loyalty" design. Adjustable waist drawstring with metal aglets, 2 side pockets and 1 back pocket. Size up recommended.',
    price: 300,
    comparePrice: null,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/loyaltyshorts.png?v=1689307176',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/Loyaltyshorts.png?v=1689307176',
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/Loyaltyshortsbackpocket.png?v=1689307176',
    ],
    stock: 20,
    tags: ['shorts', 'loyalty', 'fleece'],
  },
  {
    name: 'Box Logo Bucket Hat – Black',
    description: '100% cotton bucket hat featuring the DON WVRLDWIDE box logo printed on the front panel. One size fits all. Classic streetwear silhouette.',
    price: 120,
    comparePrice: 200,
    images: [
      'https://cdn.shopify.com/s/files/1/0751/9463/0448/files/Buckethat.png?v=1684202691',
    ],
    stock: 30,
    tags: ['hat', 'bucket hat', 'logo', 'accessories'],
  },
]

// ─── D'BEST TOYS ──────────────────────────────────────────────────────────────
const toysProducts = [
  {
    name: 'Hot Wheels Assorted Single Cars',
    description: 'Authentic Hot Wheels die-cast single car. Assorted styles and colours — one car per purchase, chosen at random. Perfect for collectors and kids aged 3+. 1:64 scale.',
    price: 20,
    comparePrice: 35,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/products/brands/hot-wheels/hotwheels-single-car-400x400.jpg',
    ],
    stock: 200,
    tags: ['hot wheels', 'die-cast', 'cars', 'mattel', 'collectible'],
  },
  {
    name: 'Early Steps 2-in-1 Play & Learn Musical Learning Table',
    description: 'Interactive musical learning table that converts from a floor play mat to a sit-to-stand table. Features lights, sounds, songs and educational activities to develop motor skills and cognitive abilities. Ages 6 months+.',
    price: 159,
    comparePrice: 240,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/2024/06/Early-Steps-2-in-1-Play-And-learn-Musical-Learning-Table--300x300.jpg',
    ],
    stock: 15,
    tags: ['educational', 'musical', 'learning table', 'baby', 'toddler'],
  },
  {
    name: 'Baby World Sit & Play Activity Gym',
    description: 'Multi-sensory baby activity gym with play mat, hanging toys, mirror and crinkle elements. Supports tummy time, reaching and kicking development. Soft machine-washable mat. Ages 0–12 months.',
    price: 149,
    comparePrice: 250,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/2024/06/Baby-Activity-Play-Mat-300x300.jpg',
    ],
    stock: 20,
    tags: ['baby', 'activity gym', 'play mat', 'infant'],
  },
  {
    name: 'Number Balloon',
    description: 'Shiny foil number balloon perfect for birthdays, graduations and celebrations. Available in gold and silver. Numbers 0–9. Approx. 40" tall. Can be filled with helium or air.',
    price: 18,
    comparePrice: 20,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/products/categories/party/Number-Balloon-7-400x400.jpg',
      'https://www.dbesttoys.com/wp-content/uploads/products/categories/party/Number-Balloon-8-400x400.jpg',
    ],
    stock: 100,
    tags: ['balloon', 'party', 'birthday', 'celebration'],
  },
  {
    name: 'INTEX 3D Bop Bag – Dinosaur (Inflatable Punching Bag)',
    description: 'INTEX 3D dinosaur-shaped inflatable bop bag for active play. Features a sand or water-weighted base that makes it spring back after each punch or kick. Great for energy release and coordination. Ages 3+. Height approx. 44".',
    price: 55,
    comparePrice: 79,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/Products/Brands/Intex/INTEX-3D-Bop-Bag-Dinosaur-Inflatable-Blow-Up-Punching-Bag1-600x600.jpg',
    ],
    stock: 25,
    tags: ['intex', 'bop bag', 'inflatable', 'punching bag', 'outdoor'],
  },
  {
    name: 'INTEX 3D Bop Bag – Dolphin (Inflatable Punching Bag)',
    description: 'INTEX 3D dolphin-shaped inflatable bop bag for active play. Sand or water-weighted base springs back after every hit. Fun indoor/outdoor toy. Ages 3+. Height approx. 44".',
    price: 49,
    comparePrice: 79,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/Products/Brands/Intex/intex-bop-bag-dolphin.jpg',
    ],
    stock: 20,
    tags: ['intex', 'bop bag', 'inflatable', 'dolphin', 'outdoor'],
  },
  {
    name: 'Super Clay Dinosaur Set',
    description: 'Creative air-dry clay set featuring dinosaur moulds, sculpting tools and bright coloured clay. Kids can sculpt, create and display their own dinosaur figures. Non-toxic and safe. Ages 4+.',
    price: 15,
    comparePrice: 28,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/pictures-to-fix/airclay-dinosaur-1-400x400.jpg',
    ],
    stock: 50,
    tags: ['clay', 'arts and crafts', 'dinosaur', 'creative', 'kids'],
  },
  {
    name: "Dr. Brown's Natural Flow® Deluxe Baby Bottle Sterilizer",
    description: "Dr. Brown's electric steam sterilizer accommodates up to 6 Dr. Brown's wide or standard neck bottles plus accessories. Kills 99.9% of household germs naturally using steam — no chemicals needed. Auto shut-off for safety.",
    price: 689,
    comparePrice: 999,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/2021/03/Dr.-Browns-Natural-Flow-Deluxe-Baby-Bottle-Sterilizer-300x300.jpg',
    ],
    stock: 10,
    tags: ['dr. brown', 'sterilizer', 'baby', 'bottle', 'infant'],
  },
  {
    name: "Dr. Brown's Natural Flow® Folding Bottle Drying Rack",
    description: "Dr. Brown's foldable drying rack accommodates bottles, parts and accessories of all sizes. Folds flat for easy storage. Soft-touch pegs protect bottle surfaces. Dishwasher safe.",
    price: 199,
    comparePrice: 225,
    images: [
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80',
    ],
    stock: 20,
    tags: ['dr. brown', 'drying rack', 'baby', 'bottle'],
  },
  {
    name: 'Uno Stacko Mini',
    description: 'The classic Uno Stacko tumbling tower game in a compact mini size — perfect for travel and family game nights. Remove and stack blocks while keeping the tower standing. First player to topple the tower loses.',
    price: 45,
    comparePrice: null,
    images: [
      'https://www.dbesttoys.com/wp-content/uploads/Products/Categories/Musical/Family-Fun-Toys/282dd7b0-49cd-4243-a562-0235372a9b66-400x400.jpg',
    ],
    stock: 30,
    tags: ['uno', 'stacko', 'board game', 'family', 'cards'],
  },
  {
    name: 'Gel Blaster – White',
    description: 'High-performance gel blaster that shoots water-absorbent gel beads. Includes a 24-round magazine and gel bead pack. Battery-powered semi/full-auto mode. Safe, eco-friendly gel beads dissolve in water. Ages 14+.',
    price: 269,
    comparePrice: 319,
    images: [
      'https://images.unsplash.com/photo-1580745277246-0bc3bbff7e94?w=600&q=80',
    ],
    stock: 15,
    tags: ['gel blaster', 'outdoor', 'action', 'toy gun'],
  },
  {
    name: "Step2 Fun With Friends Kitchen Playset",
    description: "Step2 large-scale pretend play kitchen featuring realistic interactive appliances, multiple countertop and play areas. Includes 45 piece accessory set with pots, pans, play food and utensils. Realistic sounds and lights. Ages 2–6.",
    price: 1299,
    comparePrice: null,
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
    ],
    stock: 5,
    tags: ['step2', 'kitchen', 'pretend play', 'role play', 'toddler'],
  },
]

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🛍️  Uploading real products to zip.tt...\n')

  // Remove old seeded products for the three vendors
  console.log('🗑️  Clearing existing products for these vendors...')
  await prisma.cartItem.deleteMany({ where: { product: { vendorId: { in: Object.values(VENDORS) } } } })
  await prisma.orderItem.deleteMany({ where: { product: { vendorId: { in: Object.values(VENDORS) } } } })
  await prisma.review.deleteMany({ where: { product: { vendorId: { in: Object.values(VENDORS) } } } })
  await prisma.product.deleteMany({ where: { vendorId: { in: Object.values(VENDORS) } } })
  console.log('  ✅  Old products cleared\n')

  // ── Elite Home Decor ────────────────────────────────────────────────────────
  console.log('🏠  Uploading Elite Home Decor products...')
  for (const p of eliteProducts) {
    const productSlug = `elite-${slug(p.name)}`
    await prisma.product.create({
      data: {
        vendorId: VENDORS.eliteHomeDecor,
        categoryId: p.categoryId,
        name: p.name,
        slug: productSlug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: JSON.stringify(p.images),
        stock: p.stock,
        tags: JSON.stringify(p.tags),
        status: 'ACTIVE',
        featured: false,
      },
    })
    console.log(`  ✔  ${p.name} — $${p.price}`)
  }

  // ── Don Wvrldwide ────────────────────────────────────────────────────────────
  console.log('\n👕  Uploading Don Wvrldwide products...')
  for (const p of donProducts) {
    const productSlug = `don-${slug(p.name)}`
    await prisma.product.create({
      data: {
        vendorId: VENDORS.donWvrldwide,
        categoryId: CATS.urbanFashion,
        name: p.name,
        slug: productSlug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: JSON.stringify(p.images),
        stock: p.stock,
        tags: JSON.stringify(p.tags),
        status: 'ACTIVE',
        featured: false,
      },
    })
    console.log(`  ✔  ${p.name} — $${p.price}`)
  }

  // ── D'Best Toys ──────────────────────────────────────────────────────────────
  console.log("\n🧸  Uploading D'Best Toys products...")
  for (const p of toysProducts) {
    const productSlug = `dbest-${slug(p.name)}`
    await prisma.product.create({
      data: {
        vendorId: VENDORS.dBestToys,
        categoryId: CATS.toys,
        name: p.name,
        slug: productSlug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: JSON.stringify(p.images),
        stock: p.stock,
        tags: JSON.stringify(p.tags),
        status: 'ACTIVE',
        featured: false,
      },
    })
    console.log(`  ✔  ${p.name} — $${p.price}`)
  }

  const total = eliteProducts.length + donProducts.length + toysProducts.length
  console.log(`\n✅  Done! Uploaded ${total} real products:`)
  console.log(`   🏠  Elite Home Decor : ${eliteProducts.length}`)
  console.log(`   👕  Don Wvrldwide    : ${donProducts.length}`)
  console.log(`   🧸  D'Best Toys      : ${toysProducts.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
