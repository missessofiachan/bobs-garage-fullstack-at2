import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { type Request } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Resolve upload directories relative to server CWD
const ROOT_UPLOAD_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR);
const STAFF_UPLOAD_DIR = path.join(ROOT_UPLOAD_DIR, 'staff');
const SERVICES_UPLOAD_DIR = path.join(ROOT_UPLOAD_DIR, 'services');

// Ensure directories exist at startup
for (const dir of [ROOT_UPLOAD_DIR, STAFF_UPLOAD_DIR, SERVICES_UPLOAD_DIR]) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    logger.error(`Failed to create upload directory ${dir}: ${err}`);
  }
}

function filenameWithTimestamp(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const base = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  return base + ext;
}

const staffStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, STAFF_UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, filenameWithTimestamp(file.originalname)),
});

const servicesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SERVICES_UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, filenameWithTimestamp(file.originalname)),
});

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
}

export const staffPhotoUpload = multer({
  storage: staffStorage,
  limits: { fileSize: env.UPLOAD_MAX_SIZE },
  fileFilter: imageFileFilter,
});

export const serviceImageUpload = multer({
  storage: servicesStorage,
  limits: { fileSize: env.UPLOAD_MAX_SIZE },
  fileFilter: imageFileFilter,
});

export const UPLOADS_PUBLIC_PATH = '/uploads';
export const ROOT_UPLOAD_DIR_ABS = ROOT_UPLOAD_DIR;
