const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
require('dotenv').config();
const { runDmsMigrations } = require('./utils/dmsMigration');
const { getQueueStats } = require('./utils/taskQueue');

// --- GLOBAL ERROR LOGGING FOR CPANEL ---
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });

const logError = (type, err) => {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] [${type}] ${err.stack || err}\n`;
  console.error(message);
  try {
    logStream.write(message);
  } catch (e) {
    console.error('Could not write to error.log');
  }
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

process.on('uncaughtException', (err) => {
  logError('UNCAUGHT-EXCEPTION', err);
  // Give the stream a moment to write before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('UNHANDLED-REJECTION', reason);
  // Treat unhandled rejection as fatal to allow auto-recovery/restart
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

const app = express();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
app.set('trust proxy', 1);
const allowedOrigins = [
  'https://devionic.com', 
  'https://api.devionic.com', 
  'https://www.devionic.com',
  'https://console.devionic.com',
  'http://devionic.com',
  'http://www.devionic.com',
  'http://console.devionic.com'
];

const isLocalOrigin = (origin) =>
  Boolean(
    origin &&
    (
      origin.startsWith('http://localhost:') ||
      origin === 'http://localhost' ||
      origin.startsWith('https://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === 'http://127.0.0.1' ||
      origin.startsWith('https://127.0.0.1:')
    )
  );

// Production CORS configuration MUST be before rate limiters and helmet
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl), local dev origins, or allowed domains
    if (!origin || isLocalOrigin(origin) || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- HIGH LEVEL SECURITY MIDDLEWARE ---

// 1. Helmet for secure headers (Strict configuration)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://accounts.google.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://www.google-analytics.com", "https://www.googletagmanager.com", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", "https://api.devionic.com", "https://*.supabase.co", "https://www.google-analytics.com", "https://accounts.google.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 2. Global Rate Limiting - DDoS protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', globalLimiter);

// 3. Auth Rate Limiting - Brute force protection
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 attempts per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again after 10 minutes' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/google', authLimiter);

// 4. HTTP Parameter Pollution protection
app.use(hpp());

// --- STANDARD MIDDLEWARE ---

app.use(express.json({ limit: '10kb' })); // Body limit to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  immutable: false,
}));

// Use combined logging in production, dev in development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.get('/api/health', async (req, res) => {
  const db = require('./db');
  let dbStatus = 'unknown';
  try {
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.code || err.message}`;
  }
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    message: 'API is reachable',
    database: dbStatus,
    env: process.env.NODE_ENV
  });
});

app.get('/api/health/deep', async (req, res) => {
  const db = require('./db');
  const startedAt = Date.now();
  let database = { ok: false, latencyMs: null };

  try {
    const dbStart = Date.now();
    await db.query('SELECT 1');
    database = { ok: true, latencyMs: Date.now() - dbStart };
  } catch (err) {
    database = { ok: false, error: err.code || err.message };
  }

  res.json({
    ok: database.ok,
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startedAt,
    database,
    queue: getQueueStats(),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/service_inquiries', require('./routes/service_inquiries'));
app.use('/api/quote_requests', require('./routes/quote_requests'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/complaint_notes', require('./routes/complaint_notes'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/ticket_notes', require('./routes/ticket_notes'));
app.use('/api/inquiry_notes', require('./routes/inquiry_notes'));
app.use('/api/quote_request_notes', require('./routes/quote_request_notes'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/financials', require('./routes/financials'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/application_status_history', require('./routes/application_status_history'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/salary_slips', require('./routes/salary_slips'));
// ─── Admin Portal Routes (DMS) ────────────────────────────────────────────
// All /api/dms/admin/* routes are protected by verifyToken + isAdmin
// middleware applied centrally in routes/admin/index.js
app.use('/api/dms/admin', require('./routes/admin/index'));

// ─── Document Routes ───────────────────────────────────────────────────────
app.use('/api/document_categories', require('./routes/document_categories'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/internship_applications', require('./routes/internship_applications'));
app.use('/api/public', require('./routes/public'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/site_settings', require('./routes/site_settings'));

// --- PRODUCTION SERVING ---

// Serve static files ONLY if the directory exists (optional for separate API subdomain)
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    immutable: true,
  }));
}

// API 404 handler (if it starts with /api but didn't match any route)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  return next();
});

// Catch-all route to serve the frontend index.html for all non-API paths
// ONLY if not an API request and if diskPath exists
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }

  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>API Server</title></head>
    <body>
      <h1>API Server Running</h1>
      <p>This is the API server. If you are looking for the frontend, visit <a href="https://www.devionic.com">https://www.devionic.com</a></p>
    </body>
    </html>
  `);
});

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error('[SERVER-ERROR]', err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred.' 
      : err.message,
    status: err.status || 500
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    // Run DMS migrations on startup
    const db = require('./db');
    await runDmsMigrations(db);
  });
}

module.exports = app;
