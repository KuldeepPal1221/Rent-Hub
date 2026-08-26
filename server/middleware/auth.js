import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'renthub_super_secure_jwt_secret_key_2026_rental_app';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Please log in to continue.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user data (excluding password_hash)
    const user = await db.prepare(`
      SELECT id, full_name, email, phone, profile_image, city, 
             whatsapp_number, email_contact_enabled, phone_contact_enabled, 
             whatsapp_contact_enabled, role, account_status, created_at
      FROM users 
      WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account no longer exists.'
      });
    }

    if (user.account_status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
}

// Strict Admin authorization guard - ONLY users with role === 'admin' are permitted
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only authorized Administrators can access this area or suspend accounts.'
    });
  }
  next();
}

// Optional authentication - populates req.user if token is present, but doesn't block if not
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.prepare(`
      SELECT id, full_name, email, phone, profile_image, city, 
             whatsapp_number, email_contact_enabled, phone_contact_enabled, 
             whatsapp_contact_enabled, role, account_status, created_at
      FROM users 
      WHERE id = ?
    `).get(decoded.id);

    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}