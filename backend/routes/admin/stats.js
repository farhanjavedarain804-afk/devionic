const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');

// Get all dashboard stats
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [
      [services],
      [portfolio],
      [jobs],
      [inquiries],
      [serviceInquiries],
      [complaints],
      [customers],
      [invoices],
      [quotations],
      [testimonials],
      [staff],
      [quoteRequests]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM services'),
      db.query('SELECT COUNT(*) as count FROM portfolio'),
      db.query('SELECT COUNT(*) as count FROM jobs'),
      db.query('SELECT COUNT(*) as count, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM inquiries'),
      db.query('SELECT COUNT(*) as count, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM service_inquiries'),
      db.query('SELECT COUNT(*) as count, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending FROM complaints'),
      db.query('SELECT COUNT(*) as count FROM customers'),
      db.query('SELECT COUNT(*) as count, SUM(CASE WHEN status = "paid" THEN total ELSE 0 END) as totalRevenue FROM invoices'),
      db.query('SELECT COUNT(*) as count FROM quotations'),
      db.query('SELECT COUNT(*) as count FROM testimonials'),
      db.query('SELECT COUNT(*) as count FROM staff'),
      db.query('SELECT COUNT(*) as count FROM quote_requests')
    ]);

    let qDocs = { count: 0 };
    try {
      const [resDocs] = await db.query('SELECT COUNT(*) as count FROM documents');
      qDocs = resDocs[0];
    } catch (e) { /* table might not exist yet */ }

    res.json({
      services: services[0].count,
      portfolio: portfolio[0].count,
      jobs: jobs[0].count,
      inquiries: inquiries[0].count,
      unreadInq: inquiries[0].unread || 0,
      serviceInquiries: serviceInquiries[0].count,
      unreadSvcInq: serviceInquiries[0].unread || 0,
      complaints: complaints[0].count,
      pendingComplaints: complaints[0].pending || 0,
      customers: customers[0].count,
      invoices: invoices[0].count,
      totalRevenue: Number(invoices[0].totalRevenue || 0),
      quotations: quotations[0].count,
      testimonials: testimonials[0].count,
      staff: staff[0].count,
      quoteRequests: quoteRequests[0].count,
      documents: qDocs.count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
