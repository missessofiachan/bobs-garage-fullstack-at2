/**
 * @file service.query.ts
 * @author Bob's Garage Team
 * @description Query building utilities for service queries (separated for SRP)
 * @version 1.0.0
 * @since 1.0.0
 */

import type { WhereOptions } from "sequelize";
import { Op } from "sequelize";
import type { Service } from "../db/models/Service.js";
import type { ServiceQueryParams } from "../types/requests.js";

/**
 * Build where clause for service queries based on filters
 */
export function buildServiceWhereClause(query: ServiceQueryParams): WhereOptions<Service> {
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
		// Use Op.or as a symbol key - cast to allow symbol indexing
		(where as Record<string | symbol, unknown>)[Op.or] = [
			{ name: { [Op.like]: `%${searchQuery}%` } },
			{ description: { [Op.like]: `%${searchQuery}%` } },
		];
	}

	// Price range filter
	if (minPrice || maxPrice) {
		const priceWhere: Record<string | symbol, unknown> = {};
		if (minPrice) priceWhere[Op.gte] = Number(minPrice);
		if (maxPrice) priceWhere[Op.lte] = Number(maxPrice);
		where.price = priceWhere;
	}

	return where;
}

/**
 * Build order clause for service queries based on sort parameter
 */
export function buildServiceOrderClause(sort?: string): [string, "ASC" | "DESC"][] {
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
