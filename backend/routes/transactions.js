const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { pickAllowedUpdates } = require('../utils/updateWhitelist');

// Get all transactions
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, { limit: 50, maxLimit: 200 });
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM transactions');
    const [rows] = await db.query(
      'SELECT id, display_id, transaction_date, type, category, description, amount, payment_method, from_name, to_name, reference_number, reference_type, reference_id, notes, created_at, updated_at FROM transactions ORDER BY transaction_date DESC'
      + ' LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ data: rows, meta: buildPaginationMeta({ page, limit, total }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Transaction
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { 
    transaction_date, type, category, description, amount, 
    payment_method, from_name, to_name, reference_number, notes,
    display_id 
  } = req.body;

  try {
    const finalDisplayId = display_id || 'TXN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    await db.query(`
      INSERT INTO transactions (
        id, display_id, transaction_date, type, category, description, amount, 
        payment_method, from_name, to_name, reference_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, finalDisplayId, transaction_date, type, category, description, amount,
      payment_method, from_name || null, to_name || null, reference_number || null, notes || null
    ]);
    res.status(201).json({ id, display_id: finalDisplayId, message: 'Transaction created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Transaction
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = pickAllowedUpdates(req.body, [
    'transaction_date', 'type', 'category', 'description', 'amount',
    'payment_method', 'from_name', 'to_name', 'reference_number',
    'reference_type', 'reference_id', 'notes'
  ]);

  try {
    await db.query('UPDATE transactions SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Transaction
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
