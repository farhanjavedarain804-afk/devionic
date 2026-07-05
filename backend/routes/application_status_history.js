const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get history for an application
router.get('/:application_id', verifyToken, isAdmin, async (req, res) => {
  const { application_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM job_application_status_history WHERE application_id = ? ORDER BY created_at DESC',
      [application_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a history entry (usually called from applications route, but exposed for manual entries)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { application_id, status, note } = req.body;
  
  if (!application_id || !status) {
    return res.status(400).json({ message: 'application_id and status are required' });
  }

  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO job_application_status_history (id, application_id, status, note) VALUES (?, ?, ?, ?)',
      [id, application_id, status, note]
    );
    res.status(201).json({ id, message: 'History entry created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a history entry note
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    await db.query(
      'UPDATE job_application_status_history SET note = ? WHERE id = ?',
      [note, id]
    );
    res.json({ message: 'History entry updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a history entry
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM job_application_status_history WHERE id = ?', [id]);
    res.json({ message: 'History entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

