const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all quotations (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM quotations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Quotation
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { 
    client_name, client_email, client_phone, client_address, 
    items, subtotal, tax_rate, tax_amount, discount, total, 
    currency, status, valid_until, notes, customer_id 
  } = req.body;
  const quotation_number = 'QUO-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const verification_id = 'VER-QUO-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  try {
    await db.query(`
      INSERT INTO quotations (
        id, quotation_number, verification_id, client_name, client_email, 
        client_phone, client_address, items, subtotal, tax_rate, 
        tax_amount, discount, total, currency, status, valid_until, notes, customer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, quotation_number, verification_id, client_name, client_email, 
      client_phone, client_address, JSON.stringify(items), subtotal, tax_rate, 
      tax_amount, discount, total, currency || 'PKR', status || 'draft', valid_until, notes, customer_id || null
    ]);
    res.status(201).json({ id, quotation_number, message: 'Quotation created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Quotation
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.items) updates.items = JSON.stringify(updates.items);
  
  // Remove fields that shouldn't be updated via SET ?
  delete updates.id;
  delete updates.quotation_number;
  delete updates.verification_id;

  try {
    await db.query('UPDATE quotations SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Quotation updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch Quotation
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.items) updates.items = JSON.stringify(updates.items);

  delete updates.id;
  delete updates.quotation_number;
  delete updates.verification_id;

  try {
    await db.query('UPDATE quotations SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Quotation patched' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Quotation
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM quotations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

