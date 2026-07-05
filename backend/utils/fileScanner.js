const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const ALLOWED_TYPES = {
  '.pdf': {
    mimeTypes: ['application/pdf'],
    signature: (buffer) => buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  },
  '.jpg': {
    mimeTypes: ['image/jpeg'],
    signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  '.jpeg': {
    mimeTypes: ['image/jpeg'],
    signature: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  '.png': {
    mimeTypes: ['image/png'],
    signature: (buffer) => buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a,
  },
};

const getExtension = (filename) => path.extname(filename || '').toLowerCase();

const normalizeMime = (mimetype) => (mimetype || '').toLowerCase();

const parseScanArgs = (value) => {
  if (!value) return [];
  return value.split(',').map((part) => part.trim()).filter(Boolean);
};

const runOptionalExternalScan = async (buffer, originalName) => {
  const command = process.env.FILE_SCAN_COMMAND;
  if (!command) {
    return { clean: true, method: 'signature' };
  }

  const tempDir = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempPath = path.join(
    tempDir,
    `${Date.now()}_${Math.random().toString(36).slice(2)}_${path.basename(originalName || 'upload.bin')}`
  );

  await fs.promises.writeFile(tempPath, buffer);

  try {
    const args = parseScanArgs(process.env.FILE_SCAN_ARGS);
    const result = await execFileAsync(command, [...args, tempPath], {
      timeout: Number(process.env.FILE_SCAN_TIMEOUT_MS || 30000),
      maxBuffer: 1024 * 1024,
    });

    const stdout = `${result.stdout || ''}`.toLowerCase();
    if (stdout.includes('virus') || stdout.includes('infect')) {
      return { clean: false, method: 'external', reason: 'The file was flagged by the server malware scan.' };
    }

    return { clean: true, method: 'external' };
  } catch (error) {
    const message = `${error?.stdout || error?.stderr || error?.message || ''}`.toLowerCase();
    if (message.includes('infect') || message.includes('virus')) {
      return { clean: false, method: 'external', reason: 'The file was flagged by the server malware scan.' };
    }

    throw new Error('File scanning service is unavailable');
  } finally {
    fs.promises.unlink(tempPath).catch(() => {});
  }
};

const scanUpload = async (file) => {
  const extension = getExtension(file.originalname);
  const rule = ALLOWED_TYPES[extension];

  if (!rule) {
    return { clean: false, reason: 'Invalid file type. Allowed types are PDF, JPG, JPEG, and PNG.' };
  }

  const mimetype = normalizeMime(file.mimetype);
  if (rule.mimeTypes.length && mimetype && !rule.mimeTypes.includes(mimetype)) {
    return { clean: false, reason: 'The file type does not match the selected document format.' };
  }

  if (!rule.signature(file.buffer)) {
    return { clean: false, reason: 'The file signature does not match its declared type.' };
  }

  try {
    return await runOptionalExternalScan(file.buffer, file.originalname);
  } catch (error) {
    return { clean: false, reason: error.message || 'File scanning failed.' };
  }
};

module.exports = {
  scanUpload,
};
