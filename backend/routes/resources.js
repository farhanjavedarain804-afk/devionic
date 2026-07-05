const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');

// CREATE TABLE statement reused for self-healing on first insert
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS resources (
    id            CHAR(36)     PRIMARY KEY,
    resource_code VARCHAR(100) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    file_url      TEXT,
    file_name     VARCHAR(255),
    file_type     VARCHAR(20),
    file_size     BIGINT,
    is_published  TINYINT(1)   DEFAULT 1,
    sort_order    INT          DEFAULT 0,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

// Get all resources (admin — includes unpublished)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resources ORDER BY sort_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    if (err.message.includes("doesn't exist")) return res.json([]);
    res.status(500).json({ message: err.message });
  }
});

// Get single resource (admin)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Resource not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.message.includes("doesn't exist")) return res.status(404).json({ message: 'Resource not found' });
    res.status(500).json({ message: err.message });
  }
});

// Create resource
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const id = uuidv4();
  const {
    resource_code, title, description,
    file_url, file_name, file_type, file_size,
    is_published = 1, sort_order = 0
  } = req.body;

  if (!title || !resource_code) {
    return res.status(400).json({ message: 'Title and Resource ID are required' });
  }

  try {
    await db.query(`
      INSERT INTO resources (id, resource_code, title, description, file_url, file_name, file_type, file_size, is_published, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, resource_code, title, description || null, file_url || null, file_name || null, file_type || null, file_size || null, is_published ? 1 : 0, Number(sort_order) || 0]);
    res.status(201).json({ id, message: 'Resource added' });
  } catch (err) {
    if (err.message.includes("doesn't exist")) {
      try {
        await db.query(CREATE_TABLE_SQL);
        await db.query(`
          INSERT INTO resources (id, resource_code, title, description, file_url, file_name, file_type, file_size, is_published, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, resource_code, title, description || null, file_url || null, file_name || null, file_type || null, file_size || null, is_published ? 1 : 0, Number(sort_order) || 0]);
        return res.status(201).json({ id, message: 'Resource added (Self-Healed)' });
      } catch (rErr) {
        console.error(rErr);
        return res.status(500).json({ message: rErr.message });
      }
    }
    res.status(500).json({ message: err.message });
  }
});

// Update resource
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    resource_code, title, description,
    file_url, file_name, file_type, file_size,
    is_published, sort_order
  } = req.body;

  try {
    const [existing] = await db.query('SELECT file_url FROM resources WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Resource not found' });

    await db.query(`
      UPDATE resources
      SET resource_code = ?, title = ?, description = ?, file_url = ?, file_name = ?, file_type = ?, file_size = ?, is_published = ?, sort_order = ?
      WHERE id = ?
    `, [
      resource_code, title, description || null,
      file_url || null, file_name || null, file_type || null, file_size || null,
      is_published ? 1 : 0, Number(sort_order) || 0,
      id
    ]);

    // Delete the previous file from disk if it was replaced
    if (existing[0].file_url && file_url && existing[0].file_url !== file_url) {
      try {
        const oldFile = path.join(__dirname, '..', 'uploads', existing[0].file_url.split('/uploads/')[1]);
        if (oldFile && fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      } catch (e) { /* non-fatal */ }
    }

    res.json({ message: 'Resource updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete resource (also removes file from disk)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT file_url FROM resources WHERE id = ?', [req.params.id]);
    await db.query('DELETE FROM resources WHERE id = ?', [req.params.id]);

    if (rows.length > 0 && rows[0].file_url) {
      try {
        const file = path.join(__dirname, '..', 'uploads', rows[0].file_url.split('/uploads/')[1]);
        if (file && fs.existsSync(file)) fs.unlinkSync(file);
      } catch (e) { /* non-fatal */ }
    }

    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
