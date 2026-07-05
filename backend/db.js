const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const isLocal = process.env.NODE_ENV !== 'production';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: isLocal ? 10 : 50,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

const slowQueryThresholdMs = Number(process.env.SLOW_QUERY_THRESHOLD_MS || 500);
const slowQueryLogPath = path.join(__dirname, 'slow-queries.log');

const logSlowQuery = async (sql, params, durationMs) => {
  if (!Number.isFinite(durationMs) || durationMs < slowQueryThresholdMs) return;
  const entry = `[${new Date().toISOString()}] ${durationMs}ms :: ${sql} :: ${JSON.stringify(params || [])}\n`;
  console.warn('[SLOW-QUERY]', durationMs, sql);
  try {
    await fs.promises.appendFile(slowQueryLogPath, entry);
  } catch {
    // ignore logging failures
  }
};

const normalizeDbError = (err) => {
  if (err && ['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'].includes(err.code)) {
    const friendlyError = new Error('Database connection failed. The server cannot reach the database.');
    friendlyError.code = err.code;
    throw friendlyError;
  }
  throw err;
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log(`✅ MySQL Connected → ${process.env.DB_HOST}/${process.env.DB_NAME}`);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('\n❌ DATABASE CONNECTION FAILED');
      console.error('────────────────────────────────────────────────────────');
      console.error(`Error Code : ${err.code}`);
      console.error(`Host       : ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
      console.error(`Database   : ${process.env.DB_NAME}`);
      if (err.code === 'ETIMEDOUT') {
        console.error('\n📌 FIX — Your local machine IP is likely not whitelisted in cPanel.');
        console.error('   Option 1: Login to cPanel → Remote MySQL → Add your IP address');
        console.error('   Option 2: Change DB_HOST=127.0.0.1 in backend/.env to use local MySQL');
        console.error('   Option 3: Use XAMPP/WAMP local MySQL with local credentials');
      }
      console.error('────────────────────────────────────────────────────────\n');
    } else {
      console.error('❌ DB Connection Error:', err.code, '-', err.message);
    }
  }
};

setImmediate(() => {
  void testConnection();
});

const wrappedPool = {
  query: async (...args) => {
    try {
      const startedAt = Date.now();
      const result = await pool.query(...args);
      void logSlowQuery(args[0], args[1], Date.now() - startedAt);
      return result;
    } catch (err) {
      normalizeDbError(err);
    }
  },
  execute: async (...args) => {
    try {
      const startedAt = Date.now();
      const result = await pool.execute(...args);
      void logSlowQuery(args[0], args[1], Date.now() - startedAt);
      return result;
    } catch (err) {
      normalizeDbError(err);
    }
  },
  getConnection: (...args) => pool.getConnection(...args),
  withTransaction: async (handler) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await handler(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  beginTransaction: (...args) => pool.beginTransaction(...args),
  commit: (...args) => pool.commit(...args),
  rollback: (...args) => pool.rollback(...args),
  end: (...args) => pool.end(...args),
  pool,
};

module.exports = wrappedPool;
