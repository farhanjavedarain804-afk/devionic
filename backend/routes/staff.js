const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all staff
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, name, email, phone, cnic, position, department, join_date, staff_type, salary, bank_account, is_active, created_at, updated_at FROM staff ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Staff
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { 
    name, email, phone, cnic, position, department, 
    join_date, staff_type, salary, is_active 
  } = req.body;
  const display_id = 'STF-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  try {
    await db.query(`
      INSERT INTO staff (
        id, display_id, name, email, phone, cnic, position, 
        department, join_date, staff_type, salary, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, display_id, name, email, phone, cnic, position, 
      department, join_date, staff_type, salary, is_active !== undefined ? is_active : 1
    ]);
    res.status(201).json({ id, display_id, message: 'Staff created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Staff
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.query('UPDATE staff SET ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [updates, id]);
    res.json({ message: 'Staff updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Partial Update Staff (e.g. status)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.query('UPDATE staff SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Staff updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Staff
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

