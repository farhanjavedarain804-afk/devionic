// Quick DB connection test script
// Run: node test-connection.js

require('dotenv').config();
const mysql = require('mysql2');

console.log('\n🔍 Testing MySQL connection...');
console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   DB  : ${process.env.DB_NAME}\n`);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection FAILED!');
    console.error(`   Code   : ${err.code}`);
    console.error(`   Message: ${err.message}`);
    if (err.code === 'ETIMEDOUT') {
      console.error('\n📌 Your IP is not whitelisted in cPanel Remote MySQL.');
      console.error('   Add IP 59.103.59.3 to cPanel → Remote MySQL → Access Hosts');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n📌 Wrong username or password in backend/.env');
    }
    connection.destroy();
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESSFUL! Database is reachable.\n');
    connection.query('SELECT COUNT(*) as user_count FROM users', (err2, rows) => {
      if (!err2 && rows) {
        console.log(`   Users in DB: ${rows[0].user_count}`);
      }
      connection.end();
      process.exit(0);
    });
  }
});
