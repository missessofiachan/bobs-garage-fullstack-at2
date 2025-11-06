/**
 * @file staff.service.ts
 * @author Bob's Garage Team
 * @description Service layer for business logic related to staff members
 * @version 1.0.0
 * @since 1.0.0
 */

import { Staff } from "../db/models/Staff.js";
import type { CreateStaffRequest, UpdateStaffRequest } from "../types/requests.js";
import { calculatePaginationParams } from "../utils/pagination.js";

export interface ListStaffResult {
	staff: Staff[];
	total: number;
	page: number;
	limit: number;
}

/**
 * List staff members with pagination
 */
export async function listStaff(page: number = 1, limit: number = 20): Promise<ListStaffResult> {
	const { offset, limit: actualLimit } = calculatePaginationParams(page, limit);

	const { count, rows: staff } = await Staff.findAndCountAll({
		order: [["name", "ASC"]],
		limit: actualLimit,
		offset,
	});

	return {
		staff,
		total: count,
		page: Number(page),
		limit: actualLimit,
	};
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(id: number): Promise<Staff | null> {
	return await Staff.findByPk(id);
}

/**
 * Create a new staff member
 */
export async function createStaff(data: CreateStaffRequest): Promise<Staff> {
	return await Staff.create(data as unknown as Parameters<typeof Staff.create>[0]);
}

/**
 * Update a staff member by ID
 */
export async function updateStaff(id: number, data: UpdateStaffRequest): Promise<Staff | null> {
	const staff = await Staff.findByPk(id);
	if (!staff) {
		return null;
	}

	await staff.update(data);
	return staff;
}

/**
 * Delete a staff member by ID
 */
export async function deleteStaff(id: number): Promise<Staff | null> {
	const staff = await Staff.findByPk(id);
	if (!staff) {
		return null;
	}

	await staff.destroy();
	return staff;
}

/**
 * Update staff photo URL
 */
export async function updateStaffPhotoUrl(id: number, photoUrl: string): Promise<Staff | null> {
	const staff = await Staff.findByPk(id);
	if (!staff) {
		return null;
	}

	await staff.update({ photoUrl });
	return staff;
}

