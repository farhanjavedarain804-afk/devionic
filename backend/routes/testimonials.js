const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken: auth } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const generateUUID = uuidv4;

// Get testimonials (Public and Admin)
router.get('/', async (req, res) => {
  const { approvedOnly } = req.query;
  try {
    let query = 'SELECT * FROM testimonials';
    if (approvedOnly === 'true') query += ' WHERE is_approved = TRUE AND is_active = TRUE';
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Testimonial
router.post('/', auth, async (req, res) => {
  const id = generateUUID();
  const { display_id, name, email, company, role, rating, message } = req.body;
  try {
    await db.query(`
      INSERT INTO testimonials (id, display_id, name, email, company, role, rating, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, display_id, name, email || req.user.email, company, role, rating, message]);
    res.status(201).json({ id, message: 'Testimonial submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status (Admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await db.query('UPDATE testimonials SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Testimonial updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
