const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const uuidv4 = require('../utils/uuid');

// Track visitor action (pageview, heartbeat, leave)
router.post('/track', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const { session_id, page_path, referrer, user_agent, duration_seconds, action } = req.body;
  const ip_address = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    let user_id = null;
    let user_email = null;

    // Optional: Extract user from JWT token if authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devionic_secret_key_2026');
        user_id = decoded.id;
        user_email = decoded.email;
      } catch (err) {} // Silent ignore if token invalid
    }

    // Check if session exists in visitor_sessions
    const [sessions] = await db.query('SELECT * FROM visitor_sessions WHERE session_id = ?', [session_id]);
    
    if (sessions.length === 0) {
      // Create new session
      await db.query(
        'INSERT INTO visitor_sessions (id, session_id, user_id, user_email, ip_address, user_agent, started_at, last_seen_at, is_online) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)',
        [uuidv4(), session_id, user_id, user_email, ip_address, user_agent]
      );
    } else {
      // Update existing session
      let updateQuery = 'UPDATE visitor_sessions SET last_seen_at = CURRENT_TIMESTAMP, is_online = ?';
      const updateParams = [action === 'leave' ? 0 : 1];
      
      if (user_id && !sessions[0].user_id) {
        updateQuery += ', user_id = ?, user_email = ?';
        updateParams.push(user_id, user_email);
      }
      
      updateQuery += ' WHERE session_id = ?';
      updateParams.push(session_id);
      
      await db.query(updateQuery, updateParams);
    }

    // Log the hit if it's a pageview
    if (action === 'pageview') {
      await db.query(
        'INSERT INTO page_views (id, session_id, page_path, referrer, user_agent, ip_address, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), session_id, page_path, referrer, user_agent, ip_address, duration_seconds || 0]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Visitor tracking error:', err.message);
    res.status(500).json({ message: 'Internal tracking error' });
  }
});

// Get Page Views
const { verifyToken, isAdmin } = require('../middleware/auth');
router.get('/page-views', verifyToken, isAdmin, async (req, res) => {
  const { from } = req.query;
  try {
    let query = 'SELECT * FROM page_views';
    const params = [];
    if (from) {
      query += ' WHERE created_at >= ?';
      params.push(from);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Visitor Sessions
router.get('/sessions', verifyToken, isAdmin, async (req, res) => {
  const { from } = req.query;
  try {
    let query = 'SELECT * FROM visitor_sessions';
    const params = [];
    if (from) {
      query += ' WHERE started_at >= ?';
      params.push(from);
    }
    query += ' ORDER BY last_seen_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

