const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all tickets
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, tracking_id, name, email, phone, subject, description, status, resolved_at, resolved_notes, admin_notes, created_at, updated_at FROM tickets ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update ticket
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

    await db.query('UPDATE tickets SET ? WHERE id = ?', [sanitizedUpdates, id]);
    res.json({ message: 'Ticket updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update: ' + err.message });
  }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
