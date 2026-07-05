const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', async (req, res) => {
  const id = req.params.id.toUpperCase();
  try {
    // 1. Complaints
    if (id.startsWith('CMP')) {
      const [rows] = await db.query(
        'SELECT id, tracking_id, name, email, phone, subject, description, status, resolved_at, resolved_notes, created_at FROM complaints WHERE tracking_id = ? LIMIT 1',
        [id]
      );
      if (rows.length) return res.json({ type: 'complaint', ...rows[0] });
    }

    // 2. Invoices & Quotations (Verification ID or Number)
    if (id.startsWith('INV') || id.startsWith('VER')) {
      const [inv] = await db.query(
        'SELECT id, invoice_number, verification_id, client_name, client_email, client_phone, client_address, subtotal, tax_rate, tax_amount, discount, total, paid_amount, currency, status, due_date, notes, customer_id, created_at, updated_at FROM invoices WHERE verification_id = ? OR invoice_number = ? LIMIT 1',
        [id, id]
      );
      if (inv.length) return res.json({ type: 'invoice', ...inv[0] });

      const [quot] = await db.query(
        'SELECT id, quotation_number, verification_id, client_name, client_email, client_phone, client_address, subtotal, tax_rate, tax_amount, discount, total, paid_amount, currency, status, valid_until, notes, customer_id, created_at, updated_at FROM quotations WHERE verification_id = ? OR quotation_number = ? LIMIT 1',
        [id, id]
      );
      if (quot.length) return res.json({ type: 'quotation', ...quot[0] });
    }

    // 3. Quotations (QUO prefix)
    if (id.startsWith('QUO')) {
      const [quot] = await db.query(
        'SELECT id, quotation_number, verification_id, client_name, client_email, client_phone, client_address, subtotal, tax_rate, tax_amount, discount, total, paid_amount, currency, status, valid_until, notes, customer_id, created_at, updated_at FROM quotations WHERE quotation_number = ? LIMIT 1',
        [id]
      );
      if (quot.length) return res.json({ type: 'quotation', ...quot[0] });
    }

    // 4. Job Applications (APP or EMP prefix)
    if (id.startsWith('APP') || id.startsWith('EMP')) {
      const [rows] = await db.query(
        'SELECT id, application_number, verification_id, job_id, job_title, full_name, email, phone1, phone2, whatsapp, cnic, status, employee_id, created_at, updated_at FROM job_applications WHERE application_number = ? OR verification_id = ? LIMIT 1',
        [id, id]
      );
      if (rows.length) return res.json({ type: 'application', ...rows[0] });
    }

    // 5. Inquiries (INQ prefix)
    if (id.startsWith('INQ')) {
      const [inq] = await db.query(
        'SELECT id, display_id, name, email, phone, subject, message, status, is_read, resolved_at, resolved_notes, created_at FROM inquiries WHERE display_id = ? LIMIT 1',
        [id]
      );
      if (inq.length) return res.json({ type: 'inquiry', ...inq[0] });
    }

    // 6. Staff (STF prefix)
    if (id.startsWith('STF')) {
      const [stf] = await db.query(
        'SELECT id, display_id, name, email, phone, cnic, position, department, join_date, staff_type, salary, is_active, created_at FROM staff WHERE display_id = ? LIMIT 1',
        [id]
      );
      if (stf.length) return res.json({ type: 'staff', ...stf[0] });
    }

    // 7. Salary Slips (SAL prefix)
    if (id.startsWith('SAL')) {
      const [sal] = await db.query(`
        SELECT s.*, st.name as staff_name, st.position, st.department, st.display_id as staff_display_id 
        FROM salary_slips s
        JOIN staff st ON s.staff_id = st.id
        WHERE s.verification_id = ?
      `, [id]);
      if (sal.length) {
        const row = sal[0];
        return res.json({ 
          type: 'salary_slip', 
          ...row,
          staff: {
            name: row.staff_name,
            position: row.position,
            department: row.department,
            display_id: row.staff_display_id
          }
        });
      }
    }

    // 8. Transactions (TXN prefix)
    if (id.startsWith('TXN')) {
      const [txn] = await db.query(
        'SELECT id, display_id, entry_date, type, category, description, amount, reference_type, reference_number, reference_id, notes, created_at, updated_at FROM financials WHERE display_id = ? LIMIT 1',
        [id]
      );
      if (txn.length) return res.json({ type: 'transaction', ...txn[0] });
    }

    // Fallback search across everything if no prefix match or prefix was generic
    // ... we already have some above, let's just make it complete in fallback if needed
    
    // Fallback search
    const searches = [
      { table: 'invoices', field: 'verification_id', type: 'invoice' },
      { table: 'invoices', field: 'invoice_number', type: 'invoice' },
      { table: 'quotations', field: 'verification_id', type: 'quotation' },
      { table: 'quotations', field: 'quotation_number', type: 'quotation' },
      { table: 'complaints', field: 'tracking_id', type: 'complaint' },
      { table: 'job_applications', field: 'application_number', type: 'application' },
      { table: 'job_applications', field: 'verification_id', type: 'application' },
      { table: 'inquiries', field: 'display_id', type: 'inquiry' },
      { table: 'staff', field: 'display_id', type: 'staff' },
      { table: 'financials', field: 'display_id', type: 'transaction' }
    ];

    for (const s of searches) {
      const [rows] = await db.query(`SELECT * FROM ${s.table} WHERE ${s.field} = ? LIMIT 1`, [id]);
      if (rows.length) return res.json({ type: s.type, ...rows[0] });
    }

    res.status(404).json({ message: 'No record found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
