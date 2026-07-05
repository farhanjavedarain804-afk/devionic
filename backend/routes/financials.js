const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get financial records
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, entry_date, type, category, description, amount, reference_type, reference_number, reference_id, notes, created_at, updated_at FROM financials ORDER BY entry_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Entry (Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { display_id, entry_date, type, category, description, amount, reference_type, reference_number, reference_id, notes } = req.body;
  try {
    await db.query(`
      INSERT INTO financials (id, display_id, entry_date, type, category, description, amount, reference_type, reference_number, reference_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, display_id, entry_date, type, category, description, amount, reference_type, reference_number, reference_id, notes]);
    res.status(201).json({ id, message: 'Financial entry created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Entry (Admin)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.id;
  delete updates.display_id;

  try {
    await db.query('UPDATE financials SET ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [updates, id]);
    res.json({ message: 'Financial entry updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Entry (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM financials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Financial entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

