const express = require('express');
const router = express.Router();
const db = require('../../db');
const { verifyToken, isAdmin } = require('../../middleware/auth');

router.get('/run', verifyToken, isAdmin, async (req, res) => {
  try {
    const results = [];

    // 1. Complaints
    const [complaints] = await db.query('SELECT id, created_at, status FROM complaints WHERE status = ?', ['pending']);
    const criticalComplaints = complaints.filter(c => (Date.now() - new Date(c.created_at).getTime()) > 24 * 60 * 60 * 1000);
    results.push({
      module: "Complaints", check: "Critical pending complaints (>24h)",
      status: criticalComplaints.length > 0 ? "fail" : "pass",
      detail: criticalComplaints.length > 0 ? `${criticalComplaints.length} overdue` : "No critical complaints",
      value: complaints.length
    });

    // 2. Overdue Invoices
    const [invoices] = await db.query('SELECT id, due_date, status, total FROM invoices WHERE status IN (?, ?)', ['sent', 'draft']);
    const overdueInvoices = invoices.filter(i => i.due_date && new Date(i.due_date) < new Date());
    results.push({
      module: "Invoices", check: "Overdue invoices",
      status: overdueInvoices.length > 0 ? "warn" : "pass",
      detail: overdueInvoices.length > 0 ? `${overdueInvoices.length} past due` : "All on track",
      value: overdueInvoices.length
    });

    // 3. Unread inquiries
    const [inquiries] = await db.query('SELECT id FROM inquiries WHERE is_read = 0');
    results.push({
      module: "Inquiries", check: "Unread inquiries",
      status: inquiries.length > 5 ? "warn" : "pass",
      detail: `${inquiries.length} unread`,
      value: inquiries.length
    });

    // 4. Projects status
    const [projects] = await db.query('SELECT id, status FROM projects');
    const activeProjects = projects.filter(p => !["completed", "delivered"].includes(p.status));
    results.push({
      module: "Projects", check: "Active projects",
      status: "pass",
      detail: `${activeProjects.length} active projects`,
      value: activeProjects.length
    });

    // 5. Finance
    const [financials] = await db.query('SELECT type, amount FROM financials');
    const income = financials.filter(f => f.type === 'income').reduce((s, f) => s + Number(f.amount), 0);
    const expense = financials.filter(f => f.type === 'expense').reduce((s, f) => s + Number(f.amount), 0);
    results.push({
      module: "Finance", check: "Income vs Expenses",
      status: income < expense ? "fail" : "pass",
      detail: `PKR ${income.toLocaleString()} vs PKR ${expense.toLocaleString()}`,
      value: income - expense
    });

    res.json(results);
  } catch (err) {
    console.error('Audit failed:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
