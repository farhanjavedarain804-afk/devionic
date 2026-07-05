const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all complaints
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM complaints ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.resolved_attachments) updates.resolved_attachments = JSON.stringify(updates.resolved_attachments);
  
  // Remove fields that shouldn't be updated via SET ?
  delete updates.id;
  delete updates.tracking_id;

  try {
    const allowedFields = ['status', 'resolved_at', 'resolved_notes', 'resolved_attachments', 'name', 'email', 'phone', 'subject', 'description', 'admin_notes'];
    const sanitizedUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) sanitizedUpdates[key] = updates[key];
    });

    await db.query('UPDATE complaints SET ? WHERE id = ?', [sanitizedUpdates, id]);
    res.json({ message: 'Complaint updated' });
  } catch (err) {
    if (err.message.includes('Unknown column') || err.message.includes('Data too long')) {
      try {
        if (err.message.includes('resolved_at')) await db.query('ALTER TABLE complaints ADD COLUMN resolved_at DATETIME');
        if (err.message.includes('resolved_notes')) await db.query('ALTER TABLE complaints ADD COLUMN resolved_notes TEXT');
        if (err.message.includes('resolved_attachments')) await db.query('ALTER TABLE complaints ADD COLUMN resolved_attachments JSON');
        if (err.message.includes('admin_notes')) await db.query('ALTER TABLE complaints ADD COLUMN admin_notes TEXT');
        if (err.message.includes('status')) await db.query('ALTER TABLE complaints MODIFY COLUMN status VARCHAR(50) DEFAULT "pending"');
        
        await db.query('UPDATE complaints SET ? WHERE id = ?', [updates, id]);
        return res.json({ message: 'Complaint updated after auto-repair' });
      } catch (mErr) {}
    }
    res.status(500).json({ message: 'Failed to update: ' + err.message });
  }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM complaints WHERE id = ?', [req.params.id]);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

