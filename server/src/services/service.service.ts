/**
 * @file service.service.ts
 * @author Bob's Garage Team
 * @description Service layer for business logic related to garage services
 * @version 1.0.0
 * @since 1.0.0
 */

import { Op } from "sequelize";
import type { WhereOptions } from "sequelize";
import { Favorite } from "../db/models/Favorite.js";
import { Service } from "../db/models/Service.js";
import type { CreateServiceRequest, ServiceQueryParams, UpdateServiceRequest } from "../types/requests.js";
import { calculatePaginationParams } from "../utils/pagination.js";

export interface ListServicesResult {
	services: Service[];
	total: number;
	page: number;
	limit: number;
}

/**
 * Build where clause for service queries based on filters
 */
function buildServiceWhereClause(query: ServiceQueryParams): WhereOptions<Service> {
	const { q, minPrice, maxPrice, active } = query;
	const where: WhereOptions<Service> = {};

	// Filter by published status
	if (typeof active !== "undefined") {
		where.published = ["1", "true", "yes"].includes(String(active).toLowerCase());
	}

	// Full-text search if query provided
	// Uses LIKE for fuzzy matching (full-text index available via migration for better performance)
	if (q) {
		const searchQuery = String(q).trim();
		where[Op.or] = [
			{ name: { [Op.like]: `%${searchQuery}%` } },
			{ description: { [Op.like]: `%${searchQuery}%` } },
		];
	}

	// Price range filter
	if (minPrice || maxPrice) {
		const priceWhere: Record<string, unknown> = {};
		if (minPrice) priceWhere[Op.gte as unknown as string] = Number(minPrice);
		if (maxPrice) priceWhere[Op.lte as unknown as string] = Number(maxPrice);
		where.price = priceWhere;
	}

	return where;
}

/**
 * Build order clause for service queries based on sort parameter
 */
function buildServiceOrderClause(sort?: string): [string, "ASC" | "DESC"][] {
	if (!sort) {
		return [["name", "ASC"]];
	}

	const [field, dir] = String(sort).split(":");
	const sortField = field || "name";
	const allowed = new Set(["name", "price", "createdAt"]);
	const direction = String(dir || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

	if (allowed.has(sortField)) {
		return [[sortField, direction]];
	}

	return [["name", "ASC"]];
}

/**
 * List services with optional filtering, sorting, and pagination
 */
export async function listServices(query: ServiceQueryParams): Promise<ListServicesResult> {
	const { sort, page = 1, limit = 20 } = query;

	const where = buildServiceWhereClause(query);
	const order = buildServiceOrderClause(sort);
	const { offset, limit: actualLimit } = calculatePaginationParams(page, limit);

	const { count, rows: services } = await Service.findAndCountAll({
		where,
		order,
		limit: actualLimit,
		offset,
	});

	return {
		services,
		total: count,
		page: Number(page),
		limit: actualLimit,
	};
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: number): Promise<Service | null> {
	return await Service.findByPk(id);
}

/**
 * Create a new service
 */
export async function createService(data: CreateServiceRequest): Promise<Service> {
	return await Service.create(data as unknown as Parameters<typeof Service.create>[0]);
}

/**
 * Update a service by ID
 */
export async function updateService(id: number, data: UpdateServiceRequest): Promise<Service | null> {
	const service = await Service.findByPk(id);
	if (!service) {
		return null;
	}

	await service.update(data);
	return service;
}

/**
 * Delete a service by ID
 * Also deletes all associated favorites to prevent foreign key constraint errors
 */
export async function deleteService(id: number): Promise<Service | null> {
	const service = await Service.findByPk(id);
	if (!service) {
		return null;
	}

	// Delete all favorites associated with this service first
	// This prevents foreign key constraint errors
	await Favorite.destroy({
		where: { serviceId: id },
	});

	// Now delete the service
	await service.destroy();
	return service;
}

/**
 * Update service image URL
 */
export async function updateServiceImageUrl(id: number, imageUrl: string): Promise<Service | null> {
	const service = await Service.findByPk(id);
	if (!service) {
		return null;
	}

	await service.update({ imageUrl });
	return service;
}

