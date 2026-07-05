const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');

// Get all quote requests with filtering
router.get('/', verifyToken, isAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT id, display_id, name, email, phone, company_name, country, budget, timeline, description, status, is_read, created_at FROM quote_requests';
    let params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quote request status
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, is_read } = req.body;
  try {
    const updates = {};
    if (typeof status === 'string' && status.trim()) updates.status = status.trim();
    if (is_read !== undefined) updates.is_read = is_read ? 1 : 0;
    if (Object.keys(updates).length === 0) return res.json({ message: 'No changes' });
    
    await db.query('UPDATE quote_requests SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Quote request updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete quote request
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM quote_requests WHERE id = ?', [id]);
    res.json({ message: 'Quote request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
