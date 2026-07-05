const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get attendance by date
router.get('/', verifyToken, isAdmin, async (req, res) => {
  const { date } = req.query;
  try {
    let query = 'SELECT id, display_id, staff_id, date, check_in, check_out, status, notes, created_at FROM attendance';
    let params = [];
    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record or update attendance
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { staff_id, date, check_in, check_out, status } = req.body;
  try {
    const id = uuidv4();
    await db.query(`
      INSERT INTO attendance (id, staff_id, date, check_in, check_out, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        check_in = VALUES(check_in), 
        check_out = VALUES(check_out), 
        status = VALUES(status)
    `, [id, staff_id, date, check_in, check_out, status]);
    res.json({ message: 'Attendance recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update attendance by staff/date
router.patch('/', verifyToken, isAdmin, async (req, res) => {
  const { staff_id, date, check_in, check_out, status } = req.body;
  try {
    const updates = {};
    if (check_in) updates.check_in = check_in;
    if (check_out) updates.check_out = check_out;
    if (status) updates.status = status;

    await db.query('UPDATE attendance SET ? WHERE staff_id = ? AND date = ?', [updates, staff_id, date]);
    res.json({ message: 'Attendance updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

