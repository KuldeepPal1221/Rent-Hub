import bcrypt from 'bcryptjs';
import db, { initDatabase } from '../config/database.js';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding for RentHub...');

  // Initialize Schema
  initDatabase();

  // Clean existing data for clean seed
  db.exec(`
    DELETE FROM rental_inquiries;
    DELETE FROM favorites;
    DELETE FROM product_images;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  console.log('🧹 Cleaned existing tables.');

  // 1. SEED USERS & MASTER ADMIN
  const userPasswordHash = bcrypt.hashSync('Password123!', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@RentHub2026!', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (
      full_name, email, phone, password_hash, profile_image, city, 
      whatsapp_number, email_contact_enabled, phone_contact_enabled, 
      whatsapp_contact_enabled, role, account_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
  `);

  // Master Admin Account
  const adminUser = insertUser.run(
    'RentHub Master Admin',
    'admin@renthub.com',
    '+1 800-555-0100',
    adminPasswordHash,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'New York / Global HQ',
    '+18005550100',
    1, 1, 1,
    'admin'
  );

  // Demo User 1 (Seller)
  const user1 = insertUser.run(
    'Alex Morgan',
    'alex@example.com',
    '+1 555-0192',
    userPasswordHash,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'New York',
    '+15550192',
    1, 1, 1,
    'user'
  );

  // Demo User 2 (Owner / Renter)
  const user2 = insertUser.run(
    'Sarah Jenkins',
    'sarah@example.com',
    '+1 555-0144',
    userPasswordHash,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'San Francisco',
    '+15550144',
    1, 1, 1,
    'user'
  );

  // Demo User 3 (Renter / Sports Gear)
  const user3 = insertUser.run(
    'David Miller',
    'david@example.com',
    '+1 555-0188',
    userPasswordHash,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'Chicago',
    '+15550188',
    1, 1, 1,
    'user'
  );

  console.log('👤 Seeded Master Admin (admin@renthub.com) and 3 demo users.');

  // 2. SEED CATEGORIES
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: 'Tv', description: 'Audio, gadgets, screens, and smart devices', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80', order: 1 },
    { name: 'Home Appliances', slug: 'home-appliances', icon: 'Sparkles', description: 'Steam irons, vacuum cleaners, and heating equipment', image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80', order: 2 },
    { name: 'Tools', slug: 'tools', icon: 'Wrench', description: 'Power tools, drill sets, ladders, and lawn care', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80', order: 3 },
    { name: 'Furniture', slug: 'furniture', icon: 'Armchair', description: 'Chairs, desks, decor, and event seating', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', order: 4 },
    { name: 'Vehicles', slug: 'vehicles', icon: 'Car', description: 'Bikes, e-scooters, roof racks, and trailers', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80', order: 5 },
    { name: 'Cameras', slug: 'cameras', icon: 'Camera', description: 'DSLRs, mirrorless, lenses, gimbals, and lighting', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', order: 6 },
    { name: 'Computers', slug: 'computers', icon: 'Laptop', description: 'Laptops, monitors, VR headsets, and accessories', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', order: 7 },
    { name: 'Event Equipment', slug: 'event-equipment', icon: 'Music', description: 'PA sound systems, party lights, projectors, and tents', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', order: 8 },
    { name: 'Sports Equipment', slug: 'sports-equipment', icon: 'Trophy', description: 'Camping tents, mountain bikes, kayaks, and golf sets', image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80', order: 9 },
    { name: 'Kitchen Equipment', slug: 'kitchen-equipment', icon: 'Utensils', description: 'Espresso machines, air fryers, mixers, and juicers', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80', order: 10 },
    { name: 'Clothing', slug: 'clothing', icon: 'Shirt', description: 'Suits, evening gowns, jackets, and costumes', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80', order: 11 },
    { name: 'Books', slug: 'books', icon: 'BookOpen', description: 'Textbooks, specialized manuals, and bestsellers', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', order: 12 },
    { name: 'Other', slug: 'other', icon: 'Package', description: 'Miscellaneous specialty rental items', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', order: 13 }
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, icon, image, display_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const categoryMap = {};
  for (const cat of categories) {
    const res = insertCategory.run(cat.name, cat.slug, cat.description, cat.icon, cat.image, cat.order);
    categoryMap[cat.slug] = res.lastInsertRowid;
  }

  console.log(`📦 Seeded ${categories.length} categories.`);

  // 3. SEED PRODUCTS
  const sampleProducts = [
    {
      owner_id: user2.lastInsertRowid, // Sarah
      category_slug: 'home-appliances',
      name: 'Philips PerfectCare Elite Plus Steam Iron & Garment Press',
      description: 'Professional high-pressure continuous steam generator iron with OptimalTEMP technology. Zero burns guaranteed on all ironable fabrics. Ideal for wedding prep, suit pressing, heavy drapery, and bulk garment steaming. Includes heat-resistant silicone resting mat and glove.',
      rental_price: 15,
      price_period: 'day',
      security_deposit: 50,
      condition: 'Like New',
      city: 'San Francisco',
      location: 'Mission District / 16th St',
      images: [
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user1.lastInsertRowid, // Alex
      category_slug: 'cameras',
      name: 'Sony Alpha A7 IV Full-Frame Camera + FE 24-70mm f/2.8 GM Lens',
      description: 'Flagship 33MP hybrid full-frame camera with 4K 60p 10-bit recording, advanced real-time eye autofocus, and dual memory card slots. Perfect for commercial video shoots, weddings, studio portraits, or weekend photography trips. Comes with 2 Sony batteries, dual charger, and Pelican hard case.',
      rental_price: 65,
      price_period: 'day',
      security_deposit: 200,
      condition: 'Like New',
      city: 'New York',
      location: 'Manhattan, SoHo',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user2.lastInsertRowid, // Sarah
      category_slug: 'tools',
      name: 'DeWalt 20V MAX Brushless Drill & Impact Driver Combo Set',
      description: 'Heavy duty cordless drill driver and impact driver kit with LED workspace illumination. Includes two 20V 4.0Ah Lithium-Ion battery packs, high-speed charger, 45-piece titanium bit set, and rugged canvas contractor bag. Excellent for home DIY, furniture assembly, and construction.',
      rental_price: 20,
      price_period: 'day',
      security_deposit: 40,
      condition: 'Good',
      city: 'San Francisco',
      location: 'Sunset Blvd, Inner Sunset',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user1.lastInsertRowid, // Alex
      category_slug: 'electronics',
      name: 'DJI Mini 3 Pro Ultralight 4K HDR Drone with Smart Remote',
      description: 'Ultralight sub-249g foldable drone with tri-directional obstacle sensing, true vertical shooting, 4K HDR 60fps video, and up to 34 minutes of flight time. Comes with DJI RC built-in screen controller, Fly More kit with 3 batteries, multi-charger, ND filter set, and travel case.',
      rental_price: 45,
      price_period: 'day',
      security_deposit: 150,
      condition: 'Brand New',
      city: 'New York',
      location: 'Brooklyn, Williamsburg',
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user3.lastInsertRowid, // David
      category_slug: 'sports-equipment',
      name: 'Coleman WeatherMaster 6-Person Waterproof Camping Tent',
      description: 'Spacious family camping tent featuring patented WeatherTec welded floors and inverted seams to keep water out. Includes separate screened room for bug-free lounging, hinged easy-access door, color-coded poles, and ground stakes. Sets up in under 20 minutes.',
      rental_price: 35,
      price_period: 'day',
      security_deposit: 60,
      condition: 'Like New',
      city: 'Chicago',
      location: 'Lincoln Park, North Ave',
      images: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user2.lastInsertRowid, // Sarah
      category_slug: 'furniture',
      name: 'Herman Miller Aeron Ergonomic Office Chair (Size B, PostureFit SL)',
      description: 'The benchmark for ergonomic office seating. Fully adjustable arms, Pellicle 8Z breathable suspension mesh, forward tilt, and lumbar support. Perfect for remote work sprints, editing sessions, or temporary studio setups. Cleaned and sanitized before every rental.',
      rental_price: 25,
      price_period: 'day',
      security_deposit: 100,
      condition: 'Like New',
      city: 'San Francisco',
      location: 'SOMA, 2nd Street',
      images: [
        'https://images.unsplash.com/photo-1580481077195-c26027a0572e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user3.lastInsertRowid, // David
      category_slug: 'event-equipment',
      name: 'Yamaha STAGEPAS 600BT 680W Portable Bluetooth PA System',
      description: 'High-power 680-watt all-in-one sound system with 10-channel powered mixer, two 10-inch speakers, Bluetooth audio streaming, SPX digital reverb, and feedback suppressor. Includes two Shure SM58 microphones, heavy-duty tripod speaker stands, and XLR cables. Ideal for parties, weddings, corporate presentations, and live acoustic music.',
      rental_price: 75,
      price_period: 'day',
      security_deposit: 150,
      condition: 'Good',
      city: 'Chicago',
      location: 'West Loop, Fulton Market',
      images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user1.lastInsertRowid, // Alex
      category_slug: 'electronics',
      name: 'Epson EpiqVision Mini EF-12 1000 Lumens Portable Smart Laser Projector',
      description: 'Compact Full HD 1080p laser projector with built-in Android TV and custom Sound by Yamaha. Projects crystal-clear vibrant images up to 150 inches on any wall or screen. Includes HDMI input, Google Assistant voice remote, and carrying case. Perfect for outdoor movie nights and sports watch parties.',
      rental_price: 40,
      price_period: 'day',
      security_deposit: 100,
      condition: 'Brand New',
      city: 'New York',
      location: 'Astoria, Broadway',
      images: [
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user2.lastInsertRowid, // Sarah
      category_slug: 'kitchen-equipment',
      name: 'Breville Barista Touch Espresso Machine & Conical Burr Grinder',
      description: 'Café-quality automated touchscreen espresso machine with thermo-jet 3-second heat up, automated micro-foam milk texturing, and integrated precision grinder. Perfect for home events, brunch parties, and popups. Includes stainless steel milk jug and cleaning accessories.',
      rental_price: 30,
      price_period: 'day',
      security_deposit: 80,
      condition: 'Like New',
      city: 'San Francisco',
      location: 'Noe Valley, 24th St',
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user3.lastInsertRowid, // David
      category_slug: 'vehicles',
      name: 'Segway Ninebot KickScooter Max G30 (40.4 Mile Range, 18.6 MPH)',
      description: 'Long-range electric commuter scooter with 10-inch pneumatic self-healing tires, dual braking system, LED headlight, and built-in fast charger. Ideal for commuting, exploring city landmarks, or weekend touring. Helmet and heavy-duty U-lock included.',
      rental_price: 28,
      price_period: 'day',
      security_deposit: 75,
      condition: 'Good',
      city: 'Chicago',
      location: 'Lakeview, Belmont Ave',
      images: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user2.lastInsertRowid, // Sarah
      category_slug: 'tools',
      name: 'Kärcher K5 Premium Smart Control Electric Pressure Washer 2000 PSI',
      description: 'High performance water-cooled electric pressure washer with 2000 PSI and 1.4 GPM flow rate. Features 3-in-1 multi-jet spray wand, 25-foot high-pressure hose on reel, and detergent tank. Outstanding for cleaning patio pavers, driveways, house siding, decks, and vehicles.',
      rental_price: 32,
      price_period: 'day',
      security_deposit: 60,
      condition: 'Like New',
      city: 'San Francisco',
      location: 'Marina District, Chestnut St',
      images: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      owner_id: user3.lastInsertRowid, // David
      category_slug: 'sports-equipment',
      name: 'Trek Marlin 7 Gen 3 Hardtail Mountain Bike (Hydraulic Disc Brakes)',
      description: 'Lightweight alpha silver aluminum frame with RockShox Judy fork featuring 100mm travel and lockout, Shimano Deore 1x10 drivetrain, and internal cable routing. Includes helmet, water bottle cage, and bike pump.',
      rental_price: 35,
      price_period: 'day',
      security_deposit: 80,
      condition: 'Good',
      city: 'Chicago',
      location: 'Wicker Park, Milwaukee Ave',
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      owner_id, category_id, name, description, rental_price, price_period,
      security_deposit, condition, city, location, available_from, available_until,
      availability_status, views_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), NULL, 'available', ?, datetime('now'), datetime('now'))
  `);

  const insertImg = db.prepare(`
    INSERT INTO product_images (product_id, image_url, display_order, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const productIds = [];
  sampleProducts.forEach((p, index) => {
    const categoryId = categoryMap[p.category_slug] || 1;
    const views = Math.floor(Math.random() * 45) + 12;
    const res = insertProduct.run(
      p.owner_id,
      categoryId,
      p.name,
      p.description,
      p.rental_price,
      p.price_period,
      p.security_deposit,
      p.condition,
      p.city,
      p.location,
      views
    );

    const prodId = res.lastInsertRowid;
    productIds.push(prodId);

    p.images.forEach((imgUrl, order) => {
      insertImg.run(prodId, imgUrl, order);
    });
  });

  console.log(`🏷️ Seeded ${sampleProducts.length} rental products with high-res photos.`);

  // 4. SEED FAVORITES & INQUIRIES
  const insertFav = db.prepare(`INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, datetime('now'))`);
  insertFav.run(user1.lastInsertRowid, productIds[0]); // Alex favorited Sarah's Steam Iron
  insertFav.run(user1.lastInsertRowid, productIds[4]); // Alex favorited David's Tent
  insertFav.run(user2.lastInsertRowid, productIds[1]); // Sarah favorited Alex's Camera
  insertFav.run(user3.lastInsertRowid, productIds[1]); // David favorited Alex's Camera

  const insertInq = db.prepare(`
    INSERT INTO rental_inquiries (
      product_id, owner_id, renter_id, renter_name, renter_email, renter_phone,
      rental_start_date, rental_end_date, message, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  // Sarah inquires on Alex's Camera
  insertInq.run(
    productIds[1],
    user1.lastInsertRowid,
    user2.lastInsertRowid,
    'Sarah Jenkins',
    'sarah@example.com',
    '+1 555-0144',
    '2026-09-01',
    '2026-09-04',
    'Hi Alex, I have a portrait photoshoot in Brooklyn next weekend. Does the Sony A7 IV kit include the 24-70mm GM lens and extra battery?',
    'pending'
  );

  // David inquires on Sarah's Steam Iron
  insertInq.run(
    productIds[0],
    user2.lastInsertRowid,
    user3.lastInsertRowid,
    'David Miller',
    'david@example.com',
    '+1 555-0188',
    '2026-09-05',
    '2026-09-06',
    'Hello Sarah, I need a high-temperature steam press for a wedding suit this Saturday. Can I pick it up Friday evening?',
    'accepted'
  );

  console.log('💬 Seeded initial sample inquiries & favorites.');
  console.log('✅ Seeding completed successfully!');
}

// If run directly via node seedData.js
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
