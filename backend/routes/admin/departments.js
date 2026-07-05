const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// GET all departments
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, code, description, modules, created_at, updated_at FROM departments ORDER BY name ASC');
    const parsed = rows.map(r => ({
      ...r,
      modules: typeof r.modules === 'string' ? JSON.parse(r.modules) : (r.modules || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create department
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name, code, description, modules } = req.body;
  if (!name || !code) return res.status(400).json({ message: 'Name and code are required' });
  const id = uuidv4();
  try {
    await db.query(
      'INSERT INTO departments (id, name, code, description, modules) VALUES (?, ?, ?, ?, ?)',
      [id, name, code.toUpperCase(), description || '', JSON.stringify(modules || [])]
    );
    res.status(201).json({ id, message: 'Department created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Department code already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PATCH update department
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, code, description, modules } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (code !== undefined) { fields.push('code = ?'); params.push(code.toUpperCase()); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (modules !== undefined) { fields.push('modules = ?'); params.push(JSON.stringify(modules)); }
    if (fields.length === 0) return res.json({ message: 'No changes' });
    params.push(id);
    await db.query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Department updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE department
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Unassign users from this department before deletion
    await db.query('UPDATE users SET department_id = NULL WHERE department_id = ?', [id]);
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET users in a specific department
router.get('/:id/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.email as account_email, u.role, u.department_id, u.custom_permissions
      FROM profiles p
      INNER JOIN users u ON p.id = u.id
      WHERE u.department_id = ?
      ORDER BY p.full_name ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
