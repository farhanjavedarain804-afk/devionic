const db = require('../db');

async function migrate() {
  console.log('🚀 Starting DMS database migrations...');

  try {
    // 1. Create departments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        modules JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created departments table (or it already exists)');

    // 2. Add columns to users table
    // Check if department_id already exists in users table
    const [columns] = await db.query('SHOW COLUMNS FROM users');
    const hasDeptId = columns.some(c => c.Field === 'department_id');
    const hasPermissions = columns.some(c => c.Field === 'custom_permissions');

    if (!hasDeptId) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN department_id CHAR(36) NULL AFTER role,
        ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      `);
      console.log('✅ Added department_id column to users table');
    } else {
      console.log('ℹ️ department_id column already exists in users table');
    }

    if (!hasPermissions) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN custom_permissions JSON NULL AFTER department_id
      `);
      console.log('✅ Added custom_permissions column to users table');
    } else {
      console.log('ℹ️ custom_permissions column already exists in users table');
    }

    // 3. Insert default departments if table is empty
    const [existingDepts] = await db.query('SELECT COUNT(*) as count FROM departments');
    if (existingDepts[0].count === 0) {
      const uuidv4 = require('../utils/uuid');
      const defaultDepartments = [
        {
          id: uuidv4(),
          name: 'Executive Board (HQ)',
          code: 'EXEC',
          description: 'Full administrative control of the DMS',
          modules: JSON.stringify(['overview', 'users', 'services', 'jobs', 'applications', 'testimonials', 'general-inquiries', 'quote-requests', 'complaints', 'customers', 'invoices', 'quotations', 'bookings', 'projects', 'staff', 'attendance', 'attendance-report', 'payroll', 'transactions', 'financials', 'feedback-calls', 'audit', 'verification-tracking', 'analytics', 'admin-logs', 'notifications', 'documents-organizer', 'settings', 'profile'])
        },
        {
          id: uuidv4(),
          name: 'Human Resources',
          code: 'HR',
          description: 'Manages payroll, attendance, staff profiles, and jobs/applications',
          modules: JSON.stringify(['overview', 'jobs', 'applications', 'staff', 'attendance', 'attendance-report', 'payroll', 'documents-organizer', 'profile'])
        },
        {
          id: uuidv4(),
          name: 'Finance & Accounts',
          code: 'FIN',
          description: 'Manages billing, invoices, quotations, transactions, and financials',
          modules: JSON.stringify(['overview', 'customers', 'invoices', 'quotations', 'transactions', 'financials', 'profile'])
        },
        {
          id: uuidv4(),
          name: 'Operations & Inquiries',
          code: 'OPS',
          description: 'Manages support tickets, complaints, bookings, projects, services, and feedback',
          modules: JSON.stringify(['overview', 'services', 'general-inquiries', 'quote-requests', 'complaints', 'bookings', 'projects', 'feedback-calls', 'profile'])
        }
      ];

      for (const dept of defaultDepartments) {
        await db.query(
          'INSERT INTO departments (id, name, code, description, modules) VALUES (?, ?, ?, ?, ?)',
          [dept.id, dept.name, dept.code, dept.description, dept.modules]
        );
      }
      console.log('✅ Inserted default departments');
    }

    console.log('🎉 DMS migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
