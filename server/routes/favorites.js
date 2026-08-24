import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to attach images
function attachImagesToProducts(products) {
  if (!products || products.length === 0) return [];
  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');
  const images = db.prepare(`
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
    primary_image: (imagesMap[p.id] && imagesMap[p.id][0]) || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
    is_favorite: 1
  }));
}

// 1. GET USER'S FAVORITES
router.get('/', authenticateToken, (req, res) => {
  try {
    const rawProducts = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.full_name as owner_name,
        u.city as owner_city,
        f.created_at as favorited_at
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.owner_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);

    const favorites = attachImagesToProducts(rawProducts);

    return res.json({
      success: true,
      favorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve favorite products.'
    });
  }
});

// 2. TOGGLE FAVORITE (ADD / REMOVE)
router.post('/:productId', authenticateToken, (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const userId = req.user.id;

    // Check if product exists
    const product = db.prepare('SELECT id, name FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if already favorited
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(userId, productId);

    let isFavorite = false;
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      isFavorite = false;
    } else {
      db.prepare('INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, datetime(\'now\'))').run(userId, productId);
      isFavorite = true;
    }

    const totalFavs = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE product_id = ?').get(productId).count;

    return res.json({
      success: true,
      is_favorite: isFavorite,
      total_favorites: totalFavs,
      message: isFavorite ? 'Added to your favorites.' : 'Removed from your favorites.'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update favorites.'
    });
  }
});

export default router;
