import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Email validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, city, whatsapp_number } = req.body;

    // Required fields validation
    if (!full_name || !email || !phone || !password || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: Name, Email, Phone, City, and Password.'
      });
    }

    // Clean and validate format
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in or use another email.'
      });
    }

    // Hash password securely with bcrypt
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user record
    const insertStmt = db.prepare(`
      INSERT INTO users (
        full_name, email, phone, password_hash, city, whatsapp_number,
        email_contact_enabled, phone_contact_enabled, whatsapp_contact_enabled,
        account_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(
      full_name.trim(),
      cleanEmail,
      cleanPhone,
      password_hash,
      city.trim(),
      whatsapp_number ? whatsapp_number.trim() : cleanPhone
    );

    const userId = result.lastInsertRowid;

    // Fetch created user without password_hash
    const newUser = db.prepare(`
      SELECT id, full_name, email, phone, profile_image, city, 
             whatsapp_number, email_contact_enabled, phone_contact_enabled, 
             whatsapp_contact_enabled, account_status, created_at
      FROM users WHERE id = ?
    `).get(userId);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to RentHub.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/phone and password.'
      });
    }

    const identifier = email.trim().toLowerCase();

    // Look up user by email or phone
    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?
    `).get(identifier, email.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with that email or phone.'
      });
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    if (user.account_status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact customer support.'
      });
    }

    // Update last_login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Sanitize user object (exclude password_hash)
    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again later.'
    });
  }
});

// 3. GET CURRENT USER
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// 4. UPDATE PROFILE
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { full_name, phone, city, whatsapp_number, profile_image } = req.body;

    if (!full_name || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and city are required.'
      });
    }

    db.prepare(`
      UPDATE users 
      SET full_name = ?, phone = ?, city = ?, 
          whatsapp_number = ?, profile_image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      full_name.trim(),
      phone.trim(),
      city.trim(),
      whatsapp_number ? whatsapp_number.trim() : null,
      profile_image || req.user.profile_image,
      req.user.id
    );

    const updatedUser = db.prepare(`
      SELECT id, full_name, email, phone, profile_image, city, 
             whatsapp_number, email_contact_enabled, phone_contact_enabled, 
             whatsapp_contact_enabled, account_status, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
});

// 5. UPDATE PRIVACY SETTINGS
router.put('/privacy', authenticateToken, (req, res) => {
  try {
    const { email_contact_enabled, phone_contact_enabled, whatsapp_contact_enabled } = req.body;

    db.prepare(`
      UPDATE users 
      SET email_contact_enabled = ?, 
          phone_contact_enabled = ?, 
          whatsapp_contact_enabled = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      email_contact_enabled ? 1 : 0,
      phone_contact_enabled ? 1 : 0,
      whatsapp_contact_enabled ? 1 : 0,
      req.user.id
    );

    const updatedUser = db.prepare(`
      SELECT id, full_name, email, phone, profile_image, city, 
             whatsapp_number, email_contact_enabled, phone_contact_enabled, 
             whatsapp_contact_enabled, account_status, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({
      success: true,
      message: 'Privacy settings updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Privacy update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings.'
    });
  }
});

// 6. CHANGE PASSWORD
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    // Get current hash
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password you entered is incorrect.'
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      newHash,
      req.user.id
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.'
    });
  }
});

// 7. FORGOT PASSWORD (SIMULATED FOR PRODUCTION READINESS)
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
  }

  const user = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email.trim().toLowerCase());
  // For security, do not disclose whether user exists or not
  return res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link and code have been sent.'
  });
});

export default router;
