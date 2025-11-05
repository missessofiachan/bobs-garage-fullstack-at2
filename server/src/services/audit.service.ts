/**
 * @file audit.service.ts
 * @author Bob's Garage Team
 * @description Service for logging admin actions for audit and compliance purposes
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Request } from "express";
import { winstonLogger } from "../config/winston.js";
import { type AuditAction, AuditLog, type AuditResource } from "../db/models/AuditLog.js";
import { User } from "../db/models/User.js";

interface AuditLogData {
	userId?: number | null;
	userEmail?: string | null;
	action: AuditAction;
	resource: AuditResource;
	resourceId?: number | null;
	description: string;
	previousState?: unknown;
	newState?: unknown;
	ipAddress?: string | null;
	userAgent?: string | null;
	requestId?: string | null;
}

/**
 * Log an admin action to the audit log
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
	try {
		// Get user email if userId is provided
		let userEmail = data.userEmail;
		if (data.userId && !userEmail) {
			try {
				const user = await User.findByPk(data.userId);
				userEmail = user?.email || null;
			} catch {
				// Ignore errors fetching user email
			}
		}

		await AuditLog.create({
			userId: data.userId || null,
			userEmail: userEmail || null,
			action: data.action,
			resource: data.resource,
			resourceId: data.resourceId || null,
			description: data.description,
			previousState: data.previousState ? JSON.stringify(data.previousState) : null,
			newState: data.newState ? JSON.stringify(data.newState) : null,
			ipAddress: data.ipAddress || null,
			userAgent: data.userAgent || null,
			requestId: data.requestId || null,
		});
	} catch (error) {
		// Log error but don't throw - audit logging should not break the application
		winstonLogger.error(
			`Failed to log audit event: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Helper to extract request info for audit logging
 */
export function getRequestInfo(req: Request): {
	userId?: number;
	ipAddress: string | null;
	userAgent: string | null;
	requestId: string | null;
} {
	const userId = (req as any).user?.id;
	const ipAddress = req.ip || req.socket.remoteAddress || null;
	const userAgent = req.get("user-agent") || null;
	const requestId = (req.requestId as string | undefined) || null;

	return { userId, ipAddress, userAgent, requestId };
}

/**
 * Log a create action
 */
export async function logCreate(
	req: Request,
	resource: AuditResource,
	resourceId: number,
	description: string,
	newState?: unknown,
): Promise<void> {
	const info = getRequestInfo(req);
	await logAuditEvent({
		...info,
		action: "create",
		resource,
		resourceId,
		description,
		newState,
	});
}

/**
 * Log an update action
 */
export async function logUpdate(
	req: Request,
	resource: AuditResource,
	resourceId: number,
	description: string,
	previousState?: unknown,
	newState?: unknown,
): Promise<void> {
	const info = getRequestInfo(req);
	await logAuditEvent({
		...info,
		action: "update",
		resource,
		resourceId,
		description,
		previousState,
		newState,
	});
}

/**
 * Log a delete action
 */
export async function logDelete(
	req: Request,
	resource: AuditResource,
	resourceId: number,
	description: string,
	previousState?: unknown,
): Promise<void> {
	const info = getRequestInfo(req);
	await logAuditEvent({
		...info,
		action: "delete",
		resource,
		resourceId,
		description,
		previousState,
	});
}

/**
 * Log an upload action
 */
export async function logUpload(
	req: Request,
	resource: AuditResource,
	resourceId: number,
	description: string,
): Promise<void> {
	const info = getRequestInfo(req);
	await logAuditEvent({
		...info,
		action: "upload",
		resource,
		resourceId,
		description,
	});
}

/**
 * Log a view/access action
 */
export async function logView(
	req: Request,
	resource: AuditResource,
	resourceId: number | null,
	description: string,
): Promise<void> {
	const info = getRequestInfo(req);
	await logAuditEvent({
		...info,
		action: "view",
		resource,
		resourceId,
		description,
	});
}
