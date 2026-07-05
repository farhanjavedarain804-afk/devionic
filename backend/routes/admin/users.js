const express = require('express');
const router = express.Router();
const db = require('../../db');
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// Get ALL portal users (admin + user roles) with department & permissions
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.email as account_email, u.role, u.department_id, u.branch_id, u.custom_permissions,
             d.name as department_name, d.code as department_code, d.modules as department_modules,
             b.name as branch_name, b.code as branch_code
      FROM profiles p
      INNER JOIN users u ON p.id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY p.created_at DESC
    `);
    const parsed = rows.map(r => ({
      ...r,
      custom_permissions: typeof r.custom_permissions === 'string'
        ? JSON.parse(r.custom_permissions)
        : (r.custom_permissions || null),
      department_modules: typeof r.department_modules === 'string'
        ? JSON.parse(r.department_modules)
        : (r.department_modules || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get client-only users (role = 'user')
router.get('/clients', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.email as account_email, u.role
      FROM profiles p
      INNER JOIN users u ON p.id = u.id
      WHERE u.role = 'user'
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get team-only users (role != 'user')
router.get('/team', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.email as account_email, u.role, u.department_id, u.branch_id, u.custom_permissions,
             d.name as department_name, d.code as department_code,
             b.name as branch_name, b.code as branch_code
      FROM profiles p
      INNER JOIN users u ON p.id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.role != 'user'
      ORDER BY p.created_at DESC
    `);
    const parsed = rows.map(r => ({
      ...r,
      custom_permissions: typeof r.custom_permissions === 'string'
        ? JSON.parse(r.custom_permissions)
        : (r.custom_permissions || null)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new team user directly
router.post('/team', verifyToken, isAdmin, async (req, res) => {
  const { full_name, email, password, role, department_id, branch_id, company_name, contact_number } = req.body;
  
  if (!email || !password || !role || !full_name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const id = uuidv4();
  
  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (id, email, password, role, department_id, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, hashedPassword, role, department_id || null, branch_id || null]
    );

    await db.query(
      'INSERT INTO profiles (id, full_name, email, company_name, contact_number, is_approved) VALUES (?, ?, ?, ?, ?, 1)',
      [id, full_name, email, company_name || null, contact_number || null]
    );

    res.status(201).json({ message: 'Team user created successfully', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile status (approve/reject/pending)
router.patch('/:id/status', verifyToken, isAdmin, async (req, res) => {
  const { is_approved, is_rejected } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE profiles SET is_approved = ?, is_rejected = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_approved ? 1 : 0, is_rejected ? 1 : 0, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user credentials (email & password)
router.patch('/:id/credentials', verifyToken, isAdmin, async (req, res) => {
  const { email, password } = req.body;
  const { id } = req.params;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET email = ?, password = ? WHERE id = ?', [email, hashedPassword, id]);
    } else {
      await db.query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
    }
    await db.query('UPDATE profiles SET email = ? WHERE id = ?', [email, id]);
    res.json({ message: 'Credentials updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile details
router.patch('/:id/profile', verifyToken, isAdmin, async (req, res) => {
  const { full_name, company_name, contact_number } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE profiles SET full_name = ?, company_name = ?, contact_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, company_name, contact_number, id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role, department, branch, and custom permissions (DMS access control)
router.patch('/:id/permissions', verifyToken, isAdmin, async (req, res) => {
  const { role, department_id, branch_id, custom_permissions } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const params = [];
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (department_id !== undefined) { fields.push('department_id = ?'); params.push(department_id || null); }
    if (branch_id !== undefined) { fields.push('branch_id = ?'); params.push(branch_id || null); }
    if (custom_permissions !== undefined) {
      fields.push('custom_permissions = ?');
      params.push(custom_permissions ? JSON.stringify(custom_permissions) : null);
    }
    if (fields.length === 0) return res.json({ message: 'No changes' });
    params.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM profiles WHERE id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
