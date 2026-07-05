const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const { getQueueStats } = require('../../utils/taskQueue');

router.get('/health', verifyToken, isAdmin, async (req, res) => {
  const startedAt = Date.now();
  let dbOk = true;
  let dbLatencyMs = null;

  try {
    const dbStart = Date.now();
    await db.query('SELECT 1');
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbOk = false;
  }

  res.json({
    ok: dbOk,
    responseTimeMs: Date.now() - startedAt,
    dbLatencyMs,
    queue: getQueueStats(),
    uptimeSeconds: Math.round(process.uptime()),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

module.exports = router;
