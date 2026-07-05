const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixServices() {
  console.log('DB_HOST:', process.env.DB_HOST);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Connected to MySQL. Fetching services from Supabase...');
  const { data, error } = await supabase.from('services').select('*');
  if (error) {
    console.error('Supabase Error:', error.message);
    process.exit(1);
  }

  console.log(`Found ${data.length} services from Supabase.`);
  
  for (const row of data) {
    row.is_active = 1; // Force active
    for (const key in row) {
        if (typeof row[key] === 'object' && row[key] !== null) row[key] = JSON.stringify(row[key]);
        if (typeof row[key] === 'boolean') row[key] = row[key] ? 1 : 0;
    }
    const keys = Object.keys(row);
    const backtickedKeys = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(row);
    
    try {
      await connection.query(`REPLACE INTO \`services\` (${backtickedKeys}) VALUES (${placeholders})`, values);
      console.log(`Upserted service: ${row.title}`);
    } catch (dbErr) {
      console.error(`Error upserting ${row.title}:`, dbErr.message);
    }
  }

  console.log('Services fixed!');
  await connection.end();
}

fixServices().catch(err => {
  console.error('Fatal Error:', err.message);
  process.exit(1);
});
