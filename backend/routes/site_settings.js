const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const { invalidateSiteSettingsCache } = require('../utils/siteSettings');

// Get all settings
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, `key`, value, updated_at FROM site_settings ORDER BY `key`');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single setting by key
router.get('/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, `key`, value, updated_at FROM site_settings WHERE `key` = ? LIMIT 1', [req.params.key]);
    if (rows.length === 0) {
      if (req.params.key === 'maintenance_mode') {
        return res.json({ key: 'maintenance_mode', value: 'false' });
      }
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upsert setting
router.post('/upsert', verifyToken, isAdmin, async (req, res) => {
  const { key, value } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM site_settings WHERE `key` = ?', [key]);
    if (existing.length > 0) {
      await db.query('UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE `key` = ?', [value, key]);
    } else {
      const id = uuidv4();
      await db.query('INSERT INTO site_settings (id, `key`, value) VALUES (?, ?, ?)', [id, key, value]);
    }
    invalidateSiteSettingsCache();
    res.json({ message: 'Setting updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

