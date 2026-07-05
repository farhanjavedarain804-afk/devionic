const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all general inquiries
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, display_id, name, email, phone, subject, message, status, is_read, resolved_at, resolved_notes, created_at FROM inquiries ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status/resolved notes
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.resolved_attachments) updates.resolved_attachments = JSON.stringify(updates.resolved_attachments);
  
  // Remove fields that shouldn't be updated via SET ?
  delete updates.id;
  delete updates.display_id;

  try {
    const allowedFields = ['status', 'is_read', 'resolved_at', 'resolved_notes', 'resolved_attachments', 'message', 'name', 'email', 'phone', 'subject'];
    const sanitizedUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) sanitizedUpdates[key] = updates[key];
    });

    await db.query('UPDATE inquiries SET ? WHERE id = ?', [sanitizedUpdates, id]);
    res.json({ message: 'Inquiry updated' });
    } catch (err) {
    console.error('[INQUIRY-PATCH] Error:', err.message);
    res.status(500).json({ message: 'Failed to update inquiry: ' + err.message });
  }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

