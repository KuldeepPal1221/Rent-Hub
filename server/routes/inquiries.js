import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. CREATE RENTAL INQUIRY
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      product_id,
      rental_start_date,
      rental_end_date,
      message,
      renter_phone,
      renter_name,
      renter_email
    } = req.body;

    if (!product_id || !rental_start_date || !rental_end_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID, rental start date, and rental end date.'
      });
    }

    const productId = Number(product_id);
    const product = db.prepare('SELECT id, owner_id, name, availability_status FROM products WHERE id = ?').get(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.owner_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a rental inquiry for your own product.'
      });
    }

    const nameToUse = renter_name || req.user.full_name;
    const emailToUse = renter_email || req.user.email;
    const phoneToUse = renter_phone || req.user.phone;

    const insertStmt = db.prepare(`
      INSERT INTO rental_inquiries (
        product_id, owner_id, renter_id, renter_name, renter_email, renter_phone,
        rental_start_date, rental_end_date, message, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `);

    const result = insertStmt.run(
      productId,
      product.owner_id,
      req.user.id,
      nameToUse.trim(),
      emailToUse.trim(),
      phoneToUse ? phoneToUse.trim() : null,
      rental_start_date,
      rental_end_date,
      message ? message.trim() : `Hi, I am interested in renting ${product.name} from ${rental_start_date} to ${rental_end_date}.`
    );

    return res.status(201).json({
      success: true,
      message: 'Rental inquiry submitted successfully! The owner will be notified.',
      inquiryId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rental inquiry.'
    });
  }
});

// 2. GET RECEIVED INQUIRIES (Owner view)
router.get('/received', authenticateToken, (req, res) => {
  try {
    const inquiries = db.prepare(`
      SELECT 
        ri.*,
        p.name as product_name,
        p.rental_price,
        p.price_period,
        p.city as product_city,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as product_image,
        u.profile_image as renter_avatar
      FROM rental_inquiries ri
      JOIN products p ON ri.product_id = p.id
      JOIN users u ON ri.renter_id = u.id
      WHERE ri.owner_id = ?
      ORDER BY ri.created_at DESC
    `).all(req.user.id);

    return res.json({
      success: true,
      inquiries
    });
  } catch (error) {
    console.error('Error fetching received inquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve received inquiries.'
    });
  }
});

// 3. GET SENT INQUIRIES (Renter view)
router.get('/sent', authenticateToken, (req, res) => {
  try {
    const inquiries = db.prepare(`
      SELECT 
        ri.*,
        p.name as product_name,
        p.rental_price,
        p.price_period,
        p.city as product_city,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as product_image,
        u.full_name as owner_name,
        u.phone as owner_phone,
        u.whatsapp_number as owner_whatsapp,
        u.email as owner_email,
        u.phone_contact_enabled as owner_phone_enabled,
        u.whatsapp_contact_enabled as owner_whatsapp_enabled,
        u.email_contact_enabled as owner_email_enabled
      FROM rental_inquiries ri
      JOIN products p ON ri.product_id = p.id
      JOIN users u ON ri.owner_id = u.id
      WHERE ri.renter_id = ?
      ORDER BY ri.created_at DESC
    `).all(req.user.id);

    // Sanitize owner contacts according to owner's privacy settings
    const sanitized = inquiries.map(item => ({
      ...item,
      owner_phone: item.owner_phone_enabled ? item.owner_phone : null,
      owner_whatsapp: item.owner_whatsapp_enabled ? (item.owner_whatsapp || item.owner_phone) : null,
      owner_email: item.owner_email_enabled ? item.owner_email : null
    }));

    return res.json({
      success: true,
      inquiries: sanitized
    });
  } catch (error) {
    console.error('Error fetching sent inquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sent inquiries.'
    });
  }
});

// 4. UPDATE INQUIRY STATUS (Owner: accept, reject, complete / Renter: cancel)
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const inquiryId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const inquiry = db.prepare('SELECT * FROM rental_inquiries WHERE id = ?').get(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Rental inquiry not found.' });
    }

    // Only owner can accept/reject/complete, renter can cancel
    if (inquiry.owner_id !== req.user.id && inquiry.renter_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (inquiry.renter_id === req.user.id && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Renters can only cancel inquiries. Status change is reserved for product owners.'
      });
    }

    db.prepare(`
      UPDATE rental_inquiries 
      SET status = ?, updated_at = datetime('now') 
      WHERE id = ?
    `).run(status, inquiryId);

    return res.json({
      success: true,
      message: `Inquiry status updated to ${status}.`,
      status
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.'
    });
  }
});

export default router;
