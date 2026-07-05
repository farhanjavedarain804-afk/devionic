/**
 * checkTrustedDevice middleware
 * Attaches req.isTrustedDevice = true/false based on
 * whether (user_id, device_id) exists in trusted_devices
 * and is not expired or revoked.
 */
const db = require('../db');

const checkTrustedDevice = async (userId, deviceId, userAgent) => {
  if (!userId || !deviceId) return false;
  try {
    const [rows] = await db.query(
      `SELECT id FROM trusted_devices
       WHERE user_id = ? AND device_id = ? AND trusted = 1
         AND expires_at > NOW()
         AND user_agent = ?
       LIMIT 1`,
      [userId, deviceId, userAgent || '']
    );
    if (rows.length > 0) {
      // Update last_used in background
      db.query('UPDATE trusted_devices SET last_used = NOW() WHERE user_id = ? AND device_id = ?', [userId, deviceId]).catch(() => {});
      return true;
    }
    return false;
  } catch (err) {
    console.error('[TRUSTED-DEVICE-CHECK]', err.message);
    return false; // fail open — require 2FA if DB error
  }
};

module.exports = { checkTrustedDevice };
