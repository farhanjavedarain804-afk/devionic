const db = require('../db');
const uuidv4 = require('./uuid');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = async (email, otp, type) => {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await db.query(
            'INSERT INTO otps (id, email, otp, type, expires_at) VALUES (?, ?, ?, ?, ?)',
            [id, email, otp, type, expiresAt]
        );
    } catch (err) {
        if (err.message.includes("doesn't exist")) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS otps (
                    id CHAR(36) PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    otp VARCHAR(10) NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await db.query('CREATE INDEX idx_otps_email_type_expires_at ON otps (email, type, expires_at)');
            await db.query(
                'INSERT INTO otps (id, email, otp, type, expires_at) VALUES (?, ?, ?, ?, ?)',
                [id, email, otp, type, expiresAt]
            );
        } else {
            throw err;
        }
    }
};

const verifyOTP = async (email, otp, type) => {
    const [rows] = await db.query(
        'SELECT id FROM otps WHERE email = ? AND otp = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email, otp, type]
    );
    if (rows.length > 0) {
        // Delete OTP after successful verification to prevent reuse
        await db.query('DELETE FROM otps WHERE email = ? AND type = ?', [email, type]);
        return true;
    }
    return false;
};

module.exports = { generateOTP, storeOTP, verifyOTP };
