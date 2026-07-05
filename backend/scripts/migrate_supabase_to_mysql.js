const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
const path = require('path');
// Load backend .env for MySQL
require('dotenv').config({ path: path.join(__dirname, '../.env') });
// Load root .env for Supabase
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const uuidv4 = require('../utils/uuid');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yjrshdlxucpuobokngoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  console.error('Error: Supabase Key not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Connected to MySQL');

  const tables = [
    'profiles',
    'services',
    'customers',
    'staff',
    'jobs',
    'portfolio',
    'testimonials',
    'site_settings',
    'inquiries',
    'quote_requests',
    'service_inquiries',
    'complaints',
    'complaint_notes',
    'attendance',
    'invoices',
    'quotations',
    'projects',
    'financials',
    'transactions',
    'salary_slips',
    'job_applications',
    'admin_notifications',
    'admin_logs'
  ];

  for (const table of tables) {
    try {
      console.log(`Migrating table: ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`Error fetching ${table} from Supabase:`, error.message);
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`No data found in ${table}, skipping.`);
        continue;
      }

      console.log(`Found ${data.length} records in ${table}.`);

      for (const row of data) {
        // Handle JSON fields
        for (const key in row) {
          if (typeof row[key] === 'object' && row[key] !== null) {
            row[key] = JSON.stringify(row[key]);
          }
        }

        // Handle boolean fields for MySQL (tinyint)
        for (const key in row) {
          if (typeof row[key] === 'boolean') {
            row[key] = row[key] ? 1 : 0;
          }
        }

        try {
          const keys = Object.keys(row);
          const backtickedKeys = keys.map(k => `\`${k}\``).join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          const values = Object.values(row);

          await connection.query(
            `INSERT IGNORE INTO \`${table}\` (${backtickedKeys}) VALUES (${placeholders})`,
            values
          );
        } catch (insertErr) {
          console.error(`Error inserting into ${table}:`, insertErr.message);
        }
      }
      console.log(`Finished migrating ${table}.`);
    } catch (err) {
      console.error(`Error migrating ${table}:`, err.message);
    }
  }

  await connection.end();
  console.log('Migration complete!');
}

migrate().catch(console.error);

