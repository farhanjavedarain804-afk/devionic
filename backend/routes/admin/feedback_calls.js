const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// Get all feedback calls
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, customer_name, customer_phone, customer_email, project_reference, q1_rating, q2_rating, q3_rating, q4_rating, q5_rating, total_score, notes, called_by, call_date, created_at, updated_at FROM feedback_calls ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add feedback call
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { customer_name, customer_phone, customer_email, project_reference, q1_rating, q2_rating, q3_rating, q4_rating, q5_rating, notes, called_by, total_score } = req.body;
  const id = uuidv4();
  const display_id = `FB-${Date.now().toString().slice(-6)}`;
  
  try {
    await db.query(
      'INSERT INTO feedback_calls (id, display_id, customer_name, customer_phone, customer_email, project_reference, q1_rating, q2_rating, q3_rating, q4_rating, q5_rating, notes, called_by, total_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, customer_name, customer_phone, customer_email, project_reference, q1_rating, q2_rating, q3_rating, q4_rating, q5_rating, notes, called_by, total_score]
    );
    res.status(201).json({ id, display_id, message: 'Feedback recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete feedback call
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM feedback_calls WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

