const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.warn(`[AUTH-DEBUG] Admin access denied for: ${req.user?.email}, Role: ${req.user?.role}, Path: ${req.originalUrl}`);
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { verifyToken, isAdmin };
