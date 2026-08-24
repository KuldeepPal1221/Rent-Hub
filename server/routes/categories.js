import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET all categories with product counts
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*, 
        COUNT(CASE WHEN p.availability_status = 'available' THEN p.id END) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `).all();

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.'
    });
  }
});

// GET single category by slug or ID
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    let category;

    if (!isNaN(identifier)) {
      category = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(identifier));
    } else {
      category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(identifier);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    return res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category details.'
    });
  }
});

export default router;
