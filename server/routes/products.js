import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to attach images to products
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
    primary_image: (imagesMap[p.id] && imagesMap[p.id][0]) || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80'
  }));
}

// 1. GET ALL PRODUCTS (WITH ADVANCED SEARCH & FILTERS)
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      search,
      category,
      city,
      min_price,
      max_price,
      price_period,
      condition,
      status = 'available',
      sort = 'newest',
      limit = 50,
      page = 1,
      featured
    } = req.query;

    let sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.full_name as owner_name,
        u.profile_image as owner_image,
        u.city as owner_city
    `;

    if (req.user) {
      sql += `, (SELECT COUNT(*) FROM favorites f WHERE f.product_id = p.id AND f.user_id = ${req.user.id}) as is_favorite`;
    } else {
      sql += `, 0 as is_favorite`;
    }

    sql += `
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Availability status
    if (status && status !== 'all') {
      sql += ' AND p.availability_status = ?';
      params.push(status);
    }

    // Search keyword
    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.location) LIKE ? OR LOWER(p.city) LIKE ? OR LOWER(c.name) LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    // Category filter (slug or id)
    if (category && category !== 'all') {
      if (!isNaN(category)) {
        sql += ' AND p.category_id = ?';
        params.push(Number(category));
      } else {
        sql += ' AND c.slug = ?';
        params.push(category);
      }
    }

    // City filter
    if (city && city !== 'all') {
      sql += ' AND LOWER(p.city) = ?';
      params.push(city.trim().toLowerCase());
    }

    // Price range filters
    if (min_price && !isNaN(min_price)) {
      sql += ' AND p.rental_price >= ?';
      params.push(Number(min_price));
    }

    if (max_price && !isNaN(max_price)) {
      sql += ' AND p.rental_price <= ?';
      params.push(Number(max_price));
    }

    // Price period filter
    if (price_period && price_period !== 'all') {
      sql += ' AND p.price_period = ?';
      params.push(price_period);
    }

    // Condition filter
    if (condition && condition !== 'all') {
      sql += ' AND p.condition = ?';
      params.push(condition);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.rental_price ASC, p.id DESC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.rental_price DESC, p.id DESC';
        break;
      case 'popular':
        sql += ' ORDER BY p.views_count DESC, p.id DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY p.created_at DESC, p.id DESC';
        break;
    }

    // Pagination
    const numLimit = Math.min(Number(limit) || 20, 100);
    const numPage = Math.max(Number(page) || 1, 1);
    const offset = (numPage - 1) * numLimit;

    sql += ' LIMIT ? OFFSET ?';
    params.push(numLimit, offset);

    const rawProducts = db.prepare(sql).all(...params);
    const products = attachImagesToProducts(rawProducts);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (status && status !== 'all') {
      countSql += ' AND p.availability_status = ?';
      countParams.push(status);
    }
    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      countSql += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.location) LIKE ? OR LOWER(p.city) LIKE ? OR LOWER(c.name) LIKE ?)`;
      countParams.push(term, term, term, term, term);
    }
    if (category && category !== 'all') {
      if (!isNaN(category)) {
        countSql += ' AND p.category_id = ?';
        countParams.push(Number(category));
      } else {
        countSql += ' AND c.slug = ?';
        countParams.push(category);
      }
    }
    if (city && city !== 'all') {
      countSql += ' AND LOWER(p.city) = ?';
      countParams.push(city.trim().toLowerCase());
    }
    if (min_price && !isNaN(min_price)) {
      countSql += ' AND p.rental_price >= ?';
      countParams.push(Number(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      countSql += ' AND p.rental_price <= ?';
      countParams.push(Number(max_price));
    }
    if (price_period && price_period !== 'all') {
      countSql += ' AND p.price_period = ?';
      countParams.push(price_period);
    }
    if (condition && condition !== 'all') {
      countSql += ' AND p.condition = ?';
      countParams.push(condition);
    }

    const totalCount = db.prepare(countSql).get(...countParams)?.total || 0;

    return res.json({
      success: true,
      products,
      pagination: {
        total: totalCount,
        page: numPage,
        limit: numLimit,
        totalPages: Math.ceil(totalCount / numLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.'
    });
  }
});

// 2. GET CURRENT USER'S OWN LISTINGS
router.get('/user/my-listings', authenticateToken, (req, res) => {
  try {
    const rawProducts = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT COUNT(*) FROM rental_inquiries ri WHERE ri.product_id = p.id) as inquiry_count,
        (SELECT COUNT(*) FROM favorites f WHERE f.product_id = p.id) as favorite_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.owner_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    const products = attachImagesToProducts(rawProducts);

    return res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching my listings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your listings.'
    });
  }
});

// 3. GET SINGLE PRODUCT DETAILS (WITH OWNER PRIVACY & IMAGES)
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;

    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.id as owner_id,
        u.full_name as owner_name,
        u.profile_image as owner_image,
        u.city as owner_city,
        u.created_at as owner_member_since,
        u.phone as owner_raw_phone,
        u.whatsapp_number as owner_raw_whatsapp,
        u.email as owner_raw_email,
        u.phone_contact_enabled as owner_phone_enabled,
        u.whatsapp_contact_enabled as owner_whatsapp_enabled,
        u.email_contact_enabled as owner_email_enabled,
        (SELECT COUNT(*) FROM products WHERE owner_id = u.id AND availability_status = 'available') as owner_active_products_count
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(Number(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or has been removed.'
      });
    }

    // Increment views count asynchronously
    db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(product.id);

    // Fetch images
    const images = db.prepare(`
      SELECT image_url FROM product_images 
      WHERE product_id = ? 
      ORDER BY display_order ASC, id ASC
    `).all(product.id).map(img => img.image_url);

    // Check favorite status for logged-in user
    let isFavorite = false;
    if (req.user) {
      const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(req.user.id, product.id);
      isFavorite = !!fav;
    }

    // Respect owner privacy settings:
    // Only expose contact fields if the owner enabled them
    const owner = {
      id: product.owner_id,
      name: product.owner_name,
      image: product.owner_image,
      city: product.owner_city,
      memberSince: product.owner_member_since,
      activeListings: product.owner_active_products_count,
      phone: product.owner_phone_enabled ? product.owner_raw_phone : null,
      phoneEnabled: !!product.owner_phone_enabled,
      whatsapp: product.owner_whatsapp_enabled ? (product.owner_raw_whatsapp || product.owner_raw_phone) : null,
      whatsappEnabled: !!product.owner_whatsapp_enabled,
      email: product.owner_email_enabled ? product.owner_raw_email : null,
      emailEnabled: !!product.owner_email_enabled
    };

    // Clean up raw owner fields from product root
    const cleanProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      rental_price: product.rental_price,
      price_period: product.price_period,
      security_deposit: product.security_deposit,
      condition: product.condition,
      city: product.city,
      location: product.location,
      available_from: product.available_from,
      available_until: product.available_until,
      availability_status: product.availability_status,
      views_count: product.views_count + 1,
      category_id: product.category_id,
      category_name: product.category_name,
      category_slug: product.category_slug,
      created_at: product.created_at,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80'],
      is_favorite: isFavorite,
      is_owner: req.user ? req.user.id === product.owner_id : false,
      owner
    };

    // Get related products from same category
    const rawRelated = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.availability_status = 'available'
      ORDER BY p.created_at DESC
      LIMIT 4
    `).all(product.category_id, product.id);

    const relatedProducts = attachImagesToProducts(rawRelated);

    return res.json({
      success: true,
      product: cleanProduct,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details.'
    });
  }
});

// 4. CREATE NEW PRODUCT
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      rental_price,
      price_period = 'day',
      security_deposit = 0,
      condition = 'Good',
      city,
      location,
      available_from,
      available_until,
      images = [],
      status = 'available'
    } = req.body;

    // Validation
    if (!name || !category_id || !description || rental_price === undefined || !city || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Product Name, Category, Description, Rental Price, City, Location).'
      });
    }

    if (isNaN(rental_price) || Number(rental_price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Rental price must be a valid positive number.'
      });
    }

    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(price_period)) {
      return res.status(400).json({
        success: false,
        message: 'Price period must be day, week, or month.'
      });
    }

    const validConditions = ['Brand New', 'Like New', 'Good', 'Fair'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: 'Condition must be Brand New, Like New, Good, or Fair.'
      });
    }

    // Insert Product
    const insertProductStmt = db.prepare(`
      INSERT INTO products (
        owner_id, category_id, name, description, rental_price, price_period,
        security_deposit, condition, city, location, available_from, available_until,
        availability_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insertProductStmt.run(
      req.user.id,
      Number(category_id),
      name.trim(),
      description.trim(),
      Number(rental_price),
      price_period,
      Number(security_deposit) || 0,
      condition,
      city.trim(),
      location.trim(),
      available_from || new Date().toISOString().split('T')[0],
      available_until || null,
      status === 'inactive' ? 'inactive' : 'available'
    );

    const productId = result.lastInsertRowid;

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      const insertImageStmt = db.prepare(`
        INSERT INTO product_images (product_id, image_url, display_order, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);

      images.forEach((url, idx) => {
        if (url && typeof url === 'string' && url.trim() !== '') {
          insertImageStmt.run(productId, url.trim(), idx);
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully for rent!',
      productId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product listing.'
    });
  }
});

// 5. UPDATE PRODUCT
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    // Verify ownership
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own listings.'
      });
    }

    const {
      name,
      category_id,
      description,
      rental_price,
      price_period,
      security_deposit,
      condition,
      city,
      location,
      available_from,
      available_until,
      images,
      availability_status
    } = req.body;

    db.prepare(`
      UPDATE products 
      SET name = ?, category_id = ?, description = ?, rental_price = ?, 
          price_period = ?, security_deposit = ?, condition = ?, city = ?, 
          location = ?, available_from = ?, available_until = ?, 
          availability_status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : product.name,
      category_id !== undefined ? Number(category_id) : product.category_id,
      description !== undefined ? description.trim() : product.description,
      rental_price !== undefined ? Number(rental_price) : product.rental_price,
      price_period !== undefined ? price_period : product.price_period,
      security_deposit !== undefined ? Number(security_deposit) : product.security_deposit,
      condition !== undefined ? condition : product.condition,
      city !== undefined ? city.trim() : product.city,
      location !== undefined ? location.trim() : product.location,
      available_from !== undefined ? available_from : product.available_from,
      available_until !== undefined ? available_until : product.available_until,
      availability_status !== undefined ? availability_status : product.availability_status,
      productId
    );

    // If new images provided, update image list
    if (Array.isArray(images)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
      const insertImageStmt = db.prepare(`
        INSERT INTO product_images (product_id, image_url, display_order, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `);
      images.forEach((url, idx) => {
        if (url && typeof url === 'string' && url.trim() !== '') {
          insertImageStmt.run(productId, url.trim(), idx);
        }
      });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product.'
    });
  }
});

// 6. TOGGLE PRODUCT STATUS (ACTIVE / INACTIVE)
router.patch('/:id/toggle-status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const newStatus = product.availability_status === 'available' ? 'inactive' : 'available';
    db.prepare(`UPDATE products SET availability_status = ?, updated_at = datetime('now') WHERE id = ?`).run(
      newStatus,
      productId
    );

    return res.json({
      success: true,
      message: `Product listing marked as ${newStatus === 'available' ? 'Active' : 'Inactive'}.`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling status:', error);
    return res.status(500).json({ success: false, message: 'Failed to change listing status.' });
  }
});

// 7. DELETE PRODUCT
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete your own listings.'
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    return res.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.'
    });
  }
});

export default router;
