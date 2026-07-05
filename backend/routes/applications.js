const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const uuidv4 = require('../utils/uuid');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

// Get all applications (Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req.query, { limit: 50, maxLimit: 200 });
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM job_applications');
    const [rows] = await db.query(
      'SELECT id, application_number, verification_id, job_id, job_title, full_name, email, phone1, phone2, whatsapp, cnic, city, province, status, employee_id, created_at, updated_at FROM job_applications ORDER BY created_at DESC'
      + ' LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ data: rows, meta: buildPaginationMeta({ page, limit, total }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check application status (publicly accessible)
router.get('/status', async (req, res) => {
  const { cnic, appNum } = req.query;
  
  if (!cnic && !appNum) {
    return res.status(400).json({ message: 'CNIC or Application Number is required' });
  }

  try {
    let query = 'SELECT id, application_number, verification_id, job_id, job_title, full_name, email, phone1, phone2, whatsapp, cnic, city, province, status, employee_id, created_at, updated_at FROM job_applications WHERE ';
    let params = [];

    if (cnic && appNum) {
      query += 'cnic = ? AND application_number = ?';
      params = [cnic, appNum.toUpperCase()];
    } else if (appNum) {
      query += 'application_number = ?';
      params = [appNum.toUpperCase()];
    } else {
      query += 'cnic = ?';
      params = [cnic];
    }

    const [rows] = await db.query(query, params);
    if (!rows.length) {
      return res.status(404).json({ message: 'No application found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application (Admin)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  
  // Remove immutable fields
  delete updates.id;
  delete updates.application_number;

  try {
    const { status, note } = req.body;
    
    // Check if status changed or a note is provided to create history
    if (status || note) {
      const historyId = uuidv4();
      await db.query(
        'INSERT INTO job_application_status_history (id, application_id, status, note) VALUES (?, ?, ?, ?)',
        [historyId, id, status || 'updated', note || '']
      );
    }

    // Remove history-only fields from the main application update object
    delete updates.note;

    await db.query('UPDATE job_applications SET ? WHERE id = ?', [updates, id]);
    res.json({ message: 'Application updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete application (Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM job_applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

