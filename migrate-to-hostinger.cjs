/**
 * Devionic - Database Migration Script
 * Migrates all tables and data from old DB to new Hostinger DB.
 * Usage: node migrate-to-hostinger.cjs
 */

'use strict';
const path = require('path');
const fs = require('fs');

// Load dotenv and mysql2 from backend's own node_modules
const backendDir = path.join(__dirname, 'backend');
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(backendDir, '.env') });
const mysql = require(path.join(backendDir, 'node_modules', 'mysql2', 'promise'));

// ─── NEW DATABASE CREDENTIALS ────────────────────────────────────────────────
const NEW_DB = {
  host: '127.0.0.1',
  port: 3306,
  user: 'u168718068_devionic_use',
  password: 'Furhan@Javed&8899abcd&1234',
  database: 'u168718068_devionic_db',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
};

// ─── OLD DATABASE CREDENTIALS (from backend/.env) ───────────────────────────
const OLD_DB = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
};

const TABLES_IN_ORDER = [
  'users', 'profiles', 'customers', 'staff', 'projects',
  'invoices', 'quotations', 'quote_requests', 'inquiries',
  'service_inquiries', 'complaints', 'complaint_notes',
  'tickets', 'ticket_notes', 'inquiry_notes', 'quote_request_notes',
  'testimonials', 'financials', 'transactions', 'services', 'jobs',
  'job_applications', 'attendance', 'salary_slips', 'site_settings',
  'portfolio', 'admin_notifications', 'user_logs', 'login_attempts',
  'visitor_sessions', 'page_views', 'feedback_calls', 'bookings',
  'number_series',
  // DMS tables added by migrations
  'dms_departments', 'dms_branches', 'dms_roles', 'dms_permission_sets',
  'dms_audit_events', 'internship_applications',
  'application_status_history', 'document_categories', 'documents', 'resources',
];

const log = (msg) => console.log(`  ${msg}`);
const ok  = (msg) => console.log(`  ✅ ${msg}`);
const warn = (msg) => console.log(`  ⚠️  ${msg}`);
const err  = (msg) => console.error(`  ❌ ${msg}`);

async function connect(config, label) {
  try {
    const conn = await mysql.createConnection(config);
    ok(`Connected to ${label}: ${config.host}/${config.database}`);
    return conn;
  } catch (e) {
    err(`Cannot connect to ${label}: ${e.message}`);
    process.exit(1);
  }
}

async function tableExists(conn, db, table) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
    [db, table]
  );
  return rows[0].cnt > 0;
}

async function migrateTable(oldConn, newConn, table) {
  // Check if table exists in old DB
  const exists = await tableExists(oldConn, OLD_DB.database, table);
  if (!exists) {
    warn(`Skipping '${table}' — not found in old DB`);
    return 0;
  }

  // Check if table exists in new DB, create if not
  const existsNew = await tableExists(newConn, NEW_DB.database, table);
  if (!existsNew) {
    // Get CREATE TABLE statement from old DB and recreate in new DB
    const [createResult] = await oldConn.query(`SHOW CREATE TABLE \`${table}\``);
    const createSQL = createResult[0]['Create Table'];
    try {
      await newConn.execute(createSQL);
      ok(`Created table '${table}' in new DB`);
    } catch (e) {
      warn(`Could not create table '${table}': ${e.message}`);
      return 0;
    }
  }

  // Get row count
  const [countResult] = await oldConn.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
  const totalRows = countResult[0].cnt;

  if (totalRows === 0) {
    log(`  '${table}': 0 rows (empty, skipped)`);
    return 0;
  }

  // Check if new table already has data (avoid duplicates on re-run)
  const [newCountResult] = await newConn.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
  const existingRows = newCountResult[0].cnt;

  if (existingRows > 0) {
    warn(`'${table}': already has ${existingRows} rows in new DB — truncating for clean migration`);
    await newConn.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    await newConn.execute(`TRUNCATE TABLE \`${table}\``);
    await newConn.execute(`SET FOREIGN_KEY_CHECKS = 1`);
  }

  // Fetch all rows in chunks
  const CHUNK_SIZE = 500;
  let offset = 0;
  let migrated = 0;

  while (offset < totalRows) {
    const [rows] = await oldConn.query(
      `SELECT * FROM \`${table}\` LIMIT ${CHUNK_SIZE} OFFSET ${offset}`
    );
    if (rows.length === 0) break;

    // Build bulk INSERT with ON DUPLICATE KEY UPDATE (idempotent)
    const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
    const placeholders = rows.map(() => `(${Object.keys(rows[0]).map(() => '?').join(', ')})`).join(', ');
    const values = rows.flatMap(row => Object.values(row));

    try {
      await newConn.query(
        `INSERT INTO \`${table}\` (${columns}) VALUES ${placeholders} ON DUPLICATE KEY UPDATE ${Object.keys(rows[0]).map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ')}`,
        values
      );
      migrated += rows.length;
    } catch (e) {
      warn(`Error inserting into '${table}' at offset ${offset}: ${e.message}`);
    }

    offset += CHUNK_SIZE;
  }

  ok(`'${table}': migrated ${migrated} / ${totalRows} rows`);
  return migrated;
}

async function main() {
  console.log('\n🔄 DEVIONIC DATABASE MIGRATION');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  FROM: ${OLD_DB.host}/${OLD_DB.database} (as ${OLD_DB.user})`);
  console.log(`  TO:   ${NEW_DB.host}/${NEW_DB.database} (as ${NEW_DB.user})`);
  console.log('════════════════════════════════════════════════════════════\n');

  const oldConn = await connect(OLD_DB, 'OLD DB');
  const newConn = await connect(NEW_DB, 'NEW DB (Hostinger)');

  // Run the full schema on new DB first (creates all tables)
  console.log('\n📦 Step 1: Applying schema to new DB...');
  const schemaPath = path.join(__dirname, 'backend', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    try {
      await newConn.execute(`SET FOREIGN_KEY_CHECKS = 0`);
      await newConn.query(schema);
      await newConn.execute(`SET FOREIGN_KEY_CHECKS = 1`);
      ok('Schema applied successfully');
    } catch (e) {
      warn(`Schema warning (may be OK if tables exist): ${e.message.slice(0, 100)}`);
    }
  } else {
    warn('schema.sql not found — will create tables from old DB structure');
  }

  // Run migrations SQL files
  const migrationsDir = path.join(__dirname, 'backend', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    console.log('\n📦 Step 2: Applying migration files...');
    const migFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const f of migFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      try {
        await newConn.query(sql);
        ok(`Applied migration: ${f}`);
      } catch (e) {
        warn(`Migration '${f}' warning: ${e.message.slice(0, 100)}`);
      }
    }
  }

  // Migrate data
  console.log('\n📦 Step 3: Migrating data table by table...');
  await newConn.execute(`SET FOREIGN_KEY_CHECKS = 0`);

  let totalMigrated = 0;
  for (const table of TABLES_IN_ORDER) {
    totalMigrated += await migrateTable(oldConn, newConn, table);
  }

  await newConn.execute(`SET FOREIGN_KEY_CHECKS = 1`);

  console.log('\n════════════════════════════════════════════════════════════');
  ok(`Migration complete! ${totalMigrated} total rows migrated.`);
  console.log('════════════════════════════════════════════════════════════\n');

  await oldConn.end();
  await newConn.end();
}

main().catch(e => {
  err(`Fatal error: ${e.message}`);
  console.error(e.stack);
  process.exit(1);
});
