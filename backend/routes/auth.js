const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const crypto = require('crypto');
const dns = require('dns').promises;
const axios = require('axios');
const { generateOTP, storeOTP, verifyOTP } = require('../utils/otpManager');
const { sendOTP, notifyAdmin } = require('../utils/emailService');
const { getJwtSecret } = require('../utils/jwtSecret');
const { getSiteSettings, getSiteSetting } = require('../utils/siteSettings');
const { ensureGoogleColumns } = require('../utils/dmsMigration');

const uuidv4 = require('../utils/uuid');
const generateUUID = uuidv4;
const { checkTrustedDevice } = require('../middleware/checkTrustedDevice');
const TRUSTED_DEVICE_DAYS = 30;

// ─── Google Sign-In ────────────────────────────────────────────────────────
// Lazily instantiated OAuth2Client. Created once and reused per request.
let googleClient = null;
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!googleClient) googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
};

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST || process.env.SMTP_USER || process.env.SMTP_PASS);
const shouldExposeDebugOtp = () =>
  process.env.NODE_ENV !== 'production' ||
  process.env.ALLOW_OTP_DEBUG === 'true' ||
  !hasSmtpConfig();

const buildOtpChallengePayload = (email, otp, fallbackReason) => ({
  message: 'OTP_REQUIRED',
  email,
  ...(shouldExposeDebugOtp() ? { debug_otp: otp, delivery: 'debug', fallback_reason: fallbackReason } : {}),
});

// Rate Limiter Helper
const checkRateLimit = async (email, ip, action) => {
  try {
    const configSettings = await getSiteSettings(['rate_limit_attempts', 'rate_limit_window']);
    const config = {
      attempts: parseInt(configSettings.rate_limit_attempts, 10) || 5,
      window: parseInt(configSettings.rate_limit_window, 10) || 15,
    };

    const [attempts] = await db.query(
      'SELECT COUNT(*) as count FROM login_attempts WHERE (email = ? OR ip_address = ?) AND action = ? AND status = \'failed\' AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)',
      [email, ip, action, config.window]
    );

    if (attempts[0].count >= config.attempts) {
      return { blocked: true, message: 'Too many attempts. Please try again after ' + config.window + ' minutes.' };
    }
    return { blocked: false };
  } catch (err) {
    console.error('[RATE-LIMIT-ERROR]', err.message);
    return { blocked: false }; // Fail open if table doesn't exist
  }
};

const logAttempt = async (email, ip, action, status) => {
  try {
    await db.query(
      'INSERT INTO login_attempts (id, email, ip_address, action, status) VALUES (?, ?, ?, ?, ?)',
      [generateUUID(), email, ip, action, status]
    );
  } catch (err) {}
};

// Request Signup OTP (Pre-registration)
router.post('/signup-request', async (req, res) => {
  const { email } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  try {
    const rateLimit = await checkRateLimit(email, ip, 'signup');
    if (rateLimit.blocked) return res.status(429).json({ message: rateLimit.message });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      await logAttempt(email, ip, 'signup', 'failed');
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'signup');
    try {
      await sendOTP(email, otp, 'Account Signup');
      res.json({ message: 'OTP_SENT', email });
    } catch (mailErr) {
      console.error('[SIGNUP-OTP-FAILED]', mailErr.message);
      if (shouldExposeDebugOtp()) {
        return res.json({
          message: 'OTP_SENT',
          email,
          debug_otp: otp,
          delivery: 'debug',
          fallback_reason: 'SMTP configuration unavailable',
        });
      }
      return res.status(503).json({ message: 'OTP delivery failed. Please contact support.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Finalize Signup
router.post('/signup', async (req, res) => {
  const { email, otp, password, full_name, company_name, contact_number } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  
  try {
    const rateLimit = await checkRateLimit(email, ip, 'signup');
    if (rateLimit.blocked) return res.status(429).json({ message: rateLimit.message });

    const isValid = await verifyOTP(email, otp, 'signup');
    if (!isValid) {
      await logAttempt(email, ip, 'signup', 'failed');
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await logAttempt(email, ip, 'signup', 'success');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUUID();

    // Insert user
    await db.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [userId, email, hashedPassword]);
    
    // Insert profile
    await db.query('INSERT INTO profiles (id, full_name, company_name, contact_number) VALUES (?, ?, ?, ?)', 
      [userId, full_name, company_name, contact_number]);

    res.status(201).json({ message: 'Account created successfully' });
    
    // Notify Admin
    notifyAdmin({
      subject: 'New User Registered',
      body: `A new user has just registered on the platform: ${email}.`,
      metadata: {
        Email: email,
        Name: full_name,
        Company: company_name,
        Time: new Date().toLocaleString()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 1: Login Request (Password Check)
router.post('/login', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'Invalid payload. Content-Type must be application/json' });
  }
  const { email, password, deviceId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const rateLimit = await checkRateLimit(email, ip, 'login');
    if (rateLimit.blocked) return res.status(429).json({ message: rateLimit.message });

    const [users] = await db.query('SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1', [email]);
    
    let user = users[0];
    let isMatch = false;
    
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!user || !isMatch) {
      await logAttempt(email, ip, 'login', 'failed');
      notifyAdmin({
        subject: 'Security Alert: Failed Login Attempt',
        body: `A failed login attempt was detected for the email: ${email}.`,
        metadata: { Email: email, IP: ip, Time: new Date().toLocaleString(), Status: 'Access Denied' }
      }).catch(() => {});
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await logAttempt(email, ip, 'login', 'success');

    // Password correct — check trusted device before triggering 2FA
    const is2FAEnabled = (await getSiteSetting('enable_2fa', 'true')) === 'true';

    if (is2FAEnabled) {
      // Check trusted device first
      const trusted = await checkTrustedDevice(user.id, deviceId, userAgent);
      if (trusted) {
        // Skip 2FA — device is trusted
        return generateTokenResponse(user, req, res, { twoFA_skipped: true });
      }

      // Not trusted — send OTP
      const otp = generateOTP();
      await storeOTP(email, otp, 'login');
      try {
        await sendOTP(email, otp, 'Secure Login');
        return res.json({ message: 'OTP_REQUIRED', email });
      } catch (mailErr) {
        console.error('[LOGIN-OTP-FAILED]', mailErr.message);
        if (shouldExposeDebugOtp()) {
          return res.json(buildOtpChallengePayload(email, otp, 'SMTP configuration unavailable'));
        }
        return res.status(503).json({ message: 'OTP delivery failed. Please contact support.' });
      }
    }

    // 2FA disabled — proceed directly
    return generateTokenResponse(user, req, res);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Google Sign-In (One Tap / GIS button)
// Verifies the Google ID token and either logs the user in or provisions a new
// auto-approved account. Reuses generateTokenResponse() so the response shape
// is identical to password login.
router.post('/google', async (req, res) => {
  const { credential } = req.body || {};
  const client = getGoogleClient();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google Sign-In is not configured on the server.' });
  }
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ message: 'Missing Google credential token.' });
  }

  try {
    // 1. Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Google token did not contain an email.' });
    }
    if (!payload.email_verified) {
      return res.status(400).json({ message: 'Google email is not verified.' });
    }

    // 2. Make sure the optional google_id / avatar_url columns exist
    await ensureGoogleColumns(db);

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const fullName = payload.name || (email.split('@')[0]);
    const avatarUrl = payload.picture || null;

    // 3. Look up user by google_id first, then by email (link accounts)
    let [users] = await db.query(
      'SELECT id, email, password, role FROM users WHERE google_id = ? OR email = ? LIMIT 1',
      [googleId, email]
    );
    let user = users[0];

    if (!user) {
      // 4. Provision a new auto-approved Google account
      const userId = generateUUID();
      await db.query(
        'INSERT INTO users (id, email, role, google_id, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [userId, email, 'user', googleId, avatarUrl]
      );
      await db.query(
        `INSERT INTO profiles (id, full_name, email, avatar_url, provider, is_approved, is_rejected)
         VALUES (?, ?, ?, ?, ?, 1, 0)`,
        [userId, fullName, email, avatarUrl, 'google']
      );
      [users] = await db.query('SELECT id, email, password, role FROM users WHERE id = ? LIMIT 1', [userId]);
      user = users[0];

      // Notify admin (fire-and-forget)
      notifyAdmin({
        subject: 'New User Registered via Google',
        body: `A new user signed up using Google Sign-In.`,
        metadata: { Email: email, Name: fullName, Provider: 'Google', Time: new Date().toLocaleString() },
      }).catch(() => {});
    } else {
      // 5. Link/refresh google_id + avatar on an existing (possibly password) account
      const updates = [];
      const params = [];
      if (!user.google_id) { updates.push('google_id = ?'); params.push(googleId); }
      updates.push('avatar_url = ?'); params.push(avatarUrl);
      params.push(user.id);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
      // Keep profile auto-approved for a verified Google identity
      await db.query(
        'UPDATE profiles SET avatar_url = ?, provider = COALESCE(NULLIF(provider, ""), ?), is_approved = 1 WHERE id = ?',
        [avatarUrl, 'google', user.id]
      ).catch(() => {});
    }

    // 6. Mint JWT using the shared helper — identical response shape to /login
    return generateTokenResponse(user, req, res, { via_google: true });
  } catch (err) {
    console.error('[GOOGLE-AUTH-ERROR]', err.message);
    if (err.message && err.message.includes('Token used too late')) {
      return res.status(401).json({ message: 'Google session expired. Please try again.' });
    }
    return res.status(401).json({ message: 'Google authentication failed.' });
  }
});

// Step 2: Finalize Login (Verify OTP)
router.post('/verify-login', async (req, res) => {
  const { email, otp, deviceId, rememberDevice } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const rateLimit = await checkRateLimit(email, ip, 'login');
    if (rateLimit.blocked) return res.status(429).json({ message: rateLimit.message });

    const isValid = await verifyOTP(email, otp, 'login');
    if (!isValid) {
      await logAttempt(email, ip, 'login', 'failed');
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await logAttempt(email, ip, 'login', 'success');
    const [users] = await db.query('SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];

    // Save trusted device if requested
    if (rememberDevice && deviceId && user) {
      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + TRUSTED_DEVICE_DAYS);
        await db.query(
          `INSERT INTO trusted_devices (id, user_id, device_id, user_agent, ip_address, trusted, expires_at)
           VALUES (?, ?, ?, ?, ?, 1, ?)
           ON DUPLICATE KEY UPDATE
             user_agent = VALUES(user_agent),
             ip_address = VALUES(ip_address),
             trusted    = 1,
             expires_at = VALUES(expires_at),
             last_used  = NOW()`,
          [generateUUID(), user.id, deviceId, userAgent, ip, expiresAt]
        );
      } catch (devErr) {
        console.error('[TRUSTED-DEVICE-SAVE]', devErr.message);
      }
    }
    
    return generateTokenResponse(user, req, res);
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { email, type } = req.body;
  try {
    const otp = generateOTP();
    await storeOTP(email, otp, type);
    try {
      await sendOTP(email, otp, type === 'login' ? 'Secure Login' : 'Account Verification');
      res.json({ message: 'OTP_RESENT' });
    } catch (mailErr) {
      console.error('[RESEND-OTP-FAILED]', mailErr.message);
      if (shouldExposeDebugOtp()) {
        return res.json({
          message: 'OTP_RESENT',
          email,
          debug_otp: otp,
          delivery: 'debug',
          fallback_reason: 'SMTP configuration unavailable',
        });
      }
      return res.status(503).json({ message: 'OTP delivery failed. Please contact support.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper for Token Generation
async function generateTokenResponse(user, req, res, extra = {}) {
  try {
    // Run profile + dept queries in PARALLEL for speed
    const [profileResult, deptResult, permResult] = await Promise.all([
      db.query('SELECT full_name, company_name, contact_number, is_approved, is_rejected FROM profiles WHERE id = ? LIMIT 1', [user.id]),
      db.query(`
        SELECT d.modules, d.name as dept_name, d.code as dept_code,
               b.name as branch_name, b.code as branch_code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.id = ?
      `, [user.id]).catch(() => [[null]]),
      db.query('SELECT custom_permissions FROM users WHERE id = ? LIMIT 1', [user.id]).catch(() => [[null]]),
    ]);

    const profile = profileResult[0][0] || {
      full_name: user.role === 'admin' ? 'Admin User' : '',
      company_name: '',
      contact_number: '',
      is_approved: user.role === 'admin' ? 1 : 0,
      is_rejected: 0,
    };

    let departmentModules = null, departmentName = null, departmentCode = null;
    let branchName = null, branchCode = null, customPermissions = null;

    const deptRow = deptResult[0] && deptResult[0][0];
    if (deptRow) {
      if (deptRow.modules) {
        departmentModules = typeof deptRow.modules === 'string' ? JSON.parse(deptRow.modules) : deptRow.modules;
      }
      departmentName = deptRow.dept_name;
      departmentCode = deptRow.dept_code;
      branchName = deptRow.branch_name;
      branchCode = deptRow.branch_code;
    }

    const permRow = permResult[0] && permResult[0][0];
    if (permRow && permRow.custom_permissions) {
      customPermissions = typeof permRow.custom_permissions === 'string'
        ? JSON.parse(permRow.custom_permissions)
        : permRow.custom_permissions;
    }

    const isApproved = profile && Number(profile.is_approved) === 1;
    if (user.role !== 'admin' && !isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval. Please contact support.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    // ✅ SEND RESPONSE IMMEDIATELY — before any slow background work
    res.json({
      ...extra,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: profile.full_name,
        is_approved: profile.is_approved ?? (user.role === 'admin' ? 1 : 0),
        is_rejected: profile.is_rejected ?? 0,
        department_name: departmentName,
        department_code: departmentCode,
        department_modules: departmentModules,
        branch_name: branchName,
        branch_code: branchCode,
        custom_permissions: customPermissions
      }
    });

    // 🔄 ALL metadata capture runs in background AFTER response is sent
    setImmediate(async () => {
      try {
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const cleanIp = ip === '::1' || ip === '127.0.0.1' ? '' : ip.replace('::ffff:', '');
        let dnsName = 'Unknown', location = 'Unknown', device = 'PC', browser = 'Unknown', os = 'Unknown';

        const ua = req.headers['user-agent'] || '';
        if (ua) {
          if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11'; else if (ua.includes('Macintosh')) os = 'macOS';
          if (ua.includes('Chrome')) browser = 'Chrome'; else if (ua.includes('Firefox')) browser = 'Firefox';
          device = ua.includes('Mobile') ? 'Mobile' : 'Desktop';
        }

        if (cleanIp) {
          const [dnsResult, geoResult] = await Promise.allSettled([
            dns.reverse(cleanIp),
            axios.get(`http://ip-api.com/json/${cleanIp}`, { timeout: 3000 }),
          ]);
          if (dnsResult.status === 'fulfilled') dnsName = dnsResult.value[0] || 'None';
          if (geoResult.status === 'fulfilled' && geoResult.value.data.status === 'success') {
            location = `${geoResult.value.data.city}, ${geoResult.value.data.country}`;
          }
        }

        await db.query(
          'UPDATE profiles SET last_login_ip=?, last_login_dns=?, last_login_location=?, last_login_device=?, last_login_browser=?, last_login_os=? WHERE id=?',
          [cleanIp || '127.0.0.1', dnsName, location, device, browser, os, user.id]
        ).catch(() => {});

        notifyAdmin({
          subject: 'User Login Activity',
          body: `A user has successfully logged into the software.`,
          metadata: {
            User: profile.full_name,
            Email: user.email,
            Role: user.role,
            IP: cleanIp || '127.0.0.1',
            Location: location,
            Device: `${os} (${browser})`,
            Time: new Date().toLocaleString()
          }
        }).catch(() => {});
      } catch (bgErr) {
        console.error('[BG-METADATA-ERROR]', bgErr.message);
      }
    });

  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
    }
    console.error('[TOKEN-GEN-ERROR]', err.message);
    if (!res.headersSent) res.status(500).json({ message: 'Error generating authentication token.' });
  }
}

// Get Current User (Me)
const { verifyToken } = require('../middleware/auth');
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, role, department_id, branch_id, custom_permissions FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const [profiles] = await db.query('SELECT full_name, company_name, contact_number, is_approved, is_rejected FROM profiles WHERE id = ? LIMIT 1', [req.user.id]);

    let departmentModules = null;
    let departmentName = null;
    let departmentCode = null;
    let branchName = null;
    let branchCode = null;
    try {
      const [deptRows] = await db.query(`
        SELECT d.modules, d.name as dept_name, d.code as dept_code,
               b.name as branch_name, b.code as branch_code
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.id = ?
      `, [req.user.id]);
      if (deptRows[0]) {
        if (deptRows[0].modules) {
          departmentModules = typeof deptRows[0].modules === 'string' ? JSON.parse(deptRows[0].modules) : deptRows[0].modules;
        }
        departmentName = deptRows[0].dept_name;
        departmentCode = deptRows[0].dept_code;
        branchName = deptRows[0].branch_name;
        branchCode = deptRows[0].branch_code;
      }
    } catch (deptErr) {}

    const userData = users[0];
    const customPermissions = userData.custom_permissions
      ? (typeof userData.custom_permissions === 'string' ? JSON.parse(userData.custom_permissions) : userData.custom_permissions)
      : null;
    
    res.json({
      ...userData,
      custom_permissions: customPermissions,
      department_name: departmentName,
      department_code: departmentCode,
      department_modules: departmentModules,
      branch_name: branchName,
      branch_code: branchCode,
      profile: profiles[0] || {}
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Password
router.post('/update-password', verifyToken, async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List trusted devices for current user
router.get('/trusted-devices', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, device_id, user_agent, ip_address, trusted, expires_at, last_used, created_at
       FROM trusted_devices WHERE user_id = ? AND expires_at > NOW() ORDER BY last_used DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Revoke a specific trusted device
router.delete('/trusted-devices/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM trusted_devices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Trusted device revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Revoke ALL trusted devices for current user (logout all)
router.delete('/trusted-devices', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM trusted_devices WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All trusted devices revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
