/**
 * @file audit.controller.ts
 * @author Bob's Garage Team
 * @description Controller for viewing audit logs (admin only)
 * @version 1.0.0
 * @since 1.0.0
 */

import type { Request, Response } from "express";
import { Op } from "sequelize";
import { AuditLog } from "../db/models/AuditLog.js";
import { handleControllerError } from "../utils/errors.js";
import { createPaginationResponse } from "../utils/responses.js";

interface AuditLogQueryParams {
	page?: number;
	limit?: number;
	userId?: number;
	action?: string;
	resource?: string;
	resourceId?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * @route GET /api/admin/audit-logs
 * @description Get audit logs with filtering and pagination
 * @access Admin only
 */
export async function getAuditLogs(req: Request, res: Response) {
	try {
		const query = req.query as unknown as AuditLogQueryParams;
		const {
			page = 1,
			limit = 50,
			userId,
			action,
			resource,
			resourceId,
			startDate,
			endDate,
		} = query;

		const where: Record<string, unknown> = {};

		if (userId) where.userId = userId;
		if (action) where.action = action;
		if (resource) where.resource = resource;
		if (resourceId) where.resourceId = resourceId;

		if (startDate || endDate) {
			const dateWhere: Record<string | symbol, unknown> = {};
			if (startDate) dateWhere[Op.gte] = new Date(startDate);
			if (endDate) dateWhere[Op.lte] = new Date(endDate);
			where.createdAt = dateWhere;
		}

		const offset = (Number(page) - 1) * Number(limit);
		const actualLimit = Math.min(Number(limit), 100); // Cap at 100 per page

		const { count, rows: logs } = await AuditLog.findAndCountAll({
			where,
			order: [["createdAt", "DESC"]],
			limit: actualLimit,
			offset,
		});

		// Parse JSON states for response
		const logsWithParsedStates = logs.map((log) => {
			const logData = log.toJSON();
			return {
				...logData,
				previousState: logData.previousState ? JSON.parse(logData.previousState) : null,
				newState: logData.newState ? JSON.parse(logData.newState) : null,
			};
		});

		res.json({
			data: logsWithParsedStates,
			pagination: createPaginationResponse(Number(page), actualLimit, count),
		});
	} catch (err) {
		handleControllerError(err, res);
	}
}
