const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all quote request notes
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM quote_request_notes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create quote request note
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { quote_request_id, status, note, attachments } = req.body;
  try {
    await db.query(`
      INSERT INTO quote_request_notes (id, quote_request_id, status, note, attachments)
      VALUES (?, ?, ?, ?, ?)
    `, [id, quote_request_id, status, note, JSON.stringify(attachments || [])]);
    res.status(201).json({ id, message: 'Note added' });
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS quote_request_notes (
            id CHAR(36) PRIMARY KEY,
            quote_request_id CHAR(36) NOT NULL,
            status VARCHAR(20) NOT NULL,
            note TEXT NOT NULL,
            attachments JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE
          )
        `);
        await db.query(`
          INSERT INTO quote_request_notes (id, quote_request_id, status, note, attachments)
          VALUES (?, ?, ?, ?, ?)
        `, [id, quote_request_id, status, note, JSON.stringify(attachments || [])]);
        return res.status(201).json({ id, message: 'Note added (Self-Healed Table)' });
      } catch (repairErr) {
        console.error('[QUOTE-REPAIR-FAILED]', repairErr.message);
      }
    }
    res.status(500).json({ message: 'Database Error in Quote Notes: ' + err.message });
  }
});

// Update quote request note
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  try {
    await db.query('UPDATE quote_request_notes SET note = ? WHERE id = ?', [note, id]);
    res.json({ message: 'Note updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete quote request note
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM quote_request_notes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

