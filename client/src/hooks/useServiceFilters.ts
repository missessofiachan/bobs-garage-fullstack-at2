/**
 * @file useServiceFilters.ts
 * @author Bob's Garage Team
 * @description Hook for filtering and sorting services
 * @version 1.0.0
 */

import { useMemo } from "react";
import type { ServiceDTO } from "../api/types";
import type { ServicesSort } from "../slices/preferences.slice";

interface UseServiceFiltersOptions {
	services: ServiceDTO[] | undefined;
	searchQuery: string;
	maxPrice: number | "";
	sort: ServicesSort;
}

/**
 * Hook to filter and sort services based on search query, price, and sort preference
 */
export function useServiceFilters({
	services,
	searchQuery,
	maxPrice,
	sort,
}: UseServiceFiltersOptions): ServiceDTO[] {
	return useMemo(() => {
		if (!services) return [];

		// Start with published services only
		let filtered = services.filter((s) => s.published !== false);

		// Apply search query filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(s) => s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query),
			);
		}

		// Apply max price filter
		if (maxPrice && typeof maxPrice === "number") {
			filtered = filtered.filter((s) => s.price <= maxPrice);
		}

		// Apply sorting
		filtered = filtered.sort((a, b) => {
			if (sort === "price-asc") {
				return a.price - b.price;
			}
			// price-desc
			return b.price - a.price;
		});

		return filtered;
	}, [services, searchQuery, maxPrice, sort]);
}
