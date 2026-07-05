const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken: auth } = require('../middleware/auth');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// Get all users (Admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { page, limit, offset } = parsePagination(req.query, { limit: 100, maxLimit: 500 });
  try {
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM users u
      WHERE u.role = 'user'
    `);
    const [rows] = await db.query(`
      SELECT u.id, u.email, u.role, u.created_at, 
             p.full_name, p.company_name, p.contact_number, p.is_approved, p.is_rejected
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    res.json({ data: rows, meta: buildPaginationMeta({ page, limit, total }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user profile
router.get('/:id', auth, async (req, res) => {
  // Allow user to see their own profile OR admin to see any
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.email, u.role, u.created_at, 
             p.full_name, p.company_name, p.contact_number, p.is_approved, p.is_rejected,
             p.last_login_ip, p.last_login_location, p.last_login_device
      FROM users u
      LEFT JOIN profiles p ON u.id = p.id
      WHERE u.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile approval (Admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await db.query('UPDATE profiles SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
