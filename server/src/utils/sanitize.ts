/**
 * @author Bob's Garage Team
 * @purpose HTML sanitization utilities using DOMPurify
 * @version 1.0.0
 * @description Server-side HTML sanitization to prevent XSS attacks
 */

import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a window object for DOMPurify (required for server-side usage)
const window = new JSDOM("").window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DOMPurify = createDOMPurify(window as any);

/**
 * Sanitize HTML string to prevent XSS attacks
 * Removes dangerous HTML tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
	if (typeof html !== "string") {
		return html;
	}

	// DOMPurify configuration - allow safe HTML tags but strip dangerous ones
	const config = {
		ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a"],
		ALLOWED_ATTR: ["href"],
		ALLOW_DATA_ATTR: false,
	};

	return DOMPurify.sanitize(html, config);
}

/**
 * Recursively sanitize all string values in an object
 * Sanitizes HTML in string fields to prevent XSS
 */
export function sanitizeObject(obj: unknown): unknown {
	if (obj === null || obj === undefined) {
		return obj;
	}

	if (typeof obj === "string") {
		// For strings, sanitize HTML but preserve basic formatting
		return sanitizeHtml(obj);
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeObject(item));
	}

	if (typeof obj === "object") {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			sanitized[key] = sanitizeObject(value);
		}
		return sanitized;
	}

	return obj;
}
