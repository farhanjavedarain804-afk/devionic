const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const uuidv4 = require('../utils/uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function upsertAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const email = 'farhanjaved357@gmail.com';
  const rawPassword = 'Fur@8899';
  const role = 'admin';

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Check if user exists
  const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

  if (rows.length > 0) {
    console.log('User exists. Updating password and role...');
    const userId = rows[0].id;
    await connection.query(
      'UPDATE users SET password = ?, role = ? WHERE email = ?',
      [hashedPassword, role, email]
    );
    
    // Check/Update profile
    const [profRows] = await connection.query('SELECT id FROM profiles WHERE id = ?', [userId]);
    if (profRows.length > 0) {
      await connection.query(
        'UPDATE profiles SET full_name = ?, is_approved = ?, email = ? WHERE id = ?',
        ['Admin User', 1, email, userId]
      );
    } else {
      await connection.query(
        'INSERT INTO profiles (id, full_name, is_approved, email) VALUES (?, ?, ?, ?)',
        [userId, 'Admin User', 1, email]
      );
    }
    console.log('Admin user and profile updated successfully.');
  } else {
    console.log('User does not exist. Creating new admin...');
    const userId = uuidv4();
    await connection.query(
      'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, role]
    );
    await connection.query(
      'INSERT INTO profiles (id, full_name, is_approved, email) VALUES (?, ?, ?, ?)',
      [userId, 'Admin User', 1, email]
    );
    console.log('Admin user and profile created successfully.');
  }

  await connection.end();
}

upsertAdmin().catch(console.error);

