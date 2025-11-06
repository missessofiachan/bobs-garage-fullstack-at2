/**
 * @file service.service.ts
 * @author Bob's Garage Team
 * @description Service layer for business logic related to garage services
 * @version 1.0.0
 * @since 1.0.0
 */

import { Favorite } from "../db/models/Favorite.js";
import { Service } from "../db/models/Service.js";
import type {
	CreateServiceRequest,
	ServiceQueryParams,
	UpdateServiceRequest,
} from "../types/requests.js";
import { calculatePaginationParams } from "../utils/pagination.js";
import { buildServiceOrderClause, buildServiceWhereClause } from "./service.query.js";

export interface ListServicesResult {
	services: Service[];
	total: number;
	page: number;
	limit: number;
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
export async function updateService(
	id: number,
	data: UpdateServiceRequest,
): Promise<Service | null> {
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
