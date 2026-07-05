-- Devionic MySQL Schema (Fully Synchronized with Supabase)

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  department_id CHAR(36) NULL,
  branch_id CHAR(36) NULL,
  custom_permissions JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_number VARCHAR(50),
  email VARCHAR(255),
  is_approved BOOLEAN DEFAULT FALSE,
  is_rejected BOOLEAN DEFAULT FALSE,
  last_login_ip VARCHAR(50),
  last_login_dns VARCHAR(255),
  last_login_location VARCHAR(255),
  last_login_device VARCHAR(100),
  last_login_browser VARCHAR(100),
  last_login_os VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  company VARCHAR(255),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  cnic VARCHAR(20),
  position VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  join_date DATE,
  staff_type VARCHAR(50),
  salary DECIMAL(15, 2),
  bank_account VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  budget DECIMAL(15, 2),
  start_date DATETIME,
  end_date DATETIME,
  milestones JSON,
  notes TEXT,
  customer_id CHAR(36),
  invoice_id CHAR(36),
  quotation_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS invoices;
CREATE TABLE invoices (
  id CHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  verification_id VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_address TEXT,
  items JSON,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'PKR',
  status VARCHAR(20) DEFAULT 'pending',
  due_date DATETIME,
  notes TEXT,
  customer_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS quotations;
CREATE TABLE quotations (
  id CHAR(36) PRIMARY KEY,
  quotation_number VARCHAR(100) UNIQUE NOT NULL,
  verification_id VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_address TEXT,
  items JSON,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'PKR',
  status VARCHAR(20) DEFAULT 'draft',
  valid_until DATETIME,
  notes TEXT,
  customer_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS quote_requests;
CREATE TABLE quote_requests (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  country VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(100),
  budget VARCHAR(100),
  timeline VARCHAR(100),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS inquiries;
CREATE TABLE inquiries (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  is_read BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  resolved_notes TEXT,
  resolved_attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS service_inquiries;
CREATE TABLE service_inquiries (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  city VARCHAR(100),
  address TEXT,
  service_title VARCHAR(255),
  project_description TEXT NOT NULL,
  project_timeline VARCHAR(100),
  approved_budget VARCHAR(100),
  attachments JSON,
  status VARCHAR(20) DEFAULT 'pending',
  is_read BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  resolved_notes TEXT,
  resolved_attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS complaints;
CREATE TABLE complaints (
  id CHAR(36) PRIMARY KEY,
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_at DATETIME,
  resolved_notes TEXT,
  resolved_attachments JSON,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS complaint_notes;
CREATE TABLE complaint_notes (
  id CHAR(36) PRIMARY KEY,
  complaint_id CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT NOT NULL,
  attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS tickets;
CREATE TABLE tickets (
  id CHAR(36) PRIMARY KEY,
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_at DATETIME,
  resolved_notes TEXT,
  resolved_attachments JSON,
  admin_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS ticket_notes;
CREATE TABLE ticket_notes (
  id CHAR(36) PRIMARY KEY,
  ticket_id CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT NOT NULL,
  attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS inquiry_notes;
CREATE TABLE inquiry_notes (
  id CHAR(36) PRIMARY KEY,
  inquiry_id CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT NOT NULL,
  attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS quote_request_notes;
CREATE TABLE quote_request_notes (
  id CHAR(36) PRIMARY KEY,
  quote_request_id CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL,
  note TEXT NOT NULL,
  attachments JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS testimonials;
CREATE TABLE testimonials (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS financials;
CREATE TABLE financials (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference_type VARCHAR(50),
  reference_number VARCHAR(100),
  reference_id VARCHAR(255),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  transaction_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50),
  from_name VARCHAR(255),
  to_name VARCHAR(255),
  reference_number VARCHAR(100),
  reference_type VARCHAR(50),
  reference_id VARCHAR(255),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS services;
CREATE TABLE services (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  features JSON,
  code VARCHAR(50),
  minimum_charges DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
  id CHAR(36) PRIMARY KEY,
  id_code VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  type VARCHAR(100),
  description TEXT,
  requirements JSON,
  salary VARCHAR(255),
  closing_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS job_applications;
CREATE TABLE job_applications (
  id CHAR(36) PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  verification_id VARCHAR(100) UNIQUE,
  job_id CHAR(36),
  job_title VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone1 VARCHAR(50),
  phone2 VARCHAR(50),
  whatsapp VARCHAR(50),
  cnic VARCHAR(20) NOT NULL,
  bform_number VARCHAR(50),
  age INT,
  gender VARCHAR(20),
  father_husband_name VARCHAR(255),
  date_of_birth DATE,
  nationality VARCHAR(100),
  district VARCHAR(100),
  tehsil VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_address TEXT,
  permanent_address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_number VARCHAR(50),
  emergency_contact_relation VARCHAR(100),
  emergency_contact_whatsapp VARCHAR(50),
  education VARCHAR(255),
  work_experience TEXT,
  cnic_doc TEXT,
  passport_photo TEXT,
  educational_docs TEXT,
  experience_letter TEXT,
  resume_cv TEXT,
  other_docs TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  employee_id VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50),
  staff_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  status VARCHAR(50),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_staff_date (staff_id, date)
);

DROP TABLE IF EXISTS salary_slips;
CREATE TABLE salary_slips (
  id CHAR(36) PRIMARY KEY,
  verification_id VARCHAR(100) UNIQUE NOT NULL,
  staff_id CHAR(36) NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  basic_salary DECIMAL(15, 2) NOT NULL,
  allowances DECIMAL(15, 2) DEFAULT 0,
  deductions DECIMAL(15, 2) DEFAULT 0,
  net_salary DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'generated',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
  id CHAR(36) PRIMARY KEY,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS portfolio;
CREATE TABLE portfolio (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS admin_notifications;
CREATE TABLE admin_notifications (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_logs;
CREATE TABLE user_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  user_email VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  location VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS login_attempts;
CREATE TABLE login_attempts (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  action VARCHAR(50) DEFAULT 'login',
  status VARCHAR(50) DEFAULT 'failed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS visitor_sessions;
CREATE TABLE visitor_sessions (
  id CHAR(36) PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id CHAR(36),
  user_email VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(100),
  is_online BOOLEAN DEFAULT TRUE,
  pages_visited INT DEFAULT 1,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS page_views;
CREATE TABLE page_views (
  id CHAR(36) PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(100),
  duration_seconds INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS feedback_calls;
CREATE TABLE feedback_calls (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  project_reference VARCHAR(255),
  q1_rating INT DEFAULT 0,
  q2_rating INT DEFAULT 0,
  q3_rating INT DEFAULT 0,
  q4_rating INT DEFAULT 0,
  q5_rating INT DEFAULT 0,
  total_score INT DEFAULT 0,
  notes TEXT,
  called_by VARCHAR(255),
  call_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id CHAR(36) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  service VARCHAR(255),
  description TEXT,
  status ENUM('confirmed', 'pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  booking_date DATE,
  amount DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual',
  reference_number VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS number_series;
CREATE TABLE number_series (
  id CHAR(36) PRIMARY KEY,
  series_key VARCHAR(100) NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  series_year INT NOT NULL,
  padding INT NOT NULL DEFAULT 6,
  last_number INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_series_year (series_key, series_year),
  UNIQUE KEY uq_prefix_year (prefix, series_year)
);

-- Performance indexes for list/filter/search-heavy workloads
CREATE INDEX idx_profiles_created_at ON profiles (created_at);
CREATE INDEX idx_profiles_approved_rejected ON profiles (is_approved, is_rejected, created_at);
CREATE INDEX idx_customers_created_at ON customers (created_at);
CREATE INDEX idx_staff_name_active ON staff (is_active, name);
CREATE INDEX idx_staff_department_join_date ON staff (department, join_date);
CREATE INDEX idx_projects_client_email_created_at ON projects (client_email, created_at);
CREATE INDEX idx_projects_status_created_at ON projects (status, created_at);
CREATE INDEX idx_invoices_client_email_created_at ON invoices (client_email, created_at);
CREATE INDEX idx_invoices_status_created_at ON invoices (status, created_at);
CREATE INDEX idx_quotations_client_email_created_at ON quotations (client_email, created_at);
CREATE INDEX idx_quotations_status_created_at ON quotations (status, created_at);
CREATE INDEX idx_quote_requests_status_created_at ON quote_requests (status, created_at);
CREATE INDEX idx_quote_requests_email_created_at ON quote_requests (email, created_at);
CREATE INDEX idx_inquiries_status_read_created_at ON inquiries (status, is_read, created_at);
CREATE INDEX idx_inquiries_email_created_at ON inquiries (email, created_at);
CREATE INDEX idx_service_inquiries_status_read_created_at ON service_inquiries (status, is_read, created_at);
CREATE INDEX idx_service_inquiries_email_created_at ON service_inquiries (email, created_at);
CREATE INDEX idx_complaints_status_created_at ON complaints (status, created_at);
CREATE INDEX idx_complaints_tracking_id ON complaints (tracking_id);
CREATE INDEX idx_tickets_status_created_at ON tickets (status, created_at);
CREATE INDEX idx_tickets_tracking_id ON tickets (tracking_id);
CREATE INDEX idx_complaint_notes_complaint_created_at ON complaint_notes (complaint_id, created_at);
CREATE INDEX idx_ticket_notes_ticket_created_at ON ticket_notes (ticket_id, created_at);
CREATE INDEX idx_inquiry_notes_inquiry_created_at ON inquiry_notes (inquiry_id, created_at);
CREATE INDEX idx_quote_request_notes_quote_created_at ON quote_request_notes (quote_request_id, created_at);
CREATE INDEX idx_testimonials_approved_active_created_at ON testimonials (is_active, is_approved, created_at);
CREATE INDEX idx_financials_entry_date_type ON financials (entry_date, type);
CREATE INDEX idx_transactions_date_type ON transactions (transaction_date, type);
CREATE INDEX idx_transactions_display_id ON transactions (display_id);
CREATE INDEX idx_services_active_sort_order ON services (is_active, sort_order);
CREATE INDEX idx_jobs_active_created_at ON jobs (is_active, created_at);
CREATE INDEX idx_job_applications_job_status_created_at ON job_applications (job_id, status, created_at);
CREATE INDEX idx_job_applications_email_created_at ON job_applications (email, created_at);
CREATE INDEX idx_attendance_staff_date ON attendance (staff_id, date);
CREATE INDEX idx_salary_slips_staff_year_month ON salary_slips (staff_id, year, month);
CREATE INDEX idx_site_settings_key ON site_settings (`key`);
CREATE INDEX idx_admin_notifications_read_created_at ON admin_notifications (is_read, created_at);
CREATE INDEX idx_login_attempts_email_ip_action_created_at ON login_attempts (email, ip_address, action, created_at);
CREATE INDEX idx_visitor_sessions_session_id ON visitor_sessions (session_id);
CREATE INDEX idx_visitor_sessions_online_last_seen ON visitor_sessions (is_online, last_seen_at);
CREATE INDEX idx_page_views_session_created_at ON page_views (session_id, created_at);
CREATE INDEX idx_feedback_calls_created_at ON feedback_calls (created_at);
CREATE INDEX idx_bookings_status_created_at ON bookings (status, created_at);

SET FOREIGN_KEY_CHECKS = 1;
