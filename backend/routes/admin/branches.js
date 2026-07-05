const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// GET all branches
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, code, location, contact_email, contact_phone, status, created_at, updated_at FROM branches ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create branch
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name, code, location, contact_email, contact_phone, status } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Name and code are required' });
  const id = uuidv4();
  try {
    await db.query(
      'INSERT INTO branches (id, name, code, location, contact_email, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, code.toUpperCase(), location || '', contact_email || '', contact_phone || '', status || 'active']
    );
    res.status(201).json({ id, message: 'Branch created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Branch code already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PATCH update branch
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, code, location, contact_email, contact_phone, status } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (code !== undefined) { fields.push('code = ?'); params.push(code.toUpperCase()); }
    if (location !== undefined) { fields.push('location = ?'); params.push(location); }
    if (contact_email !== undefined) { fields.push('contact_email = ?'); params.push(contact_email); }
    if (contact_phone !== undefined) { fields.push('contact_phone = ?'); params.push(contact_phone); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (fields.length === 0) return res.json({ message: 'No changes' });
    params.push(id);
    await db.query(`UPDATE branches SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Branch updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE branch
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Unassign users from this branch before deletion
    await db.query('UPDATE users SET branch_id = NULL WHERE branch_id = ?', [id]);
    await db.query('DELETE FROM branches WHERE id = ?', [id]);
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET users in a specific branch
router.get('/:id/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.email as account_email, u.role, u.department_id, u.branch_id, u.custom_permissions
      FROM profiles p
      INNER JOIN users u ON p.id = u.id
      WHERE u.branch_id = ?
      ORDER BY p.full_name ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
