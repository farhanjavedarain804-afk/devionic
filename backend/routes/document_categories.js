const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// Get all categories
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM document_categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  try {
    await db.query('INSERT INTO document_categories (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id, name, message: 'Category created' });
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS document_categories (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.query('INSERT INTO document_categories (id, name) VALUES (?, ?)', [id, name]);
        return res.status(201).json({ id, name, message: 'Category created (Self-Healed)' });
      } catch (rErr) { console.error(rErr); }
    }
    res.status(500).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM document_categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

