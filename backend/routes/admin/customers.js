const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// Get all customers
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, name, email, phone, whatsapp, address, city, company, notes, created_at, updated_at FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Customer
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { name, email, phone, whatsapp, address, city, company, notes } = req.body;
  const display_id = 'CUST-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  try {
    await db.query(
      'INSERT INTO customers (id, display_id, name, email, phone, whatsapp, address, city, company, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, name, email, phone, whatsapp, address, city, company, notes]
    );
    res.status(201).json({ id, display_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Customer
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.query('UPDATE customers SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Customer
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

