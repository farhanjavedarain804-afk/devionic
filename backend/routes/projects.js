const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { pickAllowedUpdates } = require('../utils/updateWhitelist');

// Get all projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, { limit: 50, maxLimit: 200 });
    const countQuery = req.user.role !== 'admin'
      ? 'SELECT COUNT(*) AS total FROM projects WHERE client_email = ?'
      : 'SELECT COUNT(*) AS total FROM projects';
    const countParams = req.user.role !== 'admin' ? [req.user.email] : [];
    const [[{ total }]] = await db.query(countQuery, countParams);
    let query = 'SELECT id, display_id, title, description, client_email, status, budget, start_date, end_date, milestones, notes, customer_id, invoice_id, quotation_id, created_at, updated_at FROM projects';
    let params = [];
    
    if (req.user.role !== 'admin') {
      query += ' WHERE client_email = ?';
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

// Create Project
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { 
    display_id, title, description, client_email, status, 
    budget, start_date, end_date, milestones, notes,
    customer_id, invoice_id, invoice_number
  } = req.body;

  try {
    const finalDisplayId = display_id || 'PROJ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    await db.query(`
      INSERT INTO projects (
        id, display_id, title, description, client_email, status, budget, 
        start_date, end_date, milestones, notes, customer_id, invoice_id, quotation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, finalDisplayId, title, description, client_email, status, budget, 
      start_date, end_date, JSON.stringify(milestones || []), notes,
      customer_id || null, invoice_id || null, req.body.quotation_id || null
    ]);
    res.status(201).json({ id, display_id: finalDisplayId, message: 'Project created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Project
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = pickAllowedUpdates(req.body, [
    'title', 'description', 'client_email', 'status', 'budget',
    'start_date', 'end_date', 'milestones', 'notes', 'customer_id',
    'invoice_id', 'quotation_id'
  ]);
  if (updates.milestones) updates.milestones = JSON.stringify(updates.milestones);

  try {
    await db.query('UPDATE projects SET ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [updates, id]);
    res.json({ message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Project
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

