const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');
const uuidv4 = require('../../utils/uuid');

// --- SERVICES ---
router.get('/services', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, description, icon, features, minimum_charges, code, is_active, sort_order, created_at, updated_at FROM services ORDER BY sort_order');
    // Parse features if stored as JSON string
    const parsed = rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/services', verifyToken, isAdmin, async (req, res) => {
  const { title, description, icon, features, minimum_charges, code } = req.body;
  const id = uuidv4();
  const serviceCode = code || `SRV-${Date.now().toString().slice(-4)}`;
  try {
    await db.query(
      'INSERT INTO services (id, title, description, icon, features, minimum_charges, code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, icon, JSON.stringify(features || []), minimum_charges || 0, serviceCode]
    );
    res.status(201).json({ id, message: 'Service added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/services/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, description, icon, features, minimum_charges, code, is_active } = req.body;
  try {
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (icon !== undefined) { fields.push('icon = ?'); params.push(icon); }
    if (features !== undefined) { fields.push('features = ?'); params.push(JSON.stringify(features)); }
    if (minimum_charges !== undefined) { fields.push('minimum_charges = ?'); params.push(minimum_charges); }
    if (code !== undefined) { fields.push('code = ?'); params.push(code); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }
    
    if (fields.length === 0) return res.json({ message: 'No changes' });
    
    params.push(req.params.id);
    await db.query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/services/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- JOBS ---
router.get('/jobs', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, id_code, title, department, location, type, description, requirements, salary, closing_date, is_active, created_at, updated_at FROM jobs ORDER BY created_at DESC');
    const parsed = rows.map(r => ({
      ...r,
      requirements: typeof r.requirements === 'string' ? JSON.parse(r.requirements) : (r.requirements || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/jobs', verifyToken, isAdmin, async (req, res) => {
  const { title, department, location, type, description, requirements, salary, closing_date, is_active } = req.body;
  const id = uuidv4();
  try {
    await db.query(
      'INSERT INTO jobs (id, title, department, location, type, description, requirements, salary, closing_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, department, location, type, description, JSON.stringify(requirements || []), salary, closing_date, is_active ?? true]
    );
    res.status(201).json({ id, message: 'Job added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/jobs/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, department, location, type, description, requirements, salary, closing_date, is_active } = req.body;
  try {
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (department !== undefined) { fields.push('department = ?'); params.push(department); }
    if (location !== undefined) { fields.push('location = ?'); params.push(location); }
    if (type !== undefined) { fields.push('type = ?'); params.push(type); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (requirements !== undefined) { fields.push('requirements = ?'); params.push(JSON.stringify(requirements)); }
    if (salary !== undefined) { fields.push('salary = ?'); params.push(salary); }
    if (closing_date !== undefined) { fields.push('closing_date = ?'); params.push(closing_date); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }
    
    if (fields.length === 0) return res.json({ message: 'No changes' });
    
    params.push(req.params.id);
    await db.query(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/jobs/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INTERNSHIPS ---
router.get('/internships', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, id_code, title, department, location, type, description, requirements, duration, stipend, is_active, created_at, updated_at FROM internships ORDER BY created_at DESC');
    const parsed = rows.map(r => ({
      ...r,
      requirements: typeof r.requirements === 'string' ? JSON.parse(r.requirements) : (r.requirements || [])
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/internships', verifyToken, isAdmin, async (req, res) => {
  const { title, department, location, type, description, requirements, duration, stipend, is_active } = req.body;
  const id = uuidv4();
  try {
    await db.query(
      'INSERT INTO internships (id, title, department, location, type, description, requirements, duration, stipend, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, department, location, type || 'Internship', description, JSON.stringify(requirements || []), duration, stipend, is_active ?? true]
    );
    res.status(201).json({ id, message: 'Internship added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/internships/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, department, location, type, description, requirements, duration, stipend, is_active } = req.body;
  try {
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (department !== undefined) { fields.push('department = ?'); params.push(department); }
    if (location !== undefined) { fields.push('location = ?'); params.push(location); }
    if (type !== undefined) { fields.push('type = ?'); params.push(type); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (requirements !== undefined) { fields.push('requirements = ?'); params.push(JSON.stringify(requirements)); }
    if (duration !== undefined) { fields.push('duration = ?'); params.push(duration); }
    if (stipend !== undefined) { fields.push('stipend = ?'); params.push(stipend); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length === 0) return res.json({ message: 'No changes' });

    params.push(req.params.id);
    await db.query(`UPDATE internships SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/internships/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM internships WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- TESTIMONIALS ---
router.get('/testimonials', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, display_id, name, role, company, message, rating, is_approved, is_active, created_at, updated_at FROM testimonials ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/testimonials', verifyToken, isAdmin, async (req, res) => {
  const { name, role, company, message, rating, is_approved, is_active } = req.body;
  const id = uuidv4();
  const display_id = `TST-${Date.now().toString().slice(-4)}`;
  try {
    await db.query(
      'INSERT INTO testimonials (id, display_id, name, role, company, message, rating, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, display_id, name, role, company, message, rating || 5, is_approved ?? true, is_active ?? true]
    );
    res.status(201).json({ id, message: 'Testimonial added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/testimonials/:id', verifyToken, isAdmin, async (req, res) => {
  const { name, role, company, message, rating, is_approved, is_active } = req.body;
  try {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (company !== undefined) { fields.push('company = ?'); params.push(company); }
    if (message !== undefined) { fields.push('message = ?'); params.push(message); }
    if (rating !== undefined) { fields.push('rating = ?'); params.push(rating); }
    if (is_approved !== undefined) { fields.push('is_approved = ?'); params.push(is_approved); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }
    
    if (fields.length === 0) return res.json({ message: 'No changes' });
    
    params.push(req.params.id);
    await db.query(`UPDATE testimonials SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/testimonials/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

