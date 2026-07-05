const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all salary slips
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM salary_slips ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Salary Slip
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { 
    staff_id, month, year, basic_salary, 
    allowances, deductions, net_salary, notes, status 
  } = req.body;
  const verification_id = 'VER-SAL-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  try {
    await db.query(`
      INSERT INTO salary_slips (
        id, verification_id, staff_id, month, year, 
        basic_salary, allowances, deductions, net_salary, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, verification_id, staff_id, month, year, 
      basic_salary, allowances, deductions, net_salary, notes, status || 'draft'
    ]);
    res.status(201).json({ id, verification_id, message: 'Salary slip created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, paid_at } = req.body;
  try {
    const updates = { status };
    if (paid_at) updates.paid_at = paid_at;
    await db.query('UPDATE salary_slips SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM salary_slips WHERE id = ?', [req.params.id]);
    res.json({ message: 'Salary slip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

