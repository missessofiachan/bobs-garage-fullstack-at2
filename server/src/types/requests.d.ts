/**
 * @author Bob's Garage Team
 * @purpose Type definitions for request bodies and query parameters
 * @version 1.0.0
 */

import type { Request } from "express";
import type { JwtPayload } from "./global.d.js";

// Extend Express Request with typed body and query
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
			// Add typed body and query helpers
		}
	}
}

// ============================================================================
// Service Types
// ============================================================================

export interface CreateServiceRequest {
	name: string;
	price: number;
	description: string;
	imageUrl?: string;
	published?: boolean;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}

export interface ServiceQueryParams {
	q?: string; // Search query
	minPrice?: number;
	maxPrice?: number;
	active?: boolean | string; // Published filter
	sort?: string; // Format: "field:direction" (e.g., "price:DESC")
	page?: number;
	limit?: number;
}

// ============================================================================
// Staff Types
// ============================================================================

export interface CreateStaffRequest {
	name: string;
	role?: string;
	bio?: string;
	photoUrl?: string;
	active?: boolean;
}

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> {}

// ============================================================================
// Auth Types
// ============================================================================

export interface RegisterRequest {
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
	rememberMe?: boolean;
}

// ============================================================================
// User Types
// ============================================================================

export interface UpdateProfileRequest {
	email?: string;
}

// ============================================================================
// Admin Types
// ============================================================================

export interface CreateUserRequest {
	email: string;
	password: string;
	role?: "user" | "admin";
	active?: boolean;
}

export interface UpdateUserRequest {
	email?: string;
	password?: string;
	role?: "user" | "admin";
	active?: boolean;
}

export interface UserQueryParams {
	page?: number;
	limit?: number;
	role?: "user" | "admin";
	active?: boolean;
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface FileUploadRequest extends Request {
	file?: Express.Multer.File;
	files?: Express.Multer.File[];
}
