const db = require('./db');

async function migrate() {
  try {
    console.log("Starting DB migration for Security Logs...");

    // 1. Create login_attempts
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50),
        action VARCHAR(50) DEFAULT 'login',
        status VARCHAR(50) DEFAULT 'failed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("login_attempts table ready.");

    // 2. Create user_logs (Replacing admin_logs)
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_logs (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        user_email VARCHAR(255),
        role VARCHAR(50),
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        location VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("user_logs table ready.");

    // 3. Update visitor_sessions
    try {
      await db.query(`ALTER TABLE visitor_sessions ADD COLUMN user_id CHAR(36)`);
      console.log("Added user_id to visitor_sessions");
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.error(e.message);
    }
    try {
      await db.query(`ALTER TABLE visitor_sessions ADD COLUMN user_email VARCHAR(255)`);
      console.log("Added user_email to visitor_sessions");
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.error(e.message);
    }

    // 4. Seed default settings for rate limiting
    try {
      await db.query(`INSERT INTO site_settings (\`id\`, \`key\`, \`value\`) VALUES (UUID(), 'rate_limit_attempts', '5')`);
    } catch (e) {
      if (!e.message.includes("Duplicate entry")) console.error(e.message);
    }
    try {
      await db.query(`INSERT INTO site_settings (\`id\`, \`key\`, \`value\`) VALUES (UUID(), 'rate_limit_window', '15')`);
    } catch (e) {
      if (!e.message.includes("Duplicate entry")) console.error(e.message);
    }
    console.log("Site settings ready.");

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
