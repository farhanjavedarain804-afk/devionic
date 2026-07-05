const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all service inquiries
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, display_id, full_name, email, phone, whatsapp, city, address, service_title, project_description, project_timeline, approved_budget, attachments, status, is_read, resolved_at, resolved_notes, created_at, updated_at FROM service_inquiries ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status/resolved notes
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.resolved_attachments) updates.resolved_attachments = JSON.stringify(updates.resolved_attachments);
  if (updates.attachments) updates.attachments = JSON.stringify(updates.attachments);

  try {
    const allowedFields = ['status', 'is_read', 'resolved_at', 'resolved_notes', 'resolved_attachments', 'full_name', 'email', 'phone', 'city', 'service_title', 'project_description', 'project_timeline', 'approved_budget', 'attachments'];
    const sanitizedUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) sanitizedUpdates[key] = updates[key];
    });

    await db.query('UPDATE service_inquiries SET ? WHERE id = ?', [sanitizedUpdates, id]);
    res.json({ message: 'Service inquiry updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update: ' + err.message });
  }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM service_inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

