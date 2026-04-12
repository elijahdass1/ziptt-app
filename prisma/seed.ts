import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding zip.tt database...')

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'groceries' }, update: {}, create: { name: 'Groceries & Food', slug: 'groceries', icon: '🛒', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' } }),
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', icon: '📱', image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400' } }),
    prisma.category.upsert({ where: { slug: 'fashion' }, update: {}, create: { name: 'Fashion & Clothing', slug: 'fashion', icon: '👗', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' } }),
    prisma.category.upsert({ where: { slug: 'home-garden' }, update: {}, create: { name: 'Home & Garden', slug: 'home-garden', icon: '🏡', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400' } }),
    prisma.category.upsert({ where: { slug: 'beauty' }, update: {}, create: { name: 'Beauty & Health', slug: 'beauty', icon: '💄', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' } }),
    prisma.category.upsert({ where: { slug: 'services' }, update: {}, create: { name: 'Services', slug: 'services', icon: '🔧', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' } }),
    prisma.category.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports & Fitness', slug: 'sports', icon: '⚽', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' } }),
    prisma.category.upsert({ where: { slug: 'automotive' }, update: {}, create: { name: 'Automotive', slug: 'automotive', icon: '🚗', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400' } }),
    prisma.category.upsert({ where: { slug: 'carnival' }, update: {}, create: { name: 'Carnival & Mas', slug: 'carnival', icon: '🎭', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400' } }),
    prisma.category.upsert({ where: { slug: 'rum-spirits' }, update: {}, create: { name: 'Rum & Spirits', slug: 'rum-spirits', icon: '🥃', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400' } }),
    prisma.category.upsert({ where: { slug: 'urban-fashion' }, update: {}, create: { name: 'Urban Fashion & Streetwear', slug: 'urban-fashion', icon: '🧢', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400' } }),
    prisma.category.upsert({ where: { slug: 'toys' }, update: {}, create: { name: 'Toys, Games & Kids', slug: 'toys', icon: '🧸', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400' } }),
    prisma.category.upsert({ where: { slug: 'appliances' }, update: {}, create: { name: 'Appliances & Home', slug: 'appliances', icon: '🏠', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400' } }),
  ])

  const [groceries, electronics, fashion, homeGarden, beauty, services, sports, automotive, carnival, rum, urbanFashion, toys, appliances] = categories

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@zip.tt' },
    update: {},
    create: { name: 'Zip Admin', email: 'admin@zip.tt', password: adminPassword, role: 'ADMIN', emailVerified: new Date() },
  })

  // ─── Vendor Users & Vendors ────────────────────────────────────────────────
  const vendorPassword = await bcrypt.hash('vendor123', 10)

  const vendor1User = await prisma.user.upsert({ where: { email: 'trini.tech@zip.tt' }, update: {}, create: { name: 'Kamla Ramsaran', email: 'trini.tech@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })
  const vendor2User = await prisma.user.upsert({ where: { email: 'mas.camp@zip.tt' }, update: {}, create: { name: 'Dexter Williams', email: 'mas.camp@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })
  const vendor3User = await prisma.user.upsert({ where: { email: 'doubles.queen@zip.tt' }, update: {}, create: { name: 'Sasha Mohammed', email: 'doubles.queen@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })
  const vendor4User = await prisma.user.upsert({ where: { email: 'don.wvrldwide@zip.tt' }, update: {}, create: { name: 'Don Wvrldwide', email: 'don.wvrldwide@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })
  const vendor5User = await prisma.user.upsert({ where: { email: 'dbest.toys@zip.tt' }, update: {}, create: { name: 'D\'Best Toys TT', email: 'dbest.toys@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })
  const vendor6User = await prisma.user.upsert({ where: { email: 'elite.homedecor@zip.tt' }, update: {}, create: { name: 'Elite Home Decor', email: 'elite.homedecor@zip.tt', password: vendorPassword, role: 'VENDOR', emailVerified: new Date() } })

  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendor1User.id }, update: {},
    create: { userId: vendor1User.id, storeName: 'Trini Tech Hub', slug: 'trini-tech-hub', description: 'Your one-stop shop for all electronics and gadgets in Trinidad. We carry top brands at competitive prices.', logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200', banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', phone: '+1-868-555-0101', address: '45 Frederick Street, Port of Spain', region: 'Port of Spain', status: 'APPROVED', rating: 4.7, totalSales: 312, commission: 10 },
  })
  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendor2User.id }, update: {},
    create: { userId: vendor2User.id, storeName: "D'Mas Camp", slug: 'dmas-camp', description: "Trinidad's finest Carnival costumes, accessories and mas essentials. Wining since 1987!", logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200', banner: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', phone: '+1-868-555-0202', address: '12 Ariapita Avenue, Woodbrook', region: 'Port of Spain', status: 'APPROVED', rating: 4.9, totalSales: 856, commission: 10 },
  })
  const vendor3 = await prisma.vendor.upsert({
    where: { userId: vendor3User.id }, update: {},
    create: { userId: vendor3User.id, storeName: "Sasha's Gourmet", slug: 'sashas-gourmet', description: 'Authentic Trinidadian groceries, spices, and gourmet food items. Delivery across Trinidad.', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800', phone: '+1-868-555-0303', address: '7 Southern Main Road, Chaguanas', region: 'Chaguanas', status: 'APPROVED', rating: 4.6, totalSales: 1240, commission: 10 },
  })
  const vendor4 = await prisma.vendor.upsert({
    where: { userId: vendor4User.id }, update: {},
    create: { userId: vendor4User.id, storeName: 'Don Wvrldwide', slug: 'don-wvrldwide', description: 'Premium streetwear, exclusively curated for the Caribbean lifestyle. Repping Port of Spain to the world.', logo: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=200', banner: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800', phone: '+1-868-555-0404', address: '28 Henry Street, Port of Spain', region: 'Port of Spain', status: 'APPROVED', rating: 4.9, totalSales: 94, commission: 10 },
  })
  const vendor5 = await prisma.vendor.upsert({
    where: { userId: vendor5User.id }, update: { totalSales: 534 },
    create: { userId: vendor5User.id, storeName: "D'Best Toys", slug: 'dbest-toys', description: "Making childhood magical — Trinidad's #1 toy destination. Serving families across Chaguanas and beyond.", logo: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200', banner: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=800', phone: '+1-868-312-8697', address: '14 Carpark Road, Chaguanas', region: 'Chaguanas', status: 'APPROVED', rating: 4.7, totalSales: 534, commission: 10 },
  })
  const vendor6 = await prisma.vendor.upsert({
    where: { userId: vendor6User.id }, update: {},
    create: { userId: vendor6User.id, storeName: 'Elite Home Decor', slug: 'elite-home-decor', description: 'Quality furniture, appliances & household items at affordable prices. Serving Arouca and all of Trinidad.', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200', banner: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', phone: '+1-868-472-0865', address: 'LP2 Hillview Drive, Arouca', region: 'Arouca', status: 'APPROVED', rating: 4.5, totalSales: 189, commission: 10 },
  })

  // ─── Products ──────────────────────────────────────────────────────────────
  const products = [
    // Trini Tech Hub
    { vendorId: vendor1.id, categoryId: electronics.id, name: 'Samsung Galaxy A55 5G', slug: 'samsung-galaxy-a55-5g', description: 'Experience lightning-fast 5G connectivity in Trinidad with the Samsung Galaxy A55. Features a stunning 6.6" Super AMOLED display, 50MP camera, and 5000mAh battery.', price: 3499.00, comparePrice: 3999.00, images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'], stock: 25, sku: 'SAM-A55-5G', tags: ['samsung', '5g', 'smartphone'], status: 'ACTIVE', featured: true, rating: 4.6, reviewCount: 23, soldCount: 48 },
    { vendorId: vendor1.id, categoryId: electronics.id, name: 'JBL Charge 5 Bluetooth Speaker', slug: 'jbl-charge-5-bluetooth-speaker', description: 'Bring the vibes to every lime with the JBL Charge 5! IP67 waterproof, 20 hours of playtime, and built-in power bank.', price: 1299.00, comparePrice: 1599.00, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'], stock: 40, sku: 'JBL-CHG5', tags: ['jbl', 'bluetooth', 'speaker'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 67, soldCount: 134 },
    { vendorId: vendor1.id, categoryId: electronics.id, name: 'Apple AirPods Pro (2nd Gen)', slug: 'apple-airpods-pro-2nd-gen', description: 'Active Noise Cancellation blocks out the noise. Adaptive Transparency lets you hear what you need. Up to 30 hours of battery life.', price: 1899.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600'], stock: 15, sku: 'APP-AIRPRO2', tags: ['apple', 'airpods', 'earphones'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 112, soldCount: 220 },
    { vendorId: vendor1.id, categoryId: electronics.id, name: 'Anker PowerCore 26800mAh Power Bank', slug: 'anker-powercore-26800', description: "Never run out of juice at Carnival with this massive 26800mAh power bank. Charge your phone multiple times over.", price: 549.00, comparePrice: 699.00, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600'], stock: 60, sku: 'ANK-PC268', tags: ['anker', 'power bank'], status: 'ACTIVE', featured: false, rating: 4.5, reviewCount: 34, soldCount: 89 },
    // D'Mas Camp
    { vendorId: vendor2.id, categoryId: carnival.id, name: 'Carnival Full Costume — "Golden Dynasty"', slug: 'carnival-full-costume-golden-dynasty', description: 'Make a statement on the road with our stunning Golden Dynasty full costume! Includes feathered headpiece, decorated bra, beaded shorts, back pack, arm bands, and leg pieces.', price: 4500.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'], stock: 50, sku: 'CARN-GD-FULL', tags: ['carnival', 'costume', 'mas'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 89, soldCount: 203 },
    { vendorId: vendor2.id, categoryId: carnival.id, name: 'Soca Fest Tank Top Bundle (3-Pack)', slug: 'soca-fest-tank-top-bundle', description: 'Get fete-ready with our exclusive Soca Fest tank tops! Moisture-wicking fabric, bold Trini flag design. Pack includes 3 tanks.', price: 275.00, comparePrice: 375.00, images: ['https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=600'], stock: 200, sku: 'SOCA-TANK-3PK', tags: ['soca', 'fete', 'carnival'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 156, soldCount: 342 },
    { vendorId: vendor2.id, categoryId: fashion.id, name: 'Trini Pride Snapback Cap', slug: 'trini-pride-snapback-cap', description: 'Rep your island! Embroidered Trinidad & Tobago crest with "Bacchanal Island" script. One size fits most.', price: 185.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'], stock: 150, sku: 'TRINI-CAP-01', tags: ['trinidad', 'cap', 'hat'], status: 'ACTIVE', featured: false, rating: 4.6, reviewCount: 43, soldCount: 97 },
    // Sasha's Gourmet
    { vendorId: vendor3.id, categoryId: groceries.id, name: 'Shadow Beni Bundle (6 packs)', slug: 'shadow-beni-bundle-6-packs', description: 'Fresh bandanya (shadow beni / chadon beni) sourced from local farmers in Maraval. Essential for any Trini kitchen. Makes the best green seasoning!', price: 48.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600'], stock: 100, sku: 'HERB-SBENI-6', tags: ['shadow beni', 'herbs', 'seasoning'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 234, soldCount: 1102 },
    { vendorId: vendor3.id, categoryId: groceries.id, name: "Mama's Green Seasoning (500ml)", slug: 'mamas-green-seasoning-500ml', description: "Sasha's signature green seasoning recipe handed down from her grandmother. Perfect blend of shadow beni, garlic, chive, thyme and peppers.", price: 89.00, comparePrice: 110.00, images: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600'], stock: 85, sku: 'SEAS-GREEN-500', tags: ['green seasoning', 'trinidadian'], status: 'ACTIVE', featured: true, rating: 5.0, reviewCount: 312, soldCount: 891 },
    { vendorId: vendor3.id, categoryId: rum.id, name: 'Angostura 1919 Rum (750ml)', slug: 'angostura-1919-rum-750ml', description: 'Award-winning premium Trinidad rum aged 8 years in hand-crafted oak barrels. Smooth, with notes of vanilla, almond and coconut.', price: 299.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600'], stock: 45, sku: 'RUM-ANG-1919', tags: ['angostura', 'rum', 'premium'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 178, soldCount: 445 },
    { vendorId: vendor3.id, categoryId: groceries.id, name: 'Grace Coconut Milk 12-Pack', slug: 'grace-coconut-milk-12-pack', description: 'Authentic coconut milk — essential for oil-down, callaloo, pelau and rice dishes. Pack of 12 cans (400ml each).', price: 144.00, comparePrice: 168.00, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'], stock: 120, sku: 'COCO-GRACE-12', tags: ['coconut milk', 'cooking'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 89, soldCount: 567 },
    { vendorId: vendor3.id, categoryId: groceries.id, name: 'Chief Curry Powder Combo (3 flavours)', slug: 'chief-curry-powder-combo', description: "Chief brand — Trinidad's #1 curry powder! Combo includes Mild, Medium Hot, and Trinidadian Blend (225g each).", price: 95.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'], stock: 200, sku: 'CHIEF-CURRY-3', tags: ['chief', 'curry', 'spices'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 445, soldCount: 1234 },
    // Don Wvrldwide (real products from donwvrldwide.com)
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Conqueror Football Tee — Black & Gold', slug: 'dw-conqueror-tee-black-gold', description: 'The signature Don Wvrldwide piece in the iconic Black & Gold colorway. Screen-printed Conqueror design. 100% combed cotton. Repping Port of Spain to the world. Sizes S–3XL.', price: 350.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/website_NEW_The_conqueror_football_tee_115_color_intensity_black_and_gold_front_copy_2.png?v=1766447284&width=600'], stock: 20, sku: 'DW-CONQ-BG', tags: ['tee', 'conqueror', 'streetwear', 'black gold'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 67, soldCount: 143 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Conqueror Football Tee — Army Green', slug: 'dw-conqueror-tee-army-green', description: 'Pre-Order drop — Army Green Conqueror Tee. The freshest colorway in the lineup. Screen-printed front & back design. 100% combed cotton. Sizes S–3XL.', price: 350.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/website_TheconquerorfootballteePRE-ORDERARMYGREENcopy2.png?v=1772771276&width=600'], stock: 12, sku: 'DW-CONQ-AG', tags: ['tee', 'conqueror', 'pre-order', 'army green'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 18, soldCount: 29 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Conqueror Football Tee — White', slug: 'dw-conqueror-tee-white', description: 'Clean white Conqueror Tee. Bold black & red screen-printed design. The staple piece from Don Wvrldwide. 100% combed cotton, 200 colour intensity print. Sizes S–3XL.', price: 350.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/website_NEWTheconquerorfootballtee200colorintensitywhitecopy2.png?v=1736276708&width=600'], stock: 22, sku: 'DW-CONQ-WH', tags: ['tee', 'conqueror', 'white', 'streetwear'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 45, soldCount: 98 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'The Motto Tee — Black/Pink', slug: 'dw-motto-tee-black-pink', description: '"Wear the tee. Live the message." The Motto Tee in Black with Pink print. Front & back graphic. 100% combed cotton. From $210 TTD. Sizes S–3XL.', price: 210.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/THE_MOTTO_TEE_FRONT_PINK_copy.png?v=1741644140&width=600'], stock: 25, sku: 'DW-MOTTO-BP', tags: ['tee', 'motto', 'pink', 'streetwear'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 52, soldCount: 112 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'The Motto Tee — White/Black', slug: 'dw-motto-tee-white-black', description: '"Wear the tee. Live the message." The Motto Tee in White with Black print. A Don Wvrldwide classic. Front & back graphic. 100% combed cotton. Sizes S–3XL.', price: 210.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/THEMOTTOTEEFRONTWHITEcopy.png?v=1734494781&width=600'], stock: 30, sku: 'DW-MOTTO-WB', tags: ['tee', 'motto', 'white', 'streetwear'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 78, soldCount: 156 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Loyalty Hoodie — Black', slug: 'dw-loyalty-hoodie-black', description: 'Don Wvrldwide Loyalty Cut Crop Hoodie in all-black. Premium heavyweight fleece with Loyalty branding front & back. Oversized fit. From $380 TTD. Sizes S–3XL.', price: 380.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/LOYALTY_CUT_CROP_HOODIE_FRONT_copy_2_0a7d482b-1933-4a5b-8fcc-c4da9f1d67b1.png?v=1734017187&width=600'], stock: 14, sku: 'DW-LOYAL-HOOD', tags: ['hoodie', 'loyalty', 'black', 'streetwear'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 34, soldCount: 71 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Enforcer Hoodie — Black', slug: 'dw-enforcer-hoodie-black', description: 'The Enforcer Hoodie — newest release from Don Wvrldwide. Heavyweight fleece, bold Enforcer graphic front & back. Black on black design. From $360 TTD. Sizes S–3XL.', price: 360.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/WEBSITE_ENFORCER_HOODIE_FRONT.png?v=1746242105&width=600'], stock: 18, sku: 'DW-ENF-HOOD', tags: ['hoodie', 'enforcer', 'new', 'streetwear'], status: 'ACTIVE', featured: true, rating: 5.0, reviewCount: 12, soldCount: 24 },
    { vendorId: vendor4.id, categoryId: urbanFashion.id, name: 'Conqueror Crew Socks — 3 Pack', slug: 'dw-conqueror-crew-socks', description: 'Don Wvrldwide branded crew socks in black with gold Conqueror logo. Cushioned sole, arch support. 3 pairs per pack. One size fits UK 6–12. Essential to complete the look.', price: 204.00, comparePrice: null, images: ['https://donwvrldwide.com/cdn/shop/files/Socks_3_pack_copy_2.png?v=1733077589&width=600'], stock: 35, sku: 'DW-SOCK-3PK', tags: ['socks', 'accessories', 'conqueror', 'crew socks'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 41, soldCount: 98 },
    // D'Best Toys (real products and prices from dbesttoys.com)
    { vendorId: vendor5.id, categoryId: toys.id, name: 'LEGO City Police Station', slug: 'lego-city-police-station', description: '743 pieces. Ages 6+. Build the LEGO City Police Station with jail, garage and helicopter pad. Includes 5 minifigures. Save TTD$30 off regular price.', price: 269.00, comparePrice: 299.00, images: ['https://m.media-amazon.com/images/I/71cLQcFKNqL._AC_SL500_.jpg'], stock: 14, sku: 'LEGO-CPS-743', tags: ['lego', 'building', 'city', 'ages 6+'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 387, soldCount: 145 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Barbie Dreamhouse 2024', slug: 'barbie-dreamhouse-2024', description: '3-story Barbie Dreamhouse with working elevator, pool, slide and 75+ accessories. Lights & sounds included. Ages 3+. Save TTD$250 off regular price.', price: 2649.00, comparePrice: 2899.00, images: ['https://m.media-amazon.com/images/I/819FZXIRuLL._AC_SL500_.jpg'], stock: 9, sku: 'BARBIE-DH-24', tags: ['barbie', 'dreamhouse', 'girls', 'ages 3+'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 677, soldCount: 89 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Hot Wheels 20-Car Gift Pack', slug: 'hot-wheels-20-car-gift-pack', description: '20 Hot Wheels die-cast 1:64 scale cars in assorted styles & colors. No duplicates. Great starter set for any collector. Ages 3+. Save TTD$51.', price: 269.00, comparePrice: 320.00, images: ['https://m.media-amazon.com/images/I/81XfGVZeZkL._AC_SL500_.jpg'], stock: 25, sku: 'HW-20CAR-GFT', tags: ['hot wheels', 'cars', 'die cast', 'boys', 'ages 3+'], status: 'ACTIVE', featured: false, rating: 4.9, reviewCount: 1203, soldCount: 312 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Nerf Elite 2.0 Commander', slug: 'nerf-elite-2-commander', description: 'Fires up to 27m. 6-dart rotating drum. Includes 12 Elite darts. Perfect for backyard battles. Ages 8+. Save TTD$60 off regular price.', price: 239.00, comparePrice: 299.00, images: ['https://m.media-amazon.com/images/I/81GNuBJFVJL._AC_SL500_.jpg'], stock: 18, sku: 'NERF-E2-CMD', tags: ['nerf', 'blaster', 'outdoor', 'boys', 'ages 8+'], status: 'ACTIVE', featured: false, rating: 4.6, reviewCount: 445, soldCount: 178 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'UNO Card Game', slug: 'uno-card-game', description: 'Classic UNO card game. 108 cards. 2-10 players. Ages 7+. The perfect family game night card game for lime sessions and holidays. Save TTD$10.', price: 49.00, comparePrice: 59.00, images: ['https://m.media-amazon.com/images/I/71XGFAHbKOL._AC_SL500_.jpg'], stock: 40, sku: 'UNO-CLASSIC', tags: ['uno', 'card game', 'family', 'board game', 'ages 7+'], status: 'ACTIVE', featured: false, rating: 4.9, reviewCount: 3456, soldCount: 534 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Monopoly Classic Board Game', slug: 'monopoly-classic-board-game', description: "The world's most popular board game. Buy, sell and trade properties. 2-6 players. Ages 8+. Family game night essential. Save TTD$50.", price: 149.00, comparePrice: 199.00, images: ['https://m.media-amazon.com/images/I/91YNJM4oyhL._AC_SL500_.jpg'], stock: 22, sku: 'MONO-CLASSIC', tags: ['monopoly', 'board game', 'family', 'ages 8+'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 2341, soldCount: 423 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Graco Modes Element Travel System', slug: 'graco-modes-element-travel-system', description: 'All-in-one travel system stroller with infant car seat. One-hand fold, large storage basket. Birth to 22kg. Save TTD$810 — huge value!', price: 2989.00, comparePrice: 3799.00, images: ['https://m.media-amazon.com/images/I/71vYtR5zB2L._AC_SL500_.jpg'], stock: 6, sku: 'GRACO-MODES-EL', tags: ['graco', 'stroller', 'travel system', 'baby'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 203, soldCount: 34 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Baby Alive Sweet Tears Baby', slug: 'baby-alive-sweet-tears', description: 'Baby doll that cries real tears. Comes with bottle, spoon and doll food packets. Ages 3+. Your little one will love feeding and caring for her. Save TTD$100.', price: 299.00, comparePrice: 399.00, images: ['https://m.media-amazon.com/images/I/61TjGQvIFXL._AC_SL500_.jpg'], stock: 15, sku: 'BALIVE-SWT', tags: ['baby alive', 'doll', 'girls', 'ages 3+'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 234, soldCount: 89 },
    // D'Best Toys — expanded catalog
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Graco Slim2Fit 3-in-1 Car Seat', slug: 'graco-slim2fit-3in1-car-seat', description: 'Rear-facing 1.8–13.6kg · Forward-facing 9.1–29.5kg · High-back booster 18.1–45.4kg. Grows with your child. 3 seats in 1. Save TTD$404.', price: 1795.00, comparePrice: 2199.00, images: ['https://m.media-amazon.com/images/I/81CJnPjsF4L._AC_SL500_.jpg'], stock: 8, sku: 'GRACO-SF3IN1', tags: ['graco', 'car seat', 'baby', 'safety'], status: 'ACTIVE', featured: false, rating: 4.9, reviewCount: 445, soldCount: 67 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Barbie Fashionista Doll', slug: 'barbie-fashionista-doll', description: 'Barbie fashion doll with outfit and accessories. Diverse skin tones available. Perfect starter Barbie. Ages 3+. Save TTD$50.', price: 49.00, comparePrice: 99.00, images: ['https://m.media-amazon.com/images/I/71JOBo7XVIL._AC_SL500_.jpg'], stock: 35, sku: 'BARBIE-FASHSTA', tags: ['barbie', 'doll', 'girls', 'ages 3+'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 445, soldCount: 312 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Barbie Color Reveal Doll', slug: 'barbie-color-reveal-doll', description: 'Surprise Color Reveal Barbie! Dip in water to reveal hair color. 6 surprises inside. Ages 3+. Save TTD$140.', price: 389.00, comparePrice: 529.00, images: ['https://m.media-amazon.com/images/I/61WkSbmFoIL._AC_SL500_.jpg'], stock: 14, sku: 'BARBIE-COLREV', tags: ['barbie', 'color reveal', 'surprise', 'girls'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 345, soldCount: 178 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'LEGO Classic Creative Bricks 900pcs', slug: 'lego-classic-creative-bricks-900', description: '900+ classic LEGO bricks in 33 colors. Storage box with sorting lid included. Perfect for unlimited creativity. Ages 4+. Save TTD$60.', price: 199.00, comparePrice: 259.00, images: ['https://m.media-amazon.com/images/I/81KdEuGMvHL._AC_SL500_.jpg'], stock: 20, sku: 'LEGO-CLAS-900', tags: ['lego', 'classic', 'creative', 'ages 4+'], status: 'ACTIVE', featured: false, rating: 4.9, reviewCount: 856, soldCount: 245 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'LEGO NINJAGO Dragon Set', slug: 'lego-ninjago-dragon-set', description: 'Epic LEGO Ninjago dragon with movable wings and jaw. 4 ninja minifigures included. Ages 8+. Save TTD$50.', price: 249.00, comparePrice: 299.00, images: ['https://m.media-amazon.com/images/I/81XfGVZeZkL._AC_SL500_.jpg'], stock: 12, sku: 'LEGO-NIN-DRG', tags: ['lego', 'ninjago', 'dragon', 'ages 8+'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 512, soldCount: 198 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Nerf Fortnite AR-L Blaster', slug: 'nerf-fortnite-arl-blaster', description: 'Motorized Nerf blaster. 20-dart removable clip. Fires 6 darts per second. Ages 8+. Save TTD$50.', price: 349.00, comparePrice: 399.00, images: ['https://m.media-amazon.com/images/I/71c3P4sIXQL._AC_SL500_.jpg'], stock: 10, sku: 'NERF-FN-ARL', tags: ['nerf', 'fortnite', 'motorized', 'ages 8+'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 312, soldCount: 134 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Disney Frozen Elsa Singing Doll', slug: 'disney-frozen-elsa-singing-doll', description: "Elsa sings 'Let It Go' from Frozen. Sparkly blue dress, beautiful hair. Ages 3+. Save TTD$21.", price: 99.00, comparePrice: 120.00, images: ['https://m.media-amazon.com/images/I/61JnNQKPPQL._AC_SL500_.jpg'], stock: 18, sku: 'DISNEY-ELSA', tags: ['disney', 'frozen', 'elsa', 'singing doll', 'girls'], status: 'ACTIVE', featured: false, rating: 4.8, reviewCount: 567, soldCount: 289 },
    { vendorId: vendor5.id, categoryId: toys.id, name: 'Power Wheels Jeep Wrangler 12V', slug: 'power-wheels-jeep-wrangler-12v', description: 'Licensed Jeep Wrangler with working doors, lights and horn. 2 speeds forward + reverse. Ages 3-7. The ultimate ride-on! Save TTD$1,104.', price: 2395.00, comparePrice: 3499.00, images: ['https://m.media-amazon.com/images/I/71gSTiWRBeL._AC_SL500_.jpg'], stock: 4, sku: 'PW-JEEP-12V', tags: ['power wheels', 'jeep', 'ride-on', 'ages 3-7'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 445, soldCount: 56 },
    // Elite Home Decor (real products from facebook.com/elitehomedecor525)
    { vendorId: vendor6.id, categoryId: appliances.id, name: 'Maxsonic 15 cu.ft Refrigerator with Inverter', slug: 'maxsonic-15cuft-fridge-inverter', description: 'Maxsonic 15 cu.ft Refrigerator with Inverter technology. Energy efficient, quiet operation. 1 Year Warranty. Special promo price — limited stock.', price: 4695.00, comparePrice: null, images: ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/655569935_1259509066372066_5075608673823514987_n.jpg'], stock: 5, sku: 'EHD-MAX-15RF', tags: ['maxsonic', 'refrigerator', 'inverter', 'appliance'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 12, soldCount: 23 },
    { vendorId: vendor6.id, categoryId: appliances.id, name: 'Maxsonic 30" 5 Burner Gas Stove with Broiler', slug: 'maxsonic-30inch-gas-stove-broiler', description: 'Maxsonic 30" Stainless Steel 5 Burner Gas Stove with Broiler (MR200). Full stainless steel finish. 1 Year Warranty. Perfect for Trini cooking.', price: 3695.00, comparePrice: null, images: ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/653936933_1259493363040303_6825220363994660625_n.jpg'], stock: 6, sku: 'EHD-MAX-GS30', tags: ['maxsonic', 'gas stove', 'stainless steel', 'appliance'], status: 'ACTIVE', featured: true, rating: 4.9, reviewCount: 8, soldCount: 17 },
    { vendorId: vendor6.id, categoryId: appliances.id, name: 'Premium Platinum 19 cu.ft 4-Door Fridge', slug: 'premium-platinum-19cuft-4door-fridge', description: 'Premium Platinum Edition 19 cu.ft Stainless Steel 4 Door Refrigerator with Water Dispenser. Elegant design, spacious storage. 1 Year Warranty.', price: 5895.00, comparePrice: null, images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], stock: 3, sku: 'EHD-PLAT-4DR', tags: ['refrigerator', 'stainless steel', '4 door', 'water dispenser'], status: 'ACTIVE', featured: true, rating: 4.7, reviewCount: 6, soldCount: 11 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 5 Drawer Chest with Mirror', slug: 'cedar-ply-5-drawer-chest-mirror', description: 'Cedar & Ply 5 Drawer Chest of Drawers with Mirror. H-62" W-33 1/2" D-16 1/2". Solid construction, natural finish. Was $1,395 — Now on Sale.', price: 1295.00, comparePrice: 1395.00, images: ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651179612_1257839846538988_7798360715653517201_n.jpg'], stock: 7, sku: 'EHD-CP5DM', tags: ['cedar', 'chest of drawers', 'mirror', 'bedroom furniture'], status: 'ACTIVE', featured: false, rating: 4.6, reviewCount: 9, soldCount: 21 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 5 Drawer Chest of Drawers', slug: 'cedar-ply-5-drawer-chest', description: 'Cedar & Ply 5 Drawer Chest of Drawers. H-34" W-33 1/2" D-16 1/2". Solid cedar and ply construction. Great for bedroom storage. Was $1,295.', price: 1195.00, comparePrice: 1295.00, images: ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651335290_1257838659872440_8527368108116913156_n.jpg'], stock: 8, sku: 'EHD-CP5D', tags: ['cedar', 'chest of drawers', 'bedroom furniture', 'storage'], status: 'ACTIVE', featured: false, rating: 4.5, reviewCount: 7, soldCount: 18 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 6 Drawer Tall Chest with Mirror', slug: 'cedar-ply-6-drawer-tall-chest-mirror', description: 'Cedar & Ply 6 Drawer Tall Chest of Drawers with Mirror. H-70" W-33 1/2" D-16 1/2". Beautiful bedroom centerpiece. Was $1,495 — Now on Sale.', price: 1395.00, comparePrice: 1495.00, images: ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/651209498_1257834693206170_22898707317486772_n.jpg'], stock: 6, sku: 'EHD-CP6DTM', tags: ['cedar', '6 drawer', 'tall chest', 'mirror', 'bedroom'], status: 'ACTIVE', featured: false, rating: 4.7, reviewCount: 11, soldCount: 25 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 6 Drawer Tall Chest of Drawers', slug: 'cedar-ply-6-drawer-tall-chest', description: 'Cedar & Ply 6 Drawer Tall Chest of Drawers. H-42" W-33 1/2" D-16 1/2". Spacious storage, solid build. Was $1,395 — Now on Sale.', price: 1295.00, comparePrice: 1395.00, images: ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/652184075_1257833919872914_8796869614260391205_n.jpg'], stock: 9, sku: 'EHD-CP6DT', tags: ['cedar', '6 drawer', 'tall chest', 'bedroom furniture'], status: 'ACTIVE', featured: false, rating: 4.6, reviewCount: 8, soldCount: 19 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 6 Drawer Jumbo Chest with Mirror', slug: 'cedar-ply-6-drawer-jumbo-chest-mirror', description: 'Cedar & Ply 6 Drawer Jumbo Chest of Drawers with Mirror. H-70" W-43 1/2" D-16 1/2". Extra wide, statement piece. Was $1,595 — Now on Sale.', price: 1495.00, comparePrice: 1595.00, images: ['https://scontent.fpos1-2.fna.fbcdn.net/v/t39.30808-6/652332027_1257825686540404_2995123383046012186_n.jpg'], stock: 5, sku: 'EHD-CP6DJM', tags: ['cedar', 'jumbo', '6 drawer', 'mirror', 'bedroom furniture'], status: 'ACTIVE', featured: true, rating: 4.8, reviewCount: 13, soldCount: 28 },
    { vendorId: vendor6.id, categoryId: homeGarden.id, name: 'Cedar & Ply 6 Drawer Jumbo Chest of Drawers', slug: 'cedar-ply-6-drawer-jumbo-chest', description: 'Cedar & Ply 6 Drawer Jumbo Chest of Drawers. H-42" W-43 1/2" D-16 1/2". Maximum storage, solid craftsmanship. Was $1,495 — Now on Sale.', price: 1395.00, comparePrice: 1495.00, images: ['https://scontent.fpos1-1.fna.fbcdn.net/v/t39.30808-6/650732162_1257770899879216_8294802363858132479_n.jpg'], stock: 6, sku: 'EHD-CP6DJ', tags: ['cedar', 'jumbo', '6 drawer', 'chest of drawers', 'storage'], status: 'ACTIVE', featured: false, rating: 4.6, reviewCount: 10, soldCount: 22 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        images: JSON.stringify(product.images),
        tags: JSON.stringify(product.tags),
      },
    })
  }

  // ─── Digital Products ──────────────────────────────────────────────────────
  function randomCode(prefix: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const seg = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `${prefix}-${seg()}-${seg()}-${seg()}`
  }

  const digitalProductsData = [
    { name: 'Netflix 1-Month Premium (4K)', slug: 'netflix-1-month-premium', categoryTag: 'streaming', price: 165, comparePrice: 200, thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400', instructions: 'Log in at netflix.com → Account → Redeem Gift Card → Enter your code', codePrefix: 'NFLX', featured: true },
    { name: 'Spotify Premium 1-Month', slug: 'spotify-premium-1-month', categoryTag: 'streaming', price: 89, thumbnail: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400', instructions: 'Go to spotify.com/redeem → Sign in → Enter your code', codePrefix: 'SPOT', featured: false },
    { name: 'YouTube Premium 1-Month', slug: 'youtube-premium-1-month', categoryTag: 'streaming', price: 99, thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400', instructions: 'Go to youtube.com/paid_memberships → Redeem → Enter code', codePrefix: 'YTPREM', featured: false },
    { name: 'Disney+ 1-Month', slug: 'disney-plus-1-month', categoryTag: 'streaming', price: 120, thumbnail: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400', instructions: 'Go to disneyplus.com → Subscribe → Redeem code', codePrefix: 'DPLUS', featured: false },
    { name: 'Apple Music 1-Month', slug: 'apple-music-1-month', categoryTag: 'streaming', price: 79, thumbnail: 'https://images.unsplash.com/photo-1535992165812-68d1861aa71e?w=400', instructions: 'Open App Store → Tap avatar → Redeem Gift Card → Enter code', codePrefix: 'AMUSIC', featured: false },
    { name: 'ChatGPT Plus 1-Month', slug: 'chatgpt-plus-1-month', categoryTag: 'software', price: 420, comparePrice: 500, thumbnail: 'https://images.unsplash.com/photo-1677442135968-6db3b0025e95?w=400', instructions: 'Log in at chat.openai.com → Upgrade → Enter provided credentials', codePrefix: 'CGPT', featured: true, deliveryType: 'account' },
    { name: 'Canva Pro 1-Month', slug: 'canva-pro-1-month', categoryTag: 'software', price: 149, thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400', instructions: 'Go to canva.com → Upgrade → Enter your code at checkout', codePrefix: 'CANVA', featured: false },
    { name: 'Microsoft 365 Personal 1-Year', slug: 'microsoft-365-personal-1-year', categoryTag: 'software', price: 599, comparePrice: 750, thumbnail: 'https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=400', instructions: 'Go to microsoft.com/redeem → Sign in → Enter your 25-digit code', codePrefix: 'MS365', featured: false },
    { name: 'NordVPN 1-Year Plan', slug: 'nordvpn-1-year', categoryTag: 'software', price: 299, comparePrice: 399, thumbnail: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400', instructions: 'Go to nordvpn.com/redeem → Enter your activation code', codePrefix: 'NVPN', featured: false },
    { name: 'PSN Plus Essential 1-Month', slug: 'psn-plus-essential-1-month', categoryTag: 'gaming', price: 189, thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400', instructions: 'Go to PlayStation Store → Redeem Codes → Enter your 12-digit code', codePrefix: 'PSN', featured: false },
    { name: 'Xbox Game Pass Ultimate 1-Month', slug: 'xbox-game-pass-ultimate-1-month', categoryTag: 'gaming', price: 219, thumbnail: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400', instructions: 'Go to xbox.com/redeemcode → Sign in → Enter your 25-character code', codePrefix: 'XBOX', featured: false },
    { name: 'Roblox $25 Gift Card', slug: 'roblox-25-gift-card', categoryTag: 'gaming', price: 175, thumbnail: 'https://images.unsplash.com/photo-1636487658547-ee1b7c3855ce?w=400', instructions: 'Go to roblox.com/redeem → Log in → Enter your code', codePrefix: 'RBLX', featured: false },
    { name: 'Duolingo Plus 3-Month', slug: 'duolingo-plus-3-month', categoryTag: 'education', price: 129, thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', instructions: 'Open Duolingo app → Profile → Settings → Restore Purchase → Enter code', codePrefix: 'DUO', featured: false },
  ]

  for (const dp of digitalProductsData) {
    const created = await prisma.digitalProduct.upsert({
      where: { slug: dp.slug },
      update: {},
      create: {
        vendorId: vendor1.id,
        name: dp.name,
        slug: dp.slug,
        description: `${dp.name} — delivered as a digital code instantly after purchase. Paid in TTD.`,
        categoryTag: dp.categoryTag,
        deliveryType: (dp as any).deliveryType ?? 'code',
        price: dp.price,
        comparePrice: (dp as any).comparePrice ?? null,
        stock: 10,
        thumbnail: dp.thumbnail,
        instructions: dp.instructions,
        isActive: true,
        featured: dp.featured ?? false,
        rating: 4.7,
        soldCount: Math.floor(Math.random() * 200) + 10,
      }
    })
    // Create 10 fake codes
    for (let i = 0; i < 10; i++) {
      await prisma.digitalCode.create({
        data: {
          digitalProductId: created.id,
          code: randomCode(dp.codePrefix),
          isUsed: false,
        }
      })
    }
  }
  console.log('✅ Digital products seeded')

  // ─── Customer Users ─────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@zip.tt' }, update: {},
    create: { name: 'Anika Joseph', email: 'customer@zip.tt', password: customerPassword, role: 'CUSTOMER', emailVerified: new Date() },
  })

  await prisma.address.upsert({
    where: { id: 'addr-customer1-home' }, update: {},
    create: { id: 'addr-customer1-home', userId: customer1.id, label: 'Home', street: '23 Circular Road', city: 'Port of Spain', region: 'Port of Spain', isDefault: true },
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  Admin    → admin@zip.tt          / admin123')
  console.log('  Vendor 1 → trini.tech@zip.tt     / vendor123  (Trini Tech Hub)')
  console.log("  Vendor 2 → mas.camp@zip.tt       / vendor123  (D'Mas Camp)")
  console.log("  Vendor 3 → doubles.queen@zip.tt  / vendor123  (Sasha's Gourmet)")
  console.log('  Vendor 4 → don.wvrldwide@zip.tt  / vendor123  (Don Wvrldwide)')
  console.log("  Vendor 5 → dbest.toys@zip.tt     / vendor123  (D'Best Toys)")
  console.log('  Customer → customer@zip.tt       / customer123')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
