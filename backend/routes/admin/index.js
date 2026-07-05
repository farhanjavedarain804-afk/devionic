/**
 * Admin Barrel Router
 * Base path: /api/dms/admin
 *
 * All routes mounted here are protected by verifyToken + isAdmin middleware.
 * Sub-route files retain their own guards as defense-in-depth.
 */

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../../middleware/auth');

// ─── Global Admin Guard ────────────────────────────────────────────────────
// Applied once here so every sub-route below is automatically protected.
router.use(verifyToken, isAdmin);

// ─── Admin Sub-Routes ──────────────────────────────────────────────────────
router.use('/stats',           require('./stats'));
router.use('/logs',            require('./logs'));
router.use('/notifications',   require('./notifications'));
router.use('/users',           require('./users'));
router.use('/customers',       require('./customers'));
router.use('/quote_requests',  require('./quote_requests'));
router.use('/audit',           require('./audit'));
router.use('/feedback_calls',  require('./feedback_calls'));
router.use('/ops',             require('./ops'));
router.use('/bookings',        require('./bookings'));
router.use('/content',         require('./content'));
router.use('/attendance',      require('./attendance'));
router.use('/departments',     require('./departments'));
router.use('/branches',        require('./branches'));

module.exports = router;
