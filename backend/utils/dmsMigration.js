const uuidv4 = require('./uuid');

const ALL_MODULES = [
  'overview', 'users', 'branches', 'departments', 'services', 'jobs', 'applications', 'testimonials',
  'general-inquiries', 'quote-requests', 'complaints', 'customers', 'invoices',
  'quotations', 'bookings', 'projects', 'staff', 'attendance', 'attendance-report',
  'payroll', 'transactions', 'financials', 'feedback-calls', 'audit',
  'verification-tracking', 'analytics', 'admin-logs', 'notifications',
  'documents-organizer', 'settings', 'profile'
];

const DEFAULT_DEPARTMENTS = [
  {
    name: 'Executive Board (HQ)',
    code: 'EXEC',
    description: 'Full administrative control of the DMS — Head Office',
    modules: ALL_MODULES
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Manages payroll, attendance, staff profiles, jobs and applications',
    modules: ['overview', 'jobs', 'applications', 'staff', 'attendance', 'attendance-report', 'payroll', 'documents-organizer', 'profile']
  },
  {
    name: 'Finance & Accounts',
    code: 'FIN',
    description: 'Manages billing, invoices, quotations, transactions and financials',
    modules: ['overview', 'customers', 'invoices', 'quotations', 'transactions', 'financials', 'profile']
  },
  {
    name: 'Operations & Inquiries',
    code: 'OPS',
    description: 'Manages support tickets, complaints, bookings, projects, services and feedback',
    modules: ['overview', 'services', 'general-inquiries', 'quote-requests', 'complaints', 'bookings', 'projects', 'feedback-calls', 'profile']
  }
];

// Adds optional OAuth/social columns to users & profiles so Google Sign-In works.
// Idempotent — mirrors the SHOW COLUMNS + conditional ALTER pattern used above.
async function ensureGoogleColumns(db) {
  try {
    // users.google_id  + users.avatar_url
    const [userCols] = await db.query('SHOW COLUMNS FROM users');
    const userFieldNames = userCols.map((c) => c.Field);
    if (!userFieldNames.includes('google_id')) {
      await db.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(128) NULL UNIQUE AFTER role');
    }
    if (!userFieldNames.includes('avatar_url')) {
      await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512) NULL AFTER google_id');
    }
    // profiles.avatar_url + profiles.provider
    const [profileCols] = await db.query('SHOW COLUMNS FROM profiles');
    const profileFieldNames = profileCols.map((c) => c.Field);
    if (!profileFieldNames.includes('avatar_url')) {
      await db.query('ALTER TABLE profiles ADD COLUMN avatar_url VARCHAR(512) NULL AFTER contact_number');
    }
    if (!profileFieldNames.includes('provider')) {
      await db.query("ALTER TABLE profiles ADD COLUMN provider VARCHAR(32) NULL DEFAULT 'password' AFTER avatar_url");
    }
  } catch (err) {
    console.error('⚠️ [DMS] Google columns migration warning (non-fatal):', err.message);
  }
}

async function runDmsMigrations(db) {
  try {
    // 0. Ensure Google OAuth columns exist before any auth flow runs
    await ensureGoogleColumns(db);

    // 1. Create departments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        modules JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.5 Create branches table
    await db.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL UNIQUE,
        location VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.6 Create trusted_devices table for 2FA skip
    await db.query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id          CHAR(36)     PRIMARY KEY,
        user_id     CHAR(36)     NOT NULL,
        device_id   VARCHAR(255) NOT NULL,
        user_agent  TEXT,
        ip_address  VARCHAR(64),
        trusted     TINYINT(1)   DEFAULT 1,
        expires_at  DATETIME     NOT NULL,
        last_used   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_device (user_id, device_id),
        INDEX idx_user_id (user_id),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.7 Create resources table (Resource Center module)
    await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id            CHAR(36)     PRIMARY KEY,
        resource_code VARCHAR(100) NOT NULL,
        title         VARCHAR(255) NOT NULL,
        description   TEXT,
        file_url      TEXT,
        file_name     VARCHAR(255),
        file_type     VARCHAR(20),
        file_size     BIGINT,
        is_published  TINYINT(1)   DEFAULT 1,
        sort_order    INT          DEFAULT 0,
        created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.8 Create internships table
    await db.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id            CHAR(36)     PRIMARY KEY,
        id_code       VARCHAR(50),
        title         VARCHAR(255) NOT NULL,
        department    VARCHAR(255),
        location      VARCHAR(255),
        type          VARCHAR(100) DEFAULT 'Internship',
        description   TEXT,
        requirements  JSON,
        duration      VARCHAR(255),
        stipend       VARCHAR(255),
        is_active     TINYINT(1)   DEFAULT 1,
        created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.9 Create internship_applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS internship_applications (
        id                              CHAR(36)     PRIMARY KEY,
        application_number              VARCHAR(50)  UNIQUE NOT NULL,
        verification_id                 VARCHAR(100) UNIQUE,
        internship_id                   CHAR(36),
        internship_title                VARCHAR(255) NOT NULL,
        full_name                       VARCHAR(255) NOT NULL,
        email                           VARCHAR(255) NOT NULL,
        phone1                          VARCHAR(50),
        phone2                          VARCHAR(50),
        whatsapp                        VARCHAR(50),
        cnic                            VARCHAR(20)  NOT NULL,
        age                             INT,
        father_husband_name             VARCHAR(255),
        date_of_birth                   DATE,
        nationality                     VARCHAR(100),
        city                            VARCHAR(100),
        tehsil                          VARCHAR(100),
        district                        VARCHAR(100),
        province                        VARCHAR(100),
        postal_address                  TEXT,
        permanent_address               TEXT,
        emergency_contact_name          VARCHAR(255),
        emergency_contact_number        VARCHAR(50),
        emergency_contact_relation      VARCHAR(100),
        emergency_contact_whatsapp      VARCHAR(50),
        education                       VARCHAR(255),
        work_experience                 TEXT,
        cnic_doc                        TEXT,
        resume_cv                       TEXT,
        experience_letter               TEXT,
        educational_docs                TEXT,
        other_docs                      TEXT,
        passport_photo                  TEXT,
        status                          VARCHAR(50)  DEFAULT 'pending',
        admin_notes                     TEXT,
        created_at                      DATETIME     DEFAULT CURRENT_TIMESTAMP,
        updated_at                      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 1.10 Create internship_application_status_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS internship_application_status_history (
        id              CHAR(36)   PRIMARY KEY,
        application_id  CHAR(36)   NOT NULL,
        status          VARCHAR(50) NOT NULL,
        note            TEXT,
        created_at      DATETIME   DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 2. Add department_id and branch_id to users if missing
    const [userCols] = await db.query('SHOW COLUMNS FROM users');
    const hasDeptId = userCols.some(c => c.Field === 'department_id');
    const hasCustomPerms = userCols.some(c => c.Field === 'custom_permissions');
    const hasBranchId = userCols.some(c => c.Field === 'branch_id');

    if (!hasDeptId) {
      await db.query('ALTER TABLE users ADD COLUMN department_id CHAR(36) NULL AFTER role');
    }
    if (!hasCustomPerms) {
      await db.query('ALTER TABLE users ADD COLUMN custom_permissions JSON NULL AFTER department_id');
    }
    if (!hasBranchId) {
      await db.query('ALTER TABLE users ADD COLUMN branch_id CHAR(36) NULL AFTER department_id');
    }

    // 3. Seed default departments if table is empty
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM departments');
    if (parseInt(count, 10) === 0) {
      for (const dept of DEFAULT_DEPARTMENTS) {
        await db.query(
          'INSERT INTO departments (id, name, code, description, modules) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), dept.name, dept.code, dept.description, JSON.stringify(dept.modules)]
        );
      }
      console.log('✅ [DMS] Default departments seeded');
    }

    console.log('✅ [DMS] Migrations complete');
  } catch (err) {
    console.error('⚠️ [DMS] Migration warning (non-fatal):', err.message);
  }
}

module.exports = { runDmsMigrations, ensureGoogleColumns, ALL_MODULES };
