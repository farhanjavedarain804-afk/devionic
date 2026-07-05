const db = require('../db');

const DEFAULT_PADDING = 6;

const SERIES_DEFINITIONS = {
  company: { prefix: 'DEV', yearly: true, padding: DEFAULT_PADDING },
  customer: { prefix: 'CUS', yearly: true, padding: DEFAULT_PADDING },
  client: { prefix: 'CLI', yearly: true, padding: DEFAULT_PADDING },
  lead: { prefix: 'LED', yearly: true, padding: DEFAULT_PADDING },
  inquiry: { prefix: 'INQ', yearly: true, padding: DEFAULT_PADDING },
  quotation: { prefix: 'QUO', yearly: true, padding: DEFAULT_PADDING },
  invoice: { prefix: 'INV', yearly: true, padding: DEFAULT_PADDING },
  payment: { prefix: 'PAY', yearly: true, padding: DEFAULT_PADDING },
  receipt: { prefix: 'RCT', yearly: true, padding: DEFAULT_PADDING },
  project: { prefix: 'PRJ', yearly: true, padding: DEFAULT_PADDING },
  task: { prefix: 'TSK', yearly: true, padding: DEFAULT_PADDING },
  employee: { prefix: 'EMP', yearly: true, padding: DEFAULT_PADDING },
  attendance: { prefix: 'ATT', yearly: true, padding: DEFAULT_PADDING },
  leave: { prefix: 'LEV', yearly: true, padding: DEFAULT_PADDING },
  application: { prefix: 'APP', yearly: true, padding: DEFAULT_PADDING },
  booking: { prefix: 'BKG', yearly: true, padding: DEFAULT_PADDING },
  complaint: { prefix: 'CMP', yearly: true, padding: DEFAULT_PADDING },
  ticket: { prefix: 'TKT', yearly: true, padding: DEFAULT_PADDING },
  verification: { prefix: 'VER', yearly: true, padding: DEFAULT_PADDING },
  visitor: { prefix: 'VIS', yearly: true, padding: DEFAULT_PADDING },
  notification: { prefix: 'NTF', yearly: true, padding: DEFAULT_PADDING },
  transaction: { prefix: 'TRX', yearly: true, padding: DEFAULT_PADDING },
  expense: { prefix: 'EXP', yearly: true, padding: DEFAULT_PADDING },
  asset: { prefix: 'AST', yearly: true, padding: DEFAULT_PADDING },
  branch: { prefix: 'BRN', yearly: true, padding: DEFAULT_PADDING },
  department: { prefix: 'DEP', yearly: true, padding: DEFAULT_PADDING },
  vendor: { prefix: 'VND', yearly: true, padding: DEFAULT_PADDING },
  purchase_order: { prefix: 'PO', yearly: true, padding: DEFAULT_PADDING },
  contract: { prefix: 'CNT', yearly: true, padding: DEFAULT_PADDING },
  document: { prefix: 'DOC', yearly: true, padding: DEFAULT_PADDING },
  staff: { prefix: 'EMP', yearly: true, padding: DEFAULT_PADDING },
  document_category: { prefix: 'DCA', yearly: true, padding: DEFAULT_PADDING },
  testimonial: { prefix: 'TST', yearly: true, padding: DEFAULT_PADDING },
};

let seriesTableReady = false;

const ensureSeriesTable = async () => {
  if (seriesTableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS number_series (
      id CHAR(36) PRIMARY KEY,
      series_key VARCHAR(100) NOT NULL,
      prefix VARCHAR(20) NOT NULL,
      series_year INT NOT NULL,
      padding INT NOT NULL DEFAULT 6,
      last_number INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_series_year (series_key, series_year),
      UNIQUE KEY uq_prefix_year (prefix, series_year)
    )
  `);
  seriesTableReady = true;
};

const padNumber = (value, padding) => String(value).padStart(padding, '0');

const generateSeriesNumber = async (seriesKey, options = {}) => {
  const definition = SERIES_DEFINITIONS[seriesKey];
  if (!definition) {
    throw new Error(`Unknown number series: ${seriesKey}`);
  }

  const year = options.year || new Date().getFullYear();
  const prefix = options.prefix || definition.prefix;
  const padding = options.padding || definition.padding || DEFAULT_PADDING;
  const yearSuffix = definition.yearly === false ? '' : `-${year}`;

  await ensureSeriesTable();

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT id, last_number FROM number_series WHERE series_key = ? AND series_year = ? FOR UPDATE',
      [seriesKey, year]
    );

    let nextNumber = 1;

    if (rows.length > 0) {
      nextNumber = Number(rows[0].last_number || 0) + 1;
      await connection.query(
        'UPDATE number_series SET last_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nextNumber, rows[0].id]
      );
    } else {
      const seedId = require('../utils/uuid')();
      await connection.query(
        'INSERT INTO number_series (id, series_key, prefix, series_year, padding, last_number) VALUES (?, ?, ?, ?, ?, ?)',
        [seedId, seriesKey, prefix, year, padding, nextNumber]
      );
    }

    await connection.commit();
    return `${prefix}${yearSuffix}-${padNumber(nextNumber, padding)}`;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  SERIES_DEFINITIONS,
  generateSeriesNumber,
  ensureSeriesTable,
};
