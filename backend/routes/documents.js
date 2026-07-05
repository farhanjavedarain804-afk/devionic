const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all documents
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, c.name as category_name 
      FROM documents d 
      LEFT JOIN document_categories c ON d.category_id = c.id 
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
        return res.json([]); // Return empty if table not yet created
    }
    res.status(500).json({ message: err.message });
  }
});

// Create document
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const { serial_number, title, description, file_url, category_id } = req.body;
  try {
    await db.query(`
      INSERT INTO documents (id, serial_number, title, description, file_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, serial_number, title, description, file_url, category_id]);
    res.status(201).json({ id, message: 'Document added' });
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id CHAR(36) PRIMARY KEY,
            serial_number VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            file_url TEXT,
            category_id CHAR(36),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        await db.query(`
          INSERT INTO documents (id, serial_number, title, description, file_url, category_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [id, serial_number, title, description, file_url, category_id]);
        return res.status(201).json({ id, message: 'Document added (Self-Healed)' });
      } catch (rErr) { console.error(rErr); }
    }
    res.status(500).json({ message: err.message });
  }
});

// Update document
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { serial_number, title, description, category_id } = req.body;
  try {
    await db.query(`
      UPDATE documents 
      SET serial_number = ?, title = ?, description = ?, category_id = ? 
      WHERE id = ?
    `, [serial_number, title, description, category_id, id]);
    res.json({ message: 'Document updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete document
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

