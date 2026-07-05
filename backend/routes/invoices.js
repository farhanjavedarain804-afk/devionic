const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const generateUUID = uuidv4;
const { generateSeriesNumber } = require('../services/numberSeries');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { pickAllowedUpdates } = require('../utils/updateWhitelist');

// Get all invoices (Admin only or filter by email for user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, { limit: 50, maxLimit: 200 });
    const countQuery = req.user.role !== 'admin'
      ? 'SELECT COUNT(*) AS total FROM invoices WHERE client_email = ?'
      : 'SELECT COUNT(*) AS total FROM invoices';
    const countParams = req.user.role !== 'admin' ? [req.user.email] : [];
    const [[{ total }]] = await db.query(countQuery, countParams);
    let query = 'SELECT id, invoice_number, verification_id, client_name, client_email, client_phone, client_address, subtotal, tax_rate, tax_amount, discount, total, paid_amount, currency, status, due_date, notes, customer_id, created_at, updated_at FROM invoices';
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE client_email = ?';
      params.push(req.user.email);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(query, params);

    // Parse items JSON for each row
    const parsed = rows.map(r => ({
      ...r,
      items: (() => { try { return typeof r.items === 'string' ? JSON.parse(r.items) : r.items; } catch { return []; } })(),
    }));
    res.json({ data: parsed, meta: buildPaginationMeta({ page, limit, total }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Invoice — auto-generates invoice_number, verification_id
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = generateUUID();
  const {
    client_name, client_email, client_phone, client_address,
    items, subtotal, tax_rate, tax_amount, discount, total,
    paid_amount, currency, status, due_date, notes, customer_id,
  } = req.body;

  // Auto-generate invoice number and verification id server-side
  const invoice_number = await generateSeriesNumber('invoice');
  const verification_id = await generateSeriesNumber('verification');

  try {
    await db.query(`
      INSERT INTO invoices (
        id, invoice_number, verification_id, client_name, client_email,
        client_phone, client_address, items, subtotal, tax_rate,
        tax_amount, discount, total, paid_amount, currency, status, due_date, notes, customer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, invoice_number, verification_id, client_name, client_email || null,
      client_phone || null, client_address || null,
      JSON.stringify(items || []),
      subtotal || 0, tax_rate || 0,
      tax_amount || 0, discount || 0, total || 0,
      paid_amount || 0, currency || 'PKR', status || 'draft',
      due_date || null, notes || null, customer_id || null,
    ]);
    res.status(201).json({ id, invoice_number, verification_id, message: 'Invoice created' });
  } catch (err) {
    console.error('[INVOICE CREATE ERROR]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update Invoice (PUT — full update)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = pickAllowedUpdates(req.body, [
    'client_name', 'client_email', 'client_phone', 'client_address', 'items',
    'subtotal', 'tax_rate', 'tax_amount', 'discount', 'total', 'paid_amount',
    'currency', 'status', 'due_date', 'notes', 'customer_id'
  ]);
  if (updates.items) updates.items = JSON.stringify(updates.items);

  // Protect immutable fields
  delete updates.id;
  delete updates.invoice_number;
  delete updates.verification_id;

  try {
    await db.query('UPDATE invoices SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Invoice updated' });
  } catch (err) {
    console.error('[INVOICE UPDATE ERROR]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Patch Invoice (partial update — used for payment recording)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = pickAllowedUpdates(req.body, [
    'client_name', 'client_email', 'client_phone', 'client_address', 'items',
    'subtotal', 'tax_rate', 'tax_amount', 'discount', 'total', 'paid_amount',
    'currency', 'status', 'due_date', 'notes', 'customer_id'
  ]);
  if (updates.items) updates.items = JSON.stringify(updates.items);

  delete updates.id;
  delete updates.invoice_number;
  delete updates.verification_id;

  try {
    await db.query('UPDATE invoices SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Invoice patched' });
  } catch (err) {
    console.error('[INVOICE PATCH ERROR]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Delete Invoice
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
