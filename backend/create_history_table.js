const db = require('./db');

async function createTable() {
  try {
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS job_application_status_history (
        id CHAR(36) PRIMARY KEY,
        application_id CHAR(36) NOT NULL,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      )
    `;
    await db.query(tableQuery);
    console.log('✅ job_application_status_history table created/already exists.');
    
    // Check if job_applications exists (it should, but just in case)
    const [rows] = await db.query('SHOW TABLES LIKE "job_applications"');
    if (rows.length > 0) {
      // Add foreign key constraint if it doesn't exist
      try {
        await db.query(`
          ALTER TABLE job_application_status_history
          ADD CONSTRAINT fk_job_application_status_history_application
          FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint added.');
      } catch (e) {
        if (e.code === 'ER_CANNOT_ADD_FOREIGN_KEY_CONSTRAINT_OR_KEY_CAN_NOT_BE_DROPPED') {
          console.log('ℹ️ Foreign key might already exist or there is a type mismatch.');
        } else if(e.errno === 1061 || e.errno === 121) {
             console.log('ℹ️ Foreign key constraint already exists.');
        } else {
             console.log('⚠️ Error adding foreign key:', e.message);
        }
      }
    } else {
        console.log('⚠️ job_applications table NOT FOUND!');
    }
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    process.exit();
  }
}

createTable();
