/**
 * @author Bob's Garage Team
 * @purpose Upload service for handling file uploads, URL generation, and cleanup
 * @version 1.0.0
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { ROOT_UPLOAD_DIR_ABS, UPLOADS_PUBLIC_PATH } from '../middleware/upload.js';

/**
 * Generate a public URL for an uploaded file
 */
export function generatePublicUrl(filename: string, subdirectory: 'services' | 'staff'): string {
  // Use BASE_URL from env, or construct from PORT if not set
  const base = env.BASE_URL || `http://localhost:${env.PORT || 4000}`;
  return `${base}${UPLOADS_PUBLIC_PATH}/${subdirectory}/${filename}`;
}

/**
 * Safely delete an old uploaded file given its public URL
 * Only deletes files within the uploads directory
 */
export async function deleteOldUpload(oldUrl: string | null | undefined): Promise<void> {
  if (!oldUrl || typeof oldUrl !== 'string') {
    return;
  }

  try {
    const base = env.BASE_URL || `http://localhost:${env.PORT || 4000}`;
    const uploadsPrefix = `${base}${UPLOADS_PUBLIC_PATH}`;

    // Only process URLs that look like our uploads
    if (!oldUrl.startsWith(uploadsPrefix)) {
      return;
    }

    // Convert URL to file path
    const relative = oldUrl.slice(uploadsPrefix.length);
    const candidate = path.resolve(path.join(ROOT_UPLOAD_DIR_ABS, `.${relative}`));

    // Safety check: ensure candidate is within ROOT_UPLOAD_DIR_ABS
    if (!candidate.startsWith(path.resolve(ROOT_UPLOAD_DIR_ABS))) {
      return;
    }

    // Attempt to delete the file
    await fs.unlink(candidate).catch(() => {
      // Silently ignore if file doesn't exist
    });
  } catch (_err) {
    // Silently ignore all errors during cleanup
  }
}

/**
 * Get the filename from an uploaded file (Multer file object)
 */
export function getUploadedFilename(file: Express.Multer.File | undefined): string | null {
  return file?.filename || null;
}
