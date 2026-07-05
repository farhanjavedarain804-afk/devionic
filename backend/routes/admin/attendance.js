const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');

// Get monthly attendance for all staff
router.get('/monthly', verifyToken, isAdmin, async (req, res) => {
  const { start, end } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT id, display_id, staff_id, date, check_in, check_out, status, notes, created_at FROM attendance WHERE date >= ? AND date <= ?',
      [start, end]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all active staff
router.get('/staff', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, name, position, department, is_active FROM staff WHERE is_active = 1 ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
