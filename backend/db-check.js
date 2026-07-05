const db = require('./db');

async function checkAndCreateTable() {
  try {
    console.log('--- Database Check ---');
    const [tables] = await db.query("SHOW TABLES LIKE 'job_application_status_history'");
    
    if (tables.length === 0) {
      console.log('Creating table: job_application_status_history');
      await db.query(`
        CREATE TABLE job_application_status_history (
          id CHAR(36) PRIMARY KEY,
          application_id CHAR(36) NOT NULL,
          status VARCHAR(50) NOT NULL,
          note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created.');
    } else {
      console.log('✅ Table already exists.');
      // Check for updated_at column
      const [cols] = await db.query("SHOW COLUMNS FROM job_application_status_history LIKE 'updated_at'");
      if (cols.length === 0) {
        console.log('Adding missing updated_at column...');
        await db.query(`ALTER TABLE job_application_status_history ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        console.log('✅ Updated.');
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAndCreateTable();
