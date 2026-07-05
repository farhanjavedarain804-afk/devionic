require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 30000
  });

  console.log('Connected to:', process.env.DB_HOST, '/', process.env.DB_NAME);

  try {
    // Drop and recreate
    await conn.query('DROP TABLE IF EXISTS quote_submissions');
    await conn.query(`
      CREATE TABLE quote_submissions (
        id char(36) NOT NULL,
        display_id varchar(20) NOT NULL,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(50) DEFAULT NULL,
        company_name varchar(255) DEFAULT NULL,
        country varchar(100) DEFAULT NULL,
        service varchar(255) NOT NULL,
        budget varchar(100) DEFAULT NULL,
        timeline varchar(100) DEFAULT NULL,
        description text,
        status varchar(20) DEFAULT 'pending',
        is_read tinyint(1) DEFAULT 0,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('SUCCESS: quote_submissions table created!');

    const [cols] = await conn.query('SHOW COLUMNS FROM quote_submissions');
    console.log('Columns:');
    cols.forEach(c => console.log(' -', c.Field, ':', c.Type));

    // Test insert
    const uuidv4 = require('../utils/uuid');
    const testId = uuidv4();
    await conn.query(
      'INSERT INTO quote_submissions (id, display_id, name, email, phone, company_name, country, service, budget, timeline, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testId, 'QUO-TEST01', 'Test User', 'test@example.com', '1234567890', 'Test Corp', 'Pakistan', 'Web Development', '$5000', '1 month', 'Test submission', 'pending']
    );
    console.log('TEST INSERT: Success');

    const [rows] = await conn.query('SELECT * FROM quote_submissions WHERE id = ?', [testId]);
    console.log('VERIFIED ROW:', rows[0]);

    // Clean up test row
    await conn.query('DELETE FROM quote_submissions WHERE id = ?', [testId]);
    console.log('Table is ready and fully functional!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
    process.exit(0);
  }
})();
