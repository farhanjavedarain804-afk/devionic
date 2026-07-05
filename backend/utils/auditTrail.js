const db = require('../db');
const uuidv4 = require('./uuid');

const recordAuditTrail = async ({ user, action, details = null, ipAddress = null, entityType = null, entityId = null }) => {
  const id = uuidv4();
  await db.query(
    'INSERT INTO audit_events (id, user_id, user_email, role, action, entity_type, entity_id, after_data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      user?.id || null,
      user?.email || null,
      user?.role || null,
      action,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
      ipAddress,
      null,
    ]
  );
  return id;
};

module.exports = {
  recordAuditTrail,
};
