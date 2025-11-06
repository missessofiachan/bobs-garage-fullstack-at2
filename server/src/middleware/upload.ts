/**
 * @author Bob's Garage Team
 * @purpose File upload middleware using Multer for images (services and staff photos)
 * @version 2.0.0
 * @description Enhanced file upload validation with magic bytes, strict MIME checking, and file content validation
 */

import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Allowed image file types with their magic bytes (file signatures)
const ALLOWED_IMAGE_TYPES = {
	"image/jpeg": {
		extensions: [".jpg", ".jpeg"],
		magicBytes: [
			[0xff, 0xd8, 0xff], // JPEG
		],
	},
	"image/png": {
		extensions: [".png"],
		magicBytes: [
			[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
		],
	},
	"image/gif": {
		extensions: [".gif"],
		magicBytes: [
			[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
			[0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
		],
	},
	"image/webp": {
		extensions: [".webp"],
		magicBytes: [
			[0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
		],
	},
	"image/svg+xml": {
		extensions: [".svg"],
		magicBytes: [
			// SVG files start with XML declaration or <svg tag
			[0x3c, 0x3f, 0x78, 0x6d, 0x6c], // <?xml
			[0x3c, 0x73, 0x76, 0x67], // <svg
		],
	},
} as const;

/**
 * Check if file buffer matches expected magic bytes
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
	const typeConfig = ALLOWED_IMAGE_TYPES[mimeType as keyof typeof ALLOWED_IMAGE_TYPES];
	if (!typeConfig) {
		return false;
	}

	// For SVG, check if it contains valid SVG content
	if (mimeType === "image/svg+xml") {
		const content = buffer.toString("utf-8").trim().toLowerCase();
		return content.startsWith("<?xml") || content.startsWith("<svg");
	}

	// For WebP, check RIFF header and WebP identifier
	if (mimeType === "image/webp") {
		if (buffer.length < 12) return false;
		const hasRiff =
			buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
		const hasWebp =
			buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
		return hasRiff && hasWebp;
	}

	// Check magic bytes for other image types
	return typeConfig.magicBytes.some((signature) => {
		if (buffer.length < signature.length) return false;
		return signature.every((byte, index) => buffer[index] === byte);
	});
}

/**
 * Validate file extension matches MIME type
 */
function validateFileExtension(filename: string, mimeType: string): boolean {
	const ext = path.extname(filename).toLowerCase();
	const typeConfig = ALLOWED_IMAGE_TYPES[mimeType as keyof typeof ALLOWED_IMAGE_TYPES];
	if (!typeConfig) {
		return false;
	}
	return (typeConfig.extensions as readonly string[]).includes(ext);
}

// Resolve upload directories relative to server CWD
const ROOT_UPLOAD_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR);
const STAFF_UPLOAD_DIR = path.join(ROOT_UPLOAD_DIR, "staff");
const SERVICES_UPLOAD_DIR = path.join(ROOT_UPLOAD_DIR, "services");

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
	const base = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
	return base + ext;
}

const staffStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, STAFF_UPLOAD_DIR),
	filename: (_req, file, cb) => cb(null, filenameWithTimestamp(file.originalname)),
});

const servicesStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, SERVICES_UPLOAD_DIR),
	filename: (_req, file, cb) => cb(null, filenameWithTimestamp(file.originalname)),
});

/**
 * Enhanced image file filter with strict validation
 * Validates MIME type, file extension, and magic bytes
 */
function imageFileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
	// Check if MIME type is in allowed list
	const allowedMimeTypes = Object.keys(ALLOWED_IMAGE_TYPES);
	if (!allowedMimeTypes.includes(file.mimetype)) {
		return cb(
			new Error(
				`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(", ")}`,
			),
		);
	}

	// Validate file extension matches MIME type
	if (!validateFileExtension(file.originalname, file.mimetype)) {
		return cb(
			new Error(
				`File extension does not match MIME type. Expected: ${ALLOWED_IMAGE_TYPES[file.mimetype as keyof typeof ALLOWED_IMAGE_TYPES]?.extensions.join(", ")}`,
			),
		);
	}

	cb(null, true);
}

/**
 * Middleware to validate uploaded file content (magic bytes)
 * This runs after multer processes the file
 */
export function validateFileContent(req: Request, res: Response, next: NextFunction) {
	const file = (req as any).file;
	if (!file) {
		return next();
	}

	// Read first bytes to check magic bytes
	const buffer = fs.readFileSync(file.path);
	if (buffer.length < 4) {
		fs.unlinkSync(file.path); // Delete invalid file
		return res.status(400).json({ message: "File is too small or corrupted" });
	}

	// Validate magic bytes match MIME type
	if (!validateMagicBytes(buffer, file.mimetype)) {
		fs.unlinkSync(file.path); // Delete invalid file
		return res
			.status(400)
			.json({ message: "File content does not match declared file type. Possible file spoofing." });
	}

	next();
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

export const UPLOADS_PUBLIC_PATH = "/uploads";
export const ROOT_UPLOAD_DIR_ABS = ROOT_UPLOAD_DIR;
