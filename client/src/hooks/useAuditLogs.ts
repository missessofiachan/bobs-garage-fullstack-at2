/**
 * @file useAuditLogs.ts
 * @author Bob's Garage Team
 * @description Hook to fetch audit logs with filtering
 * @version 1.0.0
 * @since 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export interface AuditLog {
	id: number;
	userId: number | null;
	userEmail: string | null;
	action: string;
	resource: string;
	resourceId: number | null;
	description: string;
	previousState: unknown | null;
	newState: unknown | null;
	ipAddress: string | null;
	userAgent: string | null;
	requestId: string | null;
	createdAt: string;
}

interface AuditLogsResponse {
	data: AuditLog[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

interface AuditLogsParams {
	page?: number;
	limit?: number;
	userId?: number;
	action?: string;
	resource?: string;
	resourceId?: number;
	startDate?: string;
	endDate?: string;
}

export function useAuditLogs(params: AuditLogsParams = {}) {
	return useQuery<AuditLogsResponse>({
		queryKey: ["admin", "audit-logs", params],
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			if (params.page) queryParams.append("page", params.page.toString());
			if (params.limit) queryParams.append("limit", params.limit.toString());
			if (params.userId) queryParams.append("userId", params.userId.toString());
			if (params.action) queryParams.append("action", params.action);
			if (params.resource) queryParams.append("resource", params.resource);
			if (params.resourceId) queryParams.append("resourceId", params.resourceId.toString());
			if (params.startDate) queryParams.append("startDate", params.startDate);
			if (params.endDate) queryParams.append("endDate", params.endDate);

			const { data } = await api.get<AuditLogsResponse>(
				`/admin/audit-logs?${queryParams.toString()}`,
			);
			return data;
		},
		staleTime: 10000, // Consider stale after 10 seconds
	});
}
