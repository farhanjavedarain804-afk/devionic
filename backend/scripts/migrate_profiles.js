const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Adding last_login columns to profiles table...');
    
    await connection.query(`
      ALTER TABLE profiles 
      ADD COLUMN last_login_ip VARCHAR(50) DEFAULT NULL,
      ADD COLUMN last_login_dns VARCHAR(255) DEFAULT NULL,
      ADD COLUMN last_login_location VARCHAR(255) DEFAULT NULL,
      ADD COLUMN last_login_device VARCHAR(255) DEFAULT NULL,
      ADD COLUMN last_login_browser VARCHAR(255) DEFAULT NULL,
      ADD COLUMN last_login_os VARCHAR(255) DEFAULT NULL
    `);

    console.log('Migration successful!');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist. Skipping.');
    } else {
      console.error('Migration failed:', err.message);
    }
  } finally {
    await connection.end();
  }
}

migrate();
