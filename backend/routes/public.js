const express = require('express');
const router = express.Router();
const db = require('../db');
const uuidv4 = require('../utils/uuid');
const { notifyAdmin } = require('../utils/emailService');
const { generateSeriesNumber } = require('../services/numberSeries');
const { enqueueTask } = require('../utils/taskQueue');

// Fetch active services
router.get('/services', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, title, description, icon, features, code, minimum_charges, sort_order FROM services WHERE is_active = 1 ORDER BY sort_order'
    );
    const parsed = rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch published resources (Resource Center)
router.get('/resources', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, resource_code, title, description, file_url, file_name, file_type, file_size, sort_order, created_at
       FROM resources WHERE is_published = 1 ORDER BY sort_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    if (err.message.includes("doesn't exist")) return res.json([]);
    res.status(500).json({ message: err.message });
  }
});

// Submit quote request
router.post('/quotes', async (req, res) => {
  const { name, email, phone, company_name, country, budget, timeline, description, service } = req.body;
  const id = uuidv4();
  const display_id = await generateSeriesNumber('quotation');
  
  try {
    const query = `
      INSERT INTO quote_requests (
        id, display_id, name, email, phone, 
        company_name, country, budget, timeline, 
        description, service, status, is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
    `;
    
    await db.query(query, [
      id, display_id, name, email, phone, 
      company_name, country, budget, timeline, 
      description, service
    ]);
    
    res.status(201).json({ id, display_id, message: 'Quote request submitted successfully' });

    // Notify Admin
    enqueueTask('notify-admin-quote', () => notifyAdmin({
      subject: `New Quote Request: ${display_id}`,
      body: `A new quote request has been submitted by ${name} (${email}).`,
      metadata: {
        ID: display_id,
        Name: name,
        Email: email,
        Phone: phone,
        Company: company_name,
        Service: service,
        Budget: budget,
        Timeline: timeline,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    console.error('[PUBLIC-QUOTE] Submission failed:', err);
    res.status(500).json({ message: 'Failed to process request: ' + err.message });
  }
});

// Fetch active jobs
router.get('/jobs', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_code, title, department, location, type, description, requirements, salary, closing_date, is_active, created_at FROM jobs WHERE is_active = 1 ORDER BY created_at DESC'
    );
    const parsed = rows.map(r => ({
      ...r,
      requirements: typeof r.requirements === 'string' ? JSON.parse(r.requirements) : (r.requirements || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch single job
router.get('/jobs/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_code, title, department, location, type, description, requirements, salary, closing_date, is_active, created_at FROM jobs WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    const job = {
      ...rows[0],
      requirements: typeof rows[0].requirements === 'string' ? JSON.parse(rows[0].requirements) : (rows[0].requirements || [])
    };
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit job application
router.post('/jobs/apply', async (req, res) => {
  const { 
    job_id, full_name, father_husband_name, cnic, date_of_birth, age,
    city, tehsil, district, province, nationality, postal_address, permanent_address,
    email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
    emergency_contact_name, emergency_contact_relation, education, work_experience,
    cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
    job_title
  } = req.body;
  
  const id = uuidv4();
  const application_number = await generateSeriesNumber('application');
  const verification_id = await generateSeriesNumber('verification');
  
  try {
    await db.query(
      `INSERT INTO job_applications (
        id, job_id, full_name, father_husband_name, cnic, date_of_birth, age,
        city, tehsil, district, province, nationality, postal_address, permanent_address,
        email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
        emergency_contact_name, emergency_contact_relation, education, work_experience,
        cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
        application_number, verification_id, status, job_title
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, job_id, full_name, father_husband_name, cnic, date_of_birth, age,
        city, tehsil, district, province, nationality, postal_address, permanent_address,
        email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
        emergency_contact_name, emergency_contact_relation, education, work_experience,
        cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
        application_number, verification_id, 'pending', job_title || 'General Application'
      ]
    );
    res.status(201).json({ id, application_number, verification_id, message: 'Application submitted' });

    // Notify Admin
    enqueueTask('notify-admin-application', () => notifyAdmin({
      subject: `New Job Application: ${application_number}`,
      body: `A new application has been received for the position of ${job_title || 'General Application'}.`,
      metadata: {
        AppNumber: application_number,
        Name: full_name,
        Email: email,
        Phone: phone1,
        Job: job_title,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── INTERNSHIPS ────────────────────────────────────────────────────────────

// Fetch active internships
router.get('/internships', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_code, title, department, location, type, description, requirements, duration, stipend, is_active, created_at FROM internships WHERE is_active = 1 ORDER BY created_at DESC'
    );
    const parsed = rows.map(r => ({
      ...r,
      requirements: typeof r.requirements === 'string' ? JSON.parse(r.requirements) : (r.requirements || [])
    }));
    res.json(parsed);
  } catch (err) {
    if (err.message.includes("doesn't exist")) return res.json([]);
    res.status(500).json({ message: err.message });
  }
});

// Fetch single internship
router.get('/internships/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, id_code, title, department, location, type, description, requirements, duration, stipend, is_active, created_at FROM internships WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Internship not found' });
    const internship = {
      ...rows[0],
      requirements: typeof rows[0].requirements === 'string' ? JSON.parse(rows[0].requirements) : (rows[0].requirements || [])
    };
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit internship application
router.post('/internships/apply', async (req, res) => {
  const {
    internship_id, full_name, father_husband_name, cnic, date_of_birth, age,
    city, tehsil, district, province, nationality, postal_address, permanent_address,
    email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
    emergency_contact_name, emergency_contact_relation, education, work_experience,
    cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
    internship_title
  } = req.body;

  const id = uuidv4();
  const application_number = await generateSeriesNumber('application');
  const verification_id = await generateSeriesNumber('verification');

  try {
    await db.query(
      `INSERT INTO internship_applications (
        id, internship_id, full_name, father_husband_name, cnic, date_of_birth, age,
        city, tehsil, district, province, nationality, postal_address, permanent_address,
        email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
        emergency_contact_name, emergency_contact_relation, education, work_experience,
        cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
        application_number, verification_id, status, internship_title
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, internship_id, full_name, father_husband_name, cnic, date_of_birth, age,
        city, tehsil, district, province, nationality, postal_address, permanent_address,
        email, phone1, phone2, whatsapp, emergency_contact_number, emergency_contact_whatsapp,
        emergency_contact_name, emergency_contact_relation, education, work_experience,
        cnic_doc, resume_cv, experience_letter, educational_docs, other_docs, passport_photo,
        application_number, verification_id, 'pending', internship_title || 'General Internship Application'
      ]
    );
    res.status(201).json({ id, application_number, verification_id, message: 'Application submitted' });

    // Notify Admin
    enqueueTask('notify-admin-application', () => notifyAdmin({
      subject: `New Internship Application: ${application_number}`,
      body: `A new internship application has been received for the position of ${internship_title || 'General Internship Application'}.`,
      metadata: {
        AppNumber: application_number,
        Name: full_name,
        Email: email,
        Phone: phone1,
        Internship: internship_title,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, display_id, name, email, role, company, message, rating, created_at FROM testimonials WHERE is_active = 1 AND is_approved = 1 ORDER BY created_at DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit testimonial
router.post('/testimonials', async (req, res) => {
  const { name, role, company, message, rating } = req.body;
  const id = uuidv4();
  const display_id = await generateSeriesNumber('testimonial');
  try {
    await db.query(
      'INSERT INTO testimonials (id, display_id, name, role, company, message, rating, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, name, role, company, message, rating || 5, 0, 1] // Pending approval
    );
    res.status(201).json({ id, message: 'Testimonial submitted for approval' });

    // Notify Admin
    enqueueTask('notify-admin-testimonial', () => notifyAdmin({
      subject: `New Testimonial: ${display_id}`,
      body: `A new testimonial has been submitted by ${name} for approval.`,
      metadata: {
        ID: display_id,
        Name: name,
        Role: role,
        Company: company,
        Rating: `${rating || 5}/5`,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit inquiry (Contact Form)
router.post('/inquiries', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const id = uuidv4();
  const display_id = await generateSeriesNumber('inquiry');
  try {
    await db.query(
      'INSERT INTO inquiries (id, display_id, name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, name, email, phone, subject, message, 'pending']
    );
    res.status(201).json({ id, display_id, message: 'Inquiry submitted' });

    // Notify Admin
    enqueueTask('notify-admin-inquiry', () => notifyAdmin({
      subject: `New Inquiry: ${display_id}`,
      body: `A contact form inquiry has been received from ${name}.`,
      metadata: {
        ID: display_id,
        Name: name,
        Email: email,
        Subject: subject,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit complaint
router.post('/complaints', async (req, res) => {
  const { name, email, phone, subject, description } = req.body;
  const id = uuidv4();
  const tracking_id = await generateSeriesNumber('complaint');
  try {
    await db.query(
      'INSERT INTO complaints (id, tracking_id, name, email, phone, subject, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tracking_id, name, email, phone, subject, description, 'pending']
    );
    res.status(201).json({ id, tracking_id, message: 'Complaint submitted' });

    // Notify Admin
    enqueueTask('notify-admin-complaint', () => notifyAdmin({
      subject: `New Complaint: ${tracking_id}`,
      body: `A formal complaint has been filed by ${name}.`,
      metadata: {
        TrackingID: tracking_id,
        Name: name,
        Email: email,
        Subject: subject,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    console.error('Complaint submission error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Submit ticket
router.post('/tickets', async (req, res) => {
  const { name, email, phone, subject, description } = req.body;
  const id = uuidv4();
  const tracking_id = await generateSeriesNumber('ticket');
  try {
    await db.query(
      'INSERT INTO tickets (id, tracking_id, name, email, phone, subject, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tracking_id, name, email, phone, subject, description, 'pending']
    );
    res.status(201).json({ id, tracking_id, message: 'Ticket submitted' });

    // Notify Admin
    enqueueTask('notify-admin-ticket', () => notifyAdmin({
      subject: `New Ticket: ${tracking_id}`,
      body: `A support ticket has been opened by ${name}.`,
      metadata: {
        TrackingID: tracking_id,
        Name: name,
        Email: email,
        Subject: subject,
        Time: new Date().toLocaleString()
      }
    }));
  } catch (err) {
    console.error('Ticket submission error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Track complaint by tracking ID
router.get('/complaints/track/:trackingId', async (req, res) => {
  const trackingId = String(req.params.trackingId || '').trim().toUpperCase();

  if (!trackingId) {
    return res.status(400).json({ message: 'Tracking ID is required' });
  }

  try {
    const [rows] = await db.query('SELECT id, tracking_id, name, email, phone, subject, description, status, resolved_at, resolved_notes, created_at FROM complaints WHERE tracking_id = ? LIMIT 1', [trackingId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track ticket by tracking ID
router.get('/tickets/track/:trackingId', async (req, res) => {
  const trackingId = String(req.params.trackingId || '').trim().toUpperCase();

  if (!trackingId) {
    return res.status(400).json({ message: 'Tracking ID is required' });
  }

  try {
    const [rows] = await db.query('SELECT id, tracking_id, name, email, phone, subject, description, status, resolved_at, resolved_notes, created_at FROM tickets WHERE tracking_id = ? LIMIT 1', [trackingId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

