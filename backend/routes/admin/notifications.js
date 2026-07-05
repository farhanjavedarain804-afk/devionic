const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');
const { generateSeriesNumber } = require('../../services/numberSeries');

// Get unread notifications count
router.get('/unread-count', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0');
    res.json({ count: rows[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create notification
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { title, message, type } = req.body;
  const id = await generateSeriesNumber('notification');
  try {
    await db.query(
      'INSERT INTO admin_notifications (id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
      [id, title, message, type || 'info']
    );
    res.status(201).json({ id, message: 'Notification created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all notifications
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, message, type, is_read, created_at FROM admin_notifications ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE admin_notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.post('/mark-all-read', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0');
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM admin_notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

