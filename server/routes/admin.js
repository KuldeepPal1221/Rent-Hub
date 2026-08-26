import express from 'express';
import db from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Require auth and admin for all admin routes
router.use(authenticateToken, requireAdmin);

// 1. ADMIN DASHBOARD METRICS
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = (await db.prepare('SELECT COUNT(*) as count FROM users').get())?.count || 0;
    const totalProducts = (await db.prepare('SELECT COUNT(*) as count FROM products').get())?.count || 0;
    const activeProducts = (await db.prepare("SELECT COUNT(*) as count FROM products WHERE availability_status = 'available'").get())?.count || 0;
    const totalInquiries = (await db.prepare('SELECT COUNT(*) as count FROM rental_inquiries').get())?.count || 0;
    const totalFavorites = (await db.prepare('SELECT COUNT(*) as count FROM favorites').get())?.count || 0;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        activeProducts,
        totalInquiries,
        totalFavorites
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
});

// 2. LIST ALL REGISTERED USERS
router.get('/users', async (req, res) => {
  try {
    const users = await db.prepare(`
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.city, u.profile_image, 
        u.role, u.account_status, u.created_at, u.last_login,
        (SELECT COUNT(*) FROM products WHERE owner_id = u.id) as listings_count,
        (SELECT COUNT(*) FROM rental_inquiries WHERE owner_id = u.id) as inquiries_received_count,
        (SELECT COUNT(*) FROM rental_inquiries WHERE renter_id = u.id) as inquiries_sent_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// 3. TOGGLE OR UPDATE USER ACCOUNT STATUS (Active / Suspended)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await db.prepare('UPDATE users SET account_status = ?, updated_at = NOW() WHERE id = ?').run(status, userId);

    return res.json({
      success: true,
      message: `User account status updated to ${status}.`
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// 4. TOGGLE USER ROLE (User / Admin)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    await db.prepare('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?').run(role, userId);

    return res.json({
      success: true,
      message: `User role updated to ${role}.`
    });
  } catch (error) {
    console.error('Admin update user role error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
});

// 5. DELETE USER
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return res.json({
      success: true,
      message: 'User and all associated listings were permanently deleted.'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// 6. LIST ALL PRODUCTS FOR MODERATION
router.get('/products', async (req, res) => {
  try {
    const products = await db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        u.full_name as owner_name,
        u.email as owner_email,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.owner_id = u.id
      ORDER BY p.created_at DESC
    `).all();

    return res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Admin list products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// 7. DELETE PRODUCT
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    await db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    return res.json({
      success: true,
      message: 'Product listing removed by admin.'
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// 8. LIST ALL INQUIRIES
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await db.prepare(`
      SELECT 
        ri.*,
        p.name as product_name,
        p.rental_price,
        p.price_period,
        o.full_name as owner_name,
        r.full_name as renter_name_account
      FROM rental_inquiries ri
      JOIN products p ON ri.product_id = p.id
      JOIN users o ON ri.owner_id = o.id
      JOIN users r ON ri.renter_id = r.id
      ORDER BY ri.created_at DESC
    `).all();

    return res.json({
      success: true,
      inquiries
    });
  } catch (error) {
    console.error('Admin list inquiries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inquiries.' });
  }
});

export default router;