const crypto = require('crypto');

/**
 * Generates a version 4 UUID.
 * Compatible with Node.js v10, v12, v14, and above.
 * Uses crypto.randomBytes for security.
 */
const uuidv4 = () => {
    // Check if the native randomUUID is available (Node.js 14.17.0+)
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for older Node.js versions
    const bytes = crypto.randomBytes(16);
    
    // Set version to 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant to RFC4122
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    
    return [
        bytes.toString('hex', 0, 4),
        bytes.toString('hex', 4, 6),
        bytes.toString('hex', 6, 8),
        bytes.toString('hex', 8, 10),
        bytes.toString('hex', 10, 16)
    ].join('-');
};

module.exports = uuidv4;
