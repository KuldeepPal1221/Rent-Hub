import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Neon/Postgres connection (works locally and on Vercel serverless)
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1 // safe default for serverless functions
});

// Converts SQLite-style "?" placeholders into Postgres-style "$1, $2, ..."
function toPgQuery(text) {
  let i = 0;
  return text.replace(/\?/g, () => `$${++i}`);
}

// Unified wrapper matching the same prepare().get()/.all()/.run() shape
// the app already uses. NOTE: these are now ASYNC — callers must use await.
const db = {
  async exec(text) {
    await sql.unsafe(text);
  },
  prepare(text) {
    const pgText = toPgQuery(text);
    return {
      async all(...params) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return await sql.unsafe(pgText, flatParams);
      },
      async get(...params) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const rows = await sql.unsafe(pgText, flatParams);
        return rows[0] || null;
      },
      async run(...params) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

        // Auto-append RETURNING id on INSERTs so we can report lastInsertRowid
        let queryText = pgText;
        const isInsert = /^\s*insert/i.test(queryText);
        if (isInsert && !/returning/i.test(queryText)) {
          queryText += ' RETURNING id';
        }

        const rows = await sql.unsafe(queryText, flatParams);
        return {
          lastInsertRowid: isInsert && rows[0] ? rows[0].id : 0,
          changes: rows.count ?? rows.length ?? 0
        };
      }
    };
  }
};

// Initialize database schema tables (Postgres syntax)
export async function initDatabase() {
  await db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      city TEXT NOT NULL,
      whatsapp_number TEXT,
      email_contact_enabled INTEGER DEFAULT 1,
      phone_contact_enabled INTEGER DEFAULT 1,
      whatsapp_contact_enabled INTEGER DEFAULT 1,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      account_status TEXT DEFAULT 'active' CHECK(account_status IN ('active', 'suspended', 'inactive')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      rental_price REAL NOT NULL,
      price_period TEXT NOT NULL CHECK(price_period IN ('day', 'week', 'month')),
      security_deposit REAL DEFAULT 0,
      condition TEXT NOT NULL CHECK(condition IN ('Brand New', 'Like New', 'Good', 'Fair')),
      city TEXT NOT NULL,
      location TEXT NOT NULL,
      available_from TEXT,
      available_until TEXT,
      availability_status TEXT DEFAULT 'available' CHECK(availability_status IN ('available', 'rented', 'inactive')),
      views_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Product Images Table
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Favorites Table
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Rental Inquiries Table
    CREATE TABLE IF NOT EXISTS rental_inquiries (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      renter_id INTEGER NOT NULL,
      renter_name TEXT NOT NULL,
      renter_email TEXT NOT NULL,
      renter_phone TEXT,
      rental_start_date TEXT NOT NULL,
      rental_end_date TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for fast queries
    CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(availability_status);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON rental_inquiries(owner_id);
    CREATE INDEX IF NOT EXISTS idx_inquiries_renter ON rental_inquiries(renter_id);
  `);
}

export default db;