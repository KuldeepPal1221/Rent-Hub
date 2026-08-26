import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to attach images
async function attachImagesToProducts(products) {
  if (!products || products.length === 0) return [];
  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');
  const images = await db.prepare(`
    SELECT * FROM product_images 
    WHERE product_id IN (${placeholders}) 
    ORDER BY display_order ASC, id ASC
  `).all(...productIds);

  const imagesMap = {};
  for (const img of images) {
    if (!imagesMap[img.product_id]) {
      imagesMap[img.product_id] = [];
    }
    imagesMap[img.product_id].push(img.image_url);
  }

  return products.map(p => ({
    ...p,
    images: imagesMap[p.id] || [],
    primary_image: (imagesMap[p.id] && imagesMap[p.id][0]) || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80'
  }));
}

// 1. PUBLIC OWNER PROFILE & PRODUCTS
router.get('/:id/public', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await db.prepare(`
      SELECT 
        id, full_name, profile_image, city, created_at,
        phone, whatsapp_number, email,
        phone_contact_enabled, whatsapp_contact_enabled, email_contact_enabled,
        (SELECT COUNT(*) FROM products WHERE owner_id = users.id AND availability_status = 'available') as active_listings_count
      FROM users 
      WHERE id = ? AND account_status = 'active'
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Owner profile not found or account is inactive.'
      });
    }

    // Owner's active products
    const rawProducts = await db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.owner_id = ? AND p.availability_status = 'available'
      ORDER BY p.created_at DESC
    `).all(userId);

    const products = await attachImagesToProducts(rawProducts);

    // Filter contact info based on privacy settings
    const ownerProfile = {
      id: user.id,
      name: user.full_name,
      image: user.profile_image,
      city: user.city,
      memberSince: user.created_at,
      activeListingsCount: user.active_listings_count,
      phone: user.phone_contact_enabled ? user.phone : null,
      phoneEnabled: !!user.phone_contact_enabled,
      whatsapp: user.whatsapp_contact_enabled ? (user.whatsapp_number || user.phone) : null,
      whatsappEnabled: !!user.whatsapp_contact_enabled,
      email: user.email_contact_enabled ? user.email : null,
      emailEnabled: !!user.email_contact_enabled
    };

    return res.json({
      success: true,
      owner: ownerProfile,
      products
    });
  } catch (error) {
    console.error('Error fetching public owner profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve owner profile.'
    });
  }
});

// 2. DASHBOARD STATS FOR AUTHENTICATED USER
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalListings = (await db.prepare('SELECT COUNT(*) as count FROM products WHERE owner_id = ?').get(userId)).count;
    const activeListings = (await db.prepare(`SELECT COUNT(*) as count FROM products WHERE owner_id = ? AND availability_status = 'available'`).get(userId)).count;
    const inquiriesReceived = (await db.prepare('SELECT COUNT(*) as count FROM rental_inquiries WHERE owner_id = ?').get(userId)).count;
    const pendingInquiries = (await db.prepare(`SELECT COUNT(*) as count FROM rental_inquiries WHERE owner_id = ? AND status = 'pending'`).get(userId)).count;
    const inquiriesSent = (await db.prepare('SELECT COUNT(*) as count FROM rental_inquiries WHERE renter_id = ?').get(userId)).count;
    const totalFavorites = (await db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(userId)).count;

    return res.json({
      success: true,
      stats: {
        totalListings,
        activeListings,
        inquiriesReceived,
        pendingInquiries,
        inquiriesSent,
        totalFavorites
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
});

export default router;