const db = require('../db');

const settingsCache = new Map();
const DEFAULT_TTL_MS = 60_000;

const cacheKey = (keys) => keys.slice().sort().join('|');

const invalidateSiteSettingsCache = () => {
  settingsCache.clear();
};

const getSiteSettings = async (keys = [], { ttlMs = DEFAULT_TTL_MS } = {}) => {
  const normalizedKeys = Array.from(new Set(keys.filter(Boolean)));
  if (normalizedKeys.length === 0) return {};

  const key = cacheKey(normalizedKeys);
  const cached = settingsCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const placeholders = normalizedKeys.map(() => '?').join(',');
  const [rows] = await db.query(
    `SELECT \`key\`, \`value\` FROM site_settings WHERE \`key\` IN (${placeholders})`,
    normalizedKeys
  );

  const value = rows.reduce((accumulator, row) => {
    accumulator[row.key] = row.value;
    return accumulator;
  }, {});

  settingsCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
};

const getSiteSetting = async (key, fallback = null, options = {}) => {
  const settings = await getSiteSettings([key], options);
  return Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : fallback;
};

module.exports = {
  getSiteSettings,
  getSiteSetting,
  invalidateSiteSettingsCache,
};
