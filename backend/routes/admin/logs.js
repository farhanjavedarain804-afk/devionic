const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// Log user action
router.post('/', verifyToken, async (req, res) => {
  const { action, details } = req.body;
  const user_id = req.user.id;
  const user_email = req.user.email;
  const role = req.user.role;
  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO user_logs (id, user_id, user_email, role, action, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, user_email, role, action, details, req.ip || req.headers['x-forwarded-for']]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user logs
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, user_id, user_email, role, action, details, ip_address, location, created_at FROM user_logs ORDER BY created_at DESC LIMIT 500');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get login attempts (security)
router.get('/attempts', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, ip_address, action, status, created_at FROM login_attempts ORDER BY created_at DESC LIMIT 500');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

