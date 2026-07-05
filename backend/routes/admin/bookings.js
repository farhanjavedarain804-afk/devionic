const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// Get all bookings
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes, source, created_at, updated_at FROM bookings ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add booking
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes, source } = req.body;
  const id = uuidv4();
  const display_id = `BK-${Date.now().toString().slice(-6)}`;
  
  try {
    await db.query(
      'INSERT INTO bookings (id, display_id, title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes, source || 'manual']
    );
    res.status(201).json({ id, display_id, message: 'Booking created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes } = req.body;
  try {
    await db.query(
      'UPDATE bookings SET title = ?, client_name = ?, client_email = ?, client_phone = ?, service = ?, description = ?, status = ?, booking_date = ?, amount = ?, notes = ? WHERE id = ?',
      [title, client_name, client_email, client_phone, service, description, status, booking_date, amount, notes, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete booking
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

