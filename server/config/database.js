import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect serverless environment (e.g. Vercel, AWS Lambda)
const isServerless = !!(process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Database storage directory
const dbDir = isServerless ? '/tmp' : path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (e) {
    // Ignore directory exists error
  }
}

const dbPath = path.join(dbDir, 'rental_marketplace.db');

// Initialize WebAssembly SQLite engine
const SQL = await initSqlJs();

let rawDb;
if (fs.existsSync(dbPath)) {
  try {
    const fileBuffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(fileBuffer);
  } catch (err) {
    console.warn('Could not read existing database file, creating fresh database in memory:', err.message);
    rawDb = new SQL.Database();
  }
} else {
  rawDb = new SQL.Database();
}

// Helper to save SQLite state to disk when modified
function saveDatabaseToDisk() {
  try {
    const data = rawDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    // Ignore write errors in strict read-only environments
  }
}

// Unified Database wrapper matching standard prepared statements interface
const db = {
  exec(sql) {
    rawDb.run(sql);
    saveDatabaseToDisk();
  },
  prepare(sql) {
    return {
      all(...params) {
        // Flatten array if passed as single array
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = rawDb.prepare(sql);
        if (flatParams.length > 0) {
          stmt.bind(flatParams);
        }
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },
      get(...params) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = rawDb.prepare(sql);
        if (flatParams.length > 0) {
          stmt.bind(flatParams);
        }
        let row = null;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },
      run(...params) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        rawDb.run(sql, flatParams);
        
        let lastInsertRowid = 0;
        try {
          const lastIdRes = rawDb.exec('SELECT last_insert_rowid() as id');
          lastInsertRowid = lastIdRes[0]?.values[0]?.[0] || 0;
        } catch (e) {
          // Fallback
        }

        let changes = 0;
        try {
          const changesRes = rawDb.exec('SELECT changes() as count');
          changes = changesRes[0]?.values[0]?.[0] || 0;
        } catch (e) {
          // Fallback
        }

        saveDatabaseToDisk();
        return { lastInsertRowid, changes };
      }
    };
  }
};

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize database schema tables
export function initDatabase() {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Product Images Table
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Favorites Table
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Rental Inquiries Table
    CREATE TABLE IF NOT EXISTS rental_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
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
