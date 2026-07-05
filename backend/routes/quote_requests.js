const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken: auth } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const generateUUID = uuidv4;
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { pickAllowedUpdates } = require('../utils/updateWhitelist');

// Get all quote requests
router.get('/', auth, async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, { limit: 50, maxLimit: 200 });
    const countQuery = req.user.role !== 'admin'
      ? 'SELECT COUNT(*) AS total FROM quote_requests WHERE email = ?'
      : 'SELECT COUNT(*) AS total FROM quote_requests';
    const countParams = req.user.role !== 'admin' ? [req.user.email] : [];
    const [[{ total }]] = await db.query(countQuery, countParams);
    let query = 'SELECT id, display_id, name, company_name, country, email, service, budget, timeline, description, status, is_read, created_at FROM quote_requests';
    let params = [];
    
    if (req.user.role !== 'admin') {
      query += ' WHERE email = ?';
      params.push(req.user.email);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(query, params);
    res.json({ data: rows, meta: buildPaginationMeta({ page, limit, total }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Quote Request (Public or Authenticated)
router.post('/', async (req, res) => {
  const id = generateUUID();
  const { 
    display_id, full_name, company_name, country, email, 
    service, budget, timeline, description 
  } = req.body;
  const name = full_name;

  try {
    await db.query(`
      INSERT INTO quote_requests (
        id, display_id, name, company_name, country, email, 
        service, budget, timeline, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      id, display_id, name, company_name, country, email,
      service, budget, timeline, description
    ]);
    res.status(201).json({ id, message: 'Quote request submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status (Admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const updates = pickAllowedUpdates(req.body, ['name', 'company_name', 'country', 'email', 'phone', 'service', 'budget', 'timeline', 'description', 'status', 'is_read']);
    if (Object.keys(updates).length === 0) {
      return res.json({ message: 'No changes' });
    }
    await db.query('UPDATE quote_requests SET ? WHERE id = ?', [updates, req.params.id]);
    res.json({ message: 'Quote request updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete quote request
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await db.query('DELETE FROM quote_requests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quote request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
