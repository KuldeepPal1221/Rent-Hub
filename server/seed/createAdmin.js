import bcrypt from 'bcryptjs';
import db, { initDatabase } from '../config/database.js';

export async function ensureAdminUser(options = {}) {
  const email = (options.email || 'admin@renthub.com').trim().toLowerCase();
  const password = options.password || 'Admin@RentHub2026!';
  const fullName = options.fullName || 'RentHub Master Admin';
  const phone = options.phone || '+1 800-555-0100';
  const city = options.city || 'New York / Global HQ';
  const updatePassword = options.updatePassword || false;

  try {
    await initDatabase();

    const existingUser = await db.prepare('SELECT id, role, account_status FROM users WHERE LOWER(email) = ?').get(email);

    if (existingUser) {
      if (updatePassword) {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.prepare(`
          UPDATE users 
          SET role = 'admin', account_status = 'active', password_hash = ?, updated_at = NOW() 
          WHERE id = ?
        `).run(passwordHash, existingUser.id);
        console.log(`👑 User '${email}' promoted to Admin and password updated.`);
      } else if (existingUser.role !== 'admin' || existingUser.account_status !== 'active') {
        await db.prepare(`
          UPDATE users 
          SET role = 'admin', account_status = 'active', updated_at = NOW() 
          WHERE id = ?
        `).run(existingUser.id);
        console.log(`👑 User '${email}' updated to active Admin.`);
      } else {
        console.log(`ℹ️ Admin user '${email}' already exists and is active.`);
      }
      return { success: true, action: 'existing', email };
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(password, 10);
    const insertUser = db.prepare(`
      INSERT INTO users (
        full_name, email, phone, password_hash, profile_image, city, 
        whatsapp_number, email_contact_enabled, phone_contact_enabled, 
        whatsapp_contact_enabled, role, account_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 'admin', 'active', NOW(), NOW())
    `);

    const res = await insertUser.run(
      fullName,
      email,
      phone,
      passwordHash,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      city,
      phone.replace(/\s+/g, '')
    );

    console.log(`✅ Admin account created successfully!`);
    console.log(`   ID:       ${res.lastInsertRowid}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     admin`);

    return { success: true, action: 'created', id: res.lastInsertRowid, email };
  } catch (error) {
    console.error('❌ Failed to ensure admin user:', error);
    throw error;
  }
}

// Standalone execution: node server/seed/createAdmin.js [email] [password] [fullName]
if (process.argv[1] && process.argv[1].endsWith('createAdmin.js')) {
  const customEmail = process.argv[2];
  const customPassword = process.argv[3];
  const customName = process.argv[4];

  const opts = {};
  if (customEmail) opts.email = customEmail;
  if (customPassword) {
    opts.password = customPassword;
    opts.updatePassword = true;
  }
  if (customName) opts.fullName = customName;

  ensureAdminUser(opts)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
