const db = require('../db');

async function createTables() {
  try {
    console.log('Creating inquiry_notes table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiry_notes (
        id CHAR(36) PRIMARY KEY,
        inquiry_id CHAR(36) NOT NULL,
        status VARCHAR(20) NOT NULL,
        note TEXT NOT NULL,
        attachments JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating quote_request_notes table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS quote_request_notes (
        id CHAR(36) PRIMARY KEY,
        quote_request_id CHAR(36) NOT NULL,
        status VARCHAR(20) NOT NULL,
        note TEXT NOT NULL,
        attachments JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
}

createTables();
