const nodemailer = require('nodemailer');
const { getSiteSettings } = require('./siteSettings');

const transporterCache = new Map();

const getTransporter = (config) => {
  const cacheKey = JSON.stringify({
    host: config.smtp_host || 'smtp.gmail.com',
    port: parseInt(config.smtp_port, 10) || 465,
    secure: config.smtp_secure !== 'false',
    user: config.smtp_user || '',
    pass: config.smtp_pass || '',
  });

  const cached = transporterCache.get(cacheKey);
  if (cached) return cached;

  const transporter = nodemailer.createTransport({
    host: config.smtp_host || 'smtp.gmail.com',
    port: parseInt(config.smtp_port) || 465,
    secure: config.smtp_secure !== 'false',
    auth: {
      user: config.smtp_user || '',
      pass: config.smtp_pass || '',
    },
    tls: {
      rejectUnauthorized: false,
    }
  });

  transporterCache.set(cacheKey, transporter);
  return transporter;
};

/**
 * Robust Email Service with Database-driven Config
 */
const sendEmail = async ({ to, subject, html, settingKey }) => {
  try {
    const configKeys = ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'smtp_from_name'];
    if (settingKey) configKeys.push(settingKey);
    const config = await getSiteSettings(configKeys);

    // If a settingKey is provided and it's explicitly 'false', skip sending
    if (settingKey && config[settingKey] === 'false') {
      console.log(`[EMAIL-SKIPPED] ${settingKey} is disabled. Skipping email to ${to}`);
      return { success: false, skipped: true };
    }

    // Default Fallback (for initial setup)
    const transporter = getTransporter(config);

    const info = await transporter.sendMail({
      from: `"${config.smtp_from_name || 'Devionic'}" <${config.smtp_user}>`,
      to,
      subject,
      html,
    });

    console.log('[EMAIL-SENT]', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EMAIL-FAILED]', err.message);
    throw new Error('Email delivery failed: ' + err.message);
  }
};

const sendOTP = async (email, otp, type = 'Login') => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ccbb; margin: 0; font-size: 28px;">DEVIONIC</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-weight: bold;">Secure Authentication Node</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 20px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">2-Factor Authorization</h2>
        <p style="color: #666;">Your one-time verification code for <strong>${type}</strong> is:</p>
        <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #00ccbb; margin: 20px 0; padding: 10px; background: white; border: 2px dashed #00ccbb; border-radius: 10px; display: inline-block;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #bbb; font-size: 11px;">
        &copy; 2026 Devionic (Private) Limited. All rights reserved.
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `[SECURE] ${otp} is your verification code`, html });
};

/**
 * Notifies admin about important system activity
 */
const notifyAdmin = async ({ subject, body, metadata = {} }) => {
  try {
    const config = await getSiteSettings(['admin_notification_email', 'company_email', 'smtp_user']);

    const adminEmail = config.admin_notification_email || config.company_email || config.smtp_user;
    if (!adminEmail) {
      console.warn('[NOTIFY-ADMIN] No admin email configured. Skipping notification.');
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">System Alert</h2>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Real-time Activity Hub</p>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <h3 style="color: #1e293b; margin-top: 0;">${subject}</h3>
          <p style="color: #475569; line-height: 1.6;">${body}</p>
          
          ${Object.keys(metadata).length > 0 ? `
            <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 12px;">
              <strong style="color: #64748b; text-transform: uppercase;">Technical Context:</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 16px; color: #475569;">
                ${Object.entries(metadata).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
            <a href="https://devionic.com/admin" style="display: inline-block; padding: 12px 24px; background: #00ccbb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Open Admin Dashboard</a>
          </div>
        </div>
        <div style="background: #f8fafc; color: #94a3b8; padding: 16px; text-align: center; font-size: 11px;">
          &copy; 2026 Devionic Intelligence Systems. This is an automated security alert.
        </div>
      </div>
    `;

    return sendEmail({ to: adminEmail, subject: `[ADMIN-ALERT] ${subject}`, html });
  } catch (err) {
    console.error('[NOTIFY-ADMIN-FAILED]', err.message);
  }
};

module.exports = { sendEmail, sendOTP, notifyAdmin };
