const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { scanUpload } = require('../utils/fileScanner');

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
  '.txt', '.csv', '.rtf'
];

const ALLOWED_MIME_PREFIXES = [
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
  'application/zip', 'application/x-zip-compressed',
  'application/x-rar-compressed', 'application/x-7z-compressed',
  'image/', 'text/', 'application/csv', 'application/rtf'
];

// Sanitize a folder name so it can safely be used as a subdirectory
const sanitizeFolder = (raw) => {
  const cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned && cleaned.length <= 64 ? cleaned : 'job-applications';
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (covers ZIP/DOCX/PPTX)
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    const mimeOk = ALLOWED_MIME_PREFIXES.some(p => mime.startsWith(p));
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error(`Invalid file type: ${ext || 'unknown'} (${file.mimetype || 'no mime'})`));
  }
});

const ensureUploadsDir = (folder) => {
  const dir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const scanResult = await scanUpload(req.file);
    if (!scanResult.clean) {
      return res.status(422).json({ message: scanResult.reason || 'File failed security scan' });
    }

    const folder = sanitizeFolder(req.body && req.body.folder);
    const dir = ensureUploadsDir(folder);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(dir, filename);

    await fs.promises.writeFile(filePath, req.file.buffer);

    const url = `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
    // Additive response — existing consumers only read .url
    res.json({
      url,
      scanned: true,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      extension: ext.replace('.', '')
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
