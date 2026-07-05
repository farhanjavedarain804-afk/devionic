const db = require('./db');

async function run() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id CHAR(36) PRIMARY KEY,
        tracking_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        resolved_at DATETIME,
        resolved_notes TEXT,
        resolved_attachments JSON,
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ticket_notes (
        id CHAR(36) PRIMARY KEY,
        ticket_id CHAR(36) NOT NULL,
        status VARCHAR(20) NOT NULL,
        note TEXT NOT NULL,
        attachments JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
